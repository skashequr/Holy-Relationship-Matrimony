'use client';

import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileCard from '@/components/ProfileCard';
import { SkeletonCard } from '@/components/LoadingSpinner';
import { matchAPI } from '@/lib/api';
import { FaList, FaHeart } from 'react-icons/fa';
import Link from 'next/link';

export default function ShortlistPage() {
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => { fetchShortlist(1); }, []);

  const fetchShortlist = async (pg) => {
    setLoading(true);
    try {
      const { data } = await matchAPI.getShortlist({ page: pg, limit: 12 });
      if (pg === 1) setProfiles(data.data || []);
      else setProfiles((prev) => [...prev, ...(data.data || [])]);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  };

  return (
    <DashboardLayout>
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <FaList className="text-[#1a5276]" /> শর্টলিস্ট
          </h1>
          <p className="text-sm text-gray-500 mt-1">আপনার সেভ করা {total} টি প্রোফাইল</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {loading && profiles.length === 0
            ? Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : profiles.map((p) => <ProfileCard key={p._id} biodata={p} />)
          }
        </div>

        {profiles.length === 0 && !loading && (
          <div className="card text-center py-16">
            <FaHeart className="mx-auto text-gray-300 mb-3" size={40} />
            <p className="text-gray-500 font-medium">শর্টলিস্ট খালি</p>
            <p className="text-gray-400 text-sm mt-1 mb-5">প্রোফাইল কার্ডের ❤ বাটনে চাপ দিয়ে শর্টলিস্টে যোগ করুন।</p>
            <Link href="/search" className="btn-primary inline-block px-6 py-2.5 rounded-xl">প্রোফাইল খুঁজুন</Link>
          </div>
        )}

        {page < totalPages && (
          <div className="text-center mt-8">
            <button onClick={() => { const next = page + 1; setPage(next); fetchShortlist(next); }} disabled={loading} className="btn-outline px-8 py-3 rounded-xl">
              {loading ? 'লোড হচ্ছে...' : 'আরো দেখুন'}
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
