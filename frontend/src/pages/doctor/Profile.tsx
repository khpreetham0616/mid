import React, { useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/context/AuthContext';
import { doctorAPI } from '@/services/api';

export default function DoctorProfile() {
  const { doctor } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...doctor });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await doctorAPI.updateProfile(form as Record<string, unknown>);
      setMsg('Profile updated!');
      setEditing(false);
    } catch { setMsg('Failed to save.'); }
    setSaving(false);
  };

  if (!doctor) return null;

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900"><i className="fas fa-user-md mr-2 text-sky-500" />My Profile</h1>
          {!editing && <Button onClick={() => setEditing(true)} variant="outline"><i className="fas fa-edit mr-2" />Edit</Button>}
        </div>

        <Card className="mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-sky-500 to-sky-600" />
          <CardContent className="relative -mt-12 pb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-extrabold text-sky-600">
                {doctor.first_name?.[0]}{doctor.last_name?.[0]}
              </div>
              <div className="pb-2">
                <h2 className="text-xl font-extrabold text-slate-800">Dr. {doctor.first_name} {doctor.last_name}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <Badge variant="doctor"><i className="fas fa-id-card mr-1" />{doctor.mid}</Badge>
                  <Badge variant={doctor.is_available ? 'success' : 'destructive'} className="text-xs">{doctor.is_available ? 'Available' : 'Unavailable'}</Badge>
                  <span className="text-sm text-amber-500"><i className="fas fa-star mr-1" />{doctor.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle><i className="fas fa-info-circle mr-2 text-blue-500" />Professional Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('updated') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg}</div>}

            <div className="grid grid-cols-2 gap-4">
              <div><Label>First Name</Label><Input className="mt-1" value={form.first_name ?? ''} onChange={set('first_name')} disabled={!editing} /></div>
              <div><Label>Last Name</Label><Input className="mt-1" value={form.last_name ?? ''} onChange={set('last_name')} disabled={!editing} /></div>
            </div>
            <div><Label>Email</Label><Input className="mt-1" value={form.email ?? ''} disabled /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Phone</Label><Input className="mt-1" value={form.phone ?? ''} onChange={set('phone')} disabled={!editing} /></div>
              <div><Label>City</Label><Input className="mt-1" value={form.city ?? ''} onChange={set('city')} disabled={!editing} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Specialization</Label><Input className="mt-1" value={form.specialization ?? ''} onChange={set('specialization')} disabled={!editing} /></div>
              <div><Label>Qualification</Label><Input className="mt-1" value={form.qualification ?? ''} onChange={set('qualification')} disabled={!editing} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Experience (years)</Label><Input className="mt-1" type="number" value={form.experience_years ?? 0} onChange={set('experience_years')} disabled={!editing} /></div>
              <div><Label>Consult Fee (₹)</Label><Input className="mt-1" type="number" value={form.consult_fee ?? 0} onChange={set('consult_fee')} disabled={!editing} /></div>
            </div>
            <div><Label>Bio</Label><Textarea className="mt-1" value={form.bio ?? ''} onChange={set('bio')} disabled={!editing} rows={3} /></div>
            {editing && (
              <div className="flex gap-3 pt-2">
                <Button onClick={save} disabled={saving} variant="gradient" className="text-white"><i className="fas fa-save mr-2" />{saving ? 'Saving...' : 'Save'}</Button>
                <Button variant="outline" onClick={() => { setEditing(false); setForm({ ...doctor }); }}>Cancel</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}
