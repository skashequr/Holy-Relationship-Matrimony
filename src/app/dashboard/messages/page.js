'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Cookies from 'js-cookie';
import { io } from 'socket.io-client';
import DashboardLayout from '@/components/DashboardLayout';
import api, { messageAPI } from '@/lib/api';
import { messageId, mergeMessages, updateConversation } from '@/lib/messages';
import { useAuth } from '@/contexts/AuthContext';
import { FaArrowLeft, FaArrowRight, FaCheck, FaCommentDots, FaPaperPlane, FaSearch, FaSyncAlt } from 'react-icons/fa';
import styles from './messages.module.css';

function Avatar({ person }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [person?.profilePicture]);
  return <span className={styles.avatar}>{person?.profilePicture && !failed ? <img src={person.profilePicture} alt="" onError={() => setFailed(true)} /> : person?.name?.trim()?.charAt(0) || '?'}</span>;
}
const time = date => date ? new Date(date).toLocaleTimeString('bn-BD', { hour: '2-digit', minute: '2-digit' }) : '';
const day = date => new Date(date).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric' });

export default function MessagesPage() {
  const { user } = useAuth();
  const params = useSearchParams();
  const requestedId = params.get('conv');
  const ownId = user?._id;
  const [conversations, setConversations] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [drafts, setDrafts] = useState({});
  const [query, setQuery] = useState('');
  const [loadingList, setLoadingList] = useState(true);
  const [loadingChat, setLoadingChat] = useState(false);
  const [listError, setListError] = useState(false);
  const [chatError, setChatError] = useState(false);
  const [sendError, setSendError] = useState({});
  const [sending, setSending] = useState({});
  const [hasMore, setHasMore] = useState(false);
  const [olderLoading, setOlderLoading] = useState(false);
  const [olderError, setOlderError] = useState(false);
  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const activeRef = useRef(null);
  const pageRef = useRef(1);
  const listVersion = useRef(0);
  const chatVersion = useRef(0);
  const socketRef = useRef(null);
  const scrollRef = useRef(null);
  const shouldScroll = useRef(true);
  const sendingRef = useRef(new Set());
  const olderRef = useRef(false);
  const typingTimer = useRef(null);
  const remoteTypingTimer = useRef(null);
  const readTimer = useRef(null);
  const seenEvents = useRef(new Set());

  const other = conv => conv?.participants?.find(p => messageId(p) !== ownId);
  const markRead = useCallback((id, lastId) => {
    if (!lastId || document.visibilityState !== 'visible') return;
    clearTimeout(readTimer.current);
    readTimer.current = setTimeout(() => {
      if (activeRef.current !== id) return;
      messageAPI.markRead(id, lastId).then(() => {
        setConversations(cs => cs.map(c => c._id === id ? { ...c, unreadCount: 0 } : c));
      }).catch(() => {});
    }, 200);
  }, []);

  const fetchList = useCallback(async (page = pageRef.current, quiet = false) => {
    const version = ++listVersion.current;
    pageRef.current = page;
    if (!quiet) { setLoadingList(true); setListError(false); }
    try {
      const { data } = await messageAPI.getConversations({ page, limit: 20 });
      if (version !== listVersion.current) return;
      setConversations(data.conversations || []);
      setPagination({ ...data.pagination, totalPages: Math.max(1, data.pagination?.totalPages || 1) });
      setListError(false);
    } catch { if (version === listVersion.current) setListError(true); }
    finally { if (version === listVersion.current) setLoadingList(false); }
  }, []);

  const stopTyping = useCallback(() => {
    clearTimeout(typingTimer.current);
    if (activeRef.current) socketRef.current?.emit('stopTyping', { conversationId: activeRef.current });
  }, []);

  const openChat = useCallback(async (id, conversation = null) => {
    stopTyping();
    const previous = activeRef.current;
    if (previous) socketRef.current?.emit('leaveConversation', previous);
    const version = ++chatVersion.current;
    activeRef.current = id;
    setActive(conversation || { _id: id });
    setMessages([]); setLoadingChat(true); setChatError(false); setTyping(false);
    setHasMore(false); setOlderError(false); setOlderLoading(false); olderRef.current = false;
    shouldScroll.current = true;
    socketRef.current?.emit('joinConversation', id);
    try {
      const { data } = await messageAPI.getMessages(id);
      if (version !== chatVersion.current) return;
      setActive(data.conversation || conversation);
      setMessages(current => mergeMessages(current, data.messages || [], id));
      setHasMore(!!data.pagination?.hasMore);
      markRead(id, data.messages?.at(-1)?._id);
    } catch { if (version === chatVersion.current) setChatError(true); }
    finally { if (version === chatVersion.current) setLoadingChat(false); }
  }, [markRead, stopTyping]);

  const refreshChat = useCallback(async () => {
    const id = activeRef.current;
    const version = chatVersion.current;
    if (!id || document.visibilityState !== 'visible') return;
    try {
      const { data } = await messageAPI.getMessages(id);
      if (version !== chatVersion.current) return;
      setMessages(current => mergeMessages(current, data.messages || [], id));
      markRead(id, data.messages?.at(-1)?._id);
    } catch { /* Explicit loading failures use the retry panel. Background refresh retries later. */ }
  }, [markRead]);

  useEffect(() => { if (ownId) fetchList(1); }, [ownId, fetchList]);
  useEffect(() => { if (ownId && requestedId) openChat(requestedId); }, [ownId, requestedId, openChat]);

  useEffect(() => {
    if (!ownId) return;
    const socket = io(api.defaults.baseURL.replace(/\/api\/?$/, ''), {
      withCredentials: true, auth: callback => callback({ token: Cookies.get('token') }),
    });
    socketRef.current = socket;
    socket.on('connect', () => {
      setConnected(true);
      if (activeRef.current) socket.emit('joinConversation', activeRef.current);
      fetchList(pageRef.current, true); refreshChat();
    });
    socket.on('disconnect', () => setConnected(false));
    socket.on('connect_error', () => setConnected(false));
    socket.on('receiveMessage', message => {
      if (seenEvents.current.has(message._id)) return;
      seenEvents.current.add(message._id);
      if (seenEvents.current.size > 500) seenEvents.current.delete(seenEvents.current.values().next().value);
      const id = messageId(message.conversationId);
      setConversations(cs => updateConversation(cs, message, ownId, document.visibilityState === 'visible' ? activeRef.current : null));
      if (id === activeRef.current) {
        setMessages(current => mergeMessages(current, [message], id));
        markRead(id, message._id);
        setTyping(false);
      }
      fetchList(pageRef.current, true);
    });
    socket.on('typing', event => {
      if (event.conversationId !== activeRef.current || event.userId === ownId) return;
      setTyping(true); clearTimeout(remoteTypingTimer.current);
      remoteTypingTimer.current = setTimeout(() => setTyping(false), 2500);
    });
    socket.on('stopTyping', event => { if (event.conversationId === activeRef.current) setTyping(false); });
    socket.on('messageRead', event => {
      if (event.conversationId !== activeRef.current || event.readerId === ownId) return;
      setMessages(ms => ms.map(m => messageId(m.senderId) === ownId && m._id <= event.messageId ? { ...m, isRead: true } : m));
    });
    // HTTP refresh also recovers missed messages and refreshes expired access tokens.
    const refresh = () => {
      if (document.visibilityState !== 'visible') return;
      fetchList(pageRef.current, true).then(() => { if (!socket.connected) socket.connect(); });
      refreshChat();
    };
    const interval = setInterval(refresh, 15000);
    document.addEventListener('visibilitychange', refresh);
    return () => {
      socket.disconnect(); socketRef.current = null;
      clearInterval(interval); clearTimeout(typingTimer.current); clearTimeout(remoteTypingTimer.current); clearTimeout(readTimer.current);
      document.removeEventListener('visibilitychange', refresh);
      ++listVersion.current; ++chatVersion.current;
    };
  }, [ownId, fetchList, refreshChat, markRead]);

  useEffect(() => {
    if (shouldScroll.current && scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, loadingChat, typing]);

  const closeChat = () => {
    stopTyping(); socketRef.current?.emit('leaveConversation', activeRef.current);
    ++chatVersion.current; activeRef.current = null; setActive(null); setMessages([]); setTyping(false);
    window.history.replaceState(null, '', window.location.pathname);
  };
  const loadOlder = async () => {
    const id = activeRef.current;
    const version = chatVersion.current;
    if (!id || !messages.length || olderRef.current) return;
    olderRef.current = true; setOlderLoading(true); setOlderError(false);
    const height = scrollRef.current?.scrollHeight || 0;
    const top = scrollRef.current?.scrollTop || 0;
    try {
      const { data } = await messageAPI.getMessages(id, { before: messages[0]._id });
      if (version !== chatVersion.current) return;
      shouldScroll.current = false;
      setMessages(current => mergeMessages(current, data.messages || [], id));
      setHasMore(!!data.pagination?.hasMore);
      requestAnimationFrame(() => { if (version === chatVersion.current && scrollRef.current) scrollRef.current.scrollTop = top + scrollRef.current.scrollHeight - height; });
    } catch { if (version === chatVersion.current) setOlderError(true); }
    finally { if (version === chatVersion.current) { olderRef.current = false; setOlderLoading(false); } }
  };
  const send = async event => {
    event?.preventDefault();
    const id = activeRef.current;
    const original = drafts[id] || '';
    const text = original.trim();
    if (!id || !text || text.length > 2000 || loadingChat || chatError || sendingRef.current.has(id)) return;
    sendingRef.current.add(id); setSending(s => ({ ...s, [id]: true })); setSendError(e => ({ ...e, [id]: '' })); stopTyping();
    try {
      const { data } = await messageAPI.sendMessage({ conversationId: id, text });
      setDrafts(d => d[id] === original ? { ...d, [id]: '' } : d);
      if (activeRef.current === id) { shouldScroll.current = true; setMessages(current => mergeMessages(current, [data.message], id)); }
      fetchList(pageRef.current, true);
    } catch (error) { setSendError(e => ({ ...e, [id]: error.response?.data?.messageBn || 'বার্তা পাঠানো যায়নি। লেখাটি রাখা আছে, আবার পাঠান।' })); }
    finally { sendingRef.current.delete(id); setSending(s => ({ ...s, [id]: false })); }
  };
  const changeDraft = event => {
    const id = activeRef.current;
    setDrafts(d => ({ ...d, [id]: event.target.value }));
    if (!typingTimer.current) socketRef.current?.emit('typing', { conversationId: id });
    clearTimeout(typingTimer.current);
    typingTimer.current = setTimeout(() => { socketRef.current?.emit('stopTyping', { conversationId: id }); typingTimer.current = null; }, 1500);
  };
  const person = other(active);
  const filtered = conversations.filter(c => ((other(c)?.name || '') + ' ' + (c.lastMessage || '')).toLocaleLowerCase().includes(query.toLocaleLowerCase()));
  const draft = drafts[active?._id] || '';

  return <DashboardLayout>
    <div className={styles.title}><div><span className={styles.eyebrow}>আপনার যোগাযোগ</span><h1>বার্তা</h1><p>পরিচয় থেকে বোঝাপড়া—কথা হোক আন্তরিকতায়।</p></div><span className={styles.connection}><i className={connected ? styles.live : ''} />{connected ? 'লাইভ সংযোগ' : 'সংযোগের চেষ্টা চলছে'}</span></div>
    <div className={styles.workspace + (active ? ' ' + styles.chatOpen : '')}>
      <aside className={styles.inbox} aria-label="কথোপকথনের তালিকা">
        <div className={styles.inboxHeader}><h2>কথোপকথন <span>{pagination.total || 0}</span></h2><button aria-label="কথোপকথন রিফ্রেশ করুন" onClick={() => fetchList()} disabled={loadingList}><FaSyncAlt /></button></div>
        <label className={styles.search}><FaSearch /><input aria-label="এই পাতার কথোপকথনে খুঁজুন" placeholder="এই পাতায় খুঁজুন…" value={query} onChange={e => setQuery(e.target.value)} /></label>
        <div className={styles.conversationList}>
          {listError && <div role="alert" className={styles.error}>তালিকা লোড হয়নি। <button onClick={() => fetchList()}>আবার চেষ্টা করুন</button></div>}
          {loadingList ? <div role="status" className={styles.emptySmall}>কথোপকথন লোড হচ্ছে…</div> : !filtered.length ? <div className={styles.emptySmall}><FaCommentDots /><h3>{query ? 'কোনো ফলাফল নেই' : 'এখনও কোনো বার্তা নেই'}</h3><p>{query ? 'অন্য নাম দিয়ে খুঁজে দেখুন।' : 'প্রোফাইল থেকে একটি কথোপকথন শুরু করুন।'}</p>{!query && <Link href="/search">বায়োডেটা দেখুন <FaArrowRight /></Link>}</div> : filtered.map(c => {
            const p = other(c);
            return <button key={c._id} onClick={() => openChat(c._id, c)} aria-current={active?._id === c._id ? 'true' : undefined} className={styles.conversation + (active?._id === c._id ? ' ' + styles.selected : '')}><Avatar person={p} /><span className={styles.preview}><span className={styles.previewTop}><strong>{p?.name || 'সদস্য পাওয়া যায়নি'}</strong><time>{time(c.lastMessageAt)}</time></span><span className={styles.previewBottom}><span>{c.lastMessage || 'প্রথম বার্তাটি পাঠান'}</span>{c.unreadCount > 0 && <b aria-label={c.unreadCount + 'টি অপঠিত বার্তা'}>{c.unreadCount > 99 ? '৯৯+' : c.unreadCount}</b>}</span></span></button>;
          })}
        </div>
        {pagination.totalPages > 1 && <div className={styles.pagination}><button aria-label="আগের পাতা" disabled={loadingList || pagination.page <= 1} onClick={() => fetchList(pagination.page - 1)}><FaArrowLeft /></button><span>{pagination.page} / {pagination.totalPages}</span><button aria-label="পরের পাতা" disabled={loadingList || pagination.page >= pagination.totalPages} onClick={() => fetchList(pagination.page + 1)}><FaArrowRight /></button></div>}
      </aside>
      <section className={styles.chat} aria-label="মেসেজ">
        {!active ? <div className={styles.welcome}><span className={styles.welcomeIcon}><FaCommentDots /></span><span className={styles.eyebrow}>একটি সুন্দর কথোপকথনের শুরু</span><h2>আপনার কথার অপেক্ষায়</h2><p>তালিকা থেকে একটি কথোপকথন বেছে নিন।<br />সম্মান ও আন্তরিকতায় পরিচয় এগিয়ে নিন।</p><Link href="/search">নতুন পরিচয় খুঁজুন <FaArrowRight /></Link></div> : <>
          <header className={styles.chatHeader}><button className={styles.back} aria-label="কথোপকথনের তালিকায় ফিরুন" onClick={closeChat}><FaArrowLeft /></button><Avatar person={person} /><div><h2>{person?.name || (loadingChat ? 'লোড হচ্ছে…' : 'কথোপকথন')}</h2><p aria-live="polite">{typing ? 'টাইপ করছেন…' : 'ব্যক্তিগত কথোপকথন'}</p></div></header>
          <div ref={scrollRef} className={styles.messages} onScroll={e => { const el = e.currentTarget; shouldScroll.current = el.scrollHeight - el.scrollTop - el.clientHeight < 90; }} aria-busy={loadingChat}>
            {loadingChat ? <div role="status" className={styles.emptySmall}>বার্তা লোড হচ্ছে…</div> : chatError ? <div role="alert" className={styles.emptySmall}><p>কথোপকথন লোড করা যায়নি।</p><button onClick={() => openChat(active._id, active)}>আবার চেষ্টা করুন</button></div> : <>
              {hasMore && <div className={styles.older}><button disabled={olderLoading} onClick={loadOlder}>{olderLoading ? 'লোড হচ্ছে…' : 'আগের বার্তাগুলো দেখুন'}</button>{olderError && <p role="alert">লোড হয়নি। আবার চেষ্টা করুন।</p>}</div>}
              {!messages.length && <div className={styles.emptySmall}><FaCommentDots /><h3>কথোপকথন শুরু করুন</h3><p>শুভেচ্ছা জানিয়ে প্রথম বার্তাটি পাঠান।</p></div>}
              {messages.map((m, index) => { const mine = messageId(m.senderId) === ownId; return <div key={m._id}>{(!index || day(messages[index - 1].createdAt) !== day(m.createdAt)) && <div className={styles.date}><span>{day(m.createdAt)}</span></div>}<div className={styles.messageRow + (mine ? ' ' + styles.mine : '')}><div className={styles.bubble}><p>{m.text}</p><span className={styles.messageMeta}><time dateTime={m.createdAt}>{time(m.createdAt)}</time>{mine && <span aria-label={m.isRead ? 'পড়া হয়েছে' : 'পাঠানো হয়েছে'} title={m.isRead ? 'পড়া হয়েছে' : 'পাঠানো হয়েছে'}><FaCheck />{m.isRead && <FaCheck />}</span>}</span></div></div></div>; })}
              {typing && <div className={styles.typing} role="status">লিখছেন <span>•••</span></div>}
            </>}
          </div>
          <form className={styles.composer} onSubmit={send}>
            {sendError[active._id] && <p className={styles.sendError} role="alert">{sendError[active._id]}</p>}
            <div className={styles.composeRow}><textarea aria-label="বার্তা লিখুন" rows={2} maxLength={2000} value={draft} onChange={changeDraft} disabled={loadingChat || chatError || sending[active._id]} placeholder="আপনার বার্তা লিখুন…" onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); send(); } }} /><button type="submit" aria-label="বার্তা পাঠান" disabled={!draft.trim() || sending[active._id] || loadingChat || chatError}><FaPaperPlane /><span>{sending[active._id] ? 'পাঠানো হচ্ছে' : 'পাঠান'}</span></button></div>
            <div className={styles.composeHint}><span>Enter দিয়ে পাঠান · Shift + Enter নতুন লাইন</span><span>{draft.length}/২০০০</span></div>
          </form>
        </>}
      </section>
    </div>
  </DashboardLayout>;
}
