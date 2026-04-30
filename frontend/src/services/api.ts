import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const stored = localStorage.getItem('mid_auth');
  if (stored) {
    try {
      const { token } = JSON.parse(stored);
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {}
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mid_auth');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data: Record<string, unknown>) => api.post('/auth/register', data),
  login: (data: { email: string; password: string; user_type?: string }) =>
    api.post('/auth/login', data),
};

export const doctorAPI = {
  list: (params?: { page?: number; limit?: number; specialization?: string; city?: string }) =>
    api.get('/doctors', { params }),
  getById: (id: string) => api.get(`/doctors/${id}`),
  getByMID: (mid: string) => api.get(`/doctors/mid/${mid}`),
  // Doctor-role endpoints
  myProfile: () => api.get('/doctor/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/doctor/profile', data),
  myAppointments: () => api.get('/doctor/appointments'),
  lookupPatient: (pmid: string) => api.get(`/doctor/patient/${pmid}`),
  addRecord: (data: Record<string, unknown>) => api.post('/doctor/records', data),
  writePrescription: (data: Record<string, unknown>) => api.post('/doctor/prescriptions', data),
  myPrescriptions: () => api.get('/doctor/prescriptions'),
  updateAppointmentStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/appointments/${id}/status`, { status, doctor_notes: notes }),
};

export const hospitalAPI = {
  list: (params?: { page?: number; limit?: number; city?: string }) =>
    api.get('/hospitals', { params }),
  getById: (id: string) => api.get(`/hospitals/${id}`),
  getByMID: (mid: string) => api.get(`/hospitals/mid/${mid}`),
  // Hospital-role endpoints
  myProfile: () => api.get('/hospital/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/hospital/profile', data),
  myDoctors: () => api.get('/hospital/doctors'),
  addDoctor: (data: { doctor_mid: string; schedule?: string }) =>
    api.post('/hospital/doctors', data),
  removeDoctor: (doctorId: string) => api.delete(`/hospital/doctors/${doctorId}`),
};

export const patientAPI = {
  getProfile: () => api.get('/patient/profile'),
  updateProfile: (data: Record<string, unknown>) => api.put('/patient/profile', data),
  getMedicalHistory: () => api.get('/patient/medical-history'),
  getAppointments: () => api.get('/patient/appointments'),
  getPrescriptions: () => api.get('/patient/prescriptions'),
};

export const appointmentAPI = {
  book: (data: Record<string, unknown>) => api.post('/patient/appointments', data),
  getById: (id: string) => api.get(`/appointments/${id}`),
  getDoctorSlots: (doctorId: string, date?: string) =>
    api.get(`/appointments/doctor/${doctorId}`, { params: { date } }),
  updateStatus: (id: string, status: string, notes?: string) =>
    api.patch(`/appointments/${id}/status`, { status, doctor_notes: notes }),
};

export const suggestionAPI = {
  suggest: (symptoms: string[]) =>
    api.get('/suggestions', { params: { symptoms: symptoms.join(',') } }),
};

export const medicineAPI = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/medicines', { params }),
  getById: (id: string) => api.get(`/medicines/${id}`),
};

export const adminAPI = {
  getUsers: (type?: string) => api.get('/admin/users', { params: { type } }),
  getStats: () => api.get('/admin/stats'),
};

export default api;
