import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { patientAPI } from '@/services/api';
import type { Appointment } from '@/types';

const statusVariant = (s: string) => s === 'completed' ? 'success' : s === 'cancelled' ? 'destructive' : s === 'confirmed' ? 'info' : 'warning';

function AppointmentCard({ apt }: { apt: Appointment }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 flex-shrink-0 text-lg font-bold">
            {apt.doctor?.first_name?.[0]}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="font-semibold text-slate-800">Dr. {apt.doctor?.first_name} {apt.doctor?.last_name}</span>
              <Badge variant={statusVariant(apt.status) as 'success' | 'destructive' | 'info' | 'warning'} className="capitalize text-xs">{apt.status}</Badge>
            </div>
            <p className="text-sm text-slate-500"><i className="fas fa-stethoscope mr-1.5" />{apt.doctor?.specialization}</p>
            <p className="text-sm text-slate-500 mt-1"><i className="fas fa-calendar mr-1.5" />{new Date(apt.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
            {apt.hospital && <p className="text-sm text-slate-400 mt-0.5"><i className="fas fa-hospital mr-1.5" />{apt.hospital.name}</p>}
            {apt.symptoms && <p className="text-sm text-slate-500 mt-1"><i className="fas fa-thermometer mr-1.5" />{apt.symptoms}</p>}
            {apt.doctor_notes && <div className="mt-2 p-3 rounded-lg bg-blue-50 border border-blue-100 text-xs text-blue-700"><i className="fas fa-comment-medical mr-1" />Doctor's notes: {apt.doctor_notes}</div>}
          </div>
          <div className="text-right">
            <p className="text-sm font-bold text-slate-700">₹{apt.consult_fee}</p>
            <p className="text-xs text-slate-400">{apt.duration_minutes} min</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PatientAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getAppointments().then(r => setAppointments(r.data.data ?? [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const filter = (status: string) => status === 'all' ? appointments : appointments.filter(a => a.status === status);

  return (
    <PageLayout>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-extrabold text-slate-900"><i className="fas fa-calendar-alt mr-2 text-blue-500" />My Appointments</h1>
        <Link to="/doctors"><Button variant="gradient" className="text-white" size="sm"><i className="fas fa-plus mr-1.5" />Book New</Button></Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
          </TabsList>
          {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {filter(tab).length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <i className="fas fa-calendar-times text-4xl mb-3" />
                  <p>No {tab === 'all' ? '' : tab} appointments</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filter(tab).map((apt, i) => (
                    <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <AppointmentCard apt={apt} />
                    </motion.div>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}
    </PageLayout>
  );
}
