import Image from 'next/image';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { FaArrowRight, FaCheck, FaHeart, FaLock, FaSearch, FaShieldAlt, FaUserEdit, FaUsers, FaRegComments, FaPlus } from 'react-icons/fa';
import styles from './home.module.css';

const features = [
  { icon: FaShieldAlt, number: '০১', title: 'আস্থার সঙ্গে পরিচয়', text: 'বায়োডেটার বিস্তারিত তথ্য জানুন। নিজের ও পরিবারের প্রত্যাশা মিলিয়ে সিদ্ধান্ত নিন।' },
  { icon: FaLock, number: '০২', title: 'গোপনীয়তায় অগ্রাধিকার', text: 'যোগাযোগের তথ্য সবার জন্য উন্মুক্ত নয়। ব্যক্তিগত তথ্য শেয়ার করুন ভেবেচিন্তে।' },
  { icon: FaUsers, number: '০৩', title: 'পরিবারকে সঙ্গে নিয়ে', text: 'ইসলামিক মূল্যবোধ ও পারিবারিক সম্মতিকে গুরুত্ব দিয়ে এগিয়ে নিন পরিচয়ের পরবর্তী ধাপ।' },
];
const steps = [
  { icon: FaUserEdit, title: 'নিজের গল্পটি লিখুন', text: 'নিবন্ধন করে আপনার শিক্ষা, পরিবার ও জীবনধারার তথ্য দিয়ে বায়োডেটা তৈরি করুন।' },
  { icon: FaSearch, title: 'পছন্দের মানুষ খুঁজুন', text: 'বয়স, বিভাগ ও অন্যান্য পছন্দ অনুযায়ী বায়োডেটা দেখুন এবং শর্টলিস্ট করুন।' },
  { icon: FaRegComments, title: 'পরিচয় হোক পরিবারের', text: 'পছন্দের বায়োডেটার যোগাযোগের তথ্য নিয়ে পারিবারিকভাবে আলোচনা শুরু করুন।' },
];
const questions = [
  ['কীভাবে বায়োডেটা তৈরি করব?', 'নিবন্ধন করুন, তারপর আপনার অ্যাকাউন্ট থেকে বায়োডেটা ফর্ম পূরণ করুন। নিজের ও পরিবারের সঠিক তথ্য দিয়ে পর্যালোচনার জন্য জমা দিন।'],
  ['নিবন্ধন ছাড়াই কি বায়োডেটা দেখা যাবে?', 'হ্যাঁ, বায়োডেটা খুঁজুন পেজ থেকে প্রোফাইল দেখতে পারবেন। যোগাযোগের তথ্য ও অ্যাকাউন্টের অন্যান্য সুবিধা পেতে লগইন করুন।'],
  ['যোগাযোগের তথ্য কীভাবে পাব?', 'পছন্দের প্রোফাইলে গিয়ে যোগাযোগের তথ্য আনলক করার অপশন বেছে নিন। প্রযোজ্য মূল্য ও পেমেন্টের নির্দেশনা সেখানেই দেখতে পাবেন।'],
  ['সাহায্যের প্রয়োজন হলে কোথায় যোগাযোগ করব?', 'আমাদের যোগাযোগ পেজ থেকে সহায়তা নিন। বায়োডেটা তৈরি বা সেবা ব্যবহারে কোনো প্রশ্ন থাকলে আমাদের জানান।'],
];

