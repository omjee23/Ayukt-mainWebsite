import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { API } from '../config/api';
import logoImg from '../assets/logo.png';

const StudentSignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    studentClass: '',
    whatsappPhone: '',
    callingPhone: '',
    sameAsWhatsapp: false,
    schoolName: '',
    district: '',
    address: '',
    villageName: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false); // ➔ Full Card View Control State
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      if (name === 'whatsappPhone' && prev.sameAsWhatsapp) {
        updated.callingPhone = value;
      }
      return updated;
    });
  };

  const handleCheckboxChange = (e) => {
    const isChecked = e.target.checked;
    setFormData((prev) => ({
      ...prev,
      sameAsWhatsapp: isChecked,
      callingPhone: isChecked ? prev.whatsappPhone : prev.callingPhone
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');

    try {
      const payload = { ...formData, role: 'student' };
      await API.post('/auth/register', payload);
      
      // ➔ Submit hone par true trigger hoga
      setIsSubmitted(true);
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'रजिस्ट्रेशन करने में समस्या आई, कृपया दोबारा प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  // ➔ Success Card Render Logic (Mentor/Volunteer UI ke jaisa exact same)
  if (isSubmitted) {
    return (
      <div style={containerStyle}>
        <div style={successCardStyle}>
          <h2 style={{ color: '#15803d', fontSize: '24px', marginBottom: '12px' }}>
            आवेदन सफलतापूर्वक सबमिट हुआ!
          </h2>
          <p style={{ color: '#166534', fontSize: '15px', lineHeight: '1.6', marginBottom: '8px' }}>
            स्टूडेंट के रूप में पंजीकरण करने के लिए धन्यवाद। आपका खाता वर्तमान में <strong>Admin Approval</strong> के अधीन है।
          </p>
          <p style={{ color: '#4b5563', fontSize: '13px', marginBottom: '24px' }}>
            एडमिन के अप्रूव करते ही आपकी Unique Student ID आपके व्हाट्सएप नंबर पर भेज दी जाएगी।
          </p>
          
          <button onClick={() => navigate('/login')} style={backBtnStyle}>
            लॉगिन पेज पर जाएं (Back to Login)
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ textAlign: 'center', marginBottom: '14px' }}>
          <img
            src={logoImg}
            alt="AU Logo"
            style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
              border: '2px solid rgba(232, 179, 90, 0.7)',
              objectFit: 'contain'
            }}
          />
        </div>
        <h2 style={{ textAlign: 'center', color: '#1e293b', marginBottom: '8px' }}>Student Registration Request</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '20px' }}>
          अपनी जानकारी भरें। एडमिन अप्रूवल के बाद आपकी Unique Student ID आपके व्हाट्सएप पर भेजी जाएगी।
        </p>

        {errorMsg && <div style={errorAlertStyle}>⚠️ {errorMsg}</div>}

        <form onSubmit={handleSubmit}>
          <div style={gridStyle}>
            <div>
              <label style={labelStyle}>पूरा नाम (Full Name) *</label>
              <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="अपना नाम लिखें" />
            </div>

            <div>
              <label style={labelStyle}>ईमेल (Email) *</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange} required style={inputStyle} placeholder="example@gmail.com" />
            </div>

            <div>
              <label style={labelStyle}>पासवर्ड (Password) *</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  name="password" 
                  value={formData.password} 
                  onChange={handleChange} 
                  required 
                  style={{ ...inputStyle, paddingRight: '40px' }} 
                  placeholder="पासवर्ड बनाएँ" 
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

            <div>
              <label style={labelStyle}>कक्षा (Class) *</label>
              <input type="text" name="studentClass" value={formData.studentClass} onChange={handleChange} required style={inputStyle} placeholder="जैसे: 10th, 12th, BA..." />
            </div>

            <div>
              <label style={labelStyle}>व्हाट्सएप नंबर (WhatsApp Phone) *</label>
              <input type="tel" name="whatsappPhone" value={formData.whatsappPhone} onChange={handleChange} required style={inputStyle} placeholder="WhatsApp No." />
            </div>

            <div>
              <label style={labelStyle}>कॉलिंग नंबर (Calling Phone) *</label>
              <input type="tel" name="callingPhone" value={formData.callingPhone} onChange={handleChange} disabled={formData.sameAsWhatsapp} required style={inputStyle} placeholder="Calling No." />
              <div style={{ marginTop: '4px' }}>
                <input type="checkbox" id="samePhone" checked={formData.sameAsWhatsapp} onChange={handleCheckboxChange} />
                <label htmlFor="samePhone" style={{ fontSize: '12px', color: '#475569', marginLeft: '6px' }}>व्हाट्सएप और कॉलिंग नंबर सेम हैं</label>
              </div>
            </div>

            <div>
              <label style={labelStyle}>स्कूल का नाम (School Name) *</label>
              <input type="text" name="schoolName" value={formData.schoolName} onChange={handleChange} required style={inputStyle} placeholder="अपने स्कूल का नाम लिखें" />
            </div>

            <div>
              <label style={labelStyle}>जिला (District) *</label>
              <input type="text" name="district" value={formData.district} onChange={handleChange} required style={inputStyle} placeholder="अपने जिले का नाम लिखें" />
            </div>

            <div>
              <label style={labelStyle}>गांव का नाम (Village Name)</label>
              <input type="text" name="villageName" value={formData.villageName} onChange={handleChange} style={inputStyle} placeholder="गांव का नाम" />
            </div>

            <div>
              <label style={labelStyle}>पूरा पता (Full Address)</label>
              <input type="text" name="address" value={formData.address} onChange={handleChange} style={inputStyle} placeholder="हाउस न., गली, एरिया..." />
            </div>
          </div>

          <button type="submit" disabled={loading} style={btnStyle}>
            {loading ? 'सबमिट हो रहा है...' : 'रजिस्ट्रेशन रिक्वेस्ट भेजें'}
          </button>
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Link to="/login" style={{ color: '#173d35', fontSize: '14px', textDecoration: 'none', fontWeight: 'bold' }}>
              ← पहले से खाता है? लॉगिन करें (Back to Login)
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

