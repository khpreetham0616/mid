export interface Doctor {
  id: string;
  mid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  specialization: string;
  qualification: string;
  experience_years: number;
  bio: string;
  consult_fee: number;
  rating: number;
  is_available: boolean;
  profile_image: string;
  hospitals?: Hospital[];
  symptoms?: Symptom[];
  created_at: string;
}

export interface Hospital {
  id: string;
  mid: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  type: string;
  beds: number;
  departments: string;
  facilities: string;
  rating: number;
  is_active: boolean;
  profile_image: string;
  doctors?: Doctor[];
  created_at: string;
}

export interface Patient {
  id: string;
  mid: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_group: string;
  address: string;
  city: string;
  allergies: string;
  chronic_diseases: string;
}

export interface Appointment {
  id: string;
  patient_id: string;
  doctor_id: string;
  hospital_id: string;
  scheduled_at: string;
  duration_minutes: number;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  symptoms: string;
  notes: string;
  doctor_notes: string;
  consult_fee: number;
  doctor?: Doctor;
  hospital?: Hospital;
  patient?: Patient;
}

export interface MedicalRecord {
  id: string;
  patient_id: string;
  doctor_id: string;
  diagnosis: string;
  symptoms: string;
  treatment: string;
  notes: string;
  vitals: string;
  lab_reports: string;
  follow_up_date: string;
  doctor?: Doctor;
  created_at: string;
}

export interface Medicine {
  id: string;
  name: string;
  generic_name: string;
  category: string;
  manufacturer: string;
  description: string;
  dosage: string;
  side_effects: string;
  price: number;
  is_available: boolean;
}

export interface Symptom {
  id: string;
  name: string;
  description: string;
  category: string;
}

export interface SuggestionResult {
  doctors: Doctor[];
  hospitals: Hospital[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

export interface AuthResponse {
  token: string;
  patient: Patient;
}
