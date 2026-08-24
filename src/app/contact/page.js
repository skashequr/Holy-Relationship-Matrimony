'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  FaPhone, FaEnvelope, FaMapMarkerAlt, FaClock,
  FaFacebook, FaYoutube, FaWhatsapp, FaPaperPlane,
  FaCheckCircle, FaHeadset, FaShieldAlt, FaHeart,
  FaChevronRight, FaQuestionCircle,
} from 'react-icons/fa';
import toast, { Toaster } from 'react-hot-toast';

/* ─── contact info cards ─── */
const contactCards = [
  {
    icon: FaPhone,
    title: 'ফোন করুন',
    subtitle: 'আমরা সবসময় আপনার জন্য',
    value: '+880 1927540465',
    value2: '+880 1682981828',
    color: 'from-[#1a5276] to-[#1b6a3b]',
    accent: '#1b6a3b',
    bg: 'bg-green-50',
    href: '',
  },
  {
    icon: FaEnvelope,
    title: 'ইমেইল করুন',
    subtitle: '২৪ ঘণ্টার মধ্যে উত্তর',
    value: 'info@holyrelationship.com',
    value2: 'support@holyrelationship.com',
    value2: 'islamermukhopatro@gmail.com',
    color: 'from-[#1a5276] to-[#0c3a5e]',
    accent: '#1a5276',
    bg: 'bg-blue-50',
    href: 'mailto:info@holyrelationship.com',
  },
  {
    icon: FaMapMarkerAlt,
    title: 'অফিস ঠিকানা',
    subtitle: 'সশরীরে দেখা করুন',
    value: 'ঢাকা, বাংলাদেশ',
    value2: 'শনি–বৃহস্পতি: সকাল ৯টা – রাত ৮টা',
    color: 'from-[#c9a84c] to-[#b8943b]',
    accent: '#c9a84c',
    bg: 'bg-yellow-50',
    href: '#map',
  },
];

/* ─── support categories ─── */
const supportTopics = [
  { icon: FaShieldAlt, label: 'অ্যাকাউন্ট সমস্যা', color: '#1a5276' },
  { icon: FaHeart, label: 'বায়োডেটা যাচাই', color: '#1b6a3b' },
  { icon: FaPhone, label: 'পেমেন্ট সহায়তা', color: '#c9a84c' },
  { icon: FaHeadset, label: 'টেকনিক্যাল সহায়তা', color: '#8e44ad' },
  { icon: FaQuestionCircle, label: 'সাধারণ জিজ্ঞাসা', color: '#2980b9' },
  { icon: FaCheckCircle, label: 'ম্যারেজ রিপোর্ট', color: '#27ae60' },
];

