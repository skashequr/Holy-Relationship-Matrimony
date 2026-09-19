'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import styles from './DashboardLayout.module.css';
import theme from './AdminLayout.module.css';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from './LoadingSpinner';
import {
  FaChartBar, FaUsers, FaFileAlt, FaCreditCard,
  FaBars, FaTimes, FaFlag, FaCog, FaSignOutAlt, FaHome, FaBell, FaCrown, FaHeart, FaStar, FaMoon, FaGift
} from 'react-icons/fa';

const adminLinks = [
  { href: '/admin/counseling', label: 'কাউন্সেলিং বুকিং', icon: <FaHeart size={15} /> },
  { href: '/admin/face-verification', label: 'ফেস যাচাই', icon: <FaUsers size={15} /> },
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
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated) router.push('/login');
      else if (!isAdmin) router.push('/dashboard');
    }
  }, [loading, isAuthenticated, isAdmin, router]);

  if (loading) return <PageLoader />;
  if (!isAuthenticated || !isAdmin) return null;

  const navigation = <>
    <div className={styles.member}><span className={styles.avatar}>{user?.name?.[0]}</span><div><strong>{user?.name}</strong><small>অ্যাডমিন অ্যাকাউন্ট</small></div></div>
    <nav aria-label="অ্যাডমিন নেভিগেশন" className={styles.navGroup}>{adminLinks.map(link => <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)} aria-current={pathname === link.href ? 'page' : undefined} className={`${styles.navLink} ${pathname === link.href ? styles.active : ''}`}>{link.icon}{link.label}</Link>)}</nav>
    <Link href="/dashboard" className={styles.navLink}><FaHome /> সদস্যের ড্যাশবোর্ড</Link>
    <button onClick={logout} className={styles.logout}><FaSignOutAlt /> লগআউট</button>
  </>;
  return <div className={`${styles.shell} ${theme.admin}`}>
    <a className={styles.skip} href="#admin-content">মূল কনটেন্টে যান</a>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><Image src="/hmm-logo.png" alt="HMM" width={43} height={43} /><span>Holy Relationship<small>ADMINISTRATION</small></span></Link>
      <div className={styles.headerRight}><Link href="/" className={styles.headerSearch}><FaHome /><span>হোমপেইজ</span></Link><span className={styles.headerAvatar}>{user?.name?.[0]}</span><button aria-label="অ্যাডমিন মেনু খুলুন" aria-expanded={menuOpen} className={styles.menuButton} onClick={() => setMenuOpen(true)}><FaBars /></button></div>
    </header>
    <div className={styles.layout}><aside className={styles.sidebar}>{navigation}</aside><div className={styles.mainWrap}><main id="admin-content" className={styles.main}>{children}</main><footer className={styles.footer}>© {new Date().getFullYear()} Holy Relationship · পরিচালনা প্যানেল</footer></div></div>
    <Dialog open={menuOpen} onClose={setMenuOpen} className={styles.dialog}><div className={styles.backdrop} aria-hidden="true" /><Dialog.Panel className={styles.drawer}><div className={styles.drawerHeader}><Dialog.Title>পরিচালনা প্যানেল</Dialog.Title><button aria-label="মেনু বন্ধ করুন" onClick={() => setMenuOpen(false)}><FaTimes /></button></div>{navigation}</Dialog.Panel></Dialog>
  </div>;
}
