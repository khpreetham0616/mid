import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    first_name: '', last_name: '', email: '', password: '',
    phone: '', gender: '', blood_group: '', city: '',
  });

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await authAPI.register(form);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}><span style={{ color: '#0EA5E9' }}>M</span>ID</div>
        <h2 style={styles.title}>Create your account</h2>
        <p style={styles.sub}>Get your unique Medical ID today</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>First Name *</label>
              <input required value={form.first_name} onChange={set('first_name')} style={styles.input} placeholder="John" />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Last Name *</label>
              <input required value={form.last_name} onChange={set('last_name')} style={styles.input} placeholder="Doe" />
            </div>
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Email *</label>
            <input type="email" required value={form.email} onChange={set('email')} style={styles.input} placeholder="you@example.com" />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password *</label>
            <input type="password" required minLength={6} value={form.password} onChange={set('password')} style={styles.input} placeholder="Min 6 characters" />
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Phone</label>
              <input value={form.phone} onChange={set('phone')} style={styles.input} placeholder="+91..." />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>City</label>
              <input value={form.city} onChange={set('city')} style={styles.input} placeholder="Mumbai" />
            </div>
          </div>
          <div style={styles.row}>
            <div style={styles.field}>
              <label style={styles.label}>Gender</label>
              <select value={form.gender} onChange={set('gender')} style={styles.input}>
                <option value="">Select</option>
                <option>Male</option><option>Female</option><option>Other</option>
              </select>
            </div>
            <div style={styles.field}>
              <label style={styles.label}>Blood Group</label>
              <select value={form.blood_group} onChange={set('blood_group')} style={styles.input}>
                <option value="">Select</option>
                {['A+','A-','B+','B-','AB+','AB-','O+','O-'].map((bg) => (
                  <option key={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Creating account...' : 'Get My MID'}
          </button>
        </form>
        <p style={styles.footer}>
          Already have an account? <Link to="/login" style={styles.link}>Login</Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC', padding: '40px 20px' },
  card: { background: '#fff', borderRadius: 20, padding: '40px', width: 500, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' },
  logo: { fontSize: 28, fontWeight: 900, color: '#0F172A', marginBottom: 12, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: 800, color: '#0F172A', textAlign: 'center', marginBottom: 4 },
  sub: { color: '#64748b', textAlign: 'center', fontSize: 14, marginBottom: 24 },
  form: { display: 'flex', flexDirection: 'column', gap: 14 },
  row: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 },
  field: { display: 'flex', flexDirection: 'column', gap: 5 },
  label: { fontSize: 12, fontWeight: 600, color: '#374151' },
  input: { padding: '10px 12px', borderRadius: 8, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none' },
  error: { background: '#FEF2F2', color: '#B91C1C', padding: '10px 14px', borderRadius: 8, fontSize: 13 },
  btn: { padding: '13px', background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  footer: { textAlign: 'center', marginTop: 18, fontSize: 14, color: '#64748b' },
  link: { color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' },
};

export default Register;
