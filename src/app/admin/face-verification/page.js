'use client';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { faceVerificationAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';

function Review({ user, onReviewed }) {
  const [photo, setPhoto] = useState('');
  const [failed, setFailed] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    let url; let active = true;
    faceVerificationAPI.photo(user._id).then(({ data }) => {
      if (active) { url = URL.createObjectURL(data); setPhoto(url); }
    }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; if (url) URL.revokeObjectURL(url); };
  }, [user._id]);
  const review = async status => {
    setBusy(true);
    try { await faceVerificationAPI.review(user._id, status); onReviewed(user._id); toast.success('সিদ্ধান্ত সংরক্ষণ হয়েছে।'); }
    catch { toast.error('সংরক্ষণ হয়নি। আবার চেষ্টা করুন।'); }
    finally { setBusy(false); }
  };
  return <article className="card space-y-3"><h2 className="font-bold">{user.name}</h2><p className="text-sm">{user.email}</p>
    <div className="flex flex-wrap gap-4">
      {photo && <figure><img src={photo} alt={`${user.name}-এর জমা দেওয়া সেলফি`} className="w-48 h-48 object-cover rounded-xl" /><figcaption>জমা দেওয়া সেলফি</figcaption></figure>}
      {user.profilePicture && <figure><img src={user.profilePicture} alt="প্রোফাইল ছবি" className="w-48 h-48 object-cover rounded-xl" /><figcaption>প্রোফাইল ছবি</figcaption></figure>}
    </div>
    {failed && <p role="alert" className="text-red-700">সেলফি লোড হয়নি। পেজ রিফ্রেশ করুন।</p>}
    <div className="flex gap-3"><button disabled={busy || !photo} onClick={() => review('approved')} className="btn-primary px-4 py-2 rounded-lg disabled:opacity-50">অনুমোদন</button><button disabled={busy || !photo} onClick={() => review('rejected')} className="btn-outline px-4 py-2 rounded-lg disabled:opacity-50">পুনরায় ছবি চান</button></div>
  </article>;
}

export default function FaceReviewsPage() {
  const { isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (!isAdmin) return;
    faceVerificationAPI.list().then(({ data }) => setUsers(data.users)).catch(() => setError(true)).finally(() => setLoading(false));
  }, [isAdmin]);
  return <AdminLayout><div className="max-w-3xl mx-auto space-y-4"><h1 className="text-2xl font-bold">ফেস যাচাই পর্যালোচনা</h1><p className="text-gray-500">ছবি ও প্রোফাইল মিলিয়ে সিদ্ধান্ত দিন। সিদ্ধান্তের পরে জমা দেওয়া সেলফি মুছে যাবে।</p>
    {loading ? <p role="status">লোড হচ্ছে…</p> : error ? <p role="alert">তথ্য লোড হয়নি। পেজ রিফ্রেশ করুন।</p> : !users.length ? <p className="card">পর্যালোচনাধীন আবেদন নেই।</p> : users.map(user => <Review key={user._id} user={user} onReviewed={id => setUsers(us => us.filter(u => u._id !== id))} />)}
  </div></AdminLayout>;
}
