'use client';

import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { FaCrown, FaCheck, FaWhatsapp, FaPhone } from 'react-icons/fa';

const benefits = [
  'সীমাহীন প্রোফাইল দেখা (কোনো চার্জ নেই)',
  'সীমাহীন Interest পাঠানো',
  'সম্পূর্ণ যোগাযোগ তথ্য দেখা',
  'চ্যাট করার সুবিধা',
  'সীমাহীন PDF ডাউনলোড',
  'প্রিমিয়াম ব্যাজ (Gold Crown)',
  'অ্যাডমিনের বিশেষ দায়িত্ব',
  'প্রিমিয়াম সদস্য হিসেবে অগ্রাধিকার',
];

export default function PremiumPage() {
  const { user } = useAuth();

  const isPremium = user?.isPremium;
  const expiry = user?.premiumExpiry ? new Date(user.premiumExpiry) : null;
  const now = new Date();
  const daysLeft = expiry ? Math.ceil((expiry - now) / (1000 * 60 * 60 * 24)) : 0;

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2">
            <FaCrown className="text-[#c9a84c]" /> প্রিমিয়াম সদস্যতা
          </h1>
          <p className="text-sm text-gray-500 mt-1">সীমাহীন সুবিধা উপভোগ করুন</p>
        </div>

        {isPremium ? (
          /* Active premium card */
          <div className="bg-gradient-to-br from-[#1a5276] to-[#1b6a3b] rounded-2xl p-6 text-white">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-[#c9a84c] rounded-full flex items-center justify-center">
                <FaCrown size={24} />
              </div>
              <div>
                <p className="font-bold text-lg">প্রিমিয়াম সক্রিয়</p>
                <p className="text-white/70 text-sm">আপনি এখন প্রিমিয়াম সদস্য</p>
              </div>
            </div>
            {expiry && (
              <div className={`bg-white/10 rounded-xl p-3 mt-3 ${daysLeft <= 3 ? 'border border-yellow-400' : ''}`}>
                <p className="text-sm">মেয়াদ শেষ: <span className="font-bold">{expiry.toLocaleDateString('bn-BD')}</span></p>
                <p className={`text-sm font-bold ${daysLeft <= 3 ? 'text-yellow-300' : 'text-green-300'}`}>
                  {daysLeft > 0 ? `${daysLeft} দিন বাকি` : 'মেয়াদ শেষ!'}
                </p>
              </div>
            )}
          </div>
        ) : (
          /* Upgrade CTA */
          <div className="bg-gradient-to-br from-[#c9a84c]/10 to-[#1a5276]/10 border-2 border-[#c9a84c]/30 rounded-2xl p-6">
            <div className="text-center mb-6">
              <FaCrown className="mx-auto text-[#c9a84c] mb-3" size={40} />
              <p className="text-3xl font-bold text-gray-800">৳২,০০০ <span className="text-base font-normal text-gray-500">/ মাস</span></p>
              <p className="text-sm text-gray-500 mt-1">একটি সুখী জীবনের জন্য বিনিয়োগ করুন</p>
            </div>
            <div className="bg-white/80 rounded-xl p-4 mb-6 text-sm text-gray-600">
              <p className="font-semibold text-gray-700 mb-1">কীভাবে সক্রিয় করবেন:</p>
              <ol className="space-y-1 list-decimal list-inside">
                <li>নিচের নম্বরে bKash/Nagad-এ ৳২০০০ পাঠান</li>
                <li>Payment করার পর WhatsApp/Phone এ জানান</li>
                <li>Admin ২৪ ঘন্টার মধ্যে সক্রিয় করবেন</li>
              </ol>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href="https://wa.me/8801682981828?text=প্রিমিয়াম সক্রিয় করতে চাই"
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <FaWhatsapp size={18} /> WhatsApp করুন
              </a>
              <a
                href="tel:+8801682981828"
                className="flex-1 flex items-center justify-center gap-2 bg-[#1a5276] hover:bg-[#154361] text-white font-semibold py-3 rounded-xl transition-colors"
              >
                <FaPhone size={16} /> ফোন করুন
              </a>
            </div>
          </div>
        )}

        {/* Benefits list */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold text-gray-800 mb-4">প্রিমিয়াম সুবিধাসমূহ</h2>
          <div className="space-y-3">
            {benefits.map((b, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <FaCheck size={10} className="text-green-600" />
                </div>
                <p className="text-sm text-gray-700">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
