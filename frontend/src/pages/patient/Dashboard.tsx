import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { patientAPI, doctorAPI } from '@/services/api';
import type { Appointment, MedicalRecord, Doctor } from '@/types';

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number | string; color: string }) {
  return (
    <motion.div whileHover={{ y: -3 }} className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${color}`}>
      <i className={`fas ${icon} text-2xl opacity-80 mb-3`} />
      <p className="text-3xl font-extrabold">{value}</p>
      <p className="text-sm opacity-80 mt-1">{label}</p>
    </motion.div>
  );
}

export default function PatientDashboard() {
  const { patient } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [nearbyDoctors, setNearbyDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    patientAPI.getAppointments().then(r => setAppointments(r.data.data ?? [])).catch(() => {});
    patientAPI.getMedicalHistory().then(r => setRecords(r.data.data ?? [])).catch(() => {});
    if (patient?.city) {
      doctorAPI.list({ city: patient.city, limit: 4 }).then(r => setNearbyDoctors(r.data.data ?? [])).catch(() => {});
    }
  }, [patient]);

  const pending = appointments.filter(a => a.status === 'pending').length;
  const completed = appointments.filter(a => a.status === 'completed').length;

  return (
    <PageLayout>
      {/* Welcome header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg">
          <div>
            <p className="text-teal-100 text-sm mb-1"><i className="fas fa-hand-wave mr-1" /> Welcome back</p>
            <h1 className="text-2xl font-extrabold">{patient?.first_name} {patient?.last_name}</h1>
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="patient" className="text-xs"><i className="fas fa-id-card mr-1" /> {patient?.mid}</Badge>
              {patient?.blood_group && <span className="text-teal-100 text-xs"><i className="fas fa-tint mr-1" />{patient?.blood_group}</span>}
              {patient?.city && <span className="text-teal-100 text-xs"><i className="fas fa-map-marker-alt mr-1" />{patient?.city}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/doctors"><Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10"><i className="fas fa-search mr-1.5" />Find Doctor</Button></Link>
            <Link to="/symptom-checker"><Button size="sm" className="bg-white text-teal-700 hover:bg-teal-50"><i className="fas fa-diagnoses mr-1.5" />Symptoms</Button></Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard icon="fa-calendar-check" label="Total Appointments" value={appointments.length} color="from-blue-500 to-blue-600" />
        <StatCard icon="fa-clock" label="Pending" value={pending} color="from-amber-500 to-amber-600" />
        <StatCard icon="fa-check-circle" label="Completed" value={completed} color="from-green-500 to-green-600" />
        <StatCard icon="fa-file-medical" label="Medical Records" value={records.length} color="from-purple-500 to-purple-600" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent Appointments */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base"><i className="fas fa-calendar-alt mr-2 text-blue-500" />Recent Appointments</CardTitle>
              <Link to="/patient/appointments"><Button variant="ghost" size="sm" className="text-xs">View all <i className="fas fa-arrow-right ml-1" /></Button></Link>
            </CardHeader>
            <CardContent>
              {appointments.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <i className="fas fa-calendar-times text-3xl mb-3" />
                  <p className="text-sm">No appointments yet</p>
                  <Link to="/doctors"><Button size="sm" className="mt-3" variant="outline">Book an Appointment</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {appointments.slice(0, 4).map(apt => (
                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center text-blue-600 flex-shrink-0">
                        <i className="fas fa-stethoscope text-sm" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-800 truncate">Dr. {apt.doctor?.first_name} {apt.doctor?.last_name}</p>
                        <p className="text-xs text-slate-400">{new Date(apt.scheduled_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                      </div>
                      <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'cancelled' ? 'destructive' : apt.status === 'confirmed' ? 'info' : 'warning'} className="text-xs capitalize">{apt.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Nearby Doctors */}
        <div>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base"><i className="fas fa-map-marker-alt mr-2 text-teal-500" />Nearby Doctors</CardTitle>
              <Link to="/doctors"><Button variant="ghost" size="sm" className="text-xs">See more</Button></Link>
            </CardHeader>
            <CardContent>
              {nearbyDoctors.length === 0 ? (
                <p className="text-sm text-slate-400 text-center py-4">Add your city to find nearby doctors</p>
              ) : (
                <div className="space-y-3">
                  {nearbyDoctors.map(doc => (
                    <Link key={doc.id} to={`/doctors/${doc.id}`} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-slate-50 transition-colors group">
                      <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                        {doc.first_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 group-hover:text-blue-600 transition-colors truncate">Dr. {doc.first_name} {doc.last_name}</p>
                        <p className="text-xs text-slate-400 truncate">{doc.specialization}</p>
                      </div>
                      <div className="text-xs text-amber-500"><i className="fas fa-star" /> {doc.rating.toFixed(1)}</div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick actions */}
          <Card className="mt-4">
            <CardHeader><CardTitle className="text-base"><i className="fas fa-bolt mr-2 text-amber-500" />Quick Actions</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              {[
                { to: '/doctors', icon: 'fa-stethoscope', label: 'Find Doctor', color: 'bg-blue-50 text-blue-600 hover:bg-blue-100' },
                { to: '/symptom-checker', icon: 'fa-diagnoses', label: 'Symptoms', color: 'bg-teal-50 text-teal-600 hover:bg-teal-100' },
                { to: '/patient/history', icon: 'fa-file-medical', label: 'My Records', color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
                { to: '/patient/profile', icon: 'fa-user-edit', label: 'Profile', color: 'bg-slate-50 text-slate-600 hover:bg-slate-100' },
              ].map(a => (
                <Link key={a.to} to={a.to} className={`flex flex-col items-center gap-1.5 p-3 rounded-xl text-xs font-medium transition-colors ${a.color}`}>
                  <i className={`fas ${a.icon} text-base`} />
                  {a.label}
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
