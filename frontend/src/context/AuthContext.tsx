import React, { createContext, useContext, useState, useEffect } from 'react';
import { Patient } from '../types';
import { authAPI } from '../services/api';

interface AuthContextType {
  patient: Patient | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patient, setPatient] = useState<Patient | null>(() => {
    const stored = localStorage.getItem('mid_patient');
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('mid_token'));

  const login = async (email: string, password: string) => {
    const res = await authAPI.login(email, password);
    const { token: t, patient: p } = res.data;
    localStorage.setItem('mid_token', t);
    localStorage.setItem('mid_patient', JSON.stringify(p));
    setToken(t);
    setPatient(p);
  };

  const logout = () => {
    localStorage.removeItem('mid_token');
    localStorage.removeItem('mid_patient');
    setToken(null);
    setPatient(null);
  };

  return (
    <AuthContext.Provider value={{ patient, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
