'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { userAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaBell, FaCheckDouble } from 'react-icons/fa';
import toast from 'react-hot-toast';

const typeIcon = {
  profile_viewed: '👁️', shortlisted: '❤️', contact_unlocked: '🔓',
  biodata_approved: '✅', biodata_rejected: '❌', payment_success: '💳',
  new_match: '💫', system: '📢',
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchNotifications(1); }, []);

  const fetchNotifications = async (pg) => {
    setLoading(true);
    try {
      const { data } = await userAPI.getNotifications({ page: pg, limit: 20 });
      if (pg === 1) setNotifications(data.notifications || []);
      else setNotifications((prev) => [...prev, ...(data.notifications || [])]);
      setUnreadCount(data.unreadCount || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  };

  const handleMarkAllRead = async () => {
    try {
      await userAPI.markAllRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
      toast.success('সব বিজ্ঞপ্তি পড়া হয়েছে।');
    } catch {}
  };

  const handleMarkRead = async (id) => {
    try {
      await userAPI.markRead(id);
      setNotifications((prev) => prev.map((n) => n._id === id ? { ...n, isRead: true } : n));
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {}
  };

  if (loading && notifications.length === 0) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <FaBell className="text-[#1a5276]" /> বিজ্ঞপ্তি
            </h1>
            {unreadCount > 0 && <p className="text-sm text-gray-500 mt-0.5">{unreadCount} টি অপঠিত</p>}
          </div>
          {unreadCount > 0 && (
            <button onClick={handleMarkAllRead} className="flex items-center gap-2 text-sm text-[#1a5276] font-medium hover:underline">
              <FaCheckDouble size={13} /> সব পড়া হিসেবে চিহ্নিত করুন
            </button>
          )}
        </div>

        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              className={`bg-white rounded-xl border p-4 flex items-start gap-4 cursor-pointer transition-all hover:shadow-sm ${!n.isRead ? 'border-[#1a5276]/20 bg-blue-50/30' : ''}`}
            >
              <span className="text-2xl flex-shrink-0">{typeIcon[n.type] || '📬'}</span>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium text-gray-800 ${!n.isRead ? 'font-semibold' : ''}`}>
                  {n.titleBn || n.title}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">{n.messageBn || n.message}</p>
                <p className="text-xs text-gray-400 mt-1.5">{new Date(n.createdAt).toLocaleDateString('bn-BD', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
              </div>
              {!n.isRead && <div className="w-2.5 h-2.5 bg-[#1a5276] rounded-full flex-shrink-0 mt-1" />}
            </div>
          ))}
          {notifications.length === 0 && (
            <div className="bg-white rounded-xl border text-center py-16">
              <FaBell className="mx-auto text-gray-300 mb-3" size={40} />
              <p className="text-gray-500">কোনো বিজ্ঞপ্তি নেই</p>
            </div>
          )}
        </div>

        {page < totalPages && (
          <div className="text-center mt-5">
            <button onClick={() => fetchNotifications(page + 1)} disabled={loading} className="btn-outline px-6 py-2.5 rounded-xl text-sm">
              {loading ? 'লোড হচ্ছে...' : 'আরো দেখুন'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
