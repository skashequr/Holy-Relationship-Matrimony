'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaCreditCard, FaCheck, FaTimes, FaSpinner } from 'react-icons/fa';

const statusBadge = {
  completed: 'bg-green-100 text-green-700',
  pending:   'bg-yellow-100 text-yellow-700',
  failed:    'bg-red-100 text-red-600',
  refunded:  'bg-gray-100 text-gray-600',
};
const statusLabel = { completed: 'সফল', pending: 'অপেক্ষারত', failed: 'ব্যর্থ', refunded: 'ফেরত' };
const methodLabel  = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', card: 'Card' };

export default function AdminPaymentsPage() {
  const [payments, setPayments]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [page, setPage]                 = useState(1);
  const [totalPages, setTotalPages]     = useState(1);
  const [total, setTotal]               = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterMethod, setFilterMethod] = useState('');
  const [actionLoading, setActionLoading] = useState({});
  const [rejectModal, setRejectModal]   = useState(null); // payment object
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => { fetchPayments(1); }, [filterStatus, filterMethod]);

  const fetchPayments = async (pg) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getPayments({
        page: pg, limit: 20,
        status: filterStatus || undefined,
        method: filterMethod || undefined,
      });
      setPayments(data.payments || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pg);
      if (pg === 1) {
        const rev = (data.payments || [])
          .filter((p) => p.status === 'completed')
          .reduce((s, p) => s + p.amount, 0);
        setTotalRevenue(rev);
      }
    } catch {}
    finally { setLoading(false); }
  };

  const handleApprove = async (id) => {
    setActionLoading((prev) => ({ ...prev, [id]: 'approve' }));
    try {
      await adminAPI.approvePayment(id);
      toast.success('পেমেন্ট অনুমোদিত হয়েছে। যোগাযোগ আনলক হয়েছে।');
      setPayments((prev) => prev.map((p) => p._id === id ? { ...p, status: 'completed' } : p));
    } catch (err) {
      toast.error(err.response?.data?.messageBn || 'সমস্যা হয়েছে।');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    const id = rejectModal._id;
    setActionLoading((prev) => ({ ...prev, [id]: 'reject' }));
    try {
      await adminAPI.rejectPayment(id, rejectReason);
      toast.success('পেমেন্ট প্রত্যাখ্যাত হয়েছে।');
      setPayments((prev) => prev.map((p) => p._id === id ? { ...p, status: 'failed' } : p));
      setRejectModal(null);
      setRejectReason('');
    } catch (err) {
      toast.error(err.response?.data?.messageBn || 'সমস্যা হয়েছে।');
    } finally {
      setActionLoading((prev) => ({ ...prev, [id]: null }));
    }
  };

  const pendingCount = payments.filter((p) => p.status === 'pending').length;

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaCreditCard className="text-[#1a5276]" /> পেমেন্ট পরিচালনা
            </h1>
            <p className="text-sm text-gray-500">মোট {total} টি পেমেন্ট · রাজস্ব: ৳{totalRevenue}</p>
          </div>
          {pendingCount > 0 && (
            <span className="inline-flex items-center gap-1.5 bg-yellow-100 text-yellow-700 text-sm font-semibold px-3 py-1.5 rounded-full">
              <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
              {pendingCount}টি যাচাই বাকি
            </span>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border p-4 flex flex-wrap gap-3">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field text-sm py-2 w-40">
            <option value="">সব স্ট্যাটাস</option>
            <option value="pending">অপেক্ষারত</option>
            <option value="completed">সফল</option>
            <option value="failed">ব্যর্থ</option>
          </select>
          <select value={filterMethod} onChange={(e) => setFilterMethod(e.target.value)} className="input-field text-sm py-2 w-36">
            <option value="">সব পদ্ধতি</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
          </select>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-header text-left">ইনভয়েস</th>
                    <th className="table-header text-left">পেয়ার</th>
                    <th className="table-header">প্রোফাইল</th>
                    <th className="table-header">পদ্ধতি / TrxID</th>
                    <th className="table-header">পরিমাণ</th>
                    <th className="table-header">স্ট্যাটাস</th>
                    <th className="table-header">তারিখ</th>
                    <th className="table-header">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id} className={`hover:bg-gray-50 transition-colors ${p.status === 'pending' ? 'bg-yellow-50/40' : ''}`}>
                      <td className="table-cell text-xs font-mono text-gray-500">{p.invoiceNumber}</td>
                      <td className="table-cell">
                        <p className="text-xs font-medium text-gray-800">{p.payerId?.name}</p>
                        <p className="text-xs text-gray-400">{p.payerPhone || p.payerId?.phone}</p>
                      </td>
                      <td className="table-cell text-xs text-gray-600 text-center">{p.targetUserId?.name || '—'}</td>
                      <td className="table-cell text-center">
                        <span className="text-xs font-semibold bg-gray-100 px-2 py-0.5 rounded-full block mb-1">
                          {methodLabel[p.paymentMethod] || p.paymentMethod}
                        </span>
                        {p.transactionId && (
                          <span className="text-xs font-mono text-gray-400">{p.transactionId}</span>
                        )}
                      </td>
                      <td className="table-cell text-center font-bold text-[#1a5276]">৳{p.amount}</td>
                      <td className="table-cell text-center">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusBadge[p.status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabel[p.status] || p.status}
                        </span>
                      </td>
                      <td className="table-cell text-center text-xs text-gray-400">
                        {new Date(p.createdAt).toLocaleDateString('bn-BD')}
                      </td>
                      <td className="table-cell text-center">
                        {p.status === 'pending' ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              onClick={() => handleApprove(p._id)}
                              disabled={!!actionLoading[p._id]}
                              className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {actionLoading[p._id] === 'approve'
                                ? <FaSpinner className="animate-spin" size={10} />
                                : <FaCheck size={10} />}
                              অনুমোদন
                            </button>
                            <button
                              onClick={() => { setRejectModal(p); setRejectReason(''); }}
                              disabled={!!actionLoading[p._id]}
                              className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                            >
                              {actionLoading[p._id] === 'reject'
                                ? <FaSpinner className="animate-spin" size={10} />
                                : <FaTimes size={10} />}
                              প্রত্যাখ্যান
                            </button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {payments.length === 0 && (
              <div className="text-center py-10 text-gray-400 text-sm">কোনো পেমেন্ট পাওয়া যায়নি</div>
            )}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => fetchPayments(p)}
                className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${p === page ? 'bg-[#1a5276] text-white' : 'bg-white border hover:bg-gray-50 text-gray-600'}`}
              >
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Reject confirmation modal */}
      {rejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setRejectModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-gray-800 text-base mb-1">পেমেন্ট প্রত্যাখ্যান করুন</h3>
            <p className="text-xs text-gray-500 mb-4">
              TrxID: <span className="font-mono font-medium">{rejectModal.transactionId}</span>
              {' · '}{rejectModal.payerId?.name}
            </p>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-gray-600 mb-1.5">কারণ (ঐচ্ছিক)</label>
              <input
                type="text"
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="যেমন: ট্রানজেকশন আইডি মিলছে না"
                className="input-field text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button onClick={() => setRejectModal(null)} className="flex-1 btn-outline py-2.5 rounded-xl text-sm">
                বাতিল
              </button>
              <button
                onClick={handleReject}
                disabled={!!actionLoading[rejectModal._id]}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-xl text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
              >
                {actionLoading[rejectModal._id] === 'reject'
                  ? <FaSpinner className="animate-spin" size={13} />
                  : <FaTimes size={13} />}
                প্রত্যাখ্যান করুন
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
