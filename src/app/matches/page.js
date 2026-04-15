'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { SkeletonCard } from '@/components/LoadingSpinner';
import { matchAPI, biodataAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  formatAge, formatHeight, educationLabels, professionLabels,
} from '@/lib/utils';
import {
  FaStar, FaHeart, FaRegHeart, FaMapMarkerAlt,
  FaGraduationCap, FaBriefcase, FaChevronDown, FaEye,
  FaRobot, FaFilter, FaCheckCircle,
} from 'react-icons/fa';
import toast from 'react-hot-toast';

const SCORE_TIERS = [
  { label: 'সব', value: 0, color: 'bg-gray-100 text-gray-600' },
  { label: '৬০%+', value: 60, color: 'bg-blue-100 text-blue-700' },
  { label: '৭৫%+', value: 75, color: 'bg-green-100 text-green-700' },
  { label: '৮৫%+', value: 85, color: 'bg-emerald-100 text-emerald-700' },
];

const BREAKDOWN_META = {
  religious: { label: 'ধর্মীয়', color: 'bg-green-500', max: 30 },
  age:       { label: 'বয়স',    color: 'bg-blue-500',  max: 20 },
  location:  { label: 'এলাকা',  color: 'bg-purple-500', max: 15 },
  education: { label: 'শিক্ষা', color: 'bg-yellow-500', max: 15 },
  profession:{ label: 'পেশা',   color: 'bg-orange-500', max: 10 },
  lifestyle: { label: 'জীবন',   color: 'bg-pink-500',   max: 10 },
};

function scoreBadgeClass(score) {
  if (score >= 80) return 'bg-emerald-100 text-emerald-700 border-emerald-200';
  if (score >= 60) return 'bg-blue-100 text-blue-700 border-blue-200';
  if (score >= 40) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
  return 'bg-gray-100 text-gray-500 border-gray-200';
}

function ScoreRing({ score }) {
  const r = 22;
  const circ = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const color = score >= 80 ? '#10b981' : score >= 60 ? '#3b82f6' : score >= 40 ? '#f59e0b' : '#9ca3af';
  return (
    <svg width="56" height="56" className="rotate-[-90deg]">
      <circle cx="28" cy="28" r={r} fill="none" stroke="#f3f4f6" strokeWidth="4" />
      <circle cx="28" cy="28" r={r} fill="none" stroke={color} strokeWidth="4"
        strokeDasharray={`${filled} ${circ - filled}`} strokeLinecap="round" />
      <text x="28" y="32" textAnchor="middle" className="rotate-90"
        style={{ fontSize: 12, fontWeight: 700, fill: color, transform: 'rotate(90deg)', transformOrigin: '28px 28px' }}>
        {score}%
      </text>
    </svg>
  );
}

