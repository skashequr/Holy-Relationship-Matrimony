const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const source = fs.readFileSync(require.resolve('../src/lib/messages.js'), 'utf8').replace(/export /g, '');
const { mergeMessages, updateConversation } = vm.runInNewContext(source + '\n({ mergeMessages, updateConversation })');

test('socket and HTTP echoes merge once and foreign conversation messages never enter the chat', () => {
  const message = { _id: '02', conversationId: 'a', senderId: 'me', text: 'hello', isRead: true };
  const result = mergeMessages([message], [{ ...message, isRead: false }, { _id: '03', conversationId: 'b' }, { _id: '01', conversationId: 'a' }], 'a');
  assert.equal(result.length, 2);
  assert.equal(result[0]._id, '01');
  assert.equal(result[1].isRead, true);
});
test('background arrivals increment only their own unread count and move the conversation to the top', () => {
  const conversations = [{ _id: 'a', unreadCount: 0, lastMessageAt: '2026-01-01' }, { _id: 'b', unreadCount: 2, lastMessageAt: '2026-01-01' }];
  const message = { conversationId: 'b', senderId: 'other', text: 'new', createdAt: '2026-01-02' };
  const result = updateConversation(conversations, message, 'me', 'a');
  assert.equal(result[0]._id, 'b');
  assert.equal(result[0].unreadCount, 3);
  assert.equal(conversations[1].unreadCount, 2);
  assert.equal(updateConversation(conversations, message, 'me', 'b')[0].unreadCount, 0);
});
