import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const COMMON_SYMPTOMS = [
  'Fever', 'Headache', 'Cough', 'Chest Pain', 'Back Pain',
  'Stomach Ache', 'Fatigue', 'Shortness of Breath', 'Joint Pain', 'Skin Rash',
];

const Home: React.FC = () => {
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [customSymptom, setCustomSymptom] = useState('');
  const navigate = useNavigate();

  const toggleSymptom = (s: string) => {
    setSymptoms((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  };

  const addCustom = () => {
    const t = customSymptom.trim();
    if (t && !symptoms.includes(t)) {
      setSymptoms((prev) => [...prev, t]);
      setCustomSymptom('');
    }
  };

  const handleSearch = () => {
    if (symptoms.length > 0) {
      navigate(`/symptom-checker?symptoms=${symptoms.join(',')}`);
    }
  };

  return (
    <div>
      {/* Hero */}
      <section style={styles.hero}>
        <div style={styles.heroContent}>
          <div style={styles.heroBadge}>MID — Medical ID System</div>
          <h1 style={styles.heroTitle}>
            Your Health, <span style={{ color: '#0EA5E9' }}>Simplified</span>
          </h1>
          <p style={styles.heroSub}>
            Find the right doctor, track your health history, manage medicines and book
            appointments — all in one place with your unique Medical ID.
          </p>
          <div style={styles.heroActions}>
            <button onClick={() => navigate('/register')} style={styles.btnPrimary}>
              Get Your MID
            </button>
            <button onClick={() => navigate('/doctors')} style={styles.btnOutline}>
              Browse Doctors
            </button>
          </div>
        </div>
        <div style={styles.heroVisual}>
          <div style={styles.midCard}>
            <div style={styles.midCardHeader}>Medical ID Card</div>
            <div style={styles.midLine}><span>MID-PAT-26-482910</span></div>
            <div style={styles.midInfo}>John Doe • Blood: O+</div>
            <div style={styles.midInfo}>Age: 34 • Allergies: Penicillin</div>
            <div style={styles.midPulse} />
          </div>
        </div>
      </section>

      {/* Symptom Checker */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Symptom Checker</h2>
        <p style={styles.sectionSub}>Select your symptoms to get doctor & hospital recommendations</p>
        <div style={styles.symptomGrid}>
          {COMMON_SYMPTOMS.map((s) => (
            <button
              key={s}
              onClick={() => toggleSymptom(s)}
              style={{
                ...styles.symptomBtn,
                ...(symptoms.includes(s) ? styles.symptomBtnActive : {}),
              }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={styles.customInput}>
          <input
            value={customSymptom}
            onChange={(e) => setCustomSymptom(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            placeholder="Type a custom symptom..."
            style={styles.input}
          />
          <button onClick={addCustom} style={styles.addBtn}>Add</button>
        </div>
        {symptoms.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ marginBottom: 8, color: '#64748b', fontSize: 14 }}>
              Selected: {symptoms.map((s) => (
                <span key={s} style={styles.tag}>
                  {s} <span onClick={() => toggleSymptom(s)} style={{ cursor: 'pointer', marginLeft: 4 }}>×</span>
                </span>
              ))}
            </div>
            <button onClick={handleSearch} style={styles.btnPrimary}>
              Find Doctors & Hospitals →
            </button>
          </div>
        )}
      </section>

      {/* Stats */}
      <section style={{ ...styles.section, background: '#F8FAFC' }}>
        <div style={styles.statsGrid}>
          {[
            { label: 'Registered Doctors', value: '2,500+' },
            { label: 'Hospitals Onboarded', value: '450+' },
            { label: 'Patients Served', value: '1,00,000+' },
            { label: 'Appointments Booked', value: '5,00,000+' },
          ].map((stat) => (
            <div key={stat.label} style={styles.statCard}>
              <div style={styles.statValue}>{stat.value}</div>
              <div style={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section style={styles.section}>
        <h2 style={styles.sectionTitle}>Everything you need</h2>
        <div style={styles.featGrid}>
          {[
            { icon: '🆔', title: 'Unique Medical ID', desc: 'Every doctor, hospital, and patient gets a unique MID for fast identification.' },
            { icon: '📋', title: 'Medical History', desc: 'Complete treatment history, diagnoses, prescriptions tracked in one place.' },
            { icon: '🔍', title: 'Smart Suggestions', desc: 'Describe symptoms and get matched to the right specialists instantly.' },
            { icon: '📅', title: 'Easy Appointments', desc: 'Book and manage appointments with real-time slot availability.' },
            { icon: '💊', title: 'Medicine Manager', desc: 'Track prescriptions, dosages and get alerts for refills.' },
            { icon: '🏥', title: 'Hospital Finder', desc: 'Locate hospitals with the right departments near you.' },
          ].map((f) => (
            <div key={f.title} style={styles.featCard}>
              <div style={styles.featIcon}>{f.icon}</div>
              <h3 style={styles.featTitle}>{f.title}</h3>
              <p style={styles.featDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  hero: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '80px 80px',
    background: 'linear-gradient(135deg, #F0F9FF 0%, #E0F2FE 50%, #BAE6FD 100%)',
    minHeight: 520,
    gap: 40,
  },
  heroContent: { maxWidth: 560 },
  heroBadge: {
    display: 'inline-block',
    background: '#0EA5E9',
    color: '#fff',
    padding: '4px 14px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    marginBottom: 16,
    letterSpacing: 1,
  },
  heroTitle: { fontSize: 52, fontWeight: 800, color: '#0F172A', lineHeight: 1.15, margin: '0 0 16px' },
  heroSub: { fontSize: 17, color: '#475569', lineHeight: 1.6, marginBottom: 32 },
  heroActions: { display: 'flex', gap: 16 },
  heroVisual: { flexShrink: 0 },
  midCard: {
    background: 'linear-gradient(135deg, #0EA5E9, #0369A1)',
    color: '#fff',
    borderRadius: 20,
    padding: '32px 40px',
    width: 300,
    boxShadow: '0 20px 60px rgba(14,165,233,0.35)',
    position: 'relative',
    overflow: 'hidden',
  },
  midCardHeader: { fontSize: 12, letterSpacing: 2, opacity: 0.8, marginBottom: 20, textTransform: 'uppercase' },
  midLine: { fontSize: 18, fontWeight: 700, fontFamily: 'monospace', marginBottom: 16 },
  midInfo: { fontSize: 13, opacity: 0.85, marginBottom: 6 },
  midPulse: {
    position: 'absolute',
    right: -30,
    bottom: -30,
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.1)',
  },
  btnPrimary: {
    background: '#0EA5E9',
    color: '#fff',
    padding: '12px 28px',
    borderRadius: 10,
    border: 'none',
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
    transition: 'background 0.2s',
    textDecoration: 'none',
    display: 'inline-block',
  },
  btnOutline: {
    background: 'transparent',
    color: '#0EA5E9',
    border: '2px solid #0EA5E9',
    padding: '11px 26px',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 700,
    cursor: 'pointer',
  },
  section: { padding: '60px 80px' },
  sectionTitle: { fontSize: 30, fontWeight: 800, color: '#0F172A', textAlign: 'center', marginBottom: 8 },
  sectionSub: { textAlign: 'center', color: '#64748b', marginBottom: 32, fontSize: 15 },
  symptomGrid: { display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 20 },
  symptomBtn: {
    padding: '8px 18px',
    borderRadius: 999,
    border: '1.5px solid #CBD5E1',
    background: '#fff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 500,
    transition: 'all 0.2s',
  },
  symptomBtnActive: {
    background: '#0EA5E9',
    borderColor: '#0EA5E9',
    color: '#fff',
  },
  customInput: { display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 16 },
  input: {
    padding: '10px 16px',
    borderRadius: 8,
    border: '1.5px solid #CBD5E1',
    fontSize: 14,
    width: 280,
    outline: 'none',
  },
  addBtn: {
    padding: '10px 20px',
    background: '#0F172A',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
  tag: {
    background: '#EFF6FF',
    color: '#1D4ED8',
    padding: '2px 10px',
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 600,
    marginRight: 6,
    display: 'inline-block',
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: 24,
    maxWidth: 900,
    margin: '0 auto',
  },
  statCard: { textAlign: 'center', padding: '24px', background: '#fff', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  statValue: { fontSize: 32, fontWeight: 800, color: '#0EA5E9' },
  statLabel: { fontSize: 13, color: '#64748b', marginTop: 6 },
  featGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, maxWidth: 1000, margin: '32px auto 0' },
  featCard: { padding: 28, background: '#F8FAFC', borderRadius: 16 },
  featIcon: { fontSize: 36, marginBottom: 14 },
  featTitle: { fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 8 },
  featDesc: { fontSize: 14, color: '#64748b', lineHeight: 1.55 },
};

export default Home;
