'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaSpinner, FaMale, FaFemale } from 'react-icons/fa';

export default function RegisterPage() {
  const { register: registerUser } = useAuth();
  const searchParams = useSearchParams();
  const defaultGender = searchParams.get('gender') || 'male';

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedGender, setSelectedGender] = useState(defaultGender);

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    defaultValues: { gender: defaultGender },
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await registerUser({ ...data, gender: selectedGender });
    } catch (error) {
      toast.error(error.response?.data?.message || error.response?.data?.errors?.[0]?.msg || 'নিবন্ধন ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5276] to-[#1b6a3b] flex items-center justify-center p-4 py-10">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-3xl border border-white/20">
              ☪
            </div>
            <div>
              <p className="text-white font-bold">Holy Relationship Matrimony</p>
              <p className="text-[#c9a84c] text-xs">বিনামূল্যে নিবন্ধন করুন</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#1a5276] to-[#154360] p-5 text-center">
            <h1 className="text-white font-bold text-xl">নতুন অ্যাকাউন্ট তৈরি করুন</h1>
            <p className="text-white/70 text-sm mt-1">Create your free account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
            {/* Gender Selection */}
            <div>
              <label className="label">আপনি কে? *</label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setSelectedGender('male')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all font-semibold ${
                    selectedGender === 'male'
                      ? 'border-[#1a5276] bg-[#1a5276]/5 text-[#1a5276]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl">👨</span>
                  <span className="text-sm">পুরুষ (বর)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedGender('female')}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all font-semibold ${
                    selectedGender === 'female'
                      ? 'border-[#c9a84c] bg-[#c9a84c]/5 text-[#c9a84c]'
                      : 'border-gray-200 text-gray-500 hover:border-gray-300'
                  }`}
                >
                  <span className="text-3xl">👩</span>
                  <span className="text-sm">মহিলা (কনে)</span>
                </button>
              </div>
            </div>

            {/* Name */}
            <div>
              <label className="label">পূর্ণ নাম *</label>
              <div className="relative">
                <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  {...register('name', { required: 'নাম আবশ্যক', minLength: { value: 2, message: 'নাম কমপক্ষে ২ অক্ষরের হতে হবে' } })}
                  type="text"
                  placeholder="আপনার পূর্ণ নাম"
                  className="input-field pl-11"
                />
              </div>
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="label">ইমেইল ঠিকানা *</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  {...register('email', {
                    required: 'ইমেইল আবশ্যক',
                    pattern: { value: /^\S+@\S+$/i, message: 'সঠিক ইমেইল দিন' },
                  })}
                  type="email"
                  placeholder="example@gmail.com"
                  className="input-field pl-11"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="label">মোবাইল নম্বর *</label>
              <div className="relative">
                <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  {...register('phone', {
                    required: 'মোবাইল নম্বর আবশ্যক',
                    pattern: { value: /^(\+880|880|0)?1[3-9]\d{8}$/, message: 'সঠিক বাংলাদেশী মোবাইল নম্বর দিন' },
                  })}
                  type="tel"
                  placeholder="01XXXXXXXXX"
                  className="input-field pl-11"
                />
              </div>
              {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="label">পাসওয়ার্ড *</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  {...register('password', {
                    required: 'পাসওয়ার্ড আবশ্যক',
                    minLength: { value: 6, message: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' },
                  })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="কমপক্ষে ৬ অক্ষর"
                  className="input-field pl-11 pr-11"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
                  {showPassword ? <FaEyeSlash size={13} /> : <FaEye size={13} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Terms */}
            <div className="flex items-start gap-3">
              <input
                {...register('terms', { required: 'শর্তাবলী মেনে নিতে হবে' })}
                type="checkbox"
                id="terms"
                className="mt-1 accent-[#1a5276]"
              />
              <label htmlFor="terms" className="text-xs text-gray-600">
                আমি{' '}
                <Link href="/terms" className="text-[#1a5276] hover:underline">শর্তাবলী</Link>
                {' '}এবং{' '}
                <Link href="/privacy-policy" className="text-[#1a5276] hover:underline">গোপনীয়তা নীতি</Link>
                {' '}মেনে নিচ্ছি।
              </label>
            </div>
            {errors.terms && <p className="text-red-500 text-xs -mt-2">{errors.terms.message}</p>}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-xl text-base flex items-center justify-center gap-2"
            >
              {loading ? <><FaSpinner className="animate-spin" /> নিবন্ধন হচ্ছে...</> : 'নিবন্ধন করুন'}
            </button>

            {/* Login link */}
            <div className="text-center pt-1">
              <p className="text-sm text-gray-600">
                ইতিমধ্যে অ্যাকাউন্ট আছে?{' '}
                <Link href="/login" className="text-[#1a5276] font-semibold hover:underline">লগইন করুন</Link>
              </p>
            </div>
          </form>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-white/70 hover:text-white text-sm">← হোমে ফিরে যান</Link>
        </div>
      </div>
    </div>
  );
}
