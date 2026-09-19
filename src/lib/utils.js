// Format age display
export const formatAge = (age, lang = 'bn') => {
  if (!age) return '';
  return lang === 'bn' ? `${toBengaliNumber(age)} বছর` : `${age} years`;
};

// Format height in cm to feet/inches
export const formatHeight = (cm, lang = 'bn') => {
  if (!cm) return '';
  const totalInches = Math.round(cm / 2.54);
  const feet = Math.floor(totalInches / 12);
  const inches = totalInches % 12;
  if (lang === 'bn') {
    return `${toBengaliNumber(feet)} ফুট ${toBengaliNumber(inches)} ইঞ্চি (${toBengaliNumber(cm)} সেমি)`;
  }
  return `${feet}'${inches}" (${cm} cm)`;
};

// Convert to Bengali numerals
export const toBengaliNumber = (num) => {
  if (num === null || num === undefined) return '';
  return String(num).replace(/[0-9]/g, (d) => '০১২৩৪৫৬৭৮৯'[d]);
};

// Education level labels
export const educationLabels = {
  en: {
    no_education: 'No Education',
    psc: 'PSC',
    jsc: 'JSC',
    ssc: 'SSC',
    hsc: 'HSC',
    honours: "Bachelor's/Honours",
    masters: "Master's",
    phd: 'PhD',
    madrasa_dakhil: 'Madrasa Dakhil',
    madrasa_alim: 'Madrasa Alim',
    madrasa_fazil: 'Madrasa Fazil',
    madrasa_kamil: 'Madrasa Kamil',
    qawmi: 'Qawmi Madrasa',
    english_medium: 'English Medium',
    vocational: 'Vocational',
    others: 'Others',
  },
  bn: {
    no_education: 'কোনো শিক্ষা নেই',
    psc: 'পিএসসি',
    jsc: 'জেএসসি',
    ssc: 'এসএসসি',
    hsc: 'এইচএসসি',
    honours: 'অনার্স/স্নাতক',
    masters: 'মাস্টার্স/স্নাতকোত্তর',
    phd: 'পিএইচডি',
    madrasa_dakhil: 'মাদরাসা দাখিল',
    madrasa_alim: 'মাদরাসা আলিম',
    madrasa_fazil: 'মাদরাসা ফাজিল',
    madrasa_kamil: 'মাদরাসা কামিল',
    qawmi: 'কওমি মাদরাসা',
    english_medium: 'ইংরেজি মিডিয়াম',
    vocational: 'ভোকেশনাল',
    others: 'অন্যান্য',
  },
};

// Profession labels
export const professionLabels = {
  en: {
    student: 'Student',
    service_holder: 'Service Holder',
    business: 'Business',
    doctor: 'Doctor',
    engineer: 'Engineer',
    teacher: 'Teacher',
    lawyer: 'Lawyer',
    farmer: 'Farmer',
    housewife: 'Housewife',
    unemployed: 'Unemployed',
    other: 'Other',
  },
  bn: {
    student: 'ছাত্র/ছাত্রী',
    service_holder: 'চাকরিজীবী',
    business: 'ব্যবসায়ী',
    doctor: 'ডাক্তার',
    engineer: 'ইঞ্জিনিয়ার',
    teacher: 'শিক্ষক',
    lawyer: 'আইনজীবী',
    farmer: 'কৃষক',
    housewife: 'গৃহিণী',
    unemployed: 'বেকার',
    other: 'অন্যান্য',
  },
};

// Marital status labels
export const maritalStatusLabels = {
  en: { single: 'Never Married', divorced: 'Divorced', widowed: 'Widowed', masna: '2nd Marriage (Masna)', rubaa: '3rd Marriage (Rubaa)', sulasa: '4th Marriage (Sulasa)' },
  bn: { single: 'অবিবাহিত', divorced: 'তালাকপ্রাপ্ত', widowed: 'বিধবা/বিপত্নীক', masna: '২য় বিয়ে (মাসনা)', rubaa: '৩য় বিয়ে (রুবাআ)', sulasa: '৪র্থ বিয়ে (সুলাসা)' },
};

