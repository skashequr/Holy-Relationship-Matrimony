import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const apiBaseURL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL must be set in production');
}

const api = axios.create({
  baseURL: apiBaseURL,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.messageBn ||
      error.response?.data?.message ||
      'কিছু একটা সমস্যা হয়েছে।';

    if (error.response?.status === 401) {
      Cookies.remove('token');
      delete api.defaults.headers.common['Authorization'];
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const publicPaths = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
        const isPublic = publicPaths.some((p) => path.startsWith(p));
        if (!isPublic) {
          window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
        }
      }
    } else if (error.response?.status === 403) {
      // Show backend messageBn if available, otherwise generic message
      const forbidMsg = message !== 'কিছু একটা সমস্যা হয়েছে।' ? message : 'আপনার এই কাজের অনুমতি নেই।';
      toast.error(forbidMsg);
    } else if (error.response?.status === 400) {
      // Show backend messageBn/message for 400 errors — components can also handle individually
      if (message && message !== 'কিছু একটা সমস্যা হয়েছে।') {
        toast.error(message);
      }
    } else if (error.response?.status === 429) {
      toast.error('অনেক বেশি অনুরোধ। একটু পরে চেষ্টা করুন।');
    } else if (error.response?.status >= 500) {
      toast.error('সার্ভারে সমস্যা হয়েছে। একটু পরে চেষ্টা করুন।');
    }

    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh-token'),
  getMe: () => api.get('/auth/me'),
  sendOTP: (data) => api.post('/auth/send-otp', data),
  verifyOTP: (data) => api.post('/auth/verify-otp', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Biodata API
export const biodataAPI = {
  create: (data) => api.post('/biodata', data),
  getMy: () => api.get('/biodata/me'),
  update: (data) => api.put('/biodata', data),
  getById: (id) => api.get(`/biodata/${id}`),
  uploadPhoto: (formData) =>
    api.post('/biodata/upload-photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
  toggleShortlist: (id) => api.post(`/biodata/${id}/shortlist`),
  markMarried: (marriedVia) => api.patch('/biodata/me/married', { marriedVia }),
  getSuggested: () => api.get('/biodata/suggested'),
  downloadPDF: (id) => api.get(`/biodata/${id}/download`, { responseType: 'blob' }),
};

// Search API
export const searchAPI = {
  search: (params) => api.get('/search', { params }),
  getDistricts: () => api.get('/search/meta/districts'),
};

// Match API
export const matchAPI = {
  getRecommended: (params) => api.get('/match/recommended', { params }),
  getShortlist: (params) => api.get('/match/shortlist', { params }),
  getNewProfiles: () => api.get('/match/new-profiles'),
  getStats: () => api.get('/match/stats'),
  getCompleteness: () => api.get('/match/profile-completeness'),
};

// Payment API
export const paymentAPI = {
  initiate: (data) => api.post('/payment/initiate', data),
  verifyBkash: (data) => api.post('/payment/verify-bkash', data),
  manualVerify: (data) => api.post('/payment/manual-verify', data),
  getHistory: (params) => api.get('/payment/history', { params }),
  getPricing: () => api.get('/payment/pricing'),
};

// User API
export const userAPI = {
  updateProfile: (data) => api.put('/user/profile', data),
  reportUser: (data) => api.post('/user/report', data),
  getNotifications: (params) => api.get('/user/notifications', { params }),
  markAllRead: () => api.put('/user/notifications/read-all'),
  markRead: (id) => api.put(`/user/notifications/${id}/read`),
  deactivateAccount: () => api.delete('/user/account'),
};

// Admin API
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
  getBiodatas: (params) => api.get('/admin/biodatas', { params }),
  approveBiodata: (id) => api.put(`/admin/biodatas/${id}/approve`),
  rejectBiodata: (id, reason) => api.put(`/admin/biodatas/${id}/reject`, { reason }),
  getPayments: (params) => api.get('/admin/payments', { params }),
  approvePayment: (id) => api.patch(`/admin/payments/${id}/approve`),
  rejectPayment: (id, reason) => api.patch(`/admin/payments/${id}/reject`, { reason }),
  exportPayments: () => api.get('/admin/purchases/export', { responseType: 'blob' }),
  getReports: (params) => api.get('/admin/reports', { params }),
  resolveReport: (id, data) => api.put(`/admin/reports/${id}/resolve`, data),
  // Premium
  getPremiumMembers: (params) => api.get('/admin/premium-members', { params }),
  setPremium: (id, data) => api.patch(`/admin/users/${id}/set-premium`, data),
  revokePremium: (id) => api.patch(`/admin/users/${id}/revoke-premium`),
  // Married
  getMarried: (params) => api.get('/admin/married', { params }),
  exportMarried: () => api.get('/admin/married/export', { responseType: 'blob' }),
  // Reviews
  getReviews: (params) => api.get('/admin/reviews', { params }),
  approveReview: (id) => api.patch(`/admin/reviews/${id}/approve`),
  deleteReview: (id) => api.delete(`/admin/reviews/${id}`),
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

// Interest API
export const interestAPI = {
  send: (data) => api.post('/interests', data),
  getSent: (params) => api.get('/interests/sent', { params }),
  getReceived: (params) => api.get('/interests/received', { params }),
  respond: (id, status) => api.patch(`/interests/${id}`, { status }),
  withdraw: (id) => api.delete(`/interests/${id}`),
};

// Message API
export const messageAPI = {
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getMessages: (conversationId, params) => api.get(`/messages/${conversationId}`, { params }),
  sendMessage: (data) => api.post('/messages', data),
  startConversation: (userId) => api.post('/messages/start', { userId }),
};

// Review API
export const reviewAPI = {
  submit: (data) => api.post('/reviews', data),
  getPublic: (params) => api.get('/reviews/public', { params }),
  getMy: () => api.get('/reviews/my'),
};
