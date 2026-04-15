'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { FaChevronDown, FaChevronUp, FaQuestionCircle } from 'react-icons/fa';

const faqs = [
  {
    category: 'নিবন্ধন ও অ্যাকাউন্ট',
    items: [
      {
        q: 'Holy Relationship-এ নিবন্ধন করতে কী কী লাগবে?',
        a: 'নিবন্ধনের জন্য আপনার নাম, ইমেইল বা মোবাইল নম্বর এবং একটি পাসওয়ার্ড দরকার। OTP যাচাইয়ের মাধ্যমে একাউন্ট নিশ্চিত করতে হবে।',
      },
      {
        q: 'নিবন্ধন কি বিনামূল্যে?',
        a: 'হ্যাঁ, নিবন্ধন সম্পূর্ণ বিনামূল্যে। বায়োডেটা তৈরি ও অনুমোদিত প্রোফাইল দেখাও বিনামূল্যে। শুধু যোগাযোগের তথ্য আনলক করতে পেমেন্ট করতে হয়।',
      },
      {
        q: 'একটি মোবাইল নম্বর দিয়ে কি একাধিক একাউন্ট খোলা যাবে?',
        a: 'না, প্রতিটি মোবাইল নম্বর ও ইমেইল দিয়ে শুধুমাত্র একটি একাউন্ট খোলা যাবে।',
      },
      {
        q: 'পাসওয়ার্ড ভুলে গেলে কী করব?',
        a: 'লগইন পেজে "পাসওয়ার্ড ভুলে গেছেন?" লিংকে ক্লিক করুন। আপনার ইমেইলে বা মোবাইলে OTP পাঠানো হবে, সেটি দিয়ে নতুন পাসওয়ার্ড সেট করুন।',
      },
    ],
  },
  {
    category: 'বায়োডেটা',
    items: [
      {
        q: 'বায়োডেটা জমা দেওয়ার পর কতক্ষণে অনুমোদিত হবে?',
        a: 'সাধারণত ২৪-৪৮ ঘণ্টার মধ্যে আমাদের টিম বায়োডেটা পর্যালোচনা করে অনুমোদন দেয়। ইসলামিক আদর্শ ও নির্দেশিকা মেনে না চললে বায়োডেটা প্রত্যাখ্যান করা হতে পারে।',
      },
      {
        q: 'বায়োডেটা কি পরে সম্পাদনা করা যাবে?',
        a: 'হ্যাঁ, যেকোনো সময় বায়োডেটা আপডেট করা যাবে। তবে আপডেটের পর বায়োডেটা পুনরায় পর্যালোচনার জন্য পাঠানো হবে।',
      },
      {
        q: 'আমার ছবি কি অন্যরা দেখতে পাবে?',
        a: 'অনুমোদিত সদস্যরা আপনার ছবি দেখতে পারবেন। তবে আপনি সেটিংস থেকে প্রোফাইলের দৃশ্যমানতা নিয়ন্ত্রণ করতে পারবেন।',
      },
      {
        q: 'একটি একাউন্টে কি একাধিক বায়োডেটা দেওয়া যাবে?',
        a: 'না, প্রতিটি একাউন্টে শুধুমাত্র একটি বায়োডেটা তৈরি করা যাবে।',
      },
    ],
  },
  {
    category: 'পেমেন্ট ও যোগাযোগ',
    items: [
      {
        q: 'যোগাযোগের তথ্য দেখতে কত টাকা লাগবে?',
        a: 'একটি প্রোফাইলের সম্পূর্ণ যোগাযোগের তথ্য আনলক করতে মাত্র ৫০ টাকা লাগবে। প্রিমিয়াম সদস্যরা সীমাহীন যোগাযোগ দেখতে পারবেন।',
      },
      {
        q: 'কোন পেমেন্ট পদ্ধতি গ্রহণ করা হয়?',
        a: 'bKash, Nagad এবং Rocket-এর মাধ্যমে পেমেন্ট করা যাবে।',
      },
      {
        q: 'পেমেন্ট করার পর যোগাযোগ না পেলে কী করব?',
        a: 'পেমেন্ট নিশ্চিত হলে সাথে সাথে যোগাযোগের তথ্য দেখা যাবে। সমস্যা হলে আমাদের সাথে যোগাযোগ করুন — আমরা সহায়তা করব।',
      },
      {
        q: 'প্রিমিয়াম সদস্যতার সুবিধা কী?',
        a: 'প্রিমিয়াম সদস্যরা সীমাহীন প্রোফাইলের যোগাযোগ তথ্য দেখতে পারবেন, বায়োডেটা ডাউনলোড করতে পারবেন এবং অগ্রাধিকারভিত্তিক সহায়তা পাবেন।',
      },
    ],
  },
  {
    category: 'গোপনীয়তা ও নিরাপত্তা',
    items: [
      {
        q: 'আমার ব্যক্তিগত তথ্য কি নিরাপদ?',
        a: 'হ্যাঁ। আপনার ফোন নম্বর, ইমেইল এবং অন্যান্য যোগাযোগের তথ্য সরাসরি প্রদর্শিত হয় না। শুধুমাত্র পেমেন্টের পর অন্য সদস্যরা যোগাযোগ তথ্য দেখতে পারবেন।',
      },
      {
        q: 'আমি কি বিপরীত লিঙ্গ ছাড়া অন্য প্রোফাইল দেখতে পারব?',
        a: 'না। ইসলামিক আদর্শ অনুযায়ী, পুরুষ সদস্যরা শুধু মহিলা প্রোফাইল এবং মহিলা সদস্যরা শুধু পুরুষ প্রোফাইল দেখতে পারবেন।',
      },
      {
        q: 'কোনো সন্দেহজনক প্রোফাইল রিপোর্ট করব কীভাবে?',
        a: 'প্রোফাইল পেজে "রিপোর্ট করুন" বাটনে ক্লিক করুন। আমাদের টিম দ্রুত ব্যবস্থা নেবে।',
      },
      {
        q: 'একাউন্ট ডিলিট করতে চাইলে কী করব?',
        a: 'সেটিংস পেজে গিয়ে "একাউন্ট নিষ্ক্রিয় করুন" অপশন থেকে একাউন্ট বন্ধ করতে পারবেন।',
      },
    ],
  },
  {
    category: 'অন্যান্য',
    items: [
      {
        q: 'বিয়ে হয়ে গেলে প্রোফাইল কী করব?',
        a: 'বিয়ে হলে আপনার প্রোফাইলে "বিয়ে হয়েছে" হিসেবে চিহ্নিত করুন। এটি আপনার প্রোফাইল অনুসন্ধান থেকে সরিয়ে দেবে এবং অন্যদের জন্য সুবিধা হবে।',
      },
      {
        q: 'অ্যাপটি কি মোবাইলে ব্যবহার করা যায়?',
        a: 'হ্যাঁ, Holy Relationship সম্পূর্ণ মোবাইল-ফ্রেন্ডলি। যেকোনো ব্রাউজার থেকে ব্যবহার করা যাবে।',
      },
      {
        q: 'আরও কোনো প্রশ্ন থাকলে কোথায় যোগাযোগ করব?',
        a: 'আমাদের সাথে যোগাযোগ পেজে বা সরাসরি ইমেইল করুন info@holyrelationship.com — আমরা সর্বদা সহায়তার জন্য প্রস্তুত।',
      },
    ],
  },
];

function FAQItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-800 text-sm pr-4">{q}</span>
        {open ? (
          <FaChevronUp size={13} className="text-[#1a5276] flex-shrink-0" />
        ) : (
          <FaChevronDown size={13} className="text-gray-400 flex-shrink-0" />
        )}
      </button>
      {open && (
        <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-50 bg-gray-50/50">
          <p className="pt-3">{a}</p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  return (
    <>
      <Navbar />
      <main className="min-h-screen bg-gray-50">
        {/* Hero */}
        <div className="bg-gradient-to-br from-[#1a5276] to-[#0c3a5e] text-white py-14">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <FaQuestionCircle size={30} className="text-[#c9a84c]" />
            </div>
            <h1 className="text-3xl font-bold mb-2">সাধারণ জিজ্ঞাসা</h1>
            <p className="text-white/70 text-sm">
              আপনার মনে যে প্রশ্নগুলো আসতে পারে তার উত্তর এখানে পাবেন
            </p>
          </div>
        </div>

        {/* FAQ Content */}
        <div className="max-w-3xl mx-auto px-4 py-12">
          <div className="space-y-10">
            {faqs.map((section) => (
              <div key={section.category}>
                <h2 className="text-base font-bold text-[#1a5276] mb-4 flex items-center gap-2">
                  <span className="w-1 h-5 bg-[#c9a84c] rounded-full inline-block" />
                  {section.category}
                </h2>
                <div className="space-y-2">
                  {section.items.map((item) => (
                    <FAQItem key={item.q} q={item.q} a={item.a} />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-12 bg-[#1a5276] rounded-2xl p-7 text-center text-white">
            <p className="font-semibold text-lg mb-1">আরও কোনো প্রশ্ন আছে?</p>
            <p className="text-white/70 text-sm mb-5">
              আমাদের সাপোর্ট টিম সবসময় আপনাকে সাহায্য করতে প্রস্তুত।
            </p>
            <Link
              href="/contact"
              className="inline-block bg-[#c9a84c] hover:bg-[#b8943b] text-white font-semibold px-7 py-2.5 rounded-xl transition-colors text-sm"
            >
              যোগাযোগ করুন
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
