import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { hospitalAPI } from '../services/api';
import { Hospital } from '../types';
import StarRating from '../components/common/StarRating';
import Badge from '../components/common/Badge';

const Hospitals: React.FC = () => {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [city, setCity] = useState('');
  const [cityInput, setCityInput] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchHospitals = async () => {
    setLoading(true);
    try {
      const res = await hospitalAPI.list({ page, limit: 9, city: city || undefined });
      setHospitals(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setHospitals([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchHospitals(); }, [page, city]);

  const totalPages = Math.ceil(total / 9);

  const parseDepts = (raw: string): string[] => {
    try { return JSON.parse(raw); } catch { return raw ? raw.split(',').map(s => s.trim()) : []; }
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Find a Hospital</h1>
        <p style={styles.sub}>{total} hospitals listed</p>
      </div>

      <div style={styles.searchRow}>
        <input
          value={cityInput}
          onChange={(e) => setCityInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setCity(cityInput); setPage(1); } }}
          placeholder="Search by city..."
          style={styles.input}
        />
        <button onClick={() => { setCity(cityInput); setPage(1); }} style={styles.searchBtn}>
          Search
        </button>
        {city && (
          <button onClick={() => { setCity(''); setCityInput(''); setPage(1); }} style={styles.clearBtn}>
            Clear
          </button>
        )}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading hospitals...</div>
      ) : (
        <div style={styles.grid}>
          {hospitals.map((h) => {
            const depts = parseDepts(h.departments);
            return (
              <div key={h.id} style={styles.card} onClick={() => navigate(`/hospitals/${h.id}`)}>
                <div style={styles.cardTop}>
                  <div style={styles.hospIcon}>🏥</div>
                  <div style={styles.midTag}>MID: {h.mid}</div>
                </div>
                <h3 style={styles.name}>{h.name}</h3>
                <div style={{ marginBottom: 8 }}>
                  <Badge label={h.type} color="orange" />
                </div>
                <div style={styles.location}>📍 {h.city}, {h.state}</div>
                <div style={styles.meta}>
                  <span>🛏 {h.beds} beds</span>
                  <span>📞 {h.phone}</span>
                </div>
                <StarRating rating={h.rating} />
                {depts.length > 0 && (
                  <div style={styles.deptRow}>
                    {depts.slice(0, 3).map((d) => (
                      <span key={d} style={styles.deptTag}>{d}</span>
                    ))}
                    {depts.length > 3 && <span style={styles.deptTag}>+{depts.length - 3}</span>}
                  </div>
                )}
                <div style={styles.doctorCount}>
                  {h.doctors?.length || 0} doctors affiliated
                </div>
              </div>
            );
          })}
        </div>
      )}

      {totalPages > 1 && (
        <div style={styles.pagination}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{ ...styles.pageBtn, ...(p === page ? styles.pageBtnActive : {}) }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '40px 80px', maxWidth: 1300, margin: '0 auto' },
  header: { marginBottom: 24 },
  title: { fontSize: 32, fontWeight: 800, color: '#0F172A', marginBottom: 4 },
  sub: { color: '#64748b', fontSize: 15 },
  searchRow: { display: 'flex', gap: 10, marginBottom: 32 },
  input: { padding: '10px 16px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, width: 260, outline: 'none' },
  searchBtn: { padding: '10px 24px', background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  clearBtn: { padding: '10px 16px', background: '#F1F5F9', color: '#64748b', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14 },
  loading: { textAlign: 'center', padding: 60, color: '#94A3B8' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: 24,
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    cursor: 'pointer',
    border: '1px solid #F1F5F9',
    transition: 'transform 0.2s',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  hospIcon: { fontSize: 36 },
  midTag: { fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', background: '#F8FAFC', padding: '2px 8px', borderRadius: 4 },
  name: { fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 8 },
  location: { color: '#64748b', fontSize: 13, marginBottom: 10 },
  meta: { display: 'flex', gap: 20, color: '#64748b', fontSize: 13, marginBottom: 10 },
  deptRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10 },
  deptTag: { background: '#F0F9FF', color: '#0369A1', fontSize: 11, padding: '2px 8px', borderRadius: 999 },
  doctorCount: { marginTop: 10, fontSize: 13, color: '#64748b', fontWeight: 500 },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 },
  pageBtn: { padding: '8px 14px', border: '1.5px solid #E2E8F0', background: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  pageBtnActive: { background: '#0EA5E9', borderColor: '#0EA5E9', color: '#fff' },
};

export default Hospitals;
