'use client';

import { useState, useEffect, useCallback } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileCard from '@/components/ProfileCard';
import { SkeletonCard } from '@/components/LoadingSpinner';
import { searchAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import {
  educationLabels, professionLabels, incomeLabels,
  complexionLabels, madhabLabels,
} from '@/lib/utils';
import { FaSearch, FaFilter, FaTimes, FaChevronDown, FaVenusMars } from 'react-icons/fa';

const divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

const maritalStatusOptions = [
  { value: 'single', label: 'অবিবাহিত' },
  { value: 'divorced', label: 'তালাকপ্রাপ্ত' },
  { value: 'widowed', label: 'বিধবা/বিপত্নীক' },
];

const educationOptions = Object.entries(educationLabels.bn).map(([value, label]) => ({ value, label }));
const professionOptions = Object.entries(professionLabels.bn).map(([value, label]) => ({ value, label }));
const incomeOptions = Object.entries(incomeLabels.bn).map(([value, label]) => ({ value, label }));
const complexionOptions = Object.entries(complexionLabels.bn).map(([value, label]) => ({ value, label }));
const madhabOptions = Object.entries(madhabLabels.bn).map(([value, label]) => ({ value, label }));

const initialFilters = {
  ageMin: '', ageMax: '',
  heightMin: '', heightMax: '',
  maritalStatus: '',
  division: '', district: '',
  education: '', profession: '',
  income: '', complexion: '',
  madhab: '', praysFiveTimes: false,
  familyReligiousness: '',
};

function FilterSelect({ label, value, onChange, options, placeholder = 'সব' }) {
  return (
    <div>
      <label className="label">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="input-field text-sm">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function RangeInput({ label, minVal, maxVal, onMinChange, onMaxChange, minPlaceholder = 'থেকে', maxPlaceholder = 'পর্যন্ত', min, max }) {
  return (
    <div>
      <label className="label">{label}</label>
      <div className="flex gap-2">
        <input
          type="number" placeholder={minPlaceholder} value={minVal}
          onChange={(e) => onMinChange(e.target.value)}
          className="input-field text-sm" min={min} max={max}
        />
        <input
          type="number" placeholder={maxPlaceholder} value={maxVal}
          onChange={(e) => onMaxChange(e.target.value)}
          className="input-field text-sm" min={min} max={max}
        />
      </div>
    </div>
  );
}

export default function SearchPage() {
  const { user } = useAuth();
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState(initialFilters);
  const [showFilters, setShowFilters] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [districts, setDistricts] = useState({});

  const searchGender = user?.gender === 'male' ? 'মহিলা' : 'পুরুষ';

  useEffect(() => {
    searchAPI.getDistricts().then(({ data }) => setDistricts(data.divisions || {}));
  }, []);

  const set = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));

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

  useEffect(() => { fetchProfiles(1, filters); setPage(1); }, []);

  const handleSearch = () => {
    setPage(1);
    fetchProfiles(1, filters);
    setShowFilters(false);
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

  const availableDistricts = filters.division ? (districts[filters.division] || []) : [];

  const activeFiltersCount = Object.entries(filters).filter(([, v]) => v !== '' && v !== false).length;

  return (
    <DashboardLayout>
      <div>
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
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 btn-outline px-4 py-2.5 rounded-xl text-sm relative"
          >
            <FaFilter size={13} />
            ফিল্টার
            {activeFiltersCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#1a5276] text-white text-xs rounded-full flex items-center justify-center font-bold">
                {activeFiltersCount}
              </span>
            )}
            <FaChevronDown size={11} className={`transition-transform ${showFilters ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <div className="card mb-6 animate-slide-up">
            {/* Basic Filters */}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">মূল ফিল্টার</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <RangeInput
                label="বয়স (বছর)"
                minVal={filters.ageMin} maxVal={filters.ageMax}
                onMinChange={set('ageMin')} onMaxChange={set('ageMax')}
                min={18} max={70}
              />
              <FilterSelect
                label="বৈবাহিক অবস্থা"
                value={filters.maritalStatus} onChange={set('maritalStatus')}
                options={maritalStatusOptions}
              />
              <div>
                <label className="label">বিভাগ</label>
                <select
                  value={filters.division}
                  onChange={(e) => setFilters((f) => ({ ...f, division: e.target.value, district: '' }))}
                  className="input-field text-sm"
                >
                  <option value="">সব বিভাগ</option>
                  {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="label">জেলা</label>
                <select
                  value={filters.district}
                  onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
                  className="input-field text-sm"
                  disabled={!filters.division}
                >
                  <option value="">সব জেলা</option>
                  {availableDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <FilterSelect
                label="শিক্ষাগত যোগ্যতা"
                value={filters.education} onChange={set('education')}
                options={educationOptions}
              />
              <FilterSelect
                label="পেশা"
                value={filters.profession} onChange={set('profession')}
                options={professionOptions}
              />
            </div>

            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center gap-2 text-sm text-[#1a5276] font-semibold mt-5 mb-1 hover:underline"
            >
              <FaChevronDown size={12} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
              {showAdvanced ? 'উন্নত ফিল্টার লুকান' : 'উন্নত ফিল্টার দেখুন (Advanced)'}
            </button>

            {showAdvanced && (
              <div className="mt-3 pt-4 border-t border-dashed border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <RangeInput
                  label="উচ্চতা (সেমি)"
                  minVal={filters.heightMin} maxVal={filters.heightMax}
                  onMinChange={set('heightMin')} onMaxChange={set('heightMax')}
                  min={130} max={210}
                  minPlaceholder="যেমন: 150"
                  maxPlaceholder="যেমন: 180"
                />
                <FilterSelect
                  label="মাসিক আয়"
                  value={filters.income} onChange={set('income')}
                  options={incomeOptions}
                />
                <FilterSelect
                  label="গায়ের রঙ"
                  value={filters.complexion} onChange={set('complexion')}
                  options={complexionOptions}
                />
                <FilterSelect
                  label="মাযহাব"
                  value={filters.madhab} onChange={set('madhab')}
                  options={madhabOptions}
                />
                <FilterSelect
                  label="পারিবারিক ধার্মিকতা"
                  value={filters.familyReligiousness} onChange={set('familyReligiousness')}
                  options={[
                    { value: 'moderate', label: 'মধ্যম' },
                    { value: 'religious', label: 'ধার্মিক' },
                    { value: 'very_religious', label: 'অত্যন্ত ধার্মিক' },
                  ]}
                />
                <div className="flex items-end pb-2">
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.praysFiveTimes}
                      onChange={(e) => setFilters((f) => ({ ...f, praysFiveTimes: e.target.checked }))}
                      className="w-4 h-4 accent-[#1a5276]"
                    />
                    <span className="text-sm text-gray-700 font-medium">৫ ওয়াক্ত নামাযী</span>
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
              <button onClick={handleSearch} className="btn-primary px-6 py-2.5 rounded-lg flex items-center gap-2">
                <FaSearch size={13} /> অনুসন্ধান করুন
              </button>
              <button onClick={handleReset} className="btn-outline px-6 py-2.5 rounded-lg flex items-center gap-2">
                <FaTimes size={13} /> রিসেট করুন
              </button>
            </div>
          </div>
        )}

        {/* Results */}
        {loading && profiles.length === 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
      </div>
    </DashboardLayout>
  );
}
