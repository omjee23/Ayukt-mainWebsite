import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import CertificatesPage from './CertificatesPage';
import IDCard from '../components/IDCard';
import VideoPlayerModal from '../components/VideoPlayerModal';
import { useLocation } from 'react-router-dom';

const getTodayDateString = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Website Matching Theme Constants (Royal Forest Emerald & Warm Gold)
const THEME = {
  primary: '#173d35',        // Royal Forest / Emerald Green (Website signature)
  primaryHover: '#102e29',   // Deep Forest 900
  accent: '#e8b35a',         // Warm Golden Amber (Website signature)
  accentGold: '#dfa443',     // Warm Gold Hover
  accentLight: '#fde68a',    // Radiant Gold 300
  cardBg: '#ffffff',
  cardBorder: '#e2ebe4',     // Soft Sage Border
  softBg: '#fbfaf5',         // Warm Cream Body (Website signature)
  softBgHover: '#e9f0e6',    // Soft Mint Hover
  textDark: '#173d35',       // Forest Green Heading
  textMuted: '#547664',      // Soft Sage Muted
  bodyText: '#20332b',       // Deep Forest Body Text
  gradientHeader: 'radial-gradient(circle at 85% 30%, #1e4d43 0%, #173d35 55%, #0d2822 100%)',
  gradientBtn: 'linear-gradient(135deg, #e8b35a 0%, #dfa443 100%)',
  gradientTab: 'linear-gradient(135deg, #173d35 0%, #102e29 100%)',
  borderGold: '2px solid #e8b35a',
};

