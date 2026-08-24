'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { biodataAPI } from '@/lib/api';
import { formatAge, formatHeight, educationLabels, professionLabels, maritalStatusLabels, getScoreColor } from '@/lib/utils';
import {
  FaHeart, FaRegHeart, FaMapMarkerAlt, FaGraduationCap,
  FaBriefcase, FaCheckCircle, FaStar, FaLock, FaEye
} from 'react-icons/fa';
import toast from 'react-hot-toast';

export default function ProfileCard({ biodata, showScore = false, score = null }) {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const router = useRouter();
  const [isShortlisted, setIsShortlisted] = useState(
    user?.shortlistedProfiles?.includes(biodata?.userId?._id || biodata?.userId) ?? false
  );
  const [shortlistLoading, setShortlistLoading] = useState(false);

  const profile = biodata?.userId || {};
  const personal = biodata?.personal || {};
  const education = biodata?.education || {};
  const profession = biodata?.profession || {};
  const address = biodata?.address || {};

  const handleShortlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (shortlistLoading) return;

    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    setShortlistLoading(true);
    try {
      const { data } = await biodataAPI.toggleShortlist(biodata._id);
      setIsShortlisted(data.isShortlisted);
      toast.success(data.isShortlisted ? 'শর্টলিস্টে যোগ করা হয়েছে' : 'শর্টলিস্ট থেকে সরানো হয়েছে');
    } catch (error) {
      toast.error('সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setShortlistLoading(false);
    }
  };

  return (
    <div className="profile-card group">
      <Link href={`/profile/${biodata._id}`}>
        {/* Profile Image */}
        <div className="relative h-52 bg-gradient-to-br from-[#1a5276]/10 to-[#1b6a3b]/10 overflow-hidden">
          {profile.profilePicture || biodata.profilePicture ? (
            <Image
              src={profile.profilePicture || biodata.profilePicture}
              alt={personal.fullName || 'Profile'}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-[#1a5276]/20 flex items-center justify-center">
                <span className="text-4xl text-[#1a5276]/40">
                  {profile.gender === 'male' ? '👨' : '👩'}
                </span>
              </div>
            </div>
          )}

          {/* Badges overlay */}
          <div className="absolute top-2 left-2 flex gap-1 flex-wrap">
            {biodata.status === 'approved' && (profile.verificationBadge || profile.isVerified) && (
              <span className="badge-verified text-xs shadow-sm">
                <FaCheckCircle size={10} /> যাচাইকৃত
              </span>
            )}
            {biodata.biodataNumber && (
              <span className="bg-[#1a5276] text-white text-xs px-2 py-0.5 rounded-full font-medium shadow-sm">
                {biodata.biodataNumber}
              </span>
            )}
          </div>

          {/* Compatibility score */}
          {showScore && score !== null && (
            <div className={`absolute top-2 right-2 font-bold text-xs px-2.5 py-1 rounded-full shadow-sm ${getScoreColor(score)}`}>
              <FaStar size={10} className="inline mr-1" />
              {score}%
            </div>
          )}

          {/* Shortlist button */}
          <button
            onClick={handleShortlist}
            disabled={shortlistLoading}
            className="absolute bottom-2 right-2 w-9 h-9 bg-white/90 hover:bg-white rounded-full shadow-md flex items-center justify-center transition-all hover:scale-110 disabled:opacity-50"
          >
            {isShortlisted ? (
              <FaHeart size={16} className="text-red-500" />
            ) : (
              <FaRegHeart size={16} className="text-gray-500 group-hover:text-red-400" />
            )}
          </button>
        </div>

        {/* Profile Info */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="font-bold text-gray-800 text-base truncate">
                {personal.fullName || 'নাম অজানা'}
              </h3>
              <p className="text-sm text-gray-500">
                {formatAge(personal.age, language)}
                {personal.height && <> · {formatHeight(personal.height, language)}</>}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="space-y-1.5 mt-2">
            {address.permanentDistrict && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaMapMarkerAlt size={11} className="text-[#1a5276] flex-shrink-0" />
                <span className="truncate">
                  {address.permanentDistrict}
                  {address.permanentDivision && `, ${address.permanentDivision}`}
                </span>
              </div>
            )}
            {education.highestLevel && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaGraduationCap size={11} className="text-[#1a5276] flex-shrink-0" />
                <span className="truncate">
                  {educationLabels[language]?.[education.highestLevel] || education.highestLevel}
                </span>
              </div>
            )}
            {profession.occupationType && (
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <FaBriefcase size={11} className="text-[#1a5276] flex-shrink-0" />
                <span className="truncate">
                  {professionLabels[language]?.[profession.occupationType] || profession.occupationType}
                </span>
              </div>
            )}
          </div>

          {/* Marital status & contact lock */}
          <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-50">
            {personal.maritalStatus && (
              <span className="text-xs text-gray-500 bg-gray-50 px-2.5 py-1 rounded-full">
                {maritalStatusLabels[language]?.[personal.maritalStatus] || personal.maritalStatus}
              </span>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <FaLock size={10} />
              <span>যোগাযোগ লক</span>
            </div>
          </div>
        </div>
      </Link>

      {/* View Profile CTA */}
      <div className="px-4 pb-4">
        <Link
          href={`/profile/${biodata._id}`}
          className="w-full flex items-center justify-center gap-2 bg-[#1a5276]/5 hover:bg-[#1a5276] hover:text-white text-[#1a5276] text-sm font-semibold py-2.5 rounded-lg transition-all duration-200 group"
        >
          <FaEye size={14} />
          বিস্তারিত দেখুন
        </Link>
      </div>
    </div>
  );
}
