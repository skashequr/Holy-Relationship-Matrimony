'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { authAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaEnvelope, FaArrowLeft, FaSpinner, FaCheckCircle } from 'react-icons/fa';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const { completeRegistration } = useAuth();

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!email) {
      toast.error('ইমেইল পাওয়া যায়নি। আবার চেষ্টা করুন।');
      router.push('/register');
      return;
    }
    // Auto-focus first box
    inputRefs.current[0]?.focus();
  }, [email, router]);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // ── OTP input handlers ──────────────────────────────────────────────

  const handleChange = (index, e) => {
    // Strip anything that's not a digit
    const digits = e.target.value.replace(/\D/g, '');
    if (!digits) {
      // User cleared the field
      const next = [...otp];
      next[index] = '';
      setOtp(next);
      return;
    }
    // Take only the last typed digit (handles cases where browser appends to existing value)
    const digit = digits.slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    // Move focus to next box
    if (index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace') {
      if (otp[index]) {
        // Clear current box first
        const next = [...otp];
        next[index] = '';
        setOtp(next);
      } else if (index > 0) {
        // Move to previous box
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const next = [...otp];
    pasted.split('').forEach((d, i) => { if (i < 6) next[i] = d; });
    setOtp(next);
    // Focus the box after the last pasted digit
    const focusIndex = Math.min(pasted.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  // ── Verify ──────────────────────────────────────────────────────────

  const handleVerify = async () => {
    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      toast.error('৬ সংখ্যার OTP দিন');
      return;
    }
    setLoading(true);
    try {
      const { data } = await authAPI.verifyOTP({
        identifier: email,
        otp: otpCode,
        purpose: 'registration',
      });

      // Backend creates the user and returns token + user on success
      completeRegistration(data.token, data.user, data.refreshToken);
      toast.success('নিবন্ধন সম্পন্ন হয়েছে!');
      router.push('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.messageBn || 'ভুল OTP। আবার চেষ্টা করুন।');
      // Clear all boxes and refocus first on wrong OTP
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  // ── Resend ──────────────────────────────────────────────────────────

  const handleResend = async () => {
    setResending(true);
    try {
      await authAPI.sendOTP({ identifier: email, type: 'email', purpose: 'registration' });
      toast.success('নতুন OTP পাঠানো হয়েছে');
      setCountdown(60);
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch {
      toast.error('OTP পাঠাতে সমস্যা হয়েছে');
    } finally {
      setResending(false);
    }
  };

  const filled = otp.filter(Boolean).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a5276] to-[#1b6a3b] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-[#1a5276] to-[#154360] p-6 text-center">
            <div className="w-16 h-16 bg-white/15 rounded-full flex items-center justify-center mx-auto mb-3 border border-white/20">
              <FaEnvelope size={28} className="text-white" />
            </div>
            <h1 className="text-white font-bold text-xl">ইমেইল যাচাই করুন</h1>
            <p className="text-white/70 text-sm mt-1">
              <span className="font-semibold text-white">{email}</span>
              <br />এ একটি ৬ সংখ্যার OTP পাঠানো হয়েছে
            </p>
          </div>

          <div className="p-7">
            {/* Progress dots */}
            <div className="flex justify-center gap-1.5 mb-6">
              {otp.map((d, i) => (
                <div
                  key={i}
                  className={`h-1 rounded-full transition-all duration-200 ${
                    d ? 'w-6 bg-[#1a5276]' : 'w-4 bg-gray-200'
                  }`}
                />
              ))}
            </div>

            {/* OTP boxes */}
            <div className="flex gap-2 justify-center mb-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => (inputRefs.current[i] = el)}
                  type="text"
                  inputMode="numeric"
                  pattern="\d*"
                  autoComplete="one-time-code"
                  value={digit}
                  onChange={(e) => handleChange(i, e)}
                  onKeyDown={(e) => handleKeyDown(i, e)}
                  onPaste={handlePaste}
                  onFocus={(e) => e.target.select()}
                  className={`w-11 h-13 text-center text-2xl font-bold border-2 rounded-xl focus:outline-none transition-all select-all ${
                    digit
                      ? 'border-[#1a5276] bg-[#1a5276]/5 text-[#1a5276]'
                      : 'border-gray-200 focus:border-[#1a5276]'
                  }`}
                  style={{ height: '3.25rem' }}
                />
              ))}
            </div>

            <p className="text-center text-xs text-gray-400 mb-6">
              ইমেইল না পেলে Spam ফোল্ডার চেক করুন
            </p>

            {/* Verify button */}
            <button
              onClick={handleVerify}
              disabled={loading || filled !== 6}
              className="w-full bg-[#1a5276] hover:bg-[#154360] disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-colors"
            >
              {loading ? (
                <><FaSpinner className="animate-spin" size={15} /> যাচাই হচ্ছে...</>
              ) : (
                <><FaCheckCircle size={15} /> যাচাই করুন</>
              )}
            </button>

            {/* Resend */}
            <div className="text-center mt-4">
              {countdown > 0 ? (
                <p className="text-sm text-gray-400">
                  <span className="font-semibold text-gray-600">{countdown}s</span> পরে পুনরায় পাঠান
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sm text-[#1a5276] font-semibold hover:underline disabled:opacity-50"
                >
                  {resending ? 'পাঠানো হচ্ছে...' : 'পুনরায় OTP পাঠান'}
                </button>
              )}
            </div>

            <Link
              href="/register"
              className="flex items-center justify-center gap-2 mt-5 text-sm text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FaArrowLeft size={11} /> নিবন্ধন পেজে ফিরুন
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
