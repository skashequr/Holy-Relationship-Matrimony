export const messageId = value => String(value?._id || value || '');

export function mergeMessages(current, incoming, conversationId) {
  const records = new Map();
  for (const message of [...current, ...incoming]) {
    if (messageId(message.conversationId) !== conversationId) continue;
    const id = messageId(message);
    const previous = records.get(id);
    records.set(id, { ...previous, ...message, isRead: !!(previous?.isRead || message.isRead) });
  }
  return [...records.values()].sort((a, b) => String(a._id).localeCompare(String(b._id)));
}

export function updateConversation(conversations, message, ownId, activeId) {
  return conversations.map(c => c._id !== messageId(message.conversationId) ? c : {
    ...c, lastMessage: message.text, lastMessageAt: message.createdAt,
    unreadCount: c._id === activeId ? 0 : (c.unreadCount || 0) + (messageId(message.senderId) === ownId ? 0 : 1),
  }).sort((a, b) => new Date(b.lastMessageAt) - new Date(a.lastMessageAt));
}
