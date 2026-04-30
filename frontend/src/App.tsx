import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Home from './pages/Home';
import Doctors from './pages/Doctors';
import DoctorDetail from './pages/DoctorDetail';
import Hospitals from './pages/Hospitals';
import HospitalDetail from './pages/HospitalDetail';
import SymptomChecker from './pages/SymptomChecker';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BookAppointment from './pages/BookAppointment';
import Medicines from './pages/Medicines';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes: React.FC = () => (
  <>
    <Navbar />
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/doctors" element={<Doctors />} />
      <Route path="/doctors/:id" element={<DoctorDetail />} />
      <Route path="/hospitals" element={<Hospitals />} />
      <Route path="/hospitals/:id" element={<HospitalDetail />} />
      <Route path="/symptom-checker" element={<SymptomChecker />} />
      <Route path="/medicines" element={<Medicines />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/book/:doctorId" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
      <Route path="/book" element={<ProtectedRoute><BookAppointment /></ProtectedRoute>} />
    </Routes>
    <footer style={footerStyle}>
      <div>© 2026 MID — Medical ID System. All rights reserved.</div>
    </footer>
  </>
);

const footerStyle: React.CSSProperties = {
  textAlign: 'center',
  padding: '24px',
  background: '#0F172A',
  color: '#64748B',
  fontSize: 13,
  marginTop: 40,
};

const App: React.FC = () => (
  <BrowserRouter>
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  </BrowserRouter>
);

export default App;
