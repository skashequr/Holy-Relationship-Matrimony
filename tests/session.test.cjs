const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

function setup(refresh) {
  const cookies = new Map([['token', 'expired'], ['refreshToken', 'refresh']]);
  const retries = [];
  let responseError;
  let refreshCalls = 0;
  const api = (config) => { retries.push(config); return Promise.resolve({ data: { success: true } }); };
  api.defaults = { headers: { common: {} } };
  api.interceptors = {
    request: { use() {} },
    response: { use(ok, fail) { responseError = fail; } },
  };
  const window = { location: { pathname: '/dashboard', href: '' } };
  const context = {
    axios: { create: () => api, post: async (...args) => { refreshCalls++; return refresh(...args); } },
    Cookies: { get: (key) => cookies.get(key), set: (key, val) => cookies.set(key, val), remove: (key) => cookies.delete(key) },
    toast: { error() {} }, process: { env: {} }, window,
  };
  const source = fs.readFileSync(require.resolve('../src/lib/api.js'), 'utf8')
    .replace(/^import .*;\r?\n/gm, '')
    .replace(/^export default api;\r?\n/gm, '')
    .replace(/export const /g, 'const ');
  vm.runInNewContext(source, context);
  const fail = (url = '/auth/me', retry = false) => responseError({
    config: { url, headers: {}, _retry: retry }, response: { status: 401, data: {} },
  });
  return { cookies, retries, window, fail, refreshCalls: () => refreshCalls };
}

test('concurrent expired requests share refresh and retry with the new token', async () => {
  const state = setup(async (url, body) => {
    assert.equal(body.refreshToken, 'refresh');
    return { data: { success: true, token: 'renewed' } };
  });
  await Promise.all([state.fail(), state.fail('/match/dashboard'), state.fail('/user/notifications')]);
  assert.equal(state.refreshCalls(), 1);
  assert.equal(state.retries.length, 3);
  assert.ok(state.retries.every((r) => r.headers.Authorization === 'Bearer renewed' && r._retry));
  assert.equal(state.cookies.get('token'), 'renewed');
  assert.equal(state.window.location.href, '');
});

for (const status of [undefined, 429, 500]) {
  test(`transient refresh failure (${status}) preserves credentials`, async () => {
    const state = setup(async () => { throw { response: status ? { status } : undefined }; });
    await assert.rejects(state.fail());
    assert.equal(state.cookies.get('token'), 'expired');
    assert.equal(state.cookies.get('refreshToken'), 'refresh');
    assert.equal(state.window.location.href, '');
  });
}

test('invalid refresh clears credentials and redirects', async () => {
  const state = setup(async () => { throw { response: { status: 401 } }; });
  await assert.rejects(state.fail());
  assert.equal(state.cookies.size, 0);
  assert.equal(state.window.location.href, '/login?redirect=%2Fdashboard');
});

test('incorrect login does not refresh or destroy an existing session', async () => {
  const state = setup(() => { throw new Error('must not refresh'); });
  await assert.rejects(state.fail('/auth/login'));
  assert.equal(state.refreshCalls(), 0);
  assert.equal(state.cookies.size, 2);
});

test('a rejected retry cannot start an infinite refresh loop', async () => {
  const state = setup(() => { throw new Error('must not refresh'); });
  await assert.rejects(state.fail('/auth/me', true));
  assert.equal(state.refreshCalls(), 0);
  assert.equal(state.cookies.size, 0);
});
