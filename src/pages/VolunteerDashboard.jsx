import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { AuthContext, getImageSrc } from '../context/AuthContext';
import CertificatesPage from './CertificatesPage';

import IDCard from '../components/IDCard';
import VideoPlayerModal from '../components/VideoPlayerModal';
import { useLocation } from 'react-router-dom';

const VolunteerDashboard = () => {
  const { user, token, setUser, API } = useContext(AuthContext);
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(location.search).get('tab') || 'schedule');
  const [classes, setClasses] = useState([]);
  const [volunteerLiveSessions, setVolunteerLiveSessions] = useState([]);
  const [liveSessionsLoading, setLiveSessionsLoading] = useState(false);
  const [assignedTasks, setAssignedTasks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Filters
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  // Task Submission States
  const [submissionModal, setSubmissionModal] = useState({ open: false, taskId: null, taskTitle: '' });
  const [submissionFile, setSubmissionFile] = useState(null);
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submittingTask, setSubmittingTask] = useState(false);
  const [taskSubmitMsg, setTaskSubmitMsg] = useState({ text: '', type: '' });

  // Video Player Modal State
  const [selectedVideo, setSelectedVideo] = useState({
    isOpen: false,
    url: '',
    source: '',
    title: ''
  });

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
  const [expandedTaskId, setExpandedTaskId] = useState(null);

  // Feedback Form State
  const [feedbackForm, setFeedbackForm] = useState({
    category: 'General Suggestion',
    targetName: '',
    rating: 5,
    feedbackText: ''
  });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  // Fallback User Retrieval
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser?._id || currentUser?.id;

  // ➔ FIXED 1: Volunteer-relevant batches
  const fetchBatches = useCallback(async () => {
    try {
      const res = await API.get('/programs?entryType=class');
      const allBatches = Array.isArray(res.data) ? res.data : [];
      const relevant = allBatches.filter(b => {
        const aud = (b.targetAudience || '').toLowerCase();
        const audType = b.audienceType || '';
        return aud.includes('volunteer') || aud.includes('open to all') || aud.includes('all-hands') || audType === 'open_to_all' || audType === 'special_event';
      });
      setBatches(relevant);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  }, [API]);

  // ➔ FIXED 2: Volunteer Schedule fetching with proper volunteer isolation
  const fetchVolunteerSchedule = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatch) params.append('programId', selectedBatch);
      if (selectedSubject) params.append('subject', selectedSubject);

      const res = await API.get(`/classes?${params.toString()}`);
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching schedule:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, selectedBatch, selectedSubject, API]);

  // ➔ FIXED 3: Fetch Volunteer Role-wise Live Sessions
  const fetchVolunteerLiveSessions = useCallback(async () => {
    setLiveSessionsLoading(true);
    try {
      const res = await API.get('/classes/public?entryType=session');
      const allSessions = Array.isArray(res.data) ? res.data : [];
      const relevant = allSessions.filter(s => {
        const aud = (s.targetAudience || '').toLowerCase();
        const isAssigned = String(s.primaryVolunteer?._id || s.primaryVolunteer || '') === String(currentUserId);
        return isAssigned || aud.includes('volunteer') || aud.includes('open to all') || aud.includes('all-hands') || !aud;
      });
      setVolunteerLiveSessions(relevant);
    } catch (err) {
      console.error('Error fetching volunteer live sessions:', err);
    } finally {
      setLiveSessionsLoading(false);
    }
  }, [currentUserId, API]);

  // ➔ FIXED 4: Assigned Tasks (Strictly filtered: never display student homework)
  const fetchAssignedTasks = useCallback(async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams({ volunteerId: currentUserId });
      if (selectedBatch) params.append('programId', selectedBatch);
      if (selectedSubject) params.append('subject', selectedSubject);

      const res = await API.get(`/homework?${params.toString()}`);
      const rawTasks = Array.isArray(res.data) ? res.data : [];
      const volunteerTasks = rawTasks.filter(t => {
        if (t.targetRole === 'student' || t.targetRole === 'guest') return false;
        const isDirectVolunteer = t.targetRole === 'volunteer' || t.targetRole === 'all' ||
          (Array.isArray(t.assignedVolunteers) && t.assignedVolunteers.some(v => String(v._id || v) === String(currentUserId)));
        const batchAud = (t.programId?.targetAudience || '').toLowerCase();
        const isBatchVolunteer = batchAud.includes('volunteer') || batchAud.includes('open to all') || batchAud.includes('all-hands');
        return isDirectVolunteer || isBatchVolunteer;
      });
      setAssignedTasks(volunteerTasks);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUserId, selectedBatch, selectedSubject, API]);

  // Sync Profile on Mount
  useEffect(() => {
    const fetchVolunteerProfile = async () => {
      if (!token) return;
      try {
        const res = await API.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error('Error fetching volunteer profile:', err);
      }
    };

    fetchVolunteerProfile();
    fetchBatches();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // Sync Active Tab Data
  useEffect(() => {
    if (activeTab === 'schedule') fetchVolunteerSchedule();
    if (activeTab === 'live_sessions') fetchVolunteerLiveSessions();
    if (activeTab === 'tasks') fetchAssignedTasks();
  }, [activeTab, fetchVolunteerSchedule, fetchVolunteerLiveSessions, fetchAssignedTasks]);

  // STRICT FILTERING: Only show classes where primary mentor (or alternative mentor) is assigned!
  const mentorAssignedClasses = useMemo(() => {
    return classes.filter(cls => {
      const hasPrimary = Boolean(cls.primaryMentor?._id || cls.primaryMentor);
      const hasAlt = Array.isArray(cls.alternativeMentors) && cls.alternativeMentors.length > 0;
      return hasPrimary || hasAlt;
    });
  }, [classes]);

  // ➔ FIXED 5: User sync without triggering infinite re-renders
  useEffect(() => {
    if (currentUser && currentUser._id) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || currentUser.whatsappPhone || currentUser.callingPhone || '',
        collegeOrOrganization: currentUser.collegeOrOrganization || currentUser.college || currentUser.organization || '',
        villageName: currentUser.villageName || currentUser.village || '',
        district: currentUser.district || '',
        instagram: currentUser.instagram || '',
        linkedin: currentUser.linkedin || '',
        snapchat: currentUser.snapchat || ''
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser?._id]);

  const handleTaskSubmit = async (e) => {
    e.preventDefault();
    setSubmittingTask(true);
    setTaskSubmitMsg({ text: '', type: '' });

    try {
      const formData = new FormData();
      formData.append('taskId', submissionModal.taskId);
      formData.append('volunteerId', currentUserId);
      formData.append('notes', submissionNotes);
      if (submissionFile) {
        formData.append('submissionFile', submissionFile);
      }

      await API.post('/homework/submit-task', formData);

      setTaskSubmitMsg({ text: 'कार्य सफलतापूर्वक सबमिट कर दिया गया है! 🎉', type: 'success' });
      setTimeout(() => {
        setSubmissionModal({ open: false, taskId: null, taskTitle: '' });
        setSubmissionFile(null);
        setSubmissionNotes('');
        setTaskSubmitMsg({ text: '', type: '' });
        fetchAssignedTasks();
      }, 1500);
    } catch (err) {
      setTaskSubmitMsg({ text: err.response?.data?.error || 'सबमिशन में त्रुटि आई।', type: 'error' });
    } finally {
      setSubmittingTask(false);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
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

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    setFeedbackSubmitting(true);
    setFeedbackMsg({ text: '', type: '' });

    try {
      const payload = {
        userId: currentUserId,
        userName: currentUser?.name || '',
        userEmail: currentUser?.email || '',
        userRole: 'Volunteer',
        userAvatar: currentUser?.avatar || '',
        category: feedbackForm.category,
        targetName: feedbackForm.targetName,
        rating: feedbackForm.rating,
        feedbackText: feedbackForm.feedbackText
      };

      await API.post('/feedback', payload);

      setFeedbackMsg({ text: 'आपका फ़ीडबैक सफलतापूर्वक दर्ज कर लिया गया है! धन्यवाद। 🙏', type: 'success' });
      setFeedbackForm({
        category: 'General Suggestion',
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

  const volunteerIdDisplay = currentUser?.volunteerId || currentUser?.uniqueVolunteerId || currentUser?.uniqueId || (currentUserId ? `VOL-${currentUserId.substring(0, 6).toUpperCase()}` : 'VOLUNTEER');

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
            🤝 अधिकृत वॉलंटियर पोर्टल • VERIFIED VOLUNTEER PORTAL
          </span>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', margin: '4px 0 8px 0' }}>
            नमस्ते, {currentUser?.name || 'Volunteer'}! 🤝
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="dashboard-hero-badge">
              <strong>Volunteer ID:</strong> {volunteerIdDisplay}
            </span>
            <span className="dashboard-hero-badge" style={{ background: 'rgba(232, 179, 90, 0.18)' }}>
              🏛️ {currentUser?.collegeOrOrganization || currentUser?.college || 'अव्युक्त सेवा दल'}
            </span>
          </div>
        </div>
        <div>
          <img 
            src={getImageSrc(currentUser?.avatar) || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'} 
            alt="Profile" 
            className="dashboard-avatar"
            onError={(e) => { e.target.src = 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'; }}
          />
        </div>
      </div>

      {/* Main Navigation Tabs */}
      <div className="dashboard-tabs-bar">
        <button onClick={() => setActiveTab('schedule')} style={tabBtnStyle(activeTab === 'schedule')}>📅 मेरी सेशंस / क्लासेस</button>
        <button onClick={() => setActiveTab('live_sessions')} style={tabBtnStyle(activeTab === 'live_sessions')}>🔴 लाइव सत्र (Live Sessions)</button>
        <button onClick={() => setActiveTab('tasks')} style={tabBtnStyle(activeTab === 'tasks')}>📋 असाइन किए गए टास्क</button>
        <button onClick={() => setActiveTab('idcard')} style={tabBtnStyle(activeTab === 'idcard')}>🪪 डिजिटल ID कार्ड</button>
        <button onClick={() => setActiveTab('certificates')} style={tabBtnStyle(activeTab === 'certificates')}>🏆 सर्टिफिकेट्स</button>
        <button onClick={() => setActiveTab('profile')} style={tabBtnStyle(activeTab === 'profile')}>✏️ एडिट प्रोफाइल</button>
        <button onClick={() => setActiveTab('feedback')} style={tabBtnStyle(activeTab === 'feedback')}>💬 फ़ीडबैक दें</button>
      </div>

      {/* Filter Bar */}
      {(activeTab === 'schedule' || activeTab === 'tasks') && (
        <div className="dashboard-filter-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 'bold', color: '#173d35', fontSize: '13.5px' }}>🔍 फ़िल्टर:</span>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center' }}>
            <select value={selectedBatch} onChange={(e) => setSelectedBatch(e.target.value)} style={selectStyle}>
              <option value="">-- सभी बैच (All Batches) --</option>
              {batches.map(b => (
                <option key={b._id} value={b._id}>{b.title}</option>
              ))}
            </select>

            <select value={selectedSubject} onChange={(e) => setSelectedSubject(e.target.value)} style={selectStyle}>
              <option value="">-- सभी विषय (All Subjects) --</option>
              <option value="Maths">गणित (Maths)</option>
              <option value="Science">विज्ञान (Science)</option>
              <option value="English">अंग्रेजी (English)</option>
              <option value="Hindi">हिंदी (Hindi)</option>
              <option value="Social Studies">सामाजिक विज्ञान (SST)</option>
            </select>
          </div>
        </div>
      )}

      {/* TAB 1: SCHEDULE VIEW */}
      {activeTab === 'schedule' && (
        <div>
          {/* Interactive Batch Selector Cards */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '18px' }}>🎯 बैच अनुसार सेशंस (Batch-wise Sessions)</h3>
              <span style={{ fontSize: '13px', color: '#547664' }}>बैच चुनकर केवल उस बैच के सेशंस देखें</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
              {/* All Batches Option */}
              <div 
                onClick={() => setSelectedBatch('')}
                style={{
                  cursor: 'pointer',
                  padding: '14px 16px',
                  borderRadius: '10px',
                  background: selectedBatch === '' ? '#e9f0e6' : '#fff',
                  border: selectedBatch === '' ? '2px solid #173d35' : '1px solid #e2ebe4',
                  boxShadow: selectedBatch === '' ? '0 4px 12px rgba(23,61,53,0.15)' : '0 2px 4px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '20px' }}>🌐</span>
                  {selectedBatch === '' && (
                    <span className="dashboard-badge dashboard-badge-mint">सक्रिय</span>
                  )}
                </div>
                <h4 style={{ margin: '8px 0 2px 0', fontSize: '14px', color: '#173d35' }}>सभी बैच (All Batches)</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#547664' }}>कुल {mentorAssignedClasses.length} सेशंस</p>
              </div>

              {/* Dynamic Batch Cards */}
              {batches.map(b => {
                const isSelected = selectedBatch === b._id;
                const batchClassCount = mentorAssignedClasses.filter(c => (c.programId?._id || c.programId) === b._id).length;
                return (
                  <div 
                    key={b._id}
                    onClick={() => setSelectedBatch(isSelected ? '' : b._id)}
                    style={{
                      cursor: 'pointer',
                      padding: '14px 16px',
                      borderRadius: '10px',
                      background: isSelected ? '#e9f0e6' : '#fff',
                      border: isSelected ? '2px solid #173d35' : '1px solid #e2ebe4',
                      boxShadow: isSelected ? '0 4px 12px rgba(23,61,53,0.15)' : '0 2px 4px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '18px' }}>◈</span>
                      {isSelected && (
                        <span className="dashboard-badge dashboard-badge-mint">सक्रिय</span>
                      )}
                    </div>
                    <h4 style={{ margin: '8px 0 2px 0', fontSize: '14px', color: isSelected ? '#173d35' : '#1e293b' }}>{b.title}</h4>
                    <p style={{ margin: 0, fontSize: '12px', color: '#547664' }}>
                      {b.category || b.targetAudience || b.audienceType || 'प्रोग्राम'} {b.totalClassesCount ? `• ${b.totalClassesCount} कक्षाएं` : (batchClassCount > 0 ? `• ${batchClassCount} सेशंस` : '')}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <h4 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '17px' }}>
              📅 {selectedBatch ? `बैच के सेशंस (${mentorAssignedClasses.length})` : `आपकी सभी निर्धारित सेशंस (${mentorAssignedClasses.length})`}
            </h4>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#547664' }}>लोड हो रहा है...</p>
          ) : mentorAssignedClasses.length === 0 ? (
            <div style={{ background: '#fff', padding: '30px', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
              <span style={{ fontSize: '32px' }}>🤝</span>
              <p style={{ margin: '10px 0 0 0', color: '#547664' }}>फिलहाल आपके लिए कोई सेशन निर्धारित नहीं है।</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {mentorAssignedClasses.map(cls => (
                <div key={cls._id} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span className="dashboard-badge dashboard-badge-mint">
                        🎯 {cls.programId?.title || 'General Batch'}
                      </span>
                      <span className={`dashboard-badge ${cls.status === 'live' ? 'dashboard-badge-red' : cls.status === 'completed' ? 'dashboard-badge-mint' : 'dashboard-badge-gold'}`}>
                        {cls.status === 'live' ? '🔴 लाइव' : cls.status === 'completed' ? '✅ पूर्ण' : '⏳ आगामी'}
                      </span>
                    </div>

                    <h4 style={{ margin: '8px 0 4px 0', fontSize: '17px', color: '#173d35', fontFamily: 'Georgia, serif', fontWeight: '600' }}>
                      {cls.subject} {cls.dayNumber ? `(Day ${cls.dayNumber})` : ''}
                    </h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#547664', fontWeight: '500' }}>
                      Topic: {cls.meetingTopic || 'Interactive Session'}
                    </p>
                    
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#64748b' }}>
                      📅 {cls.dateTime ? new Date(cls.dateTime).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA'}
                      {cls.durationMinutes ? ` • ⏱️ ${cls.durationMinutes} मिनट` : ''}
                    </p>

                    {/* Dedicated: क्या-क्या सीखा / पाठ विवरण */}
                    <div style={{ background: '#fbfaf5', borderLeft: '4px solid #e8b35a', border: '1px solid #e2ebe4', borderLeftWidth: '4px', padding: '10px 12px', borderRadius: '6px', margin: '12px 0' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#173d35', fontSize: '12px', marginBottom: '4px' }}>
                        <span>💡</span> सत्र उद्देश्य एवं विवरण (Curriculum & Details)
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', color: '#20332b', lineHeight: 1.4 }}>
                        {cls.meetingTopic || 'छात्रों के साथ इंटरैक्टिव सत्र और सहायता कार्य।'}
                      </p>
                      {cls.instructions && (
                        <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#547664', fontStyle: 'italic' }}>
                          📝 निर्देश: {cls.instructions}
                        </p>
                      )}
                    </div>

                    {/* Mentors Assigned */}
                    <div style={{ fontSize: '12.5px', color: '#547664', marginBottom: '8px' }}>
                      {cls.primaryMentor && (
                        <div>🌿 <strong>मार्गदर्शक (Primary):</strong> {cls.primaryMentor.name}</div>
                      )}
                      {Array.isArray(cls.alternativeMentors) && cls.alternativeMentors.length > 0 && (
                        <div style={{ marginTop: '2px', color: '#0369a1' }}>
                          🔷 <strong>सहायक (Alternative):</strong> {cls.alternativeMentors.map(m => m.name || m).join(', ')}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '10px', borderTop: '1px solid #e2ebe4' }}>
                    {cls.jitsiRoom && (
                      <a href={`https://meet.jit.si/${cls.jitsiRoom}`} target="_blank" rel="noreferrer" className="dashboard-btn-gold">
                        🎙️ सत्र में जुड़ें
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
                        className="dashboard-btn-emerald"
                      >
                        ▶ रिकॉर्डिंग देखें
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB: LIVE SESSIONS VIEW */}
      {activeTab === 'live_sessions' && (
        <div>
          <div style={{
            background: 'radial-gradient(circle at 85% 30%, #1e4d43 0%, #173d35 55%, #0d2822 100%)',
            border: '1px solid rgba(232, 179, 90, 0.3)',
            borderRadius: '14px',
            padding: '20px 24px',
            color: '#ffffff',
            marginBottom: '20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
            boxShadow: '0 8px 24px rgba(23, 61, 53, 0.2)'
          }}>
            <div>
              <span className="dashboard-hero-kicker">
                🔴 VOLUNTEER LIVE SESSIONS
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '19px', color: '#ffffff', fontFamily: 'Georgia, serif' }}>
                लाइव सत्र एवं कार्यशालाएं (Volunteer Live Sessions)
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#d1e3d7' }}>
                स्वयंसेवकों एवं मेंटर्स के लिए लाइव कार्यशालाएं। यहाँ से सीधे 1-क्लिक में लाइव सत्र में प्रवेश करें।
              </p>
            </div>
            <button
              type="button"
              onClick={fetchVolunteerLiveSessions}
              className="dashboard-btn-gold"
              style={{ fontSize: '12.5px', padding: '8px 16px' }}
            >
              🔄 रीफ्रेश करें
            </button>
          </div>

          {liveSessionsLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#547664' }}>लाइव सत्र लोड हो रहे हैं...</div>
          ) : volunteerLiveSessions.length === 0 ? (
            <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1', color: '#547664' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔴</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#173d35', fontFamily: 'Georgia, serif' }}>अभी कोई सक्रिय लाइव सत्र उपलब्ध नहीं है</h4>
              <p style={{ margin: 0, fontSize: '13px' }}>आगामी लाइव सत्रों के शेड्यूल की जानकारी यहाँ प्रदर्शित होगी।</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {volunteerLiveSessions.map((cls) => {
                const sDate = cls.dateTime ? new Date(cls.dateTime) : null;
                const isToday = sDate && (new Date().toDateString() === sDate.toDateString());
                const isLive = cls.status === 'live';
                const isCompleted = cls.status === 'completed';

                return (
                  <div
                    key={cls._id}
                    className="dashboard-card"
                    style={{
                      borderTop: isLive ? '4px solid #ef4444' : '4px solid #173d35',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span className="dashboard-badge dashboard-badge-red">
                          सत्र {cls.sessionNumber || 1}
                        </span>
                        <span className={`dashboard-badge ${isLive ? 'dashboard-badge-red' : isCompleted ? 'dashboard-badge-mint' : isToday ? 'dashboard-badge-gold' : 'dashboard-badge-blue'}`}>
                          {isLive ? '🔴 LIVE' : isCompleted ? '✓ सम्पन्न' : isToday ? '📅 आज' : '⏰ आगामी'}
                        </span>
                      </div>

                      <h4 style={{ margin: '0 0 6px 0', fontSize: '17px', color: '#173d35', fontFamily: 'Georgia, serif', fontWeight: '600' }}>
                        {cls.meetingTopic || cls.subject}
                      </h4>

                      <div style={{ fontSize: '12.5px', color: '#547664', marginBottom: '8px' }}>
                        📅 {sDate ? sDate.toLocaleDateString('hi-IN', { weekday: 'short', day: 'numeric', month: 'short' }) : 'TBA'}
                        {' '}• ⏰ {sDate ? sDate.toLocaleTimeString('hi-IN', { hour: '2-digit', minute: '2-digit' }) : '10:00 AM'}
                      </div>

                      <div style={{ fontSize: '12.5px', color: '#173d35', fontWeight: '600', marginBottom: '14px' }}>
                        🎙️ वक्ता / मेंटर: {cls.primaryMentor?.name || 'संस्था टीम'}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid #e2ebe4', paddingTop: '12px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {/* Recording button */}
                      {(cls.youtubeUrl || cls.recordingUrl || cls.driveUrl) && (
                        <button
                          type="button"
                          onClick={() => setSelectedVideo({
                            isOpen: true,
                            url: cls.youtubeUrl || cls.recordingUrl || cls.driveUrl,
                            source: cls.youtubeUrl ? 'youtube' : (cls.recordingSource || 'googledrive'),
                            title: cls.meetingTopic || cls.subject
                          })}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            background: '#059669',
                            color: '#fff',
                            border: 'none',
                            padding: '8px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px',
                            fontWeight: 'bold'
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
          )}
        </div>
      )}

      {/* TAB 2: ASSIGNED TASKS */}
      {activeTab === 'tasks' && (
        <div>
          {/* Metric Summary Cards */}
          {(() => {
            const totalCount = assignedTasks.length;
            const submittedCount = assignedTasks.filter(t => t.submissions?.some(s => String(s.studentId?._id || s.studentId || '') === String(currentUserId))).length;
            const pendingCount = totalCount - submittedCount;

            return (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="dashboard-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e9f0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>📌</div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#718078', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>कुल कार्य (Total Tasks)</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#173d35', marginTop: '2px', fontFamily: 'Georgia, serif' }}>{totalCount}</div>
                  </div>
                </div>
                <div className="dashboard-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#e9f0e6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>✅</div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#166534', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>सबमिट किए गए (Submitted)</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#166534', marginTop: '2px', fontFamily: 'Georgia, serif' }}>{submittedCount}</div>
                  </div>
                </div>
                <div className="dashboard-card" style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ width: '46px', height: '46px', borderRadius: '12px', background: '#fefce8', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px' }}>⏳</div>
                  <div>
                    <span style={{ fontSize: '11.5px', color: '#b45309', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>बाकी कार्य (Pending)</span>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: '#b45309', marginTop: '2px', fontFamily: 'Georgia, serif' }}>{pendingCount}</div>
                  </div>
                </div>
              </div>
            );
          })()}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
            <h3 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '20px' }}>📋 आपको सौंपे गए कार्य व टास्क</h3>
          </div>

          {loading ? (
            <p style={{ textAlign: 'center', padding: '20px', color: '#718078' }}>लोड हो रहा है...</p>
          ) : assignedTasks.length === 0 ? (
            <div className="dashboard-card" style={{ padding: '40px', borderRadius: '14px', textAlign: 'center' }}>
              <span style={{ fontSize: '36px' }}>📝</span>
              <p style={{ margin: '12px 0 0 0', color: '#547664', fontWeight: '600' }}>कोई पेंडिंग कार्य नहीं मिला।</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
              {assignedTasks.map(task => {
                const mySub = task.submissions?.find(s => String(s.studentId?._id || s.studentId || '') === String(currentUserId));
                const isSubmitted = !!mySub;
                const historyList = mySub?.history || [];

                return (
                  <div key={task._id} className="dashboard-card" style={{ padding: '22px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span className="dashboard-badge badge-mint" style={{ fontSize: '12px' }}>{task.subject}</span>
                        <span className={`dashboard-badge ${isSubmitted ? 'badge-mint' : 'badge-gold'}`}>
                          {isSubmitted ? `✔ सबमिट (${historyList.length + 1} बार)` : '⏳ बाकी है'}
                        </span>
                      </div>

                      <h4 style={{ margin: '12px 0 6px 0', fontSize: '17px', color: '#173d35', fontFamily: 'Georgia, serif', fontWeight: '700' }}>{task.title}</h4>
                      <p style={{ fontSize: '13.5px', color: '#547664', margin: '0 0 10px 0', lineHeight: 1.5 }}>
                        {task.description || 'कोई विवरण नहीं दिया गया है।'}
                      </p>
                      
                      <p style={{ fontSize: '12.5px', color: '#b91c1c', margin: '0 0 10px 0', fontWeight: '700' }}>
                        ⏰ अंतिम तिथि: {task.deadline ? new Date(task.deadline).toLocaleDateString('hi-IN') : 'N/A'}
                      </p>

                      {task.attachmentUrl && (
                        <a href={task.attachmentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '12.5px', color: '#1e4d43', fontWeight: '700', textDecoration: 'underline', display: 'inline-block', marginBottom: '10px' }}>
                          📎 अटैचमेंट फ़ाइल देखें ↗
                        </a>
                      )}

                      {/* Submitted Box if submitted */}
                      {isSubmitted && (
                        <div style={{ background: '#f8faf9', padding: '12px', borderRadius: '8px', border: '1px solid #dce7d9', marginTop: '10px', fontSize: '12.5px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#166534', fontWeight: '700' }}>
                            <span>🌟 नवीनतम सबमिशन:</span>
                            <span style={{ fontSize: '11px', color: '#718078' }}>{mySub.submittedAt ? new Date(mySub.submittedAt).toLocaleString('hi-IN') : 'हाल ही में'}</span>
                          </div>
                          {mySub.fileUrl && (
                            <div style={{ marginTop: '6px' }}>
                              <a href={mySub.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#1e4d43', fontWeight: '700', textDecoration: 'underline' }}>
                                🔗 सबमिट फ़ाइल देखें ↗
                              </a>
                            </div>
                          )}
                          {mySub.remarks && (
                            <p style={{ margin: '6px 0 0 0', color: '#2b3f36' }}>💬 {mySub.remarks}</p>
                          )}

                          {historyList.length > 0 && (
                            <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #dce7d9' }}>
                              <button
                                type="button"
                                onClick={() => setExpandedTaskId(expandedTaskId === task._id ? null : task._id)}
                                style={{ background: 'transparent', border: 'none', color: '#173d35', fontSize: '11.5px', fontWeight: '700', cursor: 'pointer', padding: 0 }}
                              >
                                📜 पूर्व सबमिशन इतिहास ({historyList.length} पुराने प्रयास) {expandedTaskId === task._id ? '▲ छुपाएं' : '▼ देखें'}
                              </button>

                              {expandedTaskId === task._id && (
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
                        </div>
                      )}
                    </div>

                    <button 
                      onClick={() => setSubmissionModal({ open: true, taskId: task._id, taskTitle: task.title })}
                      className={isSubmitted ? "dashboard-btn-secondary" : "dashboard-btn-emerald"}
                      style={{ 
                        width: '100%', 
                        marginTop: '16px',
                        justifyContent: 'center'
                      }}
                    >
                      {isSubmitted ? '🔄 पुनः सबमिट करें (Resubmit)' : '📤 सबमिशन जमा करें (Photo / PDF)'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DIGITAL ID CARD */}
      {activeTab === 'idcard' && (
        <div className="dashboard-card" style={{ padding: '24px', display: 'flex', justifyContent: 'center' }}>
          <IDCard user={currentUser} />
        </div>
      )}

      {/* TAB 4: CERTIFICATES VIEW */}
      {activeTab === 'certificates' && (
        <CertificatesPage user={currentUser} userId={currentUserId} />
      )}

      {/* TAB 5: EDIT PROFILE */}
      {activeTab === 'profile' && (
        <div className="dashboard-card" style={{ maxWidth: '680px', margin: '0 auto', padding: '32px' }}>
          <div style={{ borderBottom: '1px solid #e2ebe4', paddingBottom: '16px', marginBottom: '22px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#e8b35a', textTransform: 'uppercase', letterSpacing: '0.14em' }}>VOLUNTEER ACCOUNT</span>
            <h3 style={{ margin: '4px 0 0 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '24px' }}>✏️ वॉलंटियर प्रोफाइल अपडेट करें</h3>
          </div>

          {msg.text && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', background: msg.type === 'success' ? '#e9f0e6' : '#fee2e2', color: msg.type === 'success' ? '#166534' : '#991b1b', fontWeight: '700', fontSize: '13.5px', border: `1px solid ${msg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>📷 प्रोफाइल फोटो चुनें:</label>
              <input type="file" accept="image/*" onChange={handleFileChange} style={{ ...inputStyle, padding: '8px' }} />
              {currentUser?.avatar && <p style={{ fontSize: '12px', color: '#166534', margin: '4px 0 0 0', fontWeight: '600' }}>✔ फोटो अपलोड है</p>}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div>
                <label style={labelStyle}>नाम (Name):</label>
                <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>ईमेल ID (Email):</label>
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} style={inputStyle} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
              <div>
                <label style={labelStyle}>मोबाइल नंबर (Phone):</label>
                <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>कॉलेज / संस्था (College / Org):</label>
                <input type="text" value={profileForm.collegeOrOrganization} onChange={(e) => setProfileForm({ ...profileForm, collegeOrOrganization: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginTop: '14px' }}>
              <div>
                <label style={labelStyle}>गांव / शहर (Village/Town):</label>
                <input type="text" value={profileForm.villageName} onChange={(e) => setProfileForm({ ...profileForm, villageName: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>जिला (District):</label>
                <input type="text" value={profileForm.district} onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })} style={inputStyle} />
              </div>
            </div>

            <h4 style={{ margin: '22px 0 10px 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '17px' }}>🌐 सोशल मीडिया लिंक्स (Optional)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={labelStyle}>Instagram:</label>
                <input type="text" value={profileForm.instagram} onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })} style={inputStyle} placeholder="@handle" />
              </div>
              <div>
                <label style={labelStyle}>LinkedIn:</label>
                <input type="text" value={profileForm.linkedin} onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })} style={inputStyle} placeholder="URL" />
              </div>
              <div>
                <label style={labelStyle}>Snapchat:</label>
                <input type="text" value={profileForm.snapchat} onChange={(e) => setProfileForm({ ...profileForm, snapchat: e.target.value })} style={inputStyle} placeholder="Username" />
              </div>
            </div>

            <button type="submit" disabled={uploading} className="dashboard-btn-emerald" style={{ marginTop: '24px', width: '100%', padding: '13px', justifyContent: 'center', fontSize: '15px' }}>
              {uploading ? 'सेव हो रहा है...' : '💾 प्रोफाइल अपडेट करें'}
            </button>
          </form>
        </div>
      )}

      {/* TAB 6: GIVE FEEDBACK FORM */}
      {activeTab === 'feedback' && (
        <div className="dashboard-card" style={{ maxWidth: '680px', margin: '0 auto', padding: '32px' }}>
          <div style={{ borderBottom: '1px solid #e2ebe4', paddingBottom: '16px', marginBottom: '22px' }}>
            <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#e8b35a', textTransform: 'uppercase', letterSpacing: '0.14em' }}>SHARE YOUR VOICE</span>
            <h3 style={{ margin: '4px 0 0 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '24px' }}>💬 वॉलंटियर फ़ीडबैक एवं सुझाव</h3>
          </div>

          {feedbackMsg.text && (
            <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', background: feedbackMsg.type === 'success' ? '#e9f0e6' : '#fee2e2', color: feedbackMsg.type === 'success' ? '#166534' : '#991b1b', fontWeight: '700', fontSize: '13.5px', border: `1px solid ${feedbackMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
              {feedbackMsg.text}
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>फ़ीडबैक श्रेणी (Category):</label>
              <select
                value={feedbackForm.category}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                style={inputStyle}
              >
                <option value="General Suggestion">सामान्य सुझाव (General Suggestion)</option>
                <option value="Event Review">इवेंट का अनुभव (Event Review)</option>
                <option value="Class/Session Review">सेशन का अनुभव (Session Review)</option>
                <option value="Issue/Complaint">समस्या या शिकायत (Issue/Complaint)</option>
                <option value="Mentor Review">मेंटॉर का रिव्यू (Mentor Review)</option>
              </select>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>संबंधित विषय / बैच / प्रोग्राम (Target Name):</label>
              <input
                type="text"
                placeholder="उदा. Batch B, Weekend Campaign..."
                value={feedbackForm.targetName}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, targetName: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>रेटिंग (Rating):</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '6px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    style={{ fontSize: '28px', color: star <= feedbackForm.rating ? '#e8b35a' : '#dce7d9', transition: 'color 0.2s' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>आपका सुझाव या फ़ीडबैक *</label>
              <textarea
                rows="4"
                placeholder="अपना अनुभव या सुझाव साझा करें..."
                value={feedbackForm.feedbackText}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackText: e.target.value })}
                style={inputStyle}
                required
              />
            </div>

            <button
              type="submit"
              disabled={feedbackSubmitting}
              className="dashboard-btn-gold"
              style={{ width: '100%', padding: '13px', justifyContent: 'center', fontSize: '15px' }}
            >
              {feedbackSubmitting ? 'सबमिट हो रहा है...' : '🚀 फ़ीडबैक जमा करें'}
            </button>
          </form>
        </div>
      )}

      {/* TASK SUBMISSION MODAL */}
      {submissionModal.open && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 36, 29, 0.65)', backdropFilter: 'blur(4px)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '16px' }}>
          <div className="dashboard-card" style={{ padding: '28px', width: '100%', maxWidth: '520px', boxShadow: '0 20px 40px rgba(0,0,0,0.2)' }}>
            <h3 style={{ marginTop: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '20px' }}>📤 सबमिशन: {submissionModal.taskTitle}</h3>

            {taskSubmitMsg.text && (
              <div style={{ padding: '10px 14px', borderRadius: '8px', marginBottom: '14px', background: taskSubmitMsg.type === 'success' ? '#e9f0e6' : '#fee2e2', color: taskSubmitMsg.type === 'success' ? '#166534' : '#991b1b', fontSize: '13px', fontWeight: '700' }}>
                {taskSubmitMsg.text}
              </div>
            )}

            <form onSubmit={handleTaskSubmit}>
              <div style={{ marginBottom: '14px' }}>
                <label style={labelStyle}>फाइल संलग्न करें (Photo/PDF):</label>
                <input type="file" onChange={(e) => setSubmissionFile(e.target.files?.[0] || null)} style={inputStyle} />
              </div>

              <div style={{ marginBottom: '18px' }}>
                <label style={labelStyle}>टिप्पणी / नोट्स (Notes):</label>
                <textarea rows="3" value={submissionNotes} onChange={(e) => setSubmissionNotes(e.target.value)} placeholder="कार्य के संबंध में कुछ लिखना चाहें..." style={inputStyle} />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setSubmissionModal({ open: false, taskId: null, taskTitle: '' })} className="dashboard-btn-secondary">
                  रद्द करें
                </button>
                <button type="submit" disabled={submittingTask} className="dashboard-btn-emerald">
                  {submittingTask ? 'सबमिट हो रहा है...' : 'सबमिट करें'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

// Styles Matching Website Identity
const tabBtnStyle = (isActive) => ({
  padding: '10px 18px',
  borderRadius: '8px',
  border: isActive ? '1px solid #173d35' : '1px solid #e2ebe4',
  background: isActive ? '#173d35' : '#ffffff',
  color: isActive ? '#ffffff' : '#547664',
  fontWeight: '700',
  cursor: 'pointer',
  fontSize: '13.5px',
  whiteSpace: 'nowrap',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '7px',
  boxShadow: isActive ? '0 4px 14px rgba(23, 61, 53, 0.2)' : 'none',
  transition: 'all 0.2s ease'
});

const selectStyle = {
  padding: '9px 14px',
  borderRadius: '8px',
  border: '1px solid #dce7d9',
  fontSize: '13.5px',
  color: '#173d35',
  fontWeight: '600',
  outline: 'none',
  background: '#ffffff'
};

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: 'bold',
  color: '#173d35',
  marginBottom: '4px'
};

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: '8px',
  border: '1px solid #dce7d9',
  fontSize: '14px',
  outline: 'none',
  background: '#ffffff',
  boxSizing: 'border-box'
};

export default VolunteerDashboard;