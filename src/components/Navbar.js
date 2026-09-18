'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { userAPI } from '@/lib/api';
import {
  FaBars, FaTimes, FaBell, FaUser, FaSignOutAlt, FaCog,
  FaSearch, FaHeart, FaList, FaHome, FaUserCircle
} from 'react-icons/fa';

export default function Navbar({ variant }) {
  const { user, logout, isAuthenticated } = useAuth();
  const { t, toggleLanguage, language } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const profileRef = useRef(null);
  const notifRef = useRef(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  const fetchNotifications = async () => {
    try {
      const { data } = await userAPI.getNotifications({ limit: 5 });
      setNotifications(data.notifications || []);
      setUnreadCount(data.unreadCount || 0);
    } catch {}
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = [
    { href: '/dashboard', label: t('dashboard'), icon: <FaHome /> },
    { href: '/search', label: t('search'), icon: <FaSearch /> },
    { href: '/matches', label: t('matches'), icon: <FaHeart /> },
    { href: '/shortlist', label: t('shortlist'), icon: <FaList /> },
  ];

  return (
    <nav aria-label="প্রধান নেভিগেশন" className={`${variant === 'home' ? 'bg-[#2b221b] border-b border-[#635039] home-navbar' : 'bg-[#1a5276] shadow-lg'} sticky top-0 z-50`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-2">
          {/* Logo */}
          <Link href={isAuthenticated ? '/dashboard' : '/'} aria-label="Holy Relationship — হোম" className="flex items-center gap-3">
            <Image src="/hmm-logo.png" alt="HMM" width={48} height={48} className="shrink-0 rounded-full" />
            <div className="hidden sm:block">
              <p className="text-white font-bold text-sm leading-tight">Holy Relationship</p>
              <p className="text-[#c9a84c] text-xs">Marriage Matrimony</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          {isAuthenticated ? (
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all duration-200"
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
            </div>
          ) : (
            <div className="hidden md:flex items-center gap-1">
              <Link
                href="/search"
                className="flex items-center gap-2 px-4 py-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg text-sm font-medium transition-all duration-200"
              >
                <FaSearch />
                বায়োডাটা খুঁজুন
              </Link>
            </div>
          )}

          {variant === 'home' && !isAuthenticated && <div className="hidden lg:flex items-center gap-6 text-sm text-[#e0d3be]"><Link href="/#why-us" className="hover:text-white">আমাদের বিশেষত্ব</Link><Link href="/#how-it-works" className="hover:text-white">যেভাবে কাজ করে</Link><Link href="/contact" className="hover:text-white">যোগাযোগ</Link></div>}

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="text-white/80 hover:text-white text-xs font-semibold border border-white/30 hover:border-white/60 px-2.5 py-1.5 rounded-lg transition-all"
            >
              {language === 'bn' ? 'EN' : 'বাং'}
            </button>

            {isAuthenticated ? (
              <>
                {/* Notifications */}
                <div ref={notifRef} className="relative">
                  <button
                    onClick={() => { setNotifOpen(!notifOpen); setProfileOpen(false); }}
                    className="relative p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    <FaBell size={18} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                        {unreadCount > 9 ? '9+' : unreadCount}
                      </span>
                    )}
                  </button>

                  {notifOpen && (
                    <div className="absolute right-0 mt-2 w-80 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
                      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b">
                        <h3 className="font-semibold text-gray-800 text-sm">বিজ্ঞপ্তি</h3>
                        <Link href="/notifications" className="text-[#1a5276] text-xs hover:underline">
                          সব দেখুন
                        </Link>
                      </div>
                      {notifications.length === 0 ? (
                        <p className="text-gray-500 text-sm text-center py-6">কোনো বিজ্ঞপ্তি নেই</p>
                      ) : (
                        notifications.map((n) => (
                          <div key={n._id} className={`px-4 py-3 border-b border-gray-50 hover:bg-gray-50 transition-colors ${!n.isRead ? 'bg-blue-50/50' : ''}`}>
                            <p className="text-sm font-medium text-gray-800">{n.titleBn || n.title}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{n.messageBn || n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Profile dropdown */}
                <div ref={profileRef} className="relative">
                  <button
                    onClick={() => { setProfileOpen(!profileOpen); setNotifOpen(false); }}
                    className="flex items-center gap-2 px-3 py-1.5 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all"
                  >
                    {user?.profilePicture ? (
                      <Image src={user.profilePicture} alt={user.name} width={32} height={32} className="rounded-full object-cover border-2 border-white/50" />
                    ) : (
                      <FaUserCircle size={24} className="text-white/70" />
                    )}
                    <span className="hidden sm:block text-sm font-medium max-w-[100px] truncate">{user?.name}</span>
                  </button>

                  {profileOpen && (
                    <div className="absolute right-0 mt-2 w-52 max-w-[calc(100vw-1rem)] bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-[60]">
                      <div className="px-4 py-3 bg-gray-50 border-b">
                        <p className="font-semibold text-gray-800 text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <FaUser size={14} className="text-[#1a5276]" /> প্রোফাইল
                        </Link>
                        <Link href="/biodata" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <FaList size={14} className="text-[#1a5276]" /> আমার বায়োডেটা
                        </Link>
                        <Link href="/settings" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors">
                          <FaCog size={14} className="text-[#1a5276]" /> সেটিংস
                        </Link>
                        {user?.role === 'admin' && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-[#1a5276] font-medium hover:bg-blue-50 transition-colors">
                            অ্যাডমিন প্যানেল
                          </Link>
                        )}
                        <hr className="my-1 border-gray-100" />
                        <button
                          onClick={logout}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors w-full text-left"
                        >
                          <FaSignOutAlt size={14} /> লগআউট
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-white/90 hover:text-white text-sm font-medium px-2 sm:px-4 py-2 rounded-lg hover:bg-white/10 transition-all">
                  লগইন
                </Link>
                <Link href="/register" className="bg-[#c9a84c] hover:bg-[#b8943b] text-white text-sm font-bold px-3 sm:px-5 py-2 rounded-lg transition-all shadow-md">
                  নিবন্ধন
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              aria-label={menuOpen ? 'মেনু বন্ধ করুন' : 'মেনু খুলুন'}
              aria-expanded={menuOpen}
              aria-controls="mobile-navigation"
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg"
            >
              {menuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div id="mobile-navigation" className="md:hidden py-3 border-t border-white/10 animate-fade-in">
            {(isAuthenticated ? navLinks : [{ href: '/search', label: 'বায়োডাটা খুঁজুন', icon: <FaSearch /> }, { href: '/#why-us', label: 'আমাদের বিশেষত্ব', icon: <FaHeart /> }, { href: '/#how-it-works', label: 'যেভাবে কাজ করে', icon: <FaList /> }, { href: '/contact', label: 'যোগাযোগ', icon: <FaUser /> }]).map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-all text-sm font-medium"
              >
                {link.icon} {link.label}
              </Link>
            ))}
          </div>
        )}
      </div>
    </nav>
  );
}
