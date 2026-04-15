'use client';

import { useState, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { biodataAPI } from '@/lib/api';
import { educationLabels, professionLabels, bloodGroups } from '@/lib/utils';
import toast from 'react-hot-toast';
import { FaArrowRight, FaArrowLeft, FaSpinner, FaCheckCircle } from 'react-icons/fa';

const steps = [
  { id: 1, title: 'ব্যক্তিগত তথ্য', titleEn: 'Personal Info' },
  { id: 2, title: 'ধর্মীয় তথ্য', titleEn: 'Religious Info' },
  { id: 3, title: 'শিক্ষা ও পেশা', titleEn: 'Education & Profession' },
  { id: 4, title: 'পারিবারিক তথ্য', titleEn: 'Family Details' },
  { id: 5, title: 'ঠিকানা', titleEn: 'Address' },
  { id: 6, title: 'যোগাযোগ ও প্রত্যাশা', titleEn: 'Contact & Expectations' },
];

const divisions = ['Dhaka', 'Chittagong', 'Rajshahi', 'Khulna', 'Barishal', 'Sylhet', 'Rangpur', 'Mymensingh'];

function StepIndicator({ steps, currentStep }) {
  return (
    <div className="flex items-center justify-between mb-8 relative">
      <div className="absolute top-4 left-0 right-0 h-0.5 bg-gray-200 -z-0" />
      <div
        className="absolute top-4 left-0 h-0.5 bg-[#1a5276] transition-all duration-500 -z-0"
        style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
      />
      {steps.map((step) => (
        <div key={step.id} className="flex flex-col items-center gap-2 z-10">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border-2 ${
            step.id < currentStep
              ? 'bg-[#1a5276] border-[#1a5276] text-white'
              : step.id === currentStep
              ? 'bg-white border-[#1a5276] text-[#1a5276]'
              : 'bg-white border-gray-200 text-gray-400'
          }`}>
            {step.id < currentStep ? <FaCheckCircle size={14} /> : step.id}
          </div>
          <span className={`text-xs font-medium hidden md:block ${step.id === currentStep ? 'text-[#1a5276]' : 'text-gray-400'}`}>
            {step.title}
          </span>
        </div>
      ))}
    </div>
  );
}

export default function CreateBiodataPage() {
  const router = useRouter();
  const { user } = useAuth();
  const isMale = user?.gender === 'male';
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    personal: { fullName: '', fatherName: '', motherName: '', dateOfBirth: '', birthPlace: '', maritalStatus: 'single', numberOfChildren: 0, height: '', weight: '', complexion: '', bloodGroup: '', physicalDisability: 'None', nationality: 'Bangladeshi' },
    religion: { madhab: 'hanafi', praysFiveTimes: false, wearsPardah: false, hasBeard: false, avoidsHaram: false, quranRecitation: 'partial', followsSunnahDress: false },
    education: { highestLevel: '', degreeName: '', institution: '', subject: '', passingYear: '' },
    profession: { occupationType: '', designation: '', organization: '', monthlyIncome: '' },
    family: { fatherAlive: true, fatherOccupation: '', motherAlive: true, motherOccupation: '', numberOfBrothers: 0, numberOfSisters: 0, familyType: 'nuclear', familyStatus: 'middle', familyReligiousness: 'moderate' },
    address: { permanentDivision: '', permanentDistrict: '', permanentUpazila: '', currentDivision: '', currentDistrict: '', currentUpazila: '', grewUpIn: 'village' },
    lifestyle: { hobbies: [], specialQualities: '', aboutSelf: '' },
    contact: { phone: '', alternatePhone: '', email: '', guardianName: '', guardianPhone: '', guardianRelation: '' },
    partnerExpectations: { ageMin: '', ageMax: '', heightMin: '', heightMax: '', district: [], education: [], profession: [], maritalStatus: [], otherExpectations: '' },
  });

  const update = useCallback((section, field, value) => {
    setFormData((prev) => ({ ...prev, [section]: { ...prev[section], [field]: value } }));
  }, []);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await biodataAPI.create(formData);
      toast.success('বায়োডেটা জমা দেওয়া হয়েছে! পর্যালোচনার পরে অনুমোদিত হবে।');
      router.push('/biodata');
    } catch (error) {
      toast.error(error.response?.data?.message || 'বায়োডেটা জমা ব্যর্থ হয়েছে।');
    } finally {
      setLoading(false);
    }
  };

  const InputField = memo(({ label, section, field, type = 'text', placeholder = '', required = false, ...props }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <input
        key={`${section}-${field}`}
        type={type}
        defaultValue={formData[section][field] || ''}
        onBlur={(e) => update(section, field, type === 'number' ? Number(e.target.value) : e.target.value)}
        placeholder={placeholder}
        className="input-field"
        tabIndex={0}
        {...props}
      />
    </div>
  ));

  const SelectField = memo(({ label, section, field, options, required = false }) => (
    <div>
      <label className="label">{label}{required && <span className="text-red-500 ml-1">*</span>}</label>
      <select key={`${section}-${field}`} defaultValue={formData[section][field] || ''} onChange={(e) => update(section, field, e.target.value)} className="input-field" tabIndex={0}>
        <option value="">বেছে নিন</option>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  ));

  const CheckField = memo(({ label, section, field }) => (
    <label className="flex items-center gap-3 cursor-pointer p-3 rounded-xl border border-gray-100 hover:bg-gray-50 transition-colors">
      <input
        key={`${section}-${field}`}
        type="checkbox"
        checked={formData[section][field] || false}
        onChange={(e) => update(section, field, e.target.checked)}
        className="w-4 h-4 accent-[#1a5276]"
      />
      <span className="text-sm text-gray-700">{label}</span>
    </label>
  ));

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <InputField label="পূর্ণ নাম" section="personal" field="fullName" placeholder="আপনার পূর্ণ নাম" required />
            <InputField label="পিতার নাম" section="personal" field="fatherName" placeholder="পিতার নাম" />
            <InputField label="মাতার নাম" section="personal" field="motherName" placeholder="মাতার নাম" />
            <InputField label="জন্ম তারিখ" section="personal" field="dateOfBirth" type="date" required />
            <InputField label="জন্মস্থান" section="personal" field="birthPlace" placeholder="জেলা/উপজেলা" />
            <SelectField label="বৈবাহিক অবস্থা" section="personal" field="maritalStatus" required options={[
              { value: 'single', label: 'অবিবাহিত' },
              { value: 'divorced', label: 'তালাকপ্রাপ্ত' },
              { value: 'widowed', label: 'বিধবা/বিপত্নীক' },
              ...(isMale ? [
                { value: 'masna', label: '২য় বিয়ে (মাসনা)' },
                { value: 'rubaa', label: '৩য় বিয়ে (রুবাআ)' },
                { value: 'sulasa', label: '৪র্থ বিয়ে (সুলাসা)' },
              ] : []),
            ]} />
            <InputField label="উচ্চতা (সেমি)" section="personal" field="height" type="number" placeholder="যেমন: 165" />
            <InputField label="ওজন (কেজি)" section="personal" field="weight" type="number" placeholder="যেমন: 55" />
            <SelectField label="গায়ের রঙ" section="personal" field="complexion" options={[
              { value: 'very_fair', label: 'অত্যন্ত ফর্সা' }, { value: 'fair', label: 'ফর্সা' },
              { value: 'wheatish', label: 'শ্যামলা' }, { value: 'brown', label: 'বাদামী' }, { value: 'dark', label: 'কালো' },
            ]} />
            <SelectField label="রক্তের গ্রুপ" section="personal" field="bloodGroup" options={bloodGroups.map((b) => ({ value: b, label: b }))} />
            <div className="md:col-span-2">
              <InputField label="শারীরিক প্রতিবন্ধিতা (যদি থাকে)" section="personal" field="physicalDisability" placeholder="না থাকলে 'None' লিখুন" />
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <SelectField label="মাযহাব" section="religion" field="madhab" options={[
              { value: 'hanafi', label: 'হানাফি' }, { value: 'maliki', label: 'মালিকি' },
              { value: 'shafi', label: 'শাফেয়ি' }, { value: 'hanbali', label: 'হাম্বলি' }, { value: 'other', label: 'অন্যান্য' },
            ]} />
            <SelectField label="কুরআন তিলাওয়াত" section="religion" field="quranRecitation" options={[
              { value: 'complete', label: 'সম্পূর্ণ পারেন' }, { value: 'partial', label: 'আংশিক পারেন' },
              { value: 'learning', label: 'শিখছেন' }, { value: 'none', label: 'পারেন না' },
            ]} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
              <CheckField label="৫ ওয়াক্ত নামায পড়েন" section="religion" field="praysFiveTimes" />
              <CheckField label="হারাম বর্জন করেন" section="religion" field="avoidsHaram" />
              <CheckField label="পর্দা পালন করেন" section="religion" field="wearsPardah" />
              <CheckField label="দাড়ি আছে" section="religion" field="hasBeard" />
              <CheckField label="সুন্নাহ পোশাক পরেন" section="religion" field="followsSunnahDress" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SelectField label="সর্বোচ্চ শিক্ষাগত যোগ্যতা" section="education" field="highestLevel" required options={Object.entries(educationLabels.bn).map(([v, l]) => ({ value: v, label: l }))} />
            <InputField label="ডিগ্রির নাম" section="education" field="degreeName" placeholder="যেমন: B.Sc in CSE" />
            <InputField label="শিক্ষা প্রতিষ্ঠান" section="education" field="institution" placeholder="বিশ্ববিদ্যালয়/কলেজের নাম" />
            <InputField label="বিষয়" section="education" field="subject" placeholder="যেমন: Computer Science" />
            <InputField label="পাসের বছর" section="education" field="passingYear" type="number" placeholder="যেমন: 2020" />
            <SelectField label="পেশা" section="profession" field="occupationType" options={Object.entries(professionLabels.bn).map(([v, l]) => ({ value: v, label: l }))} />
            <InputField label="পদবি" section="profession" field="designation" placeholder="যেমন: Software Engineer" />
            <InputField label="প্রতিষ্ঠান" section="profession" field="organization" placeholder="কোম্পানির নাম" />
            <SelectField label="মাসিক আয়" section="profession" field="monthlyIncome" options={[
              { value: 'no_income', label: 'কোনো আয় নেই' },
              { value: 'below_10k', label: '১০,০০০ টাকার কম' },
              { value: '10k_25k', label: '১০,০০০ - ২৫,০০০ টাকা' },
              { value: '25k_50k', label: '২৫,০০০ - ৫০,০০০ টাকা' },
              { value: '50k_100k', label: '৫০,০০০ - ১,০০,০০০ টাকা' },
              { value: 'above_100k', label: '১,০০,০০০ টাকার বেশি' },
            ]} />
          </div>
        );
      case 4:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="label">পিতা কি জীবিত?</label>
              <div className="flex gap-3">
                {['জীবিত', 'মৃত'].map((opt, idx) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="fatherAlive" checked={formData.family.fatherAlive === (idx === 0)} onChange={() => update('family', 'fatherAlive', idx === 0)} className="accent-[#1a5276]" tabIndex={0} />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <InputField label="পিতার পেশা" section="family" field="fatherOccupation" placeholder="পেশা" />
            <div>
              <label className="label">মাতা কি জীবিত?</label>
              <div className="flex gap-3">
                {['জীবিত', 'মৃত'].map((opt, idx) => (
                  <label key={opt} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" name="motherAlive" checked={formData.family.motherAlive === (idx === 0)} onChange={() => update('family', 'motherAlive', idx === 0)} className="accent-[#1a5276]" tabIndex={0} />
                    <span className="text-sm">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
            <InputField label="মাতার পেশা" section="family" field="motherOccupation" placeholder="পেশা" />
            <InputField label="ভাইয়ের সংখ্যা" section="family" field="numberOfBrothers" type="number" />
            <InputField label="বোনের সংখ্যা" section="family" field="numberOfSisters" type="number" />
            <SelectField label="পরিবারের ধরন" section="family" field="familyType" options={[{ value: 'nuclear', label: 'একক পরিবার' }, { value: 'joint', label: 'যৌথ পরিবার' }]} />
            <SelectField label="পারিবারিক আর্থিক অবস্থা" section="family" field="familyStatus" options={[
              { value: 'lower', label: 'নিম্নবিত্ত' }, { value: 'lower_middle', label: 'নিম্ন-মধ্যবিত্ত' },
              { value: 'middle', label: 'মধ্যবিত্ত' }, { value: 'upper_middle', label: 'উচ্চ-মধ্যবিত্ত' }, { value: 'upper', label: 'উচ্চবিত্ত' },
            ]} />
            <SelectField label="পরিবারের ধর্মপরায়ণতা" section="family" field="familyReligiousness" options={[
              { value: 'moderate', label: 'মধ্যম' }, { value: 'religious', label: 'ধার্মিক' }, { value: 'very_religious', label: 'অত্যন্ত ধার্মিক' },
            ]} />
          </div>
        );
      case 5:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <SelectField label="স্থায়ী বিভাগ" section="address" field="permanentDivision" options={divisions.map((d) => ({ value: d, label: d }))} />
            <InputField label="স্থায়ী জেলা" section="address" field="permanentDistrict" placeholder="জেলার নাম" />
            <InputField label="স্থায়ী উপজেলা/থানা" section="address" field="permanentUpazila" placeholder="উপজেলার নাম" />
            <SelectField label="বর্তমান বিভাগ" section="address" field="currentDivision" options={divisions.map((d) => ({ value: d, label: d }))} />
            <InputField label="বর্তমান জেলা" section="address" field="currentDistrict" placeholder="জেলার নাম" />
            <InputField label="বর্তমান উপজেলা/থানা" section="address" field="currentUpazila" placeholder="উপজেলার নাম" />
            <SelectField label="কোথায় বড় হয়েছেন?" section="address" field="grewUpIn" options={[
              { value: 'village', label: 'গ্রামে' }, { value: 'town', label: 'শহরে' }, { value: 'city', label: 'মহানগরে' },
            ]} />
          </div>
        );
      case 6:
        return (
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-gray-700 mb-4 text-sm">যোগাযোগের তথ্য (গোপন থাকবে)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <InputField label="মোবাইল নম্বর" section="contact" field="phone" placeholder="01XXXXXXXXX" />
                <InputField label="বিকল্প মোবাইল" section="contact" field="alternatePhone" placeholder="01XXXXXXXXX" />
                <InputField label="ইমেইল" section="contact" field="email" type="email" placeholder="example@gmail.com" />
                <InputField label="অভিভাবকের নাম" section="contact" field="guardianName" placeholder="অভিভাবকের নাম" />
                <InputField label="অভিভাবকের মোবাইল" section="contact" field="guardianPhone" placeholder="01XXXXXXXXX" />
                <InputField label="সম্পর্ক" section="contact" field="guardianRelation" placeholder="যেমন: পিতা, ভাই" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-4 text-sm">নিজের সম্পর্কে</h3>
              <div>
                <label className="label">নিজের সম্পর্কে লিখুন</label>
                <textarea
                  key="lifestyle-aboutSelf"
                  defaultValue={formData.lifestyle.aboutSelf}
                  onBlur={(e) => update('lifestyle', 'aboutSelf', e.target.value)}
                  placeholder="নিজের সম্পর্কে কিছু লিখুন..."
                  className="input-field h-28 resize-none"
                  maxLength={1000}
                  tabIndex={0}
                />
                <p className="text-xs text-gray-400 mt-1 text-right">{formData.lifestyle.aboutSelf.length}/1000</p>
              </div>
            </div>
            <div>
              <h3 className="font-semibold text-gray-700 mb-4 text-sm">প্রত্যাশিত জীবনসঙ্গী</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="label">বয়স সীমা</label>
                  <div className="flex gap-2">
                    <input key="partnerExpectations-ageMin" type="number" placeholder="থেকে" defaultValue={formData.partnerExpectations.ageMin} onBlur={(e) => setFormData((p) => ({ ...p, partnerExpectations: { ...p.partnerExpectations, ageMin: e.target.value } }))} className="input-field" min={18} tabIndex={0} />
                    <input key="partnerExpectations-ageMax" type="number" placeholder="পর্যন্ত" defaultValue={formData.partnerExpectations.ageMax} onBlur={(e) => setFormData((p) => ({ ...p, partnerExpectations: { ...p.partnerExpectations, ageMax: e.target.value } }))} className="input-field" max={60} tabIndex={0} />
                  </div>
                </div>
                <div>
                  <label className="label">অন্যান্য প্রত্যাশা</label>
                  <textarea
                    key="partnerExpectations-otherExpectations"
                    defaultValue={formData.partnerExpectations.otherExpectations}
                    onBlur={(e) => setFormData((p) => ({ ...p, partnerExpectations: { ...p.partnerExpectations, otherExpectations: e.target.value } }))}
                    placeholder="আপনার পছন্দের বিষয় লিখুন..."
                    className="input-field h-24 resize-none"
                    maxLength={500}
                    tabIndex={0}
                  />
                </div>
              </div>
            </div>
          </div>
        );
      default: return null;
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-800">বায়োডেটা তৈরি করুন</h1>
          <p className="text-gray-500 text-sm mt-1">ধাপে ধাপে আপনার সম্পূর্ণ বায়োডেটা পূরণ করুন</p>
        </div>

        <StepIndicator steps={steps} currentStep={currentStep} />

        <div className="card">
          <h2 className="text-lg font-bold text-[#1a5276] mb-5 pb-3 border-b border-gray-100">
            ধাপ {currentStep}: {steps[currentStep - 1].title}
          </h2>
          {renderStep()}

          <div className="flex justify-between mt-8 pt-5 border-t border-gray-100">
            <button
              onClick={() => setCurrentStep((s) => s - 1)}
              disabled={currentStep === 1}
              className="flex items-center gap-2 btn-outline px-5 py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <FaArrowLeft size={13} /> পেছনে
            </button>

            {currentStep < steps.length ? (
              <button
                onClick={() => setCurrentStep((s) => s + 1)}
                className="flex items-center gap-2 btn-primary px-5 py-2.5 rounded-xl"
              >
                পরবর্তী <FaArrowRight size={13} />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center gap-2 btn-secondary px-6 py-2.5 rounded-xl"
              >
                {loading ? <><FaSpinner className="animate-spin" /> জমা হচ্ছে...</> : <><FaCheckCircle /> বায়োডেটা জমা দিন</>}
              </button>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
