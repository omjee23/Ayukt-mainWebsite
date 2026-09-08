import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { getImageSrc } from '../config/api';
import logoImg from '../assets/logo.png';
import { OFFICIAL_SOCIAL_LINKS } from '../constants/socialLinks';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const isDashboard = location.pathname.startsWith('/dashboard');

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // LocalStorage fallback for instant UI render
  const savedUser = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user')) : null;
  const token = localStorage.getItem('token');
  
  const currentUser = user || savedUser;
  const isLoggedIn = Boolean(currentUser && token);

  const getDashboardPath = () => {
    if (!currentUser) return '/login';
    const role = currentUser.role?.toLowerCase() || '';

    if (role === 'admin' || role === 'subadmin' || role === 'co-admin') return '/dashboard/admin';
    if (role === 'mentor') return '/dashboard/mentor';
    if (role === 'volunteer') return '/dashboard/volunteer';
    if (role === 'guest') return '/dashboard/guest';
    
    return '/dashboard/student';
  };

  const handleLogout = () => {
    if (logout) logout();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsMobileOpen(false);
    navigate('/login');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'News & Notices', path: '/news' },
    { label: 'Events & Drives', path: '/events' },
    { label: 'Live Sessions', path: '/live-sessions' },
    { label: 'Team', path: '/team' },
    { label: 'Contact Us', path: '/contact' }
  ];

  return (
    <>
      <nav style={{ 
        padding: '12px clamp(14px, 3vw, 32px)', 
        background: 'radial-gradient(circle at 85% 30%, #1e4d43 0%, #173d35 55%, #0d2822 100%)', 
        borderBottom: '1px solid rgba(232, 179, 90, 0.28)',
        color: 'white', 
        boxShadow: '0 4px 16px rgba(13,40,34,0.3)',
        width: '100%',
        boxSizing: 'border-box',
        position: isDashboard ? 'sticky' : 'relative',
        top: isDashboard ? 0 : 'auto',
        zIndex: 100
      }}>
        <div style={{
          maxWidth: '1360px',
          margin: '0 auto',
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div className="site-brand">
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            <img
              src={logoImg}
              alt="Avyukt Utthan Sanstha Logo"
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                border: '1.5px solid rgba(232, 179, 90, 0.8)',
                objectFit: 'contain'
              }}
            />
            <div className="site-brand-text">
              <strong style={{ fontSize: '15px' }}>अव्युक्त उत्थान संस्था</strong>
              <span style={{ fontSize: '11px' }}>Avyukt Utthan Sanstha</span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <div className="site-nav site-nav-desktop" style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
          {navLinks.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);
            return (
              <Link 
                key={item.path}
                to={item.path} 
                style={{ 
                  ...linkStyle, 
                  color: isActive ? '#e8b35a' : '#d8f0df', 
                  fontWeight: isActive ? '700' : '500' 
                }}
              >
                {item.label}
              </Link>
            );
          })}

          {isLoggedIn ? (
            <>
              <Link 
                to={getDashboardPath()} 
                style={{ 
                  color: '#173d35', 
                  fontWeight: '700', 
                  textDecoration: 'none', 
                  fontSize: '13px', 
                  padding: '6px 12px', 
                  borderRadius: '6px', 
                  background: '#e8b35a',
                  border: '1px solid #dfa443',
                  boxShadow: '0 2px 8px rgba(232,179,90,0.25)'
                }}
              >
                Dashboard
              </Link>
              
              {/* User Profile Badge */}
              <div 
                onClick={() => navigate(`${getDashboardPath()}?tab=profile`)}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '8px', 
                  background: 'rgba(255,255,255,0.08)', 
                  padding: '5px 12px', 
                  borderRadius: '20px', 
                  border: '1px solid rgba(232,179,90,0.35)',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                title="क्लिक करके प्रोफाइल एडिट करें"
              >
                <img 
                  src={getImageSrc(currentUser?.avatar) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
                  alt="Profile" 
                  style={{ width: '26px', height: '26px', borderRadius: '50%', objectFit: 'cover' }} 
                />
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#fbfaf5' }}>
                  {currentUser?.name ? currentUser.name.split(' ')[0] : 'User'}
                </span>
                <span style={{ fontSize: '12px', color: '#e8b35a' }} title="Edit Profile">✏️</span>
              </div>

              <button className="nav-logout" onClick={handleLogout}>
                Sign out
              </button>
            </>
          ) : (
            <button className="nav-login" onClick={() => navigate('/login')}>
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <button
          className="mobile-hamburger-btn"
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          aria-label="Toggle Menu"
          style={{
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            color: '#fff',
            padding: '8px 10px',
            cursor: 'pointer',
            display: 'none', // Shown on <= 992px via media query in styles.css
            flexDirection: 'column',
            gap: '4px',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span style={{ display: 'block', width: '20px', height: '2px', background: '#fff', borderRadius: '2px' }}></span>
          <span style={{ display: 'block', width: '20px', height: '2px', background: '#fff', borderRadius: '2px' }}></span>
          <span style={{ display: 'block', width: '20px', height: '2px', background: '#fff', borderRadius: '2px' }}></span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Backdrop */}
      <div 
        className={`mobile-nav-backdrop ${isMobileOpen ? 'open' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Mobile Slide-Out Navigation Drawer */}
      <aside className={`mobile-nav-drawer ${isMobileOpen ? 'open' : ''}`}>
        <div className="mobile-nav-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <img
              src={logoImg}
              alt="Logo"
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                border: '1px solid #e8b35a'
              }}
            />
            <div style={{ lineHeight: 1.2 }}>
              <strong style={{ fontSize: '13.5px', color: '#fff', display: 'block' }}>अव्युक्त उत्थान संस्था</strong>
              <span style={{ fontSize: '10px', color: '#e8b35a' }}>Menu Navigation</span>
            </div>
          </div>
          <button 
            className="mobile-nav-close"
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close navigation"
          >
            ✕
          </button>
        </div>

        {/* User Card if logged in */}
        {isLoggedIn && (
          <div style={{
            background: 'rgba(255, 255, 255, 0.06)',
            borderRadius: '10px',
            padding: '12px',
            marginBottom: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <img 
              src={getImageSrc(currentUser?.avatar) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
              alt="Avatar"
              style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1.5px solid #e8b35a' }}
            />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: '#fff', fontWeight: 600, fontSize: '14px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {currentUser?.name || 'User'}
              </div>
              <div style={{ color: '#e8b35a', fontSize: '11.5px', textTransform: 'capitalize', fontWeight: 600 }}>
                {currentUser?.role || 'Member'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
              <Link 
                to={getDashboardPath()}
                onClick={() => setIsMobileOpen(false)}
                style={{
                  fontSize: '11.5px',
                  background: '#e8b35a',
                  color: '#173d35',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  fontWeight: 700,
                  textDecoration: 'none'
                }}
              >
                Dashboard
              </Link>
              <Link 
                to={`${getDashboardPath()}?tab=profile`}
                onClick={() => setIsMobileOpen(false)}
                style={{
                  fontSize: '11.5px',
                  background: 'rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  padding: '5px 8px',
                  borderRadius: '6px',
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: '1px solid rgba(255, 255, 255, 0.25)'
                }}
              >
                ✏️ Profile
              </Link>
            </div>
          </div>
        )}

        {/* Links List */}
        <div className="mobile-nav-links">
          {navLinks.map((item) => {
            const isActive = item.path === '/' 
              ? location.pathname === '/' 
              : location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => setIsMobileOpen(false)}
              >
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Mobile Auth Button Footer */}
        <div style={{ marginTop: 'auto', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          {isLoggedIn ? (
            <button
              onClick={handleLogout}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                background: '#ef4444',
                color: '#fff',
                border: 'none',
                fontWeight: 600,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Sign out
            </button>
          ) : (
            <button
              onClick={() => {
                setIsMobileOpen(false);
                navigate('/login');
              }}
              style={{
                width: '100%',
                padding: '11px',
                borderRadius: '8px',
                background: '#e8b35a',
                color: '#0f172a',
                border: 'none',
                fontWeight: 700,
                fontSize: '14px',
                cursor: 'pointer'
              }}
            >
              Login / Sign Up
            </button>
          )}
        </div>

        {/* Mobile Social Links */}
        <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.1)', textAlign: 'center' }}>
          <span style={{ fontSize: '11px', color: '#e8b35a', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>
            Follow Us
          </span>
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
            {OFFICIAL_SOCIAL_LINKS.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                title={item.name}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  display: 'grid',
                  placeItems: 'center',
                  textDecoration: 'none'
                }}
              >
                {item.icon}
              </a>
            ))}
          </div>
        </div>
      </aside>
    </>
  );
};

const linkStyle = {
  color: '#e2e8f0',
  textDecoration: 'none',
  fontSize: '14px',
  fontWeight: '500',
  transition: 'color 0.2s'
};

export default Navbar;