'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import {
  FaShieldAlt,
  FaUserLock,
  FaDatabase,
  FaEye,
  FaCookieBite,
  FaShareAlt,
  FaChild,
  FaEdit,
  FaEnvelope,
  FaCheckCircle,
  FaLock,
  FaGlobe,
  FaBell,
  FaTrash,
  FaChevronRight,
} from 'react-icons/fa';

const sections = [
  {
    id: 'collection',
    icon: FaDatabase,
    color: 'from-blue-500 to-[#1a5276]',
    title: 'তথ্য সংগ্রহ',
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
    color: 'from-[#c9a84c] to-amber-600',
    title: 'তথ্য ব্যবহার',
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
    color: 'from-green-500 to-emerald-700',
    title: 'তথ্য সুরক্ষা',
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
    color: 'from-purple-500 to-violet-700',
    title: 'তথ্য শেয়ারিং',
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
    color: 'from-orange-400 to-red-500',
    title: 'কুকি নীতি',
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
    color: 'from-[#1a5276] to-cyan-600',
    title: 'আপনার অধিকার',
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
    color: 'from-pink-400 to-rose-600',
    title: 'অপ্রাপ্তবয়স্কদের সুরক্ষা',
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
    color: 'from-teal-500 to-[#1a5276]',
    title: 'নীতি পরিবর্তন',
    content: [
      {
        subtitle: 'আপডেটের বিজ্ঞপ্তি',
        text: 'গোপনীয়তা নীতিতে কোনো গুরুত্বপূর্ণ পরিবর্তন হলে আমরা আপনার ইমেইলে বা সাইটে বিজ্ঞপ্তি দেব। পরিবর্তনের তারিখ পেজের শীর্ষে উল্লেখ থাকবে।',
      },
      {
        subtitle: 'ব্যবহার অব্যাহত রাখা',
        text: 'নতুন নীতি প্রকাশের পর সেবা ব্যবহার অব্যাহত রাখলে ধরে নেওয়া হবে যে আপনি পরিবর্তিত নীতি স্বীকার করেছেন। আপনি যদি নতুন নীতির সাথে একমত না হন, তাহলে আপনার অ্যাকাউন্ট বন্ধ করে দিন।',
      },
    ],
    highlights: [
      'পরিবর্তনের আগে ইমেইলে জানানো হবে',
      'পরিবর্তনের তারিখ সবসময় উল্লেখ থাকবে',
      'অস্বীকারের ক্ষেত্রে অ্যাকাউন্ট বন্ধের সুবিধা',
    ],
  },
];

const tableOfContents = [
  { id: 'collection', label: 'তথ্য সংগ্রহ' },
  { id: 'usage', label: 'তথ্য ব্যবহার' },
  { id: 'protection', label: 'তথ্য সুরক্ষা' },
  { id: 'sharing', label: 'তথ্য শেয়ারিং' },
  { id: 'cookies', label: 'কুকি নীতি' },
  { id: 'rights', label: 'আপনার অধিকার' },
  { id: 'children', label: 'অপ্রাপ্তবয়স্কদের সুরক্ষা' },
  { id: 'updates', label: 'নীতি পরিবর্তন' },
];

