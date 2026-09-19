'use client';
import { useState } from 'react';
import { Dialog } from '@headlessui/react';
import { adminAPI } from '@/lib/api';
import styles from './AdminMemberModal.module.css';

export default function AdminMemberModal({ member, onClose, onSaved }) {
  const [withBiodata, setWithBiodata] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [resent, setResent] = useState(false);
  async function submit(event) {
    event.preventDefault(); setBusy(true); setError('');
    const form = Object.fromEntries(new FormData(event.currentTarget));
    const biodata = {};
    for (const [key, value] of Object.entries(form)) {
      if (key.includes('.') && value.trim()) {
        const [section, field] = key.split('.');
        biodata[section] ||= {}; biodata[section][field] = value;
      }
    }
    try {
      const { data } = member
        ? await adminAPI.createUserBiodata(member._id, biodata)
        : await adminAPI.createUser({ name: form.name, email: form.email, phone: form.phone, gender: form.gender, ...(withBiodata ? { biodata } : {}) });
      setResult(data); onSaved();
    } catch (err) { setError(err.response?.data?.message || 'সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।'); }
    finally { setBusy(false); }
  }
  async function resend() {
    setBusy(true); setError('');
    try { await adminAPI.sendLoginEmail(result.user._id); setResent(true); }
    catch (err) { setError(err.response?.data?.message || 'ইমেইল পাঠানো যায়নি।'); }
    finally { setBusy(false); }
  }
  const field = (name, label, props = {}) => <label className={styles.field}>{label}<input name={name} {...props} /></label>;
  const select = (name, label, options, required = false) => <label className={styles.field}>{label}<select name={name} required={required} defaultValue=""><option value="">নির্বাচন করুন</option>{options.map(([value, text]) => <option value={value} key={value}>{text}</option>)}</select></label>;
  const maxDob = new Date(); maxDob.setFullYear(maxDob.getFullYear() - 18);
  return <Dialog open onClose={() => { if (!busy) onClose(); }} className={styles.dialog}>
    <div className={styles.backdrop} aria-hidden="true" /><div className={styles.viewport}><Dialog.Panel className={styles.panel}>
      <header className={styles.header}><div><span>HOLY MATRIMONY · ADMIN</span><Dialog.Title>{member ? `${member.name} — বায়োডাটা যোগ করুন` : 'নতুন সদস্য যোগ করুন'}</Dialog.Title><p>সঠিক তথ্য দিয়ে সদস্যের যাত্রা শুরু করুন।</p></div><button type="button" onClick={onClose} disabled={busy} aria-label="বন্ধ করুন">×</button></header>
      {result ? <div className={styles.success}>
        <h3>{member ? 'বায়োডাটা প্রকাশিত হয়েছে' : 'সদস্যের অ্যাকাউন্ট তৈরি হয়েছে'}</h3>
        {result.biodata && <p>বায়োডাটা প্রকাশিত হয়েছে। অন্য সদস্যরা এখন এটি দেখতে ও খুঁজে পেতে পারবেন।</p>}
        {!member && <p>{result.emailSent ? `${result.user.email} ঠিকানায় লগইন তথ্য পাঠানো হয়েছে।` : 'অ্যাকাউন্ট তৈরি হয়েছে, কিন্তু ইমেইল পাঠানো যায়নি। আবার অ্যাকাউন্ট তৈরি করার প্রয়োজন নেই।'}</p>}
        {resent && <p role="status">লগইন ও OTP দিয়ে পাসওয়ার্ড সেট করার নির্দেশনা পাঠানো হয়েছে।</p>}
        {error && <p role="alert" className={styles.error}>{error}</p>}
        {!member && !result.emailSent && !resent && <button className={styles.secondary} disabled={busy} onClick={resend}>{busy ? 'পাঠানো হচ্ছে…' : 'লগইন নির্দেশনা আবার পাঠান'}</button>}
        <button className={styles.primary} disabled={busy} onClick={onClose}>সম্পন্ন</button>
      </div> : <form onSubmit={submit}>
        <div className={styles.body}>
          {!member && <section><h3>০১ / অ্যাকাউন্টের তথ্য</h3><div className={styles.grid}>
            {field('name', 'পূর্ণ নাম *', { required: true, maxLength: 100, autoComplete: 'off' })}
            {field('email', 'ইমেইল *', { type: 'email', required: true, autoComplete: 'off' })}
            {field('phone', 'মোবাইল নম্বর', { type: 'tel', placeholder: '01XXXXXXXXX', pattern: '(\\+880|880|0)?1[3-9][0-9]{8}' })}
            {select('gender', 'লিঙ্গ *', [['male', 'পুরুষ'], ['female', 'মহিলা']], true)}
          </div><p className={styles.note}>একটি আলাদা প্রাথমিক পাসওয়ার্ড তৈরি করে সদস্যের ইমেইলে লগইন তথ্য পাঠানো হবে।</p>
          <label className={styles.toggle}><input type="checkbox" checked={withBiodata} onChange={e => setWithBiodata(e.target.checked)} /> সঙ্গে বায়োডাটা তৈরি ও প্রকাশ করুন</label></section>}
          {(member || withBiodata) && <>
            <section><h3>০২ / ব্যক্তিগত তথ্য</h3><div className={styles.grid}>
              {field('personal.dateOfBirth', 'জন্মতারিখ *', { type: 'date', required: true, max: maxDob.toISOString().slice(0, 10) })}
              {select('personal.maritalStatus', 'বৈবাহিক অবস্থা *', [['single', 'অবিবাহিত'], ['divorced', 'তালাকপ্রাপ্ত'], ['widowed', 'বিধবা / বিপত্নীক'], ['masna', 'মাসনা'], ['sulasa', 'সুলাসা'], ['rubaa', 'রুবাআ']], true)}
              {field('personal.fatherName', 'পিতার নাম')}{field('personal.motherName', 'মাতার নাম')}
              {field('personal.height', 'উচ্চতা (সেন্টিমিটার)', { type: 'number', min: 50, max: 260 })}
              {field('personal.weight', 'ওজন (কেজি)', { type: 'number', min: 20, max: 300 })}
            </div></section>
            <section><h3>০৩ / শিক্ষা ও পেশা</h3><div className={styles.grid}>
              {select('education.highestLevel', 'শিক্ষাগত যোগ্যতা', [['no_education', 'প্রাতিষ্ঠানিক শিক্ষা নেই'], ['psc', 'প্রাথমিক'], ['jsc', 'জেএসসি'], ['ssc', 'এসএসসি'], ['hsc', 'এইচএসসি'], ['honours', 'স্নাতক'], ['masters', 'স্নাতকোত্তর'], ['phd', 'পিএইচডি'], ['qawmi', 'কওমি'], ['madrasa_dakhil', 'দাখিল'], ['madrasa_alim', 'আলিম'], ['madrasa_fazil', 'ফাজিল'], ['madrasa_kamil', 'কামিল'], ['others', 'অন্যান্য']])}
              {field('education.institution', 'শিক্ষাপ্রতিষ্ঠান')}
              {select('profession.occupationType', 'পেশা', [['student', 'শিক্ষার্থী'], ['service_holder', 'চাকরিজীবী'], ['business', 'ব্যবসা'], ['doctor', 'চিকিৎসক'], ['engineer', 'প্রকৌশলী'], ['teacher', 'শিক্ষক'], ['lawyer', 'আইনজীবী'], ['farmer', 'কৃষক'], ['housewife', 'গৃহিণী'], ['unemployed', 'কর্মহীন'], ['other', 'অন্যান্য']])}
              {field('profession.designation', 'পদবি')}
            </div></section>
            <section><h3>০৪ / ঠিকানা ও অভিভাবক</h3><div className={styles.grid}>
              {field('address.permanentDivision', 'স্থায়ী বিভাগ')}{field('address.permanentDistrict', 'স্থায়ী জেলা')}{field('address.permanentUpazila', 'স্থায়ী উপজেলা')}{field('address.currentDistrict', 'বর্তমান জেলা')}
              {field('contact.guardianName', 'অভিভাবকের নাম')}{field('contact.guardianPhone', 'অভিভাবকের মোবাইল', { type: 'tel' })}
            </div><label className={styles.field}>নিজের সম্পর্কে<textarea name="lifestyle.aboutSelf" maxLength={1000} rows={3} /></label></section>
            <p className={styles.note}>অ্যাডমিনের তৈরি বায়োডাটা সরাসরি প্রকাশিত হবে এবং অন্য সদস্যরা দেখতে পারবেন। প্রকাশের আগে তথ্য যাচাই করে নিন।</p>
          </>}
          {error && <p role="alert" className={styles.error}>{error}</p>}
        </div><footer className={styles.footer}><button type="button" className={styles.secondary} onClick={onClose} disabled={busy}>বাতিল</button><button className={styles.primary} disabled={busy}>{busy ? 'সংরক্ষণ হচ্ছে…' : member ? 'বায়োডাটা প্রকাশ করুন' : 'সদস্য তৈরি ও ইমেইল পাঠান'}</button></footer>
      </form>}
    </Dialog.Panel></div>
  </Dialog>;
}
