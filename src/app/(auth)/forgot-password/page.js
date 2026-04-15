'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaLock, FaArrowLeft, FaSpinner } from 'react-icons/fa';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { toast.error('ইমেইল দিন'); return; }
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      toast.success('OTP পাঠানো হয়েছে');
      router.push(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'সমস্যা হয়েছে');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5276]/5 to-[#1b6a3b]/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaLock className="text-orange-500" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">পাসওয়ার্ড ভুলে গেছেন?</h1>
            <p className="text-gray-500 text-sm">আপনার ইমেইলে একটি OTP পাঠানো হবে</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">ইমেইল ঠিকানা</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="আপনার ইমেইল লিখুন"
                className="input-field"
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading && <FaSpinner className="animate-spin" />}
              OTP পাঠান
            </button>
          </form>

          <Link href="/login" className="flex items-center justify-center gap-2 mt-6 text-sm text-gray-500 hover:text-gray-700">
            <FaArrowLeft size={12} /> লগইনে ফিরুন
          </Link>
        </div>
      </div>
    </div>
  );
}
