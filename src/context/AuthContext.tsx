'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthState } from '../types/index';
import {
  apiLogin,
  apiRegister,
  apiGetMe,
  apiLogout,
  LoginPayload,
  RegisterPayload,
} from '../services/authApi';
import { useToast } from './ToastContext';

interface AuthContextType extends AuthState {
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openAuthModal: (mode?: 'login' | 'register') => void;
  closeAuthModal: () => void;
}

const AUTH_TOKEN_KEY = 'techtor_auth_token_v1';
const AUTH_USER_KEY = 'techtor_auth_user_v1';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();

  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  // Verify session with server on initial mount after client hydration
  useEffect(() => {
    async function checkAuth() {
      try {
        const savedToken = typeof window !== 'undefined' ? localStorage.getItem(AUTH_TOKEN_KEY) : null;
        const savedUserStr = typeof window !== 'undefined' ? localStorage.getItem(AUTH_USER_KEY) : null;
        const savedUser = savedUserStr ? JSON.parse(savedUserStr) : null;

        if (savedToken) {
          setToken(savedToken);
          if (savedUser) {
            setUser(savedUser);
          }

          try {
            const res = await apiGetMe(savedToken);
            setUser(res.user);
            localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
          } catch (err: any) {
            console.warn('Session verification failed, resetting token:', err);
            setToken(null);
            setUser(null);
            localStorage.removeItem(AUTH_TOKEN_KEY);
            localStorage.removeItem(AUTH_USER_KEY);
          }
        }
      } catch (err) {
        console.warn('Failed to restore session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();
  }, []);

  const login = async (payload: LoginPayload) => {
    setIsLoading(true);
    try {
      const res = await apiLogin(payload);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      setIsAuthModalOpen(false);
      toast.success(
        `Welcome back, ${res.user.name}!`,
        `Logged in successfully as ${res.user.role}.`
      );
    } catch (err: any) {
      const msg = err.message || 'Invalid email or password.';
      toast.error('Sign In Failed', msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: RegisterPayload) => {
    setIsLoading(true);
    try {
      const res = await apiRegister(payload);
      setToken(res.token);
      setUser(res.user);
      localStorage.setItem(AUTH_TOKEN_KEY, res.token);
      localStorage.setItem(AUTH_USER_KEY, JSON.stringify(res.user));
      setIsAuthModalOpen(false);
      toast.success(
        `Account Created Successfully!`,
        `Welcome to Techtor, ${res.user.name} (${res.user.role}).`
      );
    } catch (err: any) {
      const msg = err.message || 'Registration could not be completed.';
      toast.error('Registration Failed', msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    const userName = user?.name;
    try {
      await apiLogout(token);
    } catch {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      localStorage.removeItem(AUTH_USER_KEY);
      setIsLoading(false);
      toast.info('Signed Out', userName ? `Goodbye, ${userName}. See you next time!` : 'You have signed out securely.');
    }
  };

  const openAuthModal = (mode: 'login' | 'register' = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const contextValue = React.useMemo(
    () => ({
      user,
      token,
      isAuthenticated: !!user && !!token,
      isLoading,
      login,
      register,
      logout,
      isAuthModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal,
    }),
    [user, token, isLoading, isAuthModalOpen, authModalMode]
  );

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
