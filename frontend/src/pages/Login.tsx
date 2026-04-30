import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Login failed. Check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <div style={styles.logo}><span style={{ color: '#0EA5E9' }}>M</span>ID</div>
        <h2 style={styles.title}>Welcome back</h2>
        <p style={styles.sub}>Sign in to your MID account</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.field}>
            <label style={styles.label}>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              style={styles.input}
            />
          </div>
          <div style={styles.field}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
              style={styles.input}
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button type="submit" disabled={loading} style={styles.btn}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
        <p style={styles.footer}>
          Don't have an account? <Link to="/register" style={styles.link}>Register</Link>
        </p>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  page: { minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F8FAFC' },
  card: { background: '#fff', borderRadius: 20, padding: '44px 40px', width: 400, boxShadow: '0 8px 32px rgba(0,0,0,0.1)' },
  logo: { fontSize: 28, fontWeight: 900, color: '#0F172A', marginBottom: 16, textAlign: 'center' },
  title: { fontSize: 22, fontWeight: 800, color: '#0F172A', textAlign: 'center', marginBottom: 6 },
  sub: { color: '#64748b', textAlign: 'center', fontSize: 14, marginBottom: 28 },
  form: { display: 'flex', flexDirection: 'column', gap: 16 },
  field: { display: 'flex', flexDirection: 'column', gap: 6 },
  label: { fontSize: 13, fontWeight: 600, color: '#374151' },
  input: { padding: '11px 14px', borderRadius: 10, border: '1.5px solid #E2E8F0', fontSize: 14, outline: 'none' },
  error: { background: '#FEF2F2', color: '#B91C1C', padding: '10px 14px', borderRadius: 8, fontSize: 13 },
  btn: { padding: '13px', background: '#0EA5E9', color: '#fff', border: 'none', borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: 'pointer' },
  footer: { textAlign: 'center', marginTop: 20, fontSize: 14, color: '#64748b' },
  link: { color: '#0EA5E9', fontWeight: 600, textDecoration: 'none' },
};

export default Login;
