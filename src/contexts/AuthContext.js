'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import api, { saveSession, clearSession } from '@/lib/api';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const loadUser = useCallback(async () => {
    const token = Cookies.get('token');
    if (!token && !Cookies.get('refreshToken')) {
      setLoading(false);
      return;
    }

    // Attach stored token immediately so the /auth/me request is authenticated
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
      } else {
        throw new Error('Failed to load user');
      }
    } catch (error) {
      if ([401, 403].includes(error.response?.status)) {
        clearSession();
        setUser(null);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    if (data.success) {
      saveSession(data.token, data.refreshToken);
      setUser(data.user);
      toast.success('লগইন সফল হয়েছে!');

      if (data.user.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/dashboard');
      }
      return data;
    }
  };

  const register = async (userData) => {
    const { data } = await api.post('/auth/register', userData);
    if (data.success) {
      // Account is NOT created yet — redirect to OTP verification.
      // The actual account creation happens after OTP is verified.
      toast.success('OTP পাঠানো হয়েছে। ইমেইল যাচাই করুন।');
      router.push(`/verify-email?email=${encodeURIComponent(userData.email)}`);
      return data;
    }
  };

  // Called by the verify-email page after successful OTP verification
  const completeRegistration = (token, userData, refreshToken) => {
    saveSession(token, refreshToken);
    setUser(userData);
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore errors — always clear local state
    } finally {
      clearSession();
      setUser(null);
      router.push('/');
      toast.success('লগআউট সফল হয়েছে।');
    }
  };

  const updateUser = (updatedUser) => {
    setUser((prev) => prev ? ({ ...prev, ...(typeof updatedUser === 'function' ? updatedUser(prev) : updatedUser) }) : prev);
  };

  const refreshUser = async () => {
    await loadUser();
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        completeRegistration,
        logout,
        updateUser,
        refreshUser,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
        isMale: user?.gender === 'male',
        isFemale: user?.gender === 'female',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
