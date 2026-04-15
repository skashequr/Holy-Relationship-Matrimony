'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Navbar from './Navbar';
import Footer from './Footer';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from './LoadingSpinner';
import {
  FaHome, FaUser, FaSearch, FaHeart, FaList,
  FaCreditCard, FaBell, FaCog, FaFileAlt, FaComment, FaCrown, FaStar, FaRing
} from 'react-icons/fa';

const sidebarLinks = [
  { href: '/dashboard', label: 'ড্যাশবোর্ড', icon: <FaHome size={15} /> },
  { href: '/biodata', label: 'আমার বায়োডেটা', icon: <FaFileAlt size={15} /> },
  { href: '/search', label: 'প্রোফাইল খুঁজুন', icon: <FaSearch size={15} /> },
  { href: '/matches', label: 'পছন্দের ম্যাচ', icon: <FaHeart size={15} /> },
  { href: '/shortlist', label: 'শর্টলিস্ট', icon: <FaList size={15} /> },
  { href: '/dashboard/interests', label: 'Interest', icon: <FaRing size={15} /> },
  { href: '/dashboard/messages', label: 'বার্তা', icon: <FaComment size={15} /> },
  { href: '/dashboard/premium', label: 'প্রিমিয়াম', icon: <FaCrown size={15} /> },
  { href: '/payments', label: 'পেমেন্ট ইতিহাস', icon: <FaCreditCard size={15} /> },
  { href: '/dashboard/review', label: 'রিভিউ দিন', icon: <FaStar size={15} /> },
  { href: '/notifications', label: 'বিজ্ঞপ্তি', icon: <FaBell size={15} /> },
  { href: '/settings', label: 'সেটিংস', icon: <FaCog size={15} /> },
];

export default function DashboardLayout({ children }) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  if (loading) return <PageLoader />;
  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex gap-6">
          {/* Sidebar */}
          <aside className="hidden lg:block w-56 flex-shrink-0">
            <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-3 sticky top-24">
              {/* User info */}
              <div className="px-3 py-2 mb-2">
                <p className="font-semibold text-gray-800 text-sm truncate">{user?.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {user?.gender === 'male' ? '👨 পুরুষ' : '👩 মহিলা'}
                  {user?.verificationBadge && <span className="ml-2 text-green-500">✓ যাচাইকৃত</span>}
                </p>
              </div>
              <hr className="border-gray-100 mb-2" />

              <nav className="space-y-0.5">
                {sidebarLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`sidebar-link text-sm ${pathname === link.href ? 'active' : ''}`}
                  >
                    {link.icon}
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Biodata status */}
              {user?.biodataId && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-400 px-3 mb-1">বায়োডেটা স্ট্যাটাস</p>
                  <div className="px-3">
                    <span className={`badge-${user.biodataId?.status === 'approved' ? 'verified' : user.biodataId?.status === 'rejected' ? 'rejected' : 'pending'} text-xs`}>
                      {user.biodataId?.status === 'approved' ? '✓ অনুমোদিত' : user.biodataId?.status === 'rejected' ? '✗ প্রত্যাখ্যাত' : '⏳ পর্যালোচনাধীন'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* Main content */}
          <main className="flex-1 min-w-0 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
      <Footer />
    </div>
  );
}
