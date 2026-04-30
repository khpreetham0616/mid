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
import { patientAPI } from '@/services/api';

export default function PatientProfile() {
  const { patient } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ ...patient });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const save = async () => {
    setSaving(true);
    try {
      await patientAPI.updateProfile(form);
      setMsg('Profile updated!');
      setEditing(false);
    } catch { setMsg('Failed to save.'); }
    setSaving(false);
  };

  if (!patient) return null;

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-extrabold text-slate-900"><i className="fas fa-user-circle mr-2 text-teal-500" />My Profile</h1>
          {!editing && <Button onClick={() => setEditing(true)} variant="outline"><i className="fas fa-edit mr-2" />Edit Profile</Button>}
        </div>

        {/* Identity card */}
        <Card className="mb-6 overflow-hidden">
          <div className="h-24 bg-gradient-to-r from-teal-500 to-teal-600" />
          <CardContent className="relative -mt-12 pb-6">
            <div className="flex items-end gap-4">
              <div className="w-24 h-24 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-extrabold text-teal-600">
                {patient.first_name?.[0]}{patient.last_name?.[0]}
              </div>
              <div className="pb-2">
                <h2 className="text-xl font-extrabold text-slate-800">{patient.first_name} {patient.last_name}</h2>
                <div className="flex items-center gap-2 flex-wrap mt-1">
                  <Badge variant="patient"><i className="fas fa-id-card mr-1" />{patient.mid}</Badge>
                  {patient.blood_group && <Badge variant="info"><i className="fas fa-tint mr-1" />{patient.blood_group}</Badge>}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle><i className="fas fa-info-circle mr-2 text-blue-500" />Personal Information</CardTitle></CardHeader>
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
              <div>
                <Label>Gender</Label>
                <select className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:opacity-50" value={form.gender ?? ''} onChange={set('gender')} disabled={!editing}>
                  <option value="">Select</option>
                  <option>Male</option><option>Female</option><option>Other</option>
                </select>
              </div>
              <div>
                <Label>Blood Group</Label>
                <select className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm disabled:opacity-50" value={form.blood_group ?? ''} onChange={set('blood_group')} disabled={!editing}>
                  <option value="">Select</option>
                  {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map(bg => <option key={bg}>{bg}</option>)}
                </select>
              </div>
            </div>
            <div><Label>Address</Label><Input className="mt-1" value={form.address ?? ''} onChange={set('address')} disabled={!editing} /></div>
            <div><Label>Known Allergies</Label><Textarea className="mt-1" value={form.allergies ?? ''} onChange={set('allergies')} disabled={!editing} /></div>
            <div><Label>Chronic Diseases</Label><Textarea className="mt-1" value={form.chronic_diseases ?? ''} onChange={set('chronic_diseases')} disabled={!editing} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Emergency Contact Name</Label><Input className="mt-1" value={form.emergency_contact_name ?? ''} onChange={set('emergency_contact_name')} disabled={!editing} /></div>
              <div><Label>Emergency Contact Phone</Label><Input className="mt-1" value={form.emergency_contact_phone ?? ''} onChange={set('emergency_contact_phone')} disabled={!editing} /></div>
            </div>

            {editing && (
              <div className="flex gap-3 pt-2">
                <Button onClick={save} disabled={saving} variant="gradient" className="text-white"><i className="fas fa-save mr-2" />{saving ? 'Saving...' : 'Save Changes'}</Button>
                <Button variant="outline" onClick={() => { setEditing(false); setForm({ ...patient }); }}>Cancel</Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}
