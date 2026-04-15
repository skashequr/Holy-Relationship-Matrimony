'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileCard from '@/components/ProfileCard';
import { SkeletonCard } from '@/components/LoadingSpinner';
import { useAuth } from '@/contexts/AuthContext';
import { matchAPI, searchAPI, biodataAPI } from '@/lib/api';
import {
  FaHeart, FaSearch, FaList, FaFileAlt,
  FaCheckCircle, FaExclamationCircle, FaStar,
  FaArrowRight, FaTimes, FaFilter, FaRing,
  FaUsers, FaMale, FaFemale, FaThumbsUp,
  FaEdit, FaComments, FaCrown, FaBell, FaSparkles,
} from 'react-icons/fa';
import { MdVerified } from 'react-icons/md';
import toast from 'react-hot-toast';

/* ── Geometric SVG background for hero ─────────────────────────── */
const HeroBg = () => (
  <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="geo" x="0" y="0" width="60" height="60" patternUnits="userSpaceOnUse">
        <polygon points="30,2 58,16 58,44 30,58 2,44 2,16" fill="none" stroke="white" strokeWidth="1" />
        <polygon points="30,14 46,22 46,38 30,46 14,38 14,22" fill="none" stroke="white" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#geo)" />
  </svg>
);

/* ── Stat card ──────────────────────────────────────────────────── */
function StatCard({ icon, value, label, gradient }) {
  return (
    <div className="relative bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden group hover:shadow-md transition-shadow">
      <div className={`absolute top-0 left-0 w-1 h-full ${gradient}`} />
      <div className="p-4 pl-5">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${gradient} bg-opacity-10`}>
          <span className="text-white text-sm">{icon}</span>
        </div>
        <p className="text-2xl font-black text-gray-800 leading-none mb-1">{value ?? '—'}</p>
        <p className="text-xs text-gray-500 font-medium">{label}</p>
      </div>
    </div>
  );
}

/* ── Quick action card ──────────────────────────────────────────── */
function ActionCard({ href, icon, label, desc, gradient, badge }) {
  return (
    <Link href={href}
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex flex-col items-center text-center gap-2 hover:shadow-md hover:-translate-y-0.5 transition-all group overflow-hidden"
    >
      {badge && (
        <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full leading-none">{badge}</span>
      )}
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${gradient} shadow-md group-hover:scale-110 transition-transform`}>
        <span className="text-white text-lg">{icon}</span>
      </div>
      <p className="text-xs font-bold text-gray-800 leading-tight">{label}</p>
      {desc && <p className="text-[10px] text-gray-400 leading-tight">{desc}</p>}
    </Link>
  );
}

