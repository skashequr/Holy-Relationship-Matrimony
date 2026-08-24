'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { educationLabels, professionLabels } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FaCheck, FaTimes, FaEye, FaSearch, FaSpinner } from 'react-icons/fa';
import BiodataDetailModal from '@/components/BiodataDetailModal';

const statusBadge = {
  approved: 'badge-verified',
  pending: 'badge-pending',
  rejected: 'badge-rejected',
  draft: 'bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full',
};

export default function AdminBiodatasPage() {
  const [biodatas, setBiodatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [filterGender, setFilterGender] = useState('');
  const [filterAgeMin, setFilterAgeMin] = useState('');
  const [filterAgeMax, setFilterAgeMax] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [viewModal, setViewModal] = useState(null);

  useEffect(() => { fetchBiodatas(1); }, [filterStatus, filterGender, filterAgeMin, filterAgeMax]);

  const fetchBiodatas = async (pg) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getBiodatas({ page: pg, limit: 15, status: filterStatus || undefined, gender: filterGender || undefined, ageMin: filterAgeMin || undefined, ageMax: filterAgeMax || undefined });
      setBiodatas(data.biodatas || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading((p) => ({ ...p, [id]: 'approve' }));
    try {
      await adminAPI.approveBiodata(id);
      toast.success('বায়োডেটা অনুমোদিত হয়েছে');
      setBiodatas((prev) => prev.map((b) => b._id === id ? { ...b, status: 'approved' } : b));
    } catch { toast.error('সমস্যা হয়েছে।'); }
    finally { setActionLoading((p) => ({ ...p, [id]: null })); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error('প্রত্যাখ্যানের কারণ লিখুন'); return; }
    const id = rejectModal;
    setActionLoading((p) => ({ ...p, [id]: 'reject' }));
    try {
      await adminAPI.rejectBiodata(id, rejectReason);
      toast.success('বায়োডেটা প্রত্যাখ্যাত হয়েছে');
      setBiodatas((prev) => prev.map((b) => b._id === id ? { ...b, status: 'rejected', rejectionReason: rejectReason } : b));
      setRejectModal(null);
      setRejectReason('');
    } catch { toast.error('সমস্যা হয়েছে।'); }
    finally { setActionLoading((p) => ({ ...p, [id]: null })); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800">বায়োডেটা পরিচালনা</h1>
            <p className="text-sm text-gray-500">মোট {total} টি বায়োডেটা</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
          <div>
            <label className="text-xs text-gray-500 mb-1 block">স্ট্যাটাস</label>
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field text-sm py-2 w-40">
              <option value="">সব</option>
              <option value="pending">পর্যালোচনাধীন</option>
              <option value="approved">অনুমোদিত</option>
              <option value="rejected">প্রত্যাখ্যাত</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">লিঙ্গ</label>
            <select value={filterGender} onChange={(e) => setFilterGender(e.target.value)} className="input-field text-sm py-2 w-36">
              <option value="">সব</option>
              <option value="male">পুরুষ</option>
              <option value="female">মহিলা</option>
            </select>
          </div>
          <div>
            <label className="text-xs text-gray-500 mb-1 block">বয়স সীমা</label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={filterAgeMin}
                onChange={(e) => setFilterAgeMin(e.target.value)}
                placeholder="সর্বনিম্ন"
                min={18} max={80}
                className="input-field text-sm py-2 w-28"
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
        </div>

        {/* Table */}
        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-header text-left">বায়োডেটা</th>
                    <th className="table-header">বয়স / জেলা</th>
                    <th className="table-header">শিক্ষা</th>
                    <th className="table-header">স্ট্যাটাস</th>
                    <th className="table-header">তারিখ</th>
                    <th className="table-header">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {biodatas.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {b.userId?.profilePicture ? (
                              <Image src={b.userId.profilePicture} alt="" width={40} height={40} className="object-cover" />
                            ) : <span className="text-xl">{b.userId?.gender === 'male' ? '👨' : '👩'}</span>}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800">{b.personal?.fullName || b.userId?.name}</p>
                            <p className="text-xs text-gray-500">{b.biodataNumber} · {b.userId?.gender === 'male' ? 'পুরুষ' : 'মহিলা'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-center text-xs text-gray-600">
                        {b.personal?.age && <span>{b.personal.age} বছর</span>}
                        {b.address?.permanentDistrict && <span className="block">{b.address.permanentDistrict}</span>}
                      </td>
                      <td className="table-cell text-center text-xs text-gray-600">
                        {educationLabels.bn[b.education?.highestLevel] || '-'}
                      </td>
                      <td className="table-cell text-center">
                        <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[b.status]}`}>
                          {b.status === 'approved' ? '✓ অনুমোদিত' : b.status === 'rejected' ? '✗ প্রত্যাখ্যাত' : '⏳ পর্যালোচনাধীন'}
                        </span>
                      </td>
                      <td className="table-cell text-center text-xs text-gray-500">
                        {new Date(b.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2 justify-center">
                          <button onClick={() => setViewModal(b)} className="w-7 h-7 bg-gray-100 hover:bg-gray-200 rounded-lg flex items-center justify-center text-gray-600 transition-colors" title="বিস্তারিত দেখুন">
                            <FaEye size={12} />
                          </button>
                          {b.status !== 'approved' && (
                            <button
                              onClick={() => handleApprove(b._id)}
                              disabled={actionLoading[b._id]}
                              className="w-7 h-7 bg-green-100 hover:bg-green-200 rounded-lg flex items-center justify-center text-green-600 transition-colors disabled:opacity-50"
                              title="অনুমোদন করুন"
                            >
                              {actionLoading[b._id] === 'approve' ? <FaSpinner size={11} className="animate-spin" /> : <FaCheck size={12} />}
                            </button>
                          )}
                          {b.status !== 'rejected' && (
                            <button
                              onClick={() => setRejectModal(b._id)}
                              className="w-7 h-7 bg-red-100 hover:bg-red-200 rounded-lg flex items-center justify-center text-red-500 transition-colors"
                              title="প্রত্যাখ্যান করুন"
                            >
                              <FaTimes size={12} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {biodatas.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">কোনো বায়োডেটা পাওয়া যায়নি</div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => fetchBiodatas(p)} className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-[#1a5276] text-white' : 'bg-white border hover:bg-gray-50 text-gray-600'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Biodata Detail Modal */}
      {viewModal && <BiodataDetailModal biodata={viewModal} onClose={() => setViewModal(null)} />}

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-gray-800 mb-4">প্রত্যাখ্যানের কারণ লিখুন</h3>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="কেন বায়োডেটা প্রত্যাখ্যান করা হচ্ছে তা লিখুন..."
              className="input-field h-32 resize-none mb-4"
            />
            <div className="flex gap-3">
              <button onClick={() => { setRejectModal(null); setRejectReason(''); }} className="flex-1 btn-outline py-2.5 rounded-xl">বাতিল</button>
              <button onClick={handleReject} disabled={actionLoading[rejectModal]} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl transition-colors disabled:opacity-50">
                {actionLoading[rejectModal] ? 'প্রক্রিয়াধীন...' : 'প্রত্যাখ্যান করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