function scrollTo(id) {
  const el = document.getElementById(id);
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function PrivacyPolicyPage() {
  const [activeSection, setActiveSection] = useState('collection');

  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">

        {/* ── Hero ── */}
        <div className="relative bg-gradient-to-br from-[#0c3a5e] via-[#1a5276] to-[#0c3a5e] text-white overflow-hidden">
          {/* Decorative circles */}
          <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-[#c9a84c]/10 rounded-full translate-y-1/2 -translate-x-1/4 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 w-[600px] h-[600px] border border-white/5 rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

          <div className="relative max-w-4xl mx-auto px-4 py-16 text-center">
            {/* Shield icon */}
            <div className="relative inline-flex items-center justify-center mb-6">
              <div className="w-24 h-24 bg-gradient-to-br from-[#c9a84c]/30 to-[#c9a84c]/10 rounded-full flex items-center justify-center border border-[#c9a84c]/30">
                <div className="w-16 h-16 bg-gradient-to-br from-[#c9a84c] to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                  <FaShieldAlt size={28} className="text-white" />
                </div>
              </div>
              <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full flex items-center justify-center border-2 border-[#1a5276]">
                <FaCheckCircle size={10} className="text-white" />
              </div>
            </div>

            <div className="inline-flex items-center gap-2 bg-[#c9a84c]/20 border border-[#c9a84c]/40 rounded-full px-4 py-1.5 text-[#f0d080] text-xs font-medium mb-4">
              <FaLock size={10} />
              সর্বশেষ আপডেট: ১৫ এপ্রিল ২০২৬
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold mb-3 leading-tight">
              গোপনীয়তা নীতি
            </h1>
            <p className="text-white/70 text-sm sm:text-base max-w-xl mx-auto leading-relaxed">
              Holy Relationship আপনার ব্যক্তিগত তথ্যের নিরাপত্তা ও গোপনীয়তাকে সর্বোচ্চ গুরুত্ব দেয়।
              এই নীতিটি আমরা কীভাবে আপনার তথ্য সংগ্রহ, ব্যবহার ও সুরক্ষা করি তা বিস্তারিত ব্যাখ্যা করে।
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-6 mt-8">
              {[
                { icon: FaLock, label: 'SSL এনক্রিপশন', sub: 'সম্পূর্ণ সুরক্ষিত' },
                { icon: FaUserLock, label: 'ডেটা প্রাইভেসি', sub: 'তথ্য বিক্রি হয় না' },
                { icon: FaGlobe, label: 'GDPR সম্মত', sub: 'আন্তর্জাতিক মান' },
              ].map(({ icon: Icon, label, sub }) => (
                <div key={label} className="flex items-center gap-3 bg-white/10 rounded-2xl px-5 py-3">
                  <Icon size={20} className="text-[#c9a84c]" />
                  <div className="text-left">
                    <p className="font-semibold text-sm">{label}</p>
                    <p className="text-white/60 text-xs">{sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Gold divider ── */}
        <div className="h-1 bg-gradient-to-r from-transparent via-[#c9a84c] to-transparent" />

        {/* ── Body: sidebar + content ── */}
        <div className="max-w-6xl mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8 items-start">

            {/* Sticky sidebar — Table of Contents */}
            <aside className="lg:sticky lg:top-24 w-full lg:w-64 flex-shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-[#1a5276] to-[#0c3a5e] px-5 py-4">
                  <p className="text-white font-bold text-sm">বিষয়সূচী</p>
                  <p className="text-white/60 text-xs mt-0.5">যেকোনো অংশে যান</p>
                </div>
                <nav className="p-2">
                  {tableOfContents.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => { scrollTo(item.id); setActiveSection(item.id); }}
                      className={`w-full text-left flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                        activeSection === item.id
                          ? 'bg-[#1a5276]/10 text-[#1a5276] font-semibold'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-[#1a5276]'
                      }`}
                    >
                      <span>{item.label}</span>
                      <FaChevronRight
                        size={10}
                        className={activeSection === item.id ? 'text-[#c9a84c]' : 'text-gray-300'}
                      />
                    </button>
                  ))}
                </nav>

                {/* Quick contact in sidebar */}
                <div className="mx-3 mb-3 mt-1 bg-[#c9a84c]/10 border border-[#c9a84c]/20 rounded-xl p-4">
                  <p className="text-xs font-semibold text-[#1a5276] mb-1">প্রশ্ন আছে?</p>
                  <p className="text-xs text-gray-500 mb-3">আমাদের সাথে সরাসরি কথা বলুন</p>
                  <Link
                    href="/contact"
                    className="block text-center text-xs bg-[#1a5276] text-white rounded-lg py-2 font-medium hover:bg-[#0c3a5e] transition-colors"
                  >
                    যোগাযোগ করুন
                  </Link>
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 space-y-6">

              {/* Intro card */}
              <div className="bg-gradient-to-br from-[#1a5276]/5 to-[#c9a84c]/5 border border-[#1a5276]/10 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-[#c9a84c]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FaShieldAlt size={18} className="text-[#c9a84c]" />
                  </div>
                  <div>
                    <h2 className="font-bold text-[#1a5276] mb-2">Holy Relationship-এর প্রতিশ্রুতি</h2>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      আমরা বিশ্বাস করি আপনার ব্যক্তিগত তথ্য আপনার সম্পদ। ইসলামিক মূল্যবোধ ও আধুনিক ডেটা সুরক্ষার নীতি মেনে আমরা আপনার গোপনীয়তা রক্ষায় প্রতিশ্রুতিবদ্ধ।
                    </p>
                  </div>
                </div>
              </div>

              {/* Policy sections */}
              {sections.map((section, idx) => {
                const Icon = section.icon;
                return (
                  <div
                    key={section.id}
                    id={section.id}
                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden scroll-mt-24"
                  >
                    {/* Section header */}
                    <div className={`bg-gradient-to-r ${section.color} p-5 flex items-center gap-4`}>
                      <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon size={18} className="text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-white/50 text-xs font-mono">০{idx + 1}</span>
                          <h2 className="text-white font-bold text-base">{section.title}</h2>
                        </div>
                      </div>
                    </div>

                    <div className="p-6">
                      {/* Content blocks */}
                      <div className="space-y-5 mb-6">
                        {section.content.map((block) => (
                          <div key={block.subtitle}>
                            <h3 className="font-semibold text-gray-800 text-sm mb-1.5 flex items-center gap-2">
                              <span className="w-1.5 h-1.5 bg-[#c9a84c] rounded-full inline-block" />
                              {block.subtitle}
                            </h3>
                            <p className="text-sm text-gray-600 leading-relaxed pl-3.5">
                              {block.text}
                            </p>
                          </div>
                        ))}
                      </div>

                      {/* Highlights */}
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                          মূল বিষয়সমূহ
                        </p>
                        <ul className="space-y-2">
                          {section.highlights.map((h) => (
                            <li key={h} className="flex items-start gap-2.5 text-sm text-gray-700">
                              <FaCheckCircle size={13} className="text-green-500 flex-shrink-0 mt-0.5" />
                              {h}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Contact CTA */}
              <div className="bg-gradient-to-br from-[#1a5276] to-[#0c3a5e] rounded-2xl p-8 text-white text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 pointer-events-none" />
                <div className="relative">
                  <div className="w-14 h-14 bg-[#c9a84c]/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-[#c9a84c]/30">
                    <FaEnvelope size={22} className="text-[#c9a84c]" />
                  </div>
                  <h3 className="font-bold text-xl mb-2">গোপনীয়তা সম্পর্কে প্রশ্ন আছে?</h3>
                  <p className="text-white/70 text-sm mb-6 max-w-sm mx-auto leading-relaxed">
                    আমাদের ডেডিকেটেড প্রাইভেসি টিম আপনার যেকোনো প্রশ্নের উত্তর দিতে সদা প্রস্তুত।
                    ২৪ ঘণ্টার মধ্যে উত্তর দেওয়ার নিশ্চয়তা দিচ্ছি।
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center gap-2 bg-[#c9a84c] hover:bg-amber-500 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm"
                    >
                      <FaEnvelope size={14} />
                      যোগাযোগ করুন
                    </Link>
                    <Link
                      href="/faq"
                      className="inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-7 py-3 rounded-xl transition-colors text-sm border border-white/20"
                    >
                      FAQ দেখুন
                    </Link>
                  </div>
                  <p className="text-white/40 text-xs mt-5">
                    ইমেইল: privacy@holyrelationship.com
                  </p>
                </div>
              </div>

              {/* Footer note */}
              <div className="text-center text-xs text-gray-400 pb-4">
                এই নীতি সর্বশেষ ১৫ এপ্রিল ২০২৬ তারিখে আপডেট করা হয়েছে।
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
