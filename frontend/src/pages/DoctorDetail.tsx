import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doctorAPI } from '../services/api';
import { Doctor } from '../types';
import StarRating from '../components/common/StarRating';
import Badge from '../components/common/Badge';
import { useAuth } from '../context/AuthContext';

const DoctorDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'hospitals' | 'diseases'>('overview');
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (!id) return;
    doctorAPI.getById(id)
      .then((res) => setDoctor(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!doctor) return <div style={styles.loading}>Doctor not found</div>;

  return (
    <div style={styles.container}>
      {/* Profile Header */}
      <div style={styles.profileCard}>
        <div style={styles.avatarWrap}>
          {doctor.profile_image ? (
            <img src={doctor.profile_image} alt={doctor.first_name} style={styles.avatar} />
          ) : (
            <div style={styles.avatarPlaceholder}>
              {doctor.first_name[0]}{doctor.last_name[0]}
            </div>
          )}
          {doctor.is_available && <div style={styles.availBadge}>Available</div>}
        </div>
        <div style={styles.profileInfo}>
          <div style={styles.midChip}>MID: {doctor.mid}</div>
          <h1 style={styles.name}>Dr. {doctor.first_name} {doctor.last_name}</h1>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <Badge label={doctor.specialization} color="blue" />
            <Badge label={`${doctor.experience_years} yrs exp`} color="green" />
          </div>
          <p style={styles.qualification}>{doctor.qualification}</p>
          <StarRating rating={doctor.rating} size={16} />
          <div style={styles.contactRow}>
            <span>📧 {doctor.email}</span>
            <span>📞 {doctor.phone}</span>
            <span>💰 ₹{doctor.consult_fee} / consult</span>
          </div>
        </div>
        <div style={styles.bookBox}>
          <div style={styles.feeLabel}>Consultation Fee</div>
          <div style={styles.feeValue}>₹{doctor.consult_fee}</div>
          <button
            onClick={() => isAuthenticated ? navigate(`/book/${doctor.id}`) : navigate('/login')}
            style={styles.bookBtn}
          >
            Book Appointment
          </button>
          {!isAuthenticated && (
            <p style={{ fontSize: 12, color: '#94A3B8', marginTop: 8, textAlign: 'center' }}>
              Login required to book
            </p>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div style={styles.tabs}>
        {(['overview', 'hospitals', 'diseases'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{ ...styles.tab, ...(activeTab === tab ? styles.tabActive : {}) }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={styles.tabContent}>
        {activeTab === 'overview' && (
          <div>
            {doctor.bio && (
              <div style={styles.section}>
                <h3 style={styles.sectionTitle}>About</h3>
                <p style={styles.bio}>{doctor.bio}</p>
              </div>
            )}
            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Specialization</div>
                <div style={styles.infoValue}>{doctor.specialization}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Experience</div>
                <div style={styles.infoValue}>{doctor.experience_years} years</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Qualification</div>
                <div style={styles.infoValue}>{doctor.qualification || 'N/A'}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Status</div>
                <div style={{ ...styles.infoValue, color: doctor.is_available ? '#16A34A' : '#DC2626' }}>
                  {doctor.is_available ? 'Available' : 'Unavailable'}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div>
            <h3 style={styles.sectionTitle}>Affiliated Hospitals</h3>
            {doctor.hospitals && doctor.hospitals.length > 0 ? (
              <div style={styles.hospitalList}>
                {doctor.hospitals.map((h) => (
                  <div key={h.id} style={styles.hospitalCard} onClick={() => navigate(`/hospitals/${h.id}`)}>
                    <div style={styles.hospIcon}>🏥</div>
                    <div>
                      <div style={styles.hospName}>{h.name}</div>
                      <div style={styles.hospMeta}>{h.city}, {h.state}</div>
                      <div style={styles.hospMeta}>MID: {h.mid}</div>
                    </div>
                    <StarRating rating={h.rating} />
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94A3B8' }}>No hospital affiliations listed.</p>
            )}
          </div>
        )}

        {activeTab === 'diseases' && (
          <div>
            <h3 style={styles.sectionTitle}>Diseases & Conditions Treated</h3>
            {doctor.symptoms && doctor.symptoms.length > 0 ? (
              <div style={styles.diseasesGrid}>
                {doctor.symptoms.map((s) => (
                  <div key={s.id} style={styles.diseaseCard}>
                    <div style={styles.diseaseName}>{s.name}</div>
                    {s.description && <div style={styles.diseaseDesc}>{s.description}</div>}
                    {s.category && <Badge label={s.category} color="gray" />}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94A3B8' }}>No specific conditions listed.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '40px 80px', maxWidth: 1100, margin: '0 auto' },
  loading: { textAlign: 'center', padding: 80, color: '#94A3B8', fontSize: 18 },
  profileCard: {
    display: 'flex',
    gap: 32,
    background: '#fff',
    borderRadius: 20,
    padding: '32px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
    marginBottom: 32,
    alignItems: 'flex-start',
  },
  avatarWrap: { position: 'relative', flexShrink: 0 },
  avatar: { width: 120, height: 120, borderRadius: '50%', objectFit: 'cover' },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: '50%',
    background: '#E0F2FE',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 36,
    fontWeight: 800,
    color: '#0EA5E9',
  },
  availBadge: {
    position: 'absolute',
    bottom: 4,
    left: '50%',
    transform: 'translateX(-50%)',
    background: '#22C55E',
    color: '#fff',
    fontSize: 10,
    fontWeight: 700,
    padding: '2px 8px',
    borderRadius: 999,
    whiteSpace: 'nowrap',
  },
  profileInfo: { flex: 1 },
  midChip: { fontFamily: 'monospace', fontSize: 12, color: '#94A3B8', background: '#F8FAFC', padding: '2px 10px', borderRadius: 4, display: 'inline-block', marginBottom: 8 },
  name: { fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 12 },
  qualification: { color: '#64748b', fontSize: 14, marginBottom: 10 },
  contactRow: { display: 'flex', gap: 20, marginTop: 14, color: '#64748b', fontSize: 13, flexWrap: 'wrap' },
  bookBox: {
    background: '#F8FAFC',
    borderRadius: 16,
    padding: '24px',
    textAlign: 'center',
    minWidth: 200,
    flexShrink: 0,
    border: '1.5px solid #E2E8F0',
  },
  feeLabel: { fontSize: 13, color: '#64748b', marginBottom: 4 },
  feeValue: { fontSize: 28, fontWeight: 800, color: '#0EA5E9', marginBottom: 16 },
  bookBtn: {
    width: '100%',
    padding: '12px',
    background: '#0EA5E9',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontWeight: 700,
    fontSize: 15,
    cursor: 'pointer',
  },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1.5px solid #E2E8F0' },
  tab: {
    padding: '10px 24px',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    color: '#64748b',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: -1.5,
  },
  tabActive: { borderBottomColor: '#0EA5E9', color: '#0EA5E9' },
  tabContent: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 12 },
  bio: { color: '#374151', lineHeight: 1.65, fontSize: 15 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  infoCard: { background: '#F8FAFC', borderRadius: 12, padding: '16px 20px' },
  infoLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  infoValue: { fontSize: 16, fontWeight: 600, color: '#0F172A' },
  hospitalList: { display: 'flex', flexDirection: 'column', gap: 12 },
  hospitalCard: {
    display: 'flex',
    alignItems: 'center',
    gap: 16,
    padding: '16px 20px',
    background: '#F8FAFC',
    borderRadius: 12,
    cursor: 'pointer',
    transition: 'background 0.2s',
    border: '1px solid #E2E8F0',
  },
  hospIcon: { fontSize: 28 },
  hospName: { fontWeight: 700, color: '#0F172A', fontSize: 15 },
  hospMeta: { color: '#64748b', fontSize: 13, marginTop: 2 },
  diseasesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 },
  diseaseCard: { background: '#F8FAFC', borderRadius: 12, padding: '16px', border: '1px solid #E2E8F0' },
  diseaseName: { fontWeight: 700, color: '#0F172A', marginBottom: 6, fontSize: 14 },
  diseaseDesc: { color: '#64748b', fontSize: 12, marginBottom: 8, lineHeight: 1.5 },
};

export default DoctorDetail;
