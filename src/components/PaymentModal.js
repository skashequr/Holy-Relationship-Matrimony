'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { paymentAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaTimes, FaMobileAlt, FaSpinner, FaShieldAlt, FaCheckCircle, FaClock } from 'react-icons/fa';

const paymentMethods = [
  { id: 'bkash', name: 'bKash', color: 'bg-pink-500', textColor: 'text-pink-600', bgLight: 'bg-pink-50 border-pink-200', logo: '💳' },
  { id: 'nagad', name: 'Nagad', color: 'bg-orange-500', textColor: 'text-orange-600', bgLight: 'bg-orange-50 border-orange-200', logo: '💳' },
  { id: 'rocket', name: 'Rocket', color: 'bg-purple-500', textColor: 'text-purple-600', bgLight: 'bg-purple-50 border-purple-200', logo: '💳' },
];

export default function PaymentModal({ targetUserId, targetName, biodataId, onClose, onSuccess }) {
  const { user } = useAuth();
  const [step, setStep] = useState(1); // 1: select method, 2: enter phone, 3: processing
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [payerPhone, setPayerPhone] = useState(user?.phone || '');
  const [transactionId, setTransactionId] = useState('');
  const [loading, setLoading] = useState(false);
  const price = 50;

  const handleProceed = () => {
    if (!selectedMethod) {
      toast.error('পেমেন্ট পদ্ধতি বেছে নিন');
      return;
    }
    setStep(2);
  };

  const handlePayment = async () => {
    // Phone: Bangladesh mobile (01XXXXXXXXX — 11 digits)
    const phonePattern = /^01[3-9]\d{8}$/;
    if (!phonePattern.test(payerPhone.trim())) {
      toast.error('সঠিক বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)');
      return;
    }
    // TrxID: alphanumeric, 8–30 chars
    const trxPattern = /^[A-Za-z0-9]{8,30}$/;
    if (!trxPattern.test(transactionId.trim())) {
      toast.error('ট্রানজেকশন আইডি কমপক্ষে ৮টি অক্ষর/সংখ্যা হতে হবে');
      return;
    }

    setLoading(true);
    try {
      const { data } = await paymentAPI.manualVerify({
        targetUserId,
        paymentMethod: selectedMethod,
        transactionId,
        payerPhone,
      });

      if (data.success) {
        setStep(3);
        toast.success('পেমেন্ট জমা হয়েছে! অ্যাডমিন যাচাইয়ের পর আনলক হবে।');
      }
    } catch (error) {
      toast.error(error.response?.data?.messageBn || 'পেমেন্ট ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const methodInstructions = {
    bkash: `বিকাশ থেকে পাঠান: 01XXXXXXXXX\nপরিমাণ: ${price} টাকা\nReference: ${targetUserId?.slice(-8)}`,
    nagad: `নগদ থেকে পাঠান: 01XXXXXXXXX\nপরিমাণ: ${price} টাকা\nReference: ${targetUserId?.slice(-8)}`,
    rocket: `রকেট থেকে পাঠান: 01XXXXXXXXX\nপরিমাণ: ${price} টাকা\nReference: ${targetUserId?.slice(-8)}`,
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="bg-gradient-to-r from-[#1a5276] to-[#1b6a3b] p-5 flex items-center justify-between">
          <div>
            <h2 className="text-white font-bold text-lg">যোগাযোগ আনলক করুন</h2>
            <p className="text-white/70 text-sm">{targetName} এর যোগাযোগ তথ্য দেখুন</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors">
            <FaTimes size={14} className="text-white" />
          </button>
        </div>

        <div className="p-6">
          {/* Step 3: Pending approval */}
          {step === 3 && (
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaClock size={32} className="text-yellow-500" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">পেমেন্ট জমা হয়েছে!</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">
                আপনার ট্রানজেকশন আইডি যাচাই করা হচ্ছে।<br />
                অ্যাডমিন অনুমোদনের পর যোগাযোগ তথ্য আনলক হবে এবং আপনাকে নোটিফিকেশন দেওয়া হবে।
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 text-xs text-yellow-700 mb-4">
                সাধারণত ১–২৪ ঘণ্টার মধ্যে যাচাই সম্পন্ন হয়।
              </div>
              <button onClick={onClose} className="btn-primary px-8 py-2.5 rounded-xl text-sm">
                ঠিক আছে
              </button>
            </div>
          )}

          {/* Step 1: Select payment method */}
          {step === 1 && (
            <div>
              <div className="bg-[#1a5276]/5 rounded-xl p-4 mb-5 flex items-center justify-between">
                <span className="text-gray-700 font-medium">যোগাযোগ আনলক মূল্য</span>
                <span className="text-2xl font-bold text-[#1a5276]">৳{price}</span>
              </div>

              <p className="text-sm font-medium text-gray-700 mb-3">পেমেন্ট পদ্ধতি বেছে নিন:</p>
              <div className="grid grid-cols-3 gap-3 mb-5">
                {paymentMethods.map((method) => (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all font-semibold text-sm ${
                      selectedMethod === method.id
                        ? `${method.bgLight} ${method.textColor} border-current scale-105 shadow-md`
                        : 'border-gray-100 bg-gray-50 text-gray-600 hover:border-gray-200'
                    }`}
                  >
                    <FaMobileAlt size={20} />
                    {method.name}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 text-xs text-gray-400 mb-5">
                <FaShieldAlt className="text-green-500" />
                <span>নিরাপদ ও এনক্রিপ্টেড পেমেন্ট</span>
              </div>

              <button onClick={handleProceed} className="w-full btn-primary py-3 rounded-xl">
                এগিয়ে যান
              </button>
            </div>
          )}

          {/* Step 2: Instructions + transaction ID */}
          {step === 2 && (
            <div>
              <div className="bg-gray-50 rounded-xl p-4 mb-5">
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  {paymentMethods.find(m => m.id === selectedMethod)?.name} এ পেমেন্ট করুন:
                </p>
                <pre className="text-sm text-gray-600 whitespace-pre-line font-sans leading-relaxed">
                  {methodInstructions[selectedMethod]}
                </pre>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="label">আপনার {paymentMethods.find(m => m.id === selectedMethod)?.name} নম্বর</label>
                  <input
                    type="tel"
                    value={payerPhone}
                    onChange={(e) => setPayerPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="label">ট্রানজেকশন আইডি (TrxID)</label>
                  <input
                    type="text"
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value.trim())}
                    placeholder="যেমন: ABC12345XYZ (কমপক্ষে ৮ অক্ষর)"
                    className="input-field"
                    maxLength={30}
                  />
                  <p className="text-xs text-gray-400 mt-1">পেমেন্ট সম্পন্ন হওয়ার পর প্রাপ্ত ট্রানজেকশন আইডি দিন</p>
                </div>
              </div>

              <div className="flex gap-3 mt-5">
                <button onClick={() => setStep(1)} className="flex-1 btn-outline py-3 rounded-xl">
                  পেছনে
                </button>
                <button onClick={handlePayment} disabled={loading} className="flex-1 btn-primary py-3 rounded-xl flex items-center justify-center gap-2">
                  {loading ? <><FaSpinner className="animate-spin" /> প্রক্রিয়াধীন...</> : 'নিশ্চিত করুন'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