// Styles
const containerStyle = { padding: 'clamp(30px, 5vw, 60px) 16px', background: '#fbfaf5', minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };
const cardStyle = { background: '#ffffff', padding: 'clamp(24px, 4vw, 36px)', borderRadius: '14px', width: '100%', maxWidth: '720px', boxShadow: '0 6px 24px rgba(23, 61, 53, 0.08)', border: '1px solid #e2ebe4', fontFamily: "'Avenir Next', sans-serif" };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' };
const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#173d35' };
const inputStyle = { width: '100%', padding: '11px 13px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
const eyeButtonStyle = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#547664' };
const btnStyle = { width: '100%', padding: '13px', marginTop: '24px', backgroundColor: '#173d35', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 14px rgba(23, 61, 53, 0.25)', transition: 'all 0.2s ease' };
const errorAlertStyle = { padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', marginBottom: '16px', fontSize: '14px', border: '1px solid #fecaca' };

// Success Card Style (Matching Mentor/Volunteer)
const successCardStyle = {
  background: '#eaf4ee',
  border: '1px solid #bbf7d0',
  borderRadius: '16px',
  padding: '40px 30px',
  maxWidth: '550px',
  width: '100%',
  textAlign: 'center',
  boxShadow: '0 6px 24px rgba(23, 61, 53, 0.08)'
};

const backBtnStyle = {
  backgroundColor: '#173d35',
  color: '#ffffff',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  fontSize: '15px',
  fontWeight: 'bold',
  cursor: 'pointer',
  boxShadow: '0 4px 14px rgba(23, 61, 53, 0.25)',
  transition: 'all 0.2s ease'
};

export default StudentSignUp;