/* ── Section header ─────────────────────────────────────────────── */
function SectionHeader({ icon, title, subtitle, href, hrefLabel }) {
  return (
    <div className="flex items-end justify-between mb-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a5276] to-[#1b6a3b] flex items-center justify-center shadow-sm">
          <span className="text-white text-sm">{icon}</span>
        </div>
        <div>
          <h2 className="font-bold text-gray-800 text-base leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link href={href} className="text-xs text-[#1a5276] font-semibold hover:underline flex items-center gap-1">
          {hrefLabel || 'সব দেখুন'} <FaArrowRight size={10} />
        </Link>
      )}
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════ */
export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  const [recommended, setRecommended] = useState([]);
  const [newProfiles, setNewProfiles] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marriedModal, setMarriedModal] = useState(false);
  const [marriedVia, setMarriedVia] = useState(null);
  const [marriedLoading, setMarriedLoading] = useState(false);
  const [completeness, setCompleteness] = useState(null);

  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [ageResults, setAgeResults] = useState([]);
  const [ageSearchLoading, setAgeSearchLoading] = useState(false);
  const [ageSearchDone, setAgeSearchDone] = useState(false);
  const [ageTotal, setAgeTotal] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [recRes, newRes, statsRes, compRes] = await Promise.all([
          matchAPI.getRecommended({ limit: 4 }),
          matchAPI.getNewProfiles(),
          matchAPI.getStats(),
          matchAPI.getCompleteness(),
        ]);
        setRecommended(recRes.data?.profiles || []);
        setNewProfiles(newRes.data?.data || []);
        setStats(statsRes.data?.stats || null);
        setCompleteness(compRes.data || null);
      } catch {
        toast.error('ড্যাশবোর্ড লোড করতে সমস্যা হয়েছে।');
      } finally { setLoading(false); }
    };
    fetchData();
  }, []);

  const handleAgeSearch = useCallback(async () => {
    if (!ageMin && !ageMax) return;
    if (ageMin && ageMax && Number(ageMin) > Number(ageMax)) {
      toast.error('সর্বনিম্ন বয়স সর্বোচ্চ বয়সের চেয়ে বেশি হতে পারবে না।');
      return;
    }
    setAgeSearchLoading(true);
    setAgeSearchDone(false);
    try {
      const params = { limit: 8 };
      if (ageMin) params.ageMin = ageMin;
      if (ageMax) params.ageMax = ageMax;
      const { data } = await searchAPI.search(params);
      setAgeResults(data.data || []);
      setAgeTotal(data.pagination?.total || 0);
      setAgeSearchDone(true);
    } catch {
      toast.error('অনুসন্ধান করতে সমস্যা হয়েছে।');
    } finally { setAgeSearchLoading(false); }
  }, [ageMin, ageMax]);

  const handleAgeClear = () => {
    setAgeMin(''); setAgeMax('');
    setAgeResults([]); setAgeSearchDone(false); setAgeTotal(0);
  };

  const handleViewAll = () => {
    const params = new URLSearchParams();
    if (ageMin) params.set('ageMin', ageMin);
    if (ageMax) params.set('ageMax', ageMax);
    router.push(`/search?${params.toString()}`);
  };

  const handleMarried = async () => {
    if (!marriedVia) { toast.error('একটি অপশন বেছে নিন'); return; }
    setMarriedLoading(true);
    try {
      await biodataAPI.markMarried(marriedVia);
      toast.success('আল্লাহুমা বারিক! বিয়ে হিসেবে চিহ্নিত হয়েছে।');
      setMarriedModal(false);
    } catch (err) {
      toast.error(err.response?.data?.messageBn || 'সমস্যা হয়েছে');
    } finally { setMarriedLoading(false); }
  };

  const quickActions = [
    {
      href: user?.biodataId ? '/biodata' : '/biodata/create',
      icon: <FaFileAlt />,
      label: user?.biodataId ? 'আমার বায়োডেটা' : 'বায়োডেটা তৈরি করুন',
      desc: user?.biodataId ? 'দেখুন ও সম্পাদনা করুন' : 'এখনই শুরু করুন',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-700',
    },
    {
      href: '/search',
      icon: <FaSearch />,
      label: 'প্রোফাইল খুঁজুন',
      desc: 'ফিল্টার করে খুঁজুন',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-700',
    },
    {
      href: '/matches',
      icon: <FaHeart />,
      label: 'পছন্দের ম্যাচ',
      desc: 'সেরা মিল দেখুন',
      gradient: 'bg-gradient-to-br from-rose-500 to-pink-600',
    },
    {
      href: '/shortlist',
      icon: <FaList />,
      label: 'শর্টলিস্ট',
      desc: 'সংরক্ষিত প্রোফাইল',
      gradient: 'bg-gradient-to-br from-emerald-500 to-green-700',
    },
    {
      href: '/dashboard/interests',
      icon: <FaRing />,
      label: 'ইন্টারেস্ট',
      desc: 'পাঠানো ও পাওয়া',
      gradient: 'bg-gradient-to-br from-amber-500 to-orange-600',
    },
    {
      href: '/dashboard/messages',
      icon: <FaComments />,
      label: 'বার্তা',
      desc: 'কথোপকথন দেখুন',
      gradient: 'bg-gradient-to-br from-teal-500 to-cyan-600',
    },
    {
      href: '/dashboard/premium',
      icon: <FaCrown />,
      label: 'প্রিমিয়াম',
      desc: 'সুবিধা উপভোগ করুন',
      gradient: 'bg-gradient-to-br from-yellow-400 to-amber-600',
    },
    {
      href: '/notifications',
      icon: <FaBell />,
      label: 'বিজ্ঞপ্তি',
      desc: 'সর্বশেষ আপডেট',
      gradient: 'bg-gradient-to-br from-indigo-500 to-violet-600',
    },
  ];

  const cpct = completeness?.percentage ?? 0;
  const cpctColor = cpct >= 80 ? 'text-green-600' : cpct >= 60 ? 'text-blue-600' : cpct >= 40 ? 'text-yellow-600' : 'text-red-500';
  const barColor = cpct >= 80 ? 'from-green-400 to-green-600' : cpct >= 60 ? 'from-blue-400 to-blue-600' : cpct >= 40 ? 'from-yellow-400 to-yellow-600' : 'from-red-400 to-red-500';

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* ── HERO WELCOME BANNER ─────────────────────────────────── */}
        <div className="relative bg-gradient-to-br from-[#0c3a5e] via-[#1a5276] to-[#1b6a3b] rounded-3xl overflow-hidden shadow-xl">
          <HeroBg />

          {/* Glowing orb */}
          <div className="absolute -top-16 -right-16 w-48 h-48 bg-[#c9a84c]/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div className="relative p-6 sm:p-8">
            <div className="flex items-start justify-between gap-4">
              {/* Left: text */}
              <div className="flex-1 min-w-0">
                <p className="text-white/60 text-sm mb-1 tracking-wide">আস্সালামু আলাইকুম</p>
                <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight truncate">
                  স্বাগতম, {user?.name}!
                </h1>

                {/* Badges */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${
                    user?.gender === 'male'
                      ? 'bg-blue-400/20 text-blue-200 border border-blue-400/30'
                      : 'bg-pink-400/20 text-pink-200 border border-pink-400/30'
                  }`}>
                    {user?.gender === 'male' ? '👨 পুরুষ সদস্য' : '👩 মহিলা সদস্য'}
                  </span>
                  {user?.verificationBadge && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-white/20 text-white border border-white/20">
                      <MdVerified className="text-green-300" size={13} /> যাচাইকৃত
                    </span>
                  )}
                  {user?.isPremium && (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-3 py-1 rounded-full bg-[#c9a84c]/30 text-yellow-200 border border-[#c9a84c]/40">
                      <FaCrown size={10} /> প্রিমিয়াম
                    </span>
                  )}
                </div>
              </div>

              {/* Right: avatar */}
              <div className="flex-shrink-0">
                {user?.profilePicture ? (
                  <Image
                    src={user.profilePicture}
                    alt={user.name}
                    width={72}
                    height={72}
                    className="rounded-2xl border-2 border-white/30 shadow-lg object-cover"
                  />
                ) : (
                  <div className="w-16 h-16 sm:w-[72px] sm:h-[72px] rounded-2xl border-2 border-white/30 bg-white/10 flex items-center justify-center text-2xl shadow-lg">
                    {user?.gender === 'male' ? '👨' : '👩'}
                  </div>
                )}
              </div>
            </div>

            {/* CTA strip */}
            <div className="mt-5">
              {!user?.biodataId ? (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center gap-3 border border-white/10">
                  <div className="w-9 h-9 rounded-xl bg-[#c9a84c] flex items-center justify-center flex-shrink-0 shadow-md">
                    <FaExclamationCircle className="text-white" size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white leading-tight">বায়োডেটা এখনো তৈরি হয়নি</p>
                    <p className="text-xs text-white/60 mt-0.5">তৈরি করুন এবং যোগাযোগ পেতে শুরু করুন।</p>
                  </div>
                  <Link
                    href="/biodata/create"
                    className="bg-[#c9a84c] hover:bg-[#b8943b] text-white text-xs font-bold px-4 py-2 rounded-xl whitespace-nowrap transition-colors shadow-md flex-shrink-0"
                  >
                    এখনই করুন →
                  </Link>
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 flex items-center justify-between gap-3 border border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-green-500/80 flex items-center justify-center flex-shrink-0 shadow-md">
                      <FaCheckCircle className="text-white" size={15} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white">বায়োডেটা সক্রিয় আছে</p>
                      <p className="text-xs text-white/60">আপনার প্রোফাইল সবার জন্য দৃশ্যমান</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setMarriedModal(true)}
                    className="bg-green-500 hover:bg-green-400 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 whitespace-nowrap transition-colors shadow-md flex-shrink-0"
                  >
                    <FaRing size={11} /> বিয়ে হয়েছে ✓
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── PLATFORM STATS ─────────────────────────────────────── */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <StatCard icon={<FaUsers />} value={stats.totalUsers?.toLocaleString('bn-BD')} label="মোট সদস্য" gradient="bg-gradient-to-br from-[#1a5276] to-blue-700" />
            <StatCard icon={<FaMale />} value={stats.maleBiodatas?.toLocaleString('bn-BD')} label="পুরুষ বায়োডেটা" gradient="bg-gradient-to-br from-sky-500 to-sky-700" />
            <StatCard icon={<FaFemale />} value={stats.femaleBiodatas?.toLocaleString('bn-BD')} label="মহিলা বায়োডেটা" gradient="bg-gradient-to-br from-pink-500 to-rose-600" />
            <StatCard icon={<FaThumbsUp />} value={stats.approvedBiodatas?.toLocaleString('bn-BD')} label="অনুমোদিত" gradient="bg-gradient-to-br from-[#1b6a3b] to-emerald-700" />
          </div>
        )}

        {/* ── QUICK ACTIONS ──────────────────────────────────────── */}
        <div>
          <SectionHeader icon={<FaFilter />} title="দ্রুত অ্যাকশন" subtitle="যা করতে চান সরাসরি যান" />
          <div className="grid grid-cols-4 sm:grid-cols-4 md:grid-cols-8 gap-3">
            {quickActions.map((a) => (
              <ActionCard key={a.href} {...a} />
            ))}
          </div>
        </div>

        {/* ── PROFILE COMPLETENESS ───────────────────────────────── */}
        {completeness && user?.biodataId && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {/* Header */}
            <div className="px-5 pt-5 pb-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1a5276] to-[#1b6a3b] flex items-center justify-center shadow-sm">
                  <FaCheckCircle className="text-white" size={14} />
                </div>
                <div>
                  <h2 className="font-bold text-gray-800 text-base leading-tight">প্রোফাইল সম্পূর্ণতা</h2>
                  <p className="text-xs text-gray-400 mt-0.5">যত সম্পূর্ণ, ম্যাচ তত ভালো</p>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-3xl font-black ${cpctColor}`}>{cpct}%</span>
                <p className="text-[10px] text-gray-400 mt-0.5">সম্পূর্ণ</p>
              </div>
            </div>

            {/* Main bar */}
            <div className="px-5 pb-4">
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700`}
                  style={{ width: `${cpct}%` }}
                />
              </div>
            </div>

            {/* Section bars */}
            {completeness.sections?.length > 0 && (
              <div className="px-5 pb-4 grid grid-cols-3 sm:grid-cols-5 gap-3">
                {completeness.sections.map((sec) => {
                  const pct = Math.round((sec.earned / sec.max) * 100);
                  const secColor = pct === 100 ? 'from-green-400 to-green-600' : pct >= 60 ? 'from-blue-400 to-blue-500' : 'from-yellow-400 to-yellow-500';
                  return (
                    <div key={sec.name} className="bg-gray-50 rounded-xl p-2.5 text-center border border-gray-100">
                      <div className="text-lg mb-1">{sec.icon}</div>
                      <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden mb-1.5">
                        <div className={`h-full rounded-full bg-gradient-to-r ${secColor}`} style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-[10px] text-gray-500 truncate">{sec.label}</p>
                      <p className={`text-xs font-bold ${pct === 100 ? 'text-green-600' : 'text-gray-700'}`}>{pct}%</p>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Suggestions */}
            {completeness.suggestions?.length > 0 && cpct < 100 && (
              <div className="mx-5 mb-5 bg-amber-50 border border-amber-100 rounded-xl p-3">
                <p className="text-xs font-bold text-amber-700 mb-2">📝 এগুলো যোগ করলে ম্যাচ আরো ভালো হবে:</p>
                <div className="flex flex-wrap gap-2 mb-2">
                  {completeness.suggestions.map((s, i) => (
                    <span key={i} className="inline-flex items-center gap-1 text-xs bg-white border border-amber-200 text-amber-700 px-2.5 py-1 rounded-full font-medium">
                      +{s.pts}pts · {s.field}
                    </span>
                  ))}
                </div>
                <Link href="/biodata" className="text-xs text-amber-700 font-bold hover:underline flex items-center gap-1">
                  <FaEdit size={10} /> বায়োডেটা আপডেট করুন
                </Link>
              </div>
            )}
            {cpct === 100 && (
              <div className="mx-5 mb-5 bg-green-50 border border-green-100 rounded-xl p-3 text-center">
                <p className="text-sm font-bold text-green-700">🎉 আপনার প্রোফাইল ১০০% সম্পূর্ণ!</p>
              </div>
            )}
          </div>
        )}

        {/* ── AGE QUICK SEARCH ───────────────────────────────────── */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-[#1a5276]/5 to-[#1b6a3b]/5 px-5 pt-5 pb-4 border-b border-gray-100">
            <SectionHeader icon={<FaSearch />} title="বয়স দিয়ে দ্রুত খুঁজুন" subtitle="পছন্দের বয়সসীমা দিয়ে প্রোফাইল খুঁজুন" />

            <div className="flex flex-wrap items-end gap-3">
              {/* Min */}
              <div className="flex-1 min-w-[100px]">
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">বয়স থেকে</label>
                <div className="relative">
                  <input type="number" value={ageMin} onChange={(e) => setAgeMin(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAgeSearch()}
                    placeholder="১৮" min={18} max={60} className="input-field text-sm pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">বছর</span>
                </div>
              </div>
              <span className="text-gray-300 font-bold pb-3 text-lg">—</span>
              {/* Max */}
              <div className="flex-1 min-w-[100px]">
                <label className="text-xs font-semibold text-gray-500 block mb-1.5">বয়স পর্যন্ত</label>
                <div className="relative">
                  <input type="number" value={ageMax} onChange={(e) => setAgeMax(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAgeSearch()}
                    placeholder="৩৫" min={18} max={60} className="input-field text-sm pr-10" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 pointer-events-none">বছর</span>
                </div>
              </div>

              {/* Presets */}
              <div className="flex flex-wrap gap-2 pb-0.5">
                {[
                  { label: '১৮–২৫', min: '18', max: '25' },
                  { label: '২৫–৩০', min: '25', max: '30' },
                  { label: '৩০–৩৫', min: '30', max: '35' },
                  { label: '৩৫–৪৫', min: '35', max: '45' },
                ].map((p) => (
                  <button key={p.label}
                    onClick={() => { setAgeMin(p.min); setAgeMax(p.max); }}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-all ${
                      ageMin === p.min && ageMax === p.max
                        ? 'bg-[#1a5276] text-white border-[#1a5276] shadow-sm'
                        : 'bg-white text-gray-500 border-gray-200 hover:border-[#1a5276] hover:text-[#1a5276]'
                    }`}
                  >{p.label}</button>
                ))}
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pb-0.5">
                <button onClick={handleAgeSearch}
                  disabled={ageSearchLoading || (!ageMin && !ageMax)}
                  className="btn-primary px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
                >
                  {ageSearchLoading
                    ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    : <FaSearch size={12} />}
                  খুঁজুন
                </button>
                {(ageMin || ageMax || ageSearchDone) && (
                  <button onClick={handleAgeClear}
                    className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 transition-colors"
                    title="ক্লিয়ার"
                  ><FaTimes size={13} /></button>
                )}
              </div>
            </div>
          </div>

          {/* Search results */}
          {ageSearchDone && (
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-semibold text-gray-700">
                  {ageTotal > 0 ? (
                    <><span className="text-[#1a5276] font-bold">{ageTotal} টি</span> প্রোফাইল পাওয়া গেছে
                      {ageMin && ageMax && <span className="text-gray-400 font-normal"> ({ageMin}–{ageMax} বছর)</span>}
                    </>
                  ) : (
                    <span className="text-gray-400">কোনো প্রোফাইল পাওয়া যায়নি</span>
                  )}
                </p>
                {ageTotal > 8 && (
                  <button onClick={handleViewAll}
                    className="text-xs text-[#1a5276] font-semibold hover:underline flex items-center gap-1">
                    সব দেখুন ({ageTotal}) <FaArrowRight size={10} />
                  </button>
                )}
              </div>

              {ageResults.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                  {ageResults.map((biodata) => <ProfileCard key={biodata._id} biodata={biodata} />)}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <FaSearch className="mx-auto mb-2 text-gray-200" size={32} />
                  <p className="text-sm">এই বয়সসীমায় কোনো প্রোফাইল নেই</p>
                  <p className="text-xs mt-1">ভিন্ন বয়সসীমা দিয়ে চেষ্টা করুন</p>
                </div>
              )}

              {ageTotal > 8 && (
                <div className="text-center mt-5">
                  <button onClick={handleViewAll}
                    className="btn-outline px-6 py-2.5 rounded-xl text-sm inline-flex items-center gap-2">
                    <FaFilter size={12} /> সব {ageTotal} টি প্রোফাইল দেখুন
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* ── RECOMMENDED PROFILES ───────────────────────────────── */}
        <div>
          <SectionHeader
            icon={<FaStar />}
            title="পছন্দের ম্যাচ"
            subtitle="আপনার পছন্দ অনুযায়ী সেরা প্রোফাইল"
            href="/matches"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {loading ? (
              Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            ) : recommended.length > 0 ? (
              recommended.map((item) => (
                <ProfileCard key={item._id} biodata={item} showScore score={item.compatibilityScore} />
              ))
            ) : (
              <div className="col-span-full bg-white rounded-2xl border border-gray-100 shadow-sm text-center py-14 text-gray-400">
                <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <FaHeart className="text-red-300" size={28} />
                </div>
                <p className="font-medium text-gray-500">এখনো কোনো ম্যাচ নেই</p>
                <p className="text-sm mt-1">বায়োডেটা তৈরি করলে ম্যাচ দেখা যাবে।</p>
                <Link href="/biodata/create" className="mt-4 inline-block btn-primary text-sm px-5 py-2.5 rounded-xl">
                  বায়োডেটা তৈরি করুন
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ── NEW PROFILES ───────────────────────────────────────── */}
        {newProfiles.length > 0 && (
          <div>
            <SectionHeader
              icon={<FaUsers />}
              title="নতুন যোগ দিয়েছেন"
              subtitle="সম্প্রতি যোগ দেওয়া প্রোফাইল"
              href="/search"
              hrefLabel="সব দেখুন"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {newProfiles.slice(0, 4).map((biodata) => (
                <ProfileCard key={biodata._id} biodata={biodata} />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── MARRIED CONFIRMATION MODAL ─────────────────────────── */}
      {marriedModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setMarriedModal(false)}>
          <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-gradient-to-br from-[#1a5276] to-[#1b6a3b] p-6 text-center relative overflow-hidden">
              <div className="absolute inset-0 opacity-10">
                <svg width="100%" height="100%"><pattern id="mp" width="30" height="30" patternUnits="userSpaceOnUse"><polygon points="15,1 29,8 29,22 15,29 1,22 1,8" fill="none" stroke="white" strokeWidth="0.5"/></pattern><rect width="100%" height="100%" fill="url(#mp)"/></svg>
              </div>
              <div className="relative">
                <div className="text-5xl mb-2">💍</div>
                <h3 className="font-black text-white text-xl">আল্লাহুমা বারিক!</h3>
                <p className="text-white/70 text-sm mt-1">বিয়ে হওয়ার জন্য আন্তরিক শুভেচ্ছা</p>
              </div>
            </div>

            <div className="p-6">
              <p className="text-sm text-gray-600 text-center mb-4">বিয়েটি কীভাবে হয়েছে?</p>
              <div className="space-y-2 mb-5">
                {[
                  { value: 'এই সাইটের মাধ্যমে', label: '✅ এই সাইটের মাধ্যমে হয়েছে' },
                  { value: 'অন্যভাবে', label: '🔄 অন্যভাবে হয়েছে' },
                ].map((opt) => (
                  <button key={opt.value} onClick={() => setMarriedVia(opt.value)}
                    className={`w-full py-3 rounded-xl border-2 font-semibold text-sm transition-all ${
                      marriedVia === opt.value
                        ? 'border-[#1b6a3b] bg-green-50 text-[#1b6a3b] shadow-sm'
                        : 'border-gray-200 text-gray-600 hover:border-gray-300 bg-white'
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={() => { setMarriedModal(false); setMarriedVia(null); }}
                  className="flex-1 btn-outline py-3 rounded-xl text-sm">বাতিল</button>
                <button onClick={handleMarried} disabled={!marriedVia || marriedLoading}
                  className="flex-1 bg-gradient-to-r from-[#1b6a3b] to-green-600 hover:from-green-700 hover:to-[#1b6a3b] text-white font-bold py-3 rounded-xl text-sm disabled:opacity-50 transition-all shadow-md">
                  {marriedLoading ? 'প্রক্রিয়াধীন...' : 'নিশ্চিত করুন'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
