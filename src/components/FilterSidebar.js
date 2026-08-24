'use client';

import { Fragment } from 'react';
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

export const initialFilters = {
  gender: '', biodataNumber: '',
  ageMin: '', ageMax: '',
  heightMin: '', heightMax: '',
  maritalStatus: '',
  division: '', district: '',
  education: '', profession: '',
  income: '', complexion: '',
  madhab: '', praysFiveTimes: false,
  familyReligiousness: '',
};

const genderOptions = [
  { value: 'male', label: 'পুরুষ' },
  { value: 'female', label: 'মহিলা' },
];

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

/**
 * Filter controls shared by the desktop sidebar and the mobile drawer.
 * Guests only get the basic location/age filters; advanced filters and
 * the division/district cascade are unlocked once the search results
 * themselves are gated behind login anyway.
 */
function FilterFields({ filters, setFilters, districts, isGuest, showAdvanced, setShowAdvanced }) {
  const set = (key) => (val) => setFilters((f) => ({ ...f, [key]: val }));
  const availableDistricts = filters.division ? (districts[filters.division] || []) : [];

  return (
    <>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">মূল ফিল্টার</p>
      <div className="space-y-4">
        <div>
          <label className="label">বায়োডাটা নম্বর দিয়ে খুঁজুন</label>
          <input
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
        />
        <RangeInput
          label="বয়স (বছর)"
          minVal={filters.ageMin} maxVal={filters.ageMax}
          onMinChange={set('ageMin')} onMaxChange={set('ageMax')}
          min={18} max={70}
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

        {!isGuest && (
          <>
            <FilterSelect
              label="বৈবাহিক অবস্থা"
              value={filters.maritalStatus} onChange={set('maritalStatus')}
              options={maritalStatusOptions}
            />
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
}) {
  const fieldProps = { filters, setFilters, districts, isGuest, showAdvanced, setShowAdvanced };

  return (
    <>
      {/* Desktop persistent sidebar */}
      <aside className="hidden lg:block w-72 flex-shrink-0">
        <div className="card sticky top-24 max-h-[calc(100vh-7rem)] overflow-y-auto">
          <FilterFields {...fieldProps} />
          <div className="flex gap-3 mt-5 pt-4 border-t border-gray-100">
            <button onClick={onSearch} className="btn-primary flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2">
              <FaSearch size={13} /> অনুসন্ধান
            </button>
            <button onClick={onReset} className="btn-outline px-4 py-2.5 rounded-lg flex items-center justify-center">
              <FaTimes size={13} />
            </button>
          </div>
        </div>
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
              <Dialog.Panel className="relative w-[85vw] max-w-sm h-full bg-white shadow-xl overflow-y-auto">
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 sticky top-0 bg-white z-10">
                  <Dialog.Title className="font-bold text-gray-800">ফিল্টার</Dialog.Title>
                  <button onClick={onMobileClose} className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-50">
                    <FaTimes size={18} />
                  </button>
                </div>
                <div className="p-4">
                  <FilterFields {...fieldProps} />
                </div>
                <div className="flex gap-3 p-4 border-t border-gray-100 sticky bottom-0 bg-white">
                  <button
                    onClick={() => { onSearch(); onMobileClose(); }}
                    className="btn-primary flex-1 py-2.5 rounded-lg flex items-center justify-center gap-2"
                  >
                    <FaSearch size={13} /> অনুসন্ধান
                  </button>
                  <button onClick={onReset} className="btn-outline px-4 py-2.5 rounded-lg flex items-center justify-center">
                    <FaTimes size={13} />
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </Dialog>
      </Transition>
    </>
  );
}
