'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { authService, CandidateSignupData, EmployerSignupData, ApiError } from '@/lib/services/auth-service';
import { tokenStorage, JWTPayload } from '@/lib/storage/token-storage';

export interface User {
  id: string;
  email: string;
  role: 'CANDIDATE' | 'EMPLOYER';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  registerCandidate: (data: CandidateSignupData) => Promise<void>;
  registerEmployer: (data: EmployerSignupData) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = () => {
    try {
      const payload = tokenStorage.getDecodedToken();
      if (payload) {
        setUser({
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        });
      }
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[AuthContext] Failed to initialize auth:', error);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<void> => {
    setIsLoading(true);
    try {
      const response = await authService.login({ email, password });
      tokenStorage.setToken(response.accessToken);
      
      const payload = tokenStorage.decodeToken(response.accessToken);
      if (payload) {
        setUser({
          id: payload.userId,
          email: payload.email,
          role: payload.role,
        });
      }
    } catch (error) {
      tokenStorage.removeToken();
      setUser(null);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    tokenStorage.removeToken();
    setUser(null);
  };

  const registerCandidate = async (data: CandidateSignupData): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.registerCandidate(data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const registerEmployer = async (data: EmployerSignupData): Promise<void> => {
    setIsLoading(true);
    try {
      await authService.registerEmployer(data);
    } catch (error) {
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    registerCandidate,
    registerEmployer,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export type { ApiError };

