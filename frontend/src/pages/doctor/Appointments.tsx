import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { doctorAPI } from '@/services/api';
import type { Appointment } from '@/types';

interface ConsultForm {
  diagnosis: string;
  symptoms: string;
  treatment: string;
  vitals: string;
  notes: string;
  medicine_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  rx_instructions: string;
}

const emptyForm: ConsultForm = {
  diagnosis: '', symptoms: '', treatment: '', vitals: '', notes: '',
  medicine_name: '', dosage: '', frequency: '', duration: '', rx_instructions: '',
};

export default function DoctorAppointments() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  const [consultApt, setConsultApt] = useState<Appointment | null>(null);
  const [form, setForm] = useState<ConsultForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');

  const load = () => doctorAPI.myAppointments()
    .then(r => setAppointments(r.data.data ?? []))
    .catch(() => {})
    .finally(() => setLoading(false));

  useEffect(() => { load(); }, []);

  const updateStatus = async (id: string, status: string, notes?: string) => {
    await doctorAPI.updateAppointmentStatus(id, status, notes);
    load();
  };

  const openConsult = (apt: Appointment) => {
    setForm({ ...emptyForm, symptoms: apt.symptoms ?? '' });
    setConsultApt(apt);
    setSavedMsg('');
  };

  const set = (k: keyof ConsultForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const saveConsultation = async () => {
    if (!consultApt || !form.diagnosis.trim()) return;
    const pmid = consultApt.patient?.mid;
    if (!pmid) { setSavedMsg('Patient MID not found. Please refresh and try again.'); return; }
    setSaving(true);
    try {
      const recordRes = await doctorAPI.addRecord({
        patient_mid: pmid,
        record_type: 'consultation',
        diagnosis: form.diagnosis,
        symptoms: form.symptoms,
        treatment: form.treatment,
        vitals: form.vitals,
        notes: form.notes,
      });

      if (form.medicine_name.trim()) {
        await doctorAPI.writePrescription({
          patient_mid: pmid,
          record_id: recordRes.data?.id,
          medicine_name: form.medicine_name,
          dosage: form.dosage,
          frequency: form.frequency,
          duration: form.duration,
          instructions: form.rx_instructions,
        });
      }

      if (consultApt.status === 'confirmed') {
        await doctorAPI.updateAppointmentStatus(consultApt.id, 'completed', form.notes);
        load();
      }

      setSavedMsg('Consultation saved' + (form.medicine_name.trim() ? ' with prescription' : '') + '!');
      setForm(emptyForm);
      setTimeout(() => { setConsultApt(null); setSavedMsg(''); }, 1500);
    } catch {
      setSavedMsg('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const filter = (status: string) => status === 'all' ? appointments : appointments.filter(a => a.status === status);

  const canConsult = (apt: Appointment) => apt.status === 'confirmed' || apt.status === 'completed';

  return (
    <PageLayout>
      <h1 className="text-2xl font-extrabold text-slate-900 mb-6">
        <i className="fas fa-calendar-alt mr-2 text-sky-500" />My Appointments
      </h1>

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
                <div className="text-center py-16 text-slate-400">
                  <i className="fas fa-calendar-times text-4xl mb-3" />
                  <p>No {tab} appointments</p>
                </div>
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
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-2 mb-1">
                                <span className="font-semibold text-slate-800">{apt.patient?.first_name} {apt.patient?.last_name}</span>
                                <Badge variant="patient" className="text-xs">{apt.patient?.mid}</Badge>
                                <Badge variant={apt.status === 'completed' ? 'success' : apt.status === 'confirmed' ? 'info' : 'warning'} className="capitalize text-xs">{apt.status}</Badge>
                              </div>
                              <p className="text-sm text-slate-500">
                                <i className="fas fa-calendar mr-1.5" />
                                {new Date(apt.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                              {apt.symptoms && <p className="text-sm text-slate-500 mt-0.5"><i className="fas fa-thermometer mr-1.5" />{apt.symptoms}</p>}
                              {apt.notes && <p className="text-xs text-slate-400 mt-0.5 italic">{apt.notes}</p>}
                            </div>
                            <div className="flex flex-col gap-1.5 flex-shrink-0">
                              {apt.status === 'pending' && (
                                <Button size="sm" onClick={() => updateStatus(apt.id, 'confirmed')} className="bg-green-600 hover:bg-green-700 text-white text-xs">
                                  <i className="fas fa-check mr-1" />Confirm
                                </Button>
                              )}
                              {canConsult(apt) && (
                                <Button size="sm" onClick={() => openConsult(apt)} className="bg-sky-600 hover:bg-sky-700 text-white text-xs">
                                  <i className="fas fa-stethoscope mr-1" />
                                  {apt.status === 'completed' ? 'Add Note' : 'Consult'}
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

      {/* Consultation Modal */}
      <Dialog open={!!consultApt} onOpenChange={open => { if (!open) setConsultApt(null); }}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              <i className="fas fa-stethoscope mr-2 text-sky-500" />
              Consultation — {consultApt?.patient?.first_name} {consultApt?.patient?.last_name}
              <span className="ml-2 text-sm font-normal text-slate-400">{consultApt?.patient?.mid}</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-500 flex flex-wrap gap-3">
              <span><i className="fas fa-calendar mr-1" />{consultApt && new Date(consultApt.scheduled_at).toLocaleString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
              {consultApt?.patient?.blood_group && <span><i className="fas fa-tint mr-1 text-red-400" />{consultApt.patient.blood_group}</span>}
              {consultApt?.patient?.allergies && <span className="text-red-500"><i className="fas fa-exclamation-triangle mr-1" />Allergies: {consultApt.patient.allergies}</span>}
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Clinical Notes</p>
              <div className="space-y-3">
                <div>
                  <Label>Diagnosis <span className="text-red-400">*</span></Label>
                  <Input className="mt-1" placeholder="Primary diagnosis" value={form.diagnosis} onChange={set('diagnosis')} />
                </div>
                <div>
                  <Label>Symptoms</Label>
                  <Textarea className="mt-1" rows={2} placeholder="Presenting complaints" value={form.symptoms} onChange={set('symptoms')} />
                </div>
                <div>
                  <Label>Treatment Plan</Label>
                  <Textarea className="mt-1" rows={2} placeholder="Recommended treatment" value={form.treatment} onChange={set('treatment')} />
                </div>
                <div>
                  <Label>Vitals</Label>
                  <Input className="mt-1" placeholder="BP 120/80, Temp 37°C, Weight 70kg, SpO2 98%" value={form.vitals} onChange={set('vitals')} />
                </div>
                <div>
                  <Label>Doctor Notes</Label>
                  <Textarea className="mt-1" rows={2} placeholder="Additional observations or follow-up instructions" value={form.notes} onChange={set('notes')} />
                </div>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                <i className="fas fa-prescription mr-1 text-green-500" />Prescription <span className="font-normal normal-case">(optional)</span>
              </p>
              <div className="space-y-3">
                <div>
                  <Label>Medicine Name</Label>
                  <Input className="mt-1" placeholder="e.g. Amoxicillin 500mg" value={form.medicine_name} onChange={set('medicine_name')} />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div><Label>Dosage</Label><Input className="mt-1" placeholder="500mg" value={form.dosage} onChange={set('dosage')} /></div>
                  <div><Label>Frequency</Label><Input className="mt-1" placeholder="3x daily" value={form.frequency} onChange={set('frequency')} /></div>
                  <div><Label>Duration</Label><Input className="mt-1" placeholder="7 days" value={form.duration} onChange={set('duration')} /></div>
                </div>
                <div>
                  <Label>Instructions</Label>
                  <Input className="mt-1" placeholder="Take after meals" value={form.rx_instructions} onChange={set('rx_instructions')} />
                </div>
              </div>
            </div>

            {savedMsg && (
              <div className={`p-3 rounded-lg text-sm ${savedMsg.includes('Failed') ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                <i className={`fas ${savedMsg.includes('Failed') ? 'fa-exclamation-circle' : 'fa-check-circle'} mr-2`} />
                {savedMsg}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setConsultApt(null)}>Cancel</Button>
            <Button onClick={saveConsultation} disabled={saving || !form.diagnosis.trim()} className="bg-sky-600 hover:bg-sky-700 text-white">
              {saving
                ? <><i className="fas fa-spinner fa-spin mr-2" />Saving...</>
                : <><i className="fas fa-save mr-2" />Save Consultation</>
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
