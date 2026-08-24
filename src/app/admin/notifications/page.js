'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FaBell, FaPaperPlane, FaSpinner, FaEnvelope,
  FaUserSlash, FaTimesCircle, FaUsers,
} from 'react-icons/fa';

// ── Shared Result banner ───────────────────────────────────────────────
function ResultBanner({ result }) {
  if (!result) return null;
  return (
    <div className="bg-green-50 border border-green-100 rounded-xl p-3 text-sm text-green-700 font-medium">
      ✓ {result}
    </div>
  );
}

// ── Section wrapper ────────────────────────────────────────────────────
function Card({ icon, title, desc, children }) {
  return (
    <div className="bg-white rounded-xl border p-6 space-y-4">
      <div className="flex items-center gap-3 pb-2 border-b">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-blue-50 text-blue-600">
          {icon}
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-sm">{title}</h2>
          <p className="text-xs text-gray-400">{desc}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
export default function AdminNotificationsPage() {

  // 1. In-app broadcast notification
  const [notifTitle, setNotifTitle] = useState('');
  const [notifTitleBn, setNotifTitleBn] = useState('');
  const [notifMsg, setNotifMsg] = useState('');
  const [notifMsgBn, setNotifMsgBn] = useState('');
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifResult, setNotifResult] = useState(null);

  // 2. No-biodata reminder email
  const [noBiodataLoading, setNoBiodataLoading] = useState(false);
  const [noBiodataResult, setNoBiodataResult] = useState(null);

  // 3. Custom email to target group
  const [emailTarget, setEmailTarget] = useState('pending');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMsg, setEmailMsg] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailResult, setEmailResult] = useState(null);

  // ── Handlers ─────────────────────────────────────────────────────────

  const handleNotif = async (e) => {
    e.preventDefault();
    if (!notifTitle.trim() || !notifMsg.trim()) {
      toast.error('শিরোনাম এবং বার্তা দিতে হবে'); return;
    }
    setNotifLoading(true); setNotifResult(null);
    try {
      const { data } = await adminAPI.sendBroadcastNotification({
        title: notifTitle.trim(),
        titleBn: notifTitleBn.trim() || notifTitle.trim(),
        message: notifMsg.trim(),
        messageBn: notifMsgBn.trim() || notifMsg.trim(),
      });
      setNotifResult(`${data.count} জন ব্যবহারকারীর কাছে নোটিফিকেশন পাঠানো হয়েছে`);
      setNotifTitle(''); setNotifTitleBn(''); setNotifMsg(''); setNotifMsgBn('');
    } catch { toast.error('পাঠানো যায়নি।'); }
    finally { setNotifLoading(false); }
  };

  const handleNoBiodataEmail = async () => {
    setNoBiodataLoading(true); setNoBiodataResult(null);
    try {
      const { data } = await adminAPI.sendNoBiodataEmail();
      setNoBiodataResult(
        data.count === 0
          ? 'বায়োডেটাহীন কোনো ব্যবহারকারী পাওয়া যায়নি'
          : `${data.count} জন ব্যবহারকারীর কাছে রিমাইন্ডার ইমেইল পাঠানো হয়েছে`
      );
    } catch { toast.error('ইমেইল পাঠানো যায়নি।'); }
    finally { setNoBiodataLoading(false); }
  };

  const handleCustomEmail = async (e) => {
    e.preventDefault();
    if (!emailSubject.trim() || !emailMsg.trim()) {
      toast.error('বিষয় এবং বার্তা দিতে হবে'); return;
    }
    setEmailLoading(true); setEmailResult(null);
    try {
      const { data } = await adminAPI.sendCustomEmail({
        target: emailTarget,
        subject: emailSubject.trim(),
        message: emailMsg.trim(),
      });
      setEmailResult(
        data.count === 0
          ? 'কোনো প্রাপক পাওয়া যায়নি'
          : `${data.count} জনের কাছে ইমেইল পাঠানো হয়েছে`
      );
      setEmailSubject(''); setEmailMsg('');
    } catch { toast.error('ইমেইল পাঠানো যায়নি।'); }
    finally { setEmailLoading(false); }
  };

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="space-y-5 max-w-2xl">
        <div>
          <h1 className="text-xl font-bold text-gray-800">যোগাযোগ কেন্দ্র</h1>
          <p className="text-sm text-gray-500">নোটিফিকেশন ও ইমেইল পাঠান</p>
        </div>

        {/* ── 1. In-app notification broadcast ── */}
        <Card
          icon={<FaBell size={16} />}
          title="সকল ব্যবহারকারীকে অ্যাপ নোটিফিকেশন"
          desc="সব সক্রিয় ব্যবহারকারীর অ্যাপে একসাথে নোটিফিকেশন পাঠান"
        >
          <ResultBanner result={notifResult} />
          <form onSubmit={handleNotif} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">শিরোনাম (ইংরেজি) *</label>
                <input value={notifTitle} onChange={e => setNotifTitle(e.target.value)}
                  placeholder="Notification title" className="input-field" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">শিরোনাম (বাংলা)</label>
                <input value={notifTitleBn} onChange={e => setNotifTitleBn(e.target.value)}
                  placeholder="নোটিফিকেশন শিরোনাম" className="input-field" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-gray-500 mb-1 block">বার্তা (ইংরেজি) *</label>
                <textarea value={notifMsg} onChange={e => setNotifMsg(e.target.value)}
                  placeholder="Message..." className="input-field h-24 resize-none" />
              </div>
              <div>
                <label className="text-xs text-gray-500 mb-1 block">বার্তা (বাংলা)</label>
                <textarea value={notifMsgBn} onChange={e => setNotifMsgBn(e.target.value)}
                  placeholder="বার্তা..." className="input-field h-24 resize-none" />
              </div>
            </div>
            <button type="submit" disabled={notifLoading}
              className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {notifLoading ? <FaSpinner size={13} className="animate-spin" /> : <FaPaperPlane size={13} />}
              সকলকে নোটিফিকেশন পাঠান
            </button>
          </form>
        </Card>

        {/* ── 2. No-biodata reminder ── */}
        <Card
          icon={<FaUserSlash size={16} />}
          title="বায়োডেটাহীন ব্যবহারকারীদের রিমাইন্ডার"
          desc="যারা নিবন্ধন করেছেন কিন্তু বায়োডেটা তৈরি করেননি তাদের ইমেইল"
        >
          <ResultBanner result={noBiodataResult} />
          <p className="text-sm text-gray-500">
            বায়োডেটাহীন সক্রিয় সব ব্যবহারকারীর কাছে স্বয়ংক্রিয় রিমাইন্ডার ইমেইল পাঠাবে।
            ইমেইলে বায়োডেটা তৈরির সরাসরি লিংক থাকবে।
          </p>
          <button onClick={handleNoBiodataEmail} disabled={noBiodataLoading}
            className="w-full bg-amber-500 hover:bg-amber-600 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
            {noBiodataLoading ? <FaSpinner size={13} className="animate-spin" /> : <FaEnvelope size={13} />}
            এক ক্লিকে রিমাইন্ডার পাঠান
          </button>
        </Card>

        {/* ── 3. Custom email to target group ── */}
        <Card
          icon={<FaTimesCircle size={16} />}
          title="কাস্টম ইমেইল পাঠান"
          desc="নির্দিষ্ট গ্রুপকে কাস্টম বিষয় ও বার্তা সহ ইমেইল পাঠান"
        >
          <ResultBanner result={emailResult} />
          <form onSubmit={handleCustomEmail} className="space-y-3">
            <div>
              <label className="text-xs text-gray-500 mb-1 block">প্রাপক গ্রুপ *</label>
              <div className="flex gap-2">
                {[
                  { value: 'pending', label: '⏳ পর্যালোচনাধীন বায়োডেটা' },
                  { value: 'rejected', label: '✗ প্রত্যাখ্যাত বায়োডেটা' },
                  { value: 'all', label: '👥 সকল ব্যবহারকারী' },
                ].map(opt => (
                  <button key={opt.value} type="button"
                    onClick={() => setEmailTarget(opt.value)}
                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      emailTarget === opt.value
                        ? 'bg-[#1a5276] text-white border-[#1a5276]'
                        : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a5276]'
                    }`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">ইমেইলের বিষয় *</label>
              <input value={emailSubject} onChange={e => setEmailSubject(e.target.value)}
                placeholder="ইমেইলের বিষয় লিখুন" className="input-field" required />
            </div>
            <div>
              <label className="text-xs text-gray-500 mb-1 block">বার্তা *</label>
              <textarea value={emailMsg} onChange={e => setEmailMsg(e.target.value)}
                placeholder="ইমেইলের বার্তা লিখুন..." className="input-field h-36 resize-none" required />
            </div>
            <button type="submit" disabled={emailLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60">
              {emailLoading ? <FaSpinner size={13} className="animate-spin" /> : <FaUsers size={13} />}
              {emailTarget === 'pending' ? 'পর্যালোচনাধীনদের' : emailTarget === 'rejected' ? 'প্রত্যাখ্যাতদের' : 'সকলকে'} ইমেইল পাঠান
            </button>
          </form>
        </Card>
      </div>
    </AdminLayout>
  );
}
