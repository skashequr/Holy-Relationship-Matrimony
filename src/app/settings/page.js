'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import { authAPI, userAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import toast from 'react-hot-toast';
import { FaLock, FaTrash, FaEye, FaEyeSlash, FaSpinner } from 'react-icons/fa';

export default function SettingsPage() {
  const { logout } = useAuth();

  // Password change
  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [showPw, setShowPw] = useState({ current: false, new: false, confirm: false });
  const [pwLoading, setPwLoading] = useState(false);

  // Account deletion
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error('নতুন পাসওয়ার্ড মিলছে না।');
      return;
    }
    if (passwords.newPassword.length < 6) {
      toast.error('পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।');
      return;
    }
    setPwLoading(true);
    try {
      await authAPI.changePassword({
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });
      toast.success('পাসওয়ার্ড পরিবর্তন হয়েছে।');
      setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.messageBn || err.response?.data?.message || 'সমস্যা হয়েছে।');
    } finally {
      setPwLoading(false);
    }
  };

  const handleDeactivate = async () => {
    setDeleteLoading(true);
    try {
      await userAPI.deactivateAccount();
      toast.success('অ্যাকাউন্ট নিষ্ক্রিয় করা হয়েছে।');
      logout();
    } catch (err) {
      toast.error(err.response?.data?.messageBn || 'সমস্যা হয়েছে।');
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-800">সেটিংস</h1>
          <p className="text-sm text-gray-500">অ্যাকাউন্ট পরিচালনা করুন</p>
        </div>

        {/* Change Password */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
            <FaLock className="text-[#1a5276]" size={15} /> পাসওয়ার্ড পরিবর্তন
          </h2>
          <form onSubmit={handleChangePassword} className="space-y-4">
            {[
              { key: 'currentPassword', label: 'বর্তমান পাসওয়ার্ড', showKey: 'current' },
              { key: 'newPassword', label: 'নতুন পাসওয়ার্ড', showKey: 'new' },
              { key: 'confirmPassword', label: 'পাসওয়ার্ড নিশ্চিত করুন', showKey: 'confirm' },
            ].map(({ key, label, showKey }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                <div className="relative">
                  <input
                    type={showPw[showKey] ? 'text' : 'password'}
                    value={passwords[key]}
                    onChange={(e) => setPasswords((p) => ({ ...p, [key]: e.target.value }))}
                    className="input-field pr-10"
                    placeholder="••••••••"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw((p) => ({ ...p, [showKey]: !p[showKey] }))}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPw[showKey] ? <FaEyeSlash size={15} /> : <FaEye size={15} />}
                  </button>
                </div>
              </div>
            ))}
            <button
              type="submit"
              disabled={pwLoading}
              className="btn-primary px-6 py-2.5 rounded-xl flex items-center gap-2 disabled:opacity-50"
            >
              {pwLoading && <FaSpinner className="animate-spin" size={13} />}
              পাসওয়ার্ড পরিবর্তন করুন
            </button>
          </form>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-xl border border-red-100 p-6">
          <h2 className="font-bold text-red-600 mb-2 flex items-center gap-2">
            <FaTrash size={15} /> অ্যাকাউন্ট নিষ্ক্রিয় করুন
          </h2>
          <p className="text-sm text-gray-500 mb-4">
            অ্যাকাউন্ট নিষ্ক্রিয় করলে আপনার প্রোফাইল অন্যদের কাছে দেখা যাবে না। পরবর্তীতে লগইন করে পুনরায় সক্রিয় করা যাবে।
          </p>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-5 py-2.5 bg-red-50 text-red-600 border border-red-200 rounded-xl text-sm font-semibold hover:bg-red-100 transition-colors"
            >
              অ্যাকাউন্ট নিষ্ক্রিয় করুন
            </button>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
              <p className="text-sm font-semibold text-red-700">আপনি কি নিশ্চিত?</p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeactivate}
                  disabled={deleteLoading}
                  className="px-5 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
                >
                  {deleteLoading && <FaSpinner className="animate-spin" size={12} />}
                  হ্যাঁ, নিষ্ক্রিয় করুন
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-5 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-200"
                >
                  বাতিল
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
