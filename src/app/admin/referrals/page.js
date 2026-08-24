'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaGift, FaSpinner, FaStar, FaUsers, FaTrophy } from 'react-icons/fa';

const statusColor = {
  rewarded: 'bg-green-100 text-green-700',
  pending: 'bg-amber-100 text-amber-700',
};
const statusBn = { rewarded: `✓ পুরস্কৃত`, pending: '⏳ অপেক্ষায়' };

export default function AdminReferralsPage() {
  const [tab, setTab] = useState('list');
  const [referrals, setReferrals] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [total, setTotal] = useState(0);
  const [totalPoints, setTotalPoints] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [refRes, lbRes] = await Promise.all([
        adminAPI.getReferrals({ status: filterStatus }),
        adminAPI.getReferralLeaderboard(),
      ]);
      setReferrals(refRes.data.referrals || []);
      setTotal(refRes.data.total || 0);
      setTotalPoints(refRes.data.totalPointsAwarded || 0);
      setLeaderboard(lbRes.data.leaderboard || []);
    } catch { toast.error('লোড হয়নি।'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  useEffect(() => { load(); }, [load]);

  const rewarded = referrals.filter((r) => r.status === 'rewarded').length;

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaGift className="text-[#c9a84c]" /> রেফারেল ম্যানেজমেন্ট
            </h1>
            <p className="text-sm text-gray-500">রেফারেল ট্র্যাকিং ও লিডারবোর্ড</p>
          </div>
          <div className="flex gap-3">
            <div className="bg-white rounded-xl border px-4 py-2 text-center">
              <p className="text-xl font-black text-[#1a5276]">{total}</p>
              <p className="text-xs text-gray-500">মোট রেফারেল</p>
            </div>
            <div className="bg-white rounded-xl border px-4 py-2 text-center">
              <p className="text-xl font-black text-[#c9a84c]">{totalPoints}</p>
              <p className="text-xs text-gray-500">মোট পয়েন্ট বিতরণ</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { key: 'list', label: 'রেফারেল তালিকা', icon: <FaUsers size={12} /> },
            { key: 'leaderboard', label: 'লিডারবোর্ড', icon: <FaTrophy size={12} /> },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                tab === t.key ? 'border-[#1a5276] text-[#1a5276]' : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-gray-400" size={24} /></div>
        ) : tab === 'list' ? (
          <>
            {/* Filter */}
            <div className="flex gap-2">
              {[
                { value: 'all', label: 'সব' },
                { value: 'pending', label: 'অপেক্ষায়' },
                { value: 'rewarded', label: 'পুরস্কৃত' },
              ].map((opt) => (
                <button key={opt.value} onClick={() => setFilterStatus(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filterStatus === opt.value
                      ? 'bg-[#1a5276] text-white border-[#1a5276]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a5276]'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {referrals.length === 0 ? (
              <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
                <FaGift size={28} className="mx-auto mb-2" />
                <p>কোনো রেফারেল নেই</p>
              </div>
            ) : (
              <div className="bg-white rounded-xl border overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">রেফারার</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">রেফার করা ব্যক্তি</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">তারিখ</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500">স্ট্যাটাস</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-gray-500">পয়েন্ট</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {referrals.map((r) => (
                      <tr key={r._id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{r.referrerId?.name || '—'}</p>
                          <p className="text-xs text-gray-400">{r.referrerId?.email}</p>
                          <p className="text-xs text-[#1a5276] font-mono">{r.referrerId?.referralCode}</p>
                        </td>
                        <td className="px-4 py-3">
                          <p className="font-semibold text-gray-800">{r.referredUserId?.name || '—'}</p>
                          <p className="text-xs text-gray-400">{r.referredUserId?.email}</p>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {new Date(r.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[r.status]}`}>
                            {statusBn[r.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-bold text-[#c9a84c]">
                          {r.pointsAwarded > 0 ? `+${r.pointsAwarded}` : '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          /* Leaderboard */
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="px-5 py-4 border-b flex items-center gap-2">
              <FaTrophy className="text-[#c9a84c]" size={15} />
              <p className="font-bold text-gray-800 text-sm">সর্বোচ্চ পয়েন্ট অর্জনকারী</p>
            </div>
            {leaderboard.length === 0 ? (
              <p className="p-8 text-center text-gray-400">কোনো তথ্য নেই</p>
            ) : (
              <div className="divide-y">
                {leaderboard.map((u, i) => (
                  <div key={u._id} className="px-5 py-3 flex items-center gap-4">
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-black flex-shrink-0 ${
                      i === 0 ? 'bg-yellow-400 text-white' :
                      i === 1 ? 'bg-gray-300 text-gray-700' :
                      i === 2 ? 'bg-amber-600 text-white' :
                      'bg-gray-100 text-gray-500'
                    }`}>{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-800 text-sm truncate">{u.name}</p>
                      <p className="text-xs text-gray-400">{u.email} • <span className="font-mono text-[#1a5276]">{u.referralCode}</span></p>
                    </div>
                    <div className="flex items-center gap-1 text-[#c9a84c] font-black">
                      <FaStar size={12} />
                      <span>{u.referralPoints}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
