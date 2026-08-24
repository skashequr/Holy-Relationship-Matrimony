'use client';

import { useState, useEffect, useCallback } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import {
  FaMoon, FaCalendarAlt, FaClock, FaPlus, FaTrash,
  FaCheckCircle, FaTimesCircle, FaSpinner, FaUser,
  FaPhone, FaStickyNote, FaToggleOn, FaToggleOff,
  FaMoneyBillWave,
} from 'react-icons/fa';

const statusBn = { pending: 'অপেক্ষায়', confirmed: 'নিশ্চিত', cancelled: 'বাতিল' };
const statusColor = {
  pending: 'bg-amber-100 text-amber-700',
  confirmed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

function formatDate(d) {
  return new Date(d).toLocaleDateString('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'short' });
}

// ── Note editor inline ──────────────────────────────────────────────────
function NoteEditor({ bookingId, current, onSave }) {
  const [note, setNote] = useState(current || '');
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);

  const save = async () => {
    setLoading(true);
    try {
      await adminAPI.addRuqyahNote(bookingId, note);
      onSave(note);
      setEditing(false);
      toast.success('নোট সংরক্ষণ হয়েছে।');
    } catch { toast.error('সংরক্ষণ হয়নি।'); }
    finally { setLoading(false); }
  };

  if (!editing) {
    return (
      <button onClick={() => setEditing(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:underline">
        <FaStickyNote size={10} /> {current ? 'নোট সম্পাদনা' : 'নোট যোগ করুন'}
      </button>
    );
  }
  return (
    <div className="mt-2 space-y-2">
      <textarea value={note} onChange={(e) => setNote(e.target.value)}
        className="w-full text-xs border border-gray-200 rounded-lg p-2 h-16 resize-none focus:outline-none focus:border-[#1a5276]"
        placeholder="অ্যাডমিন নোট..." />
      <div className="flex gap-2">
        <button onClick={save} disabled={loading}
          className="text-xs bg-[#1a5276] text-white px-3 py-1.5 rounded-lg disabled:opacity-60 flex items-center gap-1">
          {loading ? <FaSpinner size={10} className="animate-spin" /> : null} সংরক্ষণ
        </button>
        <button onClick={() => setEditing(false)} className="text-xs text-gray-500 px-3 py-1.5 rounded-lg hover:bg-gray-100">
          বাতিল
        </button>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════
export default function AdminRuqyahPage() {
  const [tab, setTab] = useState('bookings'); // 'bookings' | 'slots'
  const [slots, setSlots] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [total, setTotal] = useState(0);
  const [filterStatus, setFilterStatus] = useState('all');
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});

  // New slot form
  const [newSlot, setNewSlot] = useState({ date: '', time: '', capacity: 1, note: '' });
  const [slotLoading, setSlotLoading] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getRuqyahBookings({ status: filterStatus });
      setBookings(data.bookings || []);
      setTotal(data.total || 0);
    } catch { toast.error('বুকিং লোড হয়নি।'); }
    finally { setLoading(false); }
  }, [filterStatus]);

  const loadSlots = useCallback(async () => {
    try {
      const { data } = await adminAPI.getRuqyahSlots();
      setSlots(data.slots || []);
    } catch { toast.error('স্লট লোড হয়নি।'); }
  }, []);

  useEffect(() => {
    loadSlots();
    loadBookings();
  }, [loadSlots, loadBookings]);

  // ── Slot actions ─────────────────────────────────────────────
  const handleCreateSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.date || !newSlot.time) { toast.error('তারিখ ও সময় দিন।'); return; }
    setSlotLoading(true);
    try {
      const { data } = await adminAPI.createRuqyahSlot(newSlot);
      setSlots((prev) => [...prev, data.slot].sort((a, b) => new Date(a.date) - new Date(b.date)));
      setNewSlot({ date: '', time: '', capacity: 1, note: '' });
      toast.success('স্লট তৈরি হয়েছে।');
    } catch { toast.error('স্লট তৈরি হয়নি।'); }
    finally { setSlotLoading(false); }
  };

  const handleDeleteSlot = async (id) => {
    if (!confirm('এই স্লট মুছে দেবেন? সংশ্লিষ্ট বুকিংগুলো বাতিল হয়ে যাবে।')) return;
    try {
      await adminAPI.deleteRuqyahSlot(id);
      setSlots((prev) => prev.filter((s) => s._id !== id));
      toast.success('স্লট মুছে গেছে।');
    } catch { toast.error('মোছা যায়নি।'); }
  };

  const handleToggleSlot = async (id) => {
    try {
      const { data } = await adminAPI.toggleRuqyahSlot(id);
      setSlots((prev) => prev.map((s) => s._id === id ? data.slot : s));
    } catch { toast.error('আপডেট হয়নি।'); }
  };

  // ── Booking actions ──────────────────────────────────────────
  const setAL = (id, val) => setActionLoading((p) => ({ ...p, [id]: val }));

  const handleConfirm = async (id) => {
    setAL(id, 'confirm');
    try {
      await adminAPI.confirmRuqyahBooking(id);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'confirmed' } : b));
      toast.success('নিশ্চিত করা হয়েছে।');
    } catch { toast.error('আপডেট হয়নি।'); }
    finally { setAL(id, null); }
  };

  const handleCancel = async (id) => {
    if (!confirm('এই বুকিং বাতিল করবেন?')) return;
    setAL(id, 'cancel');
    try {
      await adminAPI.cancelRuqyahBooking(id);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, status: 'cancelled' } : b));
      toast.success('বাতিল করা হয়েছে।');
    } catch { toast.error('আপডেট হয়নি।'); }
    finally { setAL(id, null); }
  };

  const handlePayment = async (id, current) => {
    const next = current === 'paid' ? 'pending' : 'paid';
    try {
      await adminAPI.updateRuqyahPayment(id, next);
      setBookings((prev) => prev.map((b) => b._id === id ? { ...b, paymentStatus: next } : b));
      toast.success(next === 'paid' ? 'পেমেন্ট পাওয়া গেছে।' : 'পেমেন্ট বাকি করা হয়েছে।');
    } catch { toast.error('আপডেট হয়নি।'); }
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
              <FaMoon className="text-[#1a5276]" /> রুকাইয়া ম্যানেজমেন্ট
            </h1>
            <p className="text-sm text-gray-500">স্লট ও বুকিং পরিচালনা করুন</p>
          </div>
          <div className="bg-[#1a5276]/10 rounded-xl px-4 py-2 text-center">
            <p className="text-xl font-black text-[#1a5276]">{total}</p>
            <p className="text-xs text-gray-500">মোট বুকিং</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { key: 'bookings', label: 'সব বুকিং' },
            { key: 'slots', label: 'স্লট ব্যবস্থাপনা' },
          ].map((t) => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                tab === t.key
                  ? 'border-[#1a5276] text-[#1a5276]'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* ── BOOKINGS TAB ── */}
        {tab === 'bookings' && (
          <>
            {/* Filter */}
            <div className="flex gap-2 flex-wrap">
              {[
                { value: 'all', label: 'সব' },
                { value: 'pending', label: 'অপেক্ষায়' },
                { value: 'confirmed', label: 'নিশ্চিত' },
                { value: 'cancelled', label: 'বাতিল' },
              ].map((opt) => (
                <button key={opt.value} onClick={() => setFilterStatus(opt.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                    filterStatus === opt.value
                      ? 'bg-[#1a5276] text-white border-[#1a5276]'
                      : 'bg-white text-gray-600 border-gray-200 hover:border-[#1a5276]'
                  }`}>
                  {opt.label}
                </button>
              ))}
            </div>

            {loading ? (
              <div className="flex justify-center py-16"><FaSpinner className="animate-spin text-gray-400" size={24} /></div>
            ) : bookings.length === 0 ? (
              <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
                <FaMoon size={28} className="mx-auto mb-2" />
                <p className="font-semibold">কোনো বুকিং নেই</p>
              </div>
            ) : (
              <div className="space-y-3">
                {bookings.map((b) => (
                  <div key={b._id} className="bg-white rounded-xl border p-4 space-y-3">
                    {/* Top row */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${statusColor[b.status]}`}>
                            {statusBn[b.status]}
                          </span>
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            b.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                          }`}>
                            {b.paymentStatus === 'paid' ? '💰 পেমেন্ট হয়েছে' : '⏳ পেমেন্ট বাকি'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1.5 flex items-center gap-1">
                          <FaCalendarAlt size={10} />
                          {b.slotId ? `${formatDate(b.slotId.date)} — ${b.slotId.time}` : 'স্লট অজানা'}
                        </p>
                      </div>
                      <p className="text-xs text-gray-400">{new Date(b.createdAt).toLocaleDateString('bn-BD')}</p>
                    </div>

                    {/* User info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <FaUser size={10} className="text-gray-400" />
                        <span className="font-semibold">{b.name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <FaPhone size={10} className="text-gray-400" />
                        <span>{b.phone}</span>
                      </div>
                      {b.userId && (
                        <div className="col-span-2 text-gray-400">
                          অ্যাকাউন্ট: {b.userId.name} ({b.userId.email})
                        </div>
                      )}
                    </div>

                    {/* Problem */}
                    <div className="bg-gray-50 rounded-lg p-2.5 text-xs text-gray-700 leading-relaxed">
                      {b.problem}
                    </div>

                    {/* Admin note */}
                    {b.adminNote && (
                      <div className="bg-indigo-50 border border-indigo-100 rounded-lg p-2 text-xs text-indigo-700">
                        <FaStickyNote size={10} className="inline mr-1" /> {b.adminNote}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-2 pt-1 border-t">
                      {b.status === 'pending' && (
                        <button onClick={() => handleConfirm(b._id)} disabled={actionLoading[b._id] === 'confirm'}
                          className="flex items-center gap-1 text-xs bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg disabled:opacity-60">
                          {actionLoading[b._id] === 'confirm' ? <FaSpinner size={10} className="animate-spin" /> : <FaCheckCircle size={10} />}
                          নিশ্চিত করুন
                        </button>
                      )}
                      {b.status !== 'cancelled' && (
                        <button onClick={() => handleCancel(b._id)} disabled={actionLoading[b._id] === 'cancel'}
                          className="flex items-center gap-1 text-xs bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-3 py-1.5 rounded-lg disabled:opacity-60">
                          {actionLoading[b._id] === 'cancel' ? <FaSpinner size={10} className="animate-spin" /> : <FaTimesCircle size={10} />}
                          বাতিল
                        </button>
                      )}
                      <button onClick={() => handlePayment(b._id, b.paymentStatus)}
                        className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                          b.paymentStatus === 'paid'
                            ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                            : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100'
                        }`}>
                        <FaMoneyBillWave size={10} />
                        {b.paymentStatus === 'paid' ? 'পেমেন্ট বাতিল' : 'পেমেন্ট পাওয়া গেছে'}
                      </button>
                      <NoteEditor bookingId={b._id} current={b.adminNote}
                        onSave={(note) => setBookings((prev) => prev.map((bk) => bk._id === b._id ? { ...bk, adminNote: note } : bk))} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {/* ── SLOTS TAB ── */}
        {tab === 'slots' && (
          <div className="space-y-5">
            {/* Create new slot */}
            <div className="bg-white rounded-xl border p-5 space-y-4">
              <p className="font-bold text-gray-800 text-sm flex items-center gap-2">
                <FaPlus size={12} /> নতুন স্লট তৈরি করুন
              </p>
              <form onSubmit={handleCreateSlot} className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">তারিখ *</label>
                  <input type="date" value={newSlot.date}
                    onChange={(e) => setNewSlot((p) => ({ ...p, date: e.target.value }))}
                    className="input-field" min={new Date().toISOString().split('T')[0]} required />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">সময় *</label>
                  <input type="text" value={newSlot.time}
                    onChange={(e) => setNewSlot((p) => ({ ...p, time: e.target.value }))}
                    className="input-field" placeholder="যেমন: 10:00 AM" required />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">ধারণক্ষমতা</label>
                  <input type="number" value={newSlot.capacity} min={1}
                    onChange={(e) => setNewSlot((p) => ({ ...p, capacity: Number(e.target.value) }))}
                    className="input-field" />
                </div>
                <div>
                  <label className="text-xs text-gray-500 mb-1 block">নোট (ঐচ্ছিক)</label>
                  <input type="text" value={newSlot.note}
                    onChange={(e) => setNewSlot((p) => ({ ...p, note: e.target.value }))}
                    className="input-field" placeholder="স্লটের বিবরণ" />
                </div>
                <div className="col-span-2">
                  <button type="submit" disabled={slotLoading}
                    className="w-full bg-[#1a5276] hover:bg-[#154360] text-white font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-colors disabled:opacity-60">
                    {slotLoading ? <FaSpinner size={13} className="animate-spin" /> : <FaPlus size={13} />}
                    স্লট তৈরি করুন
                  </button>
                </div>
              </form>
            </div>

            {/* Slots list */}
            <div className="space-y-2">
              {slots.length === 0 ? (
                <div className="bg-white rounded-xl border p-8 text-center text-gray-400">
                  <FaCalendarAlt size={28} className="mx-auto mb-2" />
                  <p>কোনো স্লট নেই</p>
                </div>
              ) : (
                slots.map((slot) => (
                  <div key={slot._id} className={`bg-white rounded-xl border p-4 flex items-center gap-3 transition-opacity ${
                    !slot.isActive ? 'opacity-60' : ''
                  }`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1a5276] to-blue-600 flex items-center justify-center flex-shrink-0">
                      <FaCalendarAlt className="text-white" size={14} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-gray-800 text-sm">{formatDate(slot.date)}</p>
                      <p className="text-xs text-gray-500 flex items-center gap-2 mt-0.5">
                        <FaClock size={10} /> {slot.time}
                        <span className="text-gray-300">•</span>
                        {slot.bookedCount}/{slot.capacity} বুকড
                        {slot.note && <><span className="text-gray-300">•</span> {slot.note}</>}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => handleToggleSlot(slot._id)} title={slot.isActive ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                        className={`text-lg ${slot.isActive ? 'text-green-500' : 'text-gray-400'}`}>
                        {slot.isActive ? <FaToggleOn /> : <FaToggleOff />}
                      </button>
                      <button onClick={() => handleDeleteSlot(slot._id)}
                        className="text-red-400 hover:text-red-600 p-1.5 hover:bg-red-50 rounded-lg transition-colors">
                        <FaTrash size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
