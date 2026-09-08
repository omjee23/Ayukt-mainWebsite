import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import { AuthContext, getImageSrc, DEFAULT_AVATAR } from '../context/AuthContext';
import IDCard from '../components/IDCard';


import CertificatesPage from './CertificatesPage';
import VideoPlayerModal from '../components/VideoPlayerModal';
import { useLocation } from 'react-router-dom';

const StudentDashboard = () => {
  const { user, token, setUser, API } = useContext(AuthContext);
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => new URLSearchParams(location.search).get('tab') || 'classes');
  const [classes, setClasses] = useState([]);
  const [homeworks, setHomeworks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [loading, setLoading] = useState(false);

  // Video Player Modal State
  const [selectedVideo, setSelectedVideo] = useState({
    isOpen: false,
    url: '',
    source: '',
    title: ''
  });

  // Fallback User Handling
  const currentUser = user || JSON.parse(localStorage.getItem('user') || '{}');
  const currentUserId = currentUser?._id || currentUser?.id || localStorage.getItem('userId');

  // Filters & Schedule View
  const [selectedBatch, setSelectedBatch] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [classSearch, setClassSearch] = useState('');
  const [classViewMode, setClassViewMode] = useState('batch'); // 'batch' (default) vs 'all'
  const [visibleClassCount, setVisibleClassCount] = useState(6);

  // Smart Attendance & Live Session State
  const [liveSession, setLiveSession] = useState({
    isActive: false,
    classId: null,
    className: '',
    jitsiRoom: '',
    elapsedMinutes: 0,
    status: 'INCOMPLETE'
  });
  const [attendanceMap, setAttendanceMap] = useState({});

  // Student Role-wise Live Sessions
  const [studentLiveSessions, setStudentLiveSessions] = useState([]);
  const [liveSessionsLoading, setLiveSessionsLoading] = useState(false);

  // Community Feed & Post States
  const [communityPosts, setCommunityPosts] = useState([]);
  const [postForm, setPostForm] = useState({ title: '', content: '', category: 'जिज्ञासा / सवाल' });
  const [postMsg, setPostMsg] = useState('');
  const [postingLoading, setPostingLoading] = useState(false);

  // Opportunities & Exams Bulletin State
  const [opportunities, setOpportunities] = useState([]);

  // Recording Category Switcher: 'study' (Batch Curriculum) vs 'events' (Events & Programs)
  const [recordingCategory, setRecordingCategory] = useState('study');
  const [recordedEvents, setRecordedEvents] = useState([]);

  // Edit Profile States
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: '',
    phone: '',
    studentClass: '',
    schoolName: '',
    villageName: '',
    district: '',
    instagram: '',
    linkedin: '',
    snapchat: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  // Homework Submission States
  const [submittingHwId, setSubmittingHwId] = useState(null);
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [submissionRemark, setSubmissionRemark] = useState('');
  const [hwSubFile, setHwSubFile] = useState(null);
  const [submittingHwProgress, setSubmittingHwProgress] = useState(false);
  const [expandedHistoryId, setExpandedHistoryId] = useState(null);

  // Feedback States
  const [feedbackForm, setFeedbackForm] = useState({
    category: 'Class/Session Review',
    targetName: '',
    rating: 5,
    feedbackText: ''
  });
  const [feedbackSubmitting, setFeedbackSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState({ text: '', type: '' });

  // Fetch Programs/Batches (Filtered to regular student-relevant batches)
  const fetchBatches = useCallback(async () => {
    try {
      const res = await API.get('/programs?entryType=class');
      const allBatches = Array.isArray(res.data) ? res.data : [];
      const relevant = allBatches.filter(b => {
        const aud = (b.targetAudience || '').toLowerCase();
        const audType = b.audienceType || '';
        return aud.includes('student') || aud.includes('open to all') || aud.includes('all-hands') || audType === 'open_to_all' || audType === 'special_event' || !aud;
      });
      setBatches(relevant);
    } catch (err) {
      console.error('Error fetching batches:', err);
    }
  }, [API]);

  // Fetch Student Role-wise Live Sessions
  const fetchStudentLiveSessions = useCallback(async () => {
    setLiveSessionsLoading(true);
    try {
      const res = await API.get('/classes/public?entryType=session');
      const allSessions = Array.isArray(res.data) ? res.data : [];
      const relevant = allSessions.filter(s => {
        const aud = s.targetAudience || '';
        return aud.includes('Student') || aud.includes('Open to All') || aud.includes('All-Hands') || !aud;
      });
      setStudentLiveSessions(relevant);
    } catch (err) {
      console.error('Error fetching student live sessions:', err);
    } finally {
      setLiveSessionsLoading(false);
    }
  }, [API]);

  // Fetch User Profile on Mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!token) return;
      try {
        const res = await API.get('/auth/me');
        if (res.data?.user) {
          setUser(res.data.user);
          localStorage.setItem('user', JSON.stringify(res.data.user));
          if (res.data.user._id) localStorage.setItem('userId', res.data.user._id);
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    };

    fetchUserProfile();
    fetchBatches();
  }, [token, setUser, fetchBatches, API]);

  // Sync activeTab with URL Query Parameter (?tab=profile)
  useEffect(() => {
    const tabParam = new URLSearchParams(location.search).get('tab');
    if (tabParam) {
      setActiveTab(tabParam);
    }
  }, [location.search]);


  // Fetch Classes
  const fetchClasses = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatch) params.append('programId', selectedBatch);
      if (selectedSubject) params.append('subject', selectedSubject);

      const res = await API.get(`/classes?${params.toString()}`);
      setClasses(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching classes:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, selectedSubject, API]);

  // Fetch Homework
  const fetchHomework = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedBatch) params.append('programId', selectedBatch);
      if (selectedSubject) params.append('subject', selectedSubject);

      const res = await API.get(`/homework?${params.toString()}`);
      const raw = Array.isArray(res.data) ? res.data : [];
      const studentHws = raw.filter(hw => hw.targetRole !== 'volunteer' && hw.targetRole !== 'guest');
      setHomeworks(studentHws);
    } catch (err) {
      console.error('Error fetching homework:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedBatch, selectedSubject, API]);

  // Fetch Attendance Summary for current student
  const fetchAttendance = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const res = await API.get('/attendance/summary');
      const map = {};
      (res.data?.attendanceList || []).forEach(item => {
        const cId = item.classId?._id || item.classId;
        if (cId) {
          map[cId] = {
            status: item.status,
            durationMinutes: item.durationMinutes || 0
          };
        }
      });
      setAttendanceMap(map);
    } catch (err) {
      console.error('Error fetching student attendance summary:', err);
    }
  }, [API, currentUserId]);

  // --------------------------------------------------------------------------
  // STRICT FILTERING: Only classes where at least one mentor is assigned!
  // Classes without mentors are hidden from students until admin assigns mentors.
  // --------------------------------------------------------------------------
  const hasAssignedMentor = (cls) => {
    const hasPrimary = Boolean(cls.primaryMentor?._id || cls.primaryMentor);
    const hasAlt = Array.isArray(cls.alternativeMentors) && cls.alternativeMentors.length > 0;
    return hasPrimary || hasAlt;
  };

  const mentorAssignedClasses = useMemo(() => {
    return classes.filter(hasAssignedMentor);
  }, [classes]);

  // Batches with scheduled classes count (only counting classes with mentors)
  const studentBatches = useMemo(() => {
    const batchMap = new Map();

    batches.forEach(b => {
      const bId = String(b._id);
      const bClasses = mentorAssignedClasses.filter(c => String(c.programId?._id || c.programId || '') === bId);
      batchMap.set(bId, {
        ...b,
        classCount: bClasses.length,
        classes: bClasses
      });
    });

    mentorAssignedClasses.forEach(c => {
      if (c.programId && c.programId._id) {
        const bId = String(c.programId._id);
        if (!batchMap.has(bId)) {
          const bClasses = mentorAssignedClasses.filter(cls => String(cls.programId?._id || cls.programId || '') === bId);
          batchMap.set(bId, {
            _id: c.programId._id,
            title: c.programId.title || c.className || 'General Batch',
            category: c.programId.category || c.programId.audienceType || 'नियमित बैच',
            totalDays: c.programId.totalDays || bClasses.length,
            classCount: bClasses.length,
            classes: bClasses
          });
        }
      }
    });

    return Array.from(batchMap.values());
  }, [batches, mentorAssignedClasses]);

  const selectedBatchObj = useMemo(() => {
    if (!selectedBatch) return null;
    return studentBatches.find(b => String(b._id) === String(selectedBatch)) ||
      batches.find(b => String(b._id) === String(selectedBatch)) || null;
  }, [selectedBatch, studentBatches, batches]);

  // Active classes for selected batch (or all) and filters
  const activeClasses = useMemo(() => {
    let list = mentorAssignedClasses;
    if (selectedBatch) {
      list = list.filter(c => String(c.programId?._id || c.programId || '') === String(selectedBatch));
    }
    if (selectedSubject) {
      list = list.filter(c => c.subject && c.subject.toLowerCase().includes(selectedSubject.toLowerCase()));
    }
    if (classSearch.trim()) {
      const q = classSearch.toLowerCase().trim();
      list = list.filter(c =>
        (c.subject && c.subject.toLowerCase().includes(q)) ||
        (c.meetingTopic && c.meetingTopic.toLowerCase().includes(q)) ||
        (c.programId?.title && c.programId.title.toLowerCase().includes(q))
      );
    }
    return list;
  }, [mentorAssignedClasses, selectedBatch, selectedSubject, classSearch]);

  const displayedClasses = useMemo(() => {
    return activeClasses.slice(0, visibleClassCount);
  }, [activeClasses, visibleClassCount]);

  const handleSelectBatch = (bId) => {
    setSelectedBatch(bId);
    setVisibleClassCount(6);
  };

  // Smart Attendance Heartbeat Ping every 60 seconds
  useEffect(() => {
    if (!liveSession.isActive || !liveSession.classId) return;

    const interval = setInterval(async () => {
      try {
        const res = await API.post('/attendance/ping', {
          classId: liveSession.classId,
          studentId: currentUserId,
          studentName: currentUser?.name || 'Student'
        });
        if (res.data?.attendance) {
          setLiveSession(prev => ({
            ...prev,
            elapsedMinutes: res.data.attendance.durationMinutes || (prev.elapsedMinutes + 1),
            status: res.data.attendance.status || (res.data.attendance.durationMinutes >= 45 ? 'PRESENT' : 'INCOMPLETE')
          }));
        }
      } catch (err) {
        console.error('Heartbeat attendance ping error:', err);
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [liveSession.isActive, liveSession.classId, API, currentUserId, currentUser?.name]);

  const handleJoinLiveClass = async (cls) => {
    if (!cls._id || !cls.jitsiRoom) return;

    setLiveSession({
      isActive: true,
      classId: cls._id,
      className: cls.subject || 'Live Class',
      jitsiRoom: cls.jitsiRoom,
      elapsedMinutes: 0,
      status: 'INCOMPLETE'
    });

    try {
      const res = await API.post('/attendance/ping', {
        classId: cls._id,
        studentId: currentUserId,
        studentName: currentUser?.name || 'Student'
      });
      if (res.data?.attendance) {
        setLiveSession(prev => ({
          ...prev,
          elapsedMinutes: res.data.attendance.durationMinutes || 0,
          status: res.data.attendance.status || 'INCOMPLETE'
        }));
      }
    } catch (err) {
      console.error('Initial join ping error:', err);
    }

    window.open(`https://meet.jit.si/${cls.jitsiRoom}`, '_blank');
  };

  const handleLeaveLiveClass = async () => {
    if (liveSession.classId) {
      try {
        await API.post('/attendance/leave', {
          classId: liveSession.classId,
          studentId: currentUserId
        });
      } catch (err) {
        console.error('Leave session recording error:', err);
      }
    }
    setLiveSession({
      isActive: false,
      classId: null,
      className: '',
      jitsiRoom: '',
      elapsedMinutes: 0,
      status: 'INCOMPLETE'
    });
    fetchAttendance();
  };

  // Community Posts Fetcher
  const fetchCommunityPosts = useCallback(async () => {
    try {
      const res = await API.get('/community-posts/approved');
      setCommunityPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load community posts:', err);
    }
  }, [API]);

  // Opportunities & Exams Bulletin Fetcher
  const fetchOpportunities = useCallback(async () => {
    try {
      const res = await API.get('/posts/all');
      const opps = (res.data || []).filter(item => {
        const cat = (item.category || '').toLowerCase();
        const t = (item.title || '').toLowerCase();
        return cat.includes('exam') || cat.includes('opportunity') || cat.includes('notice') || t.includes('navodaya') || t.includes('नवोदय') || t.includes('jee') || t.includes('neet') || t.includes('scholarship');
      });
      setOpportunities(opps.length > 0 ? opps : (res.data || []));
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    }
  }, [API]);

  // Recorded Events & Programs Fetcher (Shared Across Dashboards)
  const fetchRecordedEvents = useCallback(async () => {
    try {
      const res = await API.get('/events/all');
      const allEvents = Array.isArray(res.data) ? res.data : [];
      setRecordedEvents(allEvents.filter(e => Boolean(e.youtubeUrl || e.driveUrl)));
    } catch (err) {
      console.error('Failed to load recorded events:', err);
    }
  }, [API]);

  const handleCreateCommunityPost = async (e) => {
    e.preventDefault();
    if (!postForm.title || !postForm.content) return;
    setPostingLoading(true);
    try {
      await API.post('/community-posts/create', {
        title: postForm.title,
        content: postForm.content,
        category: postForm.category,
        authorId: currentUserId,
        authorName: currentUser?.name || 'Student',
        authorRole: 'student'
      });
      setPostMsg('✅ आपकी पोस्ट सबमिट हो गई है! एडमिन अनुमोदन (Approval) के बाद कम्युनिटी फ़ीड में दिखाई देगी।');
      setPostForm({ title: '', content: '', category: 'जिज्ञासा / सवाल' });
      setTimeout(() => setPostMsg(''), 5000);
    } catch (err) {
      alert(err.response?.data?.error || 'पोस्ट सबमिट करने में त्रुटि हुई');
    } finally {
      setPostingLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      const res = await API.post(`/community-posts/${postId}/like`, { userId: currentUserId });
      setCommunityPosts(prev => prev.map(p => p._id === postId ? { ...p, likesCount: res.data.likesCount } : p));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  useEffect(() => {
    if (activeTab === 'classes') {
      fetchClasses();
      fetchAttendance();
    }
    if (activeTab === 'live_sessions') fetchStudentLiveSessions();
    if (activeTab === 'homework') fetchHomework();
    if (activeTab === 'recordings') {
      fetchClasses();
      fetchRecordedEvents();
    }
    if (activeTab === 'opportunities') fetchOpportunities();
    if (activeTab === 'community') fetchCommunityPosts();
  }, [selectedBatch, selectedSubject, activeTab, fetchClasses, fetchHomework, fetchAttendance, fetchOpportunities, fetchCommunityPosts, fetchStudentLiveSessions, fetchRecordedEvents]);

  // Sync Profile State with user Context
  useEffect(() => {
    if (currentUser) {
      setProfileForm({
        name: currentUser.name || '',
        email: currentUser.email || '',
        phone: currentUser.phone || currentUser.whatsappPhone || currentUser.callingPhone || '',
        studentClass: currentUser.studentClass || currentUser.class || '',
        schoolName: currentUser.schoolName || currentUser.school || currentUser.collegeOrOrganization || currentUser.college || '',
        villageName: currentUser.villageName || currentUser.village || '',
        district: currentUser.district || '',
        instagram: currentUser.instagram || '',
        linkedin: currentUser.linkedin || '',
        snapchat: currentUser.snapchat || ''
      });
    }
  }, [user]);

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      setMsg({ text: 'यूजर आईडी उपलब्ध नहीं है! कृपया पुनः लॉगिन करें।', type: 'error' });
      return;
    }

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

  const handleHomeworkSubmit = async (homeworkId) => {
    if (!submissionUrl.trim() && !hwSubFile) {
      alert('कृपया फाइल चुनें या गूगल ड्राइव लिंक दर्ज करें!');
      return;
    }

    if (!currentUserId) {
      alert('यूजर आईडी उपलब्ध नहीं है! कृपया पुनः लॉगिन करें।');
      return;
    }

    setSubmittingHwProgress(true);
    try {
      let finalFileUrl = submissionUrl.trim();

      if (hwSubFile) {
        const formData = new FormData();
        formData.append('avatar', hwSubFile);
        formData.append('userId', currentUserId);

        const uploadRes = await API.post('/auth/upload-avatar', formData);
        finalFileUrl = uploadRes.data.avatar || uploadRes.data.url || uploadRes.data.fileUrl;
      }

      await API.post('/homework/submit', {
        homeworkId,
        studentId: currentUserId,
        fileUrl: finalFileUrl,
        remarks: submissionRemark
      });

      alert('होमवर्क सफलतापूर्वक सबमिट हो गया!');
      setSubmittingHwId(null);
      setSubmissionUrl('');
      setSubmissionRemark('');
      setHwSubFile(null);
      fetchHomework();
    } catch (err) {
      alert('एरर: ' + (err.response?.data?.error || err.message));
    } finally {
      setSubmittingHwProgress(false);
    }
  };

  const handleFeedbackSubmit = async (e) => {
    e.preventDefault();
    if (!currentUserId) {
      setFeedbackMsg({ text: 'यूजर आईडी उपलब्ध नहीं है! कृपया पुनः लॉगिन करें।', type: 'error' });
      return;
    }

    setFeedbackSubmitting(true);
    setFeedbackMsg({ text: '', type: '' });

    try {
      const payload = {
        userId: currentUserId,
        userName: currentUser?.name || '',
        userEmail: currentUser?.email || '',
        userRole: 'Student',
        userAvatar: currentUser?.avatar || '',
        category: feedbackForm.category,
        targetName: feedbackForm.targetName,
        rating: feedbackForm.rating,
        feedbackText: feedbackForm.feedbackText
      };

      await API.post('/feedback', payload);
      setFeedbackMsg({ text: 'आपका फ़ीडबैक सफलतापूर्वक दर्ज कर लिया गया है! धन्यवाद। 🙏', type: 'success' });
      setFeedbackForm({
        category: 'Class/Session Review',
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

  // Helper Styles Matching Website Identity
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
    flexShrink: 0,
    boxShadow: isActive ? '0 4px 14px rgba(23, 61, 53, 0.2)' : 'none',
    transition: 'all 0.2s ease',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '7px'
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
    marginBottom: '4px',
    color: '#173d35'
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 12px',
    borderRadius: '8px',
    border: '1px solid #dce7d9',
    fontSize: '14px',
    boxSizing: 'border-box',
    outline: 'none',
    background: '#ffffff'
  };

  const studentIdDisplay = currentUser?.customId || currentUser?._id?.slice(-6)?.toUpperCase() || 'STUDENT-001';
  const studentClassDisplay = currentUser?.classGrade || 'कक्षा निर्धारित नहीं';
  const schoolOrCollegeDisplay = currentUser?.schoolName || currentUser?.school || currentUser?.collegeOrOrganization || currentUser?.college || 'स्कूल/कॉलेज का नाम दर्ज करें';

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

      {/* Royal Forest Emerald & Gold Header Banner */}
      <div className="dashboard-hero">
        <div>
          <span className="dashboard-hero-kicker">
            🎓 अधिकृत छात्र पोर्टल • VERIFIED STUDENT PORTAL
          </span>
          <h1 style={{ fontSize: 'clamp(22px, 3vw, 28px)', margin: '4px 0 8px 0' }}>
            नमस्ते, {currentUser?.name || 'Student'}! 👋
          </h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="dashboard-hero-badge">
              <strong>ID:</strong> {studentIdDisplay}
            </span>
            <span className="dashboard-hero-badge">
              <strong>Class:</strong> {studentClassDisplay}
            </span>
            <span className="dashboard-hero-badge" style={{ background: 'rgba(232, 179, 90, 0.18)' }}>
              🏫 {schoolOrCollegeDisplay}
            </span>
            <button
              type="button"
              onClick={() => setActiveTab('profile')}
              style={{
                background: activeTab === 'profile' ? '#ffffff' : '#e8b35a',
                color: '#173d35',
                border: 'none',
                padding: '4px 12px',
                borderRadius: '16px',
                fontSize: '12px',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                transition: 'all 0.2s ease'
              }}
            >
              ✏️ एडिट प्रोफाइल
            </button>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
          <img 
            src={getImageSrc(currentUser?.avatar)} 
            alt={currentUser?.name || "Student"} 
            className="dashboard-avatar"
            style={{ cursor: 'pointer' }}
            onClick={() => setActiveTab('profile')}
            title="क्लिक करके प्रोफाइल एडिट करें"
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src = DEFAULT_AVATAR; 
            }}
          />
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '4px 10px',
              fontSize: '11px',
              fontWeight: '700',
              background: activeTab === 'profile' ? '#e8b35a' : 'rgba(255, 255, 255, 0.18)',
              color: activeTab === 'profile' ? '#173d35' : '#ffffff',
              border: '1px solid rgba(232, 179, 90, 0.5)',
              borderRadius: '20px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            ✏️ प्रोफाइल बदलें
          </button>
        </div>
      </div>

      {/* Smart Live Attendance Session Tracker HUD */}
      {liveSession.isActive && (
        <div style={{ 
          marginBottom: '20px', 
          background: 'radial-gradient(circle at 85% 30%, #173d35 0%, #0d2822 100%)', 
          border: '1px solid rgba(232, 179, 90, 0.4)',
          color: '#fff', 
          padding: '16px 20px', 
          borderRadius: '14px', 
          boxShadow: '0 8px 24px rgba(23, 61, 53, 0.25)', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '14px' 
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#ef4444' }} />
              <strong style={{ fontSize: '15px', color: '#fef3c7' }}>🔴 लाइव क्लास सत्र चालू है: {liveSession.className}</strong>
            </div>
            <div style={{ fontSize: '13px', color: '#d1e3d7', display: 'flex', gap: '14px', flexWrap: 'wrap' }}>
              <span>⏱️ सत्र में बीता समय: <strong style={{ color: '#fff' }}>{liveSession.elapsedMinutes} मिनट</strong> / 45 मिनट</span>
              <span>
                उपस्थिति स्थिति: {liveSession.status === 'PRESENT' || liveSession.elapsedMinutes >= 45 ? (
                  <span style={{ background: '#10b981', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    उपस्थित (Present ✅)
                  </span>
                ) : (
                  <span style={{ background: '#f59e0b', color: '#fff', padding: '3px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                    प्रगति पर (Incomplete ⏳ - {Math.max(0, 45 - liveSession.elapsedMinutes)} मिनट और रुकें)
                  </span>
                )}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <a 
              href={`https://meet.jit.si/${liveSession.jitsiRoom}`} 
              target="_blank" 
              rel="noreferrer" 
              className="dashboard-btn-gold"
              style={{ fontSize: '13px', padding: '8px 14px' }}
            >
              मीटिंग विंडो ↗
            </a>
            <button 
              onClick={handleLeaveLiveClass} 
              style={{ padding: '8px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' }}
            >
              सत्र समाप्त करें (Exit) 🚪
            </button>
          </div>
        </div>
      )}

      {/* Main Navigation - Touch Scrollable Horizontal Bar */}
      <div className="dashboard-tabs-bar">
        <button onClick={() => setActiveTab('classes')} style={tabBtnStyle(activeTab === 'classes')}>📚 मेरी क्लासेज</button>
        <button onClick={() => setActiveTab('live_sessions')} style={tabBtnStyle(activeTab === 'live_sessions')}>🔴 लाइव सत्र (Live Sessions)</button>
        <button onClick={() => setActiveTab('homework')} style={tabBtnStyle(activeTab === 'homework')}>📝 होमवर्क पोर्टल (2-View)</button>
        <button onClick={() => setActiveTab('profile')} style={tabBtnStyle(activeTab === 'profile')}>✏️ एडिट प्रोफाइल</button>
        <button onClick={() => setActiveTab('idcard')} style={tabBtnStyle(activeTab === 'idcard')}>🪪 डिजिटल ID कार्ड</button>
        <button onClick={() => setActiveTab('recordings')} style={tabBtnStyle(activeTab === 'recordings')}>▶️ रिकॉर्डिंग्स आर्काइव</button>
        <button onClick={() => setActiveTab('opportunities')} style={tabBtnStyle(activeTab === 'opportunities')}>🎯 अवसर व परीक्षाएं</button>
        <button onClick={() => setActiveTab('community')} style={tabBtnStyle(activeTab === 'community')}>📢 कम्युनिटी फ़ीड</button>
        <button onClick={() => setActiveTab('certificates')} style={tabBtnStyle(activeTab === 'certificates')}>🏆 सर्टिफिकेट्स</button>
        <button onClick={() => setActiveTab('feedback')} style={tabBtnStyle(activeTab === 'feedback')}>💬 फ़ीडबैक दें</button>
      </div>

      {/* Filters */}
      {(activeTab === 'classes' || activeTab === 'homework') && (
        <div className="dashboard-filter-bar">
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 'bold', color: '#1e293b', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span>🔍</span> फ़िल्टर चुनिए:
            </span>

            {/* Subject Select */}
            <select
              value={selectedSubject}
              onChange={(e) => { setSelectedSubject(e.target.value); setVisibleClassCount(6); }}
              style={selectStyle}
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
              value={classSearch}
              onChange={(e) => { setClassSearch(e.target.value); setVisibleClassCount(6); }}
              style={{ ...selectStyle, minWidth: '180px' }}
            />
          </div>

          {/* View Mode Toggle: Batch View vs All Classes View */}
          {activeTab === 'classes' && (
            <div style={{ display: 'flex', gap: '6px', background: '#ffffff', padding: '4px', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
              <button
                type="button"
                onClick={() => { setClassViewMode('batch'); setSelectedBatch(''); setVisibleClassCount(6); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: classViewMode === 'batch' ? '#2563eb' : 'transparent',
                  color: classViewMode === 'batch' ? '#ffffff' : '#334155',
                  transition: 'all 0.2s'
                }}
              >
                📂 बैच अनुसार (Batch View)
              </button>

              <button
                type="button"
                onClick={() => { setClassViewMode('all'); setSelectedBatch(''); setVisibleClassCount(6); }}
                style={{
                  padding: '6px 14px',
                  borderRadius: '6px',
                  border: 'none',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  background: classViewMode === 'all' ? '#173d35' : 'transparent',
                  color: classViewMode === 'all' ? '#ffffff' : '#547664',
                  transition: 'all 0.2s'
                }}
              >
                📅 सभी कक्षाएं ({mentorAssignedClasses.length})
              </button>
            </div>
          )}
        </div>
      )}

      {/* Classes View */}
      {activeTab === 'classes' && (
        <div>
          {/* VIEW 1: BATCH-CENTRIC VIEW (DEFAULT) */}
          {classViewMode === 'batch' && !selectedBatch && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                  <h3 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '20px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>📚</span> आपके बैच (Available Batches)
                  </h3>
                  <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#547664' }}>
                    बैच पर क्लिक करें और केवल उस बैच की निर्धारित कक्षाएं (जिनमें मेंटॉर असाइन हैं) देखें।
                  </p>
                </div>
                <span className="dashboard-badge dashboard-badge-mint">
                  कुल {studentBatches.length} बैच उपलब्ध
                </span>
              </div>

              {loading ? (
                <div style={{ textAlign: 'center', padding: '40px', color: '#547664' }}>लोड हो रहा है...</div>
              ) : studentBatches.length === 0 ? (
                <div style={{ background: '#ffffff', padding: '40px', borderRadius: '14px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                  <span style={{ fontSize: '40px' }}>📖</span>
                  <h4 style={{ margin: '12px 0 6px 0', color: '#173d35', fontFamily: 'Georgia, serif' }}>अभी कोई सक्रिय बैच उपलब्ध नहीं है</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#547664' }}>
                    जैसे ही नए बैच की कक्षाएं और मेंटॉर असाइन होंगे, वह यहाँ दिखाई देंगे।
                  </p>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                  {studentBatches.map(batch => {
                    return (
                      <div
                        key={batch._id}
                        onClick={() => handleSelectBatch(batch._id)}
                        className="dashboard-card"
                        style={{
                          cursor: 'pointer',
                          borderTop: '4px solid #173d35',
                          display: 'flex',
                          flexDirection: 'column',
                          justifyContent: 'space-between'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 99, 235, 0.16)';
                          e.currentTarget.style.borderColor = '#3b82f6';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.transform = 'translateY(0)';
                          e.currentTarget.style.boxShadow = '0 4px 16px rgba(37, 99, 235, 0.08)';
                          e.currentTarget.style.borderColor = '#e2e8f0';
                        }}
                      >
                        <div>
                          {/* Batch Header */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                            <span style={{ background: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              🎓 बैच ID: {batch._id.slice(-6).toUpperCase()}
                            </span>
                            <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '800' }}>
                              सक्रिय
                            </span>
                          </div>

                          <h3 style={{ margin: '0 0 6px 0', fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
                            {batch.title}
                          </h3>

                          <p style={{ margin: '0 0 14px 0', fontSize: '13px', color: '#64748b', lineHeight: 1.4 }}>
                            {batch.category || batch.audienceType || 'नियमित कक्षा बैच'}
                            {batch.totalDays ? ` • ${batch.totalDays} दिवसीय कोर्स` : ''}
                          </p>

                          {/* Mentored Classes Count Box */}
                          <div style={{ background: '#f8fafc', padding: '10px 12px', borderRadius: '8px', marginBottom: '14px', border: '1px solid #e2e8f0' }}>
                            <div style={{ fontSize: '12px', fontWeight: '800', color: '#1e3c72', marginBottom: '4px' }}>
                              📋 निर्धारित कक्षाएं (Scheduled Classes):
                            </div>
                            {batch.classCount > 0 ? (
                              <span style={{ background: '#ecfdf5', color: '#047857', border: '1px solid #a7f3d0', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                🌿 {batch.classCount} कक्षाएं उपलब्ध (मेंटॉर द्वारा संचालित)
                              </span>
                            ) : (
                              <span style={{ background: '#fffbeb', color: '#b45309', border: '1px solid #fde68a', padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: '700' }}>
                                ⏳ मेंटॉर असाइन हो रहे हैं
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Card Action Button */}
                        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '700' }}>
                            {batch.classCount > 0 ? `${batch.classCount} कक्षाएं` : 'आगामी बैच'}
                          </span>
                          <button
                            type="button"
                            style={{
                              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
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
                              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
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
          {(selectedBatch || classViewMode === 'all') && (
            <div>
              {/* Back to Batches Header */}
              {selectedBatch && (
                <div style={{
                  background: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderLeft: '5px solid #2563eb',
                  padding: '16px 20px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
                }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span style={{ background: '#eff6ff', color: '#1e40af', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '800' }}>
                        चयनित बैच
                      </span>
                      <h3 style={{ margin: 0, fontSize: '18px', color: '#0f172a', fontWeight: '800' }}>
                        {selectedBatchObj?.title || 'Batch Classes'}
                      </h3>
                    </div>
                    <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                      इस बैच में कुल {activeClasses.length} निर्धारित कक्षाएं उपलब्ध हैं (केवल मेंटॉर असाइन वाली कक्षाएं)।
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSelectBatch('')}
                    style={{
                      background: '#f8fafc',
                      color: '#1e293b',
                      border: '1px solid #cbd5e1',
                      padding: '8px 16px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                    onMouseLeave={(e) => e.currentTarget.style.background = '#f8fafc'}
                  >
                    ← वापस सभी बैच पर जाएं
                  </button>
                </div>
              )}

              {/* Classes Listing Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <h4 style={{ margin: 0, color: '#334155', fontSize: '16px', fontWeight: '800' }}>
                  📅 निर्धारित कक्षाएं ({activeClasses.length})
                </h4>
                {activeClasses.length > 0 && (
                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                    प्रदर्शित: 1 - {Math.min(visibleClassCount, activeClasses.length)} (कुल: {activeClasses.length})
                  </span>
                )}
              </div>

              {loading ? (
                <p style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>लोड हो रहा है...</p>
              ) : activeClasses.length === 0 ? (
                <div style={{ background: '#fff', padding: '36px', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1' }}>
                  <span style={{ fontSize: '36px' }}>📖</span>
                  <h4 style={{ margin: '10px 0 4px 0', color: '#1e293b' }}>कोई निर्धारित कक्षा उपलब्ध नहीं है</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
                    {selectedBatch
                      ? 'इस बैच में अभी केवल मेंटॉर असाइन होने के बाद ही कक्षाएं दिखेंगी।'
                      : 'इस चयन के लिए अभी कोई क्लास उपलब्ध नहीं है।'}
                  </p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '18px' }}>
                    {displayedClasses.map(cls => (
                      <div key={cls._id} className="dashboard-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                        <div>
                          {/* Header Strip */}
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                            <span className="dashboard-badge dashboard-badge-mint">
                              🎯 {cls.programId?.title || 'General Batch'}
                            </span>
                            <span className={`dashboard-badge ${cls.status === 'live' ? 'dashboard-badge-red' : cls.status === 'completed' ? 'dashboard-badge-mint' : 'dashboard-badge-gold'}`}>
                              {cls.status === 'live' ? '🔴 लाइव' : cls.status === 'completed' ? '✅ पूर्ण' : '⏳ आगामी'}
                            </span>
                          </div>

                          {/* Class Title & Day */}
                          <h4 style={{ margin: '8px 0 4px 0', fontSize: '17px', color: '#173d35', fontFamily: 'Georgia, serif', fontWeight: '600' }}>
                            {cls.subject} {cls.dayNumber ? `(Day ${cls.dayNumber})` : ''}
                          </h4>
                          <p style={{ margin: 0, fontSize: '13px', color: '#547664', fontWeight: '600' }}>
                            📌 {cls.meetingTopic || 'इंटरैक्टिव लर्निंग सेशन'}
                          </p>
                          
                          <p style={{ margin: '6px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
                            📅 {cls.dateTime ? new Date(cls.dateTime).toLocaleString('hi-IN', { dateStyle: 'medium', timeStyle: 'short' }) : 'TBA'}
                            {cls.durationMinutes ? ` • ⏱️ ${cls.durationMinutes} मिनट` : ''}
                          </p>

                          {/* Dedicated: क्या-क्या सीखा (Curriculum & Concepts Covered) */}
                          <div style={{ background: '#fbfaf5', borderLeft: '4px solid #e8b35a', border: '1px solid #e2ebe4', borderLeftWidth: '4px', padding: '10px 12px', borderRadius: '6px', margin: '12px 0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', color: '#173d35', fontSize: '12px', marginBottom: '4px' }}>
                              <span>💡</span> क्या-क्या सीखा / पाठ विवरण (Curriculum Covered)
                            </div>
                            <p style={{ margin: 0, fontSize: '13px', color: '#20332b', lineHeight: 1.5 }}>
                              {cls.meetingTopic || 'इस सत्र में विषय के मुख्य अध्यायों, सूत्रों एवं प्रश्नों का गहन अभ्यास कराया गया।'}
                            </p>
                            {cls.instructions && (
                              <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#547664', fontStyle: 'italic' }}>
                                📝 निर्देश: {cls.instructions}
                              </p>
                            )}
                          </div>

                          {/* Mentor Detail */}
                          <div style={{ fontSize: '12.5px', color: '#547664', margin: '8px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span>👨‍🏫</span>
                            <span>
                              <strong>मेंटर:</strong> {cls.primaryMentor?.name || cls.mentorName || 'संस्था मेंटर'}
                            </span>
                          </div>
                        </div>

                        {/* Attendance Status Pill */}
                        <div style={{ margin: '8px 0', fontSize: '12px' }}>
                          {(() => {
                            const att = attendanceMap[cls._id];
                            if (!att) {
                              return <span className="dashboard-badge dashboard-badge-gold">⏳ उपस्थिति: प्रतीक्षारत (Not Marked)</span>;
                            }
                            if (att.status === 'PRESENT') {
                              return <span className="dashboard-badge dashboard-badge-mint">✅ उपस्थिति: उपस्थित (Present)</span>;
                            }
                            if (att.status === 'INCOMPLETE') {
                              return <span className="dashboard-badge dashboard-badge-gold">⏳ उपस्थिति: अधूरी ({att.durationMinutes || 0} / 45 मिनट)</span>;
                            }
                            return <span className="dashboard-badge dashboard-badge-red">❌ उपस्थिति: अनुपस्थित (Absent)</span>;
                          })()}
                        </div>

                        {/* Actions */}
                        <div style={{ marginTop: '10px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {cls.jitsiRoom && (
                            <button 
                              onClick={() => handleJoinLiveClass(cls)}
                              className="dashboard-btn-gold"
                            >
                              🚀 लाइव क्लास में जुड़ें
                            </button>
                          )}

                          {cls.recordingUrl && (
                            <button 
                              onClick={() => setSelectedVideo({
                                isOpen: true,
                                url: cls.recordingUrl,
                                source: cls.recordingSource || 'googledrive',
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

                  {/* 6 Classes Incremental Pagination (See More +6 Classes) */}
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', marginTop: '26px', flexWrap: 'wrap' }}>
                    {activeClasses.length > visibleClassCount && (
                      <button
                        type="button"
                        onClick={() => setVisibleClassCount(prev => prev + 6)}
                        className="dashboard-btn-emerald"
                        style={{ padding: '12px 28px', fontSize: '14px' }}
                      >
                        ➕ और 6 कक्षाएं देखें (+6 More Classes)
                      </button>
                    )}

                    {visibleClassCount > 6 && (
                      <button
                        type="button"
                        onClick={() => setVisibleClassCount(6)}
                        className="dashboard-btn-secondary"
                        style={{ padding: '12px 20px', fontSize: '14px' }}
                      >
                        कम दिखाएं (Show Less)
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      )}

      {/* Role-wise Live Sessions View */}
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
                🔴 STUDENT LIVE SESSIONS
              </span>
              <h3 style={{ margin: '4px 0 2px 0', fontSize: '19px', color: '#ffffff', fontFamily: 'Georgia, serif' }}>
                लाइव सत्र एवं इंटरएक्टिव कार्यशालाएं
              </h3>
              <p style={{ margin: 0, fontSize: '13px', color: '#d1e3d7' }}>
                आपके लिए विशेष रूप से आयोजित लाइव सत्र। सीधे यहाँ से 1-क्लिक में लाइव क्लासरूम में प्रवेश करें।
              </p>
            </div>
            <button
              type="button"
              onClick={fetchStudentLiveSessions}
              className="dashboard-btn-gold"
              style={{ fontSize: '12.5px', padding: '8px 16px' }}
            >
              🔄 रीफ्रेश करें
            </button>
          </div>

          {liveSessionsLoading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#547664' }}>लाइव सत्र लोड हो रहे हैं...</div>
          ) : studentLiveSessions.length === 0 ? (
            <div style={{ background: '#fff', padding: '40px', borderRadius: '12px', textAlign: 'center', border: '1px dashed #cbd5e1', color: '#64748b' }}>
              <div style={{ fontSize: '40px', marginBottom: '10px' }}>🔴</div>
              <h4 style={{ margin: '0 0 6px 0', color: '#173d35', fontFamily: 'Georgia, serif' }}>अभी कोई सक्रिय लाइव सत्र उपलब्ध नहीं है</h4>
              <p style={{ margin: 0, fontSize: '13px' }}>आगामी लाइव सत्रों के शेड्यूल की सूचना आपको यहाँ प्राप्त होगी।</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {studentLiveSessions.map((cls) => {
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
                          onClick={() => {
                            setSelectedVideo({
                              isOpen: true,
                              url: cls.youtubeUrl || cls.recordingUrl || cls.driveUrl,
                              source: cls.youtubeUrl ? 'youtube' : 'googledrive',
                              title: cls.meetingTopic || cls.subject
                            });
                          }}
                          className="dashboard-btn-emerald"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                        >
                          ▶️ रिकॉर्डिंग
                        </button>
                      )}

                      {/* Join Live Session */}
                      {!isCompleted && (
                        <button
                          type="button"
                          onClick={() => handleJoinLiveClass(cls)}
                          className="dashboard-btn-gold"
                          style={{ flex: 1, padding: '8px 12px', fontSize: '12px' }}
                        >
                          {isLive ? '🔴 अभी जुड़ें' : 'सत्र में प्रवेश करें'}
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

      {/* Homework View */}
      {activeTab === 'homework' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>
          
          {/* Assigned Homework Column */}
          <div className="dashboard-card">
            <h3 style={{ borderBottom: '2px solid #173d35', paddingBottom: '8px', color: '#173d35', fontFamily: 'Georgia, serif', marginTop: 0 }}>
              📥 मिला हुआ होमवर्क (Assigned Homework)
            </h3>
            
            {loading ? (
              <p style={{ color: '#64748b' }}>लोड हो रहा है...</p>
            ) : homeworks.length === 0 ? (
              <p style={{ color: '#64748b' }}>कोई नया होमवर्क नहीं मिला है।</p>
            ) : (
              homeworks.map(hw => {
                const mySub = hw.submissions?.find(s => (s.studentId?._id || s.studentId) === currentUserId);
                const isSubmitted = !!mySub;
                const batchTitle = hw.programId?.title || 'All Batches';
                const historyList = mySub?.history || [];

                return (
                  <div key={hw._id} style={{ border: isSubmitted ? '1px solid #86efac' : '1px solid #e2e8f0', padding: '14px', borderRadius: '10px', marginBottom: '14px', background: isSubmitted ? '#f0fdf4' : '#fff' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>
                        🎯 {batchTitle}
                      </span>
                      <span style={{ fontSize: '11px', padding: '3px 8px', borderRadius: '4px', background: isSubmitted ? '#bbf7d0' : '#fef08a', color: isSubmitted ? '#166534' : '#854d0e', fontWeight: 'bold' }}>
                        {isSubmitted ? `✔ सबमिट किया गया (${historyList.length + 1} प्रयास)` : '⏳ बाकी है'}
                      </span>
                    </div>
                    
                    <h4 style={{ margin: '10px 0 4px 0', fontSize: '15px', color: '#0f172a' }}>{hw.title} ({hw.subject})</h4>
                    <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.4 }}>{hw.description}</p>
                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#dc2626', fontWeight: 'bold' }}>
                      ⏰ डेडलाइन: {hw.deadline ? new Date(hw.deadline).toLocaleDateString('hi-IN') : 'N/A'}
                    </p>
                    
                    {hw.attachmentUrl && (
                      <p style={{ margin: '6px 0 0 0', fontSize: '12px' }}>
                        <a href={hw.attachmentUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb', fontWeight: 'bold' }}>
                          📎 शिक्षक द्वारा अटैच की गई फ़ाइल देखें
                        </a>
                      </p>
                    )}

                    {/* Latest Submission Box (if already submitted) */}
                    {isSubmitted && (
                      <div style={{ marginTop: '10px', padding: '10px', background: '#dcfce7', borderRadius: '6px', border: '1px solid #86efac', fontSize: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <strong style={{ color: '#166534' }}>🌟 आपका नवीनतम सबमिशन (Latest):</strong>
                          <span style={{ color: '#15803d', fontSize: '11px' }}>
                            {mySub.submittedAt ? new Date(mySub.submittedAt).toLocaleString('hi-IN') : 'हाल ही में'}
                          </span>
                        </div>
                        {mySub.fileUrl && (
                          <p style={{ margin: '4px 0 0 0' }}>
                            <a href={mySub.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#1d4ed8', fontWeight: 'bold' }}>
                              🔗 सबमिट फ़ाइल / लिंक देखें ↗
                            </a>
                          </p>
                        )}
                        {mySub.remarks && (
                          <p style={{ margin: '4px 0 0 0', color: '#334155' }}>
                            💬 <strong>रिमार्क:</strong> {mySub.remarks}
                          </p>
                        )}

                        {/* Expandable History Accordion */}
                        {historyList.length > 0 && (
                          <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed #86efac' }}>
                            <button
                              type="button"
                              onClick={() => setExpandedHistoryId(expandedHistoryId === hw._id ? null : hw._id)}
                              style={{ background: 'transparent', border: 'none', color: '#047857', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', padding: 0, textDecoration: 'underline' }}
                            >
                              📜 पूर्व सबमिशन इतिहास ({historyList.length} पुराने प्रयास) {expandedHistoryId === hw._id ? '▲ छुपाएं' : '▼ देखें'}
                            </button>

                            {expandedHistoryId === hw._id && (
                              <div style={{ marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                {historyList.map((hist, hIdx) => (
                                  <div key={hIdx} style={{ background: '#fff', padding: '6px 8px', borderRadius: '4px', border: '1px solid #bbf7d0', fontSize: '11px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748b' }}>
                                      <span>प्रयास #{hIdx + 1}</span>
                                      <span>{hist.submittedAt ? new Date(hist.submittedAt).toLocaleString('hi-IN') : ''}</span>
                                    </div>
                                    {hist.fileUrl && (
                                      <a href={hist.fileUrl} target="_blank" rel="noreferrer" style={{ color: '#2563eb' }}>
                                        🔗 पुराना अटैचमेंट
                                      </a>
                                    )}
                                    {hist.remarks && <p style={{ margin: '2px 0 0 0', color: '#475569' }}>{hist.remarks}</p>}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Submission Action Buttons (Always available - unlimited submissions) */}
                    {submittingHwId !== hw._id && (
                      <button 
                        onClick={() => setSubmittingHwId(hw._id)} 
                        style={{ 
                          marginTop: '10px', 
                          background: isSubmitted ? '#0284c7' : '#16a34a', 
                          color: '#fff', 
                          border: 'none', 
                          padding: '7px 14px', 
                          borderRadius: '6px', 
                          cursor: 'pointer', 
                          fontSize: '12px', 
                          fontWeight: 'bold',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                      >
                        {isSubmitted ? '🔄 नया सबमिशन जोड़ें / फिर से सबमिट करें (Resubmit)' : '📤 होमवर्क जमा करें'}
                      </button>
                    )}

                    {/* Submission Form Modal / Box */}
                    {submittingHwId === hw._id && (
                      <div style={{ marginTop: '12px', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '2px dashed #94a3b8' }}>
                        <h5 style={{ margin: '0 0 8px 0', color: '#1e293b', fontSize: '13px' }}>
                          {isSubmitted ? '🔄 नया सबमिशन जोड़ें (पिछला सबमिशन इतिहास में सुरक्षित रहेगा):' : '📤 अपना होमवर्क सबमिट करें:'}
                        </h5>

                        <div style={{ marginBottom: '8px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                            📷/📄 फोटो या PDF फ़ाइल चुनें:
                          </label>
                          <input 
                            type="file" 
                            accept="image/*,.pdf,.doc,.docx" 
                            onChange={(e) => setHwSubFile(e.target.files?.[0] || null)}
                            style={{ width: '100%', fontSize: '12px' }} 
                          />
                        </div>

                        <div style={{ marginBottom: '8px' }}>
                          <label style={{ fontSize: '12px', fontWeight: 'bold', display: 'block', marginBottom: '4px' }}>
                            या Google Drive / Document URL दर्ज करें:
                          </label>
                          <input 
                            type="text" 
                            placeholder="https://drive.google.com/..." 
                            value={submissionUrl} 
                            onChange={(e) => setSubmissionUrl(e.target.value)} 
                            style={{ width: '100%', padding: '7px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} 
                          />
                        </div>

                        <input 
                          type="text" 
                          placeholder="रिमार्क / संदेश (वैकल्पिक)" 
                          value={submissionRemark} 
                          onChange={(e) => setSubmissionRemark(e.target.value)} 
                          style={{ width: '100%', padding: '7px', marginBottom: '10px', borderRadius: '5px', border: '1px solid #cbd5e1', fontSize: '12px', boxSizing: 'border-box' }} 
                        />

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button 
                            onClick={() => handleHomeworkSubmit(hw._id)} 
                            disabled={submittingHwProgress} 
                            style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
                          >
                            {submittingHwProgress ? 'अपलोड हो रहा है...' : '🚀 सबमिट करें'}
                          </button>
                          <button 
                            onClick={() => { setSubmittingHwId(null); setHwSubFile(null); }} 
                            style={{ background: '#94a3b8', color: '#fff', border: 'none', padding: '8px 14px', borderRadius: '5px', cursor: 'pointer', fontSize: '12px' }}
                          >
                            रद्द करें
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Submitted History Column */}
          <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
            <h3 style={{ borderBottom: '2px solid #16a34a', paddingBottom: '8px', color: '#15803d', marginTop: 0 }}>
              📤 जमा किए गए होमवर्क (Submitted History)
            </h3>
            
            {homeworks.filter(hw => hw.submissions?.some(s => (s.studentId?._id || s.studentId) === currentUserId)).length === 0 ? (
              <p style={{ color: '#64748b' }}>आपने अभी तक कोई होमवर्क सबमिट नहीं किया है।</p>
            ) : (
              homeworks.map(hw => {
                const mySub = hw.submissions?.find(s => (s.studentId?._id || s.studentId) === currentUserId);
                if (!mySub) return null;
                const historyList = mySub.history || [];

                return (
                  <div key={hw._id} style={{ border: '1px solid #bbf7d0', padding: '14px', borderRadius: '10px', marginBottom: '14px', background: '#f0fdf4' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h5 style={{ margin: 0, color: '#166534', fontSize: '15px' }}>{hw.title} ({hw.subject})</h5>
                      <span style={{ fontSize: '11px', background: '#dcfce7', color: '#15803d', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>
                        {historyList.length + 1} बार सबमिट
                      </span>
                    </div>

                    <p style={{ margin: '6px 0 0 0', fontSize: '12px', color: '#475569' }}>
                      📅 <strong>नवीनतम सबमिशन:</strong> {mySub.submittedAt ? new Date(mySub.submittedAt).toLocaleString('hi-IN') : 'N/A'}
                    </p>

                    {mySub.fileUrl && (
                      <a href={mySub.fileUrl} target="_blank" rel="noreferrer" style={{ display: 'inline-block', marginTop: '6px', color: '#2563eb', fontSize: '12px', fontWeight: 'bold' }}>
                        🔗 सबमिट की गई फाइल देखें ↗
                      </a>
                    )}

                    {mySub.remarks && (
                      <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#334155' }}>
                        💬 <strong>रिमार्क:</strong> {mySub.remarks}
                      </p>
                    )}

                    {/* Previous attempts preview */}
                    {historyList.length > 0 && (
                      <div style={{ marginTop: '10px', borderTop: '1px dashed #86efac', paddingTop: '8px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#047857', marginBottom: '4px' }}>
                          📜 पूर्व सबमिशन प्रयास ({historyList.length}):
                        </div>
                        {historyList.map((h, idx) => (
                          <div key={idx} style={{ fontSize: '11px', color: '#64748b', marginBottom: '3px', paddingLeft: '8px', borderLeft: '2px solid #86efac' }}>
                            प्रयास #{idx + 1} - {h.submittedAt ? new Date(h.submittedAt).toLocaleString('hi-IN') : ''}
                            {h.fileUrl && (
                              <a href={h.fileUrl} target="_blank" rel="noreferrer" style={{ marginLeft: '6px', color: '#2563eb' }}>
                                (फाइल देखें)
                              </a>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

      {/* Dual-Category Recordings Archive View (Study Classes vs Events & Programs) */}
      {activeTab === 'recordings' && (() => {
        // 1. Study Classes (Course curriculum for student's batch)
        const studyRecordings = classes.filter(c => {
          const hasRec = Boolean(c.recordingUrl || c.youtubeUrl || c.driveUrl);
          const isStudyClass = (c.entryType === 'class' || !c.entryType) && 
            !['open to all', 'guest + student', 'volunteer + guest', 'special event'].includes((c.targetAudience || '').toLowerCase());
          return hasRec && isStudyClass;
        });

        // 2. Special Live Sessions (from Class model)
        const sessionRecordings = classes.filter(c => {
          const hasRec = Boolean(c.recordingUrl || c.youtubeUrl || c.driveUrl);
          const isSpecial = c.entryType === 'session' || 
            ['open to all', 'guest + student', 'volunteer + guest', 'special event'].includes((c.targetAudience || '').toLowerCase());
          return hasRec && isSpecial;
        });

        // 3. Event Model Recordings (from Event collection)
        const normalizedEventRecordings = recordedEvents.map(ev => ({
          _id: ev._id,
          subject: ev.title,
          meetingTopic: ev.description || ev.category || 'संस्थागत कार्यक्रम',
          dateTime: ev.eventDate,
          category: ev.category || 'इवेंट / वर्कशॉप',
          recordingUrl: ev.youtubeUrl || ev.driveUrl,
          youtubeUrl: ev.youtubeUrl,
          driveUrl: ev.driveUrl,
          recordingSource: ev.youtubeUrl ? 'youtube' : 'googledrive',
          isEventModel: true,
          location: ev.location
        }));

        const allEventRecordings = [...sessionRecordings, ...normalizedEventRecordings].sort((a, b) => new Date(b.dateTime || 0) - new Date(a.dateTime || 0));

        return (
          <div>
            {/* Header Title and 7-Day Storage Cycle Info */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
              <div>
                <h3 style={{ margin: 0, color: '#0f172a', fontSize: '20px' }}>
                  ▶️ रिकॉर्डिंग्स आर्काइव (Recordings Archive)
                </h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                  गूगल ड्राइव 7-दिवसीय सक्रिय बफर ➔ यूट्यूब आधिकारिक अनलिस्टेड आर्काइव (@AvyuktUtthanSanstha)
                </p>
              </div>
              <span style={{ fontSize: '12px', background: '#ecfdf5', color: '#047857', padding: '5px 12px', borderRadius: '20px', fontWeight: 'bold' }}>
                सुरक्षित आर्काइव 🔒
              </span>
            </div>

            {/* 2-Category Pill Switcher */}
            <div style={{
              display: 'flex',
              gap: '10px',
              padding: '6px',
              background: '#f1f5f9',
              borderRadius: '12px',
              marginBottom: '20px',
              width: 'fit-content',
              flexWrap: 'wrap'
            }}>
              <button
                type="button"
                onClick={() => setRecordingCategory('study')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: recordingCategory === 'study' ? '#005B41' : 'transparent',
                  color: recordingCategory === 'study' ? '#ffffff' : '#475569',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: recordingCategory === 'study' ? '0 2px 6px rgba(0, 91, 65, 0.25)' : 'none'
                }}
              >
                <span>📚 मेरी अध्ययन कक्षाएं</span>
                <span style={{
                  background: recordingCategory === 'study' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px'
                }}>
                  {studyRecordings.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setRecordingCategory('events')}
                style={{
                  padding: '9px 18px',
                  borderRadius: '8px',
                  border: 'none',
                  background: recordingCategory === 'events' ? '#005B41' : 'transparent',
                  color: recordingCategory === 'events' ? '#ffffff' : '#475569',
                  fontWeight: '700',
                  fontSize: '13px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'all 0.2s',
                  boxShadow: recordingCategory === 'events' ? '0 2px 6px rgba(0, 91, 65, 0.25)' : 'none'
                }}
              >
                <span>🌟 संस्थागत इवेंट्स व विशेष सत्र</span>
                <span style={{
                  background: recordingCategory === 'events' ? 'rgba(255,255,255,0.25)' : '#e2e8f0',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  fontSize: '11px'
                }}>
                  {allEventRecordings.length}
                </span>
              </button>
            </div>

            {/* TAB 1: STUDY CLASSES */}
            {recordingCategory === 'study' && (
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 2px' }}>
                  📖 आपके नामांकित बैच व पाठ्यक्रम की दैनिक विषयवार कक्षाएं (केवल छात्रों व मेंटर्स हेतु)
                </p>

                {studyRecordings.length === 0 ? (
                  <div style={{ background: '#fff', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '36px' }}>📚</span>
                    <h4 style={{ margin: '10px 0 4px', color: '#1e293b' }}>अभी कोई अध्ययन कक्षा रिकॉर्डिंग उपलब्ध नहीं है</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                      कक्षा समाप्त होने के बाद मेंटर द्वारा यहाँ रिकॉर्डिंग उपलब्ध कराई जाएगी।
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {studyRecordings.map((cls) => {
                      const isYt = cls.recordingSource === 'youtube' || Boolean(cls.youtubeUrl);
                      const videoPlayUrl = cls.youtubeUrl || cls.recordingUrl || cls.driveUrl;

                      return (
                        <div 
                          key={cls._id} 
                          style={{ 
                            background: '#fff', 
                            border: '1px solid #cbd5e1', 
                            borderRadius: '12px', 
                            padding: '18px', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            borderTop: '3px solid #005B41'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ 
                                background: isYt ? '#fef2f2' : '#eff6ff', 
                                color: isYt ? '#dc2626' : '#0284c7', 
                                padding: '3px 9px', 
                                borderRadius: '4px', 
                                fontSize: '11px', 
                                fontWeight: 'bold',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px'
                              }}>
                                {isYt ? '▶️ YouTube Archive' : '📁 Google Drive बफर'}
                              </span>
                              <span style={{ 
                                fontSize: '11px', 
                                fontWeight: '700', 
                                color: '#005B41', 
                                background: '#e6f4ea', 
                                padding: '2px 8px', 
                                borderRadius: '10px' 
                              }}>
                                दिन {cls.dayNumber || 1}
                              </span>
                            </div>

                            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a' }}>
                              {cls.subject}
                            </h4>

                            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>
                              📅 {cls.dateTime ? new Date(cls.dateTime).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                            </p>

                            {cls.meetingTopic && (
                              <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #005B41' }}>
                                💡 {cls.meetingTopic}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedVideo({
                              isOpen: true,
                              url: videoPlayUrl,
                              source: isYt ? 'youtube' : 'googledrive',
                              title: `${cls.subject} - Day ${cls.dayNumber || 1} (${cls.meetingTopic || 'Study Class'})`
                            })}
                            style={{ 
                              marginTop: '16px', 
                              width: '100%', 
                              padding: '10px', 
                              background: '#005B41', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontWeight: 'bold', 
                              fontSize: '13px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              gap: '6px',
                              boxShadow: '0 2px 4px rgba(0,91,65,0.2)'
                            }}
                          >
                            ▶️ रिकॉर्डिंग अभी देखें (Direct Play)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: EVENTS & SPECIAL PROGRAMS (SHARED) */}
            {recordingCategory === 'events' && (
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 16px 2px' }}>
                  🌟 संस्था के विशेष आयोजनों, कार्यशालाओं, वेबिनार्स व वार्षिकोत्सव की रिकॉर्डिंग्स (सभी के लिए सुलभ)
                </p>

                {allEventRecordings.length === 0 ? (
                  <div style={{ background: '#fff', padding: '40px 20px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
                    <span style={{ fontSize: '36px' }}>🌟</span>
                    <h4 style={{ margin: '10px 0 4px', color: '#1e293b' }}>अभी कोई इवेंट या विशेष सत्र रिकॉर्डिंग उपलब्ध नहीं है</h4>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
                      आगामी वर्कशॉप्स या वार्षिकोत्सव के पश्चात रिकॉर्डिंग्स यहाँ उपलब्ध होंगी।
                    </p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                    {allEventRecordings.map((evItem) => {
                      const isYt = evItem.recordingSource === 'youtube' || Boolean(evItem.youtubeUrl);
                      const videoPlayUrl = evItem.youtubeUrl || evItem.recordingUrl || evItem.driveUrl;

                      return (
                        <div 
                          key={evItem._id} 
                          style={{ 
                            background: '#fff', 
                            border: '1px solid #cbd5e1', 
                            borderRadius: '12px', 
                            padding: '18px', 
                            boxShadow: '0 2px 8px rgba(0,0,0,0.04)', 
                            display: 'flex', 
                            flexDirection: 'column', 
                            justifyContent: 'space-between',
                            borderTop: '3px solid #f59e0b'
                          }}
                        >
                          <div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                              <span style={{ 
                                background: isYt ? '#fef2f2' : '#eff6ff', 
                                color: isYt ? '#dc2626' : '#0284c7', 
                                padding: '3px 9px', 
                                borderRadius: '4px', 
                                fontSize: '11px', 
                                fontWeight: 'bold' 
                              }}>
                                {isYt ? '▶️ YouTube Archive' : '📁 Google Drive बफर'}
                              </span>
                              <span style={{ 
                                fontSize: '11px', 
                                fontWeight: '700', 
                                color: '#b45309', 
                                background: '#fef3c7', 
                                padding: '2px 8px', 
                                borderRadius: '10px' 
                              }}>
                                ✦ {evItem.category || 'संस्थागत कार्यक्रम'}
                              </span>
                            </div>

                            <h4 style={{ margin: '0 0 6px 0', fontSize: '16px', color: '#0f172a' }}>
                              {evItem.subject || evItem.title}
                            </h4>

                            <p style={{ margin: '0 0 8px 0', fontSize: '12px', color: '#64748b' }}>
                              📅 {evItem.dateTime ? new Date(evItem.dateTime).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' }) : 'N/A'}
                              {evItem.location ? ` • 📍 ${evItem.location}` : ''}
                            </p>

                            {evItem.meetingTopic && (
                              <p style={{ margin: 0, fontSize: '12.5px', color: '#334155', background: '#f8fafc', padding: '8px 10px', borderRadius: '6px', borderLeft: '3px solid #f59e0b' }}>
                                💡 {evItem.meetingTopic}
                              </p>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => setSelectedVideo({
                              isOpen: true,
                              url: videoPlayUrl,
                              source: isYt ? 'youtube' : 'googledrive',
                              title: evItem.subject || evItem.title || 'Event Recording'
                            })}
                            style={{ 
                              marginTop: '16px', 
                              width: '100%', 
                              padding: '10px', 
                              background: '#f59e0b', 
                              color: '#fff', 
                              border: 'none', 
                              borderRadius: '6px', 
                              cursor: 'pointer', 
                              fontWeight: 'bold', 
                              fontSize: '13px', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center', 
                              gap: '6px',
                              boxShadow: '0 2px 4px rgba(245, 158, 11, 0.25)'
                            }}
                          >
                            ▶️ इवेंट रिकॉर्डिंग देखें (Direct Play)
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })()}

      {/* External Exams & Opportunities Bulletin (Step 7 Blueprint) */}
      {activeTab === 'opportunities' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0f172a' }}>🎯 प्रतियोगी परीक्षाएं व अवसर बुलेटिन (Exams & Opportunities)</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                नवोदय विद्यालय, JEE, NEET, छात्रवृत्ति एवं राष्ट्रीय प्रतियोगिताओं के फॉर्म, पीडीएफ व दिशा-निर्देश।
              </p>
            </div>
          </div>

          {opportunities.length === 0 ? (
            <div style={{ background: '#fff', padding: '30px', borderRadius: '10px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '32px' }}>📢</span>
              <p style={{ margin: '10px 0 0 0', color: '#64748b' }}>वर्तमान में कोई नई परीक्षा अधिसूचना प्रकाशित नहीं है।</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {opportunities.map((item) => {
                const whatsappText = encodeURIComponent(`📢 *${item.title}*\n\n${item.description || ''}\n\nअव्युक्त फाउंडेशन पोर्टल से प्राप्त जानकारी: ${window.location.origin}`);
                return (
                  <div key={item._id} style={{ background: '#fff', border: '1px solid #cbd5e1', borderRadius: '12px', padding: '18px', boxShadow: '0 2px 6px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
                          🎓 {item.category || 'Exam / Opportunity'}
                        </span>
                        <span style={{ fontSize: '11px', color: '#64748b' }}>
                          {item.eventDate ? new Date(item.eventDate).toLocaleDateString('hi-IN') : ''}
                        </span>
                      </div>
                      <h4 style={{ margin: '6px 0 6px 0', fontSize: '16px', color: '#0f172a' }}>{item.title}</h4>
                      <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5 }}>
                        {item.description}
                      </p>
                    </div>

                    <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {item.driveUrl && (
                        <a 
                          href={item.driveUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          style={{ padding: '8px 12px', background: '#f1f5f9', color: '#1e293b', borderRadius: '6px', textDecoration: 'none', fontSize: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                        >
                          📄 आधिकारिक नोटिफिकेशन (PDF / Drive)
                        </a>
                      )}
                      <a 
                        href={`https://api.whatsapp.com/send?text=${whatsappText}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        style={{ padding: '9px 12px', background: '#25d366', color: '#fff', borderRadius: '6px', textDecoration: 'none', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                      >
                        💬 व्हाट्सएप पर साझा करें (1-Click Share)
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Community Feed & Post Creator (Step 7 Blueprint) */}
      {activeTab === 'community' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div>
              <h3 style={{ margin: 0, color: '#0f172a' }}>📢 कम्युनिटी फ़ीड व संवाद मंच</h3>
              <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
                अपने विचार, प्रश्न या सीखने के अनुभव साझा करें। सुरक्षित वातावरण के लिए सभी पोस्ट एडमिन अनुमोदन के बाद ही दिखेंगी।
              </p>
            </div>
          </div>

          {postMsg && (
            <div style={{ padding: '12px 16px', background: '#dcfce7', color: '#166534', borderRadius: '8px', marginBottom: '16px', fontWeight: 'bold', fontSize: '13px' }}>
              {postMsg}
            </div>
          )}

          {/* New Post Form Box */}
          <div style={{ background: '#fff', padding: '18px', borderRadius: '12px', border: '1px solid #cbd5e1', marginBottom: '24px', boxShadow: '0 2px 6px rgba(0,0,0,0.04)' }}>
            <h4 style={{ margin: '0 0 12px 0', color: '#1e3a8a', fontSize: '15px' }}>✍️ नया पोस्ट बनाएं (Create Post):</h4>
            <form onSubmit={handleCreateCommunityPost} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input 
                  type="text" 
                  placeholder="पोस्ट का शीर्षक (Title)..." 
                  value={postForm.title} 
                  onChange={(e) => setPostForm({ ...postForm, title: e.target.value })} 
                  required 
                  style={{ flex: 2, padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }} 
                />
                <select 
                  value={postForm.category} 
                  onChange={(e) => setPostForm({ ...postForm, category: e.target.value })} 
                  style={{ flex: 1, padding: '9px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px' }}
                >
                  <option value="जिज्ञासा / सवाल">❓ जिज्ञासा / सवाल</option>
                  <option value="मेरी सीख">💡 मेरी सीख (Learnings)</option>
                  <option value="सफलता की कहानी">🏆 सफलता की कहानी</option>
                  <option value="सामान्य विचार">💬 सामान्य विचार</option>
                </select>
              </div>
              <textarea 
                rows="3" 
                placeholder="यहाँ अपना विचार, सवाल या अनुभव लिखें..." 
                value={postForm.content} 
                onChange={(e) => setPostForm({ ...postForm, content: e.target.value })} 
                required 
                style={{ padding: '10px 12px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '13px', resize: 'vertical' }} 
              />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '11px', color: '#64748b' }}>
                  🔒 सुरक्षित मॉडरेशन: सबमिट करने पर पोस्ट एडमिन रिव्यू कतार में जाएगी।
                </span>
                <button 
                  type="submit" 
                  disabled={postingLoading} 
                  className="dashboard-btn-gold"
                  style={{ padding: '9px 20px', fontSize: '13px' }}
                >
                  {postingLoading ? 'भेजा जा रहा है...' : '🚀 पोस्ट सबमिट करें'}
                </button>
              </div>
            </form>
          </div>

          {/* Approved Posts Stream */}
          <h4 style={{ margin: '0 0 14px 0', color: '#173d35', fontFamily: 'Georgia, serif' }}>🌟 स्वीकृत कम्युनिटी पोस्ट्स ({communityPosts.length})</h4>
          {communityPosts.length === 0 ? (
            <p style={{ color: '#547664', fontSize: '13px' }}>अभी कोई स्वीकृत पोस्ट नहीं है। सबसे पहले आप पोस्ट करें!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {communityPosts.map(p => (
                <div key={p._id} className="dashboard-card">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#173d35', fontSize: '14px' }}>{p.authorName}</span>
                      <span className="dashboard-badge dashboard-badge-mint" style={{ marginLeft: '8px', textTransform: 'capitalize' }}>
                        {p.authorRole}
                      </span>
                    </div>
                    <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                      {p.createdAt ? new Date(p.createdAt).toLocaleDateString('hi-IN') : ''}
                    </span>
                  </div>
                  <h4 style={{ margin: '6px 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '16px' }}>{p.title}</h4>
                  <p style={{ margin: 0, color: '#20332b', fontSize: '13.5px', lineHeight: 1.6 }}>{p.content}</p>
                  
                  <div style={{ marginTop: '14px', display: 'flex', alignItems: 'center', gap: '12px', borderTop: '1px solid #e2ebe4', paddingTop: '10px' }}>
                    <button 
                      onClick={() => handleLikePost(p._id)} 
                      style={{ background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontSize: '13px', color: '#dc2626', fontWeight: 'bold' }}
                    >
                      ❤️ {p.likesCount || 0} लाइक्स
                    </button>
                    <span style={{ fontSize: '12px', color: '#547664' }}>
                      💬 {p.comments ? p.comments.filter(c => c.status === 'approved').length : 0} टिप्पणियां
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Digital ID Card View */}
      {activeTab === 'idcard' && (
        <div className="dashboard-card" style={{ display: 'flex', justifyContent: 'center' }}>
          <IDCard user={currentUser} />
        </div>
      )}

      {/* Certificates View */}
      {activeTab === 'certificates' && (
        <CertificatesPage user={currentUser} userId={currentUserId} />
      )}

      {/* Edit Profile */}
      {activeTab === 'profile' && (
        <div className="dashboard-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <h3 style={{ marginTop: 0, color: '#173d35', borderBottom: '2px solid #173d35', paddingBottom: '8px', fontFamily: 'Georgia, serif' }}>✏️ प्रोफाइल अपडेट करें</h3>

          {msg.text && (
            <div style={{ padding: '10px', borderRadius: '6px', marginBottom: '15px', background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
              {msg.text}
            </div>
          )}

          <form onSubmit={handleProfileUpdate}>
            <div style={{ marginBottom: '16px' }}>
              <label style={labelStyle}>📷 प्रोफाइल फोटो अपलोड करें:</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginTop: '6px' }}>
                <img 
                  src={getImageSrc(currentUser?.avatar)} 
                  alt="Avatar Preview" 
                  style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #e8b35a' }}
                  onError={(e) => { 
                    e.target.onerror = null; 
                    e.target.src = DEFAULT_AVATAR; 
                  }}
                />
                <div style={{ flex: 1 }}>
                  <input type="file" accept="image/*" onChange={handleFileChange} style={{ width: '100%', padding: '6px', boxSizing: 'border-box' }} />
                  {currentUser?.avatar && <p style={{ fontSize: '12px', color: '#166534', margin: '4px 0 0 0' }}>✔ वर्तमान में फोटो सक्रिय है</p>}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
              <div>
                <label style={labelStyle}>छात्र का नाम (Name):</label>
                <input type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>ईमेल ID (Email):</label>
                <input type="email" value={profileForm.email} onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })} style={inputStyle} required />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
              <div>
                <label style={labelStyle}>मोबाइल नंबर (Phone):</label>
                <input type="text" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} style={inputStyle} required />
              </div>
              <div>
                <label style={labelStyle}>कक्षा (Class):</label>
                <input type="text" value={profileForm.studentClass} onChange={(e) => setProfileForm({ ...profileForm, studentClass: e.target.value })} style={inputStyle} placeholder="Class 6th, 10th, B.Sc..." required />
              </div>
            </div>

            <div style={{ marginTop: '12px' }}>
              <label style={labelStyle}>स्कूल / कॉलेज का नाम:</label>
              <input type="text" value={profileForm.schoolName} onChange={(e) => setProfileForm({ ...profileForm, schoolName: e.target.value })} style={inputStyle} placeholder="Govt Higher Secondary School..." required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginTop: '12px' }}>
              <div>
                <label style={labelStyle}>गांव/शहर (Village/Town):</label>
                <input type="text" value={profileForm.villageName} onChange={(e) => setProfileForm({ ...profileForm, villageName: e.target.value })} style={inputStyle} placeholder="गांव का नाम..." />
              </div>
              <div>
                <label style={labelStyle}>जिला (District):</label>
                <input type="text" value={profileForm.district} onChange={(e) => setProfileForm({ ...profileForm, district: e.target.value })} style={inputStyle} placeholder="जिला..." />
              </div>
            </div>

            <h4 style={{ margin: '18px 0 8px 0', color: '#547664' }}>🌐 सोशल मीडिया लिंक (Optional)</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
              <div>
                <label style={labelStyle}>Instagram:</label>
                <input type="text" value={profileForm.instagram} onChange={(e) => setProfileForm({ ...profileForm, instagram: e.target.value })} style={inputStyle} placeholder="@username" />
              </div>
              <div>
                <label style={labelStyle}>LinkedIn URL:</label>
                <input type="text" value={profileForm.linkedin} onChange={(e) => setProfileForm({ ...profileForm, linkedin: e.target.value })} style={inputStyle} placeholder="https://..." />
              </div>
              <div>
                <label style={labelStyle}>Snapchat ID:</label>
                <input type="text" value={profileForm.snapchat} onChange={(e) => setProfileForm({ ...profileForm, snapchat: e.target.value })} style={inputStyle} placeholder="snap_user" />
              </div>
            </div>

            <button type="submit" disabled={uploading} className="dashboard-btn-gold" style={{ marginTop: '20px', width: '100%', padding: '12px', fontSize: '15px' }}>
              {uploading ? 'सेव हो रहा है...' : '💾 प्रोफाइल अपडेट करें'}
            </button>
          </form>
        </div>
      )}

      {/* Give Feedback */}
      {activeTab === 'feedback' && (
        <div className="dashboard-card" style={{ maxWidth: '650px', margin: '0 auto' }}>
          <h3 style={{ marginTop: 0, color: '#173d35', borderBottom: '2px solid #173d35', paddingBottom: '8px', fontFamily: 'Georgia, serif' }}>💬 अपना फ़ीडबैक / अनुभव साझा करें</h3>

          {feedbackMsg.text && (
            <div style={{ padding: '10px', borderRadius: '6px', marginBottom: '15px', background: feedbackMsg.type === 'success' ? '#dcfce7' : '#fee2e2', color: feedbackMsg.type === 'success' ? '#166534' : '#991b1b', fontWeight: 'bold' }}>
              {feedbackMsg.text}
            </div>
          )}

          <form onSubmit={handleFeedbackSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>फ़ीडबैक की श्रेणी (Category):</label>
              <select
                value={feedbackForm.category}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, category: e.target.value })}
                style={inputStyle}
              >
                <option value="Class/Session Review">क्लास का अनुभव (Class Review)</option>
                <option value="Mentor Review">मेंटॉर का रिव्यू (Mentor Review)</option>
                <option value="Event Review">इवेंट का फ़ीडबैक (Event Review)</option>
                <option value="Issue/Complaint">शिकायत / परेशानी (Issue/Complaint)</option>
                <option value="General Suggestion">सामान्य सुझाव (General Suggestion)</option>
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>संबंधित नाम (Mentor Name / Subject / Event):</label>
              <input
                type="text"
                placeholder="उदा. Maths Class, Amit Sir..."
                value={feedbackForm.targetName}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, targetName: e.target.value })}
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>रेटिंग (Rating):</label>
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px', cursor: 'pointer' }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onClick={() => setFeedbackForm({ ...feedbackForm, rating: star })}
                    style={{ fontSize: '24px', color: star <= feedbackForm.rating ? '#e8b35a' : '#cbd5e1' }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>अपना संदेश (Feedback Detail):</label>
              <textarea
                rows="4"
                placeholder="यहाँ विवरण लिखें..."
                value={feedbackForm.feedbackText}
                onChange={(e) => setFeedbackForm({ ...feedbackForm, feedbackText: e.target.value })}
                style={{ ...inputStyle, resize: 'vertical' }}
                required
              ></textarea>
            </div>

            <button type="submit" disabled={feedbackSubmitting} className="dashboard-btn-emerald" style={{ width: '100%', padding: '12px', fontSize: '15px' }}>
              {feedbackSubmitting ? 'सबमिट हो रहा है...' : '📤 फ़ीडबैक जमा करें'}
            </button>
          </form>
        </div>
      )}

    </div>
  );
};

export default StudentDashboard;