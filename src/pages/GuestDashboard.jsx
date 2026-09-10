import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import IDCard from '../components/IDCard';
import VideoPlayerModal from '../components/VideoPlayerModal';
import CertificateModal from '../components/CertificateModal';
import { useLocation, useNavigate } from 'react-router-dom';

const GuestDashboard = () => {
  const { user, setUser, API } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const userId = currentUser._id || currentUser.id;
  const [activeTab, setActiveTab] = useState(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam === 'certificates' || tabParam === 'feedback') return 'certificates';
    if (tabParam === 'live_sessions' || tabParam === 'sessions') return 'live_sessions';
    if (tabParam === 'tasks') return 'tasks';
    return 'profile';
  });
  const [classes, setClasses] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [profile, setProfile] = useState({ name: '', email: '', phone: '', address: '', villageName: '', district: '' });
  const [avatar, setAvatar] = useState(null);
  const [notice, setNotice] = useState('');
  const [taskSubmission, setTaskSubmission] = useState({});
  const [certificateForm, setCertificateForm] = useState({ title: '', category: 'Participation', rank: '' });
  const [feedback, setFeedback] = useState({ category: 'Class/Session Review', rating: 5, feedbackText: '' });
  const [request, setRequest] = useState({ category: 'general', subject: '', message: '' });
  const [expandedGuestTaskId, setExpandedGuestTaskId] = useState(null);
  const [resubmittingTaskId, setResubmittingTaskId] = useState(null);
  const [selectedVideo, setSelectedVideo] = useState({ isOpen: false, url: '', source: '', title: '' });
  const [selectedCert, setSelectedCert] = useState(null);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  // Live Sessions filters & loading
  const [sessionStatusFilter, setSessionStatusFilter] = useState('ALL');
  const [sessionSearchQuery, setSessionSearchQuery] = useState('');
  const [liveSessionsLoading, setLiveSessionsLoading] = useState(false);
  const [selectedBatchId, setSelectedBatchId] = useState(null);

  const refreshProfile = useCallback(async () => {
    const response = await API.get('/auth/me');
    if (response.data?.user) { setUser(response.data.user); localStorage.setItem('user', JSON.stringify(response.data.user)); }
  }, [API, setUser]);

  const loadData = useCallback(async () => {
    if (!userId) return;
    setLiveSessionsLoading(true);
    try {
      const [classResponse, publicSessionsResponse, taskResponse, certificateResponse, eventsResponse] = await Promise.all([
        API.get('/classes').catch(() => ({ data: [] })),
        API.get('/classes/public?entryType=session').catch(() => ({ data: [] })),
        API.get(`/homework?guestId=${userId}`).catch(() => ({ data: [] })),
        API.get(`/certificates/my-certificates/${userId}`).catch(() => ({ data: [] })),
        API.get('/events/all').catch(() => ({ data: [] }))
      ]);

      const rawClasses = Array.isArray(classResponse.data) ? classResponse.data : [];
      const rawPublic = Array.isArray(publicSessionsResponse.data) ? publicSessionsResponse.data : [];
      const rawEvents = Array.isArray(eventsResponse.data) ? eventsResponse.data : [];

      // Combine and deduplicate sessions
      const sessionMap = new Map();
      rawClasses.forEach((item) => {
        if (item?._id) sessionMap.set(String(item._id), item);
      });
      rawPublic.forEach((item) => {
        if (item?._id && !sessionMap.has(String(item._id))) {
          sessionMap.set(String(item._id), item);
        }
      });

      const mergedSessions = Array.from(sessionMap.values()).sort((a, b) => new Date(b.dateTime || 0) - new Date(a.dateTime || 0));

      // Strict Guest Session Filter:
      // Only include sessions specifically designed for guests:
      // 1. Directly assigned to this guest (assignedGuests includes userId)
      // 2. Class-level targetAudience explicitly mentions 'guest' (e.g. Mentor + Guest, Volunteer + Guest, Guest + Student)
      // 3. Program/Batch-level targetAudience explicitly mentions 'guest'
      // 4. User is designated as guestLecturers
      const isStrictGuestSession = (s) => {
        if (!s) return false;
        const isAssigned = Array.isArray(s.assignedGuests) && s.assignedGuests.some(g => String(g?._id || g) === String(userId));
        if (isAssigned) return true;

        const classAud = (s.targetAudience || '').toLowerCase();
        if (classAud.includes('guest')) return true;

        const progAud = (s.programId?.targetAudience || '').toLowerCase();
        if (progAud.includes('guest')) return true;

        if (Array.isArray(s.guestLecturers) && s.guestLecturers.length > 0) {
          const userName = (currentUser?.name || user?.name || '').toLowerCase();
          const matchLecturer = s.guestLecturers.some(l => {
            const lStr = String(l || '').toLowerCase();
            return (userName && lStr.includes(userName)) || lStr === String(userId);
          });
          if (matchLecturer) return true;
        }

        return false;
      };

      // Recorded NGO Events for Guest (Conferences, Workshops, Drives, Annual Festivals)
      const recordedEventsForGuest = rawEvents
        .filter(ev => Boolean(ev.youtubeUrl || ev.driveUrl))
        .map(ev => ({
          _id: `ev_${ev._id}`,
          subject: ev.title,
          meetingTopic: ev.description || ev.category || 'संस्थागत कार्यक्रम व वर्कशॉप',
          dateTime: ev.eventDate,
          entryType: 'session',
          targetAudience: 'Guest + Student',
          recordingUrl: ev.youtubeUrl || ev.driveUrl,
          youtubeUrl: ev.youtubeUrl || '',
          driveUrl: ev.driveUrl || '',
          recordingSource: ev.youtubeUrl ? 'youtube' : 'googledrive',
          instructions: ev.location ? `📍 आयोजन स्थल: ${ev.location}` : '',
          primaryMentor: { name: 'संस्था टीम' },
          isEventModel: true,
          status: 'completed'
        }));

      const guestOnlySessions = [...mergedSessions.filter(isStrictGuestSession), ...recordedEventsForGuest];
      setClasses(guestOnlySessions);
      
      // Strict client-side filter: Only tasks specifically assigned to this guest or guest batches
      const rawTasks = Array.isArray(taskResponse.data) ? taskResponse.data : [];
      const guestTasks = rawTasks.filter(t => {
        const isAssigned = Array.isArray(t.assignedGuests) && t.assignedGuests.some(g => String(g._id || g) === String(userId));
        const batchAud = (t.programId?.targetAudience || '').toLowerCase();
        const isBatchGuest = batchAud.includes('guest');
        const isExplicitGuest = t.targetRole === 'guest';

        // Accept if assigned directly, or if batch is for guests, or if role is guest
        return isAssigned || isBatchGuest || isExplicitGuest;
      });
      setTasks(guestTasks);
      setCertificates(Array.isArray(certificateResponse.data) ? certificateResponse.data : []);
    } catch (err) {
      console.error('Error loading guest data:', err);
    } finally {
      setLiveSessionsLoading(false);
    }
  }, [API, userId, currentUser?.name]);

  // Sync profile form values when currentUser data changes
  useEffect(() => {
    if (currentUser) {
      setProfile({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || currentUser.whatsappPhone || '',
        address: currentUser.address || '',
        villageName: currentUser.villageName || currentUser.village || '',
        district: currentUser.district || ''
      });
    }
  }, [currentUser._id, currentUser.name, currentUser.email, currentUser.phone, currentUser.whatsappPhone, currentUser.address, currentUser.villageName, currentUser.village, currentUser.district]);

  // Initial load on mount or when userId changes
  useEffect(() => {
    if (userId) {
      refreshProfile().catch(() => {});
      loadData().catch(() => {});
    }
  }, [userId, loadData, refreshProfile]);

  const expiresAt = useMemo(() => currentUser.guestPasswordExpiresAt ? new Date(currentUser.guestPasswordExpiresAt) : null, [currentUser.guestPasswordExpiresAt]);
  const [remaining, setRemaining] = useState('Calculating...');
  useEffect(() => {
    const update = () => { if (!expiresAt) return setRemaining('Access period not available'); const milliseconds = Math.max(0, expiresAt - Date.now()); const hours = Math.floor(milliseconds / 3600000); const minutes = Math.floor((milliseconds % 3600000) / 60000); setRemaining(`${hours}h ${minutes}m remaining`); };
    update(); const timer = window.setInterval(update, 60000); return () => window.clearInterval(timer);
  }, [expiresAt]);

  const updateProfile = async (event) => {
    event.preventDefault(); setNotice('Saving profile...');
    try {
      let avatarUrl = currentUser.avatar || '';
      if (avatar) { const data = new FormData(); data.append('avatar', avatar); const upload = await API.post('/auth/upload-avatar', data); avatarUrl = upload.data.avatar || upload.data.url; }
      const response = await API.put('/auth/update-profile', { userId, ...profile, avatar: avatarUrl });
      setUser(response.data.user); localStorage.setItem('user', JSON.stringify(response.data.user)); setNotice('Profile updated successfully.');
    } catch (error) { setNotice(error.response?.data?.error || 'Profile update failed.'); }
  };

  const submitTask = async (taskId) => {
    const values = taskSubmission[taskId] || {};
    if (!values.text && !values.file) return setNotice('कृपया टेक्स्ट या फाइल जोड़ें!');
    const data = new FormData();
    data.append('homeworkId', taskId);
    data.append('remarks', values.text || '');
    if (values.file) data.append('file', values.file);
    try {
      await API.post('/homework/submit', data);
      setNotice('टास्क सफलतापूर्वक सबमिट हो गया!');
      setResubmittingTaskId(null);
      setTaskSubmission((prev) => ({ ...prev, [taskId]: { text: '', file: null } }));
      loadData();
    } catch (error) {
      setNotice(error.response?.data?.error || 'टास्क सबमिशन विफल रहा।');
    }
  };

  const applyCertificate = async (event) => { event.preventDefault(); try { await API.post('/certificates/request', { recipientId: userId, recipientName: currentUser.name, recipientRole: 'guest', ...certificateForm }); setNotice('Certificate request sent for admin approval.'); setCertificateForm({ title: '', category: 'Participation', rank: '' }); loadData(); } catch (error) { setNotice(error.response?.data?.error || 'Certificate request failed.'); } };
  const submitFeedback = async (event) => { event.preventDefault(); try { await API.post('/feedbacks', { userId, userName: currentUser.name, userEmail: currentUser.email, userRole: 'Guest', userAvatar: currentUser.avatar, ...feedback }); setNotice('Feedback sent to the admin team.'); setFeedback({ category: 'Class/Session Review', rating: 5, feedbackText: '' }); } catch (error) { setNotice(error.response?.data?.error || 'Feedback submission failed.'); } };
  const submitRequest = async (event) => { event.preventDefault(); try { await API.post('/special-requests/create', { senderId: userId, senderName: currentUser.name, senderUniqueId: currentUser.uniqueId, senderRole: 'guest', ...request }); setNotice('Special request sent to the admin team.'); setRequest({ category: 'general', subject: '', message: '' }); } catch (error) { setNotice(error.response?.data?.error || 'Request submission failed.'); } };
  const setTaskValue = (id, key, value) => setTaskSubmission((previous) => ({ ...previous, [id]: { ...previous[id], [key]: value } }));

  const tabs = [
    ['profile', 'प्रोफ़ाइल एवं ID कार्ड', '🪪'],
    ['live_sessions', '🔴 लाइव सत्र (Live Sessions)', '🎥'],
    ['tasks', 'सौंपे गए कार्य (Tasks)', '📋'],
    ['certificates', 'प्रमाणपत्र एवं फ़ीडबैक', '🏆']
  ];


  return (
    <div className="dashboard-container">
      {/* Video Player Modal Integration */}
      <VideoPlayerModal
        isOpen={selectedVideo.isOpen}
        onClose={() => setSelectedVideo({ ...selectedVideo, isOpen: false })}
        videoUrl={selectedVideo.url}
        recordingSource={selectedVideo.source}
        title={selectedVideo.title}
      />

      {/* Hero Banner with Countdown Timer HUD */}
      <div className="dashboard-hero">
        <div style={{ position: 'relative', zIndex: 1 }}>
          <span className="dashboard-hero-kicker">GUEST PORTAL · संस्था मेहमान पोर्टल</span>
          <h1 style={{ margin: '8px 0 6px 0', fontSize: '32px', fontFamily: 'Georgia, serif', color: '#ffffff', fontWeight: 'normal' }}>
            नमस्ते, {currentUser.name || 'सम्मानित अतिथि'}!
          </h1>
          <p style={{ margin: '0 0 14px 0', color: 'rgba(255, 255, 255, 0.85)', fontSize: '14.5px' }}>
            Guest ID: <strong style={{ color: '#e8b35a' }}>{currentUser.uniqueId || 'ID pending'}</strong> · सीमित अवधि पोर्टल
          </p>

          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="dashboard-hero-badge">
              🎫 गेस्ट अकाउंट
            </span>
            <span className="dashboard-hero-badge" style={{ background: 'rgba(232, 179, 90, 0.2)', borderColor: '#e8b35a', color: '#fde68a' }}>
              ⌛ वैधता: {remaining}
            </span>
          </div>
        </div>

        {/* 72-Hour Countdown HUD Box */}
        <div style={{
          position: 'relative',
          zIndex: 1,
          background: 'rgba(13, 40, 34, 0.85)',
          border: '1px solid rgba(232, 179, 90, 0.4)',
          borderRadius: '12px',
          padding: '16px 20px',
          minWidth: '220px',
          backdropFilter: 'blur(8px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.25)'
        }}>
          <div style={{ fontSize: '11px', color: '#e8b35a', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            ACCESS TIMEOUT (72H)
          </div>
          <div style={{ fontSize: '22px', fontWeight: '800', color: '#ffffff', fontFamily: 'Georgia, serif', margin: '4px 0' }}>
            {remaining}
          </div>
          <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)' }}>
            समय सीमा पूर्ण होने पर स्वतः समाप्त
          </div>
        </div>
      </div>

      {notice && (
        <div style={{
          background: '#e9f0e6',
          border: '1px solid #cbe0cc',
          color: '#166534',
          padding: '12px 18px',
          borderRadius: '10px',
          marginBottom: '20px',
          fontWeight: '600',
          fontSize: '13.5px'
        }}>
          {notice}
        </div>
      )}

      {/* Modern Sticky Navigation Tabs */}
      <nav className="dashboard-tabs-bar">
        {tabs.map(([key, label, icon]) => (
          <button
            key={key}
            className={`dashboard-tab ${activeTab === key ? 'active' : ''}`}
            onClick={() => setActiveTab(key)}
          >
            <span>{icon}</span> {label}
          </button>
        ))}
      </nav>

      {/* TAB 1: PROFILE & DIGITAL ID */}
      {activeTab === 'profile' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
          <div className="dashboard-card" style={{ padding: '28px' }}>
            <div style={{ borderBottom: '1px solid #e2ebe4', paddingBottom: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <span style={{ fontSize: '11px', fontWeight: '800', color: '#e8b35a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>GUEST PROFILE</span>
                <h2 style={{ margin: '4px 0 0 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '22px' }}>आपकी जानकारी</h2>
              </div>
              <span className="dashboard-badge badge-purple">ID: {currentUser.uniqueId || 'Pending'}</span>
            </div>

            <form onSubmit={updateProfile} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>नाम (Full Name):</label>
                <input
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>ईमेल (Email):</label>
                <input
                  type="email"
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>मोबाइल नंबर (Phone):</label>
                <input
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>गांव / कस्बा (Village/Town):</label>
                  <input
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                    value={profile.villageName}
                    onChange={(e) => setProfile({ ...profile, villageName: e.target.value })}
                    placeholder="उदा. सोनपुरा"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>ज़िला (District):</label>
                  <input
                    style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                    value={profile.district}
                    onChange={(e) => setProfile({ ...profile, district: e.target.value })}
                    placeholder="उदा. हजारीबाग"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>पता (Full Address):</label>
                <input
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                  value={profile.address}
                  onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                  placeholder="मकान/गली/थाना..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>📷 प्रोफाइल फोटो अपलोड:</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setAvatar(e.target.files?.[0])}
                  style={{ width: '100%', padding: '8px', borderRadius: '8px', border: '1px solid #dce7d9', background: '#ffffff' }}
                />
              </div>

              <button type="submit" className="dashboard-btn-emerald" style={{ marginTop: '8px', justifyContent: 'center' }}>
                💾 प्रोफाइल सेव करें
              </button>
            </form>
          </div>

          <div className="dashboard-card" style={{ padding: '28px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: '100%', borderBottom: '1px solid #e2ebe4', paddingBottom: '14px', marginBottom: '20px', textAlign: 'center' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#e8b35a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>DIGITAL CREDENTIAL</span>
              <h2 style={{ margin: '4px 0 0 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '22px' }}>डिजिटल गेस्ट आईडी</h2>
            </div>
            <IDCard user={currentUser} />
          </div>
        </div>
      )}

      {/* TAB 2: LIVE SESSIONS & WEBINARS */}
      {(activeTab === 'live_sessions' || activeTab === 'sessions') && (() => {
        const now = new Date();
        const isSessionLive = (cls) => {
          if (cls.status === 'live') return true;
          if (!cls.dateTime) return false;
          const start = new Date(cls.dateTime);
          const dur = (cls.durationMinutes || 60) * 60 * 1000;
          return now >= new Date(start.getTime() - 10 * 60 * 1000) && now <= new Date(start.getTime() + dur);
        };
        const isSessionCompleted = (cls) => {
          if (cls.status === 'completed') return true;
          if (!cls.dateTime) return false;
          const start = new Date(cls.dateTime);
          const dur = (cls.durationMinutes || 60) * 60 * 1000;
          return now > new Date(start.getTime() + dur);
        };
        const isSessionUpcoming = (cls) => {
          if (cls.status === 'scheduled') return true;
          if (!cls.dateTime) return false;
          return new Date(cls.dateTime) > new Date(now.getTime() + 10 * 60 * 1000);
        };

        const liveCount = classes.filter(c => isSessionLive(c)).length;
        const upcomingCount = classes.filter(c => isSessionUpcoming(c)).length;
        const recordingsCount = classes.filter(c => Boolean(c.recordingUrl || c.youtubeUrl || c.driveUrl)).length;
        const totalCount = classes.length;

        // Determine if a class belongs to a course batch
        const getBatchInfo = (cls) => {
          if (cls.isEventModel) return null;

          if (cls.programId) {
            const pId = typeof cls.programId === 'object' ? (cls.programId._id || cls.programId.title) : cls.programId;
            const pTitle = typeof cls.programId === 'object' ? cls.programId.title : String(cls.programId);
            if (pTitle && pTitle.trim()) {
              return { id: String(pId), title: pTitle.trim() };
            }
          }

          if (cls.className && cls.className.trim()) {
            return { id: cls.className.trim().toLowerCase(), title: cls.className.trim().toUpperCase() };
          }

          const text = `${cls.subject || ''} ${cls.meetingTopic || ''}`;
          const batchMatch = text.match(/\b(batch\s*[0-9a-zA-Z_-]+)\b/i);
          if (batchMatch) {
            const title = batchMatch[1].toUpperCase();
            return { id: title.toLowerCase(), title };
          }

          if (cls.dayNumber && cls.entryType === 'class') {
            return { id: 'regular_batch', title: 'नियमित कोर्स बैच' };
          }

          return null;
        };

        // Filter predicate for search & status
        const matchesFilter = (item) => {
          if (sessionStatusFilter === 'LIVE' && !isSessionLive(item)) return false;
          if (sessionStatusFilter === 'UPCOMING' && !isSessionUpcoming(item)) return false;
          if (sessionStatusFilter === 'RECORDINGS' && !Boolean(item.recordingUrl || item.youtubeUrl || item.driveUrl)) return false;

          if (sessionSearchQuery.trim()) {
            const q = sessionSearchQuery.toLowerCase();
            const matchTopic = (item.meetingTopic || item.subject || '').toLowerCase().includes(q);
            const matchMentor = (item.primaryMentor?.name || '').toLowerCase().includes(q);
            const matchNotes = (item.instructions || '').toLowerCase().includes(q);
            const matchProgram = (item.programId?.title || '').toLowerCase().includes(q);
            return matchTopic || matchMentor || matchNotes || matchProgram;
          }
          return true;
        };

        // Group into Batch Groups & Standalone Sessions
        const batchMap = new Map();
        const standaloneSessions = [];

        classes.forEach((cls) => {
          const bInfo = getBatchInfo(cls);
          if (bInfo) {
            if (!batchMap.has(bInfo.id)) {
              batchMap.set(bInfo.id, {
                id: bInfo.id,
                title: bInfo.title,
                classes: []
              });
            }
            batchMap.get(bInfo.id).classes.push(cls);
          } else {
            standaloneSessions.push(cls);
          }
        });

        // Sort classes within each batch by Day number ascending, then date
        batchMap.forEach((b) => {
          b.classes.sort((a, b) => {
            const dayA = Number(a.dayNumber) || 0;
            const dayB = Number(b.dayNumber) || 0;
            if (dayA !== dayB) return dayA - dayB;
            return new Date(a.dateTime || 0) - new Date(b.dateTime || 0);
          });
        });

        const allBatchGroups = Array.from(batchMap.values());

        // Apply filters to Batches & Standalone
        const filteredBatchGroups = allBatchGroups.filter((b) => {
          if (sessionSearchQuery.trim()) {
            const q = sessionSearchQuery.toLowerCase();
            if (b.title.toLowerCase().includes(q)) return true;
          }
          return b.classes.some(matchesFilter);
        });

        const filteredStandaloneSessions = standaloneSessions.filter(matchesFilter);

        // Find active batch if selected
        const currentBatch = selectedBatchId ? allBatchGroups.find((b) => b.id === selectedBatchId) : null;
        const currentBatchClasses = currentBatch ? currentBatch.classes.filter(matchesFilter) : [];

        // Helper: Individual session/class card
        const renderSessionCard = (cls) => {
          const sDate = cls.dateTime ? new Date(cls.dateTime) : null;
          const isLive = isSessionLive(cls);
          const isCompleted = isSessionCompleted(cls);
          const isToday = sDate && (new Date().toDateString() === sDate.toDateString());
          const room = cls.jitsiRoom || (cls.meetingTopic ? cls.meetingTopic.replace(/\s+/g, '_') : 'Avyukt_Live');
          const hasRecording = Boolean(cls.youtubeUrl || cls.recordingUrl || cls.driveUrl);

          return (
            <div
              key={cls._id}
              className="dashboard-card"
              style={{
                borderTop: isLive ? '4px solid #ef4444' : isCompleted ? '4px solid #10b981' : '4px solid #173d35',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '20px',
                position: 'relative'
              }}
            >
              <div>
                {/* Top Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
                  <span className="dashboard-badge badge-mint" style={{ fontSize: '11px', textTransform: 'uppercase' }}>
                    {cls.dayNumber ? `Day ${cls.dayNumber}` : (cls.programId?.title || cls.category || 'General Session')}
                  </span>
                  <span className={`dashboard-badge ${isLive ? 'dashboard-badge-red' : isCompleted ? 'dashboard-badge-mint' : isToday ? 'dashboard-badge-gold' : 'dashboard-badge-blue'}`} style={{ fontSize: '11px', fontWeight: '800' }}>
                    {isLive ? '🔴 LIVE NOW' : isCompleted ? '✓ सम्पन्न' : isToday ? '📅 आज' : '⏰ आगामी'}
                  </span>
                </div>

                {/* Title */}
                <h3 style={{ margin: '0 0 8px 0', fontSize: '17.5px', color: '#173d35', fontFamily: 'Georgia, serif', lineHeight: '1.35', fontWeight: '600' }}>
                  {cls.meetingTopic || cls.subject}
                </h3>

                {/* Date & Time */}
                <div style={{ fontSize: '12.5px', color: '#547664', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span>📅 {sDate ? sDate.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBA'}</span>
                  <span>•</span>
                  <span>⏰ {sDate ? sDate.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}</span>
                  <span>•</span>
                  <span>⏱️ {cls.durationMinutes || 60} मिनट</span>
                </div>

                {/* Speaker info */}
                {cls.primaryMentor && (
                  <div style={{ fontSize: '12.5px', color: '#173d35', fontWeight: '600', marginBottom: '10px', background: '#f8faf9', padding: '6px 10px', borderRadius: '6px' }}>
                    🎙️ वक्ता / मेंटर: {cls.primaryMentor.name || 'संस्था टीम'}
                  </div>
                )}

                {/* Notes / Instructions */}
                {cls.instructions && (
                  <div style={{ background: '#fefce8', padding: '8px 12px', borderRadius: '6px', borderLeft: '3px solid #e8b35a', fontSize: '12px', color: '#713f12', marginBottom: '12px', lineHeight: '1.5' }}>
                    📌 <strong>विवरण:</strong> {cls.instructions}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div style={{ borderTop: '1px solid #edf3ee', paddingTop: '14px', marginTop: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {!isCompleted && (
                  <a
                    href={`https://meet.jit.si/${encodeURIComponent(room)}`}
                    target="_blank"
                    rel="noreferrer"
                    className={isLive ? "dashboard-btn-gold" : "dashboard-btn-emerald"}
                    style={{
                      flex: 1,
                      textDecoration: 'none',
                      padding: '10px 14px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      textAlign: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      boxShadow: isLive ? '0 4px 14px rgba(220, 38, 38, 0.3)' : 'none'
                    }}
                  >
                    <span>🚀</span>
                    <span>{isLive ? 'लाइव सत्र में जुड़ें ↗' : 'सत्र में प्रवेश करें ↗'}</span>
                  </a>
                )}

                {hasRecording && (
                  <button
                    type="button"
                    onClick={() => setSelectedVideo({
                      isOpen: true,
                      url: cls.recordingUrl || cls.youtubeUrl || cls.driveUrl,
                      source: cls.youtubeUrl ? 'youtube' : (cls.recordingSource || 'googledrive'),
                      title: cls.meetingTopic || cls.subject
                    })}
                    style={{
                      flex: 1,
                      padding: '10px 14px',
                      borderRadius: '6px',
                      background: '#166534',
                      color: '#ffffff',
                      border: 'none',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <span>▶️</span>
                    <span>रिकॉर्डिंग देखें</span>
                  </button>
                )}
              </div>
            </div>
          );
        };

        // Helper: Batch Folder Card
        const renderBatchCard = (batch) => {
          const isAnyLive = batch.classes.some(isSessionLive);
          const isAnyUpcoming = batch.classes.some(isSessionUpcoming);
          const recordingsInBatch = batch.classes.filter(c => Boolean(c.recordingUrl || c.youtubeUrl || c.driveUrl)).length;
          
          const mentorNames = Array.from(new Set(
            batch.classes
              .map(c => c.primaryMentor?.name)
              .filter(Boolean)
          )).join(', ');

          return (
            <div
              key={batch.id}
              onClick={() => setSelectedBatchId(batch.id)}
              className="dashboard-card"
              style={{
                cursor: 'pointer',
                borderTop: isAnyLive ? '4px solid #ef4444' : '4px solid #173d35',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                padding: '22px',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 14px rgba(23, 61, 53, 0.08)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-3px)';
                e.currentTarget.style.boxShadow = '0 10px 24px rgba(23, 61, 53, 0.16)';
                e.currentTarget.style.borderColor = '#e8b35a';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 14px rgba(23, 61, 53, 0.08)';
                e.currentTarget.style.borderColor = isAnyLive ? '#ef4444' : '#173d35';
              }}
            >
              <div>
                {/* Top Badges */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: '#eaf4ee',
                    color: '#166534',
                    border: '1px solid #bbf7d0',
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800'
                  }}>
                    📦 अध्ययन एवं प्रशिक्षण बैच
                  </span>
                  <span style={{
                    background: isAnyLive ? '#fef2f2' : isAnyUpcoming ? '#eff6ff' : '#f8fafc',
                    color: isAnyLive ? '#dc2626' : isAnyUpcoming ? '#1d4ed8' : '#475569',
                    border: `1px solid ${isAnyLive ? '#fca5a5' : isAnyUpcoming ? '#bfdbfe' : '#cbd5e1'}`,
                    padding: '3px 10px',
                    borderRadius: '6px',
                    fontSize: '11px',
                    fontWeight: '800'
                  }}>
                    {isAnyLive ? '🔴 LIVE NOW' : isAnyUpcoming ? '⏰ कक्षाएं निर्धारित' : '✓ सक्रिय'}
                  </span>
                </div>

                {/* Batch Title */}
                <h3 style={{ margin: '0 0 6px 0', fontSize: '20px', color: '#173d35', fontFamily: 'Georgia, serif', fontWeight: '700' }}>
                  {batch.title}
                </h3>

                {/* Mentor Info */}
                {mentorNames && (
                  <div style={{ fontSize: '13px', color: '#547664', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>🎙️ वक्ता / मेंटर:</span>
                    <strong style={{ color: '#173d35' }}>{mentorNames}</strong>
                  </div>
                )}

                {/* Classes Summary Box */}
                <div style={{
                  background: '#f8faf9',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  padding: '10px 14px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontSize: '12.5px', fontWeight: '700', color: '#173d35', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span>📋 कुल कक्षाएं:</span>
                    <span style={{ color: '#166534', fontWeight: '800' }}>{batch.classes.length} कक्षाएं (Days)</span>
                  </div>
                  {recordingsInBatch > 0 && (
                    <div style={{ fontSize: '11.5px', color: '#166534', marginTop: '6px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span>📼</span>
                      <span>{recordingsInBatch} क्लास रिकॉर्डिंग्स उपलब्ध हैं</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div style={{ borderTop: '1px solid #edf3ee', paddingTop: '14px', marginTop: 'auto' }}>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setSelectedBatchId(batch.id); }}
                  className="dashboard-btn-gold"
                  style={{
                    width: '100%',
                    padding: '10px 16px',
                    fontSize: '13px',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 2px 8px rgba(232, 179, 90, 0.25)'
                  }}
                >
                  <span>📂</span>
                  <span>बैच खोलें व कक्षाएं देखें ({batch.classes.length}) ➔</span>
                </button>
              </div>
            </div>
          );
        };

        return (
          <div>
            {/* Live Sessions Header Banner */}
            <div style={{
              background: 'radial-gradient(circle at 85% 30%, #1e4d43 0%, #173d35 55%, #0d2822 100%)',
              border: '1px solid rgba(232, 179, 90, 0.35)',
              borderRadius: '16px',
              padding: 'clamp(20px, 3vw, 26px) clamp(18px, 3vw, 28px)',
              color: '#ffffff',
              marginBottom: '22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '16px',
              boxShadow: '0 12px 28px rgba(23, 61, 53, 0.25)'
            }}>
              <div>
                <span className="dashboard-hero-kicker" style={{ color: '#e8b35a', fontSize: '11px', fontWeight: '800', letterSpacing: '0.14em' }}>
                  🔴 GUEST LIVE SESSIONS & WEBINARS
                </span>
                <h2 style={{ margin: '6px 0 4px 0', fontSize: 'clamp(20px, 3vw, 26px)', color: '#ffffff', fontFamily: 'Georgia, serif', fontWeight: 'normal' }}>
                  लाइव सत्र एवं इंटरएक्टिव कार्यशालाएं
                </h2>
                <p style={{ margin: 0, fontSize: '13.5px', color: '#d1e3d7', maxWidth: '680px', lineHeight: '1.5' }}>
                  सम्मानित अतिथियों व नागरिकों के लिए लाइव सत्र। यहाँ से सीधे 1-क्लिक में लाइव मीटिंग व वेबिनार में प्रवेश करें।
                </p>
              </div>

              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={loadData}
                  className="dashboard-btn-gold"
                  style={{ fontSize: '12.5px', padding: '9px 16px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  🔄 रीफ्रेश करें
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/live-sessions')}
                  style={{
                    background: 'rgba(255, 255, 255, 0.12)',
                    color: '#ffffff',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    padding: '9px 16px',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    backdropFilter: 'blur(4px)'
                  }}
                >
                  🌐 मुख्य लाइव पोर्टल ↗
                </button>
              </div>
            </div>

            {/* Metrics Strip */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
              gap: '14px',
              marginBottom: '22px'
            }}>
              <div className="dashboard-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#fef2f2', display: 'grid', placeItems: 'center', fontSize: '20px' }}>🔴</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#991b1b', fontWeight: '700', textTransform: 'uppercase' }}>लाइव अभी</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#991b1b', fontFamily: 'Georgia, serif' }}>{liveCount}</div>
                </div>
              </div>

              <div className="dashboard-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eff6ff', display: 'grid', placeItems: 'center', fontSize: '20px' }}>⏰</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#1d4ed8', fontWeight: '700', textTransform: 'uppercase' }}>आगामी सत्र</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#1d4ed8', fontFamily: 'Georgia, serif' }}>{upcomingCount}</div>
                </div>
              </div>

              <div className="dashboard-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#eaf4ee', display: 'grid', placeItems: 'center', fontSize: '20px' }}>📼</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#166534', fontWeight: '700', textTransform: 'uppercase' }}>रिकॉर्डिंग्स</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#166534', fontFamily: 'Georgia, serif' }}>{recordingsCount}</div>
                </div>
              </div>

              <div className="dashboard-card" style={{ padding: '16px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: '#f8fafc', display: 'grid', placeItems: 'center', fontSize: '20px' }}>📚</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#475569', fontWeight: '700', textTransform: 'uppercase' }}>कुल उपलब्ध</div>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: '#173d35', fontFamily: 'Georgia, serif' }}>{totalCount}</div>
                </div>
              </div>
            </div>

            {/* Filter Pills & Search */}
            <div className="dashboard-card" style={{
              padding: '14px 18px',
              marginBottom: '22px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px'
            }}>
              {/* Filter Tabs */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '12px', fontWeight: '800', color: '#173d35', marginRight: '4px' }}>फ़िल्टर:</span>
                {[
                  { id: 'ALL', label: `सभी सत्र (${totalCount})` },
                  { id: 'LIVE', label: `🔴 लाइव सत्र (${liveCount})` },
                  { id: 'UPCOMING', label: `⏰ आगामी (${upcomingCount})` },
                  { id: 'RECORDINGS', label: `📼 रिकॉर्डिंग्स (${recordingsCount})` }
                ].map(tab => {
                  const active = sessionStatusFilter === tab.id;
                  return (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => setSessionStatusFilter(tab.id)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: active ? '700' : '500',
                        background: active ? '#173d35' : '#ffffff',
                        color: active ? '#ffffff' : '#475569',
                        border: active ? '1px solid #173d35' : '1px solid #cbd5e1',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      {tab.label}
                    </button>
                  );
                })}
              </div>

              {/* Search Box */}
              <div style={{ flex: '1 1 200px', maxWidth: '300px' }}>
                <input
                  type="text"
                  placeholder="सत्र, बैच या मेंटर खोजें..."
                  value={sessionSearchQuery}
                  onChange={(e) => setSessionSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: '1px solid #cbd5e1',
                    fontSize: '12.5px',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>
            </div>

            {/* Main Sessions / Batches Content */}
            {liveSessionsLoading && classes.length === 0 ? (
              <div style={{ padding: '60px', textAlign: 'center', color: '#173d35' }}>
                <div style={{ fontSize: '32px', marginBottom: '10px' }}>⏳</div>
                <p style={{ fontWeight: '600' }}>सत्र लोड हो रहे हैं...</p>
              </div>
            ) : currentBatch ? (
              /* VIEW 1: DRILL-DOWN INTO SELECTED BATCH */
              <div>
                {/* Back to Batches Header */}
                <div style={{
                  background: 'linear-gradient(135deg, #173d35 0%, #1e4d43 100%)',
                  border: '1px solid rgba(232, 179, 90, 0.35)',
                  borderRadius: '12px',
                  padding: '16px 22px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  color: '#ffffff',
                  boxShadow: '0 4px 16px rgba(23, 61, 53, 0.15)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ background: '#e8b35a', color: '#173d35', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                        चयनित बैच
                      </span>
                      <h3 style={{ margin: 0, fontSize: '20px', color: '#ffffff', fontFamily: 'Georgia, serif', fontWeight: '700' }}>
                        📦 {currentBatch.title} - कक्षा सूची
                      </h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#d1e3d7' }}>
                      इस बैच में कुल {currentBatchClasses.length} कक्षाएं उपलब्ध हैं। किसी भी कक्षा में लाइव जुड़ें या उसकी रिकॉर्डिंग देखें।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedBatchId(null)}
                    style={{
                      background: 'rgba(255, 255, 255, 0.15)',
                      color: '#ffffff',
                      border: '1px solid rgba(255, 255, 255, 0.4)',
                      padding: '8px 18px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backdropFilter: 'blur(4px)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span>←</span>
                    <span>वापस सभी बैच देखें (Back to All Batches)</span>
                  </button>
                </div>

                {currentBatchClasses.length === 0 ? (
                  <div className="dashboard-card" style={{ padding: '50px 20px', textAlign: 'center', color: '#64748b' }}>
                    <span style={{ fontSize: '40px', display: 'block', marginBottom: '10px' }}>🔍</span>
                    <h4 style={{ margin: '0 0 6px 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '18px' }}>
                      इस बैच में चुने गए फ़िल्टर के अनुसार कोई कक्षा नहीं मिली
                    </h4>
                    <p style={{ margin: '0 auto 16px auto', fontSize: '13px', color: '#64748b' }}>
                      कृपया फ़िल्टर बदलें या सभी कक्षाएं देखने के लिए फ़िल्टर रीसेट करें।
                    </p>
                    <button
                      type="button"
                      onClick={() => { setSessionStatusFilter('ALL'); setSessionSearchQuery(''); }}
                      className="dashboard-btn-emerald"
                      style={{ padding: '8px 18px', fontSize: '12.5px' }}
                    >
                      इस बैच की सभी कक्षाएं देखें
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: '18px' }}>
                    {currentBatchClasses.map(cls => renderSessionCard(cls))}
                  </div>
                )}
              </div>
            ) : (
              /* VIEW 2: ALL BATCHES + STANDALONE SESSIONS */
              <div>
                {/* Batches Section */}
                {filteredBatchGroups.length > 0 && (
                  <div style={{ marginBottom: '32px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>📦</span> आपके अध्ययन एवं प्रशिक्षण बैच (Available Batches)
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#547664' }}>
                          बैच पर क्लिक करें और केवल उस बैच की निर्धारित दिन-वार कक्षाएं (Day 1, Day 2...) देखें।
                        </p>
                      </div>
                      <span className="dashboard-badge badge-mint" style={{ fontSize: '11px', fontWeight: '800' }}>
                        कुल {filteredBatchGroups.length} बैच उपलब्ध
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: '18px' }}>
                      {filteredBatchGroups.map(renderBatchCard)}
                    </div>
                  </div>
                )}

                {/* Standalone Sessions & Events Section */}
                {filteredStandaloneSessions.length > 0 && (
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                      <div>
                        <h3 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span>🌟</span> संस्थागत विशेष सत्र, कार्यशालाएं व वेबिनार्स
                        </h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#547664' }}>
                          अतिथियों व नागरिकों के लिए आयोजित विशेष वेबिनार्स, कार्यशालाएं एवं संस्थागत रिकॉर्डिंग्स।
                        </p>
                      </div>
                      <span className="dashboard-badge badge-mint" style={{ fontSize: '11px', fontWeight: '800' }}>
                        कुल {filteredStandaloneSessions.length} सत्र उपलब्ध
                      </span>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 330px), 1fr))', gap: '18px' }}>
                      {filteredStandaloneSessions.map(cls => renderSessionCard(cls))}
                    </div>
                  </div>
                )}

                {/* Empty State when both Batches and Standalone Sessions are empty */}
                {filteredBatchGroups.length === 0 && filteredStandaloneSessions.length === 0 && (
                  <div className="dashboard-card" style={{ padding: '60px 24px', textAlign: 'center', color: '#64748b' }}>
                    <span style={{ fontSize: '46px', display: 'block', marginBottom: '14px' }}>🎙️</span>
                    <h3 style={{ margin: '0 0 8px 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '21px', fontWeight: '600' }}>
                      {classes.length === 0 ? 'वर्तमान में कोई विशेष अतिथि सत्र निर्धारित नहीं है' : 'कोई सत्र नहीं मिला'}
                    </h3>
                    <p style={{ margin: '0 auto 20px auto', fontSize: '13.5px', maxWidth: '520px', lineHeight: '1.6', color: '#64748b' }}>
                      {classes.length === 0
                        ? 'संस्था द्वारा जब भी आपके लिए कोई विशेष अतिथि व्याख्यान (Guest Lecture), मेंटर-गेस्ट या स्वयंसेवक-गेस्ट संवाद सत्र आयोजित किया जाएगा, वह यहाँ स्वतः प्रदर्शित हो जाएगा।'
                        : 'चुने गए फ़िल्टर या खोज शब्द के अनुसार कोई सक्रिय सत्र या बैच उपलब्ध नहीं है।'}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
                      {sessionStatusFilter !== 'ALL' && (
                        <button
                          type="button"
                          onClick={() => { setSessionStatusFilter('ALL'); setSessionSearchQuery(''); setSelectedBatchId(null); }}
                          className="dashboard-btn-emerald"
                          style={{ padding: '9px 20px', fontSize: '12.5px' }}
                        >
                          सभी अतिथि सत्र देखें
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => navigate('/live-sessions')}
                        className="dashboard-btn-gold"
                        style={{ padding: '9px 20px', fontSize: '12.5px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        🌐 सार्वजनिक वेबिनार पोर्टल देखें ↗
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}


      {/* TAB 3: TASKS */}
      {activeTab === 'tasks' && (
        <div>
          {/* Metric Summary Cards */}
          {(() => {
            const totalTasks = tasks.length;
            const submittedTasks = tasks.filter(t => t.submissions?.some(s => s.studentId === userId || s.studentId?._id === userId)).length;
            const pendingTasks = totalTasks - submittedTasks;

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="dashboard-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e9f0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>📌</div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#718078', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>कुल कार्य (Total Tasks)</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#173d35', marginTop: '2px', fontFamily: 'Georgia, serif' }}>{totalTasks}</div>
                  </div>
                </div>
                <div className="dashboard-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e9f0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>✅</div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>सबमिट किए गए (Submitted)</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#166534', marginTop: '2px', fontFamily: 'Georgia, serif' }}>{submittedTasks}</div>
                  </div>
                </div>
                <div className="dashboard-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>⏳</div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#b45309', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>बाकी कार्य (Pending)</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309', marginTop: '2px', fontFamily: 'Georgia, serif' }}>{pendingTasks}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '20px' }}>📋 आपको सौंपे गए कार्य (Tasks)</h3>
          </div>

          {tasks.length === 0 ? (
            <div className="dashboard-card" style={{ padding: '40px', borderRadius: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '36px' }}>📝</span>
              <p style={{ margin: '12px 0 0 0', color: '#547664', fontWeight: '600' }}>आपके लिए कोई पेंडिंग कार्य नहीं है।</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {tasks.map((task) => {
                const submission = task.submissions?.find((item) => item.studentId === userId || item.studentId?._id === userId);
                const late = submission && task.deadline && new Date(submission.submittedAt) > new Date(task.deadline);
                const isResubmitting = resubmittingTaskId === task._id;
                const historyList = submission?.history || [];

                return (
                  <div key={task._id} className="dashboard-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                        <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                          {task.programId?.title && (
                            <span className="dashboard-badge badge-purple" style={{ fontSize: '11px' }}>
                              🏷️ {task.programId.title}
                            </span>
                          )}
                          <span className="dashboard-badge badge-mint" style={{ fontSize: '12px' }}>{task.subject || 'General'}</span>
                        </div>
                        <span className={`dashboard-badge ${submission ? (late ? 'badge-red' : 'badge-mint') : 'badge-gold'}`}>
                          {submission ? (late ? 'Late Submission' : `✔ सबमिट (${historyList.length + 1} बार)`) : '⏳ बाकी है'}
                        </span>
                      </div>

                      <h4 style={{ margin: '12px 0 6px 0', fontSize: '17px', color: '#173d35', fontFamily: 'Georgia, serif', fontWeight: '700' }}>{task.title}</h4>
                      <p style={{ fontSize: '13.5px', color: '#547664', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                        {task.description || 'कोई विवरण नहीं दिया गया है।'}
                      </p>

                      <p style={{ fontSize: '12.5px', color: '#b91c1c', margin: '0 0 10px 0', fontWeight: '700' }}>
                        ⏰ अंतिम तिथि: {task.deadline ? new Date(task.deadline).toLocaleString('hi-IN') : 'Open'}
                      </p>

                      {task.attachmentUrl && (
                        <a href={task.attachmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12.5px', color: '#1e4d43', fontWeight: '700', textDecoration: 'underline', display: 'inline-block', marginBottom: '10px' }}>
                          📎 अटैचमेंट फ़ाइल देखें ↗
                        </a>
                      )}

                      {/* Submission summary if already submitted */}
                      {submission && (
                        <div style={{ background: '#f8faf9', padding: '12px', borderRadius: '8px', border: '1px solid #dce7d9', marginTop: '10px', fontSize: '12.5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: '700' }}>
                            <span>🌟 नवीनतम सबमिशन:</span>
                            <span style={{ fontSize: '11px', color: '#718078' }}>{submission.submittedAt ? new Date(submission.submittedAt).toLocaleString('hi-IN') : 'हाल ही में'}</span>
                          </div>
                          {submission.fileUrl && (
                            <div style={{ marginTop: '6px' }}>
                              <a href={submission.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#1e4d43', fontWeight: '700', textDecoration: 'underline' }}>
                                🔗 सबमिट फ़ाइल देखें ↗
                              </a>
                            </div>
                          )}
                          {submission.remarks && (
                            <p style={{ margin: '6px 0 0 0', color: '#2b3f36' }}>💬 {submission.remarks}</p>
                          )}

                          {historyList.length > 0 && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #dce7d9' }}>
                              <button
                                type="button"
                                onClick={() => setExpandedGuestTaskId(expandedGuestTaskId === task._id ? null : task._id)}
                                style={{ background: 'transparent', border: 'none', color: '#173d35', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                              >
                                📜 पूर्व सबमिशन इतिहास ({historyList.length} पुराने प्रयास) {expandedGuestTaskId === task._id ? '▲ छुपाएं' : '▼ देखें'}
                              </button>

                              {expandedGuestTaskId === task._id && (
                                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                  {historyList.map((hist, hIdx) => (
                                    <div key={hIdx} style={{ background: '#ffffff', padding: '6px 10px', borderRadius: '6px', border: '1px solid #e2ebe4', fontSize: '11.5px' }}>
                                      <div style={{ display: 'flex', justifyContent: 'space-between', color: '#718078' }}>
                                        <span>प्रयास #{hIdx + 1}</span>
                                        <span>{hist.submittedAt ? new Date(hist.submittedAt).toLocaleString('hi-IN') : ''}</span>
                                      </div>
                                      {hist.fileUrl && (
                                        <a href={hist.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#1e4d43', fontWeight: '600' }}>
                                          🔗 पुराना अटैचमेंट
                                        </a>
                                      )}
                                      {hist.remarks && <div style={{ color: '#547664', marginTop: '2px' }}>"{hist.remarks}"</div>}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {!isResubmitting && (
                            <button
                              type="button"
                              onClick={() => setResubmittingTaskId(task._id)}
                              className="dashboard-btn-secondary"
                              style={{ marginTop: '10px', fontSize: '12px', padding: '6px 12px' }}
                            >
                              🔄 पुनः सबमिट करें (Resubmit)
                            </button>
                          )}
                        </div>
                      )}

                      {/* Submission form (shown if not submitted OR if user clicked resubmit) */}
                      {(!submission || isResubmitting) && (
                        <div style={{ marginTop: '12px', borderTop: '1px solid #e2ebe4', paddingTop: '12px' }}>
                          <textarea
                            placeholder="टिप्पणी या नोट्स लिखें..."
                            rows="2"
                            value={taskSubmission[task._id]?.text || ''}
                            onChange={(e) => setTaskValue(task._id, 'text', e.target.value)}
                            style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #dce7d9', fontSize: '12.5px', boxSizing: 'border-box', marginBottom: '8px' }}
                          />
                          <input
                            type="file"
                            accept=".pdf,.doc,.docx,image/*"
                            onChange={(e) => setTaskValue(task._id, 'file', e.target.files?.[0])}
                            style={{ width: '100%', padding: '6px', borderRadius: '6px', border: '1px solid #dce7d9', fontSize: '12px', marginBottom: '10px' }}
                          />
                          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                            {isResubmitting && (
                              <button
                                type="button"
                                onClick={() => setResubmittingTaskId(null)}
                                className="dashboard-btn-secondary"
                                style={{ padding: '7px 14px', fontSize: '12px' }}
                              >
                                रद्द करें
                              </button>
                            )}
                            <button
                              type="button"
                              className="dashboard-btn-emerald"
                              onClick={() => submitTask(task._id)}
                              style={{ padding: '7px 16px', fontSize: '12px' }}
                            >
                              {submission ? 'पुनः सबमिट करें' : 'सबमिट करें'}
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CERTIFICATES & FEEDBACK */}
      {activeTab === 'certificates' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '24px', alignItems: 'start' }}>
          {/* Certificate Column */}
          <div className="dashboard-card" style={{ padding: '28px' }}>
            <div style={{ borderBottom: '1px solid #e2ebe4', paddingBottom: '14px', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#e8b35a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>CERTIFICATES</span>
              <h2 style={{ margin: '4px 0 0 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '22px' }}>प्रमाणपत्र के लिए आवेदन करें</h2>
            </div>

            <form onSubmit={applyCertificate} style={{ display: 'grid', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>प्रोग्राम या इवेंट का नाम (Program Title):</label>
                <input
                  required
                  placeholder="उदा. Youth Leadership Workshop..."
                  value={certificateForm.title}
                  onChange={(e) => setCertificateForm({ ...certificateForm, title: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>प्रमाणपत्र श्रेणी (Category):</label>
                <select
                  value={certificateForm.category}
                  onChange={(e) => setCertificateForm({ ...certificateForm, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="Participation">सहभागिता (Participation)</option>
                  <option value="Merit">उत्कृष्टता (Merit)</option>
                  <option value="Completion">सफलतापूर्वक पूर्ण (Completion)</option>
                  <option value="Appreciation">प्रशस्ति पत्र (Appreciation)</option>
                </select>
              </div>

              <button type="submit" className="dashboard-btn-emerald" style={{ marginTop: '6px', justifyContent: 'center' }}>
                📜 आवेदन सबमिट करें
              </button>
            </form>

            <div style={{ marginTop: '28px', borderTop: '1px solid #e2ebe4', paddingTop: '18px' }}>
              <h4 style={{ margin: '0 0 12px 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '16px' }}>
                🏆 जारी किए गए प्रमाणपत्र (Approved Certificates):
              </h4>
              {certificates.filter((c) => c.status === 'approved').length === 0 ? (
                <p style={{ fontSize: '13px', color: '#718078', margin: '0 0 16px 0' }}>अभी कोई स्वीकृत प्रमाणपत्र जारी नहीं हुआ है।</p>
              ) : (
                <div style={{ display: 'grid', gap: '8px', marginBottom: '16px' }}>
                  {certificates.filter((c) => c.status === 'approved').map((cert) => (
                    <div key={cert._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: '#f8faf9', borderRadius: '8px', border: '1px solid #bbf7d0', fontSize: '13px' }}>
                      <div>
                        <strong>{cert.title}</strong>
                        <span className="dashboard-badge badge-mint" style={{ fontSize: '10.5px', marginLeft: '6px' }}>{cert.category}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedCert(cert);
                          setIsCertModalOpen(true);
                        }}
                        className="dashboard-btn-gold"
                        style={{ padding: '4px 10px', fontSize: '11.5px', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                      >
                        👁️ देखें व डाउनलोड (PDF)
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pending Requests */}
              {certificates.filter((c) => c.status === 'pending').length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px dashed #fde68a', paddingTop: '14px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#92400e', fontSize: '13.5px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    ⏳ समीक्षाधीन आवेदन (Under Admin Review):
                  </h5>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {certificates.filter((c) => c.status === 'pending').map((cert) => (
                      <div key={cert._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a', fontSize: '12.5px' }}>
                        <div>
                          <strong style={{ color: '#78350f' }}>{cert.title}</strong>
                          <span style={{ fontSize: '11px', color: '#92400e', marginLeft: '6px' }}>({cert.category})</span>
                        </div>
                        <span className="dashboard-badge badge-gold" style={{ fontSize: '10.5px' }}>
                          🟡 स्वीकृति लंबित
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rejected Requests */}
              {certificates.filter((c) => c.status === 'rejected').length > 0 && (
                <div style={{ marginTop: '16px', borderTop: '1px dashed #fecaca', paddingTop: '14px' }}>
                  <h5 style={{ margin: '0 0 10px 0', color: '#991b1b', fontSize: '13.5px' }}>
                    ❌ अस्वीकृत आवेदन (Rejected):
                  </h5>
                  <div style={{ display: 'grid', gap: '8px' }}>
                    {certificates.filter((c) => c.status === 'rejected').map((cert) => (
                      <div key={cert._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 12px', background: '#fef2f2', borderRadius: '8px', border: '1px solid #fecaca', fontSize: '12.5px' }}>
                        <span style={{ fontWeight: '600', color: '#991b1b' }}>{cert.title}</span>
                        <span className="dashboard-badge badge-rose" style={{ fontSize: '10.5px' }}>
                          🔴 {cert.remarks || 'अस्वीकृत'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Feedback & Special Request Column */}
          <div className="dashboard-card" style={{ padding: '28px' }}>
            <div style={{ borderBottom: '1px solid #e2ebe4', paddingBottom: '14px', marginBottom: '20px' }}>
              <span style={{ fontSize: '11px', fontWeight: '800', color: '#e8b35a', textTransform: 'uppercase', letterSpacing: '0.12em' }}>FEEDBACK & ASSISTANCE</span>
              <h2 style={{ margin: '4px 0 0 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '22px' }}>फ़ीडबैक एवं विशेष निवेदन</h2>
            </div>

            <form onSubmit={submitFeedback} style={{ display: 'grid', gap: '14px', marginBottom: '28px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>फ़ीडबैक श्रेणी:</label>
                <select
                  value={feedback.category}
                  onChange={(e) => setFeedback({ ...feedback, category: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                >
                  <option value="Class/Session Review">सत्र / कक्षा अनुभव (Session Review)</option>
                  <option value="Program Review">प्रोग्राम समीक्षा (Program Review)</option>
                  <option value="Organization Review">संस्था अनुभव (Organization Review)</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>रेटिंग:</label>
                <div style={{ display: 'flex', gap: '8px', cursor: 'pointer', marginTop: '4px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span
                      key={star}
                      onClick={() => setFeedback({ ...feedback, rating: star })}
                      style={{ fontSize: '26px', color: star <= feedback.rating ? '#e8b35a' : '#dce7d9', transition: 'color 0.2s' }}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12.5px', fontWeight: '700', color: '#173d35', marginBottom: '4px' }}>आपकी प्रतिक्रिया *</label>
                <textarea
                  required
                  rows="3"
                  placeholder="अपना अनुभव लिखें..."
                  value={feedback.feedbackText}
                  onChange={(e) => setFeedback({ ...feedback, feedbackText: e.target.value })}
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
                />
              </div>

              <button type="submit" className="dashboard-btn-gold" style={{ justifyContent: 'center' }}>
                🚀 फ़ीडबैक जमा करें
              </button>
            </form>

            <form onSubmit={submitRequest} style={{ display: 'grid', gap: '14px', borderTop: '1px solid #e2ebe4', paddingTop: '20px' }}>
              <h4 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '16px' }}>✉️ विशेष सहायता / निवेदन (Special Request)</h4>
              <input
                required
                placeholder="विषय (Subject)..."
                value={request.subject}
                onChange={(e) => setRequest({ ...request, subject: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
              />
              <textarea
                required
                rows="3"
                placeholder="हम आपकी क्या सहायता कर सकते हैं? लिखें..."
                value={request.message}
                onChange={(e) => setRequest({ ...request, message: e.target.value })}
                style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', outline: 'none', background: '#ffffff', boxSizing: 'border-box' }}
              />
              <button type="submit" className="dashboard-btn-secondary" style={{ justifyContent: 'center' }}>
                📨 निवेदन भेजें
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Official Certificate Modal */}
      <CertificateModal
        isOpen={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
};

export default GuestDashboard;
