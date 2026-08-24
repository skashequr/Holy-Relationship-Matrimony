'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { ruqyahAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import toast from 'react-hot-toast';
import {
  FaMoon, FaCalendarAlt, FaClock, FaUser, FaPhone,
  FaCommentAlt, FaCheckCircle, FaSpinner, FaListAlt,
} from 'react-icons/fa';

const statusBn = { pending: 'অপেক্ষায়', confirmed: 'নিশ্চিত', cancelled: 'বাতিল' };
const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
}

export default function RuqyahPage() {
  const { user } = useAuth();
  const [slots, setSlots] = useState([]);
  const [myBookings, setMyBookings] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [form, setForm] = useState({ name: '', phone: '', problem: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [tab, setTab] = useState('book'); // 'book' | 'my'

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [slotsRes, bookingsRes] = await Promise.all([
          ruqyahAPI.getSlots(),
          ruqyahAPI.getMyBookings(),
        ]);
        setSlots(slotsRes.data.slots || []);
        setMyBookings(bookingsRes.data.bookings || []);
        // Pre-fill name/phone from user
        setForm((f) => ({
          ...f,
          name: user?.name || '',
          phone: user?.phone || '',
        }));
      } catch {
        toast.error('তথ্য লোড করা যায়নি।');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSlot) { toast.error('একটি স্লট বেছে নিন।'); return; }
    if (!form.name.trim() || !form.phone.trim() || !form.problem.trim()) {
      toast.error('সব তথ্য পূরণ করুন।'); return;
    }
    setSubmitting(true);
    try {
      await ruqyahAPI.book({ slotId: selectedSlot._id, ...form });
      setDone(true);
      // Refresh
      const [slotsRes, bookingsRes] = await Promise.all([ruqyahAPI.getSlots(), ruqyahAPI.getMyBookings()]);
      setSlots(slotsRes.data.slots || []);
      setMyBookings(bookingsRes.data.bookings || []);
    } catch (err) {
      toast.error(err.response?.data?.messageBn || 'বুকিং করা যায়নি।');
    } finally {
      setSubmitting(false);
    }
  };

  const availableSlots = slots.filter((s) => s.bookedCount < s.capacity);

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-5">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaMoon className="text-[#1a5276]" /> রুকাইয়া সেশন বুকিং
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">ইসলামিক রুকাইয়া সেশনের জন্য স্লট বুক করুন</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { key: 'book', label: 'স্লট বুক করুন', icon: <FaCalendarAlt size={12} /> },
            { key: 'my', label: 'আমার বুকিং', icon: <FaListAlt size={12} />, badge: myBookings.length },
          ].map((t) => (
            <button key={t.key} onClick={() => { setTab(t.key); setDone(false); }}
              className={`flex items-center gap-1.5 px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                tab === t.key
                  ? 'border-[#1a5276] text-[#1a5276]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.icon} {t.label}
              {t.badge > 0 && (
                <span className="ml-1 bg-[#1a5276] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-gray-400" size={24} /></div>
        ) : tab === 'book' ? (
          <>
            {done ? (
              /* Success */
              <div className="bg-white rounded-2xl border p-8 flex flex-col items-center gap-4 text-center">
                <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center">
                  <FaCheckCircle className="text-green-500" size={32} />
                </div>
                <div>
                  <p className="text-lg font-black text-gray-800">বুকিং সফল হয়েছে!</p>
                  <p className="text-sm text-gray-500 mt-1">অ্যাডমিন শীঘ্রই নিশ্চিত করবেন।</p>
                </div>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => { setDone(false); setSelectedSlot(null); setForm((f) => ({ ...f, problem: '' })); }}
                    className="px-5 py-2 border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50">
                    আরেকটি বুকিং
                  </button>
                  <button onClick={() => setTab('my')}
                    className="px-5 py-2 bg-[#1a5276] text-white rounded-xl text-sm font-semibold hover:bg-[#154360]">
                    আমার বুকিং দেখুন
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">

                {/* Slot selection */}
                <div className="bg-white rounded-2xl border p-5 space-y-3">
                  <p className="font-bold text-gray-800 text-sm">উপলব্ধ স্লট বেছে নিন *</p>
                  {availableSlots.length === 0 ? (
                    <p className="text-sm text-gray-500 py-4 text-center">এই মুহূর্তে কোনো স্লট উপলব্ধ নেই।<br />পরে আবার দেখুন।</p>
                  ) : (
                    <div className="grid gap-2">
                      {availableSlots.map((slot) => (
                        <button key={slot._id} type="button"
                          onClick={() => setSelectedSlot(slot)}
                          className={`w-full text-left p-3.5 rounded-xl border-2 transition-all ${
                            selectedSlot?._id === slot._id
                              ? 'border-[#1a5276] bg-blue-50'
                              : 'border-gray-200 hover:border-[#1a5276]/40'
                          }`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#1a5276] to-blue-600 flex items-center justify-center flex-shrink-0">
                                <FaCalendarAlt className="text-white" size={13} />
                              </div>
                              <div>
                                <p className="font-bold text-gray-800 text-sm">{formatDate(slot.date)}</p>
                                <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                  <FaClock size={10} /> {slot.time}
                                  {slot.note && <span className="ml-2 text-gray-400">• {slot.note}</span>}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-xs text-gray-500">{slot.capacity - slot.bookedCount} টি বাকি</p>
                              {selectedSlot?._id === slot._id && (
                                <FaCheckCircle className="text-[#1a5276] mt-1 ml-auto" size={14} />
                              )}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Form fields */}
                {availableSlots.length > 0 && (
                  <div className="bg-white rounded-2xl border p-5 space-y-4">
                    <p className="font-bold text-gray-800 text-sm">আপনার তথ্য</p>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">নাম *</label>
                      <div className="relative">
                        <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                          className="input-field pl-9" placeholder="আপনার নাম" required />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">ফোন নম্বর *</label>
                      <div className="relative">
                        <FaPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
                        <input value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                          className="input-field pl-9" placeholder="01XXXXXXXXX" type="tel" required />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-gray-500 mb-1 block">সমস্যার বিবরণ *</label>
                      <div className="relative">
                        <FaCommentAlt className="absolute left-3 top-3.5 text-gray-400" size={12} />
                        <textarea value={form.problem} onChange={(e) => setForm((f) => ({ ...f, problem: e.target.value }))}
                          className="input-field pl-9 h-28 resize-none"
                          placeholder="আপনি কী সমস্যায় ভুগছেন তা বিস্তারিত লিখুন..." required />
                      </div>
                    </div>

                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">
                      <strong>পেমেন্ট:</strong> বুকিং নিশ্চিত হওয়ার পর অ্যাডমিন আপনার সাথে যোগাযোগ করবেন এবং পেমেন্টের বিবরণ জানাবেন।
                    </div>

                    <button type="submit" disabled={submitting || !selectedSlot}
                      className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                      {submitting ? <FaSpinner size={13} className="animate-spin" /> : <FaMoon size={13} />}
                      বুকিং নিশ্চিত করুন
                    </button>
                  </div>
                )}
              </form>
            )}
          </>
        ) : (
          /* My bookings tab */
          <div className="space-y-3">
            {myBookings.length === 0 ? (
              <div className="bg-white rounded-2xl border p-8 text-center text-gray-500">
                <FaMoon size={32} className="mx-auto mb-3 text-gray-300" />
                <p className="font-semibold">এখনো কোনো বুকিং নেই</p>
                <button onClick={() => setTab('book')} className="mt-3 text-sm text-[#1a5276] font-semibold hover:underline">
                  স্লট বুক করুন →
                </button>
              </div>
            ) : (
              myBookings.map((b) => (
                <div key={b._id} className="bg-white rounded-xl border p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-bold text-gray-800 text-sm">
                        {b.slotId ? formatDate(b.slotId.date) : 'তারিখ অজানা'}
                      </p>
                      {b.slotId && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                          <FaClock size={10} /> {b.slotId.time}
                        </p>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-1.5">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[b.status]}`}>
                        {statusBn[b.status]}
                      </span>
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                        {b.paymentStatus === 'paid' ? '💰 পেমেন্ট হয়েছে' : '⏳ পেমেন্ট বাকি'}
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 bg-gray-50 rounded-lg p-2">{b.problem}</p>
                  {b.adminNote && (
                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-2">
                      <p className="text-xs text-blue-700"><strong>অ্যাডমিন নোট:</strong> {b.adminNote}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
