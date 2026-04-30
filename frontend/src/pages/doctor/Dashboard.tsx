import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { doctorAPI } from '@/services/api';
import type { Appointment } from '@/types';

export default function DoctorDashboard() {
  const { doctor } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    doctorAPI.myAppointments().then(r => setAppointments(r.data.data ?? [])).catch(() => {});
  }, []);

  const today = new Date().toDateString();
  const todayAppts = appointments.filter(a => new Date(a.scheduled_at).toDateString() === today);
  const pending = appointments.filter(a => a.status === 'pending').length;
  const completed = appointments.filter(a => a.status === 'completed').length;

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="bg-gradient-to-r from-sky-500 to-sky-600 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-sky-100 text-sm mb-1"><i className="fas fa-user-md mr-1" /> Doctor Dashboard</p>
              <h1 className="text-2xl font-extrabold">Dr. {doctor?.first_name} {doctor?.last_name}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="doctor" className="text-xs"><i className="fas fa-id-card mr-1" />{doctor?.mid}</Badge>
                <span className="text-sky-100 text-xs"><i className="fas fa-stethoscope mr-1" />{doctor?.specialization}</span>
                {doctor?.city && <span className="text-sky-100 text-xs"><i className="fas fa-map-marker-alt mr-1" />{doctor?.city}</span>}
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/doctor/patients"><Button size="sm" className="bg-white text-sky-700 hover:bg-sky-50"><i className="fas fa-search mr-1.5" />Patient Lookup</Button></Link>
              <Link to="/doctor/appointments"><Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10"><i className="fas fa-calendar mr-1.5" />Schedule</Button></Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: 'fa-calendar-day', label: "Today's Appointments", value: todayAppts.length, color: 'from-sky-500 to-sky-600' },
          { icon: 'fa-clock', label: 'Pending', value: pending, color: 'from-amber-500 to-amber-600' },
          { icon: 'fa-check-circle', label: 'Completed', value: completed, color: 'from-green-500 to-green-600' },
          { icon: 'fa-star', label: 'Rating', value: doctor?.rating.toFixed(1) ?? '—', color: 'from-yellow-400 to-yellow-500' },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${s.color}`}>
            <i className={`fas ${s.icon} text-2xl opacity-80 mb-3`} />
            <p className="text-3xl font-extrabold">{s.value}</p>
            <p className="text-sm opacity-80 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Today's schedule */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base"><i className="fas fa-calendar-day mr-2 text-sky-500" />Today's Schedule</CardTitle>
              <Link to="/doctor/appointments"><Button variant="ghost" size="sm" className="text-xs">View all <i className="fas fa-arrow-right ml-1" /></Button></Link>
            </CardHeader>
            <CardContent>
              {todayAppts.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <i className="fas fa-calendar-check text-3xl mb-3" />
                  <p className="text-sm">No appointments today</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {todayAppts.map(apt => (
                    <div key={apt.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 font-bold text-sm flex-shrink-0">
                        {apt.patient?.first_name?.[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-800">{apt.patient?.first_name} {apt.patient?.last_name}</p>
                        <p className="text-xs text-slate-400">{new Date(apt.scheduled_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</p>
                        {apt.symptoms && <p className="text-xs text-slate-400 truncate">{apt.symptoms}</p>}
                      </div>
                      <Badge variant={apt.status === 'confirmed' ? 'info' : apt.status === 'completed' ? 'success' : 'warning'} className="text-xs capitalize">{apt.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick actions */}
        <div>
          <Card>
            <CardHeader><CardTitle className="text-base"><i className="fas fa-bolt mr-2 text-amber-500" />Quick Actions</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {[
                { to: '/doctor/patients', icon: 'fa-search', label: 'Lookup Patient by P-MID', color: 'bg-sky-50 text-sky-700 hover:bg-sky-100' },
                { to: '/doctor/appointments', icon: 'fa-calendar-alt', label: 'View All Appointments', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100' },
                { to: '/doctor/profile', icon: 'fa-user-edit', label: 'Update Profile', color: 'bg-slate-50 text-slate-700 hover:bg-slate-100' },
              ].map(a => (
                <Link key={a.to} to={a.to} className={`flex items-center gap-3 p-3 rounded-xl text-sm font-medium transition-colors ${a.color}`}>
                  <i className={`fas ${a.icon} w-5 text-center`} />
                  {a.label}
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Profile summary */}
          <Card className="mt-4">
            <CardContent className="p-5">
              <div className="text-center">
                <div className="w-16 h-16 rounded-2xl bg-sky-100 flex items-center justify-center text-2xl font-bold text-sky-600 mx-auto mb-3">
                  {doctor?.first_name?.[0]}{doctor?.last_name?.[0]}
                </div>
                <p className="font-bold text-slate-800">{doctor?.qualification}</p>
                <p className="text-sm text-slate-500 mt-0.5">{doctor?.experience_years} years experience</p>
                <p className="text-sm font-semibold text-green-600 mt-1">₹{doctor?.consult_fee} / consultation</p>
                <Badge variant={doctor?.is_available ? 'success' : 'destructive'} className="mt-2 text-xs">
                  <i className={`fas ${doctor?.is_available ? 'fa-check-circle' : 'fa-times-circle'} mr-1`} />
                  {doctor?.is_available ? 'Available' : 'Unavailable'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