// Income labels
export const incomeLabels = {
  en: {
    no_income: 'No Income',
    below_10k: 'Below 10,000 BDT',
    '10k_25k': '10,000 - 25,000 BDT',
    '25k_50k': '25,000 - 50,000 BDT',
    '50k_100k': '50,000 - 1,00,000 BDT',
    above_100k: 'Above 1,00,000 BDT',
  },
  bn: {
    no_income: 'কোনো আয় নেই',
    below_10k: '১০,০০০ টাকার কম',
    '10k_25k': '১০,০০০ - ২৫,০০০ টাকা',
    '25k_50k': '২৫,০০০ - ৫০,০০০ টাকা',
    '50k_100k': '৫০,০০০ - ১,০০,০০০ টাকা',
    above_100k: '১,০০,০০০ টাকার বেশি',
  },
};

// Complexion labels
export const complexionLabels = {
  en: { very_fair: 'Very Fair', fair: 'Fair', wheatish: 'Wheatish', brown: 'Brown', dark: 'Dark' },
  bn: { very_fair: 'অত্যন্ত ফর্সা', fair: 'ফর্সা', wheatish: 'শ্যামলা', brown: 'বাদামী', dark: 'কালো' },
};

// Blood group labels
export const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Format date
export const formatDate = (date, lang = 'bn') => {
  if (!date) return '';
  const d = new Date(date);
  if (lang === 'bn') {
    const months = ['জানুয়ারি', 'ফেব্রুয়ারি', 'মার্চ', 'এপ্রিল', 'মে', 'জুন', 'জুলাই', 'আগস্ট', 'সেপ্টেম্বর', 'অক্টোবর', 'নভেম্বর', 'ডিসেম্বর'];
    return `${toBengaliNumber(d.getDate())} ${months[d.getMonth()]} ${toBengaliNumber(d.getFullYear())}`;
  }
  return d.toLocaleDateString('en-BD', { day: 'numeric', month: 'long', year: 'numeric' });
};

// Format currency
export const formatCurrency = (amount, lang = 'bn') => {
  if (lang === 'bn') return `${toBengaliNumber(amount)} টাকা`;
  return `${amount} BDT`;
};

// Get profile picture or default
export const getProfilePicture = (user, gender) => {
  if (user?.profilePicture) return user.profilePicture;
  return gender === 'male' ? '/images/default-male.png' : '/images/default-female.png';
};

// Truncate text
export const truncate = (text, length = 100) => {
  if (!text) return '';
  return text.length > length ? text.substring(0, length) + '...' : text;
};

// Compatibility score color
export const getScoreColor = (score) => {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-blue-600 bg-blue-50';
  if (score >= 40) return 'text-yellow-600 bg-yellow-50';
  return 'text-red-600 bg-red-50';
};

// Madhab labels
export const madhabLabels = {
  en: { hanafi: 'Hanafi', maliki: 'Maliki', shafi: 'Shafi\'i', hanbali: 'Hanbali', other: 'Other' },
  bn: { hanafi: 'হানাফি', maliki: 'মালিকি', shafi: 'শাফেয়ি', hanbali: 'হাম্বলি', other: 'অন্যান্য' },
};

// Family status labels
export const familyStatusLabels = {
  en: { lower: 'Lower', lower_middle: 'Lower Middle', middle: 'Middle', upper_middle: 'Upper Middle', upper: 'Upper' },
  bn: { lower: 'নিম্নবিত্ত', lower_middle: 'নিম্ন-মধ্যবিত্ত', middle: 'মধ্যবিত্ত', upper_middle: 'উচ্চ-মধ্যবিত্ত', upper: 'উচ্চবিত্ত' },
};

// Validate Bangladeshi phone
export const isValidBDPhone = (phone) => {
  return /^(\+880|880|0)?1[3-9]\d{8}$/.test(phone);
};
