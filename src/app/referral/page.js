'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { referralAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FaLink, FaCopy, FaCheckCircle, FaSpinner, FaStar,
  FaUsers, FaGift, FaLock,
} from 'react-icons/fa';

const POINTS_TO_UNLOCK = 100;
const POINTS_PER_REFERRAL = 10;

function StatBox({ label, value, sub, color = 'text-[#1a5276]' }) {
  return (
    <div className="bg-white rounded-2xl border p-5 text-center">
      <p className={`text-3xl font-black ${color}`}>{value}</p>
      <p className="text-sm font-semibold text-gray-700 mt-1">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ReferralPage() {
  const [stats, setStats] = useState(null);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, listRes] = await Promise.all([
          referralAPI.getMe(),
          referralAPI.getList(),
        ]);
        setStats(statsRes.data);
        setReferrals(listRes.data.referrals || []);
      } catch {
        toast.error('তথ্য লোড হয়নি।');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copyLink = () => {
    if (!stats?.referralLink) return;
    navigator.clipboard.writeText(stats.referralLink);
    setCopied(true);
    toast.success('লিংক কপি হয়েছে!');
    setTimeout(() => setCopied(false), 3000);
  };

  const points = stats?.points ?? 0;
  const progress = Math.min((points % POINTS_TO_UNLOCK) / POINTS_TO_UNLOCK * 100, 100);
  const pointsInCycle = points % POINTS_TO_UNLOCK;

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaGift className="text-[#c9a84c]" /> রেফারেল প্রোগ্রাম
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">বন্ধুদের রেফার করুন, পয়েন্ট উপার্জন করুন, বায়োডেটা আনলক করুন</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-gray-400" size={24} /></div>
        ) : (
          <>
            {/* How it works */}
            <div className="bg-gradient-to-br from-[#0c3a5e] to-[#1b6a3b] rounded-2xl p-5 text-white">
              <p className="font-bold text-sm mb-4 text-white/70 uppercase tracking-widest">কীভাবে কাজ করে</p>
              <div className="grid grid-cols-3 gap-3 text-center text-xs">
                {[
                  { icon: '🔗', step: '১', title: 'লিংক শেয়ার করুন', desc: 'আপনার রেফারেল লিংক বন্ধুদের পাঠান' },
                  { icon: '✅', step: '২', title: 'বায়োডেটা অনুমোদন', desc: 'তারা রেজিস্ট্রেশন ও বায়োডেটা অনুমোদন পেলে' },
                  { icon: '🎁', step: '৩', title: `${POINTS_PER_REFERRAL} পয়েন্ট পান`, desc: `${POINTS_TO_UNLOCK} পয়েন্টে ১টি বায়োডেটা আনলক` },
                ].map((s) => (
                  <div key={s.step} className="bg-white/10 rounded-xl p-3 space-y-1">
                    <div className="text-2xl">{s.icon}</div>
                    <p className="font-bold text-white">{s.title}</p>
                    <p className="text-white/60">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Referral link */}
            <div className="bg-white rounded-2xl border p-5 space-y-3">
              <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <FaLink className="text-[#1a5276]" /> আপনার রেফারেল লিংক
              </p>
              <div className="flex gap-2">
                <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm text-gray-600 truncate font-mono">
                  {stats?.referralLink}
                </div>
                <button onClick={copyLink}
                  className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                    copied ? 'bg-green-500 text-white' : 'bg-[#1a5276] hover:bg-[#154360] text-white'
                  }`}>
                  {copied ? <FaCheckCircle size={13} /> : <FaCopy size={13} />}
                  {copied ? 'কপি হয়েছে' : 'কপি করুন'}
                </button>
              </div>
              <p className="text-xs text-gray-400">
                রেফারেল কোড: <span className="font-bold text-gray-600 tracking-widest">{stats?.referralCode}</span>
              </p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              <StatBox
                label="মোট পয়েন্ট"
                value={points}
                sub={`${stats?.unlockableCount || 0}টি আনলক করা যাবে`}
                color="text-[#c9a84c]"
              />
              <StatBox
                label="সফল রেফারেল"
                value={stats?.rewarded ?? 0}
                sub={`মোট ${stats?.totalReferrals ?? 0} জন`}
                color="text-green-600"
              />
              <StatBox
                label="আনলক করা"
                value={stats?.unlocks ?? 0}
                sub="পয়েন্ট দিয়ে"
                color="text-[#1a5276]"
              />
            </div>

            {/* Points progress */}
            <div className="bg-white rounded-2xl border p-5 space-y-3">
              <div className="flex items-center justify-between">
                <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
                  <FaStar className="text-[#c9a84c]" /> পরবর্তী আনলকের অগ্রগতি
                </p>
                <span className="text-sm font-bold text-[#1a5276]">{pointsInCycle} / {POINTS_TO_UNLOCK}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="h-3 rounded-full bg-gradient-to-r from-[#1a5276] to-[#c9a84c] transition-all duration-700"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-xs text-gray-500">
                {pointsInCycle < POINTS_TO_UNLOCK
                  ? `আরও ${POINTS_TO_UNLOCK - pointsInCycle} পয়েন্ট হলে ১টি বায়োডেটা আনলক করতে পারবেন`
                  : 'আপনি এখনই বায়োডেটা আনলক করতে পারবেন!'}
              </p>
              {points >= POINTS_TO_UNLOCK && (
                <div className="bg-[#c9a84c]/10 border border-[#c9a84c]/30 rounded-xl p-3 text-sm text-amber-700 font-semibold flex items-center gap-2">
                  <FaLock size={12} /> যেকোনো প্রোফাইলে গিয়ে পয়েন্ট দিয়ে আনলক করুন
                </div>
              )}
            </div>

            {/* Referral list */}
            <div className="bg-white rounded-2xl border overflow-hidden">
              <div className="px-5 py-4 border-b flex items-center gap-2">
                <FaUsers className="text-[#1a5276]" size={14} />
                <p className="font-bold text-gray-800 text-sm">রেফারেল তালিকা</p>
              </div>
              {referrals.length === 0 ? (
                <div className="p-8 text-center text-gray-400">
                  <FaUsers size={28} className="mx-auto mb-2" />
                  <p className="font-semibold">এখনো কাউকে রেফার করেননি</p>
                  <p className="text-xs mt-1">উপরের লিংক শেয়ার করুন</p>
                </div>
              ) : (
                <div className="divide-y">
                  {referrals.map((r) => (
                    <div key={r._id} className="px-5 py-3 flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold text-gray-800 text-sm">{r.referredUserId?.name || 'ব্যবহারকারী'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(r.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                        r.status === 'rewarded'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {r.status === 'rewarded' ? `✓ +${r.pointsAwarded} পয়েন্ট` : '⏳ অপেক্ষায়'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
