'use client';

import { useState, useEffect } from 'react';
import AdminLayout from '@/components/AdminLayout';
import { adminAPI } from '@/lib/api';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  FaUsers, FaFileAlt, FaCreditCard, FaFlag, FaArrowUp,
  FaCheckCircle, FaClock, FaBan, FaTimesCircle
} from 'react-icons/fa';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend, ArcElement);

function StatCard({ title, value, subtitle, icon, color, trend }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          {icon}
        </div>
        {trend !== undefined && (
          <span className={`text-xs font-semibold flex items-center gap-1 ${trend >= 0 ? 'text-green-600' : 'text-red-500'}`}>
            <FaArrowUp size={10} className={trend < 0 ? 'rotate-180' : ''} />
            {Math.abs(trend)}%
          </span>
        )}
      </div>
      <div className="text-2xl font-bold text-gray-800">{value?.toLocaleString('bn-BD') || 0}</div>
      <div className="text-sm font-medium text-gray-700 mt-0.5">{title}</div>
      {subtitle && <div className="text-xs text-gray-400 mt-1">{subtitle}</div>}
    </div>
  );
}

export default function AdminDashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getAnalytics()
      .then(({ data }) => setAnalytics(data.analytics))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <AdminLayout><LoadingSpinner /></AdminLayout>;

  const { users, biodatas, payments, reports, charts } = analytics || {};

  // Monthly growth chart
  const growthData = {
    labels: charts?.monthlyGrowth?.map((d) => `${d._id.year}-${String(d._id.month).padStart(2, '0')}`) || [],
    datasets: [{
      label: 'নতুন সদস্য',
      data: charts?.monthlyGrowth?.map((d) => d.count) || [],
      backgroundColor: 'rgba(26, 82, 118, 0.7)',
      borderColor: '#1a5276',
      borderWidth: 2,
      borderRadius: 6,
    }],
  };

  // Daily revenue chart
  const revenueData = {
    labels: charts?.dailyRevenue?.map((d) => d._id) || [],
    datasets: [{
      label: 'রাজস্ব (টাকা)',
      data: charts?.dailyRevenue?.map((d) => d.amount) || [],
      borderColor: '#c9a84c',
      backgroundColor: 'rgba(201, 168, 76, 0.1)',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointBackgroundColor: '#c9a84c',
    }],
  };

  // Gender ratio chart
  const genderData = {
    labels: ['পুরুষ', 'মহিলা'],
    datasets: [{
      data: [users?.male || 0, users?.female || 0],
      backgroundColor: ['#1a5276', '#c9a84c'],
      borderWidth: 0,
    }],
  };

  const chartOptions = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } },
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-800">অ্যাডমিন ড্যাশবোর্ড</h1>
          <p className="text-sm text-gray-500 mt-0.5">Holy Relationship Matrimony — পরিচালনা প্যানেল</p>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="মোট সদস্য" value={users?.total} subtitle={`এই সপ্তাহে +${users?.newThisWeek || 0}`} icon={<FaUsers size={18} className="text-white" />} color="bg-[#1a5276]" />
          <StatCard title="অনুমোদিত বায়োডেটা" value={biodatas?.approved} subtitle={`মোট ${biodatas?.total || 0} টি`} icon={<FaCheckCircle size={18} className="text-white" />} color="bg-[#1b6a3b]" />
          <StatCard title="মোট রাজস্ব" value={`৳${payments?.totalRevenue || 0}`} subtitle={`এই মাসে ৳${payments?.monthlyRevenue || 0}`} icon={<FaCreditCard size={18} className="text-white" />} color="bg-[#c9a84c]" />
          <StatCard title="পর্যালোচনা বাকি" value={biodatas?.pending} subtitle={`${reports?.pending || 0} টি অভিযোগ বাকি`} icon={<FaClock size={18} className="text-white" />} color="bg-red-500" />
        </div>

        {/* Secondary stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl border p-4 text-center">
            <div className="text-xl font-bold text-gray-800">{users?.male || 0}</div>
            <div className="text-xs text-gray-500 mt-1">👨 পুরুষ সদস্য</div>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <div className="text-xl font-bold text-gray-800">{users?.female || 0}</div>
            <div className="text-xs text-gray-500 mt-1">👩 মহিলা সদস্য</div>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <div className="text-xl font-bold text-red-500">{biodatas?.rejected || 0}</div>
            <div className="text-xs text-gray-500 mt-1">❌ প্রত্যাখ্যাত বায়োডেটা</div>
          </div>
          <div className="bg-white rounded-xl border p-4 text-center">
            <div className="text-xl font-bold text-gray-800">{payments?.total || 0}</div>
            <div className="text-xs text-gray-500 mt-1">✅ সফল পেমেন্ট</div>
          </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Monthly growth */}
          <div className="lg:col-span-2 bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">মাসিক সদস্য বৃদ্ধি</h3>
            {charts?.monthlyGrowth?.length > 0 ? (
              <Bar data={growthData} options={chartOptions} height={80} />
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">ডেটা নেই</div>
            )}
          </div>

          {/* Gender ratio */}
          <div className="bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">লিঙ্গ অনুপাত</h3>
            {(users?.male || users?.female) ? (
              <>
                <Doughnut data={genderData} options={{ plugins: { legend: { position: 'bottom' } }, cutout: '70%' }} />
              </>
            ) : (
              <div className="h-40 flex items-center justify-center text-gray-400 text-sm">ডেটা নেই</div>
            )}
          </div>

          {/* Revenue chart */}
          <div className="lg:col-span-3 bg-white rounded-xl border border-gray-100 p-5">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">সাপ্তাহিক রাজস্ব</h3>
            {charts?.dailyRevenue?.length > 0 ? (
              <Line data={revenueData} options={chartOptions} height={50} />
            ) : (
              <div className="h-32 flex items-center justify-center text-gray-400 text-sm">ডেটা নেই</div>
            )}
          </div>
        </div>

        {/* Quick action links */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { href: '/admin/biodatas?status=pending', label: `${biodatas?.pending || 0} টি বায়োডেটা পর্যালোচনা`, color: 'border-yellow-200 bg-yellow-50 text-yellow-700' },
            { href: '/admin/reports?status=pending', label: `${reports?.pending || 0} টি অভিযোগ মুলতুবি`, color: 'border-red-200 bg-red-50 text-red-700' },
            { href: '/admin/payments', label: 'সব পেমেন্ট দেখুন', color: 'border-green-200 bg-green-50 text-green-700' },
            { href: '/admin/users', label: 'সদস্য পরিচালনা', color: 'border-blue-200 bg-blue-50 text-blue-700' },
          ].map((item) => (
            <a key={item.href} href={item.href} className={`border-2 rounded-xl p-4 text-center font-semibold text-sm hover:shadow-md transition-all ${item.color}`}>
              {item.label}
            </a>
          ))}
        </div>
      </div>
    </AdminLayout>
  );
}
