import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import type { UserType } from '@/types';

import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Doctors from '@/pages/Doctors';
import DoctorDetail from '@/pages/DoctorDetail';
import Hospitals from '@/pages/Hospitals';
import HospitalDetail from '@/pages/HospitalDetail';
import SymptomChecker from '@/pages/SymptomChecker';
import Medicines from '@/pages/Medicines';

import PatientDashboard from '@/pages/patient/Dashboard';
import PatientProfile from '@/pages/patient/Profile';
import PatientHistory from '@/pages/patient/History';
import PatientAppointments from '@/pages/patient/Appointments';
import BookAppointment from '@/pages/patient/BookAppointment';

import DoctorDashboard from '@/pages/doctor/Dashboard';
import DoctorProfile from '@/pages/doctor/Profile';
import PatientLookup from '@/pages/doctor/PatientLookup';
import DoctorAppointments from '@/pages/doctor/Appointments';

import HospitalDashboard from '@/pages/hospital/Dashboard';
import HospitalProfile from '@/pages/hospital/Profile';
import ManageDoctors from '@/pages/hospital/ManageDoctors';

import AdminDashboard from '@/pages/admin/Dashboard';

function ProtectedRoute({
  children,
  allowedTypes,
}: {
  children: React.ReactNode;
  allowedTypes?: UserType[];
}) {
  const { isAuthenticated, userType, isLoading } = useAuth();
  if (isLoading) return <div className="flex h-screen items-center justify-center"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedTypes && userType && !allowedTypes.includes(userType)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
}

function DashboardRedirect() {
  const { userType, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (userType === 'patient') return <Navigate to="/patient/dashboard" replace />;
  if (userType === 'doctor') return <Navigate to="/doctor/dashboard" replace />;
  if (userType === 'hospital') return <Navigate to="/hospital/dashboard" replace />;
  if (userType === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />

      {/* Browse (public) */}
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/doctors/:id" element={<DoctorDetail />} />
      <Route path="/hospitals" element={<Hospitals />} />
      <Route path="/hospitals/:id" element={<HospitalDetail />} />
      <Route path="/symptom-checker" element={<SymptomChecker />} />
      <Route path="/medicines" element={<Medicines />} />

      {/* Dashboard smart redirect */}
      <Route path="/dashboard" element={<DashboardRedirect />} />

      {/* Patient */}
      <Route path="/patient/dashboard" element={<ProtectedRoute allowedTypes={['patient']}><PatientDashboard /></ProtectedRoute>} />
      <Route path="/patient/profile" element={<ProtectedRoute allowedTypes={['patient']}><PatientProfile /></ProtectedRoute>} />
      <Route path="/patient/history" element={<ProtectedRoute allowedTypes={['patient']}><PatientHistory /></ProtectedRoute>} />
      <Route path="/patient/appointments" element={<ProtectedRoute allowedTypes={['patient']}><PatientAppointments /></ProtectedRoute>} />
      <Route path="/patient/book/:doctorId" element={<ProtectedRoute allowedTypes={['patient']}><BookAppointment /></ProtectedRoute>} />
      <Route path="/patient/book" element={<ProtectedRoute allowedTypes={['patient']}><BookAppointment /></ProtectedRoute>} />

      {/* Doctor */}
      <Route path="/doctor/dashboard" element={<ProtectedRoute allowedTypes={['doctor']}><DoctorDashboard /></ProtectedRoute>} />
      <Route path="/doctor/profile" element={<ProtectedRoute allowedTypes={['doctor']}><DoctorProfile /></ProtectedRoute>} />
      <Route path="/doctor/patients" element={<ProtectedRoute allowedTypes={['doctor']}><PatientLookup /></ProtectedRoute>} />
      <Route path="/doctor/appointments" element={<ProtectedRoute allowedTypes={['doctor']}><DoctorAppointments /></ProtectedRoute>} />

      {/* Hospital */}
      <Route path="/hospital/dashboard" element={<ProtectedRoute allowedTypes={['hospital']}><HospitalDashboard /></ProtectedRoute>} />
      <Route path="/hospital/profile" element={<ProtectedRoute allowedTypes={['hospital']}><HospitalProfile /></ProtectedRoute>} />
      <Route path="/hospital/doctors" element={<ProtectedRoute allowedTypes={['hospital']}><ManageDoctors /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute allowedTypes={['admin']}><AdminDashboard /></ProtectedRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
