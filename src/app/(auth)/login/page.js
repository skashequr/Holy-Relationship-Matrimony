'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaEnvelope, FaLock, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

export default function LoginPage() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await login(data.email, data.password);
    } catch (error) {
      toast.error(error.response?.data?.messageBn || 'ইমেইল বা পাসওয়ার্ড ভুল।');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5276] to-[#1b6a3b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex flex-col items-center gap-2">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-4xl border border-white/20">
              ☪
            </div>
            <div>
              <p className="text-white font-bold text-lg">Holy Relationship</p>
              <p className="text-[#c9a84c] text-sm">Marriage Matrimony</p>
            </div>
          </Link>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          <div className="bg-gradient-to-r from-[#1a5276] to-[#154360] p-6 text-center">
            <h1 className="text-white font-bold text-xl">আপনার অ্যাকাউন্টে প্রবেশ করুন</h1>
            <p className="text-white/70 text-sm mt-1">Login to your account</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
            {/* Email */}
            <div>
              <label className="label">ইমেইল ঠিকানা</label>
              <div className="relative">
                <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  {...register('email', {
                    required: 'ইমেইল আবশ্যক',
                    pattern: { value: /^\S+@\S+$/i, message: 'সঠিক ইমেইল দিন' },
                  })}
                  type="email"
                  placeholder="আপনার ইমেইল লিখুন"
                  className="input-field pl-11"
                  autoComplete="email"
                />
              </div>
              {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="label mb-0">পাসওয়ার্ড</label>
                <Link href="/forgot-password" className="text-xs text-[#1a5276] hover:underline">
                  পাসওয়ার্ড ভুলে গেছেন?
                </Link>
              </div>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                <input
                  {...register('password', { required: 'পাসওয়ার্ড আবশ্যক' })}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="পাসওয়ার্ড লিখুন"
                  className="input-field pl-11 pr-11"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3.5 rounded-xl text-base flex items-center justify-center gap-2"
            >
              {loading ? <><FaSpinner className="animate-spin" /> লগইন হচ্ছে...</> : 'লগইন করুন'}
            </button>

            {/* Register link */}
            <div className="text-center pt-2">
              <p className="text-sm text-gray-600">
                অ্যাকাউন্ট নেই?{' '}
                <Link href="/register" className="text-[#1a5276] font-semibold hover:underline">
                  বিনামূল্যে নিবন্ধন করুন
                </Link>
              </p>
            </div>
          </form>
        </div>

        {/* Back to home */}
        <div className="text-center mt-4">
          <Link href="/" className="text-white/70 hover:text-white text-sm transition-colors">
            ← হোমে ফিরে যান
          </Link>
        </div>
      </div>
    </div>
  );
}
