import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import JitsiMeet from '../components/JitsiMeet';
import API, { BACKEND_URL } from '../config/api';

const AUDIENCE_PAIRS = [
  'Student + Mentor',
  'Volunteer + Student',
  'Mentor + Volunteer',
  'Volunteer + Guest',
  'Guest + Student',
  'Mentor + Guest',
  'Open to All / All-Hands'
];

const LiveSessions = () => {
  const { user } = useContext(AuthContext);

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Tab: 'upcoming' | 'past'
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedAudienceFilter, setSelectedAudienceFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Interactive Modals
  const [recordingModalData, setRecordingModalData] = useState(null);

  // Direct Portal ID Join & Date Verification Modal
  const [verifyModalSession, setVerifyModalSession] = useState(null);
  const [verifyIdentifier, setVerifyIdentifier] = useState('');
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState('');
  const [verifiedSuccess, setVerifiedSuccess] = useState(false);
  const [verifiedRoom, setVerifiedRoom] = useState('');

  useEffect(() => {
    fetchLiveSessions();
  }, []);

  useEffect(() => {
    if (user?.name || user?.email) {
      setVerifyIdentifier(user.name || user.email);
    }
  }, [user]);

  const fetchLiveSessions = async () => {
    try {
      setLoading(true);
      const res = await API.get('/classes/public?entryType=session');
      setSessions(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching live sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const isSessionLive = (cls) => {
    if (cls.status === 'live') return true;
    if (!cls.dateTime) return false;
    const now = new Date();
    const classStart = new Date(cls.dateTime);
    const durationMs = (cls.durationMinutes || 60) * 60 * 1000;
    const classEnd = new Date(classStart.getTime() + durationMs);
    return now >= new Date(classStart.getTime() - 10 * 60 * 1000) && now <= classEnd;
  };

  const isSessionCompleted = (cls) => {
    if (cls.status === 'completed') return true;
    if (!cls.dateTime) return false;
    const now = new Date();
    const classStart = new Date(cls.dateTime);
    const durationMs = (cls.durationMinutes || 60) * 60 * 1000;
    const classEnd = new Date(classStart.getTime() + durationMs);
    return now > classEnd;
  };

  const isSessionUpcoming = (cls) => {
    if (cls.status === 'scheduled') return true;
    if (!cls.dateTime) return false;
    const now = new Date();
    const classStart = new Date(cls.dateTime);
    return now < new Date(classStart.getTime() - 10 * 60 * 1000);
  };

  // Strict Date Check: Session matches today or status is 'live'
  const isSessionDateTodayOrLive = (cls) => {
    if (!cls) return false;
    if (cls.status === 'live') return true;
    if (!cls.dateTime) return false;

    const sessionDate = new Date(cls.dateTime);
    const today = new Date();
    return (
      sessionDate.getFullYear() === today.getFullYear() &&
      sessionDate.getMonth() === today.getMonth() &&
      sessionDate.getDate() === today.getDate()
    );
  };

  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : url;
  };

  // Direct Portal ID Verification & Join
  const handleVerifyAndJoinSession = async (e) => {
    e.preventDefault();
    if (!verifyIdentifier.trim()) {
      setVerifyError('कृपया अपनी संस्था पोर्टल ID, रोल नंबर या नाम दर्ज करें।');
      return;
    }

    setVerifyLoading(true);
    setVerifyError('');
    try {
      const res = await API.post('/classes/verify-join', {
        classId: verifyModalSession._id,
        userIdentifier: verifyIdentifier.trim()
      });

      if (res.data?.verified) {
        setVerifiedSuccess(true);
        setVerifiedRoom(res.data.jitsiRoom || verifyModalSession.jitsiRoom || 'Avyukt_Live');
      } else {
        setVerifyError(res.data?.message || 'सत्यापन विफल।');
      }
    } catch (err) {
      console.error('Verification error:', err);
      setVerifyError(err.response?.data?.error || 'सत्र सत्यापन विफल। कृपया निर्धारित समय पर पुनः प्रयास करें।');
    } finally {
      setVerifyLoading(false);
    }
  };

  const resetVerifyModal = () => {
    setVerifyModalSession(null);
    setVerifyError('');
    setVerifiedSuccess(false);
    setVerifiedRoom('');
  };

  // Filter Sessions: Upcoming vs Past
  const filteredSessions = sessions.filter((s) => {
    // Audience filter
    if (selectedAudienceFilter !== 'ALL') {
      const aud = s.targetAudience || 'Open to All / All-Hands';
      if (selectedAudienceFilter === 'Open to All / All-Hands') {
        if (!aud.includes('Open to All') && !aud.includes('All-Hands')) return false;
      } else if (aud !== selectedAudienceFilter) {
        return false;
      }
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchSub = (s.subject || '').toLowerCase().includes(q);
      const matchTopic = (s.meetingTopic || '').toLowerCase().includes(q);
      const matchClass = (s.className || '').toLowerCase().includes(q);
      const mentorName = typeof s.primaryMentor === 'object' ? s.primaryMentor?.name || '' : '';
      const matchMentor = mentorName.toLowerCase().includes(q);
      if (!matchSub && !matchTopic && !matchClass && !matchMentor) return false;
    }

    // Tab filter
    if (activeTab === 'upcoming') {
      return !isSessionCompleted(s);
    } else {
      return isSessionCompleted(s);
    }
  });

  const upcomingCount = sessions.filter(s => !isSessionCompleted(s)).length;
  const pastCount = sessions.filter(s => isSessionCompleted(s)).length;

  return (
    <div style={{ backgroundColor: '#fdf8f8', minHeight: '90vh', padding: 'clamp(16px, 3vw, 36px) clamp(12px, 2.5vw, 20px)', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ maxWidth: '1300px', margin: '0 auto' }}>

        {/* Hero Header Banner */}
        <div style={{
          background: 'linear-gradient(135deg, #7f1d1d 0%, #991b1b 100%)',
          borderRadius: '16px',
          padding: 'clamp(20px, 4vw, 40px) clamp(16px, 3vw, 36px)',
          color: '#ffffff',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(153, 27, 27, 0.2)'
        }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(255, 255, 255, 0.2)', border: '1px solid rgba(255, 255, 255, 0.3)', padding: '5px 12px', borderRadius: '20px', fontSize: '11.5px', fontWeight: '800', color: '#ffffff', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px' }}>
            <span>🔴</span> <span>लाइव सत्र एवं कार्यशालाएं · OPEN TO ALL</span>
          </div>
          <h1 style={{ fontFamily: 'Georgia, serif', fontSize: 'clamp(24px, 4vw, 38px)', margin: '0 0 10px 0', fontWeight: 'bold' }}>
            Live Sessions & Interactive Workshops
          </h1>
          <p style={{ fontSize: 'clamp(13.5px, 2vw, 16px)', maxWidth: '850px', margin: 0, color: '#fecaca', lineHeight: '1.5' }}>
            विशेषज्ञों, मेंटर्स एवं समाजसेवियों के साथ लाइव संवाद, करियर मार्गदर्शन एवं कौशल कार्यशालाएं। सीधे अपनी पोर्टल ID, रोल नंबर या नाम दर्ज करके 1-क्लिक में लाइव सत्र से जुड़ें अथवा विगत सत्रों की रिकॉर्डिंग देखें।
          </p>
        </div>

        {/* Primary View Switcher: Upcoming Live Sessions vs Past Recordings */}
        <div style={{
          display: 'flex',
          gap: '12px',
          marginBottom: '20px',
          padding: '6px',
          background: '#fee2e2',
          borderRadius: '14px',
          width: 'fit-content',
          maxWidth: '100%',
          flexWrap: 'wrap'
        }}>
          <button
            type="button"
            onClick={() => setActiveTab('upcoming')}
            style={{
              padding: '11px 22px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'upcoming' ? '800' : '600',
              fontSize: '14px',
              background: activeTab === 'upcoming' ? '#dc2626' : 'transparent',
              color: activeTab === 'upcoming' ? '#ffffff' : '#7f1d1d',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'upcoming' ? '0 4px 12px rgba(220, 38, 38, 0.25)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>🔴</span>
            <span>आगामी लाइव सत्र (Upcoming Live Sessions)</span>
            <span style={{
              fontSize: '11.5px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: activeTab === 'upcoming' ? 'rgba(255,255,255,0.25)' : '#fca5a5',
              color: activeTab === 'upcoming' ? '#ffffff' : '#7f1d1d'
            }}>
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('past')}
            style={{
              padding: '11px 22px',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: activeTab === 'past' ? '800' : '600',
              fontSize: '14px',
              background: activeTab === 'past' ? '#1e293b' : 'transparent',
              color: activeTab === 'past' ? '#ffffff' : '#475569',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: activeTab === 'past' ? '0 4px 12px rgba(30, 41, 59, 0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <span>📹</span>
            <span>विगत सत्र व रिकॉर्डिंग (Past Sessions & Recordings)</span>
            <span style={{
              fontSize: '11.5px',
              padding: '2px 8px',
              borderRadius: '12px',
              background: activeTab === 'past' ? 'rgba(255,255,255,0.25)' : '#cbd5e1',
              color: activeTab === 'past' ? '#ffffff' : '#1e293b'
            }}>
              {pastCount}
            </span>
          </button>
        </div>

        {/* Role Pairs Filter Strip */}
        <div style={{
          background: '#ffffff',
          padding: '14px 18px',
          borderRadius: '12px',
          border: '1px solid #fee2e2',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          flexWrap: 'wrap',
          boxShadow: '0 2px 6px rgba(0,0,0,0.02)'
        }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: '#991b1b', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            👥 लक्षित वर्ग (Role Pairs):
          </span>
          <button
            type="button"
            onClick={() => setSelectedAudienceFilter('ALL')}
            style={{
              padding: '5px 12px',
              borderRadius: '16px',
              fontSize: '12px',
              fontWeight: selectedAudienceFilter === 'ALL' ? '700' : '500',
              background: selectedAudienceFilter === 'ALL' ? '#dc2626' : '#f8fafc',
              color: selectedAudienceFilter === 'ALL' ? '#ffffff' : '#334155',
              border: selectedAudienceFilter === 'ALL' ? '1px solid #dc2626' : '1px solid #cbd5e1',
              cursor: 'pointer'
            }}
          >
            सभी पेयर्स (All)
          </button>
          {AUDIENCE_PAIRS.map(aud => (
            <button
              key={aud}
              type="button"
              onClick={() => setSelectedAudienceFilter(aud)}
              style={{
                padding: '5px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: selectedAudienceFilter === aud ? '700' : '500',
                background: selectedAudienceFilter === aud ? '#dc2626' : '#f8fafc',
                color: selectedAudienceFilter === aud ? '#ffffff' : '#334155',
                border: selectedAudienceFilter === aud ? '1px solid #dc2626' : '1px solid #cbd5e1',
                cursor: 'pointer'
              }}
            >
              {aud}
            </button>
          ))}

          <div style={{ marginLeft: 'auto', minWidth: 'min(240px, 100%)' }}>
            <input
              type="text"
              placeholder="🔍 खोजें (सत्र विषय, वक्ता)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '7px 12px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '12.5px',
                boxSizing: 'border-box'
              }}
            />
          </div>
        </div>

        {/* SESSIONS CARDS GRID */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>लाइव सत्र लोड हो रहे हैं...</div>
        ) : filteredSessions.length === 0 ? (
          <div style={{
            background: '#ffffff',
            padding: '48px 24px',
            borderRadius: '16px',
            textAlign: 'center',
            border: '1px dashed #fca5a5',
            color: '#64748b'
          }}>
            <div style={{ fontSize: '46px', marginBottom: '12px' }}>🔴</div>
            <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#1e293b' }}>
              {activeTab === 'upcoming' ? 'कोई आगामी लाइव सत्र उपलब्ध नहीं है' : 'कोई विगत सत्र रिकॉर्डिंग उपलब्ध नहीं है'}
            </h3>
            <p style={{ margin: 0, fontSize: '14px' }}>
              कृपया अन्य फ़िल्टर चुनें अथवा आगामी लाइव सत्रों के शेड्यूल की प्रतीक्षा करें।
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 360px), 1fr))', gap: '20px' }}>
            {filteredSessions.map(cls => {
              const sDate = cls.dateTime ? new Date(cls.dateTime) : null;
              const isToday = sDate && (new Date().toDateString() === sDate.toDateString());
              const isLive = isSessionLive(cls);
              const isCompleted = isSessionCompleted(cls);

              return (
                <div
                  key={cls._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: isLive ? '2px solid #ef4444' : '1px solid #fee2e2',
                    padding: '22px',
                    boxShadow: isLive ? '0 8px 24px rgba(239, 68, 68, 0.15)' : '0 2px 10px rgba(0,0,0,0.03)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div>
                    {/* Top Row: Session Number & Status */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                      <span style={{
                        background: '#fee2e2',
                        color: '#991b1b',
                        padding: '3px 10px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: '800'
                      }}>
                        🔴 सत्र {cls.sessionNumber || 1}
                      </span>

                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '3px 9px',
                        borderRadius: '12px',
                        background: isLive ? '#dc2626' : isCompleted ? '#f1f5f9' : isToday ? '#fef3c7' : '#e0f2fe',
                        color: isLive ? '#ffffff' : isCompleted ? '#475569' : isToday ? '#92400e' : '#0369a1'
                      }}>
                        {isLive ? '🔴 अभी LIVE' : isCompleted ? '✓ सम्पन्न' : isToday ? '📅 आज का सत्र' : '⏰ आगामी'}
                      </span>
                    </div>

                    {/* Program / Class Title */}
                    <div style={{ fontSize: '11.5px', color: '#b91c1c', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.04em', marginBottom: '4px' }}>
                      {cls.className || cls.programId?.title || 'Avyukt Live Workshop'}
                    </div>

                    {/* Topic */}
                    <h3 style={{ margin: '0 0 8px 0', fontSize: '17px', color: '#0f172a', fontWeight: 'bold', lineHeight: '1.4' }}>
                      {cls.meetingTopic || cls.subject}
                    </h3>

                    {/* Description */}
                    {cls.instructions && (
                      <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: '#64748b', lineHeight: '1.4' }}>
                        {cls.instructions}
                      </p>
                    )}

                    {/* Date & Time */}
                    <div style={{ background: '#fdf2f2', padding: '10px 14px', borderRadius: '10px', fontSize: '12.5px', color: '#991b1b', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div>
                        📅 <strong>{sDate ? sDate.toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : 'TBA'}</strong>
                      </div>
                      <div>
                        ⏰ समय: <strong>{sDate ? sDate.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}</strong> ({cls.durationMinutes || 60} मिनट)
                      </div>
                    </div>

                    {/* Host / Primary Mentor */}
                    <div style={{ fontSize: '12.5px', color: '#047857', fontWeight: '700', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span>🎙️</span>
                      <span>वक्ता / मेंटर: {cls.primaryMentor?.name || 'संस्था विशेषज्ञ टीम'}</span>
                    </div>
                  </div>

                  {/* Actions Area */}
                  <div style={{ borderTop: '1px solid #fee2e2', paddingTop: '14px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {/* If Session has Recording */}
                    {(cls.youtubeUrl || cls.recordingUrl || cls.driveUrl) && (
                      <button
                        type="button"
                        onClick={() => setRecordingModalData(cls)}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: '#047857',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px'
                        }}
                      >
                        <span>▶️</span> <span>रिकॉर्डिंग देखें</span>
                      </button>
                    )}

                    {/* Join Live Session Button (With Direct Portal ID & Date Lock) */}
                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => {
                          setVerifyModalSession(cls);
                          setVerifiedSuccess(false);
                          setVerifyError('');
                        }}
                        style={{
                          flex: 1,
                          padding: '10px 16px',
                          background: isLive ? '#dc2626' : '#991b1b',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '6px',
                          boxShadow: isLive ? '0 4px 12px rgba(220, 38, 38, 0.3)' : 'none'
                        }}
                      >
                        <span>{isLive ? '🔴' : '🛡️'}</span>
                        <span>{isLive ? 'सीधे लाइव जुड़ें' : 'पोर्टल ID से जुड़ें'}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* MODAL 1: DIRECT PORTAL ID JOIN & STRICT DATE VERIFICATION */}
      {verifyModalSession && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(4px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: 'min(540px, 96vw)',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 40px rgba(0,0,0,0.25)'
          }}>
            {/* Modal Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #fee2e2', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#dc2626', textTransform: 'uppercase' }}>
                  DIRECT PORTAL ID JOIN
                </span>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>
                  {verifyModalSession.meetingTopic || verifyModalSession.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={resetVerifyModal}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* DATE LOCK CHECK: If NOT today and NOT live */}
            {!isSessionDateTodayOrLive(verifyModalSession) ? (
              <div style={{ textAlign: 'center', padding: '16px 8px' }}>
                <div style={{ fontSize: '48px', marginBottom: '12px' }}>🔒</div>
                <h3 style={{ fontSize: '19px', color: '#b91c1c', margin: '0 0 8px 0', fontFamily: 'Georgia, serif' }}>
                  लाइव सत्र अभी लॉक है! (Session Locked)
                </h3>
                <p style={{ color: '#475569', fontSize: '13.5px', lineHeight: '1.6', margin: '0 0 16px 0' }}>
                  यह लाइव सत्र केवल निर्धारित दिनांक एवं समय पर खुलेगा।
                </p>

                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '10px',
                  padding: '14px 18px',
                  marginBottom: '18px',
                  display: 'inline-flex',
                  flexDirection: 'column',
                  gap: '6px',
                  textAlign: 'left'
                }}>
                  <div style={{ color: '#991b1b', fontWeight: '700', fontSize: '13px' }}>
                    📅 निर्धारित दिनांक: {new Date(verifyModalSession.dateTime).toLocaleDateString('hi-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                  <div style={{ color: '#991b1b', fontSize: '13px' }}>
                    ⏰ प्रारंभ समय: {new Date(verifyModalSession.dateTime).toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' })} ({verifyModalSession.durationMinutes || 60} मिनट)
                  </div>
                </div>

                <p style={{ fontSize: '12.5px', color: '#64748b', margin: '0 0 20px 0' }}>
                  कृपया निर्धारित तिथि पर पोर्टल पर आएं और अपनी पोर्टल ID या रोल नंबर दर्ज करके सीधे सत्र में शामिल हों।
                </p>

                <button
                  type="button"
                  onClick={resetVerifyModal}
                  style={{
                    padding: '10px 24px',
                    background: '#991b1b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    fontSize: '13.5px'
                  }}
                >
                  समझ गया (Close Window)
                </button>
              </div>
            ) : verifiedSuccess ? (
              /* VERIFIED SCREEN -> EMBEDDED JITSI FRAME */
              <div>
                <div style={{
                  background: '#f0fdf4',
                  border: '1px solid #bbf7d0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '18px' }}>🟢</span>
                    <div>
                      <div style={{ fontWeight: '800', color: '#166534', fontSize: '13px' }}>
                        सत्यापन सफल! प्रतिभागी: {verifyIdentifier}
                      </div>
                      <div style={{ fontSize: '11px', color: '#15803d' }}>
                        लाइव सत्र प्रारंभ हो चुका है।
                      </div>
                    </div>
                  </div>
                  <a
                    href={`https://meet.jit.si/${verifiedRoom || 'Avyukt_Live'}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#1d4ed8', fontWeight: '700', fontSize: '12px', textDecoration: 'none' }}
                  >
                    नए टैब में खोलें ↗
                  </a>
                </div>

                {/* Embedded Jitsi Meeting Frame */}
                <JitsiMeet
                  roomName={verifiedRoom || 'Avyukt_Live'}
                  studentId={user?._id || verifyIdentifier}
                  classId={verifyModalSession._id}
                  userName={verifyIdentifier || user?.name || 'Guest Participant'}
                />
              </div>
            ) : (
              /* ID / ROLL NUMBER INPUT FORM */
              <form onSubmit={handleVerifyAndJoinSession}>
                <p style={{ fontSize: '13px', color: '#475569', margin: '0 0 16px 0', lineHeight: '1.5' }}>
                  यह सत्र आज के लिए सक्रिय है! सीधे प्रवेश के लिए अपनी संस्था पोर्टल ID, विद्यार्थी रोल नंबर अथवा अपना पूरा नाम दर्ज करें:
                </p>

                {verifyError && (
                  <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '10px 14px', borderRadius: '8px', color: '#991b1b', fontSize: '13px', marginBottom: '14px' }}>
                    {verifyError}
                  </div>
                )}

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#1e293b', marginBottom: '6px' }}>
                    संस्था ID / रोल नंबर / नाम:
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="उदा. abhik@s001 या 2026101 या आपका नाम"
                    value={verifyIdentifier}
                    onChange={(e) => setVerifyIdentifier(e.target.value)}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box' }}
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={resetVerifyModal}
                    style={{ padding: '9px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f8fafc', color: '#475569', fontSize: '13px', cursor: 'pointer' }}
                  >
                    रद्द करें
                  </button>
                  <button
                    type="submit"
                    disabled={verifyLoading}
                    style={{
                      padding: '9px 24px',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#dc2626',
                      color: '#ffffff',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer'
                    }}
                  >
                    {verifyLoading ? 'सत्यापित हो रहा है...' : '🔴 सत्यापित करें एवं क्लासरूम में जाएं'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* MODAL 2: RECORDING PLAYER MODAL */}
      {recordingModalData && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(15, 23, 42, 0.85)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '16px'
        }}>
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            width: 'min(800px, 96vw)',
            maxHeight: '92vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 50px rgba(0,0,0,0.3)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#047857', textTransform: 'uppercase' }}>
                  SESSION RECORDING
                </span>
                <h3 style={{ margin: 0, fontSize: '17px', color: '#0f172a' }}>
                  {recordingModalData.meetingTopic || recordingModalData.subject}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setRecordingModalData(null)}
                style={{ background: 'none', border: 'none', fontSize: '18px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {/* Embedded YouTube / Video Player */}
            {recordingModalData.youtubeUrl ? (
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '12px', background: '#000000', marginBottom: '16px' }}>
                <iframe
                  title="Session Recording"
                  src={getYouTubeEmbedUrl(recordingModalData.youtubeUrl)}
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            ) : recordingModalData.recordingUrl || recordingModalData.driveUrl ? (
              <div style={{ textAlign: 'center', padding: '30px', background: '#f8fafc', borderRadius: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '40px', marginBottom: '10px' }}>📁</div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#1e293b' }}>
                  Google Drive / बाहरी रिकॉर्डिंग लिंक उपलब्ध है
                </h4>
                <a
                  href={recordingModalData.recordingUrl || recordingModalData.driveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    padding: '10px 22px',
                    background: '#047857',
                    color: '#ffffff',
                    textDecoration: 'none',
                    borderRadius: '8px',
                    fontWeight: '700',
                    fontSize: '13.5px'
                  }}
                >
                  रिकॉर्डिंग देखें / डाउनलोड करें (Open Recording) ↗
                </a>
              </div>
            ) : (
              <div style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                इस सत्र के लिए कोई रिकॉर्डिंग लिंक उपलब्ध नहीं है।
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setRecordingModalData(null)}
                style={{ padding: '8px 18px', borderRadius: '8px', border: '1px solid #cbd5e1', background: '#f1f5f9', color: '#334155', fontSize: '13px', cursor: 'pointer' }}
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default LiveSessions;
