import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { doctorAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { Doctor } from '@/types';

const SPECS = ['All', 'Cardiologist', 'Neurologist', 'Orthopedic', 'Dermatologist', 'Pediatrician', 'Gynecologist', 'Psychiatrist', 'ENT', 'Ophthalmologist', 'Oncologist', 'General Physician'];

export default function Doctors() {
  const { patient } = useAuth();
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [spec, setSpec] = useState('');
  const [city, setCity] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.list({ page, limit: 12, specialization: spec || undefined, city: city || undefined });
      setDoctors(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch { setDoctors([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchDoctors(); }, [page, spec, city]);

  const totalPages = Math.ceil(total / 12);

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2"><i className="fas fa-stethoscope mr-3 text-blue-500" />Find a Doctor</h1>
        <p className="text-slate-500">{total} doctors available{city ? ` in ${city}` : ''}</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border p-4 mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input placeholder="Search by city..." value={city} onChange={e => { setCity(e.target.value); setPage(1); }} className="w-full" />
          </div>
          {patient?.city && (
            <Button variant="outline" size="sm" onClick={() => { setCity(patient.city); setPage(1); }} className="text-teal-600 border-teal-200">
              <i className="fas fa-map-marker-alt mr-1.5" />Near me ({patient.city})
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {SPECS.map(s => (
            <button key={s} onClick={() => { setSpec(s === 'All' ? '' : s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${(!spec && s === 'All') || spec === s ? 'bg-sky-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-300'}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : doctors.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <i className="fas fa-user-md text-5xl mb-4" />
          <p className="text-lg font-medium">No doctors found</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {doctors.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <Card className="card-hover cursor-pointer">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-sky-100 flex items-center justify-center text-xl font-bold text-sky-600 flex-shrink-0">
                        {doc.first_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-slate-800 truncate">Dr. {doc.first_name} {doc.last_name}</h3>
                        <p className="text-sm text-blue-600 font-medium">{doc.specialization}</p>
                        {doc.city && <p className="text-xs text-slate-400 mt-0.5"><i className="fas fa-map-marker-alt mr-1" />{doc.city}</p>}
                      </div>
                      <Badge variant={doc.is_available ? 'success' : 'secondary'} className="text-xs flex-shrink-0">
                        {doc.is_available ? 'Available' : 'Busy'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500 mb-3">
                      <span><i className="fas fa-graduation-cap mr-1" />{doc.qualification || 'MBBS'}</span>
                      <span><i className="fas fa-briefcase mr-1" />{doc.experience_years} yrs exp</span>
                      <span className="text-amber-500"><i className="fas fa-star mr-1" />{doc.rating.toFixed(1)}</span>
                    </div>
                    {doc.symptoms && doc.symptoms.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {doc.symptoms.slice(0, 3).map(s => <Badge key={s.id} variant="secondary" className="text-xs">{s.name}</Badge>)}
                        {doc.symptoms.length > 3 && <Badge variant="outline" className="text-xs">+{doc.symptoms.length - 3}</Badge>}
                      </div>
                    )}
                    <div className="flex items-center justify-between pt-3 border-t">
                      <span className="font-bold text-green-600">₹{doc.consult_fee}</span>
                      <div className="flex gap-2">
                        <Link to={`/doctors/${doc.id}`}><Button variant="outline" size="sm" className="text-xs">View</Button></Link>
                        <Link to={`/patient/book/${doc.id}`}><Button size="sm" className="text-xs bg-sky-600 hover:bg-sky-700 text-white">Book</Button></Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button variant="outline" disabled={page === 1} onClick={() => setPage(p => p - 1)}><i className="fas fa-chevron-left" /></Button>
              <span className="flex items-center px-4 text-sm text-slate-600">Page {page} of {totalPages}</span>
              <Button variant="outline" disabled={page === totalPages} onClick={() => setPage(p => p + 1)}><i className="fas fa-chevron-right" /></Button>
            </div>
          )}
        </>
      )}
    </PageLayout>
  );
}
