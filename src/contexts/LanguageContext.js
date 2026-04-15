'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext(null);

const translations = {
  en: {
    appName: 'Holy Relationship Marriage Matrimony',
    tagline: 'Find Your Perfect Halal Match',
    login: 'Login',
    register: 'Register',
    logout: 'Logout',
    dashboard: 'Dashboard',
    biodata: 'Biodata',
    search: 'Search',
    matches: 'Matches',
    shortlist: 'Shortlist',
    payments: 'Payments',
    notifications: 'Notifications',
    profile: 'Profile',
    settings: 'Settings',
    male: 'Male (Groom)',
    female: 'Female (Bride)',
    createBiodata: 'Create Biodata',
    editBiodata: 'Edit Biodata',
    viewProfile: 'View Profile',
    unlockContact: 'Unlock Contact',
    saveProfile: 'Save Profile',
    contactUnlockPrice: '50 BDT',
    approvedBadge: 'Verified',
    pendingStatus: 'Pending Review',
    rejectedStatus: 'Rejected',
    noProfileFound: 'No profiles found',
    loadMore: 'Load More',
    age: 'Age',
    height: 'Height',
    district: 'District',
    education: 'Education',
    profession: 'Profession',
    maritalStatus: 'Marital Status',
    compatibility: 'Compatibility',
  },
  bn: {
    appName: 'হোলি রিলেশনশিপ ম্যারেজ ম্যাট্রিমনি',
    tagline: 'আপনার হালাল জীবনসঙ্গী খুঁজুন',
    login: 'লগইন',
    register: 'নিবন্ধন',
    logout: 'লগআউট',
    dashboard: 'ড্যাশবোর্ড',
    biodata: 'বায়োডেটা',
    search: 'অনুসন্ধান',
    matches: 'ম্যাচ',
    shortlist: 'শর্টলিস্ট',
    payments: 'পেমেন্ট',
    notifications: 'বিজ্ঞপ্তি',
    profile: 'প্রোফাইল',
    settings: 'সেটিংস',
    male: 'পুরুষ (বর)',
    female: 'মহিলা (কনে)',
    createBiodata: 'বায়োডেটা তৈরি করুন',
    editBiodata: 'বায়োডেটা সম্পাদনা করুন',
    viewProfile: 'প্রোফাইল দেখুন',
    unlockContact: 'যোগাযোগ আনলক করুন',
    saveProfile: 'প্রোফাইল সেভ করুন',
    contactUnlockPrice: '৫০ টাকা',
    approvedBadge: 'যাচাইকৃত',
    pendingStatus: 'পর্যালোচনা অপেক্ষায়',
    rejectedStatus: 'প্রত্যাখ্যাত',
    noProfileFound: 'কোনো প্রোফাইল পাওয়া যায়নি',
    loadMore: 'আরো দেখুন',
    age: 'বয়স',
    height: 'উচ্চতা',
    district: 'জেলা',
    education: 'শিক্ষা',
    profession: 'পেশা',
    maritalStatus: 'বৈবাহিক অবস্থা',
    compatibility: 'সামঞ্জস্য',
  },
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('bn');

  useEffect(() => {
    const saved = localStorage.getItem('language') || 'bn';
    setLanguage(saved);
    document.documentElement.lang = saved;
    if (saved === 'bn') {
      document.body.classList.add('lang-bn');
    }
  }, []);

  const toggleLanguage = () => {
    const newLang = language === 'bn' ? 'en' : 'bn';
    setLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.documentElement.lang = newLang;
    document.body.classList.toggle('lang-bn', newLang === 'bn');
  };

  const t = (key) => translations[language][key] || translations['en'][key] || key;

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, t, isBn: language === 'bn' }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};
