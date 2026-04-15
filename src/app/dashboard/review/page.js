'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { reviewAPI } from '@/lib/api';
import toast from 'react-hot-toast';
import { FaStar, FaSpinner, FaCheckCircle } from 'react-icons/fa';

export default function ReviewPage() {
  const [existing, setExisting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isMarried, setIsMarried] = useState(false);
  const [marriedViaSite, setMarriedViaSite] = useState(false);

  useEffect(() => {
    reviewAPI.getMy()
      .then(({ data }) => setExisting(data.review))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) { toast.error('রেটিং দিন'); return; }
    if (!comment.trim()) { toast.error('মন্তব্য লিখুন'); return; }
    setSubmitting(true);
    try {
      const { data } = await reviewAPI.submit({ rating, comment, isMarried, marriedViaSite });
      toast.success('রিভিউ জমা হয়েছে! অ্যাডমিন অনুমোদনের অপেক্ষায়।');
      setExisting(data.review);
    } catch (err) {
      toast.error(err.response?.data?.messageBn || 'সমস্যা হয়েছে');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout><div className="flex justify-center p-10"><FaSpinner className="animate-spin text-[#1a5276]" size={28} /></div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="max-w-xl mx-auto space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">রিভিউ দিন</h1>
          <p className="text-sm text-gray-500 mt-1">আপনার অভিজ্ঞতা শেয়ার করুন</p>
        </div>

        {existing ? (
          <div className="bg-white rounded-xl border p-6 text-center">
            <FaCheckCircle className="mx-auto text-green-500 mb-3" size={36} />
            <p className="font-bold text-gray-800 text-lg mb-1">রিভিউ জমা হয়েছে</p>
            <div className="flex justify-center gap-1 mb-3">
              {Array(5).fill(0).map((_, i) => (
                <FaStar key={i} className={i < existing.rating ? 'text-[#c9a84c]' : 'text-gray-200'} size={20} />
              ))}
            </div>
            <p className="text-gray-600 text-sm italic">"{existing.comment}"</p>
            <p className={`mt-3 text-xs font-semibold px-3 py-1 rounded-full inline-block ${existing.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
              {existing.isApproved ? 'অনুমোদিত' : 'অনুমোদনের অপেক্ষায়'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl border p-6 space-y-5">
            {/* Star rating */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">রেটিং *</label>
              <div className="flex gap-2">
                {Array(5).fill(0).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(i + 1)}
                    onMouseEnter={() => setHoverRating(i + 1)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="transition-transform hover:scale-110"
                  >
                    <FaStar
                      size={32}
                      className={(hoverRating || rating) > i ? 'text-[#c9a84c]' : 'text-gray-200'}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">মন্তব্য * <span className="text-gray-400 font-normal">({comment.length}/500)</span></label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value.slice(0, 500))}
                placeholder="আপনার অভিজ্ঞতা লিখুন..."
                rows={4}
                className="input-field resize-none"
              />
            </div>

            {/* Married toggle */}
            <div className="flex items-center justify-between py-3 border-t border-b">
              <label className="text-sm font-medium text-gray-700">বিয়ে হয়েছে?</label>
              <button
                type="button"
                onClick={() => { setIsMarried(!isMarried); if (isMarried) setMarriedViaSite(false); }}
                className={`relative w-12 h-6 rounded-full transition-colors ${isMarried ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${isMarried ? 'left-7' : 'left-1'}`} />
              </button>
            </div>

            {isMarried && (
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">এই সাইটের মাধ্যমে হয়েছে?</label>
                <button
                  type="button"
                  onClick={() => setMarriedViaSite(!marriedViaSite)}
                  className={`relative w-12 h-6 rounded-full transition-colors ${marriedViaSite ? 'bg-[#1a5276]' : 'bg-gray-300'}`}
                >
                  <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all shadow ${marriedViaSite ? 'left-7' : 'left-1'}`} />
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full btn-primary py-3 rounded-xl font-semibold flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {submitting && <FaSpinner className="animate-spin" />}
              রিভিউ জমা দিন
            </button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}
