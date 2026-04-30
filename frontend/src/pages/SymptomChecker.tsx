import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { suggestionAPI } from '../services/api';
import { SuggestionResult } from '../types';
import StarRating from '../components/common/StarRating';
import Badge from '../components/common/Badge';

const SymptomChecker: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [result, setResult] = useState<SuggestionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState<'doctors' | 'hospitals'>('doctors');

  useEffect(() => {
    const s = searchParams.get('symptoms');
    if (s) {
      const list = s.split(',').map((x) => x.trim()).filter(Boolean);
      setSymptoms(list);
      fetchSuggestions(list);
    }
  }, []);

  const fetchSuggestions = async (list: string[]) => {
    if (!list.length) return;
    setLoading(true);
    try {
      const res = await suggestionAPI.suggest(list);
      setResult(res.data);
    } catch {
      setResult({ doctors: [], hospitals: [] });
    } finally {
      setLoading(false);
    }
  };

  const addSymptom = () => {
    const t = input.trim();
    if (t && !symptoms.includes(t)) {
      const updated = [...symptoms, t];
      setSymptoms(updated);
      setInput('');
      fetchSuggestions(updated);
    }
  };

  const removeSymptom = (s: string) => {
    const updated = symptoms.filter((x) => x !== s);
    setSymptoms(updated);
    if (updated.length) fetchSuggestions(updated);
    else setResult(null);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Symptom Checker</h1>
      <p style={styles.sub}>Enter your symptoms to find the right doctors and hospitals</p>

      <div style={styles.inputRow}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addSymptom()}
          placeholder="e.g. Chest pain, Shortness of breath..."
          style={styles.input}
        />
        <button onClick={addSymptom} style={styles.addBtn}>Add Symptom</button>
      </div>

      {symptoms.length > 0 && (
        <div style={styles.symptomsRow}>
          <span style={{ color: '#64748b', fontSize: 14, marginRight: 8 }}>Symptoms:</span>
          {symptoms.map((s) => (
            <span key={s} style={styles.tag}>
              {s}
              <span onClick={() => removeSymptom(s)} style={{ marginLeft: 6, cursor: 'pointer', opacity: 0.7 }}>×</span>
            </span>
          ))}
        </div>
      )}

      {loading && <div style={styles.loading}>Searching for matches...</div>}

      {result && !loading && (
        <div>
          <div style={styles.tabs}>
            {(['doctors', 'hospitals'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
              >
                {tab === 'doctors' ? `Doctors (${result.doctors.length})` : `Hospitals (${result.hospitals.length})`}
              </button>
            ))}
          </div>

          {activeTab === 'doctors' && (
            <div style={styles.grid}>
              {result.doctors.length === 0 ? (
                <p style={{ color: '#94A3B8', gridColumn: '1/-1' }}>No matching doctors found.</p>
              ) : result.doctors.map((doc) => (
                <div key={doc.id} style={styles.card} onClick={() => navigate(`/doctors/${doc.id}`)}>
                  <div style={styles.docAvatar}>{doc.first_name[0]}{doc.last_name[0]}</div>
                  <div>
                    <div style={styles.docName}>Dr. {doc.first_name} {doc.last_name}</div>
                    <Badge label={doc.specialization} color="blue" />
                  </div>
                  <div style={styles.cardMeta}>
                    <span>{doc.experience_years} yrs</span>
                    <span>₹{doc.consult_fee}</span>
                  </div>
                  <StarRating rating={doc.rating} />
                  <button style={styles.bookBtn} onClick={(e) => { e.stopPropagation(); navigate(`/book/${doc.id}`); }}>
                    Book
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'hospitals' && (
            <div style={styles.grid}>
              {result.hospitals.length === 0 ? (
                <p style={{ color: '#94A3B8', gridColumn: '1/-1' }}>No matching hospitals found.</p>
              ) : result.hospitals.map((h) => (
                <div key={h.id} style={styles.card} onClick={() => navigate(`/hospitals/${h.id}`)}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>🏥</div>
                  <div style={styles.docName}>{h.name}</div>
                  <Badge label={h.type} color="orange" />
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 8 }}>
                    📍 {h.city}, {h.state}
                  </div>
                  <StarRating rating={h.rating} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '40px 80px', maxWidth: 1200, margin: '0 auto' },
  title: { fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 8 },
  sub: { color: '#64748b', fontSize: 15, marginBottom: 28 },
  inputRow: { display: 'flex', gap: 10, marginBottom: 20 },
  input: { padding: '12px 18px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 15, width: 380, outline: 'none' },
  addBtn: { padding: '12px 24px', background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  symptomsRow: { display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 28 },
  tag: { background: '#EFF6FF', color: '#1D4ED8', padding: '4px 12px', borderRadius: 999, fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center' },
  loading: { textAlign: 'center', padding: 60, color: '#94A3B8' },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1.5px solid #E2E8F0' },
  tab: { padding: '10px 24px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#64748b', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: -1.5 },
  tabActive: { borderBottomColor: '#0EA5E9', color: '#0EA5E9' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18 },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 20,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    border: '1px solid #F1F5F9',
  },
  docAvatar: { width: 52, height: 52, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0EA5E9', fontSize: 20 },
  docName: { fontWeight: 700, color: '#0F172A', fontSize: 16, marginBottom: 4 },
  cardMeta: { display: 'flex', gap: 16, color: '#64748b', fontSize: 13 },
  bookBtn: { marginTop: 8, padding: '8px', background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13 },
};

export default SymptomChecker;
