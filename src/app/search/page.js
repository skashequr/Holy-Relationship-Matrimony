'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProfileCard from '@/components/ProfileCard';
import { SkeletonCard, PageLoader } from '@/components/LoadingSpinner';
import FilterSidebar, { initialFilters } from '@/components/FilterSidebar';
import { searchAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FaSearch, FaFilter, FaVenusMars, FaLock } from 'react-icons/fa';
import Link from 'next/link';
import { normalizeFilters, validateFilters, searchParams, mergeProfiles } from '@/lib/search';
import styles from './page.module.css';
import theme from '@/components/SearchTheme.module.css';

export default function SearchPage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const isGuest = !authLoading && !isAuthenticated;

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [districts, setDistricts] = useState({});
  const [appliedFilters, setAppliedFilters] = useState(initialFilters);
  const [error, setError] = useState('');
  const [filterError, setFilterError] = useState('');
  const requestId = useRef(0);
  const pending = useRef(false);
  const lastRequest = useRef({ page: 1, filters: initialFilters });

  const searchGender = appliedFilters.biodataNumber ? 'সকল'
    : appliedFilters.gender === 'male' ? 'পুরুষ'
    : appliedFilters.gender === 'female' ? 'মহিলা'
    : isGuest ? 'সকল' : (user?.gender === 'male' ? 'মহিলা' : 'পুরুষ');

  useEffect(() => {
    searchAPI.getDistricts().then(({ data }) => setDistricts(data.divisions || {})).catch(() => setDistricts({}));
  }, []);

  const fetchProfiles = useCallback(async (currentPage, currentFilters) => {
    const id = ++requestId.current;
    pending.current = true;
    lastRequest.current = { page: currentPage, filters: currentFilters };
    setLoading(true);
    setError('');
    if (currentPage === 1) {
      setProfiles([]);
      setTotal(0);
      setPage(1);
      setTotalPages(1);
      setAppliedFilters(currentFilters);
    }
    try {
      const { data } = await searchAPI.search(searchParams(currentFilters, currentPage));
      if (id !== requestId.current) return;
      if (currentPage === 1) setProfiles(data.data || []);
      else setProfiles((prev) => mergeProfiles(prev, data.data || []));
      setPage(currentPage);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
    } catch (err) {
      if (id === requestId.current) setError(err.response?.data?.messageBn || 'প্রোফাইল লোড করা যায়নি। সংযোগ পরীক্ষা করে আবার চেষ্টা করুন।');
    } finally {
      if (id === requestId.current) { setLoading(false); pending.current = false; }
    }
  }, []);

  // Wait for the auth check to resolve before the first fetch, since guests
  // and logged-in users are shown a different (opposite-gender vs. all) pool.
  useEffect(() => {
    if (authLoading) return;
    const query = new URLSearchParams(window.location.search);
    const landingFilters = { ...initialFilters };
    const allowed = {
      gender: ['male', 'female'],
      maritalStatus: ['single', 'divorced', 'widowed'],
      division: ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'],
    };
    Object.entries(allowed).forEach(([key, values]) => {
      const value = query.get(key);
      if (values.includes(value)) landingFilters[key] = value;
    });
    for (const key of ['ageMin', 'ageMax']) {
      const value = query.get(key);
      if (value && Number.isInteger(Number(value)) && Number(value) >= 18 && Number(value) <= 100) landingFilters[key] = value;
    }
    if (landingFilters.ageMin && landingFilters.ageMax && Number(landingFilters.ageMin) > Number(landingFilters.ageMax)) {
      landingFilters.ageMin = '';
      landingFilters.ageMax = '';
    }
    setFilters(landingFilters);
    fetchProfiles(1, landingFilters);
    setPage(1);
    return () => { requestId.current++; pending.current = false; };
  }, [authLoading, user?._id, fetchProfiles]);

  const handleSearch = () => {
    const nextFilters = normalizeFilters(filters);
    const validation = validateFilters(nextFilters);
    setFilterError(validation);
    if (validation) return false;
    setFilters(nextFilters);
    fetchProfiles(1, nextFilters);
    return true;
  };

  const handleReset = () => {
    setFilterError('');
    setFilters(initialFilters);
    setPage(1);
    fetchProfiles(1, initialFilters);
  };

  const handleLoadMore = () => {
    if (pending.current || page >= totalPages) return;
    fetchProfiles(page + 1, appliedFilters);
  };

  const activeFiltersCount = Object.entries(appliedFilters).filter(([, v]) => v !== '' && v !== false).length;
  const hasChanges = JSON.stringify(normalizeFilters(filters)) !== JSON.stringify(appliedFilters);

  if (authLoading) return <PageLoader />;

  return (
    <div className={styles.page}>
      <Navbar variant="home" />
      <div className={`${styles.container} ${theme.theme}`}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <p className={styles.eyebrow}>আপনার পছন্দ, আপনার জীবনসঙ্গী</p>
            <h1 className={styles.title}>প্রোফাইল খুঁজুন</h1>
            <div className="flex items-center gap-3 mt-0.5 flex-wrap">
              <p className="text-sm text-gray-500">
                বয়স, ঠিকানা ও পছন্দ অনুযায়ী বায়োডাটা খুঁজে নিন।
              </p>
              <span className="inline-flex items-center gap-1.5 text-xs bg-[#1a5276]/10 text-[#1a5276] px-2.5 py-1 rounded-full font-medium">
                <FaVenusMars size={11} /> {searchGender} প্রোফাইল দেখছেন
              </span>
            </div>
          </div>
          <button
            onClick={() => setMobileFilterOpen(true)}
            aria-expanded={mobileFilterOpen}
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
          <div className={styles.guestNotice}>
            <FaLock className="text-amber-500 mt-1 flex-shrink-0" size={16} />
            <p className="text-sm text-amber-800">
              আপনি বায়োডাটা ব্রাউজ করছেন <strong>লগইন ছাড়াই</strong>। সম্পূর্ণ বিস্তারিত ও যোগাযোগের তথ্য দেখতে{' '}
              <Link href="/login?redirect=%2Fsearch" className="font-semibold underline">লগইন</Link> অথবা{' '}
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
            loading={loading}
            error={filterError}
            hasChanges={hasChanges}
          />

          {/* Results */}
          <main className="flex-1 min-w-0" aria-label="সার্চের ফলাফল" aria-busy={loading}>
            <div className={styles.resultsHeader}>
              <div role="status" aria-live="polite">
                <h2>{loading && profiles.length === 0 ? 'প্রোফাইল খোঁজা হচ্ছে…' : error && profiles.length === 0 ? 'সার্চের ফলাফল' : `${total.toLocaleString('bn-BD')}টি প্রোফাইল পাওয়া গেছে`}</h2>
                <p>{activeFiltersCount ? `${activeFiltersCount.toLocaleString('bn-BD')}টি ফিল্টার প্রয়োগ করা হয়েছে` : 'সর্বশেষ যুক্ত হওয়া প্রোফাইল আগে দেখানো হচ্ছে'}</p>
              </div>
              {activeFiltersCount > 0 && <button className={styles.reset} onClick={handleReset}>সব ফিল্টার মুছুন</button>}
            </div>
            {hasChanges && <p className={styles.draftNotice}>ফিল্টার বদলেছেন। নতুন ফল দেখতে “অনুসন্ধান” চাপুন।</p>}
            {error && <div className={styles.error} role="alert"><p>{error}</p><button onClick={() => fetchProfiles(lastRequest.current.page, lastRequest.current.filters)} disabled={loading}>আবার চেষ্টা করুন</button></div>}
            {loading && profiles.length === 0 ? (
              <div className={styles.grid}>
                {Array(6).fill(0).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : profiles.length === 0 && !error ? (
              <div className={styles.empty}>
                <FaSearch className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500 font-medium">কোনো প্রোফাইল পাওয়া যায়নি</p>
                <p className="text-gray-400 text-sm mt-1">ফিল্টার পরিবর্তন করে আবার চেষ্টা করুন</p>
                <button onClick={handleReset} className="btn-outline mt-5">সব প্রোফাইল দেখুন</button>
              </div>
            ) : (
              <>
                <div className={styles.grid}>
                  {profiles.map((biodata) => (
                    <ProfileCard key={biodata._id} biodata={biodata} />
                  ))}
                  {loading && Array(4).fill(0).map((_, i) => <SkeletonCard key={`sk-${i}`} />)}
                </div>

                {page < totalPages && (
                  <div className="text-center mt-8">
                    <p className="text-sm text-gray-500 mb-3">{total.toLocaleString('bn-BD')}টির মধ্যে {profiles.length.toLocaleString('bn-BD')}টি দেখছেন</p>
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
      <Footer variant="home" />
    </div>
  );
}
