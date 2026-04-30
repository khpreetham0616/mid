import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { doctorAPI } from '@/services/api';
import type { Patient, MedicalRecord, Appointment } from '@/types';

interface LookupResult {
  patient: Patient;
  medical_records: MedicalRecord[];
  appointments: Appointment[];
}

export default function PatientLookup() {
  const [pmid, setPmid] = useState('');
  const [result, setResult] = useState<LookupResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Record form
  const [showRecord, setShowRecord] = useState(false);
  const [recordForm, setRecordForm] = useState({ record_type: 'consultation', diagnosis: '', symptoms: '', treatment: '', notes: '', vitals: '', surgery_type: '', anesthesia_type: '', surgeon_notes: '' });
  const [recordLoading, setRecordLoading] = useState(false);

  // Prescription form
  const [showRx, setShowRx] = useState(false);
  const [rxForm, setRxForm] = useState({ medicine_name: '', dosage: '', frequency: '', duration: '', instructions: '' });
  const [rxLoading, setRxLoading] = useState(false);

  const [successMsg, setSuccessMsg] = useState('');

  const lookup = async () => {
    if (!pmid.trim()) return;
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await doctorAPI.lookupPatient(pmid.trim());
      setResult(res.data);
    } catch { setError('Patient not found. Check the P-MID.'); }
    setLoading(false);
  };

  const setR = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setRecordForm(prev => ({ ...prev, [k]: e.target.value }));

  const setRx = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setRxForm(prev => ({ ...prev, [k]: e.target.value }));

  const submitRecord = async () => {
    if (!recordForm.diagnosis) return;
    setRecordLoading(true);
    try {
      await doctorAPI.addRecord({ ...recordForm, patient_mid: pmid });
      setSuccessMsg('Medical record added successfully!');
      setShowRecord(false);
      lookup();
    } catch { setSuccessMsg(''); }
    setRecordLoading(false);
  };

  const submitRx = async () => {
    if (!rxForm.medicine_name) return;
    setRxLoading(true);
    try {
      await doctorAPI.writePrescription({ ...rxForm, patient_mid: pmid });
      setSuccessMsg('Prescription written successfully!');
      setShowRx(false);
    } catch { setSuccessMsg(''); }
    setRxLoading(false);
  };

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-6"><i className="fas fa-search mr-2 text-sky-500" />Patient Lookup</h1>

        {/* Search */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex gap-3 max-w-lg">
              <div className="flex-1">
                <Label className="text-xs mb-1.5 block">Enter Patient's P-MID</Label>
                <Input
                  placeholder="P-MID-26-XXXXXX"
                  value={pmid}
                  onChange={e => setPmid(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && lookup()}
                  className="font-mono"
                />
              </div>
              <div className="flex items-end">
                <Button onClick={lookup} disabled={loading} variant="gradient" className="text-white">
                  {loading ? <i className="fas fa-spinner fa-spin" /> : <><i className="fas fa-search mr-2" />Search</>}
                </Button>
              </div>
            </div>
            {error && <p className="text-red-500 text-sm mt-3"><i className="fas fa-exclamation-circle mr-1" />{error}</p>}
            {successMsg && <p className="text-green-600 text-sm mt-3 bg-green-50 p-2 rounded-lg border border-green-200"><i className="fas fa-check-circle mr-1" />{successMsg}</p>}
          </CardContent>
        </Card>

        <AnimatePresence>
          {result && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              {/* Patient info */}
              <Card className="mb-4 border-sky-200 bg-sky-50/30">
                <CardContent className="p-5">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center text-xl font-bold text-teal-600 flex-shrink-0">
                      {result.patient.first_name?.[0]}{result.patient.last_name?.[0]}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-extrabold text-lg text-slate-800">{result.patient.first_name} {result.patient.last_name}</h2>
                      <div className="flex flex-wrap gap-2 mt-1">
                        <Badge variant="patient" className="text-xs"><i className="fas fa-id-card mr-1" />{result.patient.mid}</Badge>
                        {result.patient.blood_group && <Badge variant="info" className="text-xs"><i className="fas fa-tint mr-1" />{result.patient.blood_group}</Badge>}
                        {result.patient.gender && <span className="text-xs text-slate-500">{result.patient.gender}</span>}
                        {result.patient.city && <span className="text-xs text-slate-500"><i className="fas fa-map-marker-alt mr-1" />{result.patient.city}</span>}
                      </div>
                      {result.patient.allergies && (
                        <p className="text-xs text-red-500 mt-1.5 bg-red-50 px-2 py-1 rounded"><i className="fas fa-exclamation-triangle mr-1" />Allergies: {result.patient.allergies}</p>
                      )}
                      {result.patient.chronic_diseases && (
                        <p className="text-xs text-orange-500 mt-1 bg-orange-50 px-2 py-1 rounded"><i className="fas fa-heartbeat mr-1" />Chronic: {result.patient.chronic_diseases}</p>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <Button size="sm" onClick={() => setShowRecord(true)} className="bg-sky-600 hover:bg-sky-700 text-white text-xs"><i className="fas fa-file-medical mr-1" />Add Record</Button>
                      <Button size="sm" variant="outline" onClick={() => setShowRx(true)} className="text-xs border-sky-300 text-sky-600"><i className="fas fa-prescription mr-1" />Write Rx</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Patient history tabs */}
              <Tabs defaultValue="records">
                <TabsList>
                  <TabsTrigger value="records"><i className="fas fa-file-medical mr-1.5" />Records ({result.medical_records.length})</TabsTrigger>
                  <TabsTrigger value="appointments"><i className="fas fa-calendar mr-1.5" />Appointments ({result.appointments.length})</TabsTrigger>
                </TabsList>

                <TabsContent value="records">
                  {result.medical_records.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-white rounded-xl border mt-4">
                      <i className="fas fa-file-medical text-3xl mb-3" />
                      <p className="text-sm">No medical records yet</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {result.medical_records.map(r => (
                        <Card key={r.id}>
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <Badge className="capitalize text-xs">{r.record_type}</Badge>
                              <div className="flex-1">
                                <p className="font-semibold text-slate-800">{r.diagnosis}</p>
                                {r.treatment && <p className="text-sm text-slate-500 mt-0.5">Treatment: {r.treatment}</p>}
                                {r.surgery_type && <p className="text-sm text-red-500 mt-0.5"><i className="fas fa-cut mr-1" />Surgery: {r.surgery_type}</p>}
                              </div>
                              <span className="text-xs text-slate-400">{new Date(r.created_at).toLocaleDateString()}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="appointments">
                  {result.appointments.length === 0 ? (
                    <div className="text-center py-10 text-slate-400 bg-white rounded-xl border mt-4">
                      <i className="fas fa-calendar-times text-3xl mb-3" />
                      <p className="text-sm">No appointments</p>
                    </div>
                  ) : (
                    <div className="space-y-3 mt-4">
                      {result.appointments.map(a => (
                        <Card key={a.id}>
                          <CardContent className="p-4 flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm text-slate-800">{new Date(a.scheduled_at).toLocaleString()}</p>
                              {a.symptoms && <p className="text-xs text-slate-400">{a.symptoms}</p>}
                            </div>
                            <Badge className="capitalize text-xs">{a.status}</Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Add Medical Record Modal */}
      <Dialog open={showRecord} onOpenChange={setShowRecord}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle><i className="fas fa-file-medical mr-2 text-sky-500" />Add Medical Record</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Record Type</Label>
              <select className="mt-1 flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm" value={recordForm.record_type} onChange={setR('record_type')}>
                <option value="consultation">Consultation</option>
                <option value="surgery">Surgery</option>
                <option value="emergency">Emergency</option>
                <option value="follow_up">Follow Up</option>
                <option value="lab_result">Lab Result</option>
              </select>
            </div>
            <div><Label>Diagnosis *</Label><Input className="mt-1" required value={recordForm.diagnosis} onChange={setR('diagnosis')} /></div>
            <div><Label>Symptoms</Label><Textarea className="mt-1" rows={2} value={recordForm.symptoms} onChange={setR('symptoms')} /></div>
            <div><Label>Treatment</Label><Textarea className="mt-1" rows={2} value={recordForm.treatment} onChange={setR('treatment')} /></div>
            <div><Label>Vitals (BP, Temp, Weight...)</Label><Input className="mt-1" placeholder="120/80 mmHg, 37°C, 70kg" value={recordForm.vitals} onChange={setR('vitals')} /></div>
            {recordForm.record_type === 'surgery' && (
              <>
                <div><Label>Surgery Type</Label><Input className="mt-1" value={recordForm.surgery_type} onChange={setR('surgery_type')} /></div>
                <div><Label>Anesthesia Type</Label><Input className="mt-1" value={recordForm.anesthesia_type} onChange={setR('anesthesia_type')} /></div>
                <div><Label>Surgeon Notes</Label><Textarea className="mt-1" rows={2} value={recordForm.surgeon_notes} onChange={setR('surgeon_notes')} /></div>
              </>
            )}
            <div><Label>Notes</Label><Textarea className="mt-1" rows={2} value={recordForm.notes} onChange={setR('notes')} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRecord(false)}>Cancel</Button>
            <Button onClick={submitRecord} disabled={recordLoading} className="bg-sky-600 hover:bg-sky-700 text-white">
              {recordLoading ? 'Saving...' : 'Save Record'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Write Prescription Modal */}
      <Dialog open={showRx} onOpenChange={setShowRx}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle><i className="fas fa-prescription mr-2 text-green-500" />Write Prescription</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div><Label>Medicine Name *</Label><Input className="mt-1" required placeholder="e.g. Amoxicillin" value={rxForm.medicine_name} onChange={setRx('medicine_name')} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Dosage</Label><Input className="mt-1" placeholder="500mg" value={rxForm.dosage} onChange={setRx('dosage')} /></div>
              <div><Label>Frequency</Label><Input className="mt-1" placeholder="3x daily" value={rxForm.frequency} onChange={setRx('frequency')} /></div>
            </div>
            <div><Label>Duration</Label><Input className="mt-1" placeholder="7 days" value={rxForm.duration} onChange={setRx('duration')} /></div>
            <div><Label>Instructions</Label><Textarea className="mt-1" placeholder="Take after meals..." rows={2} value={rxForm.instructions} onChange={setRx('instructions')} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRx(false)}>Cancel</Button>
            <Button onClick={submitRx} disabled={rxLoading} className="bg-green-600 hover:bg-green-700 text-white">
              {rxLoading ? 'Saving...' : <><i className="fas fa-prescription mr-1.5" />Write Prescription</>}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