/* ─── working hours ─── */
const hours = [
  { day: 'শনিবার – বৃহস্পতিবার', time: 'সকাল ৯:০০ – রাত ৮:০০' },
  { day: 'শুক্রবার', time: 'বিকাল ৩:০০ – রাত ৮:০০' },
  { day: 'সরকারি ছুটির দিন', time: 'বন্ধ' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [activeField, setActiveField] = useState(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // trigger entrance animation
    const t = setTimeout(() => setVisible(true), 50);
    return () => clearTimeout(t);
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('নাম, ইমেইল ও বার্তা আবশ্যক।');
      return;
    }
    setSending(true);
    await new Promise((r) => setTimeout(r, 1800)); // simulate API
    setSending(false);
    setSent(true);
    toast.success('আপনার বার্তা পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।');
    setForm({ name: '', email: '', phone: '', subject: '', message: '' });
  };

  return (
    <>
      <Toaster position="top-center" />
      <Navbar />

      <main className="min-h-screen bg-gray-50 overflow-hidden">

        {/* ══════ HERO ══════ */}
        <section className="relative bg-gradient-to-br from-[#0c3a5e] via-[#1a5276] to-[#0c3a5e] text-white overflow-hidden">
          {/* Islamic geometric SVG background */}
          <div className="absolute inset-0 opacity-[0.07] pointer-events-none select-none">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="islamic" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                  <polygon points="30,2 58,16 58,44 30,58 2,44 2,16" fill="none" stroke="#c9a84c" strokeWidth="0.8" />
                  <polygon points="30,12 48,21 48,39 30,48 12,39 12,21" fill="none" stroke="#f0c040" strokeWidth="0.4" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#islamic)" />
            </svg>
          </div>

          {/* Gold top stripe */}
          <div className="h-1 bg-gradient-to-r from-[#c9a84c] via-[#f0c040] to-[#c9a84c]" />

          {/* Decorative orbs */}
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#c9a84c]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-[#1b6a3b]/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
            {/* Moon icon */}
            <div
              className={`
                w-20 h-20 bg-gradient-to-br from-[#c9a84c] to-[#f0c040]
                rounded-full flex items-center justify-center mx-auto mb-6
                shadow-lg shadow-[#c9a84c]/30
                transition-all duration-700
                ${visible ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}
              `}
            >
              <span className="text-white text-4xl leading-none">☪</span>
            </div>

            <div
              className={`transition-all duration-700 delay-100 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
            >
              <p className="text-[#c9a84c] text-sm font-semibold tracking-widest uppercase mb-2">
                Holy Relationship
              </p>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-3 leading-tight">
                আমাদের সাথে যোগাযোগ করুন
              </h1>
              <div className="w-20 h-1 bg-gradient-to-r from-[#c9a84c] to-[#f0c040] rounded-full mx-auto my-4" />
              <p className="text-white/70 max-w-lg mx-auto text-base leading-relaxed">
                আপনার যেকোনো প্রশ্ন বা সহায়তার জন্য আমরা সর্বদা প্রস্তুত।
                আমাদের সাপোর্ট টিম আপনাকে দ্রুত সাহায্য করবে।
              </p>
            </div>

            {/* Breadcrumb */}
            <div
              className={`
                flex items-center justify-center gap-2 mt-8 text-sm text-white/50
                transition-all duration-700 delay-200
                ${visible ? 'opacity-100' : 'opacity-0'}
              `}
            >
              <Link href="/" className="hover:text-[#c9a84c] transition-colors">হোম</Link>
              <FaChevronRight size={10} />
              <span className="text-[#c9a84c] font-medium">যোগাযোগ</span>
            </div>
          </div>
        </section>

        {/* ══════ CONTACT CARDS ══════ */}
        <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 -mt-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {contactCards.map((card, i) => (
              <a
                key={card.title}
                href={card.href}
                className={`
                  group bg-white rounded-2xl p-6 shadow-lg border border-gray-100
                  hover:shadow-xl hover:-translate-y-1 transition-all duration-300
                  ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}
                `}
                style={{ transitionDelay: `${200 + i * 100}ms` }}
              >
                {/* icon circle */}
                <div
                  className={`
                    w-14 h-14 bg-gradient-to-br ${card.color}
                    rounded-2xl flex items-center justify-center mb-4
                    shadow-md group-hover:scale-110 transition-transform duration-300
                  `}
                >
                  <card.icon size={22} className="text-white" />
                </div>

                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-0.5">
                  {card.subtitle}
                </p>
                <h3 className="font-bold text-gray-800 text-base mb-3">{card.title}</h3>
                <p className="text-sm font-medium text-gray-700">{card.value}</p>
                <p className="text-xs text-gray-500 mt-0.5">{card.value2}</p>

                {/* bottom accent */}
                <div
                  className="mt-4 h-0.5 rounded-full transition-all duration-300 w-0 group-hover:w-full"
                  style={{ background: `linear-gradient(to right, ${card.accent}, transparent)` }}
                />
              </a>
            ))}
          </div>
        </section>

        {/* ══════ MAIN CONTENT: Form + Info ══════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-14 grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* ── CONTACT FORM (3/5) ── */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
              {/* form header */}
              <div className="bg-gradient-to-r from-[#1a5276] to-[#0c3a5e] px-7 py-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/15 rounded-xl flex items-center justify-center">
                    <FaPaperPlane size={16} className="text-[#c9a84c]" />
                  </div>
                  <div>
                    <h2 className="text-white font-bold text-lg">বার্তা পাঠান</h2>
                    <p className="text-white/60 text-xs">আমরা ২৪ ঘণ্টার মধ্যে উত্তর দেব</p>
                  </div>
                </div>
              </div>

              {/* form body */}
              <form onSubmit={handleSubmit} className="p-7 space-y-5">

                {/* name + phone row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FloatingInput
                    label="আপনার নাম *"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onFocus={() => setActiveField('name')}
                    onBlur={() => setActiveField(null)}
                    active={activeField === 'name'}
                  />
                  <FloatingInput
                    label="মোবাইল নম্বর"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    onFocus={() => setActiveField('phone')}
                    onBlur={() => setActiveField(null)}
                    active={activeField === 'phone'}
                  />
                </div>

                {/* email */}
                <FloatingInput
                  label="ইমেইল ঠিকানা *"
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setActiveField('email')}
                  onBlur={() => setActiveField(null)}
                  active={activeField === 'email'}
                />

                {/* subject */}
                <div className="relative">
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    বিষয়
                  </label>
                  <select
                    name="subject"
                    value={form.subject}
                    onChange={handleChange}
                    className="w-full border-2 border-gray-200 focus:border-[#1a5276] rounded-xl px-4 py-3 text-sm text-gray-700 bg-white appearance-none outline-none transition-colors cursor-pointer"
                  >
                    <option value="">বিষয় নির্বাচন করুন</option>
                    {supportTopics.map((t) => (
                      <option key={t.label} value={t.label}>{t.label}</option>
                    ))}
                    <option value="অন্যান্য">অন্যান্য</option>
                  </select>
                </div>

                {/* message */}
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                    আপনার বার্তা *
                  </label>
                  <textarea
                    name="message"
                    value={form.message}
                    onChange={handleChange}
                    rows={5}
                    placeholder="আপনার সমস্যা বা প্রশ্ন লিখুন..."
                    className={`
                      w-full border-2 rounded-xl px-4 py-3 text-sm text-gray-700 resize-none outline-none transition-colors
                      ${activeField === 'message' ? 'border-[#1a5276]' : 'border-gray-200'}
                    `}
                    onFocus={() => setActiveField('message')}
                    onBlur={() => setActiveField(null)}
                  />
                </div>

                {/* submit */}
                <button
                  type="submit"
                  disabled={sending}
                  className="
                    w-full bg-gradient-to-r from-[#1a5276] to-[#0c3a5e]
                    hover:from-[#0c3a5e] hover:to-[#1a5276]
                    disabled:opacity-60 disabled:cursor-not-allowed
                    text-white font-bold py-3.5 rounded-xl
                    flex items-center justify-center gap-2.5
                    transition-all duration-300 shadow-md hover:shadow-lg active:scale-[0.98]
                    text-sm
                  "
                >
                  {sending ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      পাঠানো হচ্ছে...
                    </>
                  ) : sent ? (
                    <>
                      <FaCheckCircle size={15} className="text-green-300" />
                      বার্তা পাঠানো হয়েছে
                    </>
                  ) : (
                    <>
                      <FaPaperPlane size={14} />
                      বার্তা পাঠান
                    </>
                  )}
                </button>

                {sent && (
                  <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-xl p-4">
                    <FaCheckCircle size={16} className="text-green-500 flex-shrink-0 mt-0.5" />
                    <p className="text-green-700 text-sm">
                      আপনার বার্তা সফলভাবে পাঠানো হয়েছে। আমরা শীঘ্রই আপনার সাথে যোগাযোগ করব।
                    </p>
                  </div>
                )}
              </form>
            </div>
          </div>

          {/* ── RIGHT PANEL (2/5) ── */}
          <div className="lg:col-span-2 space-y-6">

            {/* Support Topics */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-[#c9a84c] to-[#f0c040] rounded-full inline-block" />
                সহায়তার ধরন
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {supportTopics.map((t) => (
                  <button
                    key={t.label}
                    type="button"
                    onClick={() => setForm((f) => ({ ...f, subject: t.label }))}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl border-2 border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-all text-center group"
                  >
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
                      style={{ background: `${t.color}15` }}
                    >
                      <t.icon size={15} style={{ color: t.color }} />
                    </div>
                    <span className="text-xs font-medium text-gray-600 leading-tight">{t.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-6">
              <h3 className="font-bold text-gray-800 text-base mb-4 flex items-center gap-2">
                <span className="w-1 h-5 bg-gradient-to-b from-[#1a5276] to-[#1b6a3b] rounded-full inline-block" />
                কার্যালয়ের সময়
              </h3>
              <div className="space-y-3">
                {hours.map((h, i) => (
                  <div key={i} className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <FaClock size={12} className="text-[#c9a84c]" />
                      <span className="text-sm text-gray-600">{h.day}</span>
                    </div>
                    <span
                      className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                        h.time === 'বন্ধ'
                          ? 'bg-red-100 text-red-600'
                          : 'bg-green-100 text-green-700'
                      }`}
                    >
                      {h.time}
                    </span>
                  </div>
                ))}
              </div>

              {/* live dot */}
              <div className="mt-5 flex items-center gap-2 bg-green-50 rounded-xl p-3 border border-green-100">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
                </span>
                <span className="text-xs text-green-700 font-medium">এখন অনলাইন – সহায়তা পাওয়া যাচ্ছে</span>
              </div>
            </div>

            {/* Social links */}
            <div className="bg-gradient-to-br from-[#1a5276] to-[#0c3a5e] rounded-3xl shadow-lg p-6 text-white">
              <h3 className="font-bold text-base mb-1">সোশ্যাল মিডিয়া</h3>
              <p className="text-white/60 text-xs mb-4">আমাদের ফলো করুন</p>
              <div className="flex gap-3">
                {[
                  { icon: FaFacebook, label: 'Facebook', color: '#1877f2' },
                  { icon: FaYoutube, label: 'YouTube', color: '#ff0000' },
                  { icon: FaWhatsapp, label: 'WhatsApp', color: '#25d366' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    className="flex-1 flex flex-col items-center gap-2 bg-white/10 hover:bg-white/20 rounded-xl py-3 transition-colors group"
                  >
                    <s.icon size={18} style={{ color: s.color }} className="group-hover:scale-110 transition-transform" />
                    <span className="text-xs text-white/70">{s.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══════ MAP PLACEHOLDER ══════ */}
        <section id="map" className="max-w-5xl mx-auto px-4 sm:px-6 pb-6">
          <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden">
            {/* header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-[#c9a84c] to-[#b8943b] rounded-xl flex items-center justify-center">
                  <FaMapMarkerAlt size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-sm">আমাদের অবস্থান</h3>
                  <p className="text-gray-400 text-xs">ঢাকা, বাংলাদেশ</p>
                </div>
              </div>
              <a
                href="https://maps.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-semibold text-[#1a5276] hover:text-[#c9a84c] transition-colors flex items-center gap-1"
              >
                Google Maps-এ দেখুন <FaChevronRight size={10} />
              </a>
            </div>
            {/* map visual */}
            <div className="relative h-52 bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center overflow-hidden">
              <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice">
                {Array.from({ length: 15 }).map((_, i) => (
                  <line key={i} x1={i * 55} y1="0" x2={i * 55} y2="200" stroke="#1a5276" strokeWidth="1" />
                ))}
                {Array.from({ length: 8 }).map((_, i) => (
                  <line key={i} x1="0" y1={i * 30} x2="800" y2={i * 30} stroke="#1a5276" strokeWidth="1" />
                ))}
              </svg>
              <div className="relative z-10 text-center">
                <div className="w-14 h-14 bg-gradient-to-br from-[#c9a84c] to-[#f0c040] rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg shadow-[#c9a84c]/30 animate-bounce">
                  <FaMapMarkerAlt size={20} className="text-white" />
                </div>
                <p className="font-bold text-[#1a5276] text-sm">Holy Relationship</p>
                <p className="text-gray-500 text-xs">ঢাকা, বাংলাদেশ</p>
              </div>
            </div>
          </div>
        </section>

        {/* ══════ BOTTOM CTA ══════ */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-14">
          <div className="relative bg-gradient-to-r from-[#1a5276] via-[#1b6a3b] to-[#1a5276] rounded-3xl overflow-hidden">
            <div className="absolute inset-0 opacity-10 pointer-events-none select-none">
              <svg width="100%" height="100%">
                <defs>
                  <pattern id="ctaPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="20" cy="20" r="8" fill="none" stroke="#f0c040" strokeWidth="0.5" />
                    <circle cx="20" cy="20" r="3" fill="#f0c040" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#ctaPattern)" />
              </svg>
            </div>
            <div className="relative px-8 py-10 text-center text-white">
              <div className="text-4xl mb-3">☪</div>
              <h2 className="text-2xl font-extrabold mb-2">এখনই সঠিক সঙ্গী খুঁজুন</h2>
              <p className="text-white/70 text-sm mb-6 max-w-md mx-auto">
                হালাল উপায়ে আপনার জীবনসঙ্গী খুঁজে নিন। হাজারো সফল বিবাহের গল্প আমাদের অনুপ্রেরণা।
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8943b] text-white font-bold px-8 py-3 rounded-xl transition-colors shadow-lg text-sm"
                >
                  <FaHeart size={14} /> বিনামূল্যে নিবন্ধন করুন
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white font-semibold px-8 py-3 rounded-xl transition-colors text-sm"
                >
                  <FaQuestionCircle size={14} /> সাধারণ প্রশ্ন দেখুন
                </Link>
              </div>
            </div>
          </div>
        </section>

      </main>

      <Footer />
    </>
  );
}

/* ─── Floating label input component ─── */
function FloatingInput({ label, name, type = 'text', value, onChange, onFocus, onBlur, active }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
        {label}
      </label>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        className={`
          w-full border-2 rounded-xl px-4 py-3 text-sm text-gray-700 outline-none transition-colors
          ${active ? 'border-[#1a5276] bg-blue-50/30' : 'border-gray-200 bg-white'}
        `}
      />
    </div>
  );
}
