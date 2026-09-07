import React, { useState, useEffect } from 'react';
import API, { getImageSrc } from '../config/api';

const ROLE_BADGES = {
  student: {
    label: '🎓 Student',
    bg: '#eff6ff',
    color: '#1d4ed8',
    borderColor: '#3b82f6',
    topBar: '#3b82f6'
  },
  mentor: {
    label: '👨‍🏫 Mentor',
    bg: '#f0fdf4',
    color: '#15803d',
    borderColor: '#22c55e',
    topBar: '#22c55e'
  },
  volunteer: {
    label: '🤝 Volunteer',
    bg: '#fdf4ff',
    color: '#a21caf',
    borderColor: '#d946ef',
    topBar: '#d946ef'
  },
  guest: {
    label: '🌟 Special Guest',
    bg: '#fff7ed',
    color: '#c2410c',
    borderColor: '#f97316',
    topBar: '#ea580c'
  }
};

const TestimonialsSection = () => {
  const [testimonials, setTestimonials] = useState([]);
  const [filterRole, setFilterRole] = useState('All');

  useEffect(() => {
    fetchTestimonials();
  }, []);

  const fetchTestimonials = async () => {
    try {
      const res = await API.get('/feedback/testimonials');
      setTestimonials(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Testimonials fetch error:', err);
    }
  };

  const filteredTestimonials = filterRole === 'All' 
    ? testimonials 
    : testimonials.filter(t => t.userRole?.toLowerCase() === filterRole.toLowerCase());

  const getRoleBadge = (role) => {
    const key = (role || '').toLowerCase().trim();
    return ROLE_BADGES[key] || {
      label: '🌟 Supporter',
      bg: '#f8fafc',
      color: '#475569',
      borderColor: '#94a3b8',
      topBar: '#64748b'
    };
  };

  if (testimonials.length === 0) return null;

  return (
    <section style={{ backgroundColor: '#fbfaf5', padding: '80px 24px', borderTop: '1px solid #e3e9e3' }}>
      <div style={{ maxWidth: '1150px', margin: '0 auto' }}>
        
        {/* Section Heading matching website theme */}
        <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 36px auto' }}>
          <span className="section-kicker" style={{ color: '#c4a04c', fontSize: '11px', fontWeight: '800', letterSpacing: '.17em' }}>
            प्रशंसा एवं अनुभव · VOICES & EXPERIENCES
          </span>
          <h2 style={{
            margin: '12px 0 10px 0',
            fontFamily: 'Georgia, serif',
            fontSize: '36px',
            fontWeight: '500',
            color: '#173d35',
            lineHeight: 1.2
          }}>
            हमारे सदस्यों एवं समर्थकों के विचार
          </h2>
          <p style={{ color: '#718078', fontSize: '15.5px', lineHeight: '1.6', margin: 0 }}>
            देखिए स्टूडेंट्स, मेंटॉर्स, वॉलंटियर्स और शुभचिंतकों का अवयुक्त उत्थान संस्था के साथ कैसा आत्मीय अनुभव रहा।
          </p>
        </div>

        {/* Category Filters matching website theme */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '36px', flexWrap: 'wrap' }}>
          {[
            { key: 'All', label: 'सभी विचार (All)' },
            { key: 'Student', label: '🎓 Students' },
            { key: 'Mentor', label: '👨‍🏫 Mentors' },
            { key: 'Volunteer', label: '🤝 Volunteers' },
            { key: 'Guest', label: '🌟 Guests' }
          ].map((item) => {
            const isActive = filterRole === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setFilterRole(item.key)}
                style={{
                  padding: '9px 18px',
                  borderRadius: '24px',
                  border: isActive ? '1.5px solid #173d35' : '1px solid #dbe6dc',
                  backgroundColor: isActive ? '#173d35' : '#ffffff',
                  color: isActive ? '#ffffff' : '#547664',
                  fontWeight: '700',
                  cursor: 'pointer',
                  fontSize: '13px',
                  boxShadow: isActive ? '0 4px 12px rgba(23, 61, 53, 0.2)' : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s ease'
                }}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        {/* Cards Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '22px' }}>
          {filteredTestimonials.map((item) => {
            const badge = getRoleBadge(item.userRole);
            return (
              <div
                key={item._id}
                style={{
                  background: '#ffffff',
                  padding: '26px 24px',
                  borderRadius: '14px',
                  border: '1px solid #e3e9e3',
                  borderTop: `4px solid ${badge.topBar}`,
                  boxShadow: '0 8px 24px rgba(31, 61, 48, 0.06)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
              >
                <div>
                  {/* Top Bar: Role Pill & Rating */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                    <span style={{
                      background: badge.bg,
                      color: badge.color,
                      border: `1px solid ${badge.borderColor}30`,
                      padding: '4px 11px',
                      borderRadius: '14px',
                      fontSize: '11.5px',
                      fontWeight: '700',
                      letterSpacing: '.2px'
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ color: '#f59e0b', fontSize: '15px', letterSpacing: '1px' }}>
                      {'★'.repeat(item.rating || 5)}{'☆'.repeat(Math.max(0, 5 - (item.rating || 5)))}
                    </span>
                  </div>

                  {/* Feedback Text with decorative quote */}
                  <p style={{
                    color: '#20332b',
                    fontSize: '14.5px',
                    lineHeight: '1.65',
                    margin: '0 0 18px 0',
                    fontStyle: 'normal'
                  }}>
                    <span style={{ color: '#e8b35a', fontSize: '20px', fontWeight: 'bold', marginRight: '4px' }}>“</span>
                    {item.feedbackText}
                    <span style={{ color: '#e8b35a', fontSize: '20px', fontWeight: 'bold', marginLeft: '2px' }}>”</span>
                  </p>
                </div>

                {/* Author Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '14px'
                }}>
                  <img
                    src={getImageSrc(item.userAvatar) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
                    alt={item.userName}
                    style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: `2px solid ${badge.topBar}`,
                      boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                    }}
                  />
                  <div>
                    <h4 style={{
                      margin: 0,
                      fontSize: '15px',
                      fontFamily: 'Georgia, serif',
                      color: '#173d35',
                      fontWeight: '600'
                    }}>
                      {item.userName}
                    </h4>
                    <span style={{ fontSize: '11.5px', color: '#718078' }}>
                      {item.category || 'Class/Session Review'} · अवयुक्त साथी
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsSection;