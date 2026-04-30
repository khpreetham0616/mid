import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { authAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserType } from '@/types';

const userTypes = [
  { value: 'patient' as UserType, label: 'Patient', icon: 'fa-user-injured', active: 'border-teal-500 bg-teal-50 text-teal-700' },
  { value: 'doctor' as UserType, label: 'Doctor', icon: 'fa-user-md', active: 'border-indigo-500 bg-indigo-50 text-indigo-700' },
  { value: 'hospital' as UserType, label: 'Hospital', icon: 'fa-hospital', active: 'border-emerald-500 bg-emerald-50 text-emerald-700' },
  { value: 'admin' as UserType, label: 'Admin', icon: 'fa-user-shield', active: 'border-rose-500 bg-rose-50 text-rose-700' },
];

export default function Login() {
  const [userType, setUserType] = useState<UserType>('patient');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await authAPI.login({ user_type: userType, email, password });
      login({ token: res.data.token, userType: res.data.user_type, user: res.data.user });
      navigate('/dashboard');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selected = userTypes.find(t => t.value === userType)!;

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="gradient-primary p-8 text-white text-center">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4 font-extrabold text-xl">M</Link>
            <h1 className="text-2xl font-extrabold">Welcome back</h1>
            <p className="text-blue-100 text-sm mt-1">Sign in to your MID account</p>
          </div>
          <div className="p-8">
            <Label className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3 block">I am a...</Label>
            <div className="grid grid-cols-4 gap-2 mb-6">
              {userTypes.map(t => (
                <button key={t.value} type="button" onClick={() => setUserType(t.value)}
                  className={`flex flex-col items-center gap-1 p-2.5 rounded-xl border-2 transition-all text-center text-xs font-semibold ${userType === t.value ? t.active + ' border-current' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                  <i className={`fas ${t.icon} text-sm`} />
                  {t.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required className="mt-1.5" />
              </div>
              <div>
                <Label htmlFor="password">Password</Label>
                <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="mt-1.5" />
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                  <i className="fas fa-exclamation-circle" /> {error}
                </div>
              )}

              <Button type="submit" className="w-full" variant="gradient" size="lg" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin mr-2" /> Signing in...</> : <><i className={`fas ${selected.icon} mr-2`} /> Sign In as {selected.label}</>}
              </Button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-6">
              Don't have an account? <Link to="/register" className="text-blue-600 font-semibold hover:underline">Create MID</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
