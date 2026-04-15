'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaCrown, FaSpinner, FaSearch } from 'react-icons/fa';

export default function AdminPremiumPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [modal, setModal] = useState(null); // { userId, mode: 'set' | 'extend' }
  const [duration, setDuration] = useState(30);
  const [note, setNote] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [searchEmail, setSearchEmail] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searching, setSearching] = useState(false);

  useEffect(() => { fetchPremium(1); }, []);

  const fetchPremium = async (pg) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getPremiumMembers({ page: pg, limit: 15 });
      setUsers(data.users || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  };

  const handleSetPremium = async () => {
    const userId = modal?.userId;
    if (!userId) return;
    setActionLoading((p) => ({ ...p, [userId]: true }));
    try {
      await adminAPI.setPremium(userId, { durationDays: duration, note });
      toast.success('প্রিমিয়াম সক্রিয় হয়েছে');
      setModal(null); setNote(''); setDuration(30);
      fetchPremium(page);
    } catch { toast.error('সমস্যা হয়েছে'); }
    finally { setActionLoading((p) => ({ ...p, [userId]: false })); }
  };

  const handleRevoke = async (userId) => {
    if (!confirm('প্রিমিয়াম বাতিল করবেন?')) return;
    setActionLoading((p) => ({ ...p, [userId]: true }));
    try {
      await adminAPI.revokePremium(userId);
      toast.success('প্রিমিয়াম বাতিল হয়েছে');
      setUsers((prev) => prev.filter((u) => u._id !== userId));
      setTotal((t) => t - 1);
    } catch { toast.error('সমস্যা হয়েছে'); }
    finally { setActionLoading((p) => ({ ...p, [userId]: false })); }
  };

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    setSearching(true);
    try {
      const { data } = await adminAPI.getUsers({ search: searchEmail, limit: 5 });
      setSearchResult(data.users || []);
    } catch {}
    finally { setSearching(false); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FaCrown className="text-[#c9a84c]" /> প্রিমিয়াম সদস্য</h1>
            <p className="text-sm text-gray-500">মোট {total} জন সক্রিয় প্রিমিয়াম সদস্য</p>
          </div>
        </div>

        {/* Search to add premium */}
        <div className="bg-white rounded-xl border p-4 space-y-3">
          <p className="text-sm font-semibold text-gray-700">নতুন প্রিমিয়াম যোগ করুন</p>
          <div className="flex gap-2">
            <input value={searchEmail} onChange={(e) => setSearchEmail(e.target.value)} placeholder="ইমেইল বা নাম দিয়ে খুঁজুন..." className="input-field text-sm py-2 flex-1" />
            <button onClick={handleSearch} disabled={searching} className="btn-primary px-4 rounded-xl flex items-center gap-2 text-sm">
              {searching ? <FaSpinner className="animate-spin" /> : <FaSearch size={13} />} খুঁজুন
            </button>
          </div>
          {searchResult?.length > 0 && (
            <div className="border rounded-xl overflow-hidden">
              {searchResult.map((u) => (
                <div key={u._id} className="flex items-center justify-between p-3 hover:bg-gray-50 border-b last:border-0">
                  <div>
                    <p className="text-sm font-semibold">{u.name}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </div>
                  <button onClick={() => setModal({ userId: u._id, userName: u.name })} className="text-xs bg-[#c9a84c] hover:bg-[#b8943b] text-white font-semibold px-3 py-1.5 rounded-lg">
                    প্রিমিয়াম দিন
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Table */}
        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-header text-left">সদস্য</th>
                    <th className="table-header">শুরু</th>
                    <th className="table-header">মেয়াদ শেষ</th>
                    <th className="table-header">বাকি দিন</th>
                    <th className="table-header">নোট</th>
                    <th className="table-header">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className={`hover:bg-gray-50 ${u.isExpired ? 'opacity-50' : ''}`}>
                      <td className="table-cell">
                        <p className="text-sm font-semibold">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.email}</p>
                      </td>
                      <td className="table-cell text-center text-xs text-gray-500">{u.premiumSince ? new Date(u.premiumSince).toLocaleDateString('bn-BD') : '-'}</td>
                      <td className="table-cell text-center text-xs text-gray-500">{u.premiumExpiry ? new Date(u.premiumExpiry).toLocaleDateString('bn-BD') : '-'}</td>
                      <td className="table-cell text-center">
                        <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${u.daysRemaining <= 3 ? 'bg-red-100 text-red-600' : u.daysRemaining <= 7 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {u.daysRemaining ?? '-'} দিন
                        </span>
                      </td>
                      <td className="table-cell text-center text-xs text-gray-500 max-w-[120px] truncate">{u.premiumNote || '-'}</td>
                      <td className="table-cell">
                        <div className="flex gap-1.5 justify-center">
                          <button onClick={() => setModal({ userId: u._id, userName: u.name })} className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg font-semibold">বাড়ান</button>
                          <button onClick={() => handleRevoke(u._id)} disabled={actionLoading[u._id]} className="text-xs bg-red-100 hover:bg-red-200 text-red-600 px-2 py-1 rounded-lg font-semibold disabled:opacity-50">বাতিল</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">কোনো প্রিমিয়াম সদস্য নেই</div>}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => fetchPremium(p)} className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-[#1a5276] text-white' : 'bg-white border hover:bg-gray-50'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Set/Extend premium modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-gray-800 mb-4">প্রিমিয়াম সেট করুন — {modal.userName}</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm text-gray-600 mb-1 block">মেয়াদ (দিন)</label>
                <select value={duration} onChange={(e) => setDuration(Number(e.target.value))} className="input-field text-sm">
                  <option value={30}>৩০ দিন</option>
                  <option value={90}>৯০ দিন</option>
                  <option value={180}>১৮০ দিন</option>
                  <option value={365}>৩৬৫ দিন</option>
                </select>
              </div>
              <div>
                <label className="text-sm text-gray-600 mb-1 block">নোট (ঐচ্ছিক)</label>
                <input value={note} onChange={(e) => setNote(e.target.value)} placeholder="যেমন: bKash 01XXXXXXXXX confirmed" className="input-field text-sm" />
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={() => setModal(null)} className="flex-1 btn-outline py-2.5 rounded-xl">বাতিল</button>
              <button onClick={handleSetPremium} disabled={actionLoading[modal.userId]} className="flex-1 bg-[#c9a84c] hover:bg-[#b8943b] text-white font-semibold py-2.5 rounded-xl disabled:opacity-50">
                {actionLoading[modal.userId] ? 'প্রক্রিয়াধীন...' : 'সেট করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
