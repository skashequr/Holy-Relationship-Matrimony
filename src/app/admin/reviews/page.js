'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaStar, FaCheck, FaTrash, FaSpinner } from 'react-icons/fa';

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => { fetchReviews(1); }, [statusFilter]);

  const fetchReviews = async (pg) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getReviews({ page: pg, limit: 15, status: statusFilter || undefined });
      setReviews(data.reviews || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading((p) => ({ ...p, [id]: 'approve' }));
    try {
      await adminAPI.approveReview(id);
      toast.success('রিভিউ অনুমোদিত হয়েছে');
      setReviews((prev) => prev.map((r) => r._id === id ? { ...r, isApproved: true } : r));
    } catch { toast.error('সমস্যা হয়েছে'); }
    finally { setActionLoading((p) => ({ ...p, [id]: null })); }
  };

  const handleDelete = async (id) => {
    if (!confirm('রিভিউ মুছে ফেলবেন?')) return;
    setActionLoading((p) => ({ ...p, [id]: 'delete' }));
    try {
      await adminAPI.deleteReview(id);
      toast.success('রিভিউ মুছে ফেলা হয়েছে');
      setReviews((prev) => prev.filter((r) => r._id !== id));
      setTotal((t) => t - 1);
    } catch { toast.error('সমস্যা হয়েছে'); }
    finally { setActionLoading((p) => ({ ...p, [id]: null })); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">রিভিউ পরিচালনা</h1>
          <p className="text-sm text-gray-500">মোট {total} টি রিভিউ</p>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border p-4 flex gap-3">
          {[{ value: 'pending', label: 'অনুমোদনের অপেক্ষায়' }, { value: 'approved', label: 'অনুমোদিত' }, { value: '', label: 'সব' }].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${statusFilter === opt.value ? 'bg-[#1a5276] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {reviews.length === 0 && (
              <div className="bg-white rounded-xl border p-10 text-center text-gray-400 text-sm">কোনো রিভিউ নেই</div>
            )}
            {reviews.map((r) => (
              <div key={r._id} className="bg-white rounded-xl border p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <p className="font-semibold text-gray-800">{r.userName}</p>
                      {r.isMarried && <span className="text-xs bg-pink-100 text-pink-600 px-2 py-0.5 rounded-full">বিবাহিত</span>}
                      {r.marriedViaSite && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">এই সাইটে বিয়ে</span>}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${r.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                        {r.isApproved ? 'অনুমোদিত' : 'অপেক্ষমাণ'}
                      </span>
                    </div>
                    <div className="flex gap-0.5 mb-2">
                      {Array(5).fill(0).map((_, i) => <FaStar key={i} size={14} className={i < r.rating ? 'text-[#c9a84c]' : 'text-gray-200'} />)}
                    </div>
                    <p className="text-sm text-gray-600">"{r.comment}"</p>
                    <p className="text-xs text-gray-400 mt-2">{new Date(r.createdAt).toLocaleDateString('bn-BD')}</p>
                  </div>
                  <div className="flex gap-1.5 flex-shrink-0">
                    {!r.isApproved && (
                      <button
                        onClick={() => handleApprove(r._id)}
                        disabled={!!actionLoading[r._id]}
                        className="w-8 h-8 bg-green-100 hover:bg-green-200 text-green-600 rounded-lg flex items-center justify-center disabled:opacity-50"
                      >
                        {actionLoading[r._id] === 'approve' ? <FaSpinner size={12} className="animate-spin" /> : <FaCheck size={12} />}
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(r._id)}
                      disabled={!!actionLoading[r._id]}
                      className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-lg flex items-center justify-center disabled:opacity-50"
                    >
                      {actionLoading[r._id] === 'delete' ? <FaSpinner size={12} className="animate-spin" /> : <FaTrash size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => fetchReviews(p)} className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-[#1a5276] text-white' : 'bg-white border hover:bg-gray-50'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
