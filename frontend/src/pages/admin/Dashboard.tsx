import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { adminAPI } from '@/services/api';
import type { Patient, Doctor, Hospital } from '@/types';

interface Stats { patients: number; doctors: number; hospitals: number; appointments: number; medicines: number; }

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getStats().then(r => setStats(r.data)).catch(() => {});
    adminAPI.getUsers().then(r => {
      setPatients(r.data.patients ?? []);
      setDoctors(r.data.doctors ?? []);
      setHospitals(r.data.hospitals ?? []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 rounded-2xl p-6 text-white shadow-lg">
          <p className="text-rose-100 text-sm mb-1"><i className="fas fa-user-shield mr-1" /> Super Admin</p>
          <h1 className="text-2xl font-extrabold">System Overview</h1>
          <p className="text-rose-100 text-sm mt-1">Full access to all users and system data</p>
        </div>
      </motion.div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          {[
            { icon: 'fa-user-injured', label: 'Patients', value: stats.patients, color: 'from-teal-500 to-teal-600' },
            { icon: 'fa-user-md', label: 'Doctors', value: stats.doctors, color: 'from-indigo-500 to-indigo-600' },
            { icon: 'fa-hospital', label: 'Hospitals', value: stats.hospitals, color: 'from-emerald-500 to-emerald-600' },
            { icon: 'fa-calendar-check', label: 'Appointments', value: stats.appointments, color: 'from-blue-500 to-blue-600' },
            { icon: 'fa-pills', label: 'Medicines', value: stats.medicines, color: 'from-purple-500 to-purple-600' },
          ].map((s, i) => (
            <motion.div key={i} whileHover={{ y: -3 }} className={`rounded-2xl p-5 text-white shadow-lg bg-gradient-to-br ${s.color}`}>
              <i className={`fas ${s.icon} text-2xl opacity-80 mb-3`} />
              <p className="text-3xl font-extrabold">{s.value}</p>
              <p className="text-sm opacity-80 mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <Tabs defaultValue="patients">
          <TabsList className="mb-6">
            <TabsTrigger value="patients"><i className="fas fa-user-injured mr-1.5 text-teal-500" />Patients ({patients.length})</TabsTrigger>
            <TabsTrigger value="doctors"><i className="fas fa-user-md mr-1.5 text-indigo-500" />Doctors ({doctors.length})</TabsTrigger>
            <TabsTrigger value="hospitals"><i className="fas fa-hospital mr-1.5 text-emerald-500" />Hospitals ({hospitals.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="patients">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {patients.map((p, i) => (
                <motion.div key={p.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 font-bold flex-shrink-0">{p.first_name?.[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">{p.first_name} {p.last_name}</p>
                        <p className="text-xs text-slate-400 truncate">{p.email}</p>
                        <Badge variant="patient" className="text-xs mt-0.5">{p.mid}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="doctors">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {doctors.map((d, i) => (
                <motion.div key={d.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">{d.first_name?.[0]}</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">Dr. {d.first_name} {d.last_name}</p>
                        <p className="text-xs text-slate-400 truncate">{d.specialization}</p>
                        <Badge variant="doctor" className="text-xs mt-0.5">{d.mid}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hospitals">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {hospitals.map((h, i) => (
                <motion.div key={h.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0"><i className="fas fa-hospital text-sm" /></div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm text-slate-800 truncate">{h.name}</p>
                        <p className="text-xs text-slate-400">{h.city} • {h.type}</p>
                        <Badge variant="hospital" className="text-xs mt-0.5">{h.mid}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      )}
    </PageLayout>
  );
}
