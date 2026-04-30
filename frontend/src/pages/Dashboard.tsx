import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { patientAPI, appointmentAPI, medicineAPI } from '../services/api';
import { Patient, Appointment, MedicalRecord } from '../types';
import { useAuth } from '../context/AuthContext';
import Badge from '../components/common/Badge';

const Dashboard: React.FC = () => {
  const { patient: authPatient } = useAuth();
  const [profile, setProfile] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [history, setHistory] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'appointments' | 'history' | 'prescriptions'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    patientAPI.getProfile().then((r) => setProfile(r.data)).catch(() => {});
    appointmentAPI.myAppointments().then((r) => setAppointments(r.data.data || [])).catch(() => {});
    patientAPI.getMedicalHistory().then((r) => setHistory(r.data.data || [])).catch(() => {});
    medicineAPI.getPrescriptions().then((r) => setPrescriptions(r.data.data || [])).catch(() => {});
  }, []);

  const upcomingAppts = appointments.filter((a) =>
    ['pending', 'confirmed'].includes(a.status)
  );

  const statusColor: Record<string, 'blue' | 'green' | 'orange' | 'red' | 'gray'> = {
    pending: 'orange',
    confirmed: 'blue',
    completed: 'green',
    cancelled: 'red',
  };

  if (!profile) return <div style={styles.loading}>Loading dashboard...</div>;

  return (
    <div style={styles.container}>
      {/* Profile banner */}
      <div style={styles.banner}>
        <div style={styles.bannerAvatar}>
          {profile.first_name[0]}{profile.last_name[0]}
        </div>
        <div>
          <div style={styles.midBadge}>MID: {profile.mid}</div>
          <h1 style={styles.bannerName}>{profile.first_name} {profile.last_name}</h1>
          <div style={styles.bannerMeta}>
            <span>🩸 {profile.blood_group || 'N/A'}</span>
            <span>⚧ {profile.gender || 'N/A'}</span>
            <span>📧 {profile.email}</span>
            <span>📞 {profile.phone || 'N/A'}</span>
          </div>
        </div>
        <button onClick={() => navigate('/book')} style={styles.bookBtn}>
          + Book Appointment
        </button>
      </div>

      {/* Quick stats */}
      <div style={styles.statsRow}>
        {[
          { label: 'Appointments', value: appointments.length, icon: '📅' },
          { label: 'Upcoming', value: upcomingAppts.length, icon: '⏰' },
          { label: 'Medical Records', value: history.length, icon: '📋' },
          { label: 'Prescriptions', value: prescriptions.length, icon: '💊' },
        ].map((s) => (
          <div key={s.label} style={styles.statCard}>
            <div style={styles.statIcon}>{s.icon}</div>
            <div style={styles.statValue}>{s.value}</div>
            <div style={styles.statLabel}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['overview', 'appointments', 'history', 'prescriptions'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div style={styles.tabContent}>
        {activeTab === 'overview' && (
          <div>
            <h3 style={styles.sectionTitle}>Personal Details</h3>
            <div style={styles.infoGrid}>
              {[
                ['Full Name', `${profile.first_name} ${profile.last_name}`],
                ['Email', profile.email],
                ['Phone', profile.phone || 'N/A'],
                ['Blood Group', profile.blood_group || 'N/A'],
                ['Gender', profile.gender || 'N/A'],
                ['City', profile.city || 'N/A'],
                ['Allergies', profile.allergies || 'None'],
                ['Chronic Diseases', profile.chronic_diseases || 'None'],
              ].map(([label, value]) => (
                <div key={label} style={styles.infoCard}>
                  <div style={styles.infoLabel}>{label}</div>
                  <div style={styles.infoValue}>{value}</div>
                </div>
              ))}
            </div>

            {upcomingAppts.length > 0 && (
              <div style={{ marginTop: 28 }}>
                <h3 style={styles.sectionTitle}>Upcoming Appointments</h3>
                {upcomingAppts.slice(0, 3).map((a) => (
                  <div key={a.id} style={styles.apptCard}>
                    <div>
                      <div style={styles.apptDoctor}>
                        Dr. {a.doctor?.first_name} {a.doctor?.last_name}
                      </div>
                      <div style={styles.apptMeta}>
                        {a.doctor?.specialization} • {a.hospital?.name}
                      </div>
                      <div style={styles.apptTime}>
                        📅 {new Date(a.scheduled_at).toLocaleString()}
                      </div>
                    </div>
                    <Badge label={a.status} color={statusColor[a.status] || 'gray'} />
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'appointments' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={styles.sectionTitle}>All Appointments</h3>
              <button onClick={() => navigate('/book')} style={styles.addBtn}>+ New</button>
            </div>
            {appointments.length === 0 ? (
              <p style={{ color: '#94A3B8' }}>No appointments yet.</p>
            ) : appointments.map((a) => (
              <div key={a.id} style={styles.apptCard}>
                <div style={{ flex: 1 }}>
                  <div style={styles.apptDoctor}>
                    Dr. {a.doctor?.first_name} {a.doctor?.last_name}
                  </div>
                  <div style={styles.apptMeta}>
                    {a.doctor?.specialization} {a.hospital && `• ${a.hospital.name}`}
                  </div>
                  <div style={styles.apptTime}>📅 {new Date(a.scheduled_at).toLocaleString()}</div>
                  {a.symptoms && <div style={styles.apptMeta}>Symptoms: {a.symptoms}</div>}
                </div>
                <Badge label={a.status} color={statusColor[a.status] || 'gray'} />
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div>
            <h3 style={styles.sectionTitle}>Medical History</h3>
            {history.length === 0 ? (
              <p style={{ color: '#94A3B8' }}>No medical records yet.</p>
            ) : history.map((r) => (
              <div key={r.id} style={styles.recordCard}>
                <div style={styles.recordHeader}>
                  <div>
                    <div style={styles.diagnosis}>{r.diagnosis}</div>
                    <div style={styles.recordMeta}>
                      Dr. {r.doctor?.first_name} {r.doctor?.last_name} • {new Date(r.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
                {r.symptoms && <div style={styles.recordField}><b>Symptoms:</b> {r.symptoms}</div>}
                {r.treatment && <div style={styles.recordField}><b>Treatment:</b> {r.treatment}</div>}
                {r.notes && <div style={styles.recordField}><b>Notes:</b> {r.notes}</div>}
                {r.follow_up_date && (
                  <div style={styles.followUp}>Follow-up: {new Date(r.follow_up_date).toLocaleDateString()}</div>
                )}
              </div>
            ))}
          </div>
        )}

        {activeTab === 'prescriptions' && (
          <div>
            <h3 style={styles.sectionTitle}>Prescriptions</h3>
            {prescriptions.length === 0 ? (
              <p style={{ color: '#94A3B8' }}>No prescriptions yet.</p>
            ) : prescriptions.map((p) => (
              <div key={p.id} style={styles.prescCard}>
                <div style={styles.medName}>{p.medicine?.name}</div>
                <div style={styles.medGeneric}>{p.medicine?.generic_name}</div>
                <div style={styles.prescMeta}>
                  <span>💊 {p.dosage}</span>
                  <span>🔁 {p.frequency}</span>
                  <span>⏱ {p.duration}</span>
                </div>
                {p.instructions && <div style={styles.recordField}>Instructions: {p.instructions}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '40px 80px', maxWidth: 1100, margin: '0 auto' },
  loading: { textAlign: 'center', padding: 80, color: '#94A3B8' },
  banner: {
    display: 'flex',
    alignItems: 'center',
    gap: 24,
    background: 'linear-gradient(135deg, #0EA5E9, #0369A1)',
    borderRadius: 20,
    padding: '28px 32px',
    marginBottom: 24,
    color: '#fff',
  },
  bannerAvatar: {
    width: 72, height: 72, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 800, flexShrink: 0,
  },
  midBadge: { fontSize: 11, background: 'rgba(255,255,255,0.2)', padding: '2px 10px', borderRadius: 999, display: 'inline-block', marginBottom: 6, fontFamily: 'monospace' },
  bannerName: { fontSize: 24, fontWeight: 800, marginBottom: 8 },
  bannerMeta: { display: 'flex', gap: 20, fontSize: 13, opacity: 0.9, flexWrap: 'wrap' },
  bookBtn: { marginLeft: 'auto', padding: '10px 22px', background: '#fff', color: '#0EA5E9', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', fontSize: 14 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 },
  statCard: { background: '#fff', borderRadius: 16, padding: '20px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statIcon: { fontSize: 28, marginBottom: 8 },
  statValue: { fontSize: 28, fontWeight: 800, color: '#0EA5E9' },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 4 },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1.5px solid #E2E8F0' },
  tab: { padding: '10px 24px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#64748b', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: -1.5 },
  tabActive: { borderBottomColor: '#0EA5E9', color: '#0EA5E9' },
  tabContent: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 16 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 },
  infoCard: { background: '#F8FAFC', borderRadius: 10, padding: '14px 18px' },
  infoLabel: { fontSize: 11, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 4 },
  infoValue: { fontSize: 15, fontWeight: 600, color: '#0F172A' },
  apptCard: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#F8FAFC', borderRadius: 12, padding: '16px 20px', marginBottom: 10, border: '1px solid #E2E8F0' },
  apptDoctor: { fontWeight: 700, color: '#0F172A', fontSize: 15 },
  apptMeta: { color: '#64748b', fontSize: 13, marginTop: 2 },
  apptTime: { color: '#0EA5E9', fontSize: 13, marginTop: 4 },
  addBtn: { padding: '8px 18px', background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 },
  recordCard: { background: '#F8FAFC', borderRadius: 12, padding: '20px', marginBottom: 14, border: '1px solid #E2E8F0' },
  recordHeader: { display: 'flex', justifyContent: 'space-between', marginBottom: 10 },
  diagnosis: { fontSize: 16, fontWeight: 700, color: '#0F172A' },
  recordMeta: { color: '#64748b', fontSize: 13, marginTop: 2 },
  recordField: { color: '#374151', fontSize: 14, marginTop: 8, lineHeight: 1.5 },
  followUp: { marginTop: 8, color: '#0EA5E9', fontSize: 13, fontWeight: 600 },
  prescCard: { background: '#F8FAFC', borderRadius: 12, padding: '18px 20px', marginBottom: 10, border: '1px solid #E2E8F0' },
  medName: { fontSize: 16, fontWeight: 700, color: '#0F172A' },
  medGeneric: { color: '#64748b', fontSize: 13, marginBottom: 8 },
  prescMeta: { display: 'flex', gap: 20, fontSize: 13, color: '#374151' },
};

export default Dashboard;
