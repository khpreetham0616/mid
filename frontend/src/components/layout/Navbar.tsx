import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import type { Patient, Doctor, Hospital } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';

function getMID(user: Patient | Doctor | Hospital | { email: string; name: string; mid: string } | null) {
  if (!user) return '';
  return (user as { mid: string }).mid ?? '';
}

function getDisplayName(user: Patient | Doctor | Hospital | { email: string; name: string; mid: string } | null, userType: string | null) {
  if (!user) return '';
  if (userType === 'hospital') return (user as Hospital).name ?? '';
  if (userType === 'admin') return (user as { name: string }).name ?? 'Admin';
  return `${(user as Patient).first_name ?? ''} ${(user as Patient).last_name ?? ''}`.trim();
}

function getInitials(name: string) {
  return name.split(' ').filter(Boolean).map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'M';
}

const userTypeConfig = {
  patient: { label: 'Patient', avatarClass: 'bg-teal-100 text-teal-700', badgeClass: 'bg-teal-100 text-teal-700 border-teal-200', icon: 'fa-user-injured' },
  doctor: { label: 'Doctor', avatarClass: 'bg-sky-100 text-sky-700', badgeClass: 'bg-sky-100 text-sky-700 border-sky-200', icon: 'fa-user-md' },
  hospital: { label: 'Hospital', avatarClass: 'bg-emerald-100 text-emerald-700', badgeClass: 'bg-emerald-100 text-emerald-700 border-emerald-200', icon: 'fa-hospital' },
  admin: { label: 'Admin', avatarClass: 'bg-violet-100 text-violet-700', badgeClass: 'bg-violet-100 text-violet-700 border-violet-200', icon: 'fa-user-shield' },
};

export default function Navbar() {
  const { isAuthenticated, userType, authUser, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const displayName = getDisplayName(authUser?.user ?? null, userType);
  const mid = getMID(authUser?.user ?? null);
  const config = userType ? userTypeConfig[userType as keyof typeof userTypeConfig] : null;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const dashboardLinks = {
    patient: [
      { to: '/patient/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
      { to: '/patient/appointments', icon: 'fa-calendar-check', label: 'Appointments' },
      { to: '/patient/history', icon: 'fa-file-medical', label: 'Medical History' },
      { to: '/doctors', icon: 'fa-stethoscope', label: 'Find Doctors' },
      { to: '/symptom-checker', icon: 'fa-diagnoses', label: 'Symptom Checker' },
    ],
    doctor: [
      { to: '/doctor/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
      { to: '/doctor/appointments', icon: 'fa-calendar-alt', label: 'Appointments' },
      { to: '/doctor/patients', icon: 'fa-search', label: 'Patient Lookup' },
    ],
    hospital: [
      { to: '/hospital/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
      { to: '/hospital/doctors', icon: 'fa-user-md', label: 'Manage Doctors' },
    ],
    admin: [
      { to: '/admin/dashboard', icon: 'fa-th-large', label: 'Dashboard' },
      { to: '/doctors', icon: 'fa-stethoscope', label: 'Doctors' },
      { to: '/hospitals', icon: 'fa-hospital', label: 'Hospitals' },
    ],
  };

  const links = userType ? (dashboardLinks[userType as keyof typeof dashboardLinks] ?? []) : [];

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 shadow-sm">
      <div className="container mx-auto px-4 flex h-16 items-center justify-between">
        {/* Logo */}
        <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-sky-500 to-teal-600 text-white text-sm font-bold shadow">M</div>
          <span className="text-xl font-bold">
            <span className="text-sky-600">MID</span>
            <span className="text-slate-400 text-sm font-normal ml-1">System</span>
          </span>
        </Link>

        {/* Desktop nav links */}
        {isAuthenticated ? (
          <div className="hidden md:flex items-center gap-1">
            {links.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors"
              >
                <i className={`fas ${link.icon} text-xs`} />
                {link.label}
              </Link>
            ))}
          </div>
        ) : (
          <div className="hidden md:flex items-center gap-1">
            {[
              { to: '/symptom-checker', label: 'Symptom Checker' },
              { to: '/medicines', label: 'Medicines' },
            ].map(link => (
              <Link key={link.to} to={link.to} className="px-3 py-2 rounded-lg text-sm text-slate-600 hover:text-sky-600 hover:bg-sky-50 transition-colors">
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Right side */}
        <div className="flex items-center gap-3">
          {isAuthenticated && authUser ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 rounded-xl px-3 py-2 hover:bg-slate-100 transition-colors"
              >
                <Avatar className="h-8 w-8">
                  <AvatarFallback className={config?.avatarClass ?? 'bg-sky-100 text-sky-700'}>
                    {getInitials(displayName)}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:block text-left">
                  <p className="text-sm font-medium text-slate-800 leading-none">{displayName || 'User'}</p>
                  <p className="text-xs text-slate-400 mt-0.5">{mid}</p>
                </div>
                {config && (
                  <span className={`hidden md:inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                    <i className={`fas ${config.icon} text-[10px]`} />
                    {config.label}
                  </span>
                )}
                <i className="fas fa-chevron-down text-xs text-slate-400 hidden md:block" />
              </button>

              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -5 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-full mt-1 w-56 rounded-xl border bg-white shadow-xl z-50"
                    onMouseLeave={() => setMenuOpen(false)}
                  >
                    <div className="p-3 border-b">
                      <p className="font-semibold text-sm text-slate-800">{displayName || 'User'}</p>
                      <p className="text-xs text-slate-400">{mid}</p>
                      {config && (
                        <span className={`inline-flex items-center gap-1 mt-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${config.badgeClass}`}>
                          <i className={`fas ${config.icon} text-[10px]`} />
                          {config.label}
                        </span>
                      )}
                    </div>
                    <div className="p-1">
                      <Link
                        to={`/${userType}/profile`}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                        onClick={() => setMenuOpen(false)}
                      >
                        <i className="fas fa-user-circle w-4" /> Profile
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors"
                      >
                        <i className="fas fa-sign-out-alt w-4" /> Sign Out
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm" className="text-slate-600 hover:text-sky-600">Sign In</Button>
              </Link>
              <Link to="/register">
                <Button size="sm" className="gradient-primary text-white">Get Started</Button>
              </Link>
            </div>
          )}

          {/* Mobile menu toggle */}
          <button className="md:hidden p-2 rounded-lg hover:bg-slate-100" onClick={() => setMenuOpen(!menuOpen)}>
            <i className={`fas ${menuOpen ? 'fa-times' : 'fa-bars'} text-slate-600`} />
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t bg-white"
          >
            <div className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {isAuthenticated ? links.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-sky-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className={`fas ${link.icon} text-xs w-4`} />
                  {link.label}
                </Link>
              )) : [
                { to: '/symptom-checker', label: 'Symptom Checker', icon: 'fa-diagnoses' },
                { to: '/medicines', label: 'Medicines', icon: 'fa-pills' },
              ].map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-slate-600 hover:bg-sky-50"
                  onClick={() => setMenuOpen(false)}
                >
                  <i className={`fas ${link.icon} text-xs w-4`} />
                  {link.label}
                </Link>
              ))}
              {isAuthenticated && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50"
                >
                  <i className="fas fa-sign-out-alt w-4" /> Sign Out
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
