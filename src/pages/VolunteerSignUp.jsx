import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { API } from '../config/api';
import logoImg from '../assets/logo.png';

const VolunteerSignUp = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    whatsappPhone: '',
    callingPhone: '',
    sameAsWhatsapp: false,
    district: '',
    address: '',
    contributionMessage: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    setError('');
    setLoading(true);

    try {
      await API.post('/auth/register-volunteer', formData);
      setSubmitted(true);
    } catch (err) {
      setError(err.response?.data?.error || 'रजिस्ट्रेशन विफल रहा। कृपया पुनः प्रयास करें।');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div style={{ padding: 'clamp(40px, 6vw, 80px) 20px', textAlign: 'center', background: '#fbfaf5', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ maxWidth: '550px', width: '100%', margin: '0 auto', background: '#eaf4ee', border: '1px solid #bbf7d0', padding: '36px 24px', borderRadius: '16px', boxShadow: '0 6px 24px rgba(23, 61, 53, 0.08)' }}>
          <h2 style={{ color: '#166534', fontFamily: 'Georgia, serif' }}>आवेदन सफलतापूर्वक सबमिट हुआ!</h2>
          <p style={{ color: '#15803d', marginTop: '10px', fontSize: '15px' }}>
            वालंटियर (Volunteer) के रूप में जुड़ने के लिए धन्यवाद। आपका खाता वर्तमान में <strong>Admin Approval के अधीन है</strong>।
          </p>
          <p style={{ color: '#547664', fontSize: '14px', marginTop: '12px' }}>
            एडमिन के अप्रूव करते ही आपकी Unique Volunteer ID आपके व्हाट्सएप नंबर पर भेज दी जाएगी।
          </p>
          <Link to="/login" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 24px', backgroundColor: '#173d35', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', boxShadow: '0 4px 14px rgba(23, 61, 53, 0.25)' }}>
            लॉगिन पेज पर जाएं (Back to Login)
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '40px 20px', display: 'flex', justifyContent: 'center', fontFamily: 'sans-serif', background: '#f8fafc', minHeight: '85vh' }}>
      <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '700px', background: '#fff', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
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
        <h2 style={{ textAlign: 'center', color: '#0f172a', marginBottom: '8px' }}>वालंटियर रजिस्ट्रेशन (Join as Volunteer)</h2>
        <p style={{ textAlign: 'center', color: '#64748b', fontSize: '14px', marginBottom: '24px' }}>
          अपनी डिटेल्स भरें। स्वीकृति के बाद आपके व्हाट्सएप पर Unique Volunteer ID भेजी जाएगी।
        </p>

        {error && <p style={{ color: '#ef4444', fontSize: '14px', marginBottom: '16px', padding: '10px', background: '#fee2e2', borderRadius: '6px' }}>{error}</p>}

        <div style={gridStyle}>
          <div>
            <label style={labelStyle}>पूरा नाम (Full Name) *</label>
            <input type="text" name="name" value={formData.name} onChange={handleChange} required style={inputStyle} placeholder="अपना नाम लिखें" />
          </div>

          <div>
            <label style={labelStyle}>ईमेल (Email Address) *</label>
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
                placeholder="पासवर्ड बनाएं"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={eyeButtonStyle}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d={showPassword ? 'M3 3l18 18M10.6 10.6a2 2 0 002.8 2.8M9.9 4.2A10.7 10.7 0 0112 4c5 0 9 4 10 8a10.8 10.8 0 01-4 5.4M6.2 6.2A10.8 10.8 0 002 12c1 4 5 8 10 8a10.8 10.8 0 004.1-.8' : 'M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12zm10 3a3 3 0 100-6 3 3 0 000 6z'} /></svg>
              </button>
            </div>
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
            <label style={labelStyle}>जिला (District) *</label>
            <input type="text" name="district" value={formData.district} onChange={handleChange} required style={inputStyle} placeholder="अपने जिले का नाम" />
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={labelStyle}>पूरा पता (Full Address)</label>
            <input type="text" name="address" value={formData.address} onChange={handleChange} style={inputStyle} placeholder="पता" />
          </div>
        </div>

        {/* Contribution Message */}
        <div style={{ marginTop: '16px' }}>
          <label style={labelStyle}>योगदान / संदेश (Contribution Message)</label>
          <textarea
            name="contributionMessage"
            rows="3"
            value={formData.contributionMessage}
            onChange={handleChange}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="आप संस्था में किस प्रकार का सामाजिक सहयोग / सहायता देना चाहते हैं..."
          />
        </div>

        <button type="submit" disabled={loading} style={{ width: '100%', padding: '13px', marginTop: '24px', backgroundColor: '#173d35', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(23, 61, 53, 0.25)', transition: 'all 0.2s ease' }}>
          {loading ? 'सबमिट हो रहा है...' : 'Apply for Volunteer Approval'}
        </button>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/login" style={{ color: '#173d35', fontSize: '14px', textDecoration: 'none', fontWeight: 'bold' }}>
            ← पहले से खाता है? लॉगिन करें (Back to Login)
          </Link>
        </div>
      </form>
    </div>
  );
};

const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '16px' };
const labelStyle = { display: 'block', fontSize: '13px', fontWeight: '700', color: '#173d35', marginBottom: '4px' };
const inputStyle = { width: '100%', padding: '11px 13px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
const eyeButtonStyle = { position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', color: '#547664' };

export default VolunteerSignUp;