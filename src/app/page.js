'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  FaHeart, FaShieldAlt, FaSearch, FaStar, FaCheckCircle,
  FaUsers, FaLock, FaArrowRight, FaQuoteLeft, FaMosque,
  FaBolt, FaMobileAlt, FaHeadset, FaChevronRight,
} from 'react-icons/fa';

/* ─── static data ─── */
const stats = [
  { number: '৫০,০০০+', label: 'নিবন্ধিত সদস্য', icon: FaUsers, color: 'from-blue-500 to-blue-700' },
  { number: '১৫,০০০+', label: 'অনুমোদিত বায়োডেটা', icon: FaCheckCircle, color: 'from-green-500 to-green-700' },
  { number: '৫,০০০+', label: 'সফল বিবাহ', icon: FaHeart, color: 'from-rose-500 to-rose-700' },
  { number: '৯৮%', label: 'সন্তুষ্ট সদস্য', icon: FaStar, color: 'from-amber-500 to-amber-600' },
];

const features = [
  {
    icon: FaSearch,
    bg: 'from-[#1a5276] to-[#0c3a5e]',
    title: 'স্মার্ট অনুসন্ধান',
    desc: 'বয়স, জেলা, শিক্ষা, পেশা সহ নানা ফিল্টারে পছন্দের পাত্র/পাত্রী খুঁজুন।',
  },
  {
    icon: FaShieldAlt,
    bg: 'from-[#1b6a3b] to-[#145a32]',
    title: 'নিরাপদ ও গোপনীয়',
    desc: 'ব্যক্তিগত তথ্য সম্পূর্ণ সুরক্ষিত। যোগাযোগের তথ্য পেমেন্টের পরেই দেখা যাবে।',
  },
  {
    icon: FaBolt,
    bg: 'from-[#c9a84c] to-[#b8943b]',
    title: 'স্মার্ট ম্যাচিং',
    desc: 'AI অ্যালগরিদম আপনার পছন্দ অনুযায়ী সেরা ম্যাচ সাজেস্ট করে।',
  },
  {
    icon: FaCheckCircle,
    bg: 'from-[#6c3483] to-[#5b2c6f]',
    title: 'যাচাইকৃত প্রোফাইল',
    desc: 'সকল বায়োডেটা অ্যাডমিন কর্তৃক পর্যালোচনা করা হয়। ভুয়া প্রোফাইল নেই।',
  },
  {
    icon: FaMosque,
    bg: 'from-[#1a5276] to-[#1b6a3b]',
    title: 'ইসলামিক মূল্যবোধ',
    desc: 'সম্পূর্ণ ইসলামিক আদর্শ মেনে পরিচালিত। মাহরাম ও পর্দার নিয়ম।',
  },
  {
    icon: FaLock,
    bg: 'from-[#c0392b] to-[#a93226]',
    title: 'মাত্র ৫০ টাকায়',
    desc: 'মাত্র ৫০ টাকায় একটি প্রোফাইলের সম্পূর্ণ যোগাযোগ তথ্য আনলক করুন।',
  },
];

const steps = [
  { num: '০১', icon: '📝', title: 'নিবন্ধন করুন', desc: 'ফোন বা ইমেইল দিয়ে বিনামূল্যে নিবন্ধন করুন' },
  { num: '০২', icon: '📋', title: 'বায়োডেটা তৈরি', desc: 'সম্পূর্ণ বায়োডেটা ফর্ম পূরণ করুন' },
  { num: '০৩', icon: '🔍', title: 'প্রোফাইল খুঁজুন', desc: 'স্মার্ট ফিল্টারে পছন্দের প্রোফাইল দেখুন' },
  { num: '০৪', icon: '📞', title: 'যোগাযোগ করুন', desc: 'মাত্র ৫০ টাকায় সম্পূর্ণ যোগাযোগ আনলক করুন' },
];

const testimonials = [
  {
    name: 'সাকিব ও তানিয়া',
    location: 'ঢাকা',
    text: 'Holy Relationship-এর মাধ্যমে আমাদের পরিবার একে অপরের সাথে পরিচিত হয়েছে। আলহামদুলিল্লাহ, আমাদের বিয়ে সফলভাবে সম্পন্ন হয়েছে।',
    year: '২০২৪',
    avatar: '👨',
  },
  {
    name: 'রাফি ও সুমাইয়া',
    location: 'চট্টগ্রাম',
    text: 'প্রোফাইল যাচাইকৃত হওয়ায় আমরা নিশ্চিন্তে পছন্দ করতে পেরেছি। সাইটটি সম্পূর্ণ ইসলামিক নিয়ম মেনে চলে।',
    year: '২০২৪',
    avatar: '👩',
  },
  {
    name: 'ইমরান ও ফারিহা',
    location: 'সিলেট',
    text: 'স্মার্ট ম্যাচিং সিস্টেমটি অসাধারণ! আমাদের অনেক কিছু মিলে যাওয়ায় পরিবার সহজেই রাজি হয়েছে।',
    year: '২০২৩',
    avatar: '👨',
  },
];

