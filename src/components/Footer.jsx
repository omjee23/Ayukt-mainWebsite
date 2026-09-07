import React from 'react';
import logoImg from '../assets/logo.png';
import { OFFICIAL_SOCIAL_LINKS } from '../constants/socialLinks';

const Footer = () => {
  return (
    <footer className="site-footer">
      <div>
        <div className="footer-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img
            src={logoImg}
            alt="AU Logo"
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              backgroundColor: '#fff',
              padding: '1px',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
              objectFit: 'contain'
            }}
          />
          <div>
            <strong style={{ fontSize: '16px', display: 'block' }}>अव्युक्त उत्थान संस्था</strong>
            <span style={{ fontSize: '11px', color: '#b9d9c5', display: 'block' }}>Avyukt Utthan Sanstha</span>
          </div>
        </div>
        <p>Avyukt Utthan Sanstha · learning, dignity, and opportunity for every community.</p>
      </div>
      <div>
        <h4>Contact</h4>
        <a href="mailto:info@avyuktutthansanstha.org">info@avyuktutthansanstha.org</a>
        <a href="tel:+917260009469">+91 72600 09469</a>
        <a href="tel:+918409863552">+91 84098 63552</a>
      </div>
      <div>
        <h4>Visit & Follow Us</h4>
        <p>अव्युक्त उत्थान संस्था, सोनपुरा,<br />बड़कागांव, हजारीबाग,<br />झारखंड – 825311</p>
        <div style={{ marginTop: '12px' }}>
          <span style={{ fontSize: '11px', color: '#e8b35a', fontWeight: '700', letterSpacing: '0.08em', textTransform: 'uppercase', display: 'block', marginBottom: '8px' }}>
            Official Social Media
          </span>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {OFFICIAL_SOCIAL_LINKS.map((item) => (
              <a
                key={item.id}
                href={item.url}
                target="_blank"
                rel="noreferrer"
                title={`${item.name}: ${item.handle}`}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '6px 11px',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  color: '#ffffff',
                  fontSize: '11.5px',
                  fontWeight: '600',
                  textDecoration: 'none',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = item.brandColor;
                  e.currentTarget.style.borderColor = item.brandColor;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.3)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.15)';
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {item.icon}
                <span>{item.name}</span>
              </a>
            ))}
          </div>
        </div>
      </div>
      <small>© 2026 Avyukt Utthan Sanstha. All rights reserved.</small>
    </footer>
  );
};

export default Footer;