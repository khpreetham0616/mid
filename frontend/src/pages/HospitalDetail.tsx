import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { hospitalAPI } from '@/services/api';
import type { Hospital } from '@/types';

export default function HospitalDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    hospitalAPI.getById(id).then(r => setHospital(r.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <PageLayout>
      <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
    </PageLayout>
  );

  if (!hospital) return (
    <PageLayout>
      <div className="text-center py-20 text-slate-400">
        <i className="fas fa-hospital text-5xl mb-4" />
        <p className="text-lg font-medium">Hospital not found</p>
        <Link to="/hospitals"><Button variant="outline" className="mt-4">Back to Hospitals</Button></Link>
      </div>
    </PageLayout>
  );

  const parseFacilities = (raw: string): string[] => {
    try { return JSON.parse(raw); } catch { return raw ? raw.split(',').map(s => s.trim()) : []; }
  };
  const parseDepts = (raw: string): string[] => {
    try { return JSON.parse(raw); } catch { return raw ? raw.split(',').map(s => s.trim()) : []; }
  };

  const facilities = parseFacilities(hospital.facilities);
  const departments = parseDepts(hospital.departments);

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Profile Header */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-28 bg-gradient-to-r from-emerald-500 to-emerald-700" />
          <CardContent className="relative -mt-14 pb-6">
            <div className="flex flex-col sm:flex-row sm:items-end gap-4">
              <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-4xl text-emerald-600 flex-shrink-0">
                <i className="fas fa-hospital-alt" />
              </div>
              <div className="flex-1 pb-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="hospital"><i className="fas fa-id-card mr-1" />{hospital.mid}</Badge>
                  <Badge variant="secondary">{hospital.type}</Badge>
                  {hospital.is_active ? <Badge variant="success">Active</Badge> : <Badge variant="secondary">Inactive</Badge>}
                </div>
                <h1 className="text-2xl font-extrabold text-slate-800">{hospital.name}</h1>
                <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-500">
                  {hospital.city && <span><i className="fas fa-map-marker-alt mr-1.5" />{hospital.city}{hospital.state ? `, ${hospital.state}` : ''}</span>}
                  <span><i className="fas fa-procedures mr-1.5" />{hospital.beds} beds</span>
                  <span className="text-amber-500"><i className="fas fa-star mr-1.5" />{hospital.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact strip */}
        <div className="flex flex-wrap gap-4 text-sm text-slate-500 bg-white rounded-xl border px-5 py-3 mb-6">
          {hospital.email && <span><i className="fas fa-envelope mr-1.5 text-blue-400" />{hospital.email}</span>}
          {hospital.phone && <span><i className="fas fa-phone mr-1.5 text-green-400" />{hospital.phone}</span>}
          {hospital.address && <span><i className="fas fa-location-arrow mr-1.5 text-slate-400" />{hospital.address}{hospital.pincode ? ` - ${hospital.pincode}` : ''}</span>}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview"><i className="fas fa-info-circle mr-1.5" />Overview</TabsTrigger>
            <TabsTrigger value="doctors"><i className="fas fa-user-md mr-1.5" />Doctors ({hospital.doctors?.length ?? 0})</TabsTrigger>
            <TabsTrigger value="departments"><i className="fas fa-building mr-1.5" />Departments ({departments.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                { label: 'Hospital Type', value: hospital.type, icon: 'fa-hospital' },
                { label: 'Total Beds', value: hospital.beds, icon: 'fa-procedures' },
                { label: 'City', value: hospital.city, icon: 'fa-map-marker-alt' },
                { label: 'Country', value: hospital.country || 'India', icon: 'fa-globe' },
              ].map(item => (
                <Card key={item.label}>
                  <CardContent className="p-5">
                    <p className="text-xs text-slate-400 uppercase tracking-wide mb-1"><i className={`fas ${item.icon} mr-1.5`} />{item.label}</p>
                    <p className="text-lg font-bold text-slate-800">{item.value}</p>
                  </CardContent>
                </Card>
              ))}

              {facilities.length > 0 && (
                <Card className="sm:col-span-2">
                  <CardHeader><CardTitle className="text-base"><i className="fas fa-clinic-medical mr-2 text-blue-500" />Facilities</CardTitle></CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {facilities.map(f => (
                        <Badge key={f} variant="outline" className="text-xs"><i className="fas fa-check mr-1 text-green-500" />{f}</Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="doctors">
            {!hospital.doctors || hospital.doctors.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <i className="fas fa-user-md text-4xl mb-3" />
                <p>No doctors listed</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {hospital.doctors.map((doc, i) => (
                  <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                    <Card className="card-hover cursor-pointer" onClick={() => navigate(`/doctors/${doc.id}`)}>
                      <CardContent className="p-4 flex items-start gap-3">
                        <div className="w-11 h-11 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold flex-shrink-0">
                          {doc.first_name[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-slate-800 truncate">Dr. {doc.first_name} {doc.last_name}</p>
                          <p className="text-xs text-blue-600">{doc.specialization}</p>
                          <div className="flex items-center gap-3 mt-1 text-xs text-slate-400">
                            <span className="text-amber-500"><i className="fas fa-star mr-0.5" />{doc.rating?.toFixed(1)}</span>
                            <span className="text-green-600 font-medium">₹{doc.consult_fee}</span>
                          </div>
                          {doc.symptoms && doc.symptoms.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {doc.symptoms.slice(0, 2).map(s => <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>)}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="departments">
            {departments.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <i className="fas fa-building text-4xl mb-3" />
                <p>No departments listed</p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {departments.map(d => (
                  <Card key={d}>
                    <CardContent className="p-5 text-center">
                      <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center mx-auto mb-3 text-emerald-600">
                        <i className="fas fa-stethoscope text-lg" />
                      </div>
                      <p className="font-semibold text-slate-800 text-sm">{d}</p>
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
