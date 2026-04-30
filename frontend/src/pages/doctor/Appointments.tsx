import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { doctorAPI, appointmentAPI } from '@/services/api';
import type { Appointment } from '@/types';

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => doctorAPI.myAppointments().then(r => setAppointments(r.data.data ?? [])).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    await appointmentAPI.updateStatus(id, status, notes);
    load();
  };

  const filter = (status: string) => status === 'all' ? appointments : appointments.filter(a => a.status === status);

  return (
    <PageLayout>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6"><i className="fas fa-calendar-alt mr-2 text-sky-500" />My Appointments</h1>
      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : (
        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all">All ({appointments.length})</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          {['all', 'pending', 'confirmed', 'completed'].map(tab => (
            <TabsContent key={tab} value={tab}>
              {filter(tab).length === 0 ? (
                <div className="text-center py-16 text-slate-400"><i className="fas fa-calendar-times text-4xl mb-3" /><p>No {tab} appointments</p></div>
              ) : (
                <div className="space-y-3">
                  {filter(tab).map((apt, i) => (
                    <motion.div key={apt.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                      <Card>
                        <CardContent className="p-5">
                          <div className="flex items-start gap-4">
                            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-lg flex-shrink-0">
                              {apt.patient?.first_name?.[0]}
                            </div>
                            <div className="flex-1">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-800">{apt.patient?.first_name} {apt.patient?.last_name}</span>
                                <Badge variant="patient" className="text-xs">{apt.patient?.mid}</Badge>
                                <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'confirmed' ? 'info' : 'warning'} className="capitalize text-xs">{apt.status}</Badge>
                              </div>
                              <p className="text-sm text-slate-500"><i className="fas fa-calendar mr-1.5" />{new Date(apt.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                              {apt.symptoms && <p className="text-sm text-slate-500 mt-0.5"><i className="fas fa-thermometer mr-1.5" />{apt.symptoms}</p>}
                              {apt.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{apt.notes}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5">
                              {apt.status === 'pending' && (
                                <Button size="sm" onClick={() => updateStatus(apt.id, 'confirmed')} className="bg-green-600 hover:bg-green-700 text-white text-xs">
                                  <i className="fas fa-check mr-1" />Confirm
                                </Button>
                              )}
                              {apt.status === 'confirmed' && (
                                <Button size="sm" onClick={() => updateStatus(apt.id, 'completed')} className="bg-sky-600 hover:bg-sky-700 text-white text-xs">
                                  <i className="fas fa-check-double mr-1" />Complete
                                </Button>
                              )}
                              {apt.status !== 'completed' && apt.status !== 'cancelled' && (
                                <Button size="sm" variant="outline" onClick={() => updateStatus(apt.id, 'cancelled')} className="text-xs border-red-200 text-red-500 hover:bg-red-50">
                                  Cancel
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
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
