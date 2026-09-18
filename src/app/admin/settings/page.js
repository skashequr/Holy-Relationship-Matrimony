'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaCog, FaSpinner, FaSave, FaChartLine } from 'react-icons/fa';

export default function AdminSettingsPage() {
  const [price, setPrice] = useState(50);
  const [loading, setLoading] = useState(false);

  const [tracking, setTracking] = useState({
    trackingEnabled: false,
    gaMeasurementId: '',
    gaApiSecret: '',
    fbPixelId: '',
    autoTrackConversions: false,
  });
  const [trackingLoading, setTrackingLoading] = useState(false);

  useEffect(() => {
    adminAPI.getSettings().then(({ data }) => {
      const s = data.settings || {};
      if (s.contactUnlockPrice) setPrice(s.contactUnlockPrice);
      setTracking({
        trackingEnabled: !!s.trackingEnabled,
        gaMeasurementId: s.gaMeasurementId || '',
        gaApiSecret: s.gaApiSecret || '',
        fbPixelId: s.fbPixelId || '',
        autoTrackConversions: !!s.autoTrackConversions,
      });
    }).catch(() => {});
  }, []);

  const handleSavePrice = async () => {
    setLoading(true);
    try {
      await adminAPI.updatePricing({ contactUnlockPrice: price });
      toast.success('মূল্য আপডেট হয়েছে');
    } catch { toast.error('সমস্যা হয়েছে।'); }
    finally { setLoading(false); }
  };

  const handleSaveTracking = async () => {
    setTrackingLoading(true);
    try {
      await adminAPI.updateSettings(tracking);
      toast.success('ট্র্যাকিং সেটিংস আপডেট হয়েছে');
    } catch { toast.error('সমস্যা হয়েছে।'); }
    finally { setTrackingLoading(false); }
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

        {/* Tracking / Analytics */}
        <div className="bg-white rounded-xl border p-5">
          <h3 className="font-bold text-gray-800 mb-1 pb-3 border-b flex items-center gap-2">
            <FaChartLine /> ট্র্যাকিং ও অ্যানালিটিক্স
          </h3>
          <p className="text-xs text-gray-500 mt-3 mb-4">
            Google Analytics ও Facebook Pixel এর আইডি এখানে বসালেই পুরো সাইটে (পেজ ভিউ থেকে শুরু করে প্রতিটি বায়োডাটা কন্টাক্ট আনলক/সেল পর্যন্ত) ট্র্যাকিং চালু হয়ে যাবে — কোনো কোড পরিবর্তনের প্রয়োজন নেই।
          </p>

          <label className="flex items-center gap-2 cursor-pointer select-none mb-4">
            <input
              type="checkbox"
              checked={tracking.trackingEnabled}
              onChange={(e) => setTracking((t) => ({ ...t, trackingEnabled: e.target.checked }))}
              className="w-4 h-4 accent-[#1a5276]"
            />
            <span className="text-sm text-gray-700 font-medium">ট্র্যাকিং সক্রিয় করুন</span>
          </label>

          <div className="space-y-4 max-w-md">
            <div>
              <label className="label">GA4 Measurement ID</label>
              <input
                type="text"
                value={tracking.gaMeasurementId}
                onChange={(e) => setTracking((t) => ({ ...t, gaMeasurementId: e.target.value.trim() }))}
                placeholder="যেমন: G-XXXXXXXXXX"
                className="input-field font-mono text-sm"
              />
            </div>
            <div>
              <label className="label">GA4 API Secret</label>
              <input
                type="text"
                value={tracking.gaApiSecret}
                onChange={(e) => setTracking((t) => ({ ...t, gaApiSecret: e.target.value.trim() }))}
                placeholder="Measurement Protocol API Secret"
                className="input-field font-mono text-sm"
              />
              <p className="text-xs text-gray-400 mt-1">
                GA4 → Admin → Data Streams → আপনার স্ট্রিম → Measurement Protocol API secrets থেকে তৈরি করুন। এটা প্রতিটা বায়োডাটা সেল সার্ভার থেকে সরাসরি রিপোর্ট করতে ব্যবহার হয়, এমনকি অ্যাডমিন ম্যানুয়ালি পেমেন্ট অনুমোদন করলেও।
              </p>
            </div>
            <div>
              <label className="label">Facebook Pixel ID</label>
              <input
                type="text"
                value={tracking.fbPixelId}
                onChange={(e) => setTracking((t) => ({ ...t, fbPixelId: e.target.value.trim() }))}
                placeholder="যেমন: 1234567890123456"
                className="input-field font-mono text-sm"
              />
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-dashed border-gray-200">
            <label className="flex items-start gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={tracking.autoTrackConversions}
                onChange={(e) => setTracking((t) => ({ ...t, autoTrackConversions: e.target.checked }))}
                className="w-4 h-4 accent-[#1a5276] mt-0.5"
              />
              <span className="text-sm text-gray-700 font-medium">
                প্রতিটা অনুমোদিত পেমেন্ট স্বয়ংক্রিয়ভাবে Purchase হিসেবে Ads-এ পাঠান
              </span>
            </label>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-2">
              <p className="text-xs text-amber-800 leading-relaxed">
                <strong>আপনার কোনো পেমেন্ট গেটওয়ে না থাকায়</strong> প্রতিটা পেমেন্ট আসলে ইউজারের নিজের দেওয়া
                TrxID-এর ওপর ভিত্তি করে অনুমোদিত হয় — সত্যিকারের যাচাই ছাড়াই। এই অপশনটি চালু রাখলে যে কেউ
                বায়োডাটা আনলক করতে গেলেই সেটা Google/Facebook-এ &quot;সফল সেল&quot; হিসেবে গণনা হয়ে যাবে, যা বিজ্ঞাপনের
                অপ্টিমাইজেশনকে ভুল পথে চালিত করতে পারে।
              </p>
              <p className="text-xs text-amber-800 leading-relaxed mt-2">
                <strong>সুপারিশ:</strong> এটি বন্ধ রাখুন। এর বদলে, পেমেন্ট পেজে গিয়ে প্রতিটা লেনদেন আপনার
                বিকাশ/নগদ স্টেটমেন্টে সত্যিই মিলিয়ে দেখার পর, শুধু তখনই &quot;কনভার্সন ট্র্যাক করুন&quot; বাটনে ক্লিক করুন —
                তাহলে শুধু আসল সেলই বিজ্ঞাপন প্ল্যাটফর্মে রিপোর্ট হবে।
              </p>
            </div>
          </div>

          <button
            onClick={handleSaveTracking}
            disabled={trackingLoading}
            className="btn-primary px-4 py-2.5 rounded-lg flex items-center gap-2 mt-5"
          >
            {trackingLoading ? <FaSpinner className="animate-spin" /> : <FaSave />}
            ট্র্যাকিং সেটিংস সেভ করুন
          </button>
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
