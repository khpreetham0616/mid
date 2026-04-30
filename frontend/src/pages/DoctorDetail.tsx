import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { doctorAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { Doctor } from '@/types';

export default function DoctorDetail() {
  const { id } = useParams<{ id: string }>();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    doctorAPI.getById(id).then(r => setDoctor(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <PageLayout>
      <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
    </PageLayout>
  );

  if (!doctor) return (
    <PageLayout>
      <div className="text-center py-20 text-slate-400">
        <i className="fas fa-user-md text-5xl mb-4" />
        <p className="text-lg font-medium">Doctor not found</p>
        <Link to="/doctors"><Button variant="outline" className="mt-4">Back to Doctors</Button></Link>
      </div>
    </PageLayout>
  );

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-indigo-500 to-indigo-700" />
          <CardContent className="relative -mt-14 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-4xl font-extrabold text-indigo-600 flex-shrink-0">
                {doctor.first_name[0]}
              </div>
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="doctor"><i className="fas fa-id-card mr-1" />{doctor.mid}</Badge>
                  <Badge variant={doctor.is_available ? 'success' : 'secondary'}>{doctor.is_available ? 'Available' : 'Busy'}</Badge>
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800">Dr. {doctor.first_name} {doctor.last_name}</h1>
                <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                  <span><i className="fas fa-graduation-cap mr-1.5" />{doctor.qualification || 'MBBS'}</span>
                  <span><i className="fas fa-briefcase mr-1.5" />{doctor.experience_years} years exp</span>
                  <span className="text-amber-500"><i className="fas fa-star mr-1.5" />{doctor.rating.toFixed(1)}</span>
                  {doctor.city && <span><i className="fas fa-map-marker-alt mr-1.5" />{doctor.city}</span>}
                </div>
              </div>
              <div className="sm:pb-2 flex flex-col gap-2 items-start sm:items-end">
                <div className="text-3xl font-extrabold text-green-600">₹{doctor.consult_fee}</div>
                <p className="text-xs text-slate-400">per consultation</p>
                {isAuthenticated ? (
                  <Link to={`/patient/book/${doctor.id}`}>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white"><i className="fas fa-calendar-plus mr-2" />Book Appointment</Button>
                  </Link>
                ) : (
                  <Button onClick={() => navigate('/login')} className="bg-blue-600 hover:bg-blue-700 text-white"><i className="fas fa-calendar-plus mr-2" />Book Appointment</Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact info strip */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 bg-white rounded-xl border px-5 py-3 mb-6">
          {doctor.email && <span><i className="fas fa-envelope mr-1.5 text-blue-400" />{doctor.email}</span>}
          {doctor.phone && <span><i className="fas fa-phone mr-1.5 text-green-400" />{doctor.phone}</span>}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><i className="fas fa-info-circle mr-1.5" />Overview</TabsTrigger>
            <TabsTrigger value="hospitals"><i className="fas fa-hospital mr-1.5" />Hospitals ({doctor.hospitals?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="conditions"><i className="fas fa-stethoscope mr-1.5" />Conditions ({doctor.symptoms?.length ?? 0})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid sm:grid-cols-2 gap-4">
              {doctor.bio && (
                <Card className="sm:col-span-2">
                  <CardHeader><CardTitle className="text-base"><i className="fas fa-user mr-2 text-indigo-500" />About</CardTitle></CardHeader>
                  <CardContent><p className="text-slate-600 leading-relaxed">{doctor.bio}</p></CardContent>
                </Card>
              )}
              {[
                { label: 'Specialization', value: doctor.specialization, icon: 'fa-stethoscope' },
                { label: 'Experience', value: `${doctor.experience_years} years`, icon: 'fa-briefcase' },
                { label: 'Qualification', value: doctor.qualification || 'MBBS', icon: 'fa-graduation-cap' },
                { label: 'Status', value: doctor.is_available ? 'Available' : 'Unavailable', icon: 'fa-circle', color: doctor.is_available ? 'text-green-600' : 'text-red-500' },
              ].map(item => (
                <Card key={item.label}>
                  <CardContent className="p-5">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1"><i className={`fas ${item.icon} mr-1.5`} />{item.label}</p>
                    <p className={`text-lg font-bold ${item.color ?? 'text-slate-800'}`}>{item.value}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="hospitals">
            {!doctor.hospitals || doctor.hospitals.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <i className="fas fa-hospital text-4xl mb-3" />
                <p>No hospital affiliations listed</p>
              </div>
            ) : (
              <div className="space-y-3">
                {doctor.hospitals.map(h => (
                  <Card key={h.id} className="cursor-pointer card-hover" onClick={() => navigate(`/hospitals/${h.id}`)}>
                    <CardContent className="p-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 flex-shrink-0">
                        <i className="fas fa-hospital text-lg" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800">{h.name}</p>
                        <p className="text-sm text-slate-500"><i className="fas fa-map-marker-alt mr-1" />{h.city}{h.state ? `, ${h.state}` : ''}</p>
                        <Badge variant="hospital" className="text-xs mt-1">{h.mid}</Badge>
                      </div>
                      <div className="text-amber-500 text-sm"><i className="fas fa-star mr-1" />{h.rating?.toFixed(1)}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="conditions">
            {!doctor.symptoms || doctor.symptoms.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <i className="fas fa-stethoscope text-4xl mb-3" />
                <p>No specific conditions listed</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {doctor.symptoms.map(s => (
                  <Card key={s.id}>
                    <CardContent className="p-4">
                      <p className="font-bold text-slate-800 mb-1">{s.name}</p>
                      {s.description && <p className="text-xs text-slate-500 leading-relaxed mb-2">{s.description}</p>}
                      {s.category && <Badge variant="secondary" className="text-xs">{s.category}</Badge>}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </motion.div>
    </PageLayout>
  );
}
