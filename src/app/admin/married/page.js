'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import { FaHeart, FaDownload } from 'react-icons/fa';

export default function AdminMarriedPage() {
  const [biodatas, setBiodatas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [viaFilter, setViaFilter] = useState('');

  useEffect(() => { fetchMarried(1); }, [viaFilter]);

  const fetchMarried = async (pg) => {
    setLoading(true);
    try {
      const { data } = await adminAPI.getMarried({ page: pg, limit: 15, via: viaFilter || undefined });
      setBiodatas(data.biodatas || []);
      setTotal(data.pagination?.total || 0);
      setTotalPages(data.pagination?.totalPages || 1);
      setPage(pg);
    } catch {}
    finally { setLoading(false); }
  };

  const handleExport = () => {
    window.open(`${process.env.NEXT_PUBLIC_API_URL}/admin/married/export`, '_blank');
  };

  return (
    <AdminLayout>
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-800 flex items-center gap-2"><FaHeart className="text-red-500" /> বিবাহিত সদস্য</h1>
            <p className="text-sm text-gray-500">মোট {total} জন বিবাহিত</p>
          </div>
          <button onClick={handleExport} className="flex items-center gap-2 btn-outline py-2 px-4 rounded-xl text-sm">
            <FaDownload size={13} /> CSV
          </button>
        </div>

        {/* Filter */}
        <div className="bg-white rounded-xl border p-4 flex gap-3 flex-wrap">
          {[{ value: '', label: 'সব' }, { value: 'site', label: 'এই সাইটের মাধ্যমে' }, { value: 'other', label: 'অন্যভাবে' }].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setViaFilter(opt.value)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${viaFilter === opt.value ? 'bg-[#1a5276] text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {loading ? <LoadingSpinner /> : (
          <div className="bg-white rounded-xl border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="table-header text-left">সদস্য</th>
                    <th className="table-header">বয়স</th>
                    <th className="table-header">বিয়ের তারিখ</th>
                    <th className="table-header">মাধ্যম</th>
                  </tr>
                </thead>
                <tbody>
                  {biodatas.map((b) => (
                    <tr key={b._id} className="hover:bg-gray-50">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gray-100 overflow-hidden flex-shrink-0 flex items-center justify-center">
                            {b.userId?.profilePicture
                              ? <Image src={b.userId.profilePicture} alt="" width={36} height={36} className="object-cover" />
                              : <span>{b.userId?.gender === 'male' ? '👨' : '👩'}</span>}
                          </div>
                          <div>
                            <p className="text-sm font-semibold">{b.personal?.fullName || b.userId?.name}</p>
                            <p className="text-xs text-gray-400">{b.userId?.phone || b.userId?.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell text-center text-sm">{b.personal?.age ? `${b.personal.age} বছর` : '-'}</td>
                      <td className="table-cell text-center text-sm">{b.marriedAt ? new Date(b.marriedAt).toLocaleDateString('bn-BD') : '-'}</td>
                      <td className="table-cell text-center">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${b.marriedVia === 'এই সাইটের মাধ্যমে' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {b.marriedVia === 'এই সাইটের মাধ্যমে' ? '💍 এই সাইটে' : '🔗 অন্যভাবে'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {biodatas.length === 0 && <div className="text-center py-10 text-gray-400 text-sm">কোনো বিবাহিত সদস্য নেই</div>}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2">
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((p) => (
              <button key={p} onClick={() => fetchMarried(p)} className={`w-9 h-9 rounded-lg text-sm font-medium ${p === page ? 'bg-[#1a5276] text-white' : 'bg-white border hover:bg-gray-50'}`}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
