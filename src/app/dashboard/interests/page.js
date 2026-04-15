'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import DashboardLayout from '@/components/DashboardLayout';
import { interestAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import toast from 'react-hot-toast';
import { FaHeart, FaCheck, FaTimes, FaSpinner, FaTrash, FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const LIMIT = 10;

const statusBadge = {
  pending: 'bg-yellow-100 text-yellow-700',
  accepted: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-600',
};
const statusLabel = { pending: 'অপেক্ষমাণ', accepted: 'গৃহীত', rejected: 'প্রত্যাখ্যাত' };

export default function InterestsPage() {
  const [tab, setTab] = useState('received');

  // received state
  const [received, setReceived] = useState([]);
  const [receivedPage, setReceivedPage] = useState(1);
  const [receivedTotal, setReceivedTotal] = useState(0);
  const [receivedTotalPages, setReceivedTotalPages] = useState(1);
  const [loadingReceived, setLoadingReceived] = useState(false);

  // sent state
  const [sent, setSent] = useState([]);
  const [sentPage, setSentPage] = useState(1);
  const [sentTotal, setSentTotal] = useState(0);
  const [sentTotalPages, setSentTotalPages] = useState(1);
  const [loadingSent, setLoadingSent] = useState(false);

  const [actionLoading, setActionLoading] = useState({});

  const fetchReceived = useCallback(async (page) => {
    setLoadingReceived(true);
    try {
      const { data } = await interestAPI.getReceived({ page, limit: LIMIT });
      setReceived(data.interests || []);
      setReceivedTotal(data.pagination?.total || 0);
      setReceivedTotalPages(data.pagination?.totalPages || 1);
    } catch {}
    finally { setLoadingReceived(false); }
  }, []);

  const fetchSent = useCallback(async (page) => {
    setLoadingSent(true);
    try {
      const { data } = await interestAPI.getSent({ page, limit: LIMIT });
      setSent(data.interests || []);
      setSentTotal(data.pagination?.total || 0);
      setSentTotalPages(data.pagination?.totalPages || 1);
    } catch {}
    finally { setLoadingSent(false); }
  }, []);

  useEffect(() => { fetchReceived(1); fetchSent(1); }, [fetchReceived, fetchSent]);

  const handleReceivedPage = (p) => {
    setReceivedPage(p);
    fetchReceived(p);
  };
  const handleSentPage = (p) => {
    setSentPage(p);
    fetchSent(p);
  };

  const handleRespond = async (id, status) => {
    setActionLoading((p) => ({ ...p, [id]: status }));
    try {
      await interestAPI.respond(id, status);
      toast.success(status === 'accepted' ? 'Interest গৃহীত হয়েছে' : 'Interest প্রত্যাখ্যাত হয়েছে');
      setReceived((prev) => prev.map((i) => i._id === id ? { ...i, status } : i));
    } catch { toast.error('সমস্যা হয়েছে'); }
    finally { setActionLoading((p) => ({ ...p, [id]: null })); }
  };

  const handleWithdraw = async (id) => {
    setActionLoading((p) => ({ ...p, [id]: 'withdraw' }));
    try {
      await interestAPI.withdraw(id);
      toast.success('Interest প্রত্যাহার করা হয়েছে');
      setSent((prev) => prev.filter((i) => i._id !== id));
      setSentTotal((t) => t - 1);
    } catch { toast.error('সমস্যা হয়েছে'); }
    finally { setActionLoading((p) => ({ ...p, [id]: null })); }
  };

  const InterestCard = ({ interest, type }) => {
    const person = type === 'received' ? interest.senderId : interest.receiverId;
    const biodata = interest.biodataId;
    return (
      <div className="bg-white rounded-xl border p-4 flex items-start gap-4 hover:shadow-sm transition-shadow">
        <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-100 flex-shrink-0">
          {person?.profilePicture ? (
            <Image src={person.profilePicture} alt="" width={56} height={56} className="object-cover" />
          ) : <div className="w-full h-full flex items-center justify-center text-2xl">{person?.gender === 'male' ? '👨' : '👩'}</div>}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <p className="font-semibold text-gray-800">{biodata?.personal?.fullName || person?.name}</p>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${statusBadge[interest.status]}`}>
              {statusLabel[interest.status]}
            </span>
          </div>
          {biodata?.personal?.age && <p className="text-xs text-gray-500 mt-0.5">{biodata.personal.age} বছর · {biodata.personal.maritalStatus}</p>}
          {interest.message && <p className="text-sm text-gray-600 mt-1 italic">"{interest.message}"</p>}
          <p className="text-xs text-gray-400 mt-1">{new Date(interest.createdAt).toLocaleDateString('bn-BD')}</p>
        </div>
        <div className="flex flex-col gap-1.5 flex-shrink-0">
          {type === 'received' && interest.status === 'pending' && (
            <>
              <button
                onClick={() => handleRespond(interest._id, 'accepted')}
                disabled={!!actionLoading[interest._id]}
                className="flex items-center gap-1 bg-green-100 hover:bg-green-200 text-green-700 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading[interest._id] === 'accepted' ? <FaSpinner className="animate-spin" size={10} /> : <FaCheck size={10} />} গ্রহণ
              </button>
              <button
                onClick={() => handleRespond(interest._id, 'rejected')}
                disabled={!!actionLoading[interest._id]}
                className="flex items-center gap-1 bg-red-100 hover:bg-red-200 text-red-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading[interest._id] === 'rejected' ? <FaSpinner className="animate-spin" size={10} /> : <FaTimes size={10} />} প্রত্যাখ্যান
              </button>
            </>
          )}
          {type === 'sent' && interest.status === 'pending' && (
            <button
              onClick={() => handleWithdraw(interest._id)}
              disabled={!!actionLoading[interest._id]}
              className="flex items-center gap-1 bg-gray-100 hover:bg-gray-200 text-gray-600 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
            >
              {actionLoading[interest._id] === 'withdraw' ? <FaSpinner className="animate-spin" size={10} /> : <FaTrash size={10} />} প্রত্যাহার
            </button>
          )}
          {type === 'received' && interest.status === 'accepted' && (
            <Link href="/dashboard/messages" className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-semibold px-3 py-1.5 rounded-lg">
              চ্যাট করুন
            </Link>
          )}
        </div>
      </div>
    );
  };

  const isReceivedTab = tab === 'received';
  const currentList = isReceivedTab ? received : sent;
  const currentLoading = isReceivedTab ? loadingReceived : loadingSent;
  const currentPage = isReceivedTab ? receivedPage : sentPage;
  const currentTotalPages = isReceivedTab ? receivedTotalPages : sentTotalPages;
  const currentTotal = isReceivedTab ? receivedTotal : sentTotal;
  const handlePageChange = isReceivedTab ? handleReceivedPage : handleSentPage;

  return (
    <DashboardLayout>
      <div className="space-y-5">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Interest ব্যবস্থাপনা</h1>
          <p className="text-sm text-gray-500">পাঠানো এবং পাওয়া Interest দেখুন</p>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border p-1 flex w-full max-w-xs">
          {[
            { id: 'received', label: `পাওয়া (${receivedTotal})` },
            { id: 'sent', label: `পাঠানো (${sentTotal})` },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-colors ${tab === t.id ? 'bg-[#1a5276] text-white' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* List */}
        {currentLoading ? <LoadingSpinner /> : (
          <div className="space-y-3">
            {currentList.length === 0 ? (
              <div className="bg-white rounded-xl border p-10 text-center text-gray-400">
                <FaHeart className="mx-auto mb-3 text-gray-300" size={32} />
                <p className="text-sm">{isReceivedTab ? 'এখনো কোনো Interest পাওয়া যায়নি' : 'এখনো কোনো Interest পাঠানো হয়নি'}</p>
              </div>
            ) : (
              currentList.map((interest) => (
                <InterestCard key={interest._id} interest={interest} type={tab} />
              ))
            )}
          </div>
        )}

        {/* Pagination */}
        {currentTotalPages > 1 && !currentLoading && (
          <Pagination
            page={currentPage}
            totalPages={currentTotalPages}
            total={currentTotal}
            limit={LIMIT}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </DashboardLayout>
  );
}

function Pagination({ page, totalPages, total, limit, onPageChange }) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);

  const pages = [];
  const delta = 2;
  for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 bg-white rounded-xl border px-4 py-3">
      <p className="text-xs text-gray-500">
        মোট {total}টির মধ্যে {start}–{end} দেখানো হচ্ছে
      </p>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="w-8 h-8 flex items-center justify-center rounded-lg border text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FaChevronLeft size={11} />
        </button>

        {pages[0] > 1 && (
          <>
            <button onClick={() => onPageChange(1)} className="w-8 h-8 text-xs rounded-lg border hover:bg-gray-50 transition-colors">1</button>
            {pages[0] > 2 && <span className="w-8 text-center text-gray-400 text-xs">…</span>}
          </>
        )}

        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`w-8 h-8 text-xs rounded-lg border transition-colors ${
              p === page ? 'bg-[#1a5276] text-white border-[#1a5276]' : 'hover:bg-gray-50 text-gray-700'
            }`}
          >
            {p}
          </button>
        ))}

        {pages[pages.length - 1] < totalPages && (
          <>
            {pages[pages.length - 1] < totalPages - 1 && <span className="w-8 text-center text-gray-400 text-xs">…</span>}
            <button onClick={() => onPageChange(totalPages)} className="w-8 h-8 text-xs rounded-lg border hover:bg-gray-50 transition-colors">{totalPages}</button>
          </>
        )}

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="w-8 h-8 flex items-center justify-center rounded-lg border text-gray-500 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <FaChevronRight size={11} />
        </button>
      </div>
    </div>
  );
}
