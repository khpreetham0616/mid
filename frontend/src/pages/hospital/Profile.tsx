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
import { hospitalAPI } from '@/services/api';

export default function HospitalProfile() {
  const { hospital } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...hospital });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await hospitalAPI.updateProfile(form as Record<string, unknown>);
      setMsg('Profile updated!');
      setEditing(false);
    } catch { setMsg('Failed to save.'); }
    setSaving(false);
  };

  if (!hospital) return null;

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900"><i className="fas fa-hospital mr-2 text-emerald-500" />Hospital Profile</h1>
          {!editing && <Button onClick={() => setEditing(true)} variant="outline"><i className="fas fa-edit mr-2" />Edit</Button>}
        </div>

        <Card className="mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-emerald-500 to-emerald-700" />
          <CardContent className="relative -mt-12 pb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-4xl text-emerald-600">
                <i className="fas fa-hospital-alt" />
              </div>
              <div className="pb-2">
                <h2 className="text-xl font-extrabold text-slate-800">{hospital.name}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <Badge variant="hospital"><i className="fas fa-id-card mr-1" />{hospital.mid}</Badge>
                  <Badge variant="secondary">{hospital.type}</Badge>
                  <span className="text-sm text-amber-500"><i className="fas fa-star mr-1" />{hospital.rating.toFixed(1)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle><i className="fas fa-info-circle mr-2 text-blue-500" />Hospital Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {msg && <div className={`p-3 rounded-lg text-sm ${msg.includes('updated') ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>{msg}</div>}

            <div><Label>Hospital Name</Label><Input className="mt-1" value={form.name ?? ''} onChange={set('name')} disabled={!editing} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Email</Label><Input className="mt-1" value={form.email ?? ''} disabled /></div>
              <div><Label>Phone</Label><Input className="mt-1" value={form.phone ?? ''} onChange={set('phone')} disabled={!editing} /></div>
            </div>
            <div><Label>Address</Label><Input className="mt-1" value={form.address ?? ''} onChange={set('address')} disabled={!editing} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>City</Label><Input className="mt-1" value={form.city ?? ''} onChange={set('city')} disabled={!editing} /></div>
              <div><Label>State</Label><Input className="mt-1" value={form.state ?? ''} onChange={set('state')} disabled={!editing} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Hospital Type</Label>
                <select className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:opacity-50" value={form.type ?? ''} onChange={set('type')} disabled={!editing}>
                  <option>General</option><option>Specialty</option><option>Clinic</option><option>Multispecialty</option>
                </select>
              </div>
              <div><Label>Total Beds</Label><Input className="mt-1" type="number" value={form.beds ?? 0} onChange={set('beds')} disabled={!editing} /></div>
            </div>
            <div><Label>Departments (JSON array: ["Cardiology","ENT"])</Label><Textarea className="mt-1" value={form.departments ?? ''} onChange={set('departments')} disabled={!editing} rows={2} /></div>
            <div><Label>Facilities (JSON array: ["ICU","OT","Blood Bank"])</Label><Textarea className="mt-1" value={form.facilities ?? ''} onChange={set('facilities')} disabled={!editing} rows={2} /></div>

            {editing && (
              <div className="flex gap-3 pt-2">
                <Button onClick={save} disabled={saving} variant="gradient" className="text-white"><i className="fas fa-save mr-2" />{saving ? 'Saving...' : 'Save'}</Button>
                <Button variant="outline" onClick={() => { setEditing(false); setForm({ ...hospital }); }}>Cancel</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}
