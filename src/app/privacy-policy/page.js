'use client';

import { useState, useEffect, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  FaShieldAlt, FaUserLock, FaDatabase, FaEye,
  FaCookieBite, FaShareAlt, FaChild, FaBell,
  FaEnvelope, FaCheckCircle, FaLock, FaGlobe, FaArrowUp,
} from 'react-icons/fa';
import { MdVerified, MdSecurity, MdPrivacyTip } from 'react-icons/md';

/* ── Islamic geometric SVG background ─────────────────────────── */
const IslamicBg = ({ opacity = 0.06 }) => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ opacity }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="ip" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
        <polygon points="40,3 77,22 77,58 40,77 3,58 3,22" fill="none" stroke="white" strokeWidth="0.8"/>
        <polygon points="40,18 62,30 62,50 40,62 18,50 18,30" fill="none" stroke="white" strokeWidth="0.4"/>
        <circle cx="40" cy="40" r="4" fill="none" stroke="white" strokeWidth="0.4"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#ip)"/>
  </svg>
);

const sections = [
  {
    id: 'collection',
    icon: FaDatabase,
    gradient: 'from-blue-600 to-[#1a5276]',
    lightBg: 'from-blue-50 to-blue-50/30',
    accentColor: 'text-blue-600',
    badgeColor: 'bg-blue-100 text-blue-700',
    title: 'তথ্য সংগ্রহ',
    subtitle: 'আমরা কী কী তথ্য সংগ্রহ করি',
    content: [
      {
        subtitle: 'আপনি যা প্রদান করেন',
        text: 'নিবন্ধনের সময় আপনার নাম, ইমেইল, মোবাইল নম্বর, জন্ম তারিখ এবং বায়োডেটার বিস্তারিত তথ্য সংগ্রহ করা হয়। পেমেন্টের সময় লেনদেনের রেফারেন্স নম্বর ও পেমেন্ট পদ্ধতির তথ্য সংরক্ষণ করা হয়।',
      },
      {
        subtitle: 'স্বয়ংক্রিয়ভাবে সংগৃহীত তথ্য',
        text: 'আপনি যখন আমাদের সেবা ব্যবহার করেন, তখন IP ঠিকানা, ব্রাউজারের ধরন, ডিভাইসের তথ্য, পেজ ভিজিটের লগ এবং কুকি সম্পর্কিত তথ্য স্বয়ংক্রিয়ভাবে সংগ্রহ হতে পারে।',
      },
    ],
    highlights: [
      'শুধুমাত্র প্রয়োজনীয় তথ্যই সংগ্রহ করা হয়',
      'সংবেদনশীল ধর্মীয় তথ্য স্বেচ্ছায় প্রদান করা হয়',
      'তৃতীয় পক্ষের বিজ্ঞাপনের জন্য তথ্য বিক্রি করা হয় না',
    ],
  },
  {
    id: 'usage',
    icon: FaEye,
    gradient: 'from-amber-500 to-[#c9a84c]',
    lightBg: 'from-amber-50 to-amber-50/30',
    accentColor: 'text-amber-600',
    badgeColor: 'bg-amber-100 text-amber-700',
    title: 'তথ্য ব্যবহার',
    subtitle: 'আপনার তথ্য কীভাবে ব্যবহার হয়',
    content: [
      {
        subtitle: 'সেবা প্রদানে',
        text: 'আপনার তথ্য ব্যবহার করে আমরা বায়োডেটা প্রদর্শন করি, সম্ভাব্য মিল সাজেস্ট করি এবং আপনার অ্যাকাউন্ট পরিচালনা করি। পেমেন্ট যাচাই ও যোগাযোগের তথ্য আনলক করতে লেনদেনের তথ্য ব্যবহার করা হয়।',
      },
      {
        subtitle: 'যোগাযোগের জন্য',
        text: 'অ্যাকাউন্ট নিশ্চিতকরণ, পাসওয়ার্ড রিসেট, গুরুত্বপূর্ণ আপডেট এবং সাপোর্ট সম্পর্কিত বার্তা পাঠাতে আপনার ইমেইল বা মোবাইল নম্বর ব্যবহার করা হয়।',
      },
      {
        subtitle: 'উন্নতির জন্য',
        text: 'পরিষেবার মান উন্নত করতে, নতুন ফিচার তৈরি করতে এবং ব্যবহারকারীর অভিজ্ঞতা উন্নত করতে বেনামী পরিসংখ্যান বিশ্লেষণ করা হয়।',
      },
    ],
    highlights: [
      'বিপণন ইমেইল থেকে যেকোনো সময় বের হওয়া যাবে',
      'তৃতীয় পক্ষের কাছে তথ্য শেয়ার করা হয় না',
      'আইনি বাধ্যবাধকতা ছাড়া তথ্য প্রকাশ করা হয় না',
    ],
  },
  {
    id: 'protection',
    icon: FaLock,
    gradient: 'from-emerald-600 to-[#1b6a3b]',
    lightBg: 'from-emerald-50 to-emerald-50/30',
    accentColor: 'text-emerald-600',
    badgeColor: 'bg-emerald-100 text-emerald-700',
    title: 'তথ্য সুরক্ষা',
    subtitle: 'আমরা কীভাবে আপনার ডেটা রক্ষা করি',
    content: [
      {
        subtitle: 'এনক্রিপশন',
        text: 'আপনার পাসওয়ার্ড bcrypt এনক্রিপশন দিয়ে সংরক্ষিত। সমস্ত ডেটা ট্রান্সফার SSL/TLS এনক্রিপশনের মাধ্যমে সুরক্ষিত। আমাদের সার্ভার নিয়মিত নিরাপত্তা অডিটের আওতায় থাকে।',
      },
      {
        subtitle: 'অ্যাক্সেস নিয়ন্ত্রণ',
        text: 'শুধুমাত্র অনুমোদিত কর্মীরা প্রয়োজনীয় ডেটা অ্যাক্সেস করতে পারেন। সমস্ত অ্যাক্সেস লগ রাখা হয় এবং নিয়মিত পর্যালোচনা করা হয়।',
      },
    ],
    highlights: [
      'SSL/TLS দিয়ে ডেটা ট্রান্সফার সুরক্ষিত',
      'পাসওয়ার্ড bcrypt হ্যাশ করে সংরক্ষণ',
      'নিয়মিত নিরাপত্তা পরীক্ষা-নিরীক্ষা',
    ],
  },
  {
    id: 'sharing',
    icon: FaShareAlt,
    gradient: 'from-violet-600 to-purple-700',
    lightBg: 'from-violet-50 to-violet-50/30',
    accentColor: 'text-violet-600',
    badgeColor: 'bg-violet-100 text-violet-700',
    title: 'তথ্য শেয়ারিং',
    subtitle: 'তথ্য কার সাথে শেয়ার হয়',
    content: [
      {
        subtitle: 'অন্য সদস্যদের সাথে',
        text: 'আপনার বায়োডেটার পাবলিক তথ্য (নাম, বয়স, শিক্ষা, পেশা ইত্যাদি) অনুমোদিত সদস্যরা দেখতে পারবেন। তবে মোবাইল নম্বর ও ইমেইলের মতো যোগাযোগের তথ্য শুধুমাত্র পেমেন্টের পরে আনলক হবে।',
      },
      {
        subtitle: 'তৃতীয় পক্ষের সাথে',
        text: 'আমরা কখনো আপনার ব্যক্তিগত তথ্য বিক্রি বা ভাড়া দিই না। শুধুমাত্র পেমেন্ট প্রক্রিয়াকরণের জন্য আমাদের পেমেন্ট গেটওয়ে পার্টনারদের (bKash, Nagad, Rocket) সাথে সীমিত তথ্য শেয়ার হতে পারে।',
      },
      {
        subtitle: 'আইনি প্রয়োজনে',
        text: 'আদালতের আদেশ বা সরকারি কর্তৃপক্ষের আইনি অনুরোধের ক্ষেত্রে তথ্য প্রকাশ করার বাধ্যবাধকতা থাকতে পারে। এই ক্ষেত্রে আমরা আইনি নির্দেশনা মেনে চলব।',
      },
    ],
    highlights: [
      'কখনো তথ্য বিক্রি করা হয় না',
      'পেমেন্ট ছাড়া যোগাযোগ তথ্য গোপন থাকে',
      'আইনি অনুরোধে স্বচ্ছতা বজায় রাখা হয়',
    ],
  },
  {
    id: 'cookies',
    icon: FaCookieBite,
    gradient: 'from-orange-500 to-red-500',
    lightBg: 'from-orange-50 to-orange-50/30',
    accentColor: 'text-orange-600',
    badgeColor: 'bg-orange-100 text-orange-700',
    title: 'কুকি নীতি',
    subtitle: 'কুকি কী এবং কীভাবে ব্যবহার হয়',
    content: [
      {
        subtitle: 'কুকি কী এবং কেন ব্যবহার করি',
        text: 'কুকি হলো ছোট ডেটা ফাইল যা আপনার ব্রাউজারে সংরক্ষিত হয়। আমরা লগইন সেশন বজায় রাখতে, ভাষা পছন্দ মনে রাখতে এবং নিরাপত্তার জন্য কুকি ব্যবহার করি।',
      },
      {
        subtitle: 'কুকি নিয়ন্ত্রণ',
        text: 'আপনি আপনার ব্রাউজার সেটিংস থেকে কুকি ব্লক বা মুছে ফেলতে পারেন। তবে কিছু কুকি ব্লক করলে সাইটের কিছু ফিচার সঠিকভাবে কাজ নাও করতে পারে।',
      },
    ],
    highlights: [
      'শুধুমাত্র প্রয়োজনীয় কুকি ব্যবহার করা হয়',
      'ট্র্যাকিং বা বিজ্ঞাপন কুকি নেই',
      'ব্রাউজার থেকে যেকোনো সময় মুছে ফেলা যায়',
    ],
  },
  {
    id: 'rights',
    icon: FaUserLock,
    gradient: 'from-[#1a5276] to-cyan-700',
    lightBg: 'from-cyan-50 to-cyan-50/30',
    accentColor: 'text-cyan-700',
    badgeColor: 'bg-cyan-100 text-cyan-700',
    title: 'আপনার অধিকার',
    subtitle: 'আপনি যা যা করতে পারবেন',
    content: [
      {
        subtitle: 'তথ্য দেখার ও সম্পাদনার অধিকার',
        text: 'আপনি যেকোনো সময় আপনার প্রোফাইল ও বায়োডেটা দেখতে এবং আপডেট করতে পারবেন। ড্যাশবোর্ড থেকে সরাসরি তথ্য পরিবর্তন করা যাবে।',
      },
      {
        subtitle: 'তথ্য মুছে ফেলার অধিকার',
        text: 'আপনি আপনার অ্যাকাউন্ট ও বায়োডেটা মুছে ফেলার অনুরোধ করতে পারবেন। সেটিংস পেজ থেকে অ্যাকাউন্ট নিষ্ক্রিয় করার বা আমাদের সরাসরি যোগাযোগ করার সুবিধা আছে।',
      },
      {
        subtitle: 'ডেটা পোর্টেবিলিটি',
        text: 'আপনার সংরক্ষিত তথ্যের একটি কপি পেতে আমাদের সাথে যোগাযোগ করুন। আমরা ৩০ কার্যদিবসের মধ্যে আপনার অনুরোধ প্রক্রিয়া করব।',
      },
    ],
    highlights: [
      'যেকোনো সময় তথ্য আপডেট করার সুবিধা',
      'অ্যাকাউন্ট সম্পূর্ণ মুছে ফেলার অধিকার',
      'ডেটার কপি পাওয়ার অনুরোধ করা যাবে',
    ],
  },
  {
    id: 'children',
    icon: FaChild,
    gradient: 'from-rose-500 to-pink-600',
    lightBg: 'from-rose-50 to-rose-50/30',
    accentColor: 'text-rose-600',
    badgeColor: 'bg-rose-100 text-rose-700',
    title: 'অপ্রাপ্তবয়স্কদের সুরক্ষা',
    subtitle: 'শিশু ও কিশোরদের নিরাপত্তা',
    content: [
      {
        subtitle: 'বয়স সীমা',
        text: 'Holy Relationship শুধুমাত্র ১৮ বছর বা তার বেশি বয়সের ব্যক্তিদের জন্য। আমরা জেনেশুনে ১৮ বছরের কম বয়সীদের তথ্য সংগ্রহ করি না। যদি আমরা জানতে পারি যে কোনো অপ্রাপ্তবয়স্কের তথ্য সংগ্রহ হয়েছে, তা অবিলম্বে মুছে ফেলা হবে।',
      },
    ],
    highlights: [
      'ন্যূনতম বয়স সীমা ১৮ বছর',
      'অপ্রাপ্তবয়স্কের তথ্য পাওয়া গেলে তাৎক্ষণিক মুছে ফেলা হবে',
      'অভিভাবকরা রিপোর্ট করতে পারবেন',
    ],
  },
  {
    id: 'updates',
    icon: FaBell,
    gradient: 'from-teal-600 to-[#1b6a3b]',
    lightBg: 'from-teal-50 to-teal-50/30',
    accentColor: 'text-teal-700',
    badgeColor: 'bg-teal-100 text-teal-700',
    title: 'নীতি পরিবর্তন',
    subtitle: 'কীভাবে আপডেট জানানো হবে',
    content: [
      {
        subtitle: 'আপডেটের বিজ্ঞপ্তি',
        text: 'গোপনীয়তা নীতিতে কোনো গুরুত্বপূর্ণ পরিবর্তন হলে আমরা আপনার ইমেইলে বা সাইটে বিজ্ঞপ্তি দেব। পরিবর্তনের তারিখ পেজের শীর্ষে উল্লেখ থাকবে।',
      },
      {
        subtitle: 'ব্যবহার অব্যাহত রাখা',
        text: 'নতুন নীতি প্রকাশের পর সেবা ব্যবহার অব্যাহত রাখলে ধরে নেওয়া হবে যে আপনি পরিবর্তিত নীতি স্বীকার করেছেন।',
      },
    ],
    highlights: [
      'পরিবর্তনের আগে ইমেইলে জানানো হবে',
      'পরিবর্তনের তারিখ সবসময় উল্লেখ থাকবে',
      'অস্বীকারের ক্ষেত্রে অ্যাকাউন্ট বন্ধের সুবিধা',
    ],
  },
];

