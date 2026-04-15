'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { paymentAPI } from '@/lib/api';
import { formatDate, formatCurrency } from '@/lib/utils';
import { FaCreditCard, FaCheckCircle, FaTimesCircle, FaClock, FaEye } from 'react-icons/fa';
import LoadingSpinner from '@/components/LoadingSpinner';

const statusBadge = {
  completed: { icon: <FaCheckCircle />, text: 'সফল', class: 'text-green-600 bg-green-50' },
  pending: { icon: <FaClock />, text: 'অপেক্ষারত', class: 'text-yellow-600 bg-yellow-50' },
  failed: { icon: <FaTimesCircle />, text: 'ব্যর্থ', class: 'text-red-600 bg-red-50' },
};

const methodLabel = { bkash: 'bKash', nagad: 'Nagad', rocket: 'Rocket', card: 'Card' };

export default function PaymentsPage() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);

  useEffect(() => { fetchPayments(1); }, []);

  const fetchPayments = async (pg) => {
    setLoading(true);
    try {
      const { data } = await paymentAPI.getHistory({ page: pg, limit: 10 });
      if (pg === 1) setPayments(data.payments || []);
      else setPayments((prev) => [...prev, ...(data.payments || [])]);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      if (pg === 1) {
        const spent = (data.payments || []).filter((p) => p.status === 'completed').reduce((s, p) => s + p.amount, 0);
        setTotalSpent(spent);
      }
    } catch {}
    finally { setLoading(false); }
  };

  if (loading && payments.length === 0) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaCreditCard className="text-[#1a5276]" /> পেমেন্ট ইতিহাস
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">মোট {total} টি পেমেন্ট</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
          {[
            { label: 'মোট পেমেন্ট', value: total },
            { label: 'মোট খরচ', value: `৳${totalSpent}` },
            { label: 'আনলক করা', value: payments.filter((p) => p.status === 'completed').length },
          ].map((s) => (
            <div key={s.label} className="card text-center py-4">
              <div className="text-xl font-bold text-[#1a5276]">{s.value}</div>
              <div className="text-xs text-gray-500 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Payment table */}
        {payments.length === 0 ? (
          <div className="card text-center py-16">
            <FaCreditCard className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500">এখনো কোনো পেমেন্ট নেই</p>
            <p className="text-gray-400 text-sm mt-1 mb-4">কোনো প্রোফাইলের যোগাযোগ তথ্য আনলক করুন।</p>
            <Link href="/search" className="btn-primary inline-block px-6 py-2.5 rounded-xl text-sm">প্রোফাইল খুঁজুন</Link>
          </div>
        ) : (
          <div className="card overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-header text-left">প্রোফাইল</th>
                    <th className="table-header">পেমেন্ট পদ্ধতি</th>
                    <th className="table-header">পরিমাণ</th>
                    <th className="table-header">স্ট্যাটাস</th>
                    <th className="table-header">তারিখ</th>
                    <th className="table-header">অ্যাকশন</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((payment) => {
                    const badge = statusBadge[payment.status] || statusBadge.pending;
                    return (
                      <tr key={payment._id} className="hover:bg-gray-50 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                              {payment.targetUserId?.profilePicture ? (
                                <Image src={payment.targetUserId.profilePicture} alt="" width={36} height={36} className="object-cover" />
                              ) : (
                                <span className="text-lg">{payment.targetUserId?.gender === 'male' ? '👨' : '👩'}</span>
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-800 truncate max-w-[120px]">
                              {payment.targetUserId?.name || 'অজানা'}
                            </span>
                          </div>
                        </td>
                        <td className="table-cell text-center">
                          <span className="text-xs font-semibold bg-gray-100 px-2.5 py-1 rounded-full">
                            {methodLabel[payment.paymentMethod] || payment.paymentMethod}
                          </span>
                        </td>
                        <td className="table-cell text-center font-bold text-[#1a5276]">৳{payment.amount}</td>
                        <td className="table-cell text-center">
                          <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.class}`}>
                            {badge.icon} {badge.text}
                          </span>
                        </td>
                        <td className="table-cell text-center text-xs text-gray-500">
                          {new Date(payment.createdAt).toLocaleDateString('bn-BD')}
                        </td>
                        <td className="table-cell text-center">
                          {payment.status === 'completed' && (
                            <Link href={`/profile/${payment.targetUserId?._id}`} className="inline-flex items-center gap-1 text-xs text-[#1a5276] font-medium hover:underline">
                              <FaEye size={11} /> দেখুন
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {page < totalPages && (
          <div className="text-center mt-6">
            <button onClick={() => { const next = page + 1; setPage(next); fetchPayments(next); }} disabled={loading} className="btn-outline px-8 py-3 rounded-xl">
              {loading ? 'লোড হচ্ছে...' : 'আরো দেখুন'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
