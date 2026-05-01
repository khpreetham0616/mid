import React, { createContext, useContext, useState, useEffect } from 'react';
import type { AuthUser, UserType, Patient, Doctor, Hospital } from '@/types';

interface AuthContextType {
  authUser: AuthUser | null;
  token: string | null;
  userType: UserType | null;
  patient: Patient | null;
  doctor: Doctor | null;
  hospital: Hospital | null;
  isLoading: boolean;
  login: (data: AuthUser) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  authUser: null, token: null, userType: null,
  patient: null, doctor: null, hospital: null,
  isLoading: true, login: () => {}, logout: () => {}, isAuthenticated: false,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [authUser, setAuthUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem('mid_auth');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.token && parsed?.userType) {
          setAuthUser(parsed);
        } else {
          sessionStorage.removeItem('mid_auth');
        }
      } catch { sessionStorage.removeItem('mid_auth'); }
    }
    setIsLoading(false);
  }, []);

  const login = (data: AuthUser) => {
    setAuthUser(data);
    sessionStorage.setItem('mid_auth', JSON.stringify(data));
  };

  const logout = () => {
    setAuthUser(null);
    sessionStorage.removeItem('mid_auth');
  };

  return (
    <AuthContext.Provider value={{
      authUser,
      token: authUser?.token ?? null,
      userType: authUser?.userType ?? null,
      patient: authUser?.userType === 'patient' ? (authUser.user as Patient) : null,
      doctor: authUser?.userType === 'doctor' ? (authUser.user as Doctor) : null,
      hospital: authUser?.userType === 'hospital' ? (authUser.user as Hospital) : null,
      isLoading,
      login,
      logout,
      isAuthenticated: !!authUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
