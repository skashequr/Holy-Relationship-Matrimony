import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

const normalizeApiUrl = (url) => url.replace(/\/+$|\/+$/g, '');
const rawApiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
const normalizedApiUrl = normalizeApiUrl(rawApiUrl).endsWith('/api')
  ? normalizeApiUrl(rawApiUrl)
  : `${normalizeApiUrl(rawApiUrl)}/api`;

if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
  throw new Error('NEXT_PUBLIC_API_URL must be set in production');
}

const api = axios.create({
  baseURL: normalizedApiUrl,
  timeout: 30000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const cookieOptions = {
  expires: 7,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
};

export const saveSession = (token, refreshToken) => {
  Cookies.set('token', token, cookieOptions);
  if (refreshToken) Cookies.set('refreshToken', refreshToken, cookieOptions);
  else Cookies.remove('refreshToken', { path: '/' });
  api.defaults.headers.common.Authorization = `Bearer ${token}`;
};

export const clearSession = () => {
  Cookies.remove('token', { path: '/' });
  Cookies.remove('refreshToken', { path: '/' });
  delete api.defaults.headers.common.Authorization;
};

let refreshPromise = null;
const publicAuthRequest = (url = '') =>
  /\/auth\/(login|register|verify-otp|send-otp|forgot-password|reset-password|refresh-token)(?:\?|$)/.test(url);

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
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && originalRequest && !publicAuthRequest(originalRequest.url)) {
      const refreshToken = Cookies.get('refreshToken');
      if (!originalRequest._retry && refreshToken) {
        originalRequest._retry = true;
        try {
          // All concurrent expired requests share one refresh operation.
          if (!refreshPromise) {
            refreshPromise = axios.post(`${normalizedApiUrl}/auth/refresh-token`, { refreshToken }, {
              timeout: 30000,
              withCredentials: true,
            }).then(({ data }) => {
              if (!data.success || !data.token) throw new Error('Invalid refresh response');
              Cookies.set('token', data.token, cookieOptions);
              api.defaults.headers.common.Authorization = `Bearer ${data.token}`;
              return data.token;
            }).finally(() => { refreshPromise = null; });
          }
          const token = await refreshPromise;
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        } catch (refreshError) {
          // Keep credentials on timeouts, offline connections and server failures.
          if (![401, 403].includes(refreshError.response?.status)) return Promise.reject(refreshError);
          clearSession();
          error = refreshError;
        }
      }
      clearSession();
      if (typeof window !== 'undefined') {
        const path = window.location.pathname;
        const publicPaths = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];
        if (!publicPaths.some((p) => path.startsWith(p))) {
          window.location.href = `/login?redirect=${encodeURIComponent(path)}`;
        }
      }
    }
    const message =
      error.response?.data?.messageBn ||
      error.response?.data?.message ||
      'কিছু একটা সমস্যা হয়েছে।';

    if (error.response?.status === 403) {
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
  refreshToken: () => api.post('/auth/refresh-token', { refreshToken: Cookies.get('refreshToken') }),
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
  getDashboard: () => api.get('/match/dashboard'),
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
  submitFaceVerification: (formData) =>
    api.post('/user/face-verify', formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};

// Public settings API
export const settingsAPI = {
  getTracking: () => api.get('/settings/tracking'),
};

// Admin API
export const adminAPI = {
  getAnalytics: () => api.get('/admin/analytics'),
  getUsers: (params) => api.get('/admin/users', { params }),
  createUser: (data) => api.post('/admin/users', data),
  createUserBiodata: (id, data) => api.post(`/admin/users/${id}/biodata`, data),
  sendLoginEmail: (id) => api.post(`/admin/users/${id}/login-email`),
  banUser: (id, reason) => api.put(`/admin/users/${id}/ban`, { reason }),
  unbanUser: (id) => api.put(`/admin/users/${id}/unban`),
  verifyUser: (id) => api.put(`/admin/users/${id}/verify`),
  getBiodatas: (params) => api.get('/admin/biodatas', { params }),
  getBiodata: (id) => api.get(`/admin/biodatas/${id}`),
  approveBiodata: (id) => api.put(`/admin/biodatas/${id}/approve`),
  rejectBiodata: (id, reason) => api.put(`/admin/biodatas/${id}/reject`, { reason }),
  getPayments: (params) => api.get('/admin/payments', { params }),
  approvePayment: (id) => api.patch(`/admin/payments/${id}/approve`),
  rejectPayment: (id, reason) => api.patch(`/admin/payments/${id}/reject`, { reason }),
  trackConversion: (id) => api.patch(`/admin/payments/${id}/track-conversion`),
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
  // Notifications
  sendBroadcastNotification: (data) => api.post('/admin/notifications/broadcast', data),
  // Email campaigns
  sendNoBiodataEmail: () => api.post('/admin/email/no-biodata'),
  sendCustomEmail: (data) => api.post('/admin/email/custom', data),
  // Settings
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  // Referral management
  getReferrals: (params) => api.get('/admin/referrals', { params }),
  getReferralLeaderboard: () => api.get('/admin/referrals/leaderboard'),
  // Ruqyah management
  getRuqyahSlots: () => api.get('/admin/ruqyah/slots'),
  createRuqyahSlot: (data) => api.post('/admin/ruqyah/slots', data),
  deleteRuqyahSlot: (id) => api.delete(`/admin/ruqyah/slots/${id}`),
  toggleRuqyahSlot: (id) => api.patch(`/admin/ruqyah/slots/${id}/toggle`),
  getRuqyahBookings: (params) => api.get('/admin/ruqyah/bookings', { params }),
  confirmRuqyahBooking: (id) => api.patch(`/admin/ruqyah/bookings/${id}/confirm`),
  cancelRuqyahBooking: (id) => api.patch(`/admin/ruqyah/bookings/${id}/cancel`),
  updateRuqyahPayment: (id, paymentStatus) => api.patch(`/admin/ruqyah/bookings/${id}/payment`, { paymentStatus }),
  addRuqyahNote: (id, adminNote) => api.patch(`/admin/ruqyah/bookings/${id}/note`, { adminNote }),
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
  markRead: (id, messageId) => api.patch(`/messages/${id}/read`, { messageId }),
  getConversations: (params) => api.get('/messages/conversations', { params }),
  getMessages: (conversationId, params) => api.get(`/messages/${conversationId}`, { params }),
  sendMessage: (data) => api.post('/messages', data),
  startConversation: (userId) => api.post('/messages/start', { userId }),
};

// Referral API
export const referralAPI = {
  getMe: () => api.get('/referral/me'),
  getList: () => api.get('/referral/list'),
  checkUnlock: (biodataId) => api.get(`/referral/check/${biodataId}`),
  unlock: (biodataId) => api.post(`/referral/unlock/${biodataId}`),
};

// Ruqyah API
export const counselingAPI = {
  types: () => api.get('/counseling/types'),
  book: (data) => api.post('/counseling/book', data),
  myBookings: () => api.get('/counseling/my-bookings'),
  adminBookings: () => api.get('/counseling/admin/bookings'),
  update: (id, status) => api.patch(`/counseling/admin/bookings/${id}`, { status }),
};

export const faceVerificationAPI = {
  list: () => api.get('/face-verification'),
  photo: (id) => api.get(`/face-verification/${id}/photo`, { responseType: 'blob' }),
  review: (id, status) => api.patch(`/face-verification/${id}`, { status }),
};

export const ruqyahAPI = {
  getSlots: () => api.get('/ruqyah/slots'),
  book: (data) => api.post('/ruqyah/book', data),
  getMyBookings: () => api.get('/ruqyah/my-bookings'),
};

// Review API
export const reviewAPI = {
  submit: (data) => api.post('/reviews', data),
  getPublic: (params) => api.get('/reviews/public', { params }),
  getMy: () => api.get('/reviews/my'),
};