function MatchCard({ biodata }) {
  const { user } = useAuth();
  const [showBreakdown, setShowBreakdown] = useState(false);
  const [shortlisted, setShortlisted] = useState(
    user?.shortlistedProfiles?.includes(biodata?.userId?._id || biodata?.userId)
  );

  const profile = biodata?.userId || {};
  const personal = biodata?.personal || {};
  const education = biodata?.education || {};
  const profession = biodata?.profession || {};
  const address = biodata?.address || {};
  const score = biodata?.compatibilityScore ?? 0;
  const breakdown = biodata?.scoreBreakdown || {};
  const reasons = biodata?.matchReasons || [];

  const handleShortlist = async (e) => {
    e.preventDefault();
    try {
      const { data } = await biodataAPI.toggleShortlist(biodata._id);
      setShortlisted(data.isShortlisted);
      toast.success(data.isShortlisted ? 'শর্টলিস্টে যোগ হয়েছে' : 'সরানো হয়েছে');
    } catch { toast.error('সমস্যা হয়েছে'); }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden">
      {/* Photo */}
      <Link href={`/profile/${biodata._id}`} className="relative block">
        <div className="h-44 bg-gradient-to-br from-[#1a5276]/10 to-[#1b6a3b]/10">
          {profile.profilePicture || biodata.profilePicture ? (
            <Image src={profile.profilePicture || biodata.profilePicture}
              alt={personal.fullName || ''} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl text-gray-200">
              {profile.gender === 'male' ? '👨' : '👩'}
            </div>
          )}
        </div>
        {/* Score ring overlay */}
        <div className="absolute top-2 right-2 bg-white/90 rounded-full p-0.5 shadow">
          <ScoreRing score={score} />
        </div>
        {/* Shortlist */}
        <button onClick={handleShortlist}
          className="absolute top-2 left-2 w-8 h-8 bg-white/90 rounded-full shadow flex items-center justify-center hover:bg-white transition-all">
          {shortlisted ? <FaHeart size={14} className="text-red-500" /> : <FaRegHeart size={14} className="text-gray-400" />}
        </button>
      </Link>

      {/* Info */}
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/profile/${biodata._id}`} className="flex-1">
          <h3 className="font-bold text-gray-800 truncate text-sm">{personal.fullName || 'নাম অজানা'}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            {formatAge(personal.age, 'bn')}
            {personal.height ? ` · ${formatHeight(personal.height, 'bn')}` : ''}
          </p>

          <div className="mt-2 space-y-1">
            {address.permanentDistrict && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <FaMapMarkerAlt size={9} className="text-[#1a5276] flex-shrink-0" />
                <span className="truncate">{address.permanentDistrict}</span>
              </div>
            )}
            {education.highestLevel && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <FaGraduationCap size={9} className="text-[#1a5276] flex-shrink-0" />
                <span className="truncate">{educationLabels.bn[education.highestLevel]}</span>
              </div>
            )}
            {profession.occupationType && (
              <div className="flex items-center gap-1.5 text-xs text-gray-500">
                <FaBriefcase size={9} className="text-[#1a5276] flex-shrink-0" />
                <span className="truncate">{professionLabels.bn[profession.occupationType]}</span>
              </div>
            )}
          </div>

          {/* Match reasons */}
          {reasons.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {reasons.map((r, i) => (
                <span key={i} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full border border-green-100">
                  <FaCheckCircle size={8} /> {r}
                </span>
              ))}
            </div>
          )}
        </Link>

        {/* Score breakdown toggle */}
        {Object.keys(breakdown).length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-50">
            <button onClick={() => setShowBreakdown(!showBreakdown)}
              className="flex items-center gap-1.5 text-xs text-[#1a5276] font-semibold w-full">
              <FaChevronDown size={9} className={`transition-transform flex-shrink-0 ${showBreakdown ? 'rotate-180' : ''}`} />
              বিস্তারিত বিশ্লেষণ
            </button>
            {showBreakdown && (
              <div className="mt-2 space-y-1.5">
                {Object.entries(BREAKDOWN_META).map(([key, { label, color, max }]) => {
                  const val = breakdown[key] ?? 0;
                  const pct = Math.round((val / max) * 100);
                  return (
                    <div key={key}>
                      <div className="flex justify-between text-xs text-gray-400 mb-0.5">
                        <span>{label}</span>
                        <span className="font-semibold text-gray-600">{val}/{max}</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        <Link href={`/profile/${biodata._id}`}
          className="mt-3 flex items-center justify-center gap-1.5 bg-[#1a5276]/5 hover:bg-[#1a5276] hover:text-white text-[#1a5276] text-xs font-semibold py-2 rounded-lg transition-all">
          <FaEye size={11} /> বিস্তারিত দেখুন
        </Link>
      </div>
    </div>
  );
}

export default function MatchesPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [distribution, setDistribution] = useState(null);

  useEffect(() => { fetchMatches(1, minScore); }, [minScore]);

  const fetchMatches = async (pg, score = minScore) => {
    setLoading(true);
    try {
      const { data } = await matchAPI.getRecommended({ page: pg, limit: 12, minScore: score });
      if (pg === 1) setProfiles(data.profiles || []);
      else setProfiles((prev) => [...prev, ...(data.profiles || [])]);
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
      if (data.distribution) setDistribution(data.distribution);
    } catch {}
    finally { setLoading(false); }
  };

  const handleFilterChange = (val) => {
    setMinScore(val);
    setPage(1);
  };

  return (
    <DashboardLayout>
      <div>
        {/* Header */}
        <div className="mb-5">
          <div className="flex items-center gap-2 mb-1">
            <div className="w-8 h-8 bg-gradient-to-br from-[#1a5276] to-[#1b6a3b] rounded-lg flex items-center justify-center">
              <FaRobot size={14} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800">AI Smart Matching</h1>
          </div>
          <p className="text-sm text-gray-500 ml-10">
            আপনার প্রোফাইল বিশ্লেষণ করে {total} টি ম্যাচ পাওয়া গেছে
          </p>

          {/* Distribution badges */}
          {distribution && (
            <div className="flex flex-wrap gap-2 mt-3 ml-10">
              {[
                { label: 'চমৎকার ৮০%+', count: distribution.excellent, cls: 'bg-emerald-100 text-emerald-700 border-emerald-200' },
                { label: 'ভালো ৬০%+', count: distribution.good, cls: 'bg-blue-100 text-blue-700 border-blue-200' },
                { label: 'মাঝারি ৪০%+', count: distribution.average, cls: 'bg-yellow-100 text-yellow-700 border-yellow-200' },
                { label: 'কম', count: distribution.low, cls: 'bg-gray-100 text-gray-500 border-gray-200' },
              ].map(({ label, count, cls }) => count > 0 && (
                <span key={label} className={`text-xs px-2.5 py-1 rounded-full border font-semibold ${cls}`}>
                  {label} · {count} জন
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Score filter */}
        <div className="bg-white rounded-xl border p-3 mb-5 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-sm text-gray-500 font-medium">
            <FaFilter size={12} /> স্কোর ফিল্টার:
          </div>
          {SCORE_TIERS.map(({ label, value, color }) => (
            <button key={value} onClick={() => handleFilterChange(value)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold border-2 transition-all ${
                minScore === value
                  ? 'border-[#1a5276] bg-[#1a5276] text-white'
                  : `${color} border-transparent hover:border-gray-300`
              }`}>
              {label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading && profiles.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : profiles.length === 0 ? (
          <div className="bg-white rounded-2xl border p-16 text-center">
            <FaHeart className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">
              {minScore > 0 ? `${minScore}%+ স্কোরের কোনো ম্যাচ নেই` : 'এখনো কোনো ম্যাচ পাওয়া যায়নি'}
            </p>
            <p className="text-gray-400 text-sm mt-1">
              {minScore > 0 ? 'ফিল্টার কমিয়ে দেখুন' : 'বায়োডেটা সম্পূর্ণ করুন এবং পছন্দের প্রত্যাশা যোগ করুন।'}
            </p>
            {minScore > 0 ? (
              <button onClick={() => handleFilterChange(0)}
                className="mt-4 btn-outline px-6 py-2.5 rounded-xl text-sm">
                সব ম্যাচ দেখুন
              </button>
            ) : (
              <Link href="/biodata" className="mt-4 inline-block btn-primary px-6 py-2.5 rounded-xl text-sm">
                বায়োডেটা আপডেট করুন
              </Link>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {profiles.map((p) => <MatchCard key={p._id} biodata={p} />)}
              {loading && Array(4).fill(0).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
            </div>
            {page < totalPages && (
              <div className="text-center mt-8">
                <button onClick={() => { const next = page + 1; setPage(next); fetchMatches(next); }}
                  disabled={loading}
                  className="btn-outline px-8 py-3 rounded-xl">
                  {loading ? 'লোড হচ্ছে...' : 'আরো দেখুন'}
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