/* ── Scroll progress bar ───────────────────────────────────────── */
function ScrollProgress() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const el = document.documentElement;
      setPct((el.scrollTop / (el.scrollHeight - el.clientHeight)) * 100);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return (
    <div className="fixed top-0 left-0 z-50 h-1 bg-gradient-to-r from-[#1a5276] via-[#c9a84c] to-[#1b6a3b] transition-all duration-100"
      style={{ width: `${pct}%` }} />
  );
}

/* ── Back to top button ────────────────────────────────────────── */
function BackToTop() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const h = () => setShow(window.scrollY > 400);
    window.addEventListener('scroll', h, { passive: true });
    return () => window.removeEventListener('scroll', h);
  }, []);
  if (!show) return null;
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="fixed bottom-6 right-6 z-40 w-11 h-11 bg-[#1a5276] hover:bg-[#0c3a5e] text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
    >
      <FaArrowUp size={14} />
    </button>
  );
}

/* ── Section card ──────────────────────────────────────────────── */
function SectionCard({ section, index }) {
  const Icon = section.icon;
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      id={section.id}
      className={`scroll-mt-24 transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}
      style={{ transitionDelay: `${index * 60}ms` }}
    >
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">

        {/* Gradient header */}
        <div className={`bg-gradient-to-r ${section.gradient} p-6 relative overflow-hidden`}>
          <div className="absolute inset-0 opacity-10">
            <svg width="100%" height="100%"><defs><pattern id={`ph${index}`} width="40" height="40" patternUnits="userSpaceOnUse"><polygon points="20,2 38,11 38,29 20,38 2,29 2,11" fill="none" stroke="white" strokeWidth="0.6"/></pattern></defs><rect width="100%" height="100%" fill={`url(#ph${index})`}/></svg>
          </div>
          <div className="relative flex items-center gap-4">
            <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 flex-shrink-0">
              <Icon size={20} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-0.5">
                <span className="text-white/40 text-xs font-mono font-bold">
                  {String(index + 1).padStart(2, '০')}
                </span>
                <h2 className="text-white font-bold text-lg leading-tight">{section.title}</h2>
              </div>
              <p className="text-white/70 text-xs">{section.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-5 mb-6">
            {section.content.map((block, i) => (
              <div key={i} className="flex gap-4">
                <div className="mt-1 flex-shrink-0">
                  <div className={`w-6 h-6 rounded-lg ${section.badgeColor} flex items-center justify-center`}>
                    <span className="text-[10px] font-black">{i + 1}</span>
                  </div>
                </div>
                <div>
                  <h3 className={`font-bold text-sm mb-1.5 ${section.accentColor}`}>{block.subtitle}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{block.text}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Highlights */}
          <div className={`bg-gradient-to-br ${section.lightBg} rounded-2xl p-4 border border-gray-100`}>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">মূল বিষয়সমূহ</p>
            <ul className="space-y-2.5">
              {section.highlights.map((h, idx) => (
                <li key={idx} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <FaCheckCircle size={10} className="text-green-600" />
                  </div>
                  <span className="text-sm text-gray-700 leading-snug">{h}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('collection');

  /* Update active section on scroll */
  useEffect(() => {
    const onScroll = () => {
      for (const s of [...sections].reverse()) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= 120) {
          setActiveSection(s.id);
          break;
        }
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setActiveSection(id);
  };

  return (
    <>
      <ScrollProgress />
      <BackToTop />
      <Navbar />

      <main className="min-h-screen bg-[#f8fafc]">

        {/* ── HERO ──────────────────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#04243f] via-[#0c3a5e] to-[#0f4a30] text-white overflow-hidden">
          <IslamicBg />

          {/* Glowing orbs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#1a5276]/40 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#c9a84c]/15 rounded-full blur-3xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-64 h-64 bg-[#1b6a3b]/20 rounded-full blur-2xl -translate-y-1/2 pointer-events-none" />

          <div className="relative max-w-5xl mx-auto px-4 py-20 text-center">

            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-[#c9a84c]/20 border border-[#c9a84c]/40 rounded-full px-5 py-2 text-[#f0d080] text-xs font-semibold mb-7 backdrop-blur-sm">
              <MdPrivacyTip size={14} />
              সর্বশেষ আপডেট: ১৫ এপ্রিল ২০২৬
            </div>

            {/* Shield icon */}
            <div className="relative inline-flex items-center justify-center mb-7">
              <div className="w-28 h-28 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/20 backdrop-blur-sm flex items-center justify-center">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#c9a84c] to-amber-600 flex items-center justify-center shadow-2xl">
                  <FaShieldAlt size={36} className="text-white" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-8 h-8 bg-green-500 rounded-full border-3 border-[#0c3a5e] flex items-center justify-center shadow-lg">
                <MdVerified size={16} className="text-white" />
              </div>
            </div>

            <h1 className="text-4xl sm:text-5xl font-black mb-4 leading-tight">
              গোপনীয়তা নীতি
            </h1>
            <p className="text-white/65 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed mb-10">
              Holy Relationship আপনার ব্যক্তিগত তথ্যের নিরাপত্তা ও গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দেয়।
              এই নীতিটি আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করি তা বিস্তারিত ব্যাখ্যা করে।
            </p>

            {/* Trust badges */}
            <div className="flex flex-wrap justify-center gap-4">
              {[
                { icon: FaLock, label: 'SSL এনক্রিপশন', sub: 'সম্পূর্ণ সুরক্ষিত' },
                { icon: MdSecurity, label: 'ডেটা প্রাইভেসি', sub: 'তথ্য বিক্রি হয় না' },
                { icon: FaGlobe, label: 'GDPR সম্মত', sub: 'আন্তর্জাতিক মান' },
                { icon: MdVerified, label: 'যাচাইকৃত সাইট', sub: 'বিশ্বাসযোগ্য সেবা' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-2xl px-5 py-3.5 border border-white/10 hover:bg-white/15 transition-colors">
                  <div className="w-9 h-9 bg-[#c9a84c]/20 rounded-xl flex items-center justify-center">
                    <Icon size={16} className="text-[#f0d080]" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm leading-tight">{label}</p>
                    <p className="text-white/50 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0">
            <svg viewBox="0 0 1440 60" xmlns="http://www.w3.org/2000/svg" className="w-full">
              <path d="M0,30 C360,60 1080,0 1440,30 L1440,60 L0,60 Z" fill="#f8fafc"/>
            </svg>
          </div>
        </div>

        {/* ── GOLD RULE ──────────────────────────────────────────── */}
        <div className="max-w-5xl mx-auto px-4">
          <div className="h-0.5 bg-gradient-to-r from-transparent via-[#c9a84c]/40 to-transparent -mt-0.5 mb-10" />
        </div>

        {/* ── BODY ──────────────────────────────────────────────── */}
        <div className="max-w-6xl mx-auto px-4 pb-16">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* ── Sticky sidebar ─────────────────────────────────── */}
            <aside className="lg:sticky lg:top-24 w-full lg:w-72 flex-shrink-0">

              {/* Intro card */}
              <div className="bg-gradient-to-br from-[#1a5276] to-[#0c3a5e] rounded-2xl p-5 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10"><svg width="100%" height="100%"><defs><pattern id="sp" width="30" height="30" patternUnits="userSpaceOnUse"><polygon points="15,2 28,8 28,22 15,28 2,22 2,8" fill="none" stroke="white" strokeWidth="0.5"/></pattern></defs><rect width="100%" height="100%" fill="url(#sp)"/></svg></div>
                <div className="relative flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 bg-[#c9a84c]/30 rounded-xl flex items-center justify-center">
                    <FaShieldAlt size={16} className="text-[#f0d080]" />
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">আমাদের প্রতিশ্রুতি</p>
                    <p className="text-white/50 text-xs">ইসলামিক মূল্যবোধে পরিচালিত</p>
                  </div>
                </div>
                <p className="text-white/70 text-xs leading-relaxed relative">
                  আপনার ব্যক্তিগত তথ্য আপনার সম্পদ। আমরা কখনো আপনার তথ্য বিক্রি বা অপব্যবহার করি না।
                </p>
              </div>

              {/* Table of contents */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100">
                  <p className="font-bold text-gray-800 text-sm">বিষয়সূচী</p>
                  <p className="text-xs text-gray-400 mt-0.5">যেকোনো অংশে সরাসরি যান</p>
                </div>
                <nav className="p-2">
                  {sections.map((s, i) => {
                    const Icon = s.icon;
                    const isActive = activeSection === s.id;
                    return (
                      <button
                        key={s.id}
                        onClick={() => scrollTo(s.id)}
                        className={`w-full text-left flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all group ${
                          isActive
                            ? 'bg-[#1a5276]/8 text-[#1a5276]'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-[#1a5276]'
                        }`}
                      >
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                          isActive ? `bg-gradient-to-br ${s.gradient}` : 'bg-gray-100 group-hover:bg-gray-200'
                        }`}>
                          <Icon size={11} className={isActive ? 'text-white' : 'text-gray-400'} />
                        </div>
                        <span className={`flex-1 truncate ${isActive ? 'font-semibold' : ''}`}>{s.title}</span>
                        {isActive && <div className="w-1.5 h-1.5 rounded-full bg-[#c9a84c] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </nav>

                {/* Contact in sidebar */}
                <div className="m-3 mt-1 bg-gradient-to-br from-[#c9a84c]/10 to-amber-50 border border-[#c9a84c]/20 rounded-xl p-4">
                  <p className="text-xs font-bold text-[#1a5276] mb-1">প্রশ্ন আছে?</p>
                  <p className="text-xs text-gray-500 mb-3 leading-snug">আমাদের সাথে সরাসরি কথা বলুন</p>
                  <Link
                    href="/contact"
                    className="flex items-center justify-center gap-2 text-xs bg-[#1a5276] hover:bg-[#0c3a5e] text-white rounded-xl py-2.5 font-semibold transition-colors"
                  >
                    <FaEnvelope size={11} /> যোগাযোগ করুন
                  </Link>
                </div>
              </div>
            </aside>

            {/* ── Main content ───────────────────────────────────── */}
            <div className="flex-1 space-y-5">

              {/* Intro alert */}
              <div className="bg-white rounded-2xl border border-[#c9a84c]/20 shadow-sm p-5 flex gap-4">
                <div className="w-11 h-11 bg-gradient-to-br from-[#c9a84c]/20 to-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <FaShieldAlt size={18} className="text-[#c9a84c]" />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 mb-1.5 text-sm">Holy Relationship-এর গোপনীয়তা প্রতিশ্রুতি</h2>
                  <p className="text-sm text-gray-600 leading-relaxed">
                    আমরা বিশ্বাস করি আপনার ব্যক্তিগত তথ্য আপনার সম্পদ। ইসলামিক মূল্যবোধ ও আধুনিক ডেটা সুরক্ষার নীতি মেনে আমরা আপনার গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ। এই নীতি বাংলাদেশের প্রযোজ্য আইন মেনে তৈরি।
                  </p>
                </div>
              </div>

              {/* Sections */}
              {sections.map((section, idx) => (
                <SectionCard key={section.id} section={section} index={idx} />
              ))}

              {/* CTA banner */}
              <div className="relative bg-gradient-to-br from-[#0c3a5e] via-[#1a5276] to-[#0f4a30] rounded-3xl p-8 text-white text-center overflow-hidden">
                <IslamicBg opacity={0.08} />
                <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative">
                  <div className="w-16 h-16 bg-[#c9a84c]/20 rounded-full flex items-center justify-center mx-auto mb-5 border border-[#c9a84c]/30">
                    <FaEnvelope size={24} className="text-[#c9a84c]" />
                  </div>
                  <h3 className="font-black text-2xl mb-2">গোপনীয়তা নিয়ে কোনো প্রশ্ন?</h3>
                  <p className="text-white/65 text-sm mb-7 max-w-md mx-auto leading-relaxed">
                    আমাদের প্রাইভেসি টিম আপনার যেকোনো প্রশ্নের উত্তর দিতে সদা প্রস্তুত।
                    ২৪ ঘণ্টার মধ্যে উত্তর দেওয়ার নিশ্চয়তা।
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
                    <Link href="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-amber-500 text-white font-bold px-8 py-3.5 rounded-2xl transition-colors text-sm shadow-lg"
                    >
                      <FaEnvelope size={14} /> যোগাযোগ করুন
                    </Link>
                    <Link href="/faq"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-2xl transition-colors text-sm border border-white/20"
                    >
                      FAQ দেখুন
                    </Link>
                  </div>
                  <p className="text-white/35 text-xs">privacy@holyrelationship.com</p>
                </div>
              </div>

              {/* Footer note */}
              <div className="text-center text-xs text-gray-400 pb-2 leading-relaxed">
                এই নীতি সর্বশেষ ১৫ এপ্রিল ২০২৬ তারিখে আপডেট করা হয়েছে।<br />
                Holy Relationship সর্বদা ইসলামিক মূল্যবোধ ও আধুনিক ডেটা সুরক্ষা বিধি মেনে পরিচালিত।
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}
