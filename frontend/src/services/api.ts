import axios from 'axios';

const api = axios.create({
  baseURL: '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mid_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('mid_token');
      localStorage.removeItem('mid_patient');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (email: string, password: string) => api.post('/auth/login', { email, password }),
};

export const doctorAPI = {
  list: (params?: { page?: number; limit?: number; specialization?: string }) =>
    api.get('/doctors', { params }),
  getById: (id: string) => api.get(`/doctors/${id}`),
  getByMID: (mid: string) => api.get(`/doctors/mid/${mid}`),
};

export const hospitalAPI = {
  list: (params?: { page?: number; limit?: number; city?: string }) =>
    api.get('/hospitals', { params }),
  getById: (id: string) => api.get(`/hospitals/${id}`),
  getByMID: (mid: string) => api.get(`/hospitals/mid/${mid}`),
};

export const suggestionAPI = {
  suggest: (symptoms: string[]) =>
    api.get('/suggestions', { params: { symptoms: symptoms.join(',') } }),
};

export const appointmentAPI = {
  book: (data: any) => api.post('/appointments', data),
  getById: (id: string) => api.get(`/appointments/${id}`),
  getDoctorSlots: (doctorId: string, date?: string) =>
    api.get(`/appointments/doctor/${doctorId}`, { params: { date } }),
  updateStatus: (id: string, status: string, doctorNotes?: string) =>
    api.patch(`/appointments/${id}/status`, { status, doctor_notes: doctorNotes }),
  myAppointments: () => api.get('/my-appointments'),
};

export const patientAPI = {
  getProfile: () => api.get('/profile'),
  updateProfile: (data: any) => api.put('/profile', data),
  getMedicalHistory: () => api.get('/medical-history'),
};

export const medicineAPI = {
  list: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/medicines', { params }),
  getById: (id: string) => api.get(`/medicines/${id}`),
  getPrescriptions: () => api.get('/prescriptions'),
};

export default api;
