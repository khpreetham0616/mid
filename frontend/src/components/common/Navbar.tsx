import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar: React.FC = () => {
  const { isAuthenticated, patient, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <Link to="/" style={styles.brand}>
        <span style={styles.brandM}>M</span>ID
        <span style={styles.brandSub}> Medical ID System</span>
      </Link>

      <div style={styles.links}>
        <Link to="/doctors" style={styles.link}>Doctors</Link>
        <Link to="/hospitals" style={styles.link}>Hospitals</Link>
        <Link to="/medicines" style={styles.link}>Medicines</Link>
        <Link to="/symptom-checker" style={styles.link}>Symptom Checker</Link>
        {isAuthenticated ? (
          <>
            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
            <button onClick={handleLogout} style={styles.btnOutline}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>Login</Link>
            <Link to="/register" style={styles.btnPrimary}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

const styles: Record<string, React.CSSProperties> = {
  nav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 32px',
    height: 64,
    background: '#fff',
    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  },
  brand: {
    fontSize: 22,
    fontWeight: 800,
    color: '#1a1a2e',
    textDecoration: 'none',
    letterSpacing: 1,
  },
  brandM: { color: '#0EA5E9' },
  brandSub: { fontSize: 13, fontWeight: 400, color: '#64748b', marginLeft: 4 },
  links: { display: 'flex', alignItems: 'center', gap: 24 },
  link: {
    color: '#374151',
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 500,
    transition: 'color 0.2s',
  },
  btnPrimary: {
    background: '#0EA5E9',
    color: '#fff',
    padding: '8px 18px',
    borderRadius: 8,
    textDecoration: 'none',
    fontSize: 14,
    fontWeight: 600,
  },
  btnOutline: {
    background: 'transparent',
    border: '1.5px solid #0EA5E9',
    color: '#0EA5E9',
    padding: '7px 16px',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
  },
};

export default Navbar;
