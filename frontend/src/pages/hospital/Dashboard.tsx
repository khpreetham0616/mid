import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { hospitalAPI } from '@/services/api';
import type { Doctor } from '@/types';

export default function HospitalDashboard() {
  const { hospital } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    hospitalAPI.myDoctors().then(r => setDoctors(r.data.data ?? [])).catch(() => {});
  }, []);

  const departments = (() => {
    try { return JSON.parse(hospital?.departments ?? '[]') as string[]; } catch { return []; }
  })();

  const facilities = (() => {
    try { return JSON.parse(hospital?.facilities ?? '[]') as string[]; } catch { return []; }
  })();

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 rounded-2xl p-6 text-white shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <p className="text-emerald-100 text-sm mb-1"><i className="fas fa-hospital mr-1" /> Hospital Dashboard</p>
              <h1 className="text-2xl font-extrabold">{hospital?.name}</h1>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <Badge variant="hospital" className="text-xs"><i className="fas fa-id-card mr-1" />{hospital?.mid}</Badge>
                <span className="text-emerald-100 text-xs"><i className="fas fa-map-marker-alt mr-1" />{hospital?.city}</span>
                <span className="text-emerald-100 text-xs"><i className="fas fa-procedures mr-1" />{hospital?.beds} beds</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Link to="/hospital/doctors"><Button size="sm" className="bg-white text-emerald-700 hover:bg-emerald-50"><i className="fas fa-user-md mr-1.5" />Manage Doctors</Button></Link>
              <Link to="/hospital/profile"><Button variant="outline" size="sm" className="border-white/30 text-white hover:bg-white/10"><i className="fas fa-edit mr-1.5" />Edit Profile</Button></Link>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: 'fa-user-md', label: 'Affiliated Doctors', value: doctors.length, color: 'from-indigo-500 to-indigo-600' },
          { icon: 'fa-procedures', label: 'Total Beds', value: hospital?.beds ?? 0, color: 'from-emerald-500 to-emerald-600' },
          { icon: 'fa-building', label: 'Departments', value: departments.length, color: 'from-blue-500 to-blue-600' },
          { icon: 'fa-star', label: 'Hospital Rating', value: hospital?.rating.toFixed(1) ?? '—', color: 'from-yellow-400 to-yellow-500' },
        ].map((s, i) => (
          <motion.div key={i} whileHover={{ y: -3 }} className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${s.color}`}>
            <i className={`fas ${s.icon} text-2xl opacity-80 mb-3`} />
            <p className="text-3xl font-extrabold">{s.value}</p>
            <p className="text-sm opacity-80 mt-1">{s.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Doctors */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base"><i className="fas fa-user-md mr-2 text-indigo-500" />Affiliated Doctors</CardTitle>
              <Link to="/hospital/doctors"><Button variant="ghost" size="sm" className="text-xs">Manage <i className="fas fa-arrow-right ml-1" /></Button></Link>
            </CardHeader>
            <CardContent>
              {doctors.length === 0 ? (
                <div className="text-center py-10 text-slate-400">
                  <i className="fas fa-user-md text-3xl mb-3" />
                  <p className="text-sm">No doctors affiliated yet</p>
                  <Link to="/hospital/doctors"><Button size="sm" variant="outline" className="mt-3">Add Doctor</Button></Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {doctors.slice(0, 6).map(doc => (
                    <div key={doc.id} className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm flex-shrink-0">
                        {doc.first_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-800">Dr. {doc.first_name} {doc.last_name}</p>
                        <p className="text-xs text-slate-400">{doc.specialization}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-amber-500"><i className="fas fa-star" /> {doc.rating.toFixed(1)}</span>
                        <Badge variant={doc.is_available ? 'success' : 'destructive'} className="text-xs">{doc.is_available ? 'Active' : 'Off'}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {/* Departments */}
          <Card>
            <CardHeader><CardTitle className="text-base"><i className="fas fa-building mr-2 text-emerald-500" />Departments</CardTitle></CardHeader>
            <CardContent>
              {departments.length === 0 ? <p className="text-sm text-slate-400">No departments listed</p> : (
                <div className="flex flex-wrap gap-2">
                  {departments.map((d, i) => <Badge key={i} variant="secondary" className="text-xs">{d}</Badge>)}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Facilities */}
          <Card>
            <CardHeader><CardTitle className="text-base"><i className="fas fa-clinic-medical mr-2 text-blue-500" />Facilities</CardTitle></CardHeader>
            <CardContent>
              {facilities.length === 0 ? <p className="text-sm text-slate-400">No facilities listed</p> : (
                <div className="flex flex-wrap gap-2">
                  {facilities.map((f, i) => <Badge key={i} variant="outline" className="text-xs"><i className="fas fa-check mr-1 text-green-500" />{f}</Badge>)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </PageLayout>
  );
}