const premiumFeatures = [
  'সীমাহীন যোগাযোগ তথ্য আনলক',
  'বায়োডেটা PDF ডাউনলোড',
  'প্রোফাইলে অগ্রাধিকার প্রদর্শন',
  'অগ্রাধিকারভিত্তিক সহায়তা',
  'উন্নত ফিল্টার অ্যাক্সেস',
  'সীমাহীন Interest পাঠানো',
];

/* ─── animated counter hook ─── */
function useCountUp(target, duration = 1500, started = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!started) return;
    const numeric = parseInt(target.replace(/[^০-৯0-9]/g, ''));
    if (!numeric) return;
    let start = 0;
    const step = numeric / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= numeric) { setCount(numeric); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [started]);
  return count;
}

/* ─── fade-in observer hook ─── */
function useFadeIn() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return [ref, visible];
}

/* ─── StatCard ─── */
function StatCard({ stat, started }) {
  const num = useCountUp(stat.number, 1400, started);
  const suffix = stat.number.replace(/[০-৯0-9,]/g, '');
  const formatted = num.toLocaleString('bn-BD');
  return (
    <div className="flex flex-col items-center text-center group">
      <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${stat.color} flex items-center justify-center mb-3 shadow-lg group-hover:scale-110 transition-transform`}>
        <stat.icon size={22} className="text-white" />
      </div>
      <div className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight">
        {formatted}{suffix}
      </div>
      <div className="text-white/70 text-sm mt-1 font-medium">{stat.label}</div>
    </div>
  );
}

export default function HomePage() {
  const [heroVisible, setHeroVisible] = useState(false);
  const [statsRef, statsVisible] = useFadeIn();
  const [featuresRef, featuresVisible] = useFadeIn();
  const [stepsRef, stepsVisible] = useFadeIn();
  const [testimonialRef, testimonialVisible] = useFadeIn();

  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* ══════════════ HERO ══════════════ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0c3a5e] via-[#1a5276] to-[#0d4f3c] min-h-[92vh] flex items-center">

        {/* Islamic geometric SVG */}
        <div className="absolute inset-0 opacity-[0.06] pointer-events-none select-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="geo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <polygon points="40,4 76,22 76,58 40,76 4,58 4,22" fill="none" stroke="#f0c040" strokeWidth="0.8" />
                <polygon points="40,18 62,29 62,51 40,62 18,51 18,29" fill="none" stroke="#c9a84c" strokeWidth="0.4" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geo)" />
          </svg>
        </div>

        {/* Glowing orbs */}
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] rounded-full bg-[#c9a84c]/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[400px] h-[400px] rounded-full bg-[#1b6a3b]/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-white/[0.02] blur-3xl pointer-events-none" />

        {/* Gold top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">

            {/* Left: Text */}
            <div className={`transition-all duration-700 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white/90 text-sm px-5 py-2.5 rounded-full mb-8">
                <span className="w-2 h-2 rounded-full bg-[#c9a84c] animate-pulse" />
                বাংলাদেশের বিশ্বস্ত ইসলামিক ম্যাট্রিমনি সেবা
              </div>

              {/* Headline */}
              <h1 className="text-4xl md:text-5xl xl:text-6xl font-extrabold text-white leading-tight mb-6">
                হালাল উপায়ে
                <span className="block bg-gradient-to-r from-[#c9a84c] via-[#f0c040] to-[#c9a84c] bg-clip-text text-transparent">
                  জীবনসঙ্গী খুঁজুন
                </span>
              </h1>

              <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl">
                ইসলামিক মূল্যবোধ মেনে আপনার জীবনসঙ্গী খুঁজুন। বাংলাদেশের হাজার হাজার
                যাচাইকৃত বায়োডেটা থেকে পছন্দের মানুষটিকে খুঁজে নিন।
              </p>

              {/* CTA buttons */}
              <div className="flex flex-col sm:flex-row gap-4 mb-12">
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2.5 bg-gradient-to-r from-[#c9a84c] to-[#f0c040] hover:from-[#b8943b] hover:to-[#c9a84c] text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-[#c9a84c]/30 transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 text-base"
                >
                  বায়োডেটা তৈরি করুন
                  <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/search"
                  className="inline-flex items-center justify-center gap-2.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold px-8 py-4 rounded-2xl border border-white/25 transition-all duration-300 hover:-translate-y-0.5 text-base"
                >
                  <FaSearch size={14} /> প্রোফাইল দেখুন
                </Link>
              </div>

              {/* Trust badges */}
              <div className="flex items-center gap-6 flex-wrap">
                {[
                  { icon: FaShieldAlt, text: '১০০% নিরাপদ' },
                  { icon: FaCheckCircle, text: 'যাচাইকৃত প্রোফাইল' },
                  { icon: FaLock, text: 'তথ্য সুরক্ষিত' },
                ].map((b) => (
                  <div key={b.text} className="flex items-center gap-1.5 text-white/60 text-sm">
                    <b.icon size={13} className="text-[#c9a84c]" />
                    {b.text}
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Visual card */}
            <div className={`hidden lg:flex justify-center transition-all duration-700 delay-200 ${heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
              <div className="relative w-[380px]">
                {/* Main card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-7 shadow-2xl">
                  {/* Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-gradient-to-br from-[#c9a84c] to-[#f0c040] rounded-2xl flex items-center justify-center shadow-lg">
                      <span className="text-white text-2xl">☪</span>
                    </div>
                    <div>
                      <p className="text-white font-bold text-sm">Holy Relationship</p>
                      <p className="text-[#c9a84c] text-xs">Marriage Matrimony</p>
                    </div>
                  </div>

                  {/* Mini profile cards */}
                  {[
                    { name: 'রাহেলা বেগম', age: '২৪', loc: 'ঢাকা', edu: 'অনার্স', g: '👩', score: '৯৪%' },
                    { name: 'মাহমুদ হাসান', age: '২৮', loc: 'চট্টগ্রাম', edu: 'মাস্টার্স', g: '👨', score: '৮৯%' },
                  ].map((p, i) => (
                    <div key={i} className="flex items-center gap-3 bg-white/10 rounded-2xl p-3 mb-3 last:mb-0">
                      <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-xl flex-shrink-0">{p.g}</div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-semibold truncate">{p.name}</p>
                        <p className="text-white/60 text-xs">{p.age} বছর · {p.loc} · {p.edu}</p>
                      </div>
                      <span className="text-xs font-bold text-[#c9a84c] bg-[#c9a84c]/20 px-2 py-1 rounded-lg flex-shrink-0">
                        {p.score}
                      </span>
                    </div>
                  ))}

                  {/* Bottom stat strip */}
                  <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-3 gap-3 text-center">
                    {[['৫০K+', 'সদস্য'], ['৫K+', 'বিবাহ'], ['৯৮%', 'সন্তুষ্ট']].map(([n, l]) => (
                      <div key={l}>
                        <p className="text-white font-bold text-sm">{n}</p>
                        <p className="text-white/50 text-xs">{l}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-white animate-pulse" /> অনলাইন
                </div>
                <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-[#c9a84c] to-[#f0c040] text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-lg">
                  🎉 আজ ১২টি নতুন বায়োডেটা
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
            <path d="M0 60L1440 60L1440 20C1080 60 360 0 0 40L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ══════════════ STATS ══════════════ */}
      <section ref={statsRef} className="relative -mt-1 bg-gradient-to-r from-[#1a5276] via-[#154360] to-[#0c3a5e] py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className={`grid grid-cols-2 md:grid-cols-4 gap-8 transition-all duration-700 ${statsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {stats.map((s) => <StatCard key={s.label} stat={s} started={statsVisible} />)}
          </div>
        </div>
      </section>

      {/* ══════════════ FEATURES ══════════════ */}
      <section ref={featuresRef} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-14 transition-all duration-700 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="inline-block text-[#c9a84c] text-sm font-bold tracking-widest uppercase mb-3">আমাদের সুবিধা</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">কেন Holy Relationship?</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#c9a84c] to-[#f0c040] rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {features.map((f, i) => (
              <div
                key={f.title}
                className={`group bg-white border border-gray-100 rounded-2xl p-7 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${featuresVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 80}ms` }}
              >
                <div className={`w-14 h-14 bg-gradient-to-br ${f.bg} rounded-2xl flex items-center justify-center mb-5 shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <f.icon size={22} className="text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
                <div className="mt-5 w-0 group-hover:w-12 h-0.5 bg-gradient-to-r from-[#c9a84c] to-transparent transition-all duration-300 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ HOW IT WORKS ══════════════ */}
      <section ref={stepsRef} className="py-20 bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none select-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="1.5" fill="#1a5276" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-14 transition-all duration-700 ${stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="inline-block text-[#c9a84c] text-sm font-bold tracking-widest uppercase mb-3">সহজ প্রক্রিয়া</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">কিভাবে কাজ করে?</h2>
            <p className="text-gray-500 max-w-lg mx-auto">মাত্র ৪টি সহজ ধাপে আপনার হালাল ম্যাচ খুঁজুন</p>
            <div className="w-16 h-1 bg-gradient-to-r from-[#c9a84c] to-[#f0c040] rounded-full mx-auto mt-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
            {/* Connector line */}
            <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-[#c9a84c]/30 via-[#c9a84c] to-[#c9a84c]/30 z-0" />

            {steps.map((step, i) => (
              <div
                key={step.num}
                className={`relative z-10 transition-all duration-700 ${stepsVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 120}ms` }}
              >
                <div className="bg-white rounded-2xl p-6 text-center shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full">
                  {/* Step number circle */}
                  <div className="w-14 h-14 bg-gradient-to-br from-[#1a5276] to-[#0c3a5e] rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#1a5276]/30 relative z-10">
                    <span className="text-2xl leading-none">{step.icon}</span>
                  </div>
                  <div className="text-[#c9a84c] font-extrabold text-sm mb-2 tracking-widest">{step.num}</div>
                  <h3 className="font-bold text-gray-900 text-base mb-2">{step.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* CTA under steps */}
          <div className={`text-center mt-12 transition-all duration-700 delay-500 ${stepsVisible ? 'opacity-100' : 'opacity-0'}`}>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-[#1a5276] to-[#0c3a5e] hover:from-[#0c3a5e] hover:to-[#1a5276] text-white font-bold px-8 py-3.5 rounded-2xl shadow-lg transition-all duration-300 hover:-translate-y-0.5 text-sm"
            >
              এখনই শুরু করুন <FaArrowRight size={13} />
            </Link>
          </div>
        </div>
      </section>

      {/* ══════════════ PREMIUM SECTION ══════════════ */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-[#0c3a5e] via-[#1a5276] to-[#0d4f3c] rounded-3xl overflow-hidden shadow-2xl">
            {/* Gold top bar */}
            <div className="h-1 bg-gradient-to-r from-[#c9a84c] via-[#f0c040] to-[#c9a84c]" />

            <div className="p-10 lg:p-14 grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <span className="inline-flex items-center gap-2 bg-[#c9a84c]/20 text-[#f0c040] text-xs font-bold px-4 py-2 rounded-full border border-[#c9a84c]/30 mb-5">
                  <FaStar size={10} /> প্রিমিয়াম সদস্যতা
                </span>
                <h2 className="text-3xl font-extrabold text-white mb-4 leading-tight">
                  প্রিমিয়াম নিন,<br />
                  <span className="text-[#c9a84c]">সীমাহীন সুবিধা পান</span>
                </h2>
                <p className="text-white/70 text-sm mb-8 leading-relaxed">
                  প্রিমিয়াম সদস্যরা সীমাহীন যোগাযোগ তথ্য দেখতে পারেন এবং অনেক বেশি সুবিধা উপভোগ করেন।
                </p>
                <Link
                  href="/dashboard/premium"
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-[#c9a84c] to-[#f0c040] text-white font-bold px-7 py-3.5 rounded-2xl shadow-lg shadow-[#c9a84c]/30 transition-all hover:-translate-y-0.5 text-sm"
                >
                  প্রিমিয়াম হোন <FaChevronRight size={12} />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {premiumFeatures.map((feat) => (
                  <div key={feat} className="flex items-center gap-2.5 bg-white/10 rounded-xl px-4 py-3">
                    <div className="w-5 h-5 rounded-full bg-[#c9a84c]/30 flex items-center justify-center flex-shrink-0">
                      <FaCheckCircle size={10} className="text-[#f0c040]" />
                    </div>
                    <span className="text-white/90 text-sm">{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ TESTIMONIALS ══════════════ */}
      <section ref={testimonialRef} className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`text-center mb-14 transition-all duration-700 ${testimonialVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
            <span className="inline-block text-[#c9a84c] text-sm font-bold tracking-widest uppercase mb-3">সফলতার গল্প</span>
            <h2 className="text-3xl lg:text-4xl font-extrabold text-gray-900 mb-3">তাদের কথা</h2>
            <div className="w-16 h-1 bg-gradient-to-r from-[#c9a84c] to-[#f0c040] rounded-full mx-auto" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
            {testimonials.map((t, i) => (
              <div
                key={t.name}
                className={`bg-white rounded-2xl p-7 shadow-md border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 ${testimonialVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ transitionDelay: `${i * 100}ms` }}
              >
                <FaQuoteLeft size={28} className="text-[#c9a84c]/30 mb-4" />
                <p className="text-gray-600 text-sm leading-relaxed mb-6 italic">"{t.text}"</p>
                <div className="flex items-center gap-3 border-t border-gray-50 pt-4">
                  <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[#1a5276] to-[#0c3a5e] flex items-center justify-center text-xl">
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-bold text-gray-800 text-sm">{t.name}</p>
                    <p className="text-gray-400 text-xs">{t.location} · {t.year}</p>
                  </div>
                  <div className="ml-auto flex gap-0.5">
                    {[...Array(5)].map((_, j) => <FaStar key={j} size={10} className="text-[#c9a84c]" />)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ SUPPORT STRIP ══════════════ */}
      <section className="py-10 bg-white border-t border-b border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: FaMobileAlt, title: 'মোবাইল ফ্রেন্ডলি', desc: 'যেকোনো ডিভাইস থেকে ব্যবহার করুন', color: '#1a5276' },
              { icon: FaHeadset, title: '২৪/৭ সহায়তা', desc: 'আমাদের সাপোর্ট টিম সবসময় প্রস্তুত', color: '#1b6a3b' },
              { icon: FaShieldAlt, title: '১০০% নিরাপদ', desc: 'এনক্রিপ্টেড ডেটা ও নিরাপদ পেমেন্ট', color: '#c9a84c' },
            ].map((item) => (
              <div key={item.title} className="flex flex-col items-center gap-3 group">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform"
                  style={{ background: `${item.color}18` }}
                >
                  <item.icon size={20} style={{ color: item.color }} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">{item.title}</p>
                  <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ QURAN VERSE + FINAL CTA ══════════════ */}
      <section className="py-20 bg-gradient-to-br from-[#0c3a5e] via-[#1a5276] to-[#0d4f3c] relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none select-none">
          <svg width="100%" height="100%">
            <defs>
              <pattern id="geo2" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
                <polygon points="30,2 58,16 58,44 30,58 2,44 2,16" fill="none" stroke="#f0c040" strokeWidth="0.6" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#geo2)" />
          </svg>
        </div>

        <div className="relative max-w-3xl mx-auto px-4 text-center">
          {/* Verse */}
          <div className="mb-14">
            <div className="w-16 h-16 bg-gradient-to-br from-[#c9a84c] to-[#f0c040] rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg shadow-[#c9a84c]/30">
              <span className="text-white text-3xl">☪</span>
            </div>
            <p className="text-2xl text-white/90 font-medium leading-relaxed mb-4 font-serif">
              "وَمِنْ آيَاتِهِ أَنْ خَلَقَ لَكُم مِّنْ أَنفُسِكُمْ أَزْوَاجًا لِّتَسْكُنُوا إِلَيْهَا"
            </p>
            <p className="text-white/60 text-sm leading-relaxed max-w-xl mx-auto">
              "তাঁর নিদর্শনসমূহের মধ্যে একটি হলো — তিনি তোমাদের জন্য তোমাদের মধ্য থেকেই সঙ্গিনী সৃষ্টি করেছেন, যাতে তোমরা তার কাছে প্রশান্তি লাভ কর।"
            </p>
            <p className="text-[#c9a84c] text-sm font-semibold mt-2">— সূরা আর-রুম: ২১</p>
          </div>

          {/* Final CTA */}
          <div className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-3xl p-10">
            <h2 className="text-3xl font-extrabold text-white mb-3">
              আজই শুরু করুন হালাল যাত্রা
            </h2>
            <p className="text-white/70 mb-8 text-sm leading-relaxed">
              বিনামূল্যে নিবন্ধন করুন এবং হাজার হাজার যাচাইকৃত প্রোফাইল দেখুন।
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/register?gender=female"
                className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#c9a84c] to-[#f0c040] text-white font-bold px-8 py-4 rounded-2xl shadow-lg shadow-[#c9a84c]/30 hover:-translate-y-0.5 transition-all text-sm"
              >
                👩 কনের বায়োডেটা তৈরি করুন
              </Link>
              <Link
                href="/register?gender=male"
                className="inline-flex items-center justify-center gap-2 bg-white/15 hover:bg-white/25 text-white font-bold px-8 py-4 rounded-2xl border border-white/30 hover:-translate-y-0.5 transition-all text-sm"
              >
                👨 বরের বায়োডেটা তৈরি করুন
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
