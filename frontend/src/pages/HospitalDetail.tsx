import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { hospitalAPI } from '../services/api';
import { Hospital } from '../types';
import StarRating from '../components/common/StarRating';
import Badge from '../components/common/Badge';

const HospitalDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'doctors' | 'departments'>('overview');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    hospitalAPI.getById(id)
      .then((res) => setHospital(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div style={styles.loading}>Loading...</div>;
  if (!hospital) return <div style={styles.loading}>Hospital not found</div>;

  const parseFacilities = (raw: string): string[] => {
    try { return JSON.parse(raw); } catch { return raw ? raw.split(',').map(s => s.trim()) : []; }
  };
  const parseDepts = (raw: string): string[] => {
    try { return JSON.parse(raw); } catch { return raw ? raw.split(',').map(s => s.trim()) : []; }
  };

  const facilities = parseFacilities(hospital.facilities);
  const departments = parseDepts(hospital.departments);

  return (
    <div style={styles.container}>
      <div style={styles.profileCard}>
        <div style={styles.hospIconBig}>🏥</div>
        <div style={styles.profileInfo}>
          <div style={styles.midChip}>MID: {hospital.mid}</div>
          <h1 style={styles.name}>{hospital.name}</h1>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12 }}>
            <Badge label={hospital.type} color="orange" />
            {hospital.is_active ? <Badge label="Active" color="green" /> : <Badge label="Inactive" color="red" />}
          </div>
          <div style={styles.location}>📍 {hospital.address}, {hospital.city}, {hospital.state} - {hospital.pincode}</div>
          <StarRating rating={hospital.rating} size={16} />
          <div style={styles.contactRow}>
            <span>📧 {hospital.email}</span>
            <span>📞 {hospital.phone}</span>
            <span>🛏 {hospital.beds} beds</span>
          </div>
        </div>
      </div>

      <div style={styles.tabs}>
        {(['overview', 'doctors', 'departments'] as const).map((tab) => (
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
            <div style={styles.infoGrid}>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Type</div>
                <div style={styles.infoValue}>{hospital.type}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Total Beds</div>
                <div style={styles.infoValue}>{hospital.beds}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>City</div>
                <div style={styles.infoValue}>{hospital.city}</div>
              </div>
              <div style={styles.infoCard}>
                <div style={styles.infoLabel}>Country</div>
                <div style={styles.infoValue}>{hospital.country}</div>
              </div>
            </div>
            {facilities.length > 0 && (
              <div style={{ marginTop: 24 }}>
                <h3 style={styles.sectionTitle}>Facilities</h3>
                <div style={styles.facilitiesGrid}>
                  {facilities.map((f) => (
                    <div key={f} style={styles.facilityItem}>✓ {f}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'doctors' && (
          <div>
            <h3 style={styles.sectionTitle}>{hospital.doctors?.length || 0} Doctors</h3>
            {hospital.doctors && hospital.doctors.length > 0 ? (
              <div style={styles.doctorGrid}>
                {hospital.doctors.map((doc) => (
                  <div key={doc.id} style={styles.doctorCard} onClick={() => navigate(`/doctors/${doc.id}`)}>
                    <div style={styles.docAvatar}>{doc.first_name[0]}{doc.last_name[0]}</div>
                    <div>
                      <div style={styles.docName}>Dr. {doc.first_name} {doc.last_name}</div>
                      <div style={styles.docSpec}>{doc.specialization}</div>
                      <div style={styles.docFee}>₹{doc.consult_fee}</div>
                    </div>
                    {doc.symptoms && doc.symptoms.length > 0 && (
                      <div style={styles.docSymptoms}>
                        {doc.symptoms.slice(0, 2).map((s) => (
                          <span key={s.id} style={styles.symTag}>{s.name}</span>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94A3B8' }}>No doctors listed.</p>
            )}
          </div>
        )}

        {activeTab === 'departments' && (
          <div>
            <h3 style={styles.sectionTitle}>Departments</h3>
            {departments.length > 0 ? (
              <div style={styles.deptGrid}>
                {departments.map((d) => (
                  <div key={d} style={styles.deptCard}>
                    <div style={styles.deptIcon}>🏨</div>
                    <div style={styles.deptName}>{d}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ color: '#94A3B8' }}>No departments listed.</p>
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
  profileCard: { display: 'flex', gap: 32, background: '#fff', borderRadius: 20, padding: 32, boxShadow: '0 4px 20px rgba(0,0,0,0.08)', marginBottom: 32 },
  hospIconBig: { fontSize: 80, flexShrink: 0 },
  profileInfo: { flex: 1 },
  midChip: { fontFamily: 'monospace', fontSize: 12, color: '#94A3B8', background: '#F8FAFC', padding: '2px 10px', borderRadius: 4, display: 'inline-block', marginBottom: 8 },
  name: { fontSize: 28, fontWeight: 800, color: '#0F172A', marginBottom: 12 },
  location: { color: '#64748b', fontSize: 14, marginBottom: 10 },
  contactRow: { display: 'flex', gap: 20, marginTop: 14, color: '#64748b', fontSize: 13, flexWrap: 'wrap' },
  tabs: { display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1.5px solid #E2E8F0' },
  tab: { padding: '10px 24px', background: 'transparent', border: 'none', borderBottom: '2px solid transparent', color: '#64748b', fontSize: 15, fontWeight: 600, cursor: 'pointer', marginBottom: -1.5 },
  tabActive: { borderBottomColor: '#0EA5E9', color: '#0EA5E9' },
  tabContent: { background: '#fff', borderRadius: 16, padding: 28, boxShadow: '0 2px 10px rgba(0,0,0,0.05)' },
  sectionTitle: { fontSize: 18, fontWeight: 700, color: '#0F172A', marginBottom: 16 },
  infoGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 },
  infoCard: { background: '#F8FAFC', borderRadius: 12, padding: '16px 20px' },
  infoLabel: { fontSize: 12, color: '#94A3B8', marginBottom: 4, textTransform: 'uppercase' },
  infoValue: { fontSize: 16, fontWeight: 600, color: '#0F172A' },
  facilitiesGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 },
  facilityItem: { background: '#F0FDF4', color: '#15803D', padding: '8px 14px', borderRadius: 8, fontSize: 13, fontWeight: 500 },
  doctorGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 },
  doctorCard: { display: 'flex', flexDirection: 'column', gap: 6, background: '#F8FAFC', borderRadius: 12, padding: 16, cursor: 'pointer', border: '1px solid #E2E8F0' },
  docAvatar: { width: 48, height: 48, borderRadius: '50%', background: '#E0F2FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#0EA5E9', fontSize: 18, marginBottom: 8 },
  docName: { fontWeight: 700, color: '#0F172A', fontSize: 14 },
  docSpec: { color: '#64748b', fontSize: 12 },
  docFee: { color: '#0EA5E9', fontWeight: 600, fontSize: 13 },
  docSymptoms: { display: 'flex', flexWrap: 'wrap', gap: 4 },
  symTag: { background: '#F0FDF4', color: '#15803D', padding: '2px 6px', borderRadius: 999, fontSize: 11 },
  deptGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 },
  deptCard: { background: '#F0F9FF', borderRadius: 12, padding: '20px 16px', textAlign: 'center' },
  deptIcon: { fontSize: 28, marginBottom: 8 },
  deptName: { fontWeight: 600, color: '#0369A1', fontSize: 14 },
};

export default HospitalDetail;
