'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from './LoadingSpinner';
import {
  FaChartBar, FaUsers, FaFileAlt, FaCreditCard,
  FaFlag, FaCog, FaSignOutAlt, FaHome, FaBell, FaCrown, FaHeart, FaStar, FaMoon, FaGift
} from 'react-icons/fa';

const adminLinks = [
  { href: '/admin', label: 'ড্যাশবোর্ড', icon: <FaChartBar size={15} /> },
  { href: '/admin/users', label: 'ব্যবহারকারী', icon: <FaUsers size={15} /> },
  { href: '/admin/biodatas', label: 'বায়োডেটা', icon: <FaFileAlt size={15} /> },
  { href: '/admin/payments', label: 'পেমেন্ট', icon: <FaCreditCard size={15} /> },
  { href: '/admin/premium', label: 'প্রিমিয়াম', icon: <FaCrown size={15} /> },
  { href: '/admin/married', label: 'বিবাহিত', icon: <FaHeart size={15} /> },
  { href: '/admin/reviews', label: 'রিভিউ', icon: <FaStar size={15} /> },
  { href: '/admin/notifications', label: 'নোটিফিকেশন', icon: <FaBell size={15} /> },
  { href: '/admin/ruqyah', label: 'রুকাইয়া', icon: <FaMoon size={15} /> },
  { href: '/admin/referrals', label: 'রেফারেল', icon: <FaGift size={15} /> },
  { href: '/admin/reports', label: 'অভিযোগ', icon: <FaFlag size={15} /> },
  { href: '/admin/settings', label: 'সেটিংস', icon: <FaCog size={15} /> },
];

export default function AdminLayout({ children }) {
  const { user, loading, isAuthenticated, isAdmin, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) router.push('/login');
      else if (!isAdmin) router.push('/dashboard');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading) return <PageLoader />;
  if (!isAuthenticated || !isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-60 bg-[#0c3a5e] flex-shrink-0 flex flex-col min-h-screen sticky top-0 h-screen">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#c9a84c] rounded-xl flex items-center justify-center text-white font-bold">☪</div>
            <div>
              <p className="text-white text-xs font-bold leading-tight">Holy Matrimony</p>
              <p className="text-white/50 text-xs">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          {adminLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                pathname === link.href
                  ? 'bg-[#1a5276] text-white shadow-sm'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {link.icon} {link.label}
            </Link>
          ))}
        </nav>

        {/* User info & logout */}
        <div className="px-3 py-4 border-t border-white/10 space-y-2">
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 bg-[#1a5276] rounded-full flex items-center justify-center text-white text-xs font-bold">
              {user?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-white text-xs font-medium truncate">{user?.name}</p>
              <p className="text-white/40 text-xs truncate">Admin</p>
            </div>
          </div>
          <Link href="/dashboard" className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white text-xs rounded-lg hover:bg-white/5 transition-all">
            <FaHome size={13} /> ড্যাশবোর্ড
          </Link>
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 text-red-400 hover:text-red-300 text-xs rounded-lg hover:bg-white/5 transition-all"
          >
            <FaSignOutAlt size={13} /> লগআউট
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-6 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
