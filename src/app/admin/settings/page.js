'use client';

import { useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaCog, FaSpinner, FaSave } from 'react-icons/fa';

export default function AdminSettingsPage() {
  const [price, setPrice] = useState(50);
  const [loading, setLoading] = useState(false);

  const handleSavePrice = async () => {
    setLoading(true);
    try {
      await adminAPI.updatePricing({ contactUnlockPrice: price });
      toast.success('মূল্য আপডেট হয়েছে');
    } catch { toast.error('সমস্যা হয়েছে।'); }
    finally { setLoading(false); }
  };

  return (
    <AdminLayout>
      <div className="max-w-2xl space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FaCog /> সেটিংস</h1>
          <p className="text-sm text-gray-500">সাইটের সাধারণ সেটিংস পরিচালনা করুন</p>
        </div>

        {/* Pricing */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-bold text-gray-800 mb-4 pb-3 border-b">মূল্য নির্ধারণ</h3>
          <div className="max-w-xs">
            <label className="label">যোগাযোগ আনলক মূল্য (BDT)</label>
            <div className="flex gap-3">
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="input-field"
                min={10}
                max={500}
              />
              <button onClick={handleSavePrice} disabled={loading} className="btn-primary px-4 py-2.5 rounded-lg flex items-center gap-2 whitespace-nowrap">
                {loading ? <FaSpinner className="animate-spin" /> : <FaSave />}
                সেভ করুন
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">বর্তমান মূল্য: ৳{price} BDT</p>
          </div>
        </div>

        {/* Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
          <p className="text-sm text-blue-700 font-medium">বিস্তারিত কনফিগারেশনের জন্য .env ফাইল সম্পাদনা করুন।</p>
          <ul className="text-xs text-blue-600 mt-2 space-y-1 list-disc list-inside">
            <li>ইমেইল SMTP সেটিংস</li>
            <li>bKash / Nagad API কী</li>
            <li>Cloudinary কনফিগারেশন</li>
            <li>JWT সিক্রেট কী</li>
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
