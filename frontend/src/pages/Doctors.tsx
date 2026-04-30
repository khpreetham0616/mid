import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { Doctor } from '../types';
import StarRating from '../components/common/StarRating';
import Badge from '../components/common/Badge';

const SPECIALIZATIONS = [
  'All', 'Cardiologist', 'Neurologist', 'Orthopedic', 'Dermatologist',
  'Pediatrician', 'Gynecologist', 'Psychiatrist', 'ENT', 'Ophthalmologist',
  'Oncologist', 'General Physician',
];

const Doctors: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [spec, setSpec] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const res = await doctorAPI.list({ page, limit: 12, specialization: spec || undefined });
      setDoctors(res.data.data || []);
      setTotal(res.data.total || 0);
    } catch {
      setDoctors([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDoctors(); }, [page, spec]);

  const totalPages = Math.ceil(total / 12);

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Find a Doctor</h1>
        <p style={styles.sub}>{total} doctors available</p>
      </div>

      <div style={styles.filters}>
        {SPECIALIZATIONS.map((s) => (
          <button
            key={s}
            onClick={() => { setSpec(s === 'All' ? '' : s); setPage(1); }}
            style={{
              ...styles.filterBtn,
              ...(spec === (s === 'All' ? '' : s) ? styles.filterBtnActive : {}),
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={styles.loading}>Loading doctors...</div>
      ) : (
        <div style={styles.grid}>
          {doctors.map((doc) => (
            <div
              key={doc.id}
              style={styles.card}
              onClick={() => navigate(`/doctors/${doc.id}`)}
            >
              <div style={styles.cardTop}>
                <div style={styles.avatar}>
                  {doc.profile_image ? (
                    <img src={doc.profile_image} alt={doc.first_name} style={styles.avatarImg} />
                  ) : (
                    <span style={styles.avatarInitial}>
                      {doc.first_name[0]}{doc.last_name[0]}
                    </span>
                  )}
                  {doc.is_available && <div style={styles.onlineDot} />}
                </div>
                <div style={styles.midTag}>MID: {doc.mid}</div>
              </div>
              <h3 style={styles.doctorName}>Dr. {doc.first_name} {doc.last_name}</h3>
              <div style={{ marginBottom: 8 }}>
                <Badge label={doc.specialization} color="blue" />
              </div>
              <p style={styles.qualification}>{doc.qualification}</p>
              <div style={styles.meta}>
                <span>{doc.experience_years} yrs exp</span>
                <span>₹{doc.consult_fee}</span>
              </div>
              <StarRating rating={doc.rating} />
              {doc.symptoms && doc.symptoms.length > 0 && (
                <div style={styles.symptomsRow}>
                  {doc.symptoms.slice(0, 3).map((s) => (
                    <span key={s.id} style={styles.symTag}>{s.name}</span>
                  ))}
                  {doc.symptoms.length > 3 && (
                    <span style={styles.symTag}>+{doc.symptoms.length - 3}</span>
                  )}
                </div>
              )}
              <button style={styles.bookBtn}>Book Appointment</button>
            </div>
          ))}
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
  filters: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 32 },
  filterBtn: {
    padding: '6px 16px',
    borderRadius: 999,
    border: '1.5px solid #E2E8F0',
    background: '#fff',
    color: '#374151',
    cursor: 'pointer',
    fontSize: 13,
    fontWeight: 500,
  },
  filterBtnActive: { background: '#0EA5E9', borderColor: '#0EA5E9', color: '#fff' },
  loading: { textAlign: 'center', padding: 60, color: '#94A3B8', fontSize: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 },
  card: {
    background: '#fff',
    borderRadius: 16,
    padding: '24px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    border: '1px solid #F1F5F9',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 },
  avatar: { width: 56, height: 56, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' },
  avatarImg: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' },
  avatarInitial: { fontSize: 20, fontWeight: 700, color: '#0EA5E9' },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: '50%', background: '#22C55E', border: '2px solid #fff' },
  midTag: { fontSize: 11, color: '#94A3B8', fontFamily: 'monospace', background: '#F8FAFC', padding: '2px 8px', borderRadius: 4 },
  doctorName: { fontSize: 17, fontWeight: 700, color: '#0F172A', marginBottom: 8 },
  qualification: { fontSize: 12, color: '#64748b', marginBottom: 8 },
  meta: { display: 'flex', justifyContent: 'space-between', color: '#64748b', fontSize: 13, marginBottom: 8 },
  symptomsRow: { display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 10, marginBottom: 6 },
  symTag: { background: '#F0FDF4', color: '#15803D', padding: '2px 8px', borderRadius: 999, fontSize: 11 },
  bookBtn: {
    marginTop: 14,
    width: '100%',
    padding: '9px',
    background: '#0EA5E9',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontWeight: 600,
    cursor: 'pointer',
    fontSize: 14,
  },
  pagination: { display: 'flex', gap: 8, justifyContent: 'center', marginTop: 40 },
  pageBtn: { padding: '8px 14px', border: '1.5px solid #E2E8F0', background: '#fff', borderRadius: 8, cursor: 'pointer', fontSize: 14 },
  pageBtnActive: { background: '#0EA5E9', borderColor: '#0EA5E9', color: '#fff' },
};

export default Doctors;
