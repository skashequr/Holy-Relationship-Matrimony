'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { messageAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaPaperPlane, FaComment, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import io from 'socket.io-client';

export default function MessagesPage() {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [convPage, setConvPage] = useState(1);
  const [convTotalPages, setConvTotalPages] = useState(1);
  const [convTotal, setConvTotal] = useState(0);
  const CONV_LIMIT = 20;
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loadingConvs, setLoadingConvs] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [sending, setSending] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimerRef = useRef(null);

  // Socket setup
  useEffect(() => {
    const socket = io(process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'https://holy-relationship-matrimony-backend-1ige.onrender.com', {
      withCredentials: true,
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      if (user?._id) socket.emit('joinRoom', user._id);
    });

    socket.on('receiveMessage', (msg) => {
      setMessages((prev) => {
        if (prev.some((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
      setConversations((prev) =>
        prev.map((c) =>
          c._id === msg.conversationId
            ? { ...c, lastMessage: msg.text, lastMessageAt: msg.createdAt }
            : c
        )
      );
    });

    socket.on('typing', ({ userId }) => {
      if (userId !== user?._id) setTypingUsers((p) => [...new Set([...p, userId])]);
    });
    socket.on('stopTyping', ({ userId }) => {
      setTypingUsers((p) => p.filter((id) => id !== userId));
    });

    return () => socket.disconnect();
  }, [user?._id]);

  // Join conversation room when active conversation changes
  useEffect(() => {
    if (activeConv && socketRef.current) {
      socketRef.current.emit('joinConversation', activeConv._id);
    }
  }, [activeConv?._id]);

  // Scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => { fetchConversations(1); }, []);

  const fetchConversations = async (page) => {
    setLoadingConvs(true);
    try {
      const { data } = await messageAPI.getConversations({ page, limit: CONV_LIMIT });
      const convs = data.conversations || [];
      setConversations(convs);
      setConvPage(page);
      setConvTotalPages(data.pagination?.totalPages || 1);
      setConvTotal(data.pagination?.total || 0);

      // Auto-open conversation from URL param ?conv=...
      const convId = searchParams.get('conv');
      if (convId && page === 1) {
        const target = convs.find((c) => c._id === convId);
        if (target) openConversation(target);
      }
    } catch {}
    finally { setLoadingConvs(false); }
  };

  const openConversation = async (conv) => {
    setActiveConv(conv);
    setLoadingMsgs(true);
    try {
      const { data } = await messageAPI.getMessages(conv._id);
      setMessages(data.messages || []);
    } catch {}
    finally { setLoadingMsgs(false); }
  };

  const handleSend = async () => {
    if (!text.trim() || !activeConv) return;
    setSending(true);
    const payload = text.trim();
    setText('');
    try {
      const { data } = await messageAPI.sendMessage({ conversationId: activeConv._id, text: payload });
      setMessages((prev) => [...prev, data.message]);
    } catch (err) {
      toast.error(err.response?.data?.messageBn || 'বার্তা পাঠাতে সমস্যা');
      setText(payload);
    } finally {
      setSending(false);
    }
  };

  const handleTyping = () => {
    if (socketRef.current && activeConv) {
      socketRef.current.emit('typing', { conversationId: activeConv._id, userId: user._id });
      clearTimeout(typingTimerRef.current);
      typingTimerRef.current = setTimeout(() => {
        socketRef.current.emit('stopTyping', { conversationId: activeConv._id, userId: user._id });
      }, 1500);
    }
  };

  const getOtherParticipant = (conv) =>
    conv.participants?.find((p) => p._id?.toString() !== user?._id?.toString());

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-120px)] gap-4">
        {/* Conversations list */}
        <div className="w-80 flex-shrink-0 bg-white rounded-xl border flex flex-col">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-gray-800">বার্তা</h2>
            {convTotal > 0 && <span className="text-xs text-gray-400">{convTotal}টি</span>}
          </div>
          <div className="flex-1 overflow-y-auto">
            {loadingConvs ? (
              <div className="p-4"><LoadingSpinner /></div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-gray-400">
                <FaComment className="mx-auto mb-2 text-gray-300" size={28} />
                <p className="text-sm">কোনো কথোপকথন নেই</p>
              </div>
            ) : (
              conversations.map((conv) => {
                const other = getOtherParticipant(conv);
                return (
                  <button
                    key={conv._id}
                    onClick={() => openConversation(conv)}
                    className={`w-full flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors text-left border-b last:border-0 ${activeConv?._id === conv._id ? 'bg-blue-50' : ''}`}
                  >
                    <div className="w-11 h-11 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden">
                      {other?.profilePicture
                        ? <Image src={other.profilePicture} alt="" width={44} height={44} className="object-cover" />
                        : <span className="text-xl">{other?.gender === 'male' ? '👨' : '👩'}</span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm text-gray-800 truncate">{other?.name}</p>
                      <p className="text-xs text-gray-400 truncate">{conv.lastMessage || 'কথোপকথন শুরু করুন'}</p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Conversation pagination */}
          {convTotalPages > 1 && !loadingConvs && (
            <div className="border-t p-2 flex items-center justify-between gap-1">
              <button
                onClick={() => fetchConversations(convPage - 1)}
                disabled={convPage === 1}
                className="w-7 h-7 flex items-center justify-center rounded-lg border text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronLeft size={10} />
              </button>
              <span className="text-xs text-gray-500">{convPage} / {convTotalPages}</span>
              <button
                onClick={() => fetchConversations(convPage + 1)}
                disabled={convPage === convTotalPages}
                className="w-7 h-7 flex items-center justify-center rounded-lg border text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <FaChevronRight size={10} />
              </button>
            </div>
          )}
        </div>

        {/* Chat area */}
        <div className="flex-1 bg-white rounded-xl border flex flex-col">
          {!activeConv ? (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <FaComment className="mx-auto mb-3 text-gray-300" size={40} />
                <p>একটি কথোপকথন বেছে নিন</p>
              </div>
            </div>
          ) : (
            <>
              {/* Chat header */}
              <div className="p-4 border-b flex items-center gap-3">
                {(() => { const other = getOtherParticipant(activeConv); return (
                  <>
                    <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden flex items-center justify-center">
                      {other?.profilePicture
                        ? <Image src={other.profilePicture} alt="" width={40} height={40} className="object-cover" />
                        : <span className="text-lg">{other?.gender === 'male' ? '👨' : '👩'}</span>}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{other?.name}</p>
                      {typingUsers.length > 0 && <p className="text-xs text-green-500">টাইপ করছেন...</p>}
                    </div>
                  </>
                ); })()}
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {loadingMsgs ? <LoadingSpinner /> : messages.map((msg) => {
                  const isMe = msg.senderId?.toString() === user?._id?.toString() || msg.senderId?._id?.toString() === user?._id?.toString();
                  return (
                    <div key={msg._id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] rounded-2xl px-4 py-2 text-sm ${isMe ? 'bg-[#1a5276] text-white rounded-br-sm' : 'bg-gray-100 text-gray-800 rounded-bl-sm'}`}>
                        <p>{msg.text}</p>
                        <p className={`text-xs mt-1 ${isMe ? 'text-white/60' : 'text-gray-400'}`}>
                          {new Date(msg.createdAt).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input */}
              <div className="p-4 border-t flex gap-3">
                <input
                  type="text"
                  value={text}
                  onChange={(e) => { setText(e.target.value); handleTyping(); }}
                  onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                  placeholder="বার্তা লিখুন..."
                  className="flex-1 input-field py-2.5"
                />
                <button
                  onClick={handleSend}
                  disabled={sending || !text.trim()}
                  className="btn-primary px-4 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50"
                >
                  <FaPaperPlane size={14} />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
