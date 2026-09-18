'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Dialog } from '@headlessui/react';
import DashboardLayout from '@/components/DashboardLayout';
import ProfileCard from '@/components/ProfileCard';
import { useAuth } from '@/contexts/AuthContext';
import { matchAPI, biodataAPI, ruqyahAPI, referralAPI, userAPI } from '@/lib/api';
import { FaArrowRight, FaBell, FaCheckCircle, FaComment, FaCrown, FaEye, FaFileAlt, FaGift, FaHeart, FaLock, FaMoon, FaRegHeart, FaRing, FaSearch, FaShieldAlt, FaSyncAlt, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';
import styles from './dashboard.module.css';

const number = value => typeof value === 'number' ? value.toLocaleString('bn-BD') : '—';
const requests = {
  summary: () => matchAPI.getDashboard(),
  completeness: () => matchAPI.getCompleteness(),
  recommended: () => matchAPI.getRecommended({ limit: 3 }),
  recent: () => matchAPI.getNewProfiles(),
  notifications: () => userAPI.getNotifications({ limit: 4 }),
  referral: () => referralAPI.getMe(),
  bookings: () => ruqyahAPI.getMyBookings(),
};
const statusLabels = { pending: 'পর্যালোচনাধীন', approved: 'অনুমোদিত', rejected: 'সংশোধন প্রয়োজন', draft: 'খসড়া' };

function SectionHeading({ title, subtitle, href, link = 'সব দেখুন' }) {
  return <div className={styles.sectionHeading}><div><h2>{title}</h2>{subtitle && <p>{subtitle}</p>}</div>{href && <Link href={href}>{link} <FaArrowRight /></Link>}</div>;
}
function EmptyState({ icon: Icon = FaSearch, title, text, href, action }) {
  return <div className={styles.empty}><Icon /><h3>{title}</h3><p>{text}</p>{href && <Link href={href}>{action} <FaArrowRight /></Link>}</div>;
}
function LoadingBlock() {
  return <div className={styles.skeleton} role="status" aria-label="তথ্য লোড হচ্ছে"><span /><span /><span /></div>;
}
function Resource({ state, onRetry, children }) {
  if (!state || state.loading) return <LoadingBlock />;
  if (state.error) return <div className={styles.error} role="alert"><p>এই তথ্যগুলো লোড করা যায়নি।</p><button onClick={onRetry}><FaSyncAlt /> আবার চেষ্টা করুন</button></div>;
  return children(state.data);
}

export default function DashboardPage() {
  const { user, loading: authLoading, isAuthenticated, updateUser } = useAuth();
  const router = useRouter();
  const [resources, setResources] = useState({});
  const [reload, setReload] = useState(0);
  const [tab, setTab] = useState('recommended');
  const [ageMin, setAgeMin] = useState('');
  const [ageMax, setAgeMax] = useState('');
  const [ageError, setAgeError] = useState('');
  const [marriedOpen, setMarriedOpen] = useState(false);
  const [marriedVia, setMarriedVia] = useState('');
  const [saving, setSaving] = useState(false);
  const [marriedBiodata, setMarriedBiodata] = useState(null);
  const [today, setToday] = useState('');

  useEffect(() => { setToday(new Intl.DateTimeFormat('bn-BD', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Asia/Dhaka' }).format(new Date())); }, []);
  useEffect(() => {
    if (authLoading || !isAuthenticated) return;
    let cancelled = false;
    setResources({});
    // Each panel settles independently: one failed service cannot blank the dashboard.
    Object.entries(requests).forEach(async ([key, request]) => {
      try {
        const { data } = await request();
        if (!cancelled) setResources(previous => ({ ...previous, [key]: { data } }));
      } catch {
        if (!cancelled) setResources(previous => ({ ...previous, [key]: { error: true } }));
      }
    });
    return () => { cancelled = true; };
  }, [authLoading, isAuthenticated, user?._id, reload]);

  const retry = () => setReload(value => value + 1);
  const summary = resources.summary?.data;
  const completion = resources.completeness?.data;
  const biodata = marriedBiodata || (summary ? summary.biodata : completion ? completion.biodata : typeof user?.biodataId === 'object' ? user.biodataId : null);
  const hasBiodata = Boolean(biodata || user?.biodataId);
  const statusKnown = Boolean(biodata || summary || completion);
  const biodataHref = hasBiodata ? '/biodata/edit' : '/biodata/create';
  const percent = Math.max(0, Math.min(100, completion?.percentage || 0));
  const status = !statusKnown ? 'তথ্য লোড হচ্ছে' : biodata?.isMarried ? 'বিবাহ সম্পন্ন' : !hasBiodata ? 'বায়োডেটা তৈরি হয়নি' : biodata?.isActive === false ? 'বায়োডেটা বন্ধ আছে' : statusLabels[biodata?.status] || 'স্ট্যাটাস পাওয়া যায়নি';
  const visible = biodata?.status === 'approved' && biodata?.isActive !== false && !biodata?.isMarried;
  const stats = summary?.stats;
  const failureCount = Object.values(resources).filter(item => item.error).length;
  const busy = isAuthenticated && Object.keys(resources).length < Object.keys(requests).length;
  const premium = user?.isPremium && (!user.premiumExpiry || new Date(user.premiumExpiry) > new Date());

  const handleSearch = event => {
    event.preventDefault();
    if ([ageMin, ageMax].some(value => value && (!Number.isInteger(Number(value)) || Number(value) < 18 || Number(value) > 100))) {
      setAgeError('বয়স ১৮ থেকে ১০০ বছরের মধ্যে লিখুন।'); return;
    }
    if (ageMin && ageMax && Number(ageMin) > Number(ageMax)) {
      setAgeError('সর্বনিম্ন বয়স সর্বোচ্চ বয়সের চেয়ে বেশি হতে পারবে না।'); return;
    }
    setAgeError('');
    const query = new URLSearchParams();
    if (ageMin) query.set('ageMin', ageMin);
    if (ageMax) query.set('ageMax', ageMax);
    router.push(`/search${query.size ? `?${query}` : ''}`);
  };
  const handleMarried = async event => {
    event.preventDefault();
    if (!marriedVia || saving) return;
    setSaving(true);
    try {
      const { data } = await biodataAPI.markMarried(marriedVia);
      const updated = data.biodata || { ...biodata, isMarried: true, isActive: false };
      setMarriedBiodata(updated);
      updateUser({ biodataId: { ...(typeof user.biodataId === 'object' ? user.biodataId : {}), ...updated } });
      setMarriedOpen(false);
      toast.success('আল্লাহুমা বারিক! আপনার বায়োডেটা অনুসন্ধান থেকে সরানো হয়েছে।');
      retry();
    } catch (error) { toast.error(error.response?.data?.messageBn || 'আপডেট করা যায়নি। আবার চেষ্টা করুন।'); }
    finally { setSaving(false); }
  };

  return <DashboardLayout><div className={styles.dashboard}>
    <div className={styles.pageHeading}><div><p className={styles.eyebrow}>আপনার ব্যক্তিগত পরিসর</p><h1>ড্যাশবোর্ড</h1></div><div className={styles.pageTools}><span>{today}</span><button onClick={retry} disabled={busy} aria-label="ড্যাশবোর্ড রিফ্রেশ করুন"><FaSyncAlt className={busy ? styles.spinning : ''} /></button></div></div>
    {failureCount > 0 && <div className={styles.errorBanner} role="status">কিছু তথ্য লোড হয়নি। অন্য সুবিধাগুলো ব্যবহার করতে পারবেন।<button onClick={retry} disabled={busy}>আবার চেষ্টা করুন</button></div>}
    <section className={styles.welcome}>
      <div className={styles.welcomeCopy}><p>আসসালামু আলাইকুম</p><h2>স্বাগতম, {user?.name?.trim().split(/\s+/)[0] || 'প্রিয় সদস্য'}।</h2><p className={styles.welcomeText}>সুন্দর একটি আগামী খোঁজার যাত্রায়<br />আজ আরেকটু এগিয়ে যান।</p><Link href="/search" className={styles.goldButton}>জীবনসঙ্গী খুঁজুন <FaArrowRight /></Link></div>
      <div className={styles.welcomeStatus}><span className={styles.statusIcon}><FaFileAlt /></span><span className={styles.statusPill}><i className={visible ? styles.live : ''} />{status}</span><h3>{biodata?.biodataNumber || 'আপনার বায়োডেটা'}</h3><p>{biodata?.isMarried ? 'আপনার নতুন জীবনের জন্য শুভকামনা।' : visible ? 'আপনার বায়োডেটা অনুসন্ধানে দেখা যাচ্ছে।' : biodata?.status === 'rejected' ? biodata.rejectionReason || 'তথ্য সংশোধন করে আবার জমা দিন।' : hasBiodata ? 'বায়োডেটার তথ্য ও স্ট্যাটাস দেখে নিন।' : 'নিজের পরিচয় তুলে ধরুন, শুরু হোক নতুন সম্ভাবনা।'}</p><Link href={hasBiodata ? '/biodata' : '/biodata/create'}>{hasBiodata ? 'বায়োডেটা দেখুন' : 'বায়োডেটা তৈরি করুন'} <FaArrowRight /></Link></div>
    </section>

    <section className={styles.stats} aria-label="কার্যক্রমের সারসংক্ষেপ">{[
      [FaEye, stats?.profileViews, 'প্রোফাইল দেখা হয়েছে', '/biodata', 'সর্বমোট'],
      [FaRegHeart, user?.shortlistedProfiles?.length ?? stats?.shortlisted, 'আপনার শর্টলিস্ট', '/shortlist', 'সংরক্ষিত প্রোফাইল'],
      [FaRing, stats?.pendingInterests, 'নতুন ইন্টারেস্ট', '/dashboard/interests', 'উত্তরের অপেক্ষায়'],
      [FaComment, stats?.unreadMessages, 'অপঠিত বার্তা', '/dashboard/messages', 'কথোপকথন দেখুন'],
    ].map(([Icon, value, label, href, note]) => <Link key={label} href={href} className={styles.stat}><div><span className={styles.statIcon}><Icon /></span><FaArrowRight className={styles.statArrow} /></div><strong>{number(value)}</strong><p>{label}</p><small>{resources.summary?.error ? 'তথ্য পাওয়া যায়নি' : note}</small></Link>)}</section>

    <div className={styles.columns}><div className={styles.primaryColumn}>
      <section className={styles.panel}><SectionHeading title="আপনার পরবর্তী পদক্ষেপ" subtitle="একটু যত্নে আরও সম্পূর্ণ হোক আপনার পরিচয়" /><Resource state={resources.completeness} onRetry={retry}>{data => <>
        <div className={styles.completion}><div className={styles.progressRing} style={{ '--progress': `${percent}%` }} role="progressbar" aria-label="বায়োডেটা সম্পূর্ণতা" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}><span>{number(percent)}<small>% সম্পূর্ণ</small></span></div><div><h3>{percent === 100 ? 'আপনার বায়োডেটা সম্পূর্ণ!' : hasBiodata ? 'পরিচয়টি আরও সমৃদ্ধ করুন' : 'প্রথম পদক্ষেপটি আজই নিন'}</h3><p>{percent === 100 ? 'তথ্য হালনাগাদ রাখুন এবং পছন্দের প্রোফাইল দেখুন।' : 'সঠিক ও সম্পূর্ণ তথ্য আপনার সম্পর্কে জানতে সাহায্য করে।'}</p><Link href={biodataHref} className={styles.textLink}>{hasBiodata ? 'বায়োডেটা সম্পাদনা' : 'বায়োডেটা তৈরি করুন'} <FaArrowRight /></Link></div></div>
        {data.sections?.length > 0 && <div className={styles.sectionProgress}>{data.sections.map(section => <div key={section.name}><span>{section.label}</span><div><i style={{ width: `${section.max ? Math.round(section.earned / section.max * 100) : 0}%` }} /></div><small>{number(section.max ? Math.round(section.earned / section.max * 100) : 0)}%</small></div>)}</div>}
        {data.suggestions?.length > 0 && percent < 100 && <div className={styles.suggestions}><span>যোগ করতে পারেন</span>{data.suggestions.slice(0, 3).map(item => <Link href={biodataHref} key={`${item.section}-${item.field}`}>+ {item.field}</Link>)}</div>}
      </>}</Resource></section>

      <section className={styles.panel}><SectionHeading title="পছন্দের মানুষের খোঁজে" subtitle="আপনার পছন্দ অনুযায়ী বায়োডেটা দেখুন" href={tab === 'recommended' ? '/matches' : '/search'} /><div className={styles.tabs} role="tablist" aria-label="প্রোফাইলের তালিকা" onKeyDown={event => { if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') { event.preventDefault(); const next = tab === 'recommended' ? 'recent' : 'recommended'; setTab(next); document.getElementById(`tab-${next}`)?.focus(); } }}>{[['recommended', 'আপনার জন্য'], ['recent', 'নতুন বায়োডেটা']].map(([key,label]) => <button role="tab" id={`tab-${key}`} aria-controls="profile-panel" aria-selected={tab === key} tabIndex={tab === key ? 0 : -1} className={tab === key ? styles.selectedTab : ''} key={key} onClick={() => setTab(key)}>{label}</button>)}</div><div role="tabpanel" id="profile-panel" aria-labelledby={`tab-${tab}`}><Resource state={resources[tab]} onRetry={retry}>{data => { const profiles = (tab === 'recommended' ? data.profiles : data.data) || []; return profiles.length ? <div className={styles.profiles}>{profiles.slice(0,3).map(profile => <ProfileCard theme="gold" key={profile._id} biodata={profile} showScore={tab === 'recommended' && biodata?.status === 'approved'} score={profile.compatibilityScore} />)}</div> : <EmptyState title="এখনও কোনো প্রোফাইল পাওয়া যায়নি" text="আপনার পছন্দ পরিবর্তন করে বায়োডেটা খুঁজে দেখতে পারেন।" href="/search" action="বায়োডেটা খুঁজুন" />; }}</Resource></div></section>

      <section className={styles.panel}><SectionHeading title="সাম্প্রতিক কার্যক্রম" subtitle="আপনার অ্যাকাউন্টের সর্বশেষ আপডেট" href="/notifications" /><Resource state={resources.notifications} onRetry={retry}>{data => data.notifications?.length ? <div className={styles.activity}>{data.notifications.map(item => <Link href="/notifications" key={item._id}><span className={styles.activityIcon}><FaBell /></span><div><h3>{item.titleBn || item.title}</h3><p>{item.messageBn || item.message}</p><small>{item.createdAt && !Number.isNaN(Date.parse(item.createdAt)) ? new Date(item.createdAt).toLocaleDateString('bn-BD', { day: 'numeric', month: 'short', timeZone: 'Asia/Dhaka' }) : ''}</small></div>{!item.isRead && <i />}</Link>)}</div> : <EmptyState icon={FaBell} title="এখনও কোনো আপডেট নেই" text="নতুন কার্যক্রমের খবর এখানে দেখতে পাবেন।" />}</Resource></section>
    </div>

    <aside className={styles.sideColumn}>
      <section className={`${styles.panel} ${styles.searchPanel}`}><span className={styles.smallIcon}><FaSearch /></span><h2>দ্রুত বায়োডেটা খুঁজুন</h2><p>আপনার পছন্দের বয়সসীমা বেছে নিন।</p><form onSubmit={handleSearch}><div className={styles.ageInputs}><label htmlFor="age-min">সর্বনিম্ন বয়স<input id="age-min" type="number" inputMode="numeric" min="18" max="100" step="1" placeholder="১৮" value={ageMin} aria-describedby={ageError ? 'age-error' : undefined} onChange={event => { setAgeMin(event.target.value); setAgeError(''); }} /></label><label htmlFor="age-max">সর্বোচ্চ বয়স<input id="age-max" type="number" inputMode="numeric" min="18" max="100" step="1" placeholder="৩৫" value={ageMax} aria-describedby={ageError ? 'age-error' : undefined} onChange={event => { setAgeMax(event.target.value); setAgeError(''); }} /></label></div><div className={styles.presets}>{[['18','25'],['25','30'],['30','40']].map(([min,max]) => <button type="button" key={min} aria-pressed={ageMin === min && ageMax === max} onClick={() => { setAgeMin(min); setAgeMax(max); setAgeError(''); }}>{number(Number(min))}–{number(Number(max))}</button>)}</div>{ageError && <p className={styles.formError} id="age-error" role="alert">{ageError}</p>}<button type="submit" className={styles.darkButton}><FaSearch /> খুঁজে দেখুন</button></form><Link href="/search" className={styles.advancedLink}>আরও ফিল্টার ব্যবহার করুন <FaArrowRight /></Link></section>
      <section className={styles.verification}><span className={styles.smallIcon}><FaShieldAlt /></span><div><h3>{user?.verificationBadge ? 'অ্যাকাউন্ট যাচাইকৃত' : 'বিশ্বাসের পথে আরেক ধাপ'}</h3><p>{user?.verificationBadge ? 'আপনার প্রোফাইলে যাচাইকরণ ব্যাজ আছে।' : 'অ্যাকাউন্ট যাচাই করে আপনার পরিচয়ে আস্থা বাড়ান।'}</p>{!user?.verificationBadge && <Link href="/face-verify">যাচাই করুন <FaArrowRight /></Link>}</div></section>
      <section className={styles.premium}><FaCrown /><span>HMM PREMIUM</span><h2>{premium ? 'আপনি প্রিমিয়াম সদস্য' : 'আপনার যাত্রায় আরও সুবিধা'}</h2><p>প্রিমিয়াম প্ল্যানের সুবিধা ও বিস্তারিত এক জায়গায় দেখুন।</p><Link href="/dashboard/premium">{premium ? 'সদস্যপদ দেখুন' : 'প্ল্যান দেখুন'} <FaArrowRight /></Link></section>
      <section className={styles.panel}><SectionHeading title="আপনার আরও সুবিধা" /><Resource state={resources.referral} onRetry={retry}>{data => <Link href="/referral" className={styles.service}><span className={styles.smallIcon}><FaGift /></span><div><h3>রেফারেল পয়েন্ট</h3><p><strong>{number(data.points || 0)}</strong> পয়েন্ট · {number(data.totalReferrals || 0)} জন রেফারেল</p></div><FaArrowRight /></Link>}</Resource><Link href="/ruqyah" className={styles.service}><span className={styles.smallIcon}><FaMoon /></span><div><h3>রুকইয়াহ সেশন</h3><p>সময় দেখুন ও সেশন বুক করুন</p></div><FaArrowRight /></Link><Resource state={resources.bookings} onRetry={retry}>{data => { const today = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' }); const upcoming = (data.bookings || []).filter(item => item.status !== 'cancelled' && item.slotId?.date && new Date(item.slotId.date).toLocaleDateString('en-CA', { timeZone: 'Asia/Dhaka' }) >= today).sort((a,b) => new Date(a.slotId.date) - new Date(b.slotId.date)).slice(0,2); return upcoming.length ? <div className={styles.bookings}>{upcoming.map(item => <Link key={item._id} href="/ruqyah"><FaCheckCircle /><span>{new Date(item.slotId.date).toLocaleDateString('bn-BD', { day:'numeric', month:'short', timeZone:'Asia/Dhaka' })} · {item.slotId.time}<small>{item.status === 'confirmed' ? 'নিশ্চিত বুকিং' : 'নিশ্চিতকরণের অপেক্ষায়'}</small></span></Link>)}</div> : <p className={styles.noBookings}>আসন্ন কোনো বুকিং নেই।</p>; }}</Resource></section>
      <div className={styles.safety}><FaLock /><p>ব্যক্তিগত তথ্য শেয়ার করার আগে যাচাই করুন। সিদ্ধান্ত নিন পরিবারের সঙ্গে আলোচনা করে।</p></div>
    </aside></div>
    {hasBiodata && !biodata?.isMarried && <section className={styles.marriedNotice}><span><FaHeart /> নতুন অধ্যায় শুরু হয়েছে?</span><button onClick={() => { setMarriedVia(''); setMarriedOpen(true); }}>বিয়ে সম্পন্ন হয়েছে জানান <FaArrowRight /></button></section>}

    <Dialog open={marriedOpen} onClose={() => { if (!saving) setMarriedOpen(false); }} className={styles.modal}><div className={styles.modalBackdrop} aria-hidden="true" /><div className={styles.modalPosition}><Dialog.Panel className={styles.modalPanel}><button className={styles.closeModal} aria-label="বন্ধ করুন" disabled={saving} onClick={() => setMarriedOpen(false)}><FaTimes /></button><span className={styles.smallIcon}><FaRing /></span><Dialog.Title>আল্লাহুমা বারিক!</Dialog.Title><Dialog.Description>বিয়ে সম্পন্ন হিসেবে নিশ্চিত করলে আপনার বায়োডেটা অনুসন্ধান থেকে সরিয়ে দেওয়া হবে।</Dialog.Description><form onSubmit={handleMarried}><fieldset disabled={saving}><legend>বিয়েটি কীভাবে হয়েছে?</legend>{['এই সাইটের মাধ্যমে','অন্যভাবে'].map(value => <label key={value}><input type="radio" name="married-via" value={value} checked={marriedVia === value} onChange={() => setMarriedVia(value)} required />{value}</label>)}</fieldset><div className={styles.modalActions}><button type="button" disabled={saving} onClick={() => setMarriedOpen(false)}>ফিরে যান</button><button type="submit" disabled={!marriedVia || saving} className={styles.darkButton}>{saving ? 'আপডেট হচ্ছে…' : 'নিশ্চিত করুন'}</button></div></form></Dialog.Panel></div></Dialog>
  </div></DashboardLayout>;
}
