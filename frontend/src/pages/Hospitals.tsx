import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { hospitalAPI } from '@/services/api';
import { useAuth } from '@/context/AuthContext';
import type { Hospital } from '@/types';

const TYPES = ['All', 'General', 'Specialty', 'Clinic', 'Multispecialty'];

export default function Hospitals() {
  const { patient } = useAuth();
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [city, setCity] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await hospitalAPI.list({ page, limit: 9, city: city || undefined });
      setHospitals(res.data.data ?? []);
      setTotal(res.data.total ?? 0);
    } catch { setHospitals([]); } finally { setLoading(false); }
  };

  useEffect(() => { fetchHospitals(); }, [page, city]);

  const parseDepts = (raw: string): string[] => {
    try { return JSON.parse(raw); } catch { return raw ? raw.split(',').map(s => s.trim()) : []; }
  };

  const filtered = typeFilter ? hospitals.filter(h => h.type === typeFilter) : hospitals;
  const totalPages = Math.ceil(total / 9);

  return (
    <PageLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2"><i className="fas fa-hospital mr-3 text-emerald-500" />Find a Hospital</h1>
        <p className="text-slate-500">{total} hospitals available{city ? ` in ${city}` : ''}</p>
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
          {city && (
            <Button variant="ghost" size="sm" onClick={() => { setCity(''); setPage(1); }} className="text-slate-400">
              <i className="fas fa-times mr-1" />Clear
            </Button>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          {TYPES.map(t => (
            <button key={t} onClick={() => setTypeFilter(t === 'All' ? '' : t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${(!typeFilter && t === 'All') || typeFilter === t ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200 hover:border-emerald-300'}`}>
              {t}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-slate-400">
          <i className="fas fa-hospital text-5xl mb-4" />
          <p className="text-lg font-medium">No hospitals found</p>
        </div>
      ) : (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {filtered.map((h, i) => {
              const depts = parseDepts(h.departments);
              return (
                <motion.div key={h.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                  <Card className="card-hover cursor-pointer">
                    <CardContent className="p-5">
                      <div className="flex items-start gap-3 mb-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center flex-shrink-0 text-emerald-600">
                          <i className="fas fa-hospital text-xl" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-slate-800 truncate">{h.name}</h3>
                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <Badge variant="secondary" className="text-xs">{h.type}</Badge>
                            {h.is_active && <Badge variant="success" className="text-xs">Active</Badge>}
                          </div>
                        </div>
                        <Badge variant="hospital" className="text-xs flex-shrink-0">{h.mid}</Badge>
                      </div>

                      <div className="space-y-1.5 text-xs text-slate-500 mb-3">
                        {h.city && <p><i className="fas fa-map-marker-alt mr-1.5 text-slate-400 w-3" />{h.city}{h.state ? `, ${h.state}` : ''}</p>}
                        <div className="flex gap-4">
                          <span><i className="fas fa-procedures mr-1.5 text-slate-400" />{h.beds} beds</span>
                          <span className="text-amber-500"><i className="fas fa-star mr-1" />{h.rating.toFixed(1)}</span>
                          <span><i className="fas fa-user-md mr-1.5 text-slate-400" />{h.doctors?.length ?? 0} doctors</span>
                        </div>
                      </div>

                      {depts.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {depts.slice(0, 3).map(d => <Badge key={d} variant="secondary" className="text-xs">{d}</Badge>)}
                          {depts.length > 3 && <Badge variant="outline" className="text-xs">+{depts.length - 3}</Badge>}
                        </div>
                      )}

                      <div className="pt-3 border-t">
                        <Link to={`/hospitals/${h.id}`}>
                          <Button variant="outline" size="sm" className="w-full text-xs">
                            <i className="fas fa-eye mr-1.5" />View Details
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>

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
