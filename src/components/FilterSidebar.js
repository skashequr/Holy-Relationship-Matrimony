'use client';

import { Fragment, useId } from 'react';
import theme from './SearchTheme.module.css';
export { initialFilters } from '@/lib/search';
import Link from 'next/link';
import { Dialog, Transition } from '@headlessui/react';
import {
  educationLabels, professionLabels, incomeLabels,
  complexionLabels, madhabLabels,
} from '@/lib/utils';
import { FaSearch, FaTimes, FaChevronDown, FaLock } from 'react-icons/fa';

export const divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

export const maritalStatusOptions = [
  { value: 'single', label: 'অবিবাহিত' },
  { value: 'divorced', label: 'তালাকপ্রাপ্ত' },
  { value: 'widowed', label: 'বিধবা/বিপত্নীক' },
];

const educationOptions = Object.entries(educationLabels.bn).map(([value, label]) => ({ value, label }));
const professionOptions = Object.entries(professionLabels.bn).map(([value, label]) => ({ value, label }));
const incomeOptions = Object.entries(incomeLabels.bn).map(([value, label]) => ({ value, label }));
const complexionOptions = Object.entries(complexionLabels.bn).map(([value, label]) => ({ value, label }));
const madhabOptions = Object.entries(madhabLabels.bn).map(([value, label]) => ({ value, label }));

const genderOptions = [
  { value: 'male', label: 'পুরুষ' },
  { value: 'female', label: 'মহিলা' },
];

function FilterSelect({ label, value, onChange, options, placeholder = 'সব' }) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="label">{label}</label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className="input-field text-sm cursor-pointer">
        <option value="">{placeholder}</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

function RangeInput({ label, minVal, maxVal, onMinChange, onMaxChange, minPlaceholder = 'থেকে', maxPlaceholder = 'পর্যন্ত', min, max }) {
  return (
    <fieldset className="min-w-0">
      <legend className="label">{label}</legend>
      <div className="flex gap-2">
        <input
          type="number" placeholder={minPlaceholder} value={minVal}
          onChange={(e) => onMinChange(e.target.value)}
          aria-label={`সর্বনিম্ন ${label}`} className="input-field text-sm min-w-0" min={min} max={max} step={label.includes('সেমি') ? 'any' : 1}
        />
        <input
          type="number" placeholder={maxPlaceholder} value={maxVal}
          onChange={(e) => onMaxChange(e.target.value)}
          aria-label={`সর্বোচ্চ ${label}`} className="input-field text-sm min-w-0" min={min} max={max} step={label.includes('সেমি') ? 'any' : 1}
        />
      </div>
    </fieldset>
  );
}

/**
 * Filter controls shared by the desktop sidebar and the mobile drawer.
 * Guests can browse using the basic filters. Advanced fields require login.
 */
