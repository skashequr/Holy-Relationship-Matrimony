'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { counselingAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
const statuses = { pending: 'অপেক্ষায়', confirmed: 'নিশ্চিত', completed: 'সম্পন্ন', cancelled: 'বাতিল' };

export default function AdminCounselingPage() {
  const { isAdmin } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState({});
  useEffect(() => {
    if (!isAdmin) return;
    Promise.all([counselingAPI.adminBookings(), counselingAPI.types()]).then(([a, b]) => {
      setBookings(a.data.bookings); setTypes(b.data.types);
    }).catch(() => setError(true)).finally(() => setLoading(false));
  }, [isAdmin]);
  const update = async (id, status) => {
    setBusy(b => ({ ...b, [id]: true }));
    try {
      const { data } = await counselingAPI.update(id, status);
      setBookings(bs => bs.map(b => b._id === id ? data.booking : b));
      toast.success('স্ট্যাটাস সংরক্ষণ হয়েছে।');
    } catch { toast.error('স্ট্যাটাস পরিবর্তন হয়নি।'); }
    finally { setBusy(b => ({ ...b, [id]: false })); }
  };
  return <AdminLayout><div className="max-w-4xl mx-auto space-y-4"><h1 className="text-2xl font-bold">কাউন্সেলিং বুকিং</h1><p className="text-gray-500">সর্বশেষ ২০০টি অনুরোধ। সদস্যের সঙ্গে সময় নিশ্চিত করে স্ট্যাটাস পরিবর্তন করুন।</p>
    {loading ? <p role="status">লোড হচ্ছে…</p> : error ? <p role="alert">বুকিং লোড হয়নি। পেজ রিফ্রেশ করুন।</p> : !bookings.length ? <p className="card">কোনো বুকিং নেই।</p> : bookings.map(b => <article key={b._id} className="card space-y-2">
      <h2 className="font-bold">{types.find(t => t.value === b.counselingType)?.labelBn || b.counselingType}</h2>
      <p>{b.name} · {b.phone}</p><p className="text-sm text-gray-500">পছন্দের সময়: {b.preferredDate} · {b.preferredTime} (বাংলাদেশ)</p>
      {b.note && <p className="whitespace-pre-wrap break-words">{b.note}</p>}
      <label className="block">স্ট্যাটাস <select value={b.status} disabled={busy[b._id]} onChange={e => update(b._id, e.target.value)} className="border rounded-lg p-2 ml-2">{Object.entries(statuses).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </article>)}
  </div></AdminLayout>;
}
