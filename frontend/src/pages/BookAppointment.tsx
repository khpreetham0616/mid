import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorAPI, appointmentAPI } from '../services/api';
import { Doctor } from '../types';

const BookAppointment: React.FC = () => {
  const { doctorId } = useParams<{ doctorId: string }>();
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
      doctorAPI.getById(doctorId).then((r) => setDoctor(r.data)).catch(() => {});
    }
  }, [doctorId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doctorId || !date || !time) return;
    setLoading(true);
    setError('');
    try {
      const scheduledAt = new Date(`${date}T${time}:00`).toISOString();
      await appointmentAPI.book({
        doctor_id: doctorId,
        scheduled_at: scheduledAt,
        symptoms,
        notes,
        duration_minutes: 30,
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Booking failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const timeSlots = [];
  for (let h = 9; h <= 17; h++) {
    timeSlots.push(`${h.toString().padStart(2, '0')}:00`);
    timeSlots.push(`${h.toString().padStart(2, '0')}:30`);
  }

  return (
    <div style={styles.container}>
      <button onClick={() => navigate(-1)} style={styles.back}>← Back</button>
      <h1 style={styles.title}>Book Appointment</h1>

      {doctor && (
        <div style={styles.doctorCard}>
          <div style={styles.docAvatar}>{doctor.first_name[0]}{doctor.last_name[0]}</div>
          <div>
            <div style={styles.docName}>Dr. {doctor.first_name} {doctor.last_name}</div>
            <div style={styles.docSpec}>{doctor.specialization}</div>
            <div style={styles.docFee}>Consultation Fee: ₹{doctor.consult_fee}</div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label}>Select Date *</label>
          <input
            type="date"
            value={date}
            min={new Date().toISOString().split('T')[0]}
            onChange={(e) => setDate(e.target.value)}
            required
            style={styles.input}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Select Time *</label>
          <div style={styles.timeGrid}>
            {timeSlots.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setTime(slot)}
                style={{
                  ...styles.timeSlot,
                  ...(time === slot ? styles.timeSlotActive : {}),
                }}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Symptoms</label>
          <textarea
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            placeholder="Describe your symptoms..."
            style={styles.textarea}
            rows={3}
          />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label}>Additional Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any additional information..."
            style={styles.textarea}
            rows={2}
          />
        </div>

        {error && <div style={styles.error}>{error}</div>}

        <button type="submit" disabled={loading || !date || !time} style={styles.submitBtn}>
          {loading ? 'Booking...' : 'Confirm Appointment'}
        </button>
      </form>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '40px 80px', maxWidth: 700, margin: '0 auto' },
  back: { background: 'none', border: 'none', color: '#0EA5E9', cursor: 'pointer', fontSize: 14, fontWeight: 600, marginBottom: 16, padding: 0 },
  title: { fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 24 },
  doctorCard: { display: 'flex', gap: 16, background: '#F0F9FF', borderRadius: 14, padding: '18px 22px', marginBottom: 28, alignItems: 'center' },
  docAvatar: { width: 52, height: 52, borderRadius: '50%', background: '#BAE6FD', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0369A1', fontSize: 20, flexShrink: 0 },
  docName: { fontWeight: 700, color: '#0F172A', fontSize: 17 },
  docSpec: { color: '#64748b', fontSize: 13, marginTop: 2 },
  docFee: { color: '#0EA5E9', fontWeight: 600, fontSize: 14, marginTop: 4 },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: '#374151' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none' },
  timeGrid: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  timeSlot: {
    padding: '8px 14px',
    borderRadius: 8,
    border: '1.5px solid #E2E8F0',
    background: '#fff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  timeSlotActive: { background: '#0EA5E9', borderColor: '#0EA5E9', color: '#fff' },
  textarea: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none', resize: 'vertical', fontFamily: 'inherit' },
  error: { background: '#FEF2F2', color: '#B91C1C', padding: '10px 16px', borderRadius: 8, fontSize: 14 },
  submitBtn: {
    padding: '14px',
    background: '#0EA5E9',
    color: '#fff',
    border: 'none',
    borderRadius: 12,
    fontSize: 16,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default BookAppointment;
