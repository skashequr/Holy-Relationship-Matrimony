'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaBan, FaCheckCircle, FaSearch, FaSpinner, FaShieldAlt } from 'react-icons/fa';
import { useDebounce } from '@/lib/hooks';

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterAgeMin, setFilterAgeMin] = useState('');
  const [filterAgeMax, setFilterAgeMax] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [banModal, setBanModal] = useState(null);
  const [banReason, setBanReason] = useState('');
  const debouncedSearch = useDebounce(search, 500);

  useEffect(() => { fetchUsers(1); }, [debouncedSearch, filterGender, filterStatus, filterAgeMin, filterAgeMax]);

  const fetchUsers = async (pg) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getUsers({
        page: pg, limit: 15,
        search: debouncedSearch || undefined,
        gender: filterGender || undefined,
        status: filterStatus || undefined,
        ageMin: filterAgeMin || undefined,
        ageMax: filterAgeMax || undefined,
      });
      setUsers(data.users || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  };

  const handleBan = async () => {
    if (!banReason.trim()) { toast.error('কারণ লিখুন'); return; }
    const id = banModal;
    setActionLoading((p) => ({ ...p, [id]: 'ban' }));
    try {
      await adminAPI.banUser(id, banReason);
      toast.success('সদস্য নিষিদ্ধ করা হয়েছে');
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isBanned: true, banReason } : u));
      setBanModal(null); setBanReason('');
    } catch { toast.error('সমস্যা হয়েছে।'); }
    finally { setActionLoading((p) => ({ ...p, [id]: null })); }
  };

  const handleUnban = async (id) => {
    setActionLoading((p) => ({ ...p, [id]: 'unban' }));
    try {
      await adminAPI.unbanUser(id);
      toast.success('নিষেধাজ্ঞা তুলে নেওয়া হয়েছে');
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, isBanned: false } : u));
    } catch { toast.error('সমস্যা হয়েছে।'); }
    finally { setActionLoading((p) => ({ ...p, [id]: null })); }
  };

  const handleVerify = async (id) => {
    setActionLoading((p) => ({ ...p, [id]: 'verify' }));
    try {
      await adminAPI.verifyUser(id);
      toast.success('সদস্য যাচাই করা হয়েছে');
      setUsers((prev) => prev.map((u) => u._id === id ? { ...u, verificationBadge: true, isVerified: true } : u));
    } catch { toast.error('সমস্যা হয়েছে।'); }
    finally { setActionLoading((p) => ({ ...p, [id]: null })); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">সদস্য পরিচালনা</h1>
            <p className="text-sm text-gray-500">মোট {total} জন সদস্য</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="নাম, ইমেইল বা ফোন দিয়ে খুঁজুন"
                className="input-field pl-9 text-sm py-2"
              />
            </div>
          </div>
          <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="input-field text-sm py-2 w-32">
            <option value="">সব লিঙ্গ</option>
            <option value="male">পুরুষ</option>
            <option value="female">মহিলা</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field text-sm py-2 w-36">
            <option value="">সব স্ট্যাটাস</option>
            <option value="active">সক্রিয়</option>
            <option value="banned">নিষিদ্ধ</option>
          </select>
          <div className="flex items-center gap-1">
            <input
              type="number"
              value={filterAgeMin}
              onChange={(e) => setFilterAgeMin(e.target.value)}
              placeholder="বয়স (সর্বনিম্ন)"
              min={18} max={80}
              className="input-field text-sm py-2 w-32"
            />
            <span className="text-gray-400 text-sm">-</span>
            <input
              type="number"
              value={filterAgeMax}
              onChange={(e) => setFilterAgeMax(e.target.value)}
              placeholder="সর্বোচ্চ"
              min={18} max={80}
              className="input-field text-sm py-2 w-28"
            />
          </div>
        </div>

        {/* Table */}
        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-header text-left">সদস্য</th>
                    <th className="table-header">লিঙ্গ</th>
                    <th className="table-header">মোবাইল</th>
                    <th className="table-header">বায়োডেটা</th>
                    <th className="table-header">স্ট্যাটাস</th>
                    <th className="table-header">যোগদান</th>
                    <th className="table-header">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u._id} className={`hover:bg-gray-50 transition-colors ${u.isBanned ? 'opacity-60' : ''}`}>
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {u.profilePicture ? (
                              <Image src={u.profilePicture} alt="" width={36} height={36} className="object-cover" />
                            ) : <span className="text-lg">{u.gender === 'male' ? '👨' : '👩'}</span>}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 flex items-center gap-1">
                              {u.name}
                              {u.verificationBadge && <FaCheckCircle size={11} className="text-green-500" />}
                            </p>
                            <p className="text-xs text-gray-400 truncate max-w-[150px]">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-center text-xs">{u.gender === 'male' ? '👨 পুরুষ' : '👩 মহিলা'}</td>
                      <td className="table-cell text-center text-xs text-gray-600">{u.phone || '-'}</td>
                      <td className="table-cell text-center">
                        {u.biodataId ? (
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            u.biodataId.status === 'approved' ? 'bg-green-100 text-green-700' :
                            u.biodataId.status === 'rejected' ? 'bg-red-100 text-red-600' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            {u.biodataId.status === 'approved' ? '✓' : u.biodataId.status === 'rejected' ? '✗' : '⏳'}
                          </span>
                        ) : <span className="text-xs text-gray-400">নেই</span>}
                      </td>
                      <td className="table-cell text-center">
                        {u.isBanned ? (
                          <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-semibold">নিষিদ্ধ</span>
                        ) : (
                          <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full font-semibold">সক্রিয়</span>
                        )}
                      </td>
                      <td className="table-cell text-center text-xs text-gray-400">
                        {new Date(u.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1.5 justify-center">
                          {!u.verificationBadge && (
                            <button onClick={() => handleVerify(u._id)} disabled={actionLoading[u._id]} className="w-7 h-7 bg-blue-100 hover:bg-blue-200 rounded-lg flex items-center justify-center text-blue-600 transition-colors" title="যাচাই করুন">
                              {actionLoading[u._id] === 'verify' ? <FaSpinner size={11} className="animate-spin" /> : <FaShieldAlt size={11} />}
                            </button>
                          )}
                          {u.isBanned ? (
                            <button onClick={() => handleUnban(u._id)} disabled={actionLoading[u._id]} className="w-7 h-7 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center text-green-600 transition-colors" title="নিষেধাজ্ঞা তুলুন">
                              {actionLoading[u._id] === 'unban' ? <FaSpinner size={11} className="animate-spin" /> : <FaCheckCircle size={11} />}
                            </button>
                          ) : (
                            <button onClick={() => setBanModal(u._id)} className="w-7 h-7 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center text-red-500 transition-colors" title="নিষিদ্ধ করুন">
                              <FaBan size={11} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">কোনো সদস্য পাওয়া যায়নি</div>}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => fetchUsers(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-[#1a5276] text-white' : 'bg-white border hover:bg-gray-50 text-gray-600'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>

      {/* Ban Modal */}
      {banModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-800 mb-4">নিষিদ্ধ করার কারণ লিখুন</h3>
            <textarea
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="কারণ লিখুন..."
              className="input-field h-28 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setBanModal(null); setBanReason(''); }} className="flex-1 btn-outline py-2.5 rounded-xl">বাতিল</button>
              <button onClick={handleBan} disabled={actionLoading[banModal]} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {actionLoading[banModal] ? 'প্রক্রিয়াধীন...' : 'নিষিদ্ধ করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
