import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { authAPI } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { UserType } from '@/types';

const userTypes = [
  { value: 'patient' as UserType, label: 'Patient', icon: 'fa-user-injured', color: 'from-teal-500 to-teal-600', active: 'border-teal-500 bg-teal-50 text-teal-700', desc: 'Book appointments & track health' },
  { value: 'doctor' as UserType, label: 'Doctor', icon: 'fa-user-md', color: 'from-indigo-500 to-indigo-600', active: 'border-indigo-500 bg-indigo-50 text-indigo-700', desc: 'Manage patients & write prescriptions' },
  { value: 'hospital' as UserType, label: 'Hospital', icon: 'fa-hospital', color: 'from-emerald-500 to-emerald-600', active: 'border-emerald-500 bg-emerald-50 text-emerald-700', desc: 'Manage facility & doctors' },
];

type FormData = Record<string, string | number>;

export default function Register() {
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>('patient');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState<FormData>({});

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((form.password as string)?.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const payload: Record<string, unknown> = { ...form, user_type: userType };
      // Convert numeric fields from string to number (e.target.value is always string)
      if (payload.experience_years !== undefined && payload.experience_years !== '')
        payload.experience_years = parseInt(payload.experience_years as string, 10) || 0;
      else
        payload.experience_years = 0;
      if (payload.consult_fee !== undefined && payload.consult_fee !== '')
        payload.consult_fee = parseFloat(payload.consult_fee as string) || 0;
      else
        payload.consult_fee = 0;
      if (payload.beds !== undefined && payload.beds !== '')
        payload.beds = parseInt(payload.beds as string, 10) || 0;
      else
        payload.beds = 0;
      await authAPI.register(payload);
      navigate('/login', { state: { registered: true } });
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const selected = userTypes.find(t => t.value === userType)!;

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center p-4 py-12">
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-lg">
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
          <div className="gradient-primary p-8 text-white text-center">
            <Link to="/" className="inline-flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl mb-4 font-extrabold text-xl">M</Link>
            <h1 className="text-2xl font-extrabold">Create your MID</h1>
            <p className="text-blue-100 text-sm mt-1">Your universal medical identity awaits</p>
          </div>

          <div className="p-8">
            {/* Step 1: Choose type */}
            {step === 1 && (
              <div>
                <p className="text-sm font-semibold text-slate-700 mb-4">I am registering as...</p>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {userTypes.map(t => (
                    <button key={t.value} type="button" onClick={() => setUserType(t.value)}
                      className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all ${userType === t.value ? t.active + ' border-current shadow-sm' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
                      <i className={`fas ${t.icon} text-xl`} />
                      <span className="text-sm font-bold">{t.label}</span>
                      <span className="text-xs text-center leading-tight opacity-70">{t.desc}</span>
                    </button>
                  ))}
                </div>
                <Button className="w-full" variant="gradient" size="lg" onClick={() => setStep(2)}>
                  Continue as {selected.label} <i className="fas fa-arrow-right ml-2" />
                </Button>
              </div>
            )}

            {/* Step 2: Fill details */}
            {step === 2 && (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="flex items-center gap-2 mb-2">
                  <button type="button" onClick={() => setStep(1)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 text-sm">
                    <i className="fas fa-arrow-left" />
                  </button>
                  <span className="text-sm font-semibold text-slate-600">
                    <i className={`fas ${selected.icon} mr-1.5`} /> Registering as {selected.label}
                  </span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div key={userType} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                    {/* Common: email + password */}
                    {userType !== 'hospital' && (
                      <div className="grid grid-cols-2 gap-3">
                        <div><Label>First Name *</Label><Input className="mt-1" required placeholder="John" onChange={set('first_name')} /></div>
                        <div><Label>Last Name *</Label><Input className="mt-1" required placeholder="Doe" onChange={set('last_name')} /></div>
                      </div>
                    )}
                    {userType === 'hospital' && (
                      <div><Label>Hospital Name *</Label><Input className="mt-1" required placeholder="City General Hospital" onChange={set('name')} /></div>
                    )}

                    <div><Label>Email *</Label><Input className="mt-1" type="email" required placeholder="you@example.com" onChange={set('email')} /></div>
                    <div><Label>Phone *</Label><Input className="mt-1" required placeholder="+91 98765 43210" onChange={set('phone')} /></div>
                    <div>
                      <Label>Password * <span className="text-xs text-slate-400 font-normal">(min 8 characters)</span></Label>
                      <Input className="mt-1" type="password" required minLength={8} placeholder="Min 8 characters" onChange={set('password')} />
                    </div>

                    {/* Patient-specific */}
                    {userType === 'patient' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Gender</Label>
                            <select className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={set('gender')}>
                              <option value="">Select</option>
                              <option>Male</option><option>Female</option><option>Other</option>
                            </select>
                          </div>
                          <div>
                            <Label>Blood Group</Label>
                            <select className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={set('blood_group')}>
                              <option value="">Select</option>
                              {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                            </select>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>City</Label><Input className="mt-1" placeholder="Mumbai" onChange={set('city')} /></div>
                          <div><Label>Address</Label><Input className="mt-1" placeholder="123 Main St" onChange={set('address')} /></div>
                        </div>
                        <div><Label>Known Allergies</Label><Input className="mt-1" placeholder="Penicillin, Pollen..." onChange={set('allergies')} /></div>
                      </>
                    )}

                    {/* Doctor-specific */}
                    {userType === 'doctor' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Specialization *</Label><Input className="mt-1" required placeholder="Cardiologist" onChange={set('specialization')} /></div>
                          <div><Label>Qualification</Label><Input className="mt-1" placeholder="MBBS, MD" onChange={set('qualification')} /></div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>Experience (years)</Label><Input className="mt-1" type="number" min="0" placeholder="5" onChange={set('experience_years')} /></div>
                          <div><Label>Consult Fee (₹)</Label><Input className="mt-1" type="number" min="0" placeholder="500" onChange={set('consult_fee')} /></div>
                        </div>
                        <div><Label>City</Label><Input className="mt-1" placeholder="Mumbai" onChange={set('city')} /></div>
                      </>
                    )}

                    {/* Hospital-specific */}
                    {userType === 'hospital' && (
                      <>
                        <div className="grid grid-cols-2 gap-3">
                          <div><Label>City *</Label><Input className="mt-1" required placeholder="Mumbai" onChange={set('city')} /></div>
                          <div><Label>State</Label><Input className="mt-1" placeholder="Maharashtra" onChange={set('state')} /></div>
                        </div>
                        <div><Label>Address *</Label><Input className="mt-1" required placeholder="123 Hospital Rd" onChange={set('address')} /></div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <Label>Hospital Type</Label>
                            <select className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" onChange={set('type')}>
                              <option value="">General</option>
                              <option>General</option><option>Specialty</option><option>Clinic</option><option>Multispecialty</option>
                            </select>
                          </div>
                          <div><Label>Total Beds</Label><Input className="mt-1" type="number" min="0" placeholder="100" onChange={set('beds')} /></div>
                        </div>
                      </>
                    )}
                  </motion.div>
                </AnimatePresence>

                {error && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm">
                    <i className="fas fa-exclamation-circle" /> {error}
                  </div>
                )}

                <Button type="submit" className="w-full" variant="gradient" size="lg" disabled={loading}>
                  {loading ? <><i className="fas fa-spinner fa-spin mr-2" /> Creating your MID...</> : <><i className="fas fa-id-card mr-2" /> Create {selected.label} MID</>}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-slate-500 mt-6">
              Already have an account? <Link to="/login" className="text-blue-600 font-semibold hover:underline">Sign In</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
