import React, { useState, useEffect } from 'react';
import { API, BACKEND_URL, getImageSrc as resolveImageSrc } from '../config/api';

// Professional SVG Icons matching corporate NGO branding
const IconSparkle = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2L14.4 9.6L22 12L14.4 14.4L12 22L9.6 14.4L2 12L9.6 9.6L12 2Z" />
  </svg>
);

const IconLeaf = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const IconBulb = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const IconTrophy = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
    <path d="M6 4h12v7a6 6 0 0 1-12 0V4Z" />
  </svg>
);

const IconCalendar = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const IconMapPin = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconSearch = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <line x1="21" x2="16.65" y1="21" y2="16.65" />
  </svg>
);

const IconCheck = ({ size = 16, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const IconLayers = ({ size = 20, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [lightboxImage, setLightboxImage] = useState(null);
  const [registeredSuccess, setRegisteredSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    userType: 'Student',
    cityVillage: '',
    state: 'झारखंड',
    specialRequest: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await API.get('/posts/all');
      const communityEvents = (res.data || []).filter((item) => {
        const cat = (item.category || '').toLowerCase();
        return (
          cat.includes('event') ||
          cat.includes('workshop') ||
          cat.includes('competition') ||
          cat.includes('contest') ||
          cat.includes('debate') ||
          cat.includes('अभियान') ||
          cat.includes('शिविर') ||
          cat.includes('कार्यशाला') ||
          item.isRegistrationRequired === true ||
          Boolean(item.location)
        );
      });
      setEvents(communityEvents);
    } catch (err) {
      console.error('Error fetching events:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!selectedEvent) return;

    setSubmitting(true);
    setErrorMessage('');

    try {
      await API.post('/posts/register', {
        eventId: selectedEvent._id,
        postId: selectedEvent._id,
        ...formData
      });

      setRegisteredSuccess(true);
    } catch (err) {
      setErrorMessage(err.response?.data?.error || 'पंजीकरण में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  };

  const closeModal = () => {
    setSelectedEvent(null);
    setRegisteredSuccess(false);
    setErrorMessage('');
    setFormData({
      name: '',
      email: '',
      phone: '',
      userType: 'Student',
      cityVillage: '',
      state: 'झारखंड',
      specialRequest: ''
    });
  };

  const resetForm = closeModal;

  const getImageSrc = (url) => resolveImageSrc(url);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  // Helper to get refined category badge styling
  const getCategoryMeta = (item) => {
    const cat = (item?.category || '').toLowerCase();
    const title = (item?.title || '').toLowerCase();

    if (cat.includes('workshop') || cat.includes('कार्यशाला')) {
      return {
        label: 'कार्यशाला एवं कौशल',
        icon: <IconBulb size={13} color="#173d35" />,
        bg: '#eff6f2',
        color: '#173d35',
        border: '#cbe0d3'
      };
    }
    if (cat.includes('competition') || cat.includes('contest') || cat.includes('debate') || cat.includes('प्रतियोगिता')) {
      return {
        label: 'प्रतिभा मंच व प्रतियोगिता',
        icon: <IconTrophy size={13} color="#9a6208" />,
        bg: '#fdf8ec',
        color: '#9a6208',
        border: '#f5ddad'
      };
    }
    return {
      label: 'जमीनी अभियान व शिविर',
      icon: <IconLeaf size={13} color="#173d35" />,
      bg: '#eaf4ee',
      color: '#173d35',
      border: '#c3ded0'
    };
  };

  const filteredEvents = events.filter((item) => {
    // Category filter
    if (categoryFilter !== 'ALL') {
      const cat = (item.category || '').toLowerCase();
      if (categoryFilter === 'WORKSHOP' && !cat.includes('workshop') && !cat.includes('कार्यशाला')) return false;
      if (categoryFilter === 'COMPETITION' && !cat.includes('competition') && !cat.includes('contest') && !cat.includes('प्रतियोगिता')) return false;
      if (categoryFilter === 'DRIVE' && !cat.includes('अभियान') && !cat.includes('शिविर') && !cat.includes('event')) return false;
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc;
    }

    return true;
  });

  return (
    <div style={{
      backgroundColor: '#fbfaf5',
      minHeight: '90vh',
      padding: 'clamp(20px, 3.5vw, 44px) clamp(14px, 3vw, 28px)',
      fontFamily: "'Avenir Next', 'Helvetica Neue', system-ui, -apple-system, sans-serif",
      color: '#20332b'
    }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

        {/* Hero Banner - Royal Emerald Theme */}
        <div style={{
          position: 'relative',
          background: 'radial-gradient(circle at 82% 28%, #1e4d43 0%, #173d35 55%, #0d2822 100%)',
          borderRadius: '20px',
          padding: 'clamp(28px, 4.5vw, 48px) clamp(20px, 4vw, 44px)',
          color: '#ffffff',
          marginBottom: '28px',
          boxShadow: '0 16px 36px rgba(13, 40, 34, 0.22)',
          border: '1px solid rgba(232, 179, 90, 0.35)',
          overflow: 'hidden'
        }}>
          {/* Subtle Ambient Glow */}
          <div style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '260px',
            height: '260px',
            background: 'radial-gradient(circle, rgba(232, 179, 90, 0.15) 0%, rgba(23, 61, 53, 0) 70%)',
            pointerEvents: 'none',
            borderRadius: '50%'
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              background: 'rgba(232, 179, 90, 0.12)',
              border: '1px solid rgba(232, 179, 90, 0.3)',
              padding: '6px 14px',
              borderRadius: '24px',
              fontSize: '11.5px',
              fontWeight: '800',
              color: '#e8b35a',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
              marginBottom: '16px'
            }}>
              <IconSparkle />
              <span>जमीनी अभियान एवं कार्यशालाएं · COMMUNITY DRIVES & WORKSHOPS</span>
            </div>

            <h1 style={{
              fontFamily: 'Georgia, serif',
              fontSize: 'clamp(28px, 4.2vw, 44px)',
              margin: '0 0 12px 0',
              fontWeight: '600',
              lineHeight: 1.15,
              color: '#ffffff',
              letterSpacing: '-0.01em'
            }}>
              Events & Community Drives
            </h1>

            <p style={{
              fontSize: 'clamp(14px, 1.4vw, 16.5px)',
              maxWidth: '820px',
              margin: 0,
              color: '#d1e3d7',
              lineHeight: '1.65'
            }}>
              पर्यावरण संरक्षण, पौधारोपण महाभियान, कौशल विकास कार्यशालाएं और वाद-विवाद प्रतियोगिताएं। समाज एवं प्रकृति के सतत संवर्धन में सहभागिता सुनिश्चित करने हेतु इन अभियानों से निःशुल्क जुड़ें।
            </p>
          </div>
        </div>

        {/* Stats Strip - Corporate NGO Impact Style */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))',
          gap: '16px',
          marginBottom: '26px'
        }}>
          {[
            {
              label: 'कुल सक्रिय कार्यक्रम',
              sub: 'सभी जमीनी पहल',
              count: events.length,
              icon: <IconLayers size={22} color="#173d35" />,
              iconBg: '#eaf3ed'
            },
            {
              label: 'पौधारोपण व स्वच्छता शिविर',
              sub: 'हरित ग्राम अभियान',
              count: events.filter(e => (e.category || '').toLowerCase().includes('अभियान') || (e.title || '').includes('पौध')).length || 2,
              icon: <IconLeaf size={22} color="#173d35" />,
              iconBg: '#eaf4ee'
            },
            {
              label: 'कौशल विकास कार्यशालाएं',
              sub: 'प्रशिक्षण व शिक्षा',
              count: events.filter(e => (e.category || '').toLowerCase().includes('workshop') || (e.category || '').includes('कार्यशाला')).length,
              icon: <IconBulb size={22} color="#173d35" />,
              iconBg: '#eff6f2'
            },
            {
              label: 'प्रतिभा मंच व प्रतियोगिताएं',
              sub: 'युवा नेतृत्व व संवाद',
              count: events.filter(e => (e.category || '').toLowerCase().includes('competition') || e.hasPrize).length,
              icon: <IconTrophy size={22} color="#9a6208" />,
              iconBg: '#fef7ea'
            }
          ].map((stat, idx) => (
            <div
              key={idx}
              style={{
                background: '#ffffff',
                padding: '18px 20px',
                borderRadius: '14px',
                border: '1px solid #d8e5d6',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
                boxShadow: '0 4px 14px rgba(31, 61, 48, 0.04)',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease'
              }}
            >
              <div style={{
                width: '46px',
                height: '46px',
                minWidth: '46px',
                borderRadius: '12px',
                background: stat.iconBg,
                display: 'grid',
                placeItems: 'center',
                border: '1px solid rgba(23, 61, 53, 0.08)'
              }}>
                {stat.icon}
              </div>
              <div style={{ minWidth: 0, overflow: 'hidden' }}>
                <div style={{
                  fontSize: 'clamp(22px, 2.5vw, 28px)',
                  fontWeight: '700',
                  color: '#173d35',
                  fontFamily: 'Georgia, serif',
                  lineHeight: 1.1
                }}>
                  {loading ? '...' : stat.count}
                </div>
                <div style={{
                  fontSize: '12.5px',
                  color: '#20332b',
                  fontWeight: '700',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  marginTop: '3px'
                }}>
                  {stat.label}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: '#64748b',
                  fontWeight: '500'
                }}>
                  {stat.sub}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Filter & Search Bar */}
        <div style={{
          background: '#ffffff',
          padding: '16px clamp(14px, 2vw, 24px)',
          borderRadius: '14px',
          border: '1px solid #d8e5d6',
          marginBottom: '26px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '14px',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 4px 14px rgba(31, 61, 48, 0.04)'
        }}>
          {/* Category Filter Pills */}
          <div className="touch-scroll-bar" style={{ alignItems: 'center', flex: '1 1 auto', display: 'flex', gap: '8px', overflowX: 'auto' }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '800',
              color: '#173d35',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginRight: '4px',
              whiteSpace: 'nowrap',
              flexShrink: 0
            }}>
              श्रेणी:
            </span>
            {[
              { id: 'ALL', label: 'सभी कार्यक्रम' },
              { id: 'DRIVE', label: 'जमीनी अभियान व शिविर' },
              { id: 'WORKSHOP', label: 'कार्यशालाएं' },
              { id: 'COMPETITION', label: 'प्रतियोगिताएं' }
            ].map((tab) => {
              const active = categoryFilter === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setCategoryFilter(tab.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '24px',
                    border: active ? '1px solid #173d35' : '1px solid #d8e5d6',
                    background: active ? '#173d35' : '#ffffff',
                    color: active ? '#ffffff' : '#334155',
                    fontSize: '12.5px',
                    fontWeight: active ? '700' : '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    boxShadow: active ? '0 2px 8px rgba(23, 61, 53, 0.2)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            flex: '1 1 240px',
            maxWidth: '340px'
          }}>
            <div style={{
              position: 'absolute',
              left: '12px',
              display: 'grid',
              placeItems: 'center',
              color: '#64748b',
              pointerEvents: 'none'
            }}>
              <IconSearch size={16} />
            </div>
            <input
              type="text"
              placeholder="स्थान, शीर्षक या विषय खोजें..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '9px 14px 9px 36px',
                borderRadius: '24px',
                border: '1px solid #d8e5d6',
                background: '#fbfaf5',
                fontSize: '13px',
                color: '#20332b',
                outline: 'none',
                transition: 'border-color 0.15s ease, background-color 0.15s ease'
              }}
              onFocus={(e) => {
                e.target.style.borderColor = '#173d35';
                e.target.style.backgroundColor = '#ffffff';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#d8e5d6';
                e.target.style.backgroundColor = '#fbfaf5';
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '2px 6px'
                }}
                title="हटाएं"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '70px 0', color: '#173d35' }}>
            <div style={{ display: 'inline-block', animation: 'spin 1.5s linear infinite', marginBottom: '14px' }}>
              <IconSparkle />
            </div>
            <p style={{ fontFamily: 'Georgia, serif', fontWeight: '600', fontSize: '18px', color: '#173d35', margin: 0 }}>
              कार्यक्रम व अभियान लोड हो रहे हैं...
            </p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredEvents.length === 0 && (
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            padding: '70px 24px',
            textAlign: 'center',
            border: '1px solid #d8e5d6',
            boxShadow: '0 4px 16px rgba(31, 61, 48, 0.04)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              borderRadius: '50%',
              background: '#eaf3ed',
              color: '#173d35',
              display: 'grid',
              placeItems: 'center',
              margin: '0 auto 16px auto'
            }}>
              <IconLeaf size={32} color="#173d35" />
            </div>
            <h3 style={{ fontFamily: 'Georgia, serif', fontSize: '22px', color: '#173d35', margin: '0 0 8px 0' }}>
              कोई अभियान नहीं मिला
            </h3>
            <p style={{ color: '#64748b', fontSize: '14px', margin: '0 0 20px 0', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto', lineHeight: '1.6' }}>
              वर्तमान में चुने गए फ़िल्टर या खोज शब्द के अनुसार कोई कार्यक्रम उपलब्ध नहीं है।
            </p>
            <button
              onClick={() => { setCategoryFilter('ALL'); setSearchQuery(''); }}
              style={{
                padding: '10px 22px',
                background: '#173d35',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13.5px',
                fontWeight: '700',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(23, 61, 53, 0.25)'
              }}
            >
              सभी अभियान देखें
            </button>
          </div>
        )}

        {/* Events Grid */}
        {!loading && filteredEvents.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
            gap: 'clamp(18px, 2.5vw, 26px)'
          }}>
            {filteredEvents.map((evt) => {
              const dateStr = formatDate(evt.eventDate || evt.createdAt);
              const imgSrc = getImageSrc(evt.bannerUrl || evt.imageUrl);
              const meta = getCategoryMeta(evt);

              return (
                <div
                  key={evt._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #d8e5d6',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    boxShadow: '0 6px 20px rgba(31, 61, 48, 0.05)',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 28px rgba(31, 61, 48, 0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 61, 48, 0.05)';
                  }}
                >
                  {/* Banner Image */}
                  <div
                    onClick={() => imgSrc && setLightboxImage(imgSrc)}
                    style={{
                      height: '200px',
                      width: '100%',
                      overflow: 'hidden',
                      cursor: imgSrc ? 'zoom-in' : 'default',
                      position: 'relative',
                      background: 'radial-gradient(circle at 50% 50%, #1e4d43 0%, #173d35 100%)'
                    }}
                  >
                    {imgSrc ? (
                      <img
                        src={imgSrc}
                        alt={evt.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#d1e3d7'
                      }}>
                        <div style={{
                          width: '54px',
                          height: '54px',
                          borderRadius: '50%',
                          background: 'rgba(255, 255, 255, 0.1)',
                          border: '1px solid rgba(232, 179, 90, 0.3)',
                          display: 'grid',
                          placeItems: 'center',
                          marginBottom: '8px'
                        }}>
                          {meta.icon}
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '600', letterSpacing: '0.04em' }}>
                          विशेष आयोजन पोस्टर
                        </span>
                      </div>
                    )}

                    {/* Date Badge */}
                    {dateStr && (
                      <div style={{
                        position: 'absolute',
                        top: '12px',
                        left: '12px',
                        background: 'rgba(13, 40, 34, 0.85)',
                        backdropFilter: 'blur(8px)',
                        WebkitBackdropFilter: 'blur(8px)',
                        color: '#ffffff',
                        padding: '4px 10px',
                        borderRadius: '20px',
                        fontSize: '11.5px',
                        fontWeight: '700',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        border: '1px solid rgba(232, 179, 90, 0.4)',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                      }}>
                        <IconCalendar size={13} color="#e8b35a" />
                        <span>{dateStr}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div style={{ padding: '22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    {/* Category Chip */}
                    <div style={{ marginBottom: '12px' }}>
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 11px',
                        borderRadius: '20px',
                        background: meta.bg,
                        color: meta.color,
                        border: `1px solid ${meta.border}`,
                        fontSize: '11.5px',
                        fontWeight: '700'
                      }}>
                        {meta.icon}
                        <span>{meta.label}</span>
                      </span>
                    </div>

                    {/* Title */}
                    <h3 style={{
                      margin: '0 0 10px 0',
                      fontSize: '19px',
                      color: '#173d35',
                      fontFamily: 'Georgia, serif',
                      lineHeight: '1.38',
                      fontWeight: '600'
                    }}>
                      {evt.title}
                    </h3>

                    {/* Description */}
                    <p style={{
                      color: '#64748b',
                      fontSize: '13.5px',
                      lineHeight: '1.65',
                      margin: '0 0 18px 0',
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      flex: 1
                    }}>
                      {evt.description}
                    </p>

                    {/* Footer Metadata & CTA */}
                    <div style={{ borderTop: '1px solid #edf3ee', paddingTop: '16px', marginTop: 'auto' }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: '14px',
                        fontSize: '12.5px',
                        color: '#547664'
                      }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                          <IconMapPin size={15} color="#173d35" />
                          <span>{evt.location || 'ग्राम सोनपुरा एवं पंचायत भवन'}</span>
                        </span>
                        <span style={{
                          fontWeight: '700',
                          color: '#173d35',
                          background: '#f1f7f3',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          fontSize: '11px',
                          border: '1px solid #dcebe2'
                        }}>
                          {evt.mode || 'Offline'}
                        </span>
                      </div>

                      <button
                        onClick={() => { setSelectedEvent(evt); setRegisteredSuccess(false); setErrorMessage(''); }}
                        style={{
                          width: '100%',
                          padding: '11px 16px',
                          background: '#173d35',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontWeight: '700',
                          fontSize: '13.5px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '8px',
                          boxShadow: '0 4px 12px rgba(23, 61, 53, 0.2)',
                          transition: 'background 0.2s ease, transform 0.15s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#102e29'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = '#173d35'; }}
                      >
                        <IconCalendar size={16} color="#e8b35a" />
                        <span>सहभागिता हेतु पंजीकरण करें</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Registration Modal */}
      {selectedEvent && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(13, 40, 34, 0.72)',
          backdropFilter: 'blur(5px)',
          WebkitBackdropFilter: 'blur(5px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: 'clamp(12px, 3vw, 24px)'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '18px',
            maxWidth: '540px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 24px 50px rgba(0, 0, 0, 0.3)',
            border: '1px solid #d8e5d6'
          }}>
            {/* Modal Header */}
            <div style={{
              background: 'radial-gradient(circle at 85% 30%, #1e4d43 0%, #173d35 55%, #0d2822 100%)',
              padding: '18px clamp(18px, 3.5vw, 28px)',
              color: '#ffffff',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTopLeftRadius: '17px',
              borderTopRightRadius: '17px',
              borderBottom: '1px solid rgba(232, 179, 90, 0.3)'
            }}>
              <div>
                <span style={{
                  fontSize: '11px',
                  fontWeight: '800',
                  letterSpacing: '0.12em',
                  color: '#e8b35a',
                  textTransform: 'uppercase'
                }}>
                  EVENT & DRIVE PARTICIPATION
                </span>
                <h3 style={{ margin: '4px 0 0 0', fontSize: '20px', fontFamily: 'Georgia, serif', color: '#ffffff' }}>
                  कार्यक्रम में निःशुल्क पंजीकरण
                </h3>
              </div>
              <button
                onClick={closeModal}
                style={{
                  background: 'rgba(255, 255, 255, 0.12)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  cursor: 'pointer',
                  fontSize: '15px',
                  display: 'grid',
                  placeItems: 'center',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)'; }}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '24px clamp(18px, 3.5vw, 28px)' }}>
              {registeredSuccess ? (
                <div style={{ textAlign: 'center', padding: '24px 10px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: '#eaf3ed',
                    border: '2px solid #173d35',
                    display: 'grid',
                    placeItems: 'center',
                    margin: '0 auto 16px auto',
                    color: '#173d35'
                  }}>
                    <IconCheck size={32} color="#173d35" />
                  </div>
                  <h4 style={{ color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '22px', margin: '0 0 10px 0' }}>
                    पंजीकरण सफलतापूर्वक दर्ज हो गया!
                  </h4>
                  <p style={{ color: '#547664', fontSize: '14px', lineHeight: '1.6', margin: '0 0 24px 0' }}>
                    हार्दिक बधाई! आपका नाम <strong>"{selectedEvent.title}"</strong> के लिए सफलतापूर्वक दर्ज कर लिया गया है।
                    कार्यक्रम स्थल व समय संबंधी सूचना आपको संदेश के माध्यम से प्रदान की जाएगी।
                  </p>
                  <button
                    onClick={closeModal}
                    style={{
                      padding: '11px 28px',
                      borderRadius: '8px',
                      background: '#173d35',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: '700',
                      fontSize: '14px',
                      cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(23, 61, 53, 0.25)'
                    }}
                  >
                    ठीक है (Done)
                  </button>
                </div>
              ) : (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  
                  <div style={{
                    background: '#f7faf8',
                    padding: '12px 16px',
                    borderRadius: '10px',
                    border: '1px solid #d8e5d6'
                  }}>
                    <div style={{ fontSize: '11px', color: '#547664', fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      चयनित कार्यक्रम:
                    </div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#173d35', marginTop: '3px', fontFamily: 'Georgia, serif' }}>
                      {selectedEvent.title}
                    </div>
                  </div>

                  {errorMessage && (
                    <div style={{
                      padding: '11px 14px',
                      borderRadius: '8px',
                      background: '#fef2f2',
                      border: '1px solid #fecaca',
                      color: '#b91c1c',
                      fontSize: '13px',
                      fontWeight: '500'
                    }}>
                      ⚠️ {errorMessage}
                    </div>
                  )}

                  <div>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#173d35', marginBottom: '5px' }}>
                      आपका पूरा नाम *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="उदा. अमित कुमार"
                      style={{
                        width: '100%',
                        padding: '10px 13px',
                        borderRadius: '8px',
                        border: '1px solid #cbd5e1',
                        fontSize: '13.5px',
                        boxSizing: 'border-box',
                        outline: 'none'
                      }}
                      onFocus={(e) => { e.target.style.borderColor = '#173d35'; }}
                      onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#173d35', marginBottom: '5px' }}>
                        मोबाइल / WhatsApp *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="10-अंकीय मोबाइल नंबर"
                        style={{
                          width: '100%',
                          padding: '10px 13px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box',
                          outline: 'none'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#173d35'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#173d35', marginBottom: '5px' }}>
                        सहभागिता भूमिका
                      </label>
                      <select
                        value={formData.userType}
                        onChange={(e) => setFormData({ ...formData, userType: e.target.value })}
                        style={{
                          width: '100%',
                          padding: '10px 13px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box',
                          background: '#ffffff',
                          outline: 'none'
                        }}
                      >
                        <option value="Student">विद्यार्थी (Student)</option>
                        <option value="Volunteer">स्वयंसेवक (Volunteer)</option>
                        <option value="Mentor">मार्गदर्शक / शिक्षक (Mentor)</option>
                        <option value="Guest">अतिथि / नागरिक (Guest)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#173d35', marginBottom: '5px' }}>
                        गाँव / शहर
                      </label>
                      <input
                        type="text"
                        value={formData.cityVillage}
                        onChange={(e) => setFormData({ ...formData, cityVillage: e.target.value })}
                        placeholder="गाँव या शहर का नाम"
                        style={{
                          width: '100%',
                          padding: '10px 13px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box',
                          outline: 'none'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#173d35'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '700', color: '#173d35', marginBottom: '5px' }}>
                        ईमेल (वैकल्पिक)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="email@example.com"
                        style={{
                          width: '100%',
                          padding: '10px 13px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13.5px',
                          boxSizing: 'border-box',
                          outline: 'none'
                        }}
                        onFocus={(e) => { e.target.style.borderColor = '#173d35'; }}
                        onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button
                      type="submit"
                      disabled={submitting}
                      style={{
                        flex: 1,
                        padding: '12px 18px',
                        borderRadius: '8px',
                        background: '#173d35',
                        color: '#ffffff',
                        border: 'none',
                        fontSize: '14px',
                        fontWeight: '700',
                        cursor: submitting ? 'not-allowed' : 'pointer',
                        opacity: submitting ? 0.7 : 1,
                        boxShadow: '0 4px 12px rgba(23, 61, 53, 0.25)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = '#102e29'; }}
                      onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = '#173d35'; }}
                    >
                      {submitting ? 'पंजीकरण हो रहा है...' : 'निःशुल्क भागीदारी दर्ज करें'}
                    </button>
                    <button
                      type="button"
                      onClick={closeModal}
                      style={{
                        padding: '12px 18px',
                        borderRadius: '8px',
                        background: '#f1f5f9',
                        color: '#475569',
                        border: '1px solid #cbd5e1',
                        fontSize: '13px',
                        fontWeight: '600',
                        cursor: 'pointer'
                      }}
                    >
                      रद्द करें
                    </button>
                  </div>

                </form>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {lightboxImage && (
        <div
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(13, 40, 34, 0.88)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
        >
          <img
            src={lightboxImage}
            alt="Event Poster"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '12px',
              objectFit: 'contain',
              boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
              border: '1px solid rgba(232, 179, 90, 0.3)'
            }}
          />
        </div>
      )}

    </div>
  );
};

export default Events;