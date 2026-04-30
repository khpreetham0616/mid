import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { doctorAPI, appointmentAPI } from '@/services/api';
import type { Doctor } from '@/types';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00'];

export default function BookAppointment() {
  const { doctorId } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [symptoms, setSymptoms] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (doctorId) {
      doctorAPI.getById(doctorId).then(r => setDoctor(r.data)).catch(() => {});
    }
  }, [doctorId]);

  const handleBook = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!time || !date) { setError('Please select date and time.'); return; }
    setLoading(true);
    setError('');
    const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
    try {
      await appointmentAPI.book({ doctor_id: doctorId, scheduled_at: scheduledAt, symptoms, notes, consult_fee: doctor?.consult_fee ?? 0 });
      navigate('/patient/appointments');
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: string } } };
      setError(e.response?.data?.error ?? 'Booking failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PageLayout>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-extrabold text-slate-900 mb-6"><i className="fas fa-calendar-plus mr-2 text-blue-500" />Book Appointment</h1>

        {doctor && (
          <Card className="mb-6">
            <CardContent className="p-4 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-indigo-100 flex items-center justify-center text-2xl font-bold text-indigo-600">{doctor.first_name[0]}</div>
              <div>
                <h2 className="font-bold text-slate-800">Dr. {doctor.first_name} {doctor.last_name}</h2>
                <p className="text-sm text-slate-500">{doctor.specialization} • {doctor.experience_years} yrs</p>
                <p className="text-sm font-semibold text-green-600 mt-0.5">₹{doctor.consult_fee} consultation fee</p>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader><CardTitle><i className="fas fa-calendar-alt mr-2 text-blue-500" />Select Date & Time</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={handleBook} className="space-y-5">
              <div>
                <Label>Select Date *</Label>
                <Input type="date" className="mt-1.5" value={date} onChange={e => setDate(e.target.value)} min={new Date().toISOString().split('T')[0]} required />
              </div>
              <div>
                <Label>Select Time Slot *</Label>
                <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mt-2">
                  {TIME_SLOTS.map(t => (
                    <button key={t} type="button" onClick={() => setTime(t)}
                      className={`py-2 px-1 rounded-lg text-xs font-medium border-2 transition-all ${time === t ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-600 hover:border-blue-300'}`}>
                      {t}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <Label>Symptoms</Label>
                <Input className="mt-1.5" placeholder="e.g. fever, headache, chest pain" value={symptoms} onChange={e => setSymptoms(e.target.value)} />
              </div>
              <div>
                <Label>Additional Notes</Label>
                <Textarea className="mt-1.5" placeholder="Any other details for the doctor..." value={notes} onChange={e => setNotes(e.target.value)} rows={3} />
              </div>

              {error && <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-sm"><i className="fas fa-exclamation-circle" />{error}</div>}

              <Button type="submit" className="w-full" variant="gradient" size="lg" disabled={loading}>
                {loading ? <><i className="fas fa-spinner fa-spin mr-2" />Booking...</> : <><i className="fas fa-calendar-check mr-2" />Confirm Booking</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </PageLayout>
  );
}
