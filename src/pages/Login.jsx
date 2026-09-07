import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { API, ADMIN_URL } from '../config/api';
import logoImg from '../assets/logo.png';

const Login = () => {
  const [identifier, setIdentifier] = useState(''); // Login ID / Unique ID
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // ➔ Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [modalMsg, setModalMsg] = useState('');
  const [modalError, setModalError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const res = await API.post('/auth/login', {
        identifier,
        password
      });

      if (res.data.user.status === 'pending') {
        setErrorMsg('आपका खाता अभी स्वीकृति (Pending Approval) में है। स्वीकृत होने के बाद आप लॉगिन कर पाएंगे।');
        setLoading(false);
        return;
      }

      login(res.data.user, res.data.token);

      // Role Normalization & Navigation
      const userRole = res.data.user.role ? res.data.user.role.trim().toLowerCase() : '';

      if (userRole === 'admin' || userRole === 'subadmin' || userRole === 'co-admin') {
        window.location.href = ADMIN_URL;
      } else {
        // Mentor, Volunteer, Student - सभी के लिए Dashboard राउट
        navigate('/dashboard', { replace: true });
      }

    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'लॉगिन विफल रहा! कृपया अपनी Login ID और पासवर्ड जांचें।');
    } finally {
      setLoading(false);
    }
  };

  // Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setModalMsg('');
    setModalError('');

    try {
      const res = await API.post('/auth/forgot-password', { email: resetEmail });
      setModalMsg(res.data.message);
      setOtpSent(true);
    } catch (err) {
      setModalError(err.response?.data?.error || 'OTP भेजने में विफल!');
    } finally {
      setForgotLoading(false);
    }
  };

  // Reset Password with OTP
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setForgotLoading(true);
    setModalMsg('');
    setModalError('');

    try {
      const res = await API.post('/auth/reset-password', {
        email: resetEmail,
        otp,
        newPassword
      });
      setModalMsg(res.data.message);
      setTimeout(() => {
        setShowForgotModal(false);
        setOtpSent(false);
        setResetEmail('');
        setOtp('');
        setNewPassword('');
      }, 2000);
    } catch (err) {
      setModalError(err.response?.data?.error || 'पासवर्ड रीसेट करने में समस्या आई!');
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <img
            src={logoImg}
            alt="AU Logo"
            style={{
              width: '72px',
              height: '72px',
              borderRadius: '50%',
              boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
              border: '2px solid rgba(232, 179, 90, 0.7)',
              objectFit: 'contain'
            }}
          />
        </div>
        <h2 style={{ textAlign: 'center', color: '#0f172a', marginBottom: '8px' }}>लॉगिन करें (Login)</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '13px', marginBottom: '24px' }}>
          अपनी <strong>Login ID / Unique ID</strong> (जैसे: Avyukt@S001 / Avyukt@M0001) दर्ज करें
        </p>

        {errorMsg && <div style={errorAlertStyle}>⚠️ {errorMsg}</div>}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="loginIdentifier" style={labelStyle}>Login ID / Unique ID *</label>
            <input
              id="loginIdentifier"
              name="identifier"
              type="text"
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              style={inputStyle}
              placeholder="e.g. Avyukt@S001 या Avyukt@M0001"
            />
          </div>

          <div style={{ marginBottom: '8px' }}>
            <label htmlFor="loginPassword" style={labelStyle}>पासवर्ड (Password) *</label>
            <div style={{ position: 'relative' }}>
              <input
                id="loginPassword"
                name="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ ...inputStyle, paddingRight: '40px' }}
                placeholder="अपना पासवर्ड दर्ज करें"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
                title={showPassword ? 'Hide Password' : 'Show Password'}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={showPassword ? 'M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.7 10.7 0 0112 4c5 0 9 4 10 8a10.8 10.8 0 01-4 5.4M6.2 6.2A10.8 10.8 0 002 12c1 4 5 8 10 8a10.8 10.8 0 004.1-.8' : 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z'} /></svg>
              </button>
            </div>
          </div>

          <div style={{ textAlign: 'right', marginBottom: '20px' }}>
            <button
              type="button"
              onClick={() => {
                setShowForgotModal(true);
                setModalMsg('');
                setModalError('');
              }}
              style={forgotLinkStyle}
            >
              पासवर्ड भूल गए? (Forgot Password?)
            </button>
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'सत्यापित हो रहा है...' : 'लॉगिन करें'}
          </button>
        </form>

        <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', textAlign: 'center' }}>
          <p style={{ fontSize: '13.5px', fontWeight: 'bold', color: '#547664', marginBottom: '10px' }}>नया खाता बनाएं (New Registration)</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap', fontSize: '13px' }}>
            <Link to="/student-signup" style={linkBtnStyle}>Student</Link>
            <Link to="/mentor-signup" style={linkBtnStyle}>Mentor</Link>
            <Link to="/volunteer-signup" style={linkBtnStyle}>Volunteer</Link>
          </div>
        </div>
      </div>

      {/* ➔ Forgot Password Modal */}
      {showForgotModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif' }}>पासवर्ड रीसेट करें</h3>
              <button onClick={() => setShowForgotModal(false)} style={closeBtnStyle}>✕</button>
            </div>

            {modalMsg && <div style={{ ...errorAlertStyle, background: '#eaf4ee', color: '#166534', border: '1px solid #bbf7d0' }}>✅ {modalMsg}</div>}
            {modalError && <div style={errorAlertStyle}>⚠️ {modalError}</div>}

            {!otpSent ? (
              <form onSubmit={handleSendOtp}>
                <p style={{ fontSize: '13px', color: '#547664', marginBottom: '12px', lineHeight: '1.5' }}>
                  अपना रजिस्टर्ड ईमेल (Registered Email) दर्ज करें। उस पर 6-अंकों का OTP भेजा जाएगा।
                </p>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="resetEmail" style={labelStyle}>ईमेल पता (Email Address) *</label>
                  <input
                    id="resetEmail"
                    name="resetEmail"
                    type="email"
                    autoComplete="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    required
                    style={inputStyle}
                    placeholder="example@gmail.com"
                  />
                </div>
                <button type="submit" disabled={forgotLoading} style={btnStyle}>
                  {forgotLoading ? 'OTP भेजा जा रहा है...' : 'OTP भेजें'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleResetPassword}>
                <div style={{ marginBottom: '12px' }}>
                  <label htmlFor="otp" style={labelStyle}>6-अंकों का OTP *</label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    autoComplete="one-time-code"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    style={inputStyle}
                    placeholder="123456"
                  />
                </div>
                <div style={{ marginBottom: '16px' }}>
                  <label htmlFor="newPassword" style={labelStyle}>नया पासवर्ड *</label>
                  <input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    style={inputStyle}
                    placeholder="नया पासवर्ड दर्ज करें"
                  />
                </div>
                <button type="submit" disabled={forgotLoading} style={btnStyle}>
                  {forgotLoading ? 'पासवर्ड बदला जा रहा है...' : 'पासवर्ड रीसेट करें'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const containerStyle = { padding: 'clamp(30px, 5vw, 60px) 16px', background: '#fbfaf5', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const cardStyle = { background: '#ffffff', padding: 'clamp(22px, 4vw, 36px)', borderRadius: '14px', width: '100%', maxWidth: '440px', boxShadow: '0 6px 24px rgba(23, 61, 53, 0.08)', border: '1px solid #e2ebe4', fontFamily: "'Avenir Next', sans-serif" };
const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#173d35' };
const inputStyle = { width: '100%', padding: '11px 13px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
const eyeButtonStyle = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#547664' };
const btnStyle = { width: '100%', padding: '13px', backgroundColor: '#173d35', color: '#ffffff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 14px rgba(23, 61, 53, 0.25)', transition: 'all 0.2s ease' };
const linkBtnStyle = { padding: '8px 14px', backgroundColor: '#e9f0e6', color: '#173d35', borderRadius: '6px', textDecoration: 'none', fontWeight: '700', border: '1px solid #d8e5d6', transition: 'all 0.2s ease' };
const errorAlertStyle = { padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '13px', lineHeight: '1.4', border: '1px solid #fecaca' };
const forgotLinkStyle = { background: 'none', border: 'none', color: '#173d35', cursor: 'pointer', fontSize: '12.5px', fontWeight: '700', padding: 0 };
const modalOverlayStyle = { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(13, 40, 34, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' };
const modalContentStyle = { background: '#fff', padding: 'clamp(20px, 4vw, 28px)', borderRadius: '14px', width: '100%', maxWidth: '420px', boxShadow: '0 12px 35px rgba(23, 61, 53, 0.2)', border: '1px solid #e2ebe4' };
const closeBtnStyle = { background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' };

export default Login;