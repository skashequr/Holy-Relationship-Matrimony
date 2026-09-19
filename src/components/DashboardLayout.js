'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Dialog } from '@headlessui/react';
import { useAuth } from '@/contexts/AuthContext';
import { PageLoader } from './LoadingSpinner';
import { FaCamera, FaHome, FaSearch, FaHeart, FaRegHeart, FaCreditCard, FaBell, FaCog, FaFileAlt, FaComment, FaCrown, FaStar, FaRing, FaBars, FaTimes, FaMoon, FaGift, FaSignOutAlt, FaArrowRight } from 'react-icons/fa';
import styles from './DashboardLayout.module.css';

const groups = [
  { label: 'আপনার পরিসর', links: [
    ['/dashboard', 'ওভারভিউ', FaHome], ['/biodata', 'আমার বায়োডেটা', FaFileAlt],
    ['/search', 'বায়োডেটা খুঁজুন', FaSearch], ['/matches', 'পছন্দের ম্যাচ', FaHeart],
    ['/shortlist', 'শর্টলিস্ট', FaRegHeart],
    ['/biodata#download', 'Download Biodata', FaFileAlt], ['/face-verify', 'Face Verification', FaCamera],
  ] },
  { label: 'যোগাযোগ ও কার্যক্রম', links: [
    ['/dashboard/interests', 'ইন্টারেস্ট', FaRing], ['/dashboard/messages', 'বার্তা', FaComment],
    ['/notifications', 'বিজ্ঞপ্তি', FaBell], ['/payments', 'পেমেন্ট ইতিহাস', FaCreditCard],
  ] },
  { label: 'আরও সুবিধা', links: [
    ['/counseling', 'কাউন্সেলিং বুকিং', FaComment],
    ['/dashboard/premium', 'প্রিমিয়াম', FaCrown], ['/ruqyah', 'রুকইয়াহ', FaMoon],
    ['/referral', 'রেফারেল', FaGift], ['/dashboard/review', 'রিভিউ দিন', FaStar], ['/settings', 'সেটিংস', FaCog],
  ] },
];

export default function DashboardLayout({ children }) {
  const { user, loading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  useEffect(() => {
    if (!loading && !isAuthenticated) router.replace(`/login?redirect=${encodeURIComponent(pathname)}`);
  }, [loading, isAuthenticated, pathname, router]);
  useEffect(() => { setMenuOpen(false); }, [pathname]);
  if (loading) return <PageLoader />;
  if (!isAuthenticated) return null;

  const navigation = <>
    <div className={styles.member}><span className={styles.avatar}>{user?.name?.trim()?.charAt(0) || 'H'}</span><div><strong>{user?.name}</strong><small>{user?.verificationBadge ? 'যাচাইকৃত সদস্য' : 'আপনার ব্যক্তিগত অ্যাকাউন্ট'}</small></div></div>
    <nav aria-label="ড্যাশবোর্ড নেভিগেশন">{groups.map(group => <div key={group.label} className={styles.navGroup}><p>{group.label}</p>{group.links.map(([href, label, Icon]) => <Link key={href} href={href} onClick={() => setMenuOpen(false)} aria-current={pathname === href ? 'page' : undefined} className={`${styles.navLink} ${pathname === href ? styles.active : ''}`}><Icon />{label}{pathname === href && <span className={styles.activeDot} />}</Link>)}</div>)}</nav>
    <div className={styles.sidebarHelp}><p>আমরা আছি আপনার পাশে</p><Link href="/contact">সহায়তা নিন <FaArrowRight /></Link></div>
    <button className={styles.logout} onClick={logout}><FaSignOutAlt /> লগআউট</button>
  </>;

  return <div className={styles.shell}>
    <a className={styles.skip} href="#dashboard-content">মূল কনটেন্টে যান</a>
    <header className={styles.header}>
      <Link href="/" className={styles.brand}><Image src="/hmm-logo.png" alt="HMM" width={43} height={43} /><span>Holy Relationship<small>MARRIAGE MATRIMONY</small></span></Link>
      <div className={styles.headerRight}><Link href="/search" className={styles.headerSearch}><FaSearch /><span>জীবনসঙ্গীর খোঁজে</span></Link><Link href="/notifications" aria-label="বিজ্ঞপ্তি" className={styles.headerIcon}><FaBell /></Link><Link href="/profile" aria-label="আমার প্রোফাইল" className={styles.headerAvatar}>{user?.name?.trim()?.charAt(0) || 'H'}</Link><button aria-label="ড্যাশবোর্ড মেনু খুলুন" aria-expanded={menuOpen} className={styles.menuButton} onClick={() => setMenuOpen(true)}><FaBars /></button></div>
    </header>
    <div className={styles.layout}><aside className={styles.sidebar}>{navigation}</aside><div className={styles.mainWrap}><main id="dashboard-content" className={styles.main}>{children}</main><footer className={styles.footer}><span>© {new Date().getFullYear()} Holy Relationship</span><Link href="/privacy-policy">গোপনীয়তা নীতি</Link><Link href="/contact">সহায়তা</Link></footer></div></div>
    <Dialog open={menuOpen} onClose={setMenuOpen} className={styles.dialog}><div className={styles.backdrop} aria-hidden="true" /><Dialog.Panel className={styles.drawer}><div className={styles.drawerHeader}><Dialog.Title>আপনার ড্যাশবোর্ড</Dialog.Title><button aria-label="মেনু বন্ধ করুন" onClick={() => setMenuOpen(false)}><FaTimes /></button></div>{navigation}</Dialog.Panel></Dialog>
  </div>;
}