function FilterFields({ filters, setFilters, districts, isGuest, showAdvanced, setShowAdvanced }) {
  const id = useId();
  const set = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));
  const availableDistricts = filters.division ? (districts[filters.division] || []) : [];

  return (
    <>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">মূল ফিল্টার</p>
      <div className="space-y-4">
        <div>
          <label htmlFor={`${id}-number`} className="label">বায়োডাটা নম্বর দিয়ে খুঁজুন</label>
          <input
            id={`${id}-number`}
            type="text"
            placeholder="যেমন: BD000123"
            value={filters.biodataNumber}
            onChange={(e) => setFilters((f) => ({ ...f, biodataNumber: e.target.value }))}
            className="input-field text-sm"
          />
        </div>
        <FilterSelect
          label="পাত্র/পাত্রী"
          value={filters.gender} onChange={set('gender')}
          options={genderOptions}
          placeholder={isGuest ? 'সকল পাত্র/পাত্রী' : 'আমার জন্য প্রাসঙ্গিক'}
        />
        <RangeInput
          label="বয়স (বছর)"
          minVal={filters.ageMin} maxVal={filters.ageMax}
          onMinChange={set('ageMin')} onMaxChange={set('ageMax')}
          min={18} max={100}
        />
        <div>
          <label htmlFor={`${id}-division`} className="label">বিভাগ</label>
          <select
            id={`${id}-division`}
            value={filters.division}
            onChange={(e) => setFilters((f) => ({ ...f, division: e.target.value, district: '' }))}
            className="input-field text-sm"
          >
            <option value="">সব বিভাগ</option>
            {divisions.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor={`${id}-district`} className="label">জেলা</label>
          <select
            id={`${id}-district`}
            value={filters.district}
            onChange={(e) => setFilters((f) => ({ ...f, district: e.target.value }))}
            className="input-field text-sm disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed"
            disabled={!filters.division || availableDistricts.length === 0}
          >
            <option value="">{!filters.division ? 'আগে বিভাগ বাছুন' : availableDistricts.length ? 'সব জেলা' : 'জেলার তালিকা পাওয়া যায়নি'}</option>
            {availableDistricts.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        <FilterSelect
              label="বৈবাহিক অবস্থা"
              value={filters.maritalStatus} onChange={set('maritalStatus')}
              options={maritalStatusOptions}
            />
        {!isGuest && (
          <>
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
          </>
        )}
      </div>

      {isGuest ? (
        <div className="mt-5 pt-4 border-t border-dashed border-gray-200">
          <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-lg p-3">
            <FaLock className="text-amber-500 mt-0.5 flex-shrink-0" size={13} />
            <p className="text-xs text-amber-800 leading-relaxed">
              আরো ফিল্টার ও সম্পূর্ণ বিস্তারিত দেখতে{' '}
              <Link href="/login" className="font-semibold underline">লগইন</Link> অথবা{' '}
              <Link href="/register" className="font-semibold underline">নিবন্ধন</Link> করুন।
            </p>
          </div>
        </div>
      ) : (
        <>
          <button
            aria-expanded={showAdvanced}
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-[#1a5276] font-semibold mt-5 mb-1 hover:underline"
            type="button"
          >
            <FaChevronDown size={12} className={`transition-transform ${showAdvanced ? 'rotate-180' : ''}`} />
            {showAdvanced ? 'উন্নত ফিল্টার লুকান' : 'উন্নত ফিল্টার দেখুন (Advanced)'}
          </button>

          {showAdvanced && (
            <div className="mt-3 pt-4 border-t border-dashed border-gray-200 space-y-4">
              <RangeInput
                label="উচ্চতা (সেমি)"
                minVal={filters.heightMin} maxVal={filters.heightMax}
                onMinChange={set('heightMin')} onMaxChange={set('heightMax')}
                min={100} max={250}
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
          )}
        </>
      )}
    </>
  );
}

export default function FilterSidebar({
  filters, setFilters, districts, isGuest,
  showAdvanced, setShowAdvanced,
  onSearch, onReset,
  mobileOpen, onMobileClose,
  loading = false, error = '', hasChanges = false,
}) {
  const fieldProps = { filters, setFilters, districts, isGuest, showAdvanced, setShowAdvanced };

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <form onSubmit={(event) => { event.preventDefault(); onSearch(); }} className="bg-white border border-gray-200 rounded-2xl sticky top-24 max-h-[calc(100dvh-22rem)] min-h-[380px] flex flex-col overflow-hidden">
          <div className="p-5 border-b border-gray-100 shrink-0"><h2 className="font-bold text-lg text-[#173c52]">আপনার পছন্দ বাছুন</h2><p className="text-xs text-gray-500 mt-1">এক বা একাধিক ফিল্টার ব্যবহার করুন</p></div>
          <div className="p-5 overflow-y-auto min-h-0">
          <FilterFields {...fieldProps} />
          </div>
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            {error && <p role="alert" className="text-sm text-red-700 mb-3">{error}</p>}
            {hasChanges && !error && <p className="text-xs text-[#1a5276] mb-3">ফিল্টার প্রয়োগ করতে অনুসন্ধান করুন</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={loading} className="btn-primary flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2">
              <FaSearch size={13} /> {loading ? 'খোঁজা হচ্ছে…' : 'অনুসন্ধান'}
            </button>
            <button type="button" aria-label="সব ফিল্টার মুছুন" onClick={onReset} className="btn-outline px-4 py-2.5 rounded-lg flex items-center justify-center">
              <FaTimes size={13} />
            </button>
          </div>
          </div>
        </form>
      </aside>

      {/* Mobile off-canvas drawer */}
      <Transition show={mobileOpen} as={Fragment}>
        <Dialog as="div" className="relative z-[70] lg:hidden" onClose={onMobileClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200" enterFrom="opacity-0" enterTo="opacity-100"
            leave="ease-in duration-150" leaveFrom="opacity-100" leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/40" />
          </Transition.Child>

          <div className="fixed inset-0 flex">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-200" enterFrom="-translate-x-full" enterTo="translate-x-0"
              leave="ease-in duration-150" leaveFrom="translate-x-0" leaveTo="-translate-x-full"
            >
              <Dialog.Panel className={`${theme.theme} relative w-full max-w-sm h-[100dvh] bg-[#fffefa] shadow-xl flex flex-col`}>
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <Dialog.Title className="font-bold text-gray-800">ফিল্টার</Dialog.Title>
                  <button aria-label="ফিল্টার বন্ধ করুন" onClick={onMobileClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                    <FaTimes size={18} />
                  </button>
                </div>
                <form className="flex flex-col flex-1 min-h-0" onSubmit={(event) => { event.preventDefault(); if (onSearch() !== false) onMobileClose(); }}>
                <div className="p-5 overflow-y-auto flex-1">
                  <FilterFields {...fieldProps} />
                </div>
                <div className="p-4 border-t border-gray-100 bg-white pb-[max(1rem,env(safe-area-inset-bottom))]">
                  {error && <p role="alert" className="text-sm text-red-700 mb-3">{error}</p>}
                  <div className="flex gap-3">
                  <button
                    type="submit" disabled={loading}
                    className="btn-primary flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2"
                  >
                    <FaSearch size={13} /> {loading ? 'খোঁজা হচ্ছে…' : 'অনুসন্ধান'}
                  </button>
                  <button type="button" aria-label="সব ফিল্টার মুছুন" onClick={onReset} className="btn-outline px-4 py-2.5 rounded-lg flex items-center justify-center">
                    <FaTimes size={13} />
                  </button>
                </div>
                </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