const MentorDashboard = () => {
  const { user, token, setUser, API } = useContext(AuthContext);
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(location.search).get('tab') || 'schedule');
  const [classes, setClasses] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // View Mode in Schedule: 'batch' (Batch-wise, default) vs 'all' (All Assigned Classes)
  const [scheduleViewMode, setScheduleViewMode] = useState('batch');

  // Mentor Live Sessions State
  const [mentorLiveSessions, setMentorLiveSessions] = useState([]);
  const [liveSessionsLoading, setLiveSessionsLoading] = useState(false);

  // Video Player Modal State
  const [selectedVideo, setSelectedVideo] = useState({
    isOpen: false,
    url: '',
    source: '',
    title: ''
  });

  // Filters
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAllClasses, setShowAllClasses] = useState(false);

  // Profile Edit States
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    collegeOrOrganization: '',
    villageName: '',
    district: '',
    instagram: '',
    linkedin: '',
    snapchat: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Homework Assign Form State
  const [hwForm, setHwForm] = useState({
    title: '',
    description: '',
    subject: '',
    programId: '',
    deadline: '',
    attachmentUrl: '',
    targetRole: 'auto'
  });
  const [hwFile, setHwFile] = useState(null);
  const [assigningHw, setAssigningHw] = useState(false);
  const [expandedSubHwId, setExpandedSubHwId] = useState(null);

  // Feedback Form State
  const [feedbackForm, setFeedbackForm] = useState({
    category: 'Mentor Review',
    targetName: '',
    rating: 5,
    feedbackText: ''
  });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  // Fallback User Retrieval
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser?._id || currentUser?.id;

  // Fetch Programs / Batches (Filtered to mentor-relevant batches)
  const fetchBatches = useCallback(async () => {
    try {
      const res = await API.get('/programs?entryType=class');
      const allBatches = Array.isArray(res.data) ? res.data : [];
      const relevant = allBatches.filter(b => {
        const aud = (b.targetAudience || '').toLowerCase();
        const isAssigned = String(b.defaultPrimaryMentor?._id || b.defaultPrimaryMentor || '') === String(currentUserId) ||
          (Array.isArray(b.defaultAlternativeMentors) && b.defaultAlternativeMentors.some(m => String(m._id || m) === String(currentUserId)));
        return isAssigned || aud.includes('mentor') || aud.includes('open to all') || aud.includes('all-hands') || !aud;
      });
      setBatches(relevant);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  }, [API, currentUserId]);

  // Fetch Mentor Role-wise Live Sessions
  const fetchMentorLiveSessions = useCallback(async () => {
    setLiveSessionsLoading(true);
    try {
      const res = await API.get('/classes/public?entryType=session');
      const allSessions = Array.isArray(res.data) ? res.data : [];
      const relevant = allSessions.filter(s => {
        const aud = s.targetAudience || '';
        const isAssigned = String(s.primaryMentor?._id || s.primaryMentor || '') === String(currentUserId) ||
          s.alternativeMentors?.some(m => String(m._id || m) === String(currentUserId));
        return isAssigned || aud.includes('Mentor') || aud.includes('Open to All') || aud.includes('All-Hands') || !aud;
      });
      setMentorLiveSessions(relevant);
    } catch (err) {
      console.error('Error fetching mentor live sessions:', err);
    } finally {
      setLiveSessionsLoading(false);
    }
  }, [currentUserId, API]);

  // Fetch Mentor Assigned Classes (Strictly where mentor is Primary or Alternative)
  const fetchMentorClasses = useCallback(async () => {
    setLoading(true);
    try {
      if (!currentUserId) return;

      const params = new URLSearchParams({ onlyMine: 'true' });
      if (selectedSubject) params.append('subject', selectedSubject);

      const res = await API.get(`/classes/mentor/${currentUserId}?${params.toString()}`);
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching mentor classes:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, selectedSubject, API]);

  // Fetch Homeworks
  const fetchHomeworks = useCallback(async () => {
    setLoading(true);
    try {
      if (!currentUserId) return;

      const params = new URLSearchParams({ mentorId: currentUserId });
      if (selectedBatch) params.append('programId', selectedBatch);
      if (selectedSubject) params.append('subject', selectedSubject);

      const res = await API.get(`/homework?${params.toString()}`);
      setHomeworks(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching homeworks:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, selectedBatch, selectedSubject, API]);

  // Sync Profile on Mount
  useEffect(() => {
    const fetchMentorProfile = async () => {
      if (!token) return;
      try {
        const res = await API.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Error fetching mentor profile:', err);
      }
    };

    fetchMentorProfile();
    fetchBatches();
  }, [token, setUser, fetchBatches, API]);

  // Fetch Data Based on Active Tab & Filters
  useEffect(() => {
    if (activeTab === 'schedule') fetchMentorClasses();
    if (activeTab === 'live_sessions') fetchMentorLiveSessions();
    if (activeTab === 'homework') fetchHomeworks();
  }, [activeTab, selectedSubject, fetchMentorClasses, fetchMentorLiveSessions, fetchHomeworks]);

  // Sync Profile Form Fields
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || currentUser.whatsappPhone || '',
        collegeOrOrganization: currentUser.collegeOrOrganization || currentUser.college || '',
        villageName: currentUser.villageName || currentUser.village || '',
        district: currentUser.district || '',
        instagram: currentUser.instagram || '',
        linkedin: currentUser.linkedin || '',
        snapchat: currentUser.snapchat || ''
      });
    }
  }, [user]);

  // --------------------------------------------------------------------------
  // STRICT FILTERING: Only classes where current user is Primary or Alternative
  // No classes where mentor has no role will EVER appear!
  // --------------------------------------------------------------------------
  const myAssignedClasses = useMemo(() => {
    return classes.filter(cls => {
      const isPrimary = String(cls.primaryMentor?._id || cls.primaryMentor || '') === String(currentUserId);
      const isAlternative = cls.alternativeMentors?.some(m => String(m._id || m) === String(currentUserId));
      return isPrimary || isAlternative;
    });
  }, [classes, currentUserId]);

  // Assigned Batches Mapping: Only batches where this mentor has assigned classes
  const assignedBatches = useMemo(() => {
    const batchMap = new Map();

    // Group assigned classes by batch (programId)
    batches.forEach(b => {
      const bId = String(b._id);
      const bClasses = myAssignedClasses.filter(c => String(c.programId?._id || c.programId || '') === bId);
      if (bClasses.length > 0) {
        const primaryCount = bClasses.filter(c => String(c.primaryMentor?._id || c.primaryMentor || '') === String(currentUserId)).length;
        const altCount = bClasses.filter(c => c.alternativeMentors?.some(m => String(m._id || m) === String(currentUserId))).length;
        batchMap.set(bId, {
          ...b,
          assignedClasses: bClasses,
          primaryCount,
          altCount,
          totalAssigned: bClasses.length
        });
      }
    });

    // Also check for any batch populated on classes that wasn't in batches list
    myAssignedClasses.forEach(c => {
      if (c.programId && c.programId._id) {
        const bId = String(c.programId._id);
        if (!batchMap.has(bId)) {
          const bClasses = myAssignedClasses.filter(cls => String(cls.programId?._id || cls.programId || '') === bId);
          const primaryCount = bClasses.filter(cls => String(cls.primaryMentor?._id || cls.primaryMentor || '') === String(currentUserId)).length;
          const altCount = bClasses.filter(cls => cls.alternativeMentors?.some(m => String(m._id || m) === String(currentUserId))).length;
          batchMap.set(bId, {
            _id: c.programId._id,
            title: c.programId.title || c.className || 'General Batch',
            description: c.programId.description || '',
            audienceType: c.programId.audienceType || 'Student + Mentor',
            totalDays: c.programId.totalDays || bClasses.length,
            startDate: c.programId.startDate || c.dateTime,
            assignedClasses: bClasses,
            primaryCount,
            altCount,
            totalAssigned: bClasses.length
          });
        }
      }
    });

    return Array.from(batchMap.values());
  }, [batches, myAssignedClasses, currentUserId]);

  // Metrics for overview cards
  const totalPrimaryClasses = useMemo(() => {
    return myAssignedClasses.filter(c => String(c.primaryMentor?._id || c.primaryMentor || '') === String(currentUserId)).length;
  }, [myAssignedClasses, currentUserId]);

  const totalAltClasses = useMemo(() => {
    return myAssignedClasses.filter(c => c.alternativeMentors?.some(m => String(m._id || m) === String(currentUserId))).length;
  }, [myAssignedClasses, currentUserId]);

  // Selected Batch Object
  const currentSelectedBatchObj = useMemo(() => {
    if (!selectedBatch) return null;
    return assignedBatches.find(b => String(b._id) === String(selectedBatch)) ||
      batches.find(b => String(b._id) === String(selectedBatch)) || null;
  }, [selectedBatch, assignedBatches, batches]);

  // Classes filtered by selected batch and search
  const visibleClasses = useMemo(() => {
    let result = myAssignedClasses;

    if (selectedBatch) {
      result = result.filter(c => String(c.programId?._id || c.programId || '') === String(selectedBatch));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(c =>
        (c.subject && c.subject.toLowerCase().includes(q)) ||
        (c.meetingTopic && c.meetingTopic.toLowerCase().includes(q)) ||
        (c.programId?.title && c.programId.title.toLowerCase().includes(q))
      );
    }

    return result;
  }, [myAssignedClasses, selectedBatch, searchQuery]);

  // Form Handlers
  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setUploading(true);
    setMsg({ text: '', type: '' });

    try {
      let avatarUrl = currentUser?.avatar;

      if (selectedFile) {
        const formData = new FormData();
        formData.append('avatar', selectedFile);
        formData.append('userId', currentUserId);

        const uploadRes = await API.post('/auth/upload-avatar', formData);
        avatarUrl = uploadRes.data.avatar;
      }

      const updateRes = await API.put('/auth/update-profile', {
        userId: currentUserId,
        ...profileForm,
        avatar: avatarUrl
      });

      setMsg({ text: 'प्रोफाइल सफलतापूर्वक अपडेट हो गई!', type: 'success' });
      setUser(updateRes.data.user);
      localStorage.setItem('user', JSON.stringify(updateRes.data.user));
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'अपडेट विफल रहा', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleAssignHomework = async (e) => {
    e.preventDefault();
    if (!hwForm.title || !hwForm.subject || !hwForm.deadline) {
      alert('कृपया शीर्षक, विषय और डेडलाइन भरें!');
      return;
    }

    setAssigningHw(true);
    try {
      let finalAttachmentUrl = hwForm.attachmentUrl;

      if (hwFile) {
        const fileData = new FormData();
        fileData.append('avatar', hwFile);
        fileData.append('userId', currentUserId);

        const uploadRes = await API.post('/auth/upload-avatar', fileData);
        finalAttachmentUrl = uploadRes.data.avatar || uploadRes.data.url || uploadRes.data.fileUrl;
      }

      await API.post('/homework/assign', {
        ...hwForm,
        attachmentUrl: finalAttachmentUrl,
        mentorId: currentUserId
      });

      alert('होमवर्क सफलतापूर्वक असाइन कर दिया गया!');
      setHwForm({ title: '', description: '', subject: '', programId: '', deadline: '', attachmentUrl: '' });
      setHwFile(null);
      fetchHomeworks();
    } catch (err) {
      alert('एरर: ' + (err.response?.data?.error || err.message));
    } finally {
      setAssigningHw(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    setFeedbackMsg({ text: '', type: '' });

    try {
      const payload = {
        userId: currentUserId,
        userName: currentUser?.name || '',
        userEmail: currentUser?.email || '',
        userRole: 'Mentor',
        userAvatar: currentUser?.avatar || '',
        category: feedbackForm.category,
        targetName: feedbackForm.targetName,
        rating: feedbackForm.rating,
        feedbackText: feedbackForm.feedbackText
      };

      await API.post('/feedback', payload);
      setFeedbackMsg({ text: 'आपका फ़ीडबैक सफलतापूर्वक दर्ज कर लिया गया है! धन्यवाद। 🙏', type: 'success' });
      setFeedbackForm({
        category: 'Mentor Review',
        targetName: '',
        rating: 5,
        feedbackText: ''
      });
    } catch (err) {
      setFeedbackMsg({ text: err.response?.data?.error || 'फ़ीडबैक सबमिट करने में समस्या आई।', type: 'error' });
    } finally {
      setFeedbackSubmitting(false);
    }
  };

  const mentorIdDisplay = currentUser?.uniqueMentorId || currentUser?.mentorId || currentUser?.uniqueId || 'VOLUNTEER';

  return (
    <div className="dashboard-container">
      
      {/* Video Player Modal */}
      <VideoPlayerModal
        isOpen={selectedVideo.isOpen}
        onClose={() => setSelectedVideo({ ...selectedVideo, isOpen: false })}
        videoUrl={selectedVideo.url}
        recordingSource={selectedVideo.source}
        title={selectedVideo.title}
      />

      {/* Royal Forest Emerald & Gold Header Banner */}
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-hero-kicker">
            🌿 अधिकृत मेंटॉर पोर्टल • VERIFIED MENTOR PORTAL
          </span>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', margin: '4px 0 8px 0' }}>
            स्वागत है, {currentUser?.name || 'Mentor'}! 🎓
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="dashboard-hero-badge">
              <strong>Mentor ID:</strong> {mentorIdDisplay}
            </span>
            <span className="dashboard-hero-badge" style={{ background: 'rgba(232, 179, 90, 0.18)' }}>
              🏛️ {currentUser?.collegeOrOrganization || currentUser?.college || 'अव्युक्त मेंटॉर नेटवर्क'}
            </span>
          </div>
        </div>

        <div>
          <img
            src={currentUser?.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
            alt="Profile"
            className="dashboard-avatar"
          />
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="dashboard-tabs-bar">
        <button onClick={() => setActiveTab('schedule')} style={tabBtnStyle(activeTab === 'schedule')}>
          📅 मेरी क्लासेस का शेड्यूल
        </button>
        <button onClick={() => setActiveTab('live_sessions')} style={tabBtnStyle(activeTab === 'live_sessions')}>
          🔴 लाइव सत्र (Live Sessions)
        </button>
        <button onClick={() => setActiveTab('homework')} style={tabBtnStyle(activeTab === 'homework')}>
          📝 होमवर्क मैनेजमेंट
        </button>
        <button onClick={() => setActiveTab('idcard')} style={tabBtnStyle(activeTab === 'idcard')}>
          🪪 डिजिटल ID कार्ड
        </button>
        <button onClick={() => setActiveTab('certificates')} style={tabBtnStyle(activeTab === 'certificates')}>
          🏆 सर्टिफिकेट्स
        </button>
        <button onClick={() => setActiveTab('profile')} style={tabBtnStyle(activeTab === 'profile')}>
          ✏️ एडिट प्रोफाइल
        </button>
        <button onClick={() => setActiveTab('feedback')} style={tabBtnStyle(activeTab === 'feedback')}>
          💬 फ़ीडबैक दें
        </button>
      </div>

      {/* TAB 1: SCHEDULE VIEW */}
      {activeTab === 'schedule' && (
        <div>
          {/* Quick Overview Stat Cards in Warm Golden Theme */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '22px' }}>
            <div style={statCardStyle}>
              <div style={{ fontSize: '24px' }}>📦</div>
              <div>
                <div style={{ fontSize: '12px', color: THEME.textMuted, fontWeight: '700' }}>निर्धारित बैच (Batches)</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: THEME.textDark }}>{assignedBatches.length}</div>
              </div>
            </div>

            <div style={statCardStyle}>
              <div style={{ fontSize: '24px' }}>📚</div>
              <div>
                <div style={{ fontSize: '12px', color: THEME.textMuted, fontWeight: '700' }}>कुल असाइन कक्षाएं</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: THEME.textDark }}>{myAssignedClasses.length}</div>
              </div>
            </div>

            <div style={{ ...statCardStyle, borderLeft: '4px solid #059669' }}>
              <div style={{ fontSize: '24px' }}>🌿</div>
              <div>
                <div style={{ fontSize: '12px', color: '#065f46', fontWeight: '700' }}>मुख्य मार्गदर्शक (Primary)</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#047857' }}>{totalPrimaryClasses}</div>
              </div>
            </div>

            <div style={{ ...statCardStyle, borderLeft: '4px solid #2563eb' }}>
              <div style={{ fontSize: '24px' }}>🔷</div>
              <div>
                <div style={{ fontSize: '12px', color: '#1e40af', fontWeight: '700' }}>सहायक मार्गदर्शक (Alt)</div>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#1d4ed8' }}>{totalAltClasses}</div>
              </div>
            </div>
          </div>

          {/* Filter Bar & View Mode Switcher */}
          <div style={{
            background: THEME.softBg,
            padding: '16px',
            borderRadius: '12px',
            marginBottom: '24px',
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: `1px solid ${THEME.cardBorder}`,
            boxShadow: '0 2px 8px rgba(217, 119, 6, 0.04)'
          }}>
            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontWeight: '800', color: THEME.textDark, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span>🔍</span> फ़िल्टर:
              </span>

              {/* Subject Select */}
              <select
                value={selectedSubject}
                onChange={(e) => { setSelectedSubject(e.target.value); }}
                style={goldSelectStyle}
              >
                <option value="">-- सभी विषय (All Subjects) --</option>
                <option value="Maths">गणित (Maths)</option>
                <option value="Science">विज्ञान (Science)</option>
                <option value="English">अंग्रेजी (English)</option>
                <option value="Hindi">हिंदी (Hindi)</option>
                <option value="Social Studies">सामाजिक विज्ञान (SST)</option>
              </select>

              {/* Search Box */}
              <input
                type="text"
                placeholder="क्लास या विषय खोजें..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ ...goldSelectStyle, minWidth: '180px' }}
              />
            </div>

            {/* View Mode Toggle: Batch View vs All Classes View */}
            <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '8px', border: `1px solid ${THEME.cardBorder}` }}>
              <button
                type="button"
                onClick={() => { setScheduleViewMode('batch'); setSelectedBatch(''); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: scheduleViewMode === 'batch' ? THEME.primary : 'transparent',
                  color: scheduleViewMode === 'batch' ? '#ffffff' : THEME.textDark,
                  transition: 'all 0.2s'
                }}
              >
                📂 बैच अनुसार (Batch View)
              </button>

              <button
                type="button"
                onClick={() => { setScheduleViewMode('all'); setSelectedBatch(''); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: scheduleViewMode === 'all' ? THEME.primary : 'transparent',
                  color: scheduleViewMode === 'all' ? '#ffffff' : THEME.textDark,
                  transition: 'all 0.2s'
                }}
              >
                📅 सभी असाइन कक्षाएं ({myAssignedClasses.length})
              </button>
            </div>
          </div>

          {/* VIEW 1: BATCH-CENTRIC VIEW (DEFAULT) */}
          {scheduleViewMode === 'batch' && !selectedBatch && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, color: THEME.textDark, fontSize: '19px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📚</span> आपके निर्धारित बैच (Your Assigned Batches)
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: THEME.textMuted }}>
                    बैच पर क्लिक करें और केवल उस बैच की अपनी कक्षाएं (Primary/Alternative) देखें।
                  </p>
                </div>
                <span style={{ fontSize: '12px', background: THEME.softBg, color: THEME.textDark, padding: '4px 10px', borderRadius: '6px', border: `1px solid ${THEME.cardBorder}`, fontWeight: '700' }}>
                  कुल {assignedBatches.length} बैच उपलब्ध
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: THEME.textMuted }}>लोड हो रहा है...</div>
              ) : assignedBatches.length === 0 ? (
                <div style={{ background: '#ffffff', padding: '40px', borderRadius: '14px', textAlign: 'center', border: `1px dashed ${THEME.cardBorder}` }}>
                  <span style={{ fontSize: '40px' }}>📖</span>
                  <h4 style={{ margin: '12px 0 6px 0', color: THEME.textDark }}>अभी आपको किसी भी बैच में क्लास असाइन नहीं की गई है</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    जब एडमिन आपको किसी बैच में मुख्य या सहायक मार्गदर्शक के रूप में जोड़ेंगे, तो वह बैच यहाँ दिखाई देगा।
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {assignedBatches.map(batch => {
                    return (
                      <div
                        key={batch._id}
                        onClick={() => setSelectedBatch(batch._id)}
                        style={{
                          cursor: 'pointer',
                          background: '#ffffff',
                          borderRadius: '14px',
                          border: `1px solid ${THEME.cardBorder}`,
                          borderTop: `4px solid ${THEME.accent}`,
                          padding: '20px',
                          boxShadow: '0 4px 16px rgba(217, 119, 6, 0.08)',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(217, 119, 6, 0.16)';
                          e.currentTarget.style.borderColor = THEME.accentGold;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(217, 119, 6, 0.08)';
                          e.currentTarget.style.borderColor = THEME.cardBorder;
                        }}
                      >
                        <div>
                          {/* Batch Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <span style={{ background: THEME.softBg, color: THEME.textDark, border: `1px solid ${THEME.cardBorder}`, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              🎓 बैच ID: {batch._id.slice(-6).toUpperCase()}
                            </span>
                            <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              सक्रिय
                            </span>
                          </div>

                          <h3 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#0f172a', fontWeight: '800' }}>
                            {batch.title}
                          </h3>

                          <p style={{ margin: '0 0 14px 0', fontSize: '12.5px', color: '#64748b', lineHeight: 1.4 }}>
                            {batch.category || batch.audienceType || 'नियमित कक्षा बैच'}
                            {batch.totalDays ? ` • ${batch.totalDays} दिवसीय कोर्स` : ''}
                          </p>

                          {/* Role Breakdown in this Batch */}
                          <div style={{ background: THEME.softBg, padding: '10px 12px', borderRadius: '8px', marginBottom: '14px', border: `1px solid ${THEME.cardBorder}` }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: THEME.textDark, marginBottom: '6px' }}>
                              🎯 इस बैच में आपकी भूमिका:
                            </div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {batch.primaryCount > 0 && (
                                <span style={{ background: '#047857', color: '#ffffff', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                                  🌿 {batch.primaryCount} Primary
                                </span>
                              )}
                              {batch.altCount > 0 && (
                                <span style={{ background: '#1d4ed8', color: '#ffffff', fontSize: '11px', padding: '3px 8px', borderRadius: '6px', fontWeight: '700' }}>
                                  🔷 {batch.altCount} Alternative
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Card Action Button */}
                        <div style={{ borderTop: `1px solid #fef3c7`, paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: THEME.textMuted, fontWeight: '700' }}>
                            कुल {batch.totalAssigned} कक्षाएं असाइन
                          </span>
                          <button
                            type="button"
                            style={{
                              background: THEME.gradientBtn,
                              color: '#ffffff',
                              border: 'none',
                              padding: '8px 14px',
                              borderRadius: '8px',
                              fontSize: '12.5px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 2px 8px rgba(180, 83, 9, 0.2)'
                            }}
                          >
                            कक्षाएं देखें →
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* VIEW 2: SPECIFIC BATCH SELECTED OR "ALL CLASSES" VIEW */}
          {(selectedBatch || scheduleViewMode === 'all') && (
            <div>
              {/* Back to Batches Header */}
              {selectedBatch && (
                <div style={{
                  background: '#ffffff',
                  border: `1px solid ${THEME.cardBorder}`,
                  borderLeft: `5px solid ${THEME.accentGold}`,
                  padding: '16px 20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(217, 119, 6, 0.05)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ background: THEME.softBg, color: THEME.textDark, padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                        चयनित बैच
                      </span>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
                        {currentSelectedBatchObj?.title || 'Batch Classes'}
                      </h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                      इस बैच में आपके लिए निर्धारित कुल {visibleClasses.length} कक्षाएं प्रदर्शित हो रही हैं।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedBatch('')}
                    style={{
                      background: THEME.softBg,
                      color: THEME.textDark,
                      border: `1px solid ${THEME.cardBorder}`,
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = THEME.softBgHover}
                    onMouseLeave={(e) => e.currentTarget.style.background = THEME.softBg}
                  >
                    ← सभी बैच की सूची पर वापस जाएं
                  </button>
                </div>
              )}

              {/* Class Schedule Section Title */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, color: THEME.textDark, fontSize: '16px', fontWeight: '800' }}>
                  📅 निर्धारित कक्षाएं ({visibleClasses.length})
                </h4>
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', padding: '30px', color: THEME.textMuted }}>कक्षाएं लोड हो रही हैं...</p>
              ) : visibleClasses.length === 0 ? (
                <div style={{ background: '#fff', padding: '36px', borderRadius: '12px', textAlign: 'center', border: `1px dashed ${THEME.cardBorder}` }}>
                  <span style={{ fontSize: '36px' }}>📖</span>
                  <p style={{ margin: '10px 0 0 0', color: THEME.textDark, fontWeight: '700' }}>
                    {selectedBatch
                      ? 'इस बैच में आपकी कोई कक्षा निर्धारित नहीं है।'
                      : 'कोई निर्धारित कक्षा उपलब्ध नहीं है।'}
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                    {(showAllClasses ? visibleClasses : visibleClasses.slice(0, 9)).map(cls => {
                      const isPrimary = String(cls.primaryMentor?._id || cls.primaryMentor || '') === String(currentUserId);
                      const isAlternative = cls.alternativeMentors?.some(m => String(m._id || m) === String(currentUserId));

                      return (
                        <div
                          key={cls._id}
                          style={{
                            border: `1px solid ${THEME.cardBorder}`,
                            borderTop: `4px solid ${isPrimary ? '#059669' : '#2563eb'}`,
                            padding: '18px',
                            borderRadius: '14px',
                            background: '#ffffff',
                            boxShadow: '0 4px 14px rgba(217, 119, 6, 0.06)',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'space-between'
                          }}
                        >
                          <div>
                            {/* Top Badges Row */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                              <span style={{ background: THEME.softBg, color: THEME.textDark, border: `1px solid ${THEME.cardBorder}`, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                                🎯 {cls.programId?.title || 'General Batch'}
                              </span>

                              {/* Clear Role Distinction: Primary (Green) vs Alternative (Blue) */}
                              {isPrimary ? (
                                <span style={{ background: '#047857', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', boxShadow: '0 2px 6px rgba(4,120,87,0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  🌿 मुख्य मार्गदर्शक (Primary Mentor)
                                </span>
                              ) : isAlternative ? (
                                <span style={{ background: '#1d4ed8', color: '#ffffff', padding: '4px 10px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', boxShadow: '0 2px 6px rgba(29,78,216,0.25)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                                  🔷 सहायक मार्गदर्शक (Alternative Mentor)
                                </span>
                              ) : null}
                            </div>

                            {/* Class Title */}
                            <h4 style={{ margin: '6px 0 4px 0', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                              {cls.subject} {cls.dayNumber ? `(Day ${cls.dayNumber})` : ''}
                            </h4>
                            <p style={{ margin: 0, fontSize: '13px', color: '#475569', fontWeight: '600' }}>
                              Topic: {cls.meetingTopic || 'Interactive Session'}
                            </p>

                            <p style={{ margin: '8px 0 0 0', fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>📅</span>
                              <span>{cls.dateTime ? new Date(cls.dateTime).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA'}</span>
                              {cls.durationMinutes ? ` • ⏱️ ${cls.durationMinutes} मिनट` : ''}
                            </p>

                            {/* Dedicated: क्या-क्या सिखाना है (Curriculum Covered) */}
                            <div style={{ background: THEME.softBg, borderLeft: `4px solid ${THEME.accent}`, padding: '10px 12px', borderRadius: '6px', margin: '12px 0' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: '800', color: THEME.textDark, fontSize: '12px', marginBottom: '4px' }}>
                                <span>💡</span> क्या-क्या सिखाया गया / पाठ विवरण (Curriculum Covered)
                              </div>
                              <p style={{ margin: 0, fontSize: '12.5px', color: THEME.textDark, lineHeight: 1.4 }}>
                                {cls.meetingTopic || 'सत्र की मुख्य अवधारणाओं और व्यावहारिक अभ्यास पर विशेष चर्चा।'}
                              </p>
                              {cls.instructions && (
                                <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: THEME.primary, fontStyle: 'italic' }}>
                                  📌 <strong>निर्देश:</strong> {cls.instructions}
                                </p>
                              )}
                            </div>

                            {/* Team Members info */}
                            <div style={{ fontSize: '12px', color: '#64748b', marginBottom: '8px' }}>
                              {!isPrimary && cls.primaryMentor && (
                                <div style={{ color: '#047857', fontWeight: '600' }}>🌿 <strong>मुख्य मार्गदर्शक:</strong> {cls.primaryMentor.name}</div>
                              )}
                              {cls.primaryVolunteer && (
                                <div>🤝 <strong>सहायक वॉलंटियर:</strong> {cls.primaryVolunteer.name}</div>
                              )}
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #fef3c7' }}>
                            {cls.jitsiRoom && (
                              <a
                                href={`https://meet.jit.si/${cls.jitsiRoom}`}
                                target="_blank"
                                rel="noreferrer"
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  background: THEME.gradientBtn,
                                  color: '#fff',
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  textDecoration: 'none',
                                  fontSize: '13px',
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 6px rgba(180, 83, 9, 0.2)'
                                }}
                              >
                                🎙️ क्लास होस्ट/जोइन करें
                              </a>
                            )}

                            {(cls.youtubeUrl || cls.recordingUrl || cls.driveUrl) && (
                              <button
                                onClick={() => setSelectedVideo({
                                  isOpen: true,
                                  url: cls.youtubeUrl || cls.recordingUrl || cls.driveUrl,
                                  source: cls.youtubeUrl ? 'youtube' : (cls.recordingSource || 'googledrive'),
                                  title: `${cls.subject} - Day ${cls.dayNumber || 1}`
                                })}
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: '5px',
                                  background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                                  color: '#fff',
                                  border: 'none',
                                  padding: '8px 14px',
                                  borderRadius: '6px',
                                  cursor: 'pointer',
                                  fontSize: '13px',
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 6px rgba(5, 150, 105, 0.2)'
                                }}
                              >
                                ▶ रिकॉर्डिंग देखें
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Show more toggle */}
                  {visibleClasses.length > 9 && (
                    <div style={{ textAlign: 'center', marginTop: '24px' }}>
                      <button
                        type="button"
                        onClick={() => setShowAllClasses(!showAllClasses)}
                        style={{
                          padding: '10px 24px',
                          backgroundColor: THEME.primary,
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '8px',
                          fontSize: '13.5px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(180, 83, 9, 0.25)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {showAllClasses ? '▲ कम दिखाएं (Show Less)' : `▼ एक्सप्लोर मोर (${visibleClasses.length - 9} और कक्षाएं)`}
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ROLE-WISE LIVE SESSIONS */}
      {activeTab === 'live_sessions' && (
        <div>
          <div style={{
            background: THEME.gradientHeader,
            borderRadius: '14px',
            padding: '22px 26px',
            color: '#ffffff',
            marginBottom: '22px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            borderBottom: THEME.borderGold,
            boxShadow: '0 6px 20px rgba(180, 83, 9, 0.2)'
          }}>
            <div>
              <span style={{ background: 'rgba(254, 243, 199, 0.22)', padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '800', textTransform: 'uppercase', color: '#fef3c7' }}>
                MENTOR LIVE WORKSHOPS
              </span>
              <h3 style={{ margin: '8px 0 2px 0', fontSize: '19px', fontWeight: '800' }}>
                🔴 लाइव सत्र एवं कार्यशालाएं (Mentor Live Sessions)
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#fef3c7' }}>
                आपके लिए निर्धारित लाइव सत्र एवं वर्कशॉप्स। यहाँ से सीधे 1-क्लिक में सत्र प्रारंभ / होस्ट करें।
              </p>
            </div>
            <button
              type="button"
              onClick={fetchMentorLiveSessions}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: '1px solid rgba(254, 243, 199, 0.5)',
                background: 'rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              🔄 रीफ्रेश करें
            </button>
          </div>

          {liveSessionsLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: THEME.textMuted }}>लाइव सत्र लोड हो रहे हैं...</div>
          ) : mentorLiveSessions.length === 0 ? (
            <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: `1px dashed ${THEME.cardBorder}`, color: THEME.textDark }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔴</div>
              <h4 style={{ margin: '0 0 6px 0', color: THEME.textDark }}>अभी कोई सक्रिय लाइव सत्र उपलब्ध नहीं है</h4>
              <p style={{ margin: 0, fontSize: '13px' }}>आगामी लाइव सत्रों के शेड्यूल की जानकारी यहाँ प्रदर्शित होगी।</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {mentorLiveSessions.map((cls) => {
                const sDate = cls.dateTime ? new Date(cls.dateTime) : null;
                const isLive = cls.status === 'live';
                const isCompleted = cls.status === 'completed';
                const isPrimary = String(cls.primaryMentor?._id || cls.primaryMentor || '') === String(currentUserId);
                const isAlternative = cls.alternativeMentors?.some(m => String(m._id || m) === String(currentUserId));

                return (
                  <div
                    key={cls._id}
                    style={{
                      border: isLive ? '2px solid #ef4444' : `1px solid ${THEME.cardBorder}`,
                      borderTop: `4px solid ${isLive ? '#ef4444' : THEME.accentGold}`,
                      borderRadius: '14px',
                      padding: '18px',
                      background: isLive ? '#fff5f5' : '#ffffff',
                      boxShadow: '0 4px 14px rgba(217, 119, 6, 0.06)',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      {/* Badges */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px', marginBottom: '10px', flexWrap: 'wrap' }}>
                        <span style={{ background: THEME.softBg, color: THEME.textDark, border: `1px solid ${THEME.cardBorder}`, padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                          सत्र {cls.sessionNumber || 1}
                        </span>

                        {isPrimary ? (
                          <span style={{ background: '#047857', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            🌿 मुख्य मार्गदर्शक (Primary)
                          </span>
                        ) : isAlternative ? (
                          <span style={{ background: '#1d4ed8', color: '#ffffff', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 'bold' }}>
                            🔷 सहायक मार्गदर्शक (Alternative)
                          </span>
                        ) : (
                          <span style={{ background: '#f1f5f9', color: '#475569', padding: '3px 8px', borderRadius: '6px', fontSize: '11px' }}>
                            {cls.targetAudience || 'Open to All'}
                          </span>
                        )}
                      </div>

                      <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a', fontWeight: '800' }}>
                        {cls.meetingTopic || cls.subject}
                      </h4>

                      <div style={{ fontSize: '12.5px', color: '#475569', marginBottom: '8px' }}>
                        📅 {sDate ? sDate.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBA'}
                        {' '}• ⏰ {sDate ? sDate.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}
                      </div>

                      {cls.instructions && (
                        <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#64748b' }}>
                          {cls.instructions}
                        </p>
                      )}
                    </div>

                    <div style={{ borderTop: '1px solid #fef3c7', paddingTop: '12px', display: 'flex', gap: '8px' }}>
                      {(cls.youtubeUrl || cls.recordingUrl || cls.driveUrl) && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedVideo({
                              isOpen: true,
                              url: cls.youtubeUrl || cls.recordingUrl || cls.driveUrl,
                              source: cls.youtubeUrl ? 'youtube' : 'googledrive',
                              title: cls.meetingTopic || cls.subject
                            });
                          }}
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          ▶️ रिकॉर्डिंग
                        </button>
                      )}

                      {!isCompleted && (
                        <a
                          href={`https://meet.jit.si/${cls.jitsiRoom || 'Avyukt_Live'}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            flex: 1,
                            padding: '8px 12px',
                            background: isLive ? '#dc2626' : THEME.gradientBtn,
                            color: '#ffffff',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: '700',
                            textDecoration: 'none',
                            textAlign: 'center',
                            display: 'inline-block'
                          }}
                        >
                          {isLive ? '🔴 लाइव होस्ट करें' : 'सत्र में प्रवेश करें ↗'}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: HOMEWORK MANAGEMENT */}
      {activeTab === 'homework' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          {/* Assign Homework Card */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: `1px solid ${THEME.cardBorder}`, borderTop: `4px solid ${THEME.accentGold}`, boxShadow: '0 4px 14px rgba(217, 119, 6, 0.06)' }}>
            <h3 style={{ borderBottom: `2px solid ${THEME.accent}`, paddingBottom: '8px', color: THEME.textDark, marginTop: 0, fontWeight: '800' }}>
              📤 नया होमवर्क असाइन करें
            </h3>

            <form onSubmit={handleAssignHomework}>
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>बैच / प्रोग्राम (Batch):</label>
                <select 
                  value={hwForm.programId} 
                  onChange={(e) => {
                    const pId = e.target.value;
                    const bObj = batches.find(b => String(b._id) === String(pId));
                    let autoRole = 'auto';
                    if (bObj) {
                      const aud = (bObj.targetAudience || '').toLowerCase();
                      if (aud.includes('volunteer') && !aud.includes('student')) autoRole = 'volunteer';
                      else if (aud.includes('guest') && !aud.includes('student') && !aud.includes('volunteer')) autoRole = 'guest';
                      else if (aud.includes('student') && aud.includes('volunteer')) autoRole = 'all';
                      else if (aud.includes('open to all') || aud.includes('all-hands')) autoRole = 'all';
                      else autoRole = 'student';
                    }
                    setHwForm({ ...hwForm, programId: pId, targetRole: autoRole });
                  }} 
                  style={goldInputStyle}
                >
                  <option value="">-- बैच चुनें --</option>
                  {batches.map(b => (
                    <option key={b._id} value={b._id}>
                      {b.title} ({b.targetAudience || 'General'})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Role Selector */}
              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>किसे कार्य सौंपें (Assign To Role):</label>
                <select 
                  value={hwForm.targetRole || 'auto'} 
                  onChange={(e) => setHwForm({ ...hwForm, targetRole: e.target.value })} 
                  style={goldInputStyle}
                >
                  <option value="auto">🎯 बैच अनुसार ऑटो (Auto by Batch)</option>
                  <option value="student">👨‍🎓 स्टूडेंट्स (Students)</option>
                  <option value="volunteer">🤝 वॉलिंटियर्स (Volunteers)</option>
                  <option value="guest">🌟 गेस्ट (Guests)</option>
                  <option value="all">🌐 सभी (All Roles in Batch)</option>
                </select>
                {hwForm.programId && (() => {
                  const bObj = batches.find(b => String(b._id) === String(hwForm.programId));
                  if (!bObj) return null;
                  const roleLabel = hwForm.targetRole === 'volunteer' ? 'वॉलिंटियर्स' :
                    hwForm.targetRole === 'guest' ? 'गेस्ट' :
                    hwForm.targetRole === 'all' ? 'सभी (स्टूडेंट्स व वॉलिंटियर्स)' : 'स्टूडेंट्स';
                  return (
                    <div style={{ fontSize: '11px', color: '#b45309', marginTop: '4px', fontWeight: 'bold' }}>
                      📌 बैच ऑडियंस: {bObj.targetAudience || 'Student + Mentor'} ➔ कार्य असाइन होगा: {roleLabel}
                    </div>
                  );
                })()}
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>विषय (Subject):</label>
                <input type="text" placeholder="Maths, Science..." value={hwForm.subject} onChange={(e) => setHwForm({ ...hwForm, subject: e.target.value })} style={goldInputStyle} required />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>शीर्षक (Homework Title):</label>
                <input type="text" placeholder="Exercise 3.2 Solved Questions" value={hwForm.title} onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })} style={goldInputStyle} required />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>विवरण / निर्देश (Description):</label>
                <textarea rows="3" placeholder="निर्देश यहाँ लिखें..." value={hwForm.description} onChange={(e) => setHwForm({ ...hwForm, description: e.target.value })} style={goldInputStyle} />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>अंतिम तिथि (Deadline):</label>
                <input type="date" min={getTodayDateString()} value={hwForm.deadline} onChange={(e) => setHwForm({ ...hwForm, deadline: e.target.value })} style={goldInputStyle} required />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>📷 डायरेक्ट फाइल/इमेज अपलोड (Mobile/PC):</label>
                <input
                  type="file"
                  accept="image/*,.pdf,.doc,.docx"
                  onChange={(e) => setHwFile(e.target.files?.[0] || null)}
                  style={{ width: '100%', padding: '6px', marginTop: '4px', fontSize: '13px' }}
                />
              </div>

              <div style={{ marginBottom: '15px' }}>
                <label style={labelStyle}>फाइल/डॉक्यूमेंट लिंक (Optional Drive URL):</label>
                <input type="text" placeholder="https://drive.google.com/..." value={hwForm.attachmentUrl} onChange={(e) => setHwForm({ ...hwForm, attachmentUrl: e.target.value })} style={goldInputStyle} />
              </div>

              <button type="submit" disabled={assigningHw} style={{ width: '100%', padding: '12px', background: THEME.gradientBtn, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(180, 83, 9, 0.25)' }}>
                {assigningHw ? 'असाइन हो रहा है...' : '🚀 होमवर्क जारी करें'}
              </button>
            </form>
          </div>

          {/* Submissions Card */}
          <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: `1px solid ${THEME.cardBorder}`, borderTop: `4px solid ${THEME.accentGold}`, boxShadow: '0 4px 14px rgba(217, 119, 6, 0.06)' }}>
            <h3 style={{ borderBottom: `2px solid ${THEME.accent}`, paddingBottom: '8px', color: THEME.textDark, marginTop: 0, fontWeight: '800' }}>
              📋 आपके द्वारा दिए गए होमवर्क & Submissions
            </h3>

            {loading ? <p style={{ color: THEME.textMuted }}>लोड हो रहा है...</p> : homeworks.length === 0 ? <p style={{ color: THEME.textMuted }}>कोई होमवर्क पोस्ट नहीं किया गया है।</p> : (
              homeworks.map(hw => (
                <div key={hw._id} style={{ border: `1px solid ${THEME.cardBorder}`, padding: '14px', borderRadius: '10px', marginBottom: '14px', background: THEME.softBg }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                    <span style={{ fontWeight: 'bold', color: THEME.primary }}>{hw.subject}</span>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ 
                        fontSize: '11px', 
                        background: hw.targetRole === 'volunteer' ? '#ecfdf5' : hw.targetRole === 'guest' ? '#f3e8ff' : '#eff6ff', 
                        color: hw.targetRole === 'volunteer' ? '#047857' : hw.targetRole === 'guest' ? '#7e22ce' : '#1d4ed8', 
                        padding: '2px 8px', 
                        borderRadius: '4px', 
                        fontWeight: 'bold' 
                      }}>
                        {hw.targetRole === 'volunteer' ? '🤝 वॉलिंटियर टास्क' : hw.targetRole === 'guest' ? '🌟 गेस्ट टास्क' : hw.targetRole === 'all' ? '🌐 ऑल ऑडियंस' : '👨‍🎓 स्टूडेंट होमवर्क'}
                      </span>
                      {hw.programId?.title && (
                        <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                          📦 {hw.programId.title}
                        </span>
                      )}
                      <span style={{ fontSize: '11px', background: '#dbeafe', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {hw.submissions?.length || 0} सबमिशन
                      </span>
                    </div>
                  </div>
                  <h5 style={{ margin: '8px 0 4px 0', fontSize: '15px', color: '#0f172a' }}>{hw.title}</h5>
                  <p style={{ margin: 0, fontSize: '12px', color: '#64748b' }}>⏰ डेडलाइन: {hw.deadline ? new Date(hw.deadline).toLocaleDateString('hi-IN') : 'N/A'}</p>

                  {hw.attachmentUrl && (
                    <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}>
                      <a href={hw.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: THEME.primary, fontWeight: 'bold' }}>📎 अटैचमेंट फ़ाइल देखें</a>
                    </p>
                  )}

                  {hw.submissions && hw.submissions.length > 0 && (
                    <div style={{ marginTop: '12px', borderTop: `1px dashed ${THEME.cardBorder}`, paddingTop: '10px' }}>
                      <strong style={{ fontSize: '12px', color: THEME.textDark, display: 'block', marginBottom: '6px' }}>📥 जमा किए गए उत्तर (Student Submissions):</strong>
                      {hw.submissions.map((sub, idx) => {
                        const subKey = `${hw._id}_${idx}`;
                        const historyList = sub.history || [];
                        const isExpanded = expandedSubHwId === subKey;

                        return (
                          <div key={idx} style={{ fontSize: '12px', background: '#fff', padding: '10px', borderRadius: '6px', marginTop: '6px', border: `1px solid ${THEME.cardBorder}` }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <span style={{ fontWeight: 'bold', color: '#0f172a' }}>
                                👤 {sub.studentId?.name || 'Student'}
                              </span>
                              <span style={{ fontSize: '11px', color: '#64748b' }}>
                                ID: {sub.studentId?.uniqueStudentId || sub.studentId?.studentId || sub.studentId?.uniqueId || 'N/A'}
                              </span>
                            </div>

                            <div style={{ marginTop: '4px', color: '#475569' }}>
                              <span>📅 नवीनतम सबमिशन: {sub.submittedAt ? new Date(sub.submittedAt).toLocaleString('hi-IN') : 'हाल ही में'}</span>
                              {sub.fileUrl && (
                                <div style={{ marginTop: '3px' }}>
                                  <a href={sub.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                                    🔗 सबमिट फ़ाइल / लिंक खोलें ↗
                                  </a>
                                </div>
                              )}
                              {sub.remarks && (
                                <div style={{ marginTop: '3px', fontStyle: 'italic', color: '#334155' }}>
                                  💬 छात्र नोट: "{sub.remarks}"
                                </div>
                              )}
                            </div>

                            {historyList.length > 0 && (
                              <div style={{ marginTop: '6px', paddingTop: '6px', borderTop: `1px dashed ${THEME.cardBorder}` }}>
                                <button
                                  type="button"
                                  onClick={() => setExpandedSubHwId(isExpanded ? null : subKey)}
                                  style={{ background: 'transparent', border: 'none', color: THEME.primary, fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                                >
                                  📜 पूर्व सबमिशन इतिहास ({historyList.length} पुराने प्रयास) {isExpanded ? '▲ छुपाएं' : '▼ देखें'}
                                </button>

                                {isExpanded && (
                                  <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    {historyList.map((hist, hIdx) => (
                                      <div key={hIdx} style={{ background: THEME.softBg, padding: '5px 8px', borderRadius: '4px', border: `1px solid ${THEME.cardBorder}`, fontSize: '11px' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                          <span>प्रयास #{hIdx + 1}</span>
                                          <span>{hist.submittedAt ? new Date(hist.submittedAt).toLocaleString('hi-IN') : ''}</span>
                                        </div>
                                        {hist.fileUrl && (
                                          <a href={hist.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                                            🔗 पुराना अटैचमेंट
                                          </a>
                                        )}
                                        {hist.remarks && <div style={{ color: '#475569' }}>"{hist.remarks}"</div>}
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 4: ID CARD VIEW */}
      {activeTab === 'idcard' && (
        <div style={{ background: '#fff', padding: '20px', borderRadius: '14px', border: `1px solid ${THEME.cardBorder}`, borderTop: `4px solid ${THEME.accentGold}`, boxShadow: '0 4px 14px rgba(217, 119, 6, 0.06)' }}>
          <IDCard user={currentUser} />
        </div>
      )}

      {/* TAB 5: CERTIFICATES VIEW */}
      {activeTab === 'certificates' && (
        <CertificatesPage user={currentUser} userId={currentUserId} />
      )}

      {/* TAB 6: EDIT PROFILE FORM */}
      {activeTab === 'profile' && (
        <div style={{ maxWidth: '650px', margin: '0 auto', background: '#fff', padding: '28px', borderRadius: '14px', border: `1px solid ${THEME.cardBorder}`, borderTop: `4px solid ${THEME.accentGold}`, boxShadow: '0 6px 18px rgba(217, 119, 6, 0.08)' }}>
          <h3 style={{ marginTop: 0, color: THEME.textDark, borderBottom: `2px solid ${THEME.accent}`, paddingBottom: '8px', fontWeight: '800' }}>
            ✏️ मेंटॉर प्रोफाइल अपडेट करें
          </h3>

          {msg.text && (
            <div style={{ padding: '10px', borderRadius: '6px', marginBottom: '15px', background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>नाम (Full Name):</label>
              <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} style={goldInputStyle} required />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>ईमेल (Email):</label>
              <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} style={goldInputStyle} disabled />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>फ़ोन नंबर (Phone):</label>
              <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} style={goldInputStyle} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>कॉलेज / संस्थान (College / Organization):</label>
              <input type="text" value={profileForm.collegeOrOrganization} onChange={(e) => setProfileForm({ ...profileForm, collegeOrOrganization: e.target.value })} style={goldInputStyle} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>ग्राम (Village):</label>
              <input type="text" value={profileForm.villageName} onChange={(e) => setProfileForm({ ...profileForm, villageName: e.target.value })} style={goldInputStyle} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>जिला (District):</label>
              <input type="text" value={profileForm.district} onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })} style={goldInputStyle} />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>प्रोफ़ाइल फ़ोटो (Avatar):</label>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', padding: '6px', marginTop: '4px', fontSize: '13px' }} />
            </div>

            <button type="submit" disabled={uploading} style={{ marginTop: '20px', width: '100%', padding: '12px', background: THEME.gradientBtn, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(180, 83, 9, 0.25)' }}>
              {uploading ? 'अपडेट हो रहा है...' : '💾 बदलाव सुरक्षित करें'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 7: FEEDBACK FORM */}
      {activeTab === 'feedback' && (
        <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '28px', borderRadius: '14px', border: `1px solid ${THEME.cardBorder}`, borderTop: `4px solid ${THEME.accentGold}`, boxShadow: '0 6px 18px rgba(217, 119, 6, 0.08)' }}>
          <h3 style={{ marginTop: 0, color: THEME.textDark, borderBottom: `2px solid ${THEME.accent}`, paddingBottom: '8px', fontWeight: '800' }}>
            💬 मेंटॉर फ़ीडबैक एवं सुझाव
          </h3>

          {feedbackMsg.text && (
            <div style={{ padding: '10px', borderRadius: '6px', marginBottom: '15px', background: feedbackMsg.type === 'success' ? '#dcfce7' : '#fee2e2', color: feedbackMsg.type === 'success' ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
              {feedbackMsg.text}
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>श्रेणी (Category):</label>
              <select
                value={feedbackForm.category}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                style={goldInputStyle}
              >
                <option value="Mentor Review">सामान्य मेंटॉर समीक्षा (Mentor Review)</option>
                <option value="Student Feedback">छात्र के संबंध में (Student Feedback)</option>
                <option value="Platform Suggestion">प्लेटफ़ॉर्म सुधार सुझाव</option>
                <option value="Admin Support">प्रशासनिक सहायता (Admin Support)</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>संबद्ध व्यक्ति/विषय का नाम (वैकल्पिक):</label>
              <input
                type="text"
                placeholder="उदा. छात्र का नाम या बैच का नाम"
                value={feedbackForm.targetName}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, targetName: e.target.value })}
                style={goldInputStyle}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>रेटिंग (Rating):</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    style={{ fontSize: '28px', color: star <= feedbackForm.rating ? '#f59e0b' : '#cbd5e1' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={labelStyle}>आपका सुझाव या फ़ीडबैक *</label>
              <textarea
                rows="4"
                placeholder="अपना फ़ीडबैक यहाँ साझा करें..."
                value={feedbackForm.feedbackText}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackText: e.target.value })}
                style={goldInputStyle}
                required
              />
            </div>

            <button
              type="submit"
              disabled={feedbackSubmitting}
              style={{ width: '100%', padding: '12px', background: THEME.gradientBtn, color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(180, 83, 9, 0.25)' }}
            >
              {feedbackSubmitting ? 'सबमिट हो रहा है...' : '🚀 फ़ीडबैक जमा करें'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

// Styling Helpers Matching Website Identity
const tabBtnStyle = (active) => ({
  padding: '10px 18px',
  borderRadius: '8px',
  border: active ? '1px solid #173d35' : '1px solid #e2ebe4',
  background: active ? '#173d35' : '#ffffff',
  color: active ? '#ffffff' : '#547664',
  fontWeight: '700',
  cursor: 'pointer',
  fontSize: '13.5px',
  boxShadow: active ? '0 4px 14px rgba(23, 61, 53, 0.2)' : 'none',
  transition: 'all 0.2s ease',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px'
});

const statCardStyle = {
  background: '#ffffff',
  border: `1px solid ${THEME.cardBorder}`,
  padding: '18px 20px',
  borderRadius: '12px',
  display: 'flex',
  alignItems: 'center',
  gap: '14px',
  boxShadow: '0 4px 16px rgba(31, 61, 48, 0.05)',
  transition: 'all 0.2s ease'
};

const goldSelectStyle = {
  padding: '9px 14px',
  borderRadius: '8px',
  border: '1px solid #dce7d9',
  background: '#ffffff',
  fontSize: '13.5px',
  color: THEME.textDark,
  fontWeight: '600',
  outline: 'none'
};

const goldInputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #dce7d9',
  marginTop: '4px',
  boxSizing: 'border-box',
  fontSize: '14px',
  outline: 'none'
};

const labelStyle = {
  fontSize: '13px',
  fontWeight: 'bold',
  color: THEME.textDark
};

export default MentorDashboard;