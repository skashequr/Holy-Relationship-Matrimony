const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../src/lib/search.js'), 'utf8').replace(/export /g, '');
const helpers = vm.runInNewContext(`${source}\n({ initialFilters, normalizeFilters, validateFilters, searchParams, mergeProfiles })`);
const utilsSource = fs.readFileSync(require.resolve('../src/lib/utils.js'), 'utf8').split('// Education level labels')[0].replace(/export /g, '');
const formatHeight = vm.runInNewContext(`${utilsSource}\nformatHeight`);

test('height rounding carries twelve inches into the next foot', () => {
  assert.equal(formatHeight(182, 'en'), '6\'0" (182 cm)');
  assert.equal(formatHeight(171, 'en'), '5\'7" (171 cm)');
});

test('search parameters trim whitespace and omit inactive filters', () => {
  const params = helpers.searchParams({ ...helpers.initialFilters, biodataNumber: '  BD000123 ', gender: 'female' }, 2);
  assert.equal(params.biodataNumber, 'BD000123');
  assert.equal(params.page, 2);
  assert.equal(params.limit, 12);
  assert.equal('praysFiveTimes' in params, false);
  assert.equal('ageMin' in params, false);
});

test('age and height filters reject reversed, nonnumeric and out-of-range values', () => {
  for (const changes of [
    { ageMin: '40', ageMax: '25' }, { heightMin: '180', heightMax: '150' },
    { ageMin: '17' }, { ageMax: '101' }, { ageMin: '20.5' },
    { heightMin: 'NaN' }, { heightMax: '251' }, { heightMin: '5.8' },
  ]) assert.notEqual(helpers.validateFilters({ ...helpers.initialFilters, ...changes }), '');
  assert.equal(helpers.validateFilters({ ...helpers.initialFilters, ageMin: '18', ageMax: '100', heightMin: '165.5' }), '');
});

test('pagination merges overlapping results without duplicate cards', () => {
  const result = helpers.mergeProfiles([{ _id: 'a' }, { _id: 'b', views: 1 }], [{ _id: 'b', views: 2 }, { _id: 'c' }]);
  assert.equal(result.length, 3);
  assert.equal(result.map(item => item._id).join(','), 'a,b,c');
  assert.equal(result[1].views, 2);
});

test('normalizing draft filters does not mutate applied filters', () => {
  const applied = { ...helpers.initialFilters, division: 'Dhaka' };
  const draft = helpers.normalizeFilters({ ...applied, division: 'Sylhet', unexpected: 'ignored' });
  assert.equal(applied.division, 'Dhaka');
  assert.equal(draft.division, 'Sylhet');
  assert.equal('unexpected' in draft, false);
});
