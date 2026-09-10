import React, { useState } from 'react';
import { OFFICIAL_SOCIAL_LINKS } from '../constants/socialLinks';
import API from '../config/api';

const Contact = () => {
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [form, setForm] = useState({ name: '', email: '', message: '' });

  const submitInquiry = async (event) => {
    event.preventDefault();
    setLoading(true);
    setErrorMsg('');
    try {
      await API.post('/contact', form);
      setSent(true);
      setForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Contact inquiry error:', error);
      setErrorMsg('सर्वर से संपर्क नहीं हो पाया। ईमेल द्वारा भेजने का प्रयास करें।');
      setTimeout(() => {
        window.location.href = `mailto:info@avyuktutthansanstha.org?subject=Website inquiry from ${encodeURIComponent(form.name)}&body=${encodeURIComponent(form.message)}`;
      }, 1000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="contact-page">
      <div className="contact-intro">
        <span className="section-kicker">LET'S CONNECT</span>
        <h1>Bring a good question.</h1>
        <p>Whether you want to learn, volunteer, partner, or simply understand our work, our team would love to hear from you.</p>
        <div className="contact-detail">
          <strong>Email</strong>
          <a href="mailto:info@avyuktutthansanstha.org">info@avyuktutthansanstha.org</a>
        </div>
        <div className="contact-detail">
          <strong>Phone</strong>
          <a href="tel:+917260009469">+91 72600 09469</a>
          <a href="tel:+918409863552">+91 84098 63552</a>
        </div>
        <div className="contact-detail">
          <strong>Address</strong>
          <span>अव्युक्त उत्थान संस्था, सोनपुरा, बड़कागांव, हजारीबाग, झारखंड – 825311</span>
        </div>

        {/* Official Social Media Channels */}
        <div className="contact-detail" style={{ marginTop: '28px' }}>
          <strong>आधिकारिक सोशल मीडिया (Official Channels)</strong>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 190px), 1fr))', gap: '10px', marginTop: '10px' }}>
            {OFFICIAL_SOCIAL_LINKS.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '10px 14px',
                  background: '#ffffff',
                  border: '1px solid #e2ebe4',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  color: '#173d35',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = item.brandColor;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.08)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#e2ebe4';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.04)';
                }}
              >
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '6px',
                  background: item.badgeBg,
                  color: item.brandColor,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}>
                  {item.icon}
                </div>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ fontSize: '13px', fontWeight: '700', color: '#173d35' }}>{item.name}</div>
                  <div style={{ fontSize: '11px', color: '#64748b', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{item.handle}</div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </div>

      <form className="contact-form" onSubmit={submitInquiry}>
        <span className="section-kicker">WRITE TO US</span>
        <h2>Start a conversation</h2>
        <label>Your name<input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></label>
        <label>Email address<input required type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} /></label>
        <label>Your message<textarea required rows="5" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} /></label>
        <button type="submit" disabled={loading} className="contact-submit">
          {loading ? 'संदेश भेजा जा रहा है...' : sent ? 'Message sent ✓' : 'Send inquiry →'}
        </button>
        {sent && (
          <div style={{ marginTop: '12px' }}>
            <p className="success-message" style={{ margin: 0 }}>
              धन्यवाद! आपका संदेश सफलतापूर्वक प्राप्त हो गया है। हमारी टीम शीघ्र ही आपसे संपर्क करेगी।
            </p>
            <button
              type="button"
              onClick={() => setSent(false)}
              style={{ marginTop: '8px', background: 'none', border: 'none', color: '#166534', textDecoration: 'underline', cursor: 'pointer', fontSize: '12.5px', padding: 0, fontWeight: '600' }}
            >
              + दूसरा संदेश भेजें (Send another message)
            </button>
          </div>
        )}
        {errorMsg && <p style={{ color: '#dc2626', fontSize: '13px', marginTop: '10px' }}>{errorMsg}</p>}
      </form>
    </section>
  );
};

export default Contact;