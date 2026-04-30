import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { patientAPI } from '@/services/api';
import type { MedicalRecord } from '@/types';

const recordTypeColors: Record<string, string> = {
  consultation: 'info',
  surgery: 'destructive',
  emergency: 'destructive',
  follow_up: 'success',
  lab_result: 'warning',
};

const recordTypeIcons: Record<string, string> = {
  consultation: 'fa-stethoscope',
  surgery: 'fa-cut',
  emergency: 'fa-ambulance',
  follow_up: 'fa-calendar-check',
  lab_result: 'fa-flask',
};

export default function PatientHistory() {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    patientAPI.getMedicalHistory()
      .then(r => setRecords(r.data.data ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-extrabold text-slate-900 mb-6"><i className="fas fa-file-medical mr-2 text-purple-500" />Medical History</h1>

        {loading ? (
          <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" /></div>
        ) : records.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <i className="fas fa-file-medical-alt text-5xl mb-4" />
            <p className="text-lg font-medium">No medical records yet</p>
            <p className="text-sm mt-1">Visit a doctor to create your first record</p>
          </div>
        ) : (
          <div className="space-y-4">
            {records.map((r, i) => (
              <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${r.record_type === 'surgery' || r.record_type === 'emergency' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                        <i className={`fas ${recordTypeIcons[r.record_type] ?? 'fa-file-medical'} text-lg`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant={(recordTypeColors[r.record_type] ?? 'default') as 'info' | 'destructive' | 'success' | 'warning' | 'default'} className="capitalize text-xs">{r.record_type}</Badge>
                          <span className="text-xs text-slate-400"><i className="fas fa-clock mr-1" />{new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                          {r.doctor && <span className="text-xs text-slate-500"><i className="fas fa-user-md mr-1" />Dr. {r.doctor.first_name} {r.doctor.last_name}</span>}
                        </div>
                        <h3 className="font-semibold text-slate-800 mb-1">{r.diagnosis}</h3>
                        {r.symptoms && <p className="text-sm text-slate-500 mb-1"><span className="font-medium">Symptoms:</span> {r.symptoms}</p>}
                        {r.treatment && <p className="text-sm text-slate-500 mb-1"><span className="font-medium">Treatment:</span> {r.treatment}</p>}
                        {r.notes && <p className="text-sm text-slate-400 italic">{r.notes}</p>}
                        {r.record_type === 'surgery' && r.surgery_type && (
                          <div className="mt-2 p-3 rounded-lg bg-red-50 border border-red-100">
                            <p className="text-xs font-semibold text-red-700 mb-1"><i className="fas fa-cut mr-1" />Surgery Details</p>
                            <p className="text-xs text-red-600">Type: {r.surgery_type}</p>
                            {r.anesthesia_type && <p className="text-xs text-red-600">Anesthesia: {r.anesthesia_type}</p>}
                            {r.surgeon_notes && <p className="text-xs text-red-600">Notes: {r.surgeon_notes}</p>}
                          </div>
                        )}
                        {r.vitals && <p className="text-xs text-slate-400 mt-2"><i className="fas fa-heartbeat mr-1" />Vitals: {r.vitals}</p>}
                        {r.follow_up_date && <p className="text-xs text-blue-500 mt-1"><i className="fas fa-calendar mr-1" />Follow-up: {new Date(r.follow_up_date).toLocaleDateString()}</p>}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </PageLayout>
  );
}
