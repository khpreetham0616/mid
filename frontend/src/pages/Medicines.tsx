import React, { useEffect, useState } from 'react';
import { medicineAPI } from '../services/api';
import { Medicine } from '../types';

const Medicines: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(false);

  const fetchMeds = async () => {
    setLoading(true);
    try {
      const res = await medicineAPI.list({ page, limit: 12, search: search || undefined });
      setMedicines(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setMedicines([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMeds(); }, [page, search]);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Medicine Directory</h1>
        <p style={styles.sub}>{total} medicines listed</p>
      </div>

      <div style={styles.searchRow}>
        <input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setSearch(searchInput); setPage(1); } }}
          placeholder="Search by name, category..."
          style={styles.input}
        />
        <button onClick={() => { setSearch(searchInput); setPage(1); }} style={styles.searchBtn}>Search</button>
        {search && <button onClick={() => { setSearch(''); setSearchInput(''); }} style={styles.clearBtn}>Clear</button>}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading medicines...</div>
      ) : (
        <div style={styles.grid}>
          {medicines.map((med) => (
            <div key={med.id} style={styles.card}>
              <div style={styles.cardTop}>
                <div style={styles.icon}>💊</div>
                <div style={{ ...styles.avail, color: med.is_available ? '#16A34A' : '#DC2626' }}>
                  {med.is_available ? 'Available' : 'Unavailable'}
                </div>
              </div>
              <h3 style={styles.name}>{med.name}</h3>
              {med.generic_name && <div style={styles.generic}>{med.generic_name}</div>}
              {med.category && (
                <div style={styles.category}>{med.category}</div>
              )}
              {med.manufacturer && (
                <div style={styles.meta}>🏭 {med.manufacturer}</div>
              )}
              {med.dosage && <div style={styles.meta}>📋 Dosage: {med.dosage}</div>}
              {med.description && (
                <p style={styles.desc}>{med.description.slice(0, 100)}{med.description.length > 100 ? '...' : ''}</p>
              )}
              <div style={styles.price}>₹{med.price}</div>
              {med.side_effects && (
                <div style={styles.sideEffects}>
                  ⚠️ <span style={{ fontSize: 12, color: '#92400E' }}>{med.side_effects.slice(0, 80)}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {Math.ceil(total / 12) > 1 && (
        <div style={styles.pagination}>
          {Array.from({ length: Math.ceil(total / 12) }, (_, i) => i + 1).map((p) => (
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
  input: { padding: '10px 16px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, width: 300, outline: 'none' },
  searchBtn: { padding: '10px 24px', background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  clearBtn: { padding: '10px 16px', background: '#F1F5F9', color: '#64748b', border: 'none', borderRadius: 10, cursor: 'pointer', fontSize: 14 },
  loading: { textAlign: 'center', padding: 60, color: '#94A3B8' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 18 },
  card: { background: '#fff', borderRadius: 16, padding: 22, boxShadow: '0 2px 10px rgba(0,0,0,0.07)', border: '1px solid #F1F5F9' },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  icon: { fontSize: 32 },
  avail: { fontSize: 12, fontWeight: 600 },
  name: { fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 4 },
  generic: { color: '#64748b', fontSize: 13, marginBottom: 8, fontStyle: 'italic' },
  category: { display: 'inline-block', background: '#F0F9FF', color: '#0369A1', fontSize: 11, fontWeight: 600, padding: '2px 10px', borderRadius: 999, marginBottom: 10 },
  meta: { color: '#64748b', fontSize: 12, marginBottom: 4 },
  desc: { color: '#374151', fontSize: 13, lineHeight: 1.5, marginBottom: 10 },
  price: { fontSize: 20, fontWeight: 800, color: '#0EA5E9', marginBottom: 8 },
  sideEffects: { background: '#FFFBEB', borderRadius: 8, padding: '6px 10px' },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 },
  pageBtn: { padding: '8px 14px', border: '1.5px solid #E2E8F0', background: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  pageBtnActive: { background: '#0EA5E9', borderColor: '#0EA5E9', color: '#fff' },
};

export default Medicines;
