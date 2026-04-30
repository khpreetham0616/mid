import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { hospitalAPI } from '@/services/api';
import type { Doctor } from '@/types';

export default function ManageDoctors() {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [dmid, setDmid] = useState('');
  const [schedule, setSchedule] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const [msg, setMsg] = useState('');

  const load = () => hospitalAPI.myDoctors().then(r => setDoctors(r.data.data ?? [])).catch(() => {}).finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    if (!dmid.trim()) return;
    setAdding(true);
    setError('');
    try {
      await hospitalAPI.addDoctor({ doctor_mid: dmid.trim(), schedule });
      setMsg('Doctor added successfully!');
      setShowAdd(false);
      setDmid('');
      setSchedule('');
      load();
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Failed to add doctor.');
    }
    setAdding(false);
  };

  const handleRemove = async (doctorId: string) => {
    if (!confirm('Remove this doctor from your hospital?')) return;
    try {
      await hospitalAPI.removeDoctor(doctorId);
      setMsg('Doctor removed.');
      load();
    } catch {}
  };

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900"><i className="fas fa-user-md mr-2 text-emerald-500" />Manage Doctors</h1>
          <Button onClick={() => setShowAdd(true)} variant="gradient" className="text-white"><i className="fas fa-plus mr-2" />Add Doctor</Button>
        </div>

        {msg && <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2"><i className="fas fa-check-circle" />{msg}</div>}

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : doctors.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border">
            <i className="fas fa-user-md text-5xl text-slate-200 mb-4" />
            <p className="text-slate-500 font-medium">No doctors affiliated yet</p>
            <p className="text-sm text-slate-400 mt-1">Add doctors using their D-MID</p>
            <Button className="mt-4" onClick={() => setShowAdd(true)} variant="gradient"><i className="fas fa-plus mr-2" />Add First Doctor</Button>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {doctors.map((doc, i) => (
              <motion.div key={doc.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.04 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-3">
                      <div className="w-12 h-12 rounded-xl bg-indigo-100 flex items-center justify-center text-xl font-bold text-indigo-600 flex-shrink-0">
                        {doc.first_name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-slate-800">Dr. {doc.first_name} {doc.last_name}</p>
                        <p className="text-sm text-slate-500">{doc.specialization}</p>
                        <Badge variant="doctor" className="text-xs mt-1">{doc.mid}</Badge>
                        <div className="flex items-center gap-3 mt-2 text-xs text-slate-400">
                          <span><i className="fas fa-star text-amber-400 mr-1" />{doc.rating.toFixed(1)}</span>
                          <span><i className="fas fa-briefcase mr-1" />{doc.experience_years} yrs</span>
                          <span><i className="fas fa-rupee-sign mr-1" />{doc.consult_fee}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-3 pt-3 border-t">
                      <Badge variant={doc.is_available ? 'success' : 'destructive'} className="text-xs">{doc.is_available ? 'Available' : 'Unavailable'}</Badge>
                      <Button size="sm" variant="ghost" className="text-red-500 hover:bg-red-50 text-xs" onClick={() => handleRemove(doc.id)}>
                        <i className="fas fa-unlink mr-1" />Remove
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      <Dialog open={showAdd} onOpenChange={setShowAdd}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle><i className="fas fa-user-plus mr-2 text-emerald-500" />Add Doctor to Hospital</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Doctor's D-MID *</Label>
              <Input className="mt-1 font-mono" placeholder="D-MID-26-XXXXXX" value={dmid} onChange={e => setDmid(e.target.value)} />
              <p className="text-xs text-slate-400 mt-1">Ask the doctor to share their D-MID</p>
            </div>
            <div>
              <Label>Schedule (optional)</Label>
              <Input className="mt-1" placeholder="Mon–Fri, 9am–5pm" value={schedule} onChange={e => setSchedule(e.target.value)} />
            </div>
            {error && <p className="text-red-500 text-sm"><i className="fas fa-exclamation-circle mr-1" />{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowAdd(false); setError(''); }}>Cancel</Button>
            <Button onClick={handleAdd} disabled={adding} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              {adding ? 'Adding...' : <><i className="fas fa-plus mr-1.5" />Add Doctor</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