export default function HomePage() {
  return (
    <div className={styles.home}>
      <a href="#main-content" className={styles.skipLink}>মূল কনটেন্টে যান</a>
      <Navbar variant="home" />
      <main id="main-content">
        <section className={styles.hero}>
          <div className={`${styles.container} ${styles.heroGrid}`}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}><span /> একটি সুন্দর শুরুর প্রত্যাশায়</p>
              <h1>সম্পর্ক হোক পবিত্র,<br />পথচলা হোক <em>একসাথে।</em></h1>
              <p className={styles.heroDescription}>জীবনের সবচেয়ে সুন্দর সিদ্ধান্তটি নিন আস্থার সঙ্গে। ইসলামিক মূল্যবোধ ও পরিবারের পছন্দকে পাশে রেখে খুঁজে নিন আপনার জীবনসঙ্গী।</p>
              <div className={styles.actions}>
                <Link href="/register" className={styles.primary}>বায়োডেটা তৈরি করুন <FaArrowRight /></Link>
                <Link href="/search" className={styles.secondary}><FaSearch /> বায়োডেটা দেখুন</Link>
              </div>
              <div className={styles.heroNotes}><span><FaCheck /> বিনামূল্যে নিবন্ধন</span><span><FaLock /> ব্যক্তিগত তথ্যের গোপনীয়তা</span></div>
            </div>
            <div className={styles.brandVisual}>
              <div className={styles.orbit} aria-hidden="true" />
              <span className={styles.visualCaption}>HOLY RELATIONSHIP</span>
              <div className={styles.logoMedallion}><Image src="/hmm-logo.png" alt="Holy Relationship Marriage Matrimony — HMM" width={800} height={800} priority sizes="(max-width: 600px) 260px, 380px" /></div>
              <div className={styles.visualSeal}><FaHeart /><span>পবিত্র বন্ধন<small>সারাজীবনের জন্য</small></span></div>
              <span className={styles.visualBottom}>MARRIAGE MATRIMONY <i /> EST. WITH FAITH</span>
            </div>
          </div>
        </section>

        <section className={`${styles.container} ${styles.searchSection}`} aria-labelledby="quick-search-heading">
          <div className={styles.searchIntro}><span className={styles.iconBox}><FaSearch /></span><div><h2 id="quick-search-heading">আপনার খোঁজ শুরু হোক</h2><p>পছন্দগুলো বেছে নিন, খুঁজে দেখুন বায়োডেটা।</p></div></div>
          <form action="/search" method="get" className={styles.searchForm}>
            <label>আমি খুঁজছি<select name="gender" defaultValue=""><option value="">পাত্র / পাত্রী</option><option value="male">পাত্র</option><option value="female">পাত্রী</option></select></label>
            <label>বৈবাহিক অবস্থা<select name="maritalStatus" defaultValue=""><option value="">সকল</option><option value="single">অবিবাহিত</option><option value="divorced">তালাকপ্রাপ্ত</option><option value="widowed">বিধবা / বিপত্নীক</option></select></label>
            <label>বিভাগ<select name="division" defaultValue=""><option value="">সকল বিভাগ</option>{[['Dhaka','ঢাকা'],['Chittagong','চট্টগ্রাম'],['Rajshahi','রাজশাহী'],['Khulna','খুলনা'],['Barishal','বরিশাল'],['Sylhet','সিলেট'],['Rangpur','রংপুর'],['Mymensingh','ময়মনসিংহ']].map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
            <button type="submit" className={styles.primary}><FaSearch /> বায়োডেটা খুঁজুন</button>
          </form>
        </section>

        <section id="why-us" className={`${styles.container} ${styles.section}`}>
          <div className={styles.sectionHeading}><div><p className={styles.eyebrow}>সম্পর্কের ভিত্তি হোক আস্থা</p><h2>শুধু পরিচয় নয়,<br />একটি সুন্দর ভবিষ্যতের শুরু।</h2></div><p>সঠিক মানুষটি খোঁজার যাত্রায় আপনার বিশ্বাস, পছন্দ ও পরিবারের মূল্যবোধই আমাদের কাছে গুরুত্বপূর্ণ।</p></div>
          <div className={styles.featureGrid}>{features.map(({icon: Icon,number,title,text}) => <article className={styles.feature} key={number}><div className={styles.featureTop}><span className={styles.iconBox}><Icon /></span><span>{number}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div>
        </section>

        <section id="how-it-works" className={styles.stepsSection}><div className={styles.container}>
          <div className={styles.centerHeading}><p className={styles.eyebrow}>সহজ তিনটি ধাপ</p><h2>আপনার নতুন অধ্যায়, শুরু এখানেই।</h2><p>নিজের পরিচয় থেকে পারিবারিক আলোচনা—প্রতিটি ধাপে এগিয়ে যান সহজে।</p></div>
          <div className={styles.steps}>{steps.map(({icon: Icon,title,text},index) => <article key={title}><div className={styles.stepIcon}><Icon /><span>{['০১','০২','০৩'][index]}</span></div><h3>{title}</h3><p>{text}</p></article>)}</div>
          <div className={styles.centerAction}><Link href="/register" className={styles.textLink}>প্রথম ধাপটি আজই নিন <FaArrowRight /></Link></div>
        </div></section>

        <section className={`${styles.container} ${styles.invitation}`}><div className={styles.invitationMark} aria-hidden="true"><FaHeart /></div><p className={styles.eyebrow}>একসাথে একটি সুন্দর আগামী</p><h2>একটি পরিচয় থেকে,<br />সারাজীবনের পথচলা।</h2><p>আপনার মূল্যবোধের সঙ্গে মেলে এমন একজনকে খুঁজছেন?<br />নিজের বায়োডেটা তৈরি করে শুরু করুন নতুন সম্ভাবনার যাত্রা।</p><Link href="/register" className={styles.primary}>বিনামূল্যে নিবন্ধন করুন <FaArrowRight /></Link><span className={styles.invitationDetail}>বিশ্বাস · সম্মান · ভালোবাসা</span></section>

        <section className={`${styles.container} ${styles.faqSection}`}><div><p className={styles.eyebrow}>আপনার জিজ্ঞাসা</p><h2>শুরু করার আগে<br />জেনে নিন।</h2><p>আরও কিছু জানতে চান?</p><Link href="/contact" className={styles.textLink}>আমাদের সঙ্গে কথা বলুন <FaArrowRight /></Link></div><div className={styles.faqList}>{questions.map(([question,answer],index) => <details key={question} open={index === 0}><summary>{question}<FaPlus /></summary><p>{answer}</p></details>)}<Link href="/faq" className={styles.allQuestions}>সকল প্রশ্ন ও উত্তর দেখুন <FaArrowRight /></Link></div></section>
      </main>
      <Footer variant="home" />
    </div>
  );
}
