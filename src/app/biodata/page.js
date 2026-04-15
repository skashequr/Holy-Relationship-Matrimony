'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { biodataAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { educationLabels, professionLabels, formatHeight, formatAge } from '@/lib/utils';
import toast from 'react-hot-toast';
import {
  FaEdit, FaCamera, FaCheckCircle, FaClock, FaTimesCircle,
  FaEye, FaFileAlt, FaPlus, FaSpinner
} from 'react-icons/fa';

export default function BiodataPage() {
  const { user, refreshUser } = useAuth();
  const [biodata, setBiodata] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => { fetchBiodata(); }, []);

  const fetchBiodata = async () => {
    try {
      const { data } = await biodataAPI.getMy();
      setBiodata(data.biodata);
    } catch { /* no biodata yet */ }
    finally { setLoading(false); }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error('ছবির আকার ৫ MB এর বেশি হবে না।'); return; }

    setUploadingPhoto(true);
    const formData = new FormData();
    formData.append('photo', file);
    try {
      await biodataAPI.uploadPhoto(formData);
      toast.success('ছবি আপলোড হয়েছে!');
      fetchBiodata();
      refreshUser();
    } catch { toast.error('ছবি আপলোড ব্যর্থ।'); }
    finally { setUploadingPhoto(false); }
  };

  const statusConfig = {
    approved: { icon: <FaCheckCircle />, text: 'অনুমোদিত', class: 'badge-verified' },
    pending: { icon: <FaClock />, text: 'পর্যালোচনাধীন', class: 'badge-pending' },
    rejected: { icon: <FaTimesCircle />, text: 'প্রত্যাখ্যাত', class: 'badge-rejected' },
    draft: { icon: <FaFileAlt />, text: 'ড্রাফট', class: 'bg-gray-100 text-gray-600' },
  };

  if (loading) return <DashboardLayout><LoadingSpinner /></DashboardLayout>;

  if (!biodata) {
    return (
      <DashboardLayout>
        <div className="max-w-2xl mx-auto">
          <div className="card text-center py-16">
            <div className="w-20 h-20 bg-[#1a5276]/10 rounded-2xl flex items-center justify-center mx-auto mb-5">
              <FaFileAlt size={36} className="text-[#1a5276]" />
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">বায়োডেটা তৈরি হয়নি</h2>
            <p className="text-gray-500 mb-6">আপনার বায়োডেটা এখনো তৈরি করা হয়নি। এখনই তৈরি করুন এবং হাজার হাজার প্রোফাইল দেখুন।</p>
            <Link href="/biodata/create" className="btn-primary inline-flex items-center gap-2 px-8 py-3 rounded-xl">
              <FaPlus /> বায়োডেটা তৈরি করুন
            </Link>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const status = statusConfig[biodata.status] || statusConfig.pending;

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-5">
        {/* Header Card */}
        <div className="card">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {/* Photo */}
            <div className="flex-shrink-0 relative">
              <div className="w-28 h-28 rounded-2xl overflow-hidden bg-gray-100 border-2 border-gray-200">
                {biodata.profilePicture ? (
                  <Image src={biodata.profilePicture} alt="Profile" width={112} height={112} className="object-cover w-full h-full" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-5xl text-gray-300">
                    {user?.gender === 'male' ? '👨' : '👩'}
                  </div>
                )}
              </div>
              <button
                onClick={() => fileRef.current?.click()}
                disabled={uploadingPhoto}
                className="absolute -bottom-2 -right-2 w-8 h-8 bg-[#1a5276] hover:bg-[#154360] rounded-full flex items-center justify-center text-white shadow-md transition-colors disabled:opacity-50"
              >
                {uploadingPhoto ? <FaSpinner size={12} className="animate-spin" /> : <FaCamera size={12} />}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />
            </div>

            {/* Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">{biodata.personal?.fullName}</h1>
                  <p className="text-gray-500 text-sm mt-1">
                    {formatAge(biodata.personal?.age)}
                    {biodata.personal?.height && <> · {formatHeight(biodata.personal.height)}</>}
                  </p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1 rounded-full ${status.class}`}>
                      {status.icon} {status.text}
                    </span>
                    {biodata.biodataNumber && (
                      <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full font-medium">
                        ID: {biodata.biodataNumber}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Link href="/biodata/edit" className="btn-outline flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
                    <FaEdit size={13} /> সম্পাদনা করুন
                  </Link>
                  {biodata.status === 'approved' && (
                    <Link href={`/profile/${biodata._id}`} className="btn-primary flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm">
                      <FaEye size={13} /> প্রিভিউ দেখুন
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Rejection reason */}
          {biodata.status === 'rejected' && biodata.rejectionReason && (
            <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-sm font-semibold text-red-700 mb-1">প্রত্যাখ্যানের কারণ:</p>
              <p className="text-sm text-red-600">{biodata.rejectionReason}</p>
              <Link href="/biodata/edit" className="inline-block mt-2 text-sm font-semibold text-red-700 hover:underline">
                সংশোধন করে পুনরায় জমা দিন →
              </Link>
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'মোট ভিউ', value: biodata.views || 0, icon: <FaEye /> },
            { label: 'শর্টলিস্ট', value: biodata.shortlistCount || 0, icon: '❤️' },
            { label: 'স্ট্যাটাস', value: status.text, icon: status.icon },
          ].map((s) => (
            <div key={s.label} className="card text-center py-4">
              <div className="text-xl flex justify-center mb-1 text-[#1a5276]">{s.icon}</div>
              <div className="font-bold text-lg text-gray-800">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Summary sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              title: 'শিক্ষা ও পেশা',
              items: [
                educationLabels.bn[biodata.education?.highestLevel],
                professionLabels.bn[biodata.profession?.occupationType],
                biodata.profession?.organization,
              ].filter(Boolean),
            },
            {
              title: 'ঠিকানা',
              items: [
                biodata.address?.permanentDistrict && `স্থায়ী: ${biodata.address.permanentDistrict}`,
                biodata.address?.currentDistrict && `বর্তমান: ${biodata.address.currentDistrict}`,
              ].filter(Boolean),
            },
            {
              title: 'ধর্মীয় তথ্য',
              items: [
                biodata.religion?.madhab && `মাযহাব: ${biodata.religion.madhab}`,
                biodata.religion?.praysFiveTimes ? '৫ ওয়াক্ত নামাযী ✓' : null,
                biodata.religion?.wearsPardah ? 'পর্দা পালনকারী ✓' : null,
              ].filter(Boolean),
            },
            {
              title: 'পারিবারিক তথ্য',
              items: [
                biodata.family?.familyType && ({ nuclear: 'একক পরিবার', joint: 'যৌথ পরিবার' }[biodata.family.familyType]),
                biodata.family?.familyStatus && `আর্থিক অবস্থা: ${biodata.family.familyStatus}`,
              ].filter(Boolean),
            },
          ].map((section) => (
            <div key={section.title} className="card">
              <h3 className="font-bold text-gray-700 text-sm mb-3 pb-2 border-b border-gray-100">{section.title}</h3>
              {section.items.length > 0 ? (
                <ul className="space-y-1.5">
                  {section.items.map((item, i) => (
                    <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                      <span className="text-[#1a5276] mt-0.5 flex-shrink-0">•</span> {item}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-gray-400">তথ্য যোগ করা হয়নি</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
