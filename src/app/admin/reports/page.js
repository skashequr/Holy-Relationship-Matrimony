'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaFlag, FaSpinner } from 'react-icons/fa';

const reasonLabel = {
  fake_profile: 'ভুয়া প্রোফাইল', inappropriate_content: 'অনুপযুক্ত বিষয়',
  harassment: 'হয়রানি', spam: 'স্প্যাম', scam: 'প্রতারণা', other: 'অন্যান্য',
};

export default function AdminReportsPage() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('pending');
  const [resolveModal, setResolveModal] = useState(null);
  const [adminNote, setAdminNote] = useState('');
  const [resolveAction, setResolveAction] = useState('dismiss');
  const [actionLoading, setActionLoading] = useState({});

  useEffect(() => { fetchReports(1); }, [filterStatus]);

  const fetchReports = async (pg) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getReports({ page: pg, limit: 15, status: filterStatus || undefined });
      setReports(data.reports || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  };

  const handleResolve = async () => {
    const id = resolveModal;
    setActionLoading((p) => ({ ...p, [id]: true }));
    try {
      await adminAPI.resolveReport(id, { action: resolveAction, adminNote });
      toast.success('অভিযোগ নিষ্পত্তি হয়েছে');
      setReports((prev) => prev.map((r) => r._id === id ? { ...r, status: 'resolved' } : r));
      setResolveModal(null); setAdminNote(''); setResolveAction('dismiss');
    } catch { toast.error('সমস্যা হয়েছে।'); }
    finally { setActionLoading((p) => ({ ...p, [id]: false })); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FaFlag className="text-red-500" /> অভিযোগ পরিচালনা</h1>
          <p className="text-sm text-gray-500">মোট {total} টি অভিযোগ</p>
        </div>

        <div className="bg-white rounded-xl border p-4">
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="input-field text-sm py-2 w-40">
            <option value="">সব</option>
            <option value="pending">মুলতুবি</option>
            <option value="resolved">নিষ্পত্তি</option>
            <option value="dismissed">বাতিল</option>
          </select>
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {reports.map((r) => (
              <div key={r._id} className={`bg-white rounded-xl border p-4 ${r.status === 'pending' ? 'border-red-200' : ''}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="text-xs font-semibold bg-red-100 text-red-700 px-2.5 py-1 rounded-full">
                        {reasonLabel[r.reason] || r.reason}
                      </span>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        r.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        r.status === 'resolved' ? 'bg-green-100 text-green-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {r.status === 'pending' ? 'মুলতুবি' : r.status === 'resolved' ? 'নিষ্পত্তি' : 'বাতিল'}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">{r.reportedBy?.name}</span> অভিযোগ করেছেন{' '}
                      <span className="font-medium text-red-600">{r.reportedUser?.name}</span> এর বিরুদ্ধে
                    </p>
                    {r.description && <p className="text-xs text-gray-500 mt-1 italic">"{r.description}"</p>}
                    <p className="text-xs text-gray-400 mt-1">{new Date(r.createdAt).toLocaleDateString('bn-BD')}</p>
                  </div>
                  {r.status === 'pending' && (
                    <button onClick={() => setResolveModal(r._id)} className="btn-primary text-xs px-4 py-2 rounded-lg flex-shrink-0">
                      নিষ্পত্তি করুন
                    </button>
                  )}
                </div>
              </div>
            ))}
            {reports.length === 0 && <div className="bg-white rounded-xl border text-center py-10 text-gray-400 text-sm">কোনো অভিযোগ নেই</div>}
          </div>
        )}
      </div>

      {/* Resolve Modal */}
      {resolveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 space-y-4">
            <h3 className="font-bold text-gray-800">অভিযোগ নিষ্পত্তি করুন</h3>
            <div>
              <label className="label">অ্যাকশন বেছে নিন</label>
              <div className="flex gap-3">
                {[
                  { value: 'dismiss', label: 'বাতিল করুন' },
                  { value: 'ban_user', label: 'অভিযুক্তকে নিষিদ্ধ করুন' },
                ].map((opt) => (
                  <label key={opt.value} className={`flex-1 flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition-all ${resolveAction === opt.value ? 'border-[#1a5276] bg-[#1a5276]/5' : 'border-gray-200'}`}>
                    <input type="radio" name="action" value={opt.value} checked={resolveAction === opt.value} onChange={(e) => setResolveAction(e.target.value)} className="accent-[#1a5276]" />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <label className="label">অ্যাডমিন নোট</label>
              <textarea value={adminNote} onChange={(e) => setAdminNote(e.target.value)} placeholder="নোট লিখুন (ঐচ্ছিক)..." className="input-field h-24 resize-none" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => { setResolveModal(null); setAdminNote(''); }} className="flex-1 btn-outline py-2.5 rounded-xl">বাতিল</button>
              <button onClick={handleResolve} disabled={actionLoading[resolveModal]} className="flex-1 btn-primary py-2.5 rounded-xl flex items-center justify-center gap-2">
                {actionLoading[resolveModal] ? <><FaSpinner className="animate-spin" /> প্রক্রিয়াধীন...</> : 'নিশ্চিত করুন'}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
