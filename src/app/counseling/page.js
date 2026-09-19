'use client';

import { useEffect, useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { counselingAPI } from '@/lib/api';
import toast from 'react-hot-toast';

const statuses = { pending: 'অপেক্ষায়', confirmed: 'নিশ্চিত', completed: 'সম্পন্ন', cancelled: 'বাতিল' };
const inputClass = 'w-full border border-gray-200 rounded-xl p-3 mt-1 bg-white focus:outline-none focus:ring-2 focus:ring-blue-600';

export default function CounselingPage() {
  const { user } = useAuth();
  const [types, setTypes] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ counselingType: '', name: '', phone: '', preferredDate: '', preferredTime: '', note: '' });
  useEffect(() => {
    if (!user) return;
    setForm(f => ({ ...f, name: f.name || user.name || '', phone: f.phone || user.phone || '' }));
    Promise.all([counselingAPI.types(), counselingAPI.myBookings()])
      .then(([a, b]) => { setTypes(a.data.types); setBookings(b.data.bookings); })
      .catch(() => setError(true)).finally(() => setLoading(false));
  }, [user]);
  const change = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  const submit = async e => {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    try {
      const { data } = await counselingAPI.book(form);
      setBookings(b => [data.booking, ...b]);
      setForm(f => ({ ...f, counselingType: '', preferredDate: '', preferredTime: '', note: '' }));
      toast.success('বুকিং অনুরোধ জমা হয়েছে। সময় নিশ্চিত করতে আমরা যোগাযোগ করব।');
    } catch (err) { toast.error(err.response?.data?.messageBn || 'বুকিং হয়নি। আবার চেষ্টা করুন।'); }
    finally { setSaving(false); }
  };
  return <DashboardLayout><div className="max-w-3xl mx-auto space-y-6">
    <div><h1 className="text-2xl font-bold text-gray-800">Book a Counseling Session</h1><p className="text-gray-500 mt-2">কাউন্সেলিংয়ের ধরন ও পছন্দের সময় জানান। যোগাযোগ করে সেশন নিশ্চিত করা হবে।</p></div>
    {loading ? <p role="status">লোড হচ্ছে…</p> : error ? <p role="alert" className="card text-red-700">তথ্য লোড হয়নি। পেজ রিফ্রেশ করে আবার চেষ্টা করুন।</p> : <>
      <form onSubmit={submit} className="card space-y-5">
        <label className="block font-semibold">Counseling Type
          <select name="counselingType" required value={form.counselingType} onChange={change} className={inputClass}>
            <option value="">কাউন্সেলিংয়ের ধরন নির্বাচন করুন</option>
            {types.map(t => <option key={t.value} value={t.value}>{t.label} — {t.labelBn}</option>)}
          </select>
        </label>
        <div className="grid sm:grid-cols-2 gap-4">
          <label>নাম<input name="name" autoComplete="name" required maxLength={100} value={form.name} onChange={change} className={inputClass} /></label>
          <label>ফোন নম্বর<input type="tel" name="phone" autoComplete="tel" required maxLength={20} value={form.phone} onChange={change} className={inputClass} /></label>
          <label>পছন্দের তারিখ<input type="date" name="preferredDate" required value={form.preferredDate} onChange={change} className={inputClass} /></label>
          <label>পছন্দের সময় (বাংলাদেশ)<input type="time" name="preferredTime" required value={form.preferredTime} onChange={change} className={inputClass} /></label>
        </div>
        <label className="block">কী বিষয়ে আলোচনা করতে চান? (ঐচ্ছিক)<textarea name="note" rows={4} maxLength={2000} value={form.note} onChange={change} className={inputClass} /></label>
        <button disabled={saving} className="btn-primary px-6 py-3 rounded-xl disabled:opacity-50">{saving ? 'জমা হচ্ছে…' : 'বুকিং অনুরোধ জমা দিন'}</button>
      </form>
      <section className="space-y-3"><h2 className="text-lg font-bold">আমার বুকিং</h2>
        {!bookings.length && <p className="card text-gray-500">এখনও কোনো কাউন্সেলিং বুকিং নেই।</p>}
        {bookings.map(b => <article key={b._id} className="card"><div className="flex flex-wrap justify-between gap-2"><h3 className="font-semibold">{types.find(t => t.value === b.counselingType)?.labelBn || b.counselingType}</h3><span className="text-sm text-blue-800">{statuses[b.status]}</span></div><p className="text-sm text-gray-500 mt-2">{b.preferredDate} · {b.preferredTime} (বাংলাদেশ সময়)</p>{b.status === 'pending' && <p className="text-sm mt-2">এটি পছন্দের সময়; এখনও নিশ্চিত হয়নি।</p>}</article>)}
      </section>
    </>}
  </div></DashboardLayout>;
}
