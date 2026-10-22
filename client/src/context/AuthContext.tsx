import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest } from '../services/api';

export interface AuthUser {
  id: string;
  name?: string;
  fullName?: string;
  email?: string;
  rollNumber?: string;
  schoolName?: string;
  standard?: string;
  status?: string;
  mustChangePassword?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  role: 'STUDENT' | 'FACULTY' | null;
  loading: boolean;
  loginStudent: (roll: string, pass: string) => Promise<void>;
  loginFaculty: (email: string, pass: string) => Promise<{ mustChangePassword?: boolean }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [role, setRole] = useState<'STUDENT' | 'FACULTY' | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshUser = async () => {
    try {
      const res = await apiRequest('/api/auth/me');
      if (res.success && res.user) {
        setUser(res.user);
        setRole(res.role);
      } else {
        setUser(null);
        setRole(null);
      }
    } catch {
      setUser(null);
      setRole(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const loginStudent = async (rollNumber: string, pass: string) => {
    const res = await apiRequest('/api/auth/student/login', {
      method: 'POST',
      body: JSON.stringify({ rollNumber, password: pass }),
    });
    if (res.success) {
      if (res.data?.token) {
        localStorage.setItem('cyberhero_token', res.data.token);
      }
      setUser(res.data.studentData);
      setRole('STUDENT');
    }
  };

  const loginFaculty = async (email: string, pass: string) => {
    const res = await apiRequest('/api/auth/faculty/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    if (res.success) {
      if (res.data?.token) {
        localStorage.setItem('cyberhero_token', res.data.token);
      }
      setUser(res.data.faculty);
      setRole('FACULTY');
      return { mustChangePassword: res.data.faculty.mustChangePassword };
    }
    return {};
  };

  const logout = async () => {
    try {
      await apiRequest('/api/auth/logout', { method: 'POST' });
    } finally {
      localStorage.removeItem('cyberhero_token');
      setUser(null);
      setRole(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        loading,
        loginStudent,
        loginFaculty,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
};
