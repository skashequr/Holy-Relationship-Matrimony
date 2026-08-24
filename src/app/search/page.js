'use client';

import { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileCard from '@/components/ProfileCard';
import { SkeletonCard, PageLoader } from '@/components/LoadingSpinner';
import FilterSidebar, { initialFilters } from '@/components/FilterSidebar';
import { searchAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FaSearch, FaFilter, FaVenusMars, FaLock } from 'react-icons/fa';
import Link from 'next/link';

export default function SearchPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const isGuest = !authLoading && !isAuthenticated;

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [districts, setDistricts] = useState({});

  const searchGender = filters.gender === 'male' ? 'পুরুষ'
    : filters.gender === 'female' ? 'মহিলা'
    : isGuest ? 'সকল' : (user?.gender === 'male' ? 'মহিলা' : 'পুরুষ');

  useEffect(() => {
    searchAPI.getDistricts().then(({ data }) => setDistricts(data.divisions || {}));
  }, []);

  const fetchProfiles = useCallback(async (currentPage = 1, currentFilters = filters) => {
    setLoading(true);
    try {
      const params = { page: currentPage, limit: 12 };
      Object.entries(currentFilters).forEach(([k, v]) => {
        if (v !== '' && v !== false) params[k] = v;
      });
      const { data } = await searchAPI.search(params);
      if (currentPage === 1) setProfiles(data.data || []);
      else setProfiles((prev) => [...prev, ...(data.data || [])]);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch {}
    finally { setLoading(false); }
  }, [filters]);

  // Wait for the auth check to resolve before the first fetch, since guests
  // and logged-in users are shown a different (opposite-gender vs. all) pool.
  useEffect(() => {
    if (authLoading) return;
    fetchProfiles(1, filters);
    setPage(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading]);

  const handleSearch = () => {
    setPage(1);
    fetchProfiles(1, filters);
  };

  const handleReset = () => {
    setFilters(initialFilters);
    setPage(1);
    fetchProfiles(1, initialFilters);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchProfiles(next, filters);
  };

  const activeFiltersCount = Object.entries(filters).filter(([, v]) => v !== '' && v !== false).length;

  if (authLoading) return <PageLoader />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">প্রোফাইল খুঁজুন</h1>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <p className="text-sm text-gray-500">
                {total > 0 ? `${total} টি প্রোফাইল পাওয়া গেছে` : 'ফিল্টার দিয়ে প্রোফাইল খুঁজুন'}
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs bg-[#1a5276]/10 text-[#1a5276] px-2.5 py-1 rounded-full font-medium">
                <FaVenusMars size={11} /> {searchGender} প্রোফাইল দেখছেন
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 btn-outline px-4 py-2.5 rounded-xl text-sm relative"
          >
            <FaFilter size={13} />
            ফিল্টার
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1a5276] text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {isGuest && (
          <div className="card mb-5 flex items-start gap-3 bg-amber-50 border-amber-200">
            <FaLock className="text-amber-500 mt-1 flex-shrink-0" size={16} />
            <p className="text-sm text-amber-800">
              আপনি বায়োডাটা ব্রাউজ করছেন <strong>লগইন ছাড়াই</strong>। সম্পূর্ণ বিস্তারিত ও যোগাযোগের তথ্য দেখতে{' '}
              <Link href="/login" className="font-semibold underline">লগইন</Link> অথবা{' '}
              <Link href="/register" className="font-semibold underline">নিবন্ধন</Link> করুন।
            </p>
          </div>
        )}

        <div className="flex gap-6">
          <FilterSidebar
            filters={filters}
            setFilters={setFilters}
            districts={districts}
            isGuest={isGuest}
            showAdvanced={showAdvanced}
            setShowAdvanced={setShowAdvanced}
            onSearch={handleSearch}
            onReset={handleReset}
            mobileOpen={mobileFilterOpen}
            onMobileClose={() => setMobileFilterOpen(false)}
          />

          {/* Results */}
          <main className="flex-1 min-w-0">
            {loading && profiles.length === 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : profiles.length === 0 ? (
              <div className="card text-center py-16">
                <FaSearch className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500 font-medium">কোনো প্রোফাইল পাওয়া যায়নি</p>
                <p className="text-gray-400 text-sm mt-1">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {profiles.map((biodata) => (
                    <ProfileCard key={biodata._id} biodata={biodata} />
                  ))}
                  {loading && Array(4).fill(0).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
                </div>

                {page < totalPages && (
                  <div className="text-center mt-8">
                    <button
                      onClick={handleLoadMore}
                      disabled={loading}
                      className="btn-outline px-8 py-3 rounded-xl"
                    >
                      {loading ? 'লোড হচ্ছে...' : 'আরো দেখুন'}
                    </button>
                  </div>
                )}
              </>
            )}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
