import React, { useState, useEffect, useCallback, useRef } from 'react';
import { API, BACKEND_URL, getImageSrc, DEFAULT_AVATAR } from '../config/api';

const EMOJI_OPTIONS = ['👍', '❤️', '💡', '👏', '🔥'];

const SUBJECT_LIST = [
  'Mathematics (गणित)',
  'Science (विज्ञान)',
  'English (अंग्रेजी)',
  'Hindi (हिंदी)',
  'Social Science (सामाजिक विज्ञान)',
  'Computer / Coding (कम्प्यूटर शिक्षा)',
  'General Knowledge',
  'General / सामान्य'
];

const CLASS_LIST = ['All', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

const DiscussionForumView = ({ user, themeColor = '#2563eb' }) => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Expand state: set of question IDs that have their replies expanded. By default, all are expanded or toggleable.
  const [expandedIds, setExpandedIds] = useState({});

  // Ask Question Modal State
  const [showAskModal, setShowAskModal] = useState(false);
  const [submittingQ, setSubmittingQ] = useState(false);
  const [qMsg, setQMsg] = useState({ text: '', type: '' });
  const [qForm, setQForm] = useState({
    title: '',
    question: '',
    subject: 'Mathematics (गणित)',
    classGrade: 'Class 10'
  });
  const [qAttachment, setQAttachment] = useState(null);
  const [qVoiceBlob, setQVoiceBlob] = useState(null);
  const [qVoiceUrl, setQVoiceUrl] = useState('');
  const [isRecordingQ, setIsRecordingQ] = useState(false);
  const [qTimer, setQTimer] = useState(0);

  // Reply Draft State per question: { [questionId]: { text, file, voiceBlob, voiceUrl, isRecording, timer, submitting } }
  const [drafts, setDrafts] = useState({});

  // Media Recorder references
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerIntervalRef = useRef(null);

  const currentUserId = String(user?._id || user?.id || '');
  const isMentor = user?.role === 'mentor';
  const isAdmin = user?.role === 'admin';

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedStatus) params.append('status', selectedStatus);
      if (searchQuery) params.append('search', searchQuery);

      const res = await API.get(`/discussions?${params.toString()}`);
      const data = Array.isArray(res.data) ? res.data : [];
      setQuestions(data);

      // Auto-expand questions initially so replies are immediately visible like WhatsApp
      setExpandedIds(prev => {
        const next = { ...prev };
        data.forEach(q => {
          if (next[q._id] === undefined) {
            next[q._id] = true;
          }
        });
        return next;
      });
    } catch (err) {
      console.error('Failed to load discussions:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedSubject, selectedStatus, searchQuery]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  // --------------------------------------------------------------------------
  // VOICE RECORDING UTILITIES
  // --------------------------------------------------------------------------
  const startRecording = async (targetId = 'question') => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert('आपके ब्राउज़र में वॉइस रिकॉर्डिंग समर्थित नहीं है।');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];

      let mimeType = 'audio/webm';
      if (!MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = MediaRecorder.isTypeSupported('audio/mp4') ? 'audio/mp4' : '';
      }

      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      recorder.onstop = () => {
        stream.getTracks().forEach(track => track.stop());
        const audioBlob = new Blob(audioChunksRef.current, { type: recorder.mimeType || 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);

        if (targetId === 'question') {
          setQVoiceBlob(audioBlob);
          setQVoiceUrl(audioUrl);
          setIsRecordingQ(false);
        } else {
          setDrafts(prev => ({
            ...prev,
            [targetId]: {
              ...(prev[targetId] || {}),
              voiceBlob: audioBlob,
              voiceUrl: audioUrl,
              isRecording: false
            }
          }));
        }
      };

      recorder.start();

      if (targetId === 'question') {
        setIsRecordingQ(true);
        setQTimer(0);
        timerIntervalRef.current = setInterval(() => {
          setQTimer(t => t + 1);
        }, 1000);
      } else {
        setDrafts(prev => ({
          ...prev,
          [targetId]: {
            ...(prev[targetId] || {}),
            isRecording: true,
            timer: 0
          }
        }));
        timerIntervalRef.current = setInterval(() => {
          setDrafts(prev => {
            const cur = prev[targetId] || {};
            return {
              ...prev,
              [targetId]: { ...cur, timer: (cur.timer || 0) + 1 }
            };
          });
        }, 1000);
      }
    } catch (err) {
      console.error('Microphone access denied:', err);
      alert('माइक्रोफ़ोन एक्सेस की अनुमति नहीं मिली: ' + err.message);
    }
  };

  const stopRecording = (targetId = 'question') => {
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = null;
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  const cancelVoiceNote = (targetId = 'question') => {
    if (targetId === 'question') {
      setQVoiceBlob(null);
      setQVoiceUrl('');
      setIsRecordingQ(false);
    } else {
      setDrafts(prev => ({
        ...prev,
        [targetId]: {
          ...(prev[targetId] || {}),
          voiceBlob: null,
          voiceUrl: '',
          isRecording: false
        }
      }));
    }
  };

  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --------------------------------------------------------------------------
  // ASK QUESTION SUBMISSION
  // --------------------------------------------------------------------------
  const handleAskSubmit = async (e) => {
    e.preventDefault();
    if (!qForm.title.trim() && !qVoiceBlob) {
      setQMsg({ text: 'कृपया प्रश्न का शीर्षक लिखें या वॉइस नोट रिकॉर्ड करें!', type: 'error' });
      return;
    }

    setSubmittingQ(true);
    setQMsg({ text: '', type: '' });

    try {
      const fd = new FormData();
      fd.append('title', qForm.title.trim() || '🎤 वॉइस डाउट (Voice Question)');
      fd.append('question', qForm.question.trim());
      fd.append('subject', qForm.subject);
      fd.append('classGrade', qForm.classGrade);

      fd.append('studentId', currentUserId);
      fd.append('studentName', user?.name || (isMentor ? 'Mentor' : 'विद्यार्थी'));
      fd.append('studentAvatar', user?.avatar || '');
      fd.append('studentRole', user?.role || 'student');

      if (qVoiceBlob) {
        fd.append('attachment', qVoiceBlob, 'voice-question.webm');
      } else if (qAttachment) {
        fd.append('attachment', qAttachment);
      }

      await API.post('/discussions', fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setQMsg({ text: 'सफलतापूर्वक पोस्ट हो गया!', type: 'success' });
      setTimeout(() => {
        setShowAskModal(false);
        setQForm({
          title: '',
          question: '',
          subject: 'Mathematics (गणित)',
          classGrade: 'Class 10'
        });
        setQAttachment(null);
        setQVoiceBlob(null);
        setQVoiceUrl('');
        setQMsg({ text: '', type: '' });
        fetchQuestions();
      }, 1200);
    } catch (err) {
      setQMsg({ text: err.response?.data?.error || 'पोस्ट करने में त्रुटि आई।', type: 'error' });
    } finally {
      setSubmittingQ(false);
    }
  };

  // --------------------------------------------------------------------------
  // ANSWER / REPLY SUBMISSION
  // --------------------------------------------------------------------------
  const handleSendReply = async (questionId) => {
    const draft = drafts[questionId] || {};
    const hasText = draft.text && draft.text.trim();
    const hasVoice = Boolean(draft.voiceBlob);
    const hasFile = Boolean(draft.file);

    if (!hasText && !hasVoice && !hasFile) {
      alert('कृपया कुछ टाइप करें, फ़ोटो/PDF जोड़ें अथवा वॉइस नोट रिकॉर्ड करें!');
      return;
    }

    setDrafts(prev => ({
      ...prev,
      [questionId]: { ...draft, submitting: true }
    }));

    try {
      const fd = new FormData();
      fd.append('content', hasText ? draft.text.trim() : (hasVoice ? '🎤 वॉइस समाधान (Voice Solution)' : '📎 संलग्न दस्तावेज'));
      fd.append('authorId', currentUserId);
      fd.append('authorName', user?.name || (isMentor ? 'Mentor' : 'विद्यार्थी'));
      fd.append('authorRole', user?.role || (isMentor ? 'mentor' : 'student'));
      fd.append('authorAvatar', user?.avatar || '');

      if (hasVoice) {
        fd.append('attachment', draft.voiceBlob, 'voice-answer.webm');
      } else if (hasFile) {
        fd.append('attachment', draft.file);
      }

      await API.post(`/discussions/${questionId}/answers`, fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      // Clear draft
      setDrafts(prev => ({
        ...prev,
        [questionId]: { text: '', file: null, voiceBlob: null, voiceUrl: '', isRecording: false, timer: 0, submitting: false }
      }));

      fetchQuestions();
    } catch (err) {
      alert('उत्तर सबमिट करने में त्रुटि: ' + (err.response?.data?.error || err.message));
      setDrafts(prev => ({
        ...prev,
        [questionId]: { ...draft, submitting: false }
      }));
    }
  };

  // --------------------------------------------------------------------------
  // EMOJI REACTIONS (QUESTION & ANSWER)
  // --------------------------------------------------------------------------
  const handleReactQuestion = async (questionId, emoji) => {
    if (!currentUserId) return;
    try {
      const res = await API.post(`/discussions/${questionId}/react`, {
        emoji,
        userId: currentUserId
      });
      // Optimistically update question reactions
      setQuestions(prev => prev.map(q => {
        if (q._id === questionId) {
          return { ...q, reactions: res.data.reactions };
        }
        return q;
      }));
    } catch (err) {
      console.error('Reaction failed:', err);
    }
  };

  const handleReactAnswer = async (questionId, answerId, emoji) => {
    if (!currentUserId) return;
    try {
      const res = await API.post(`/discussions/${questionId}/answers/${answerId}/react`, {
        emoji,
        userId: currentUserId
      });
      setQuestions(prev => prev.map(q => {
        if (q._id === questionId) {
          return {
            ...q,
            answers: q.answers.map(a => {
              if (a._id === answerId) {
                return { ...a, reactions: res.data.reactions };
              }
              return a;
            })
          };
        }
        return q;
      }));
    } catch (err) {
      console.error('Answer reaction failed:', err);
    }
  };

  const handleMarkResolved = async (questionId) => {
    try {
      await API.patch(`/discussions/${questionId}/resolve`);
      fetchQuestions();
    } catch (err) {
      alert('अपडेट विफल: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteQuestion = async (questionId) => {
    if (!window.confirm('क्या आप इस प्रश्न को हटाना चाहते हैं?')) return;
    try {
      await API.delete(`/discussions/${questionId}`);
      fetchQuestions();
    } catch (err) {
      alert('हटाने में त्रुटि: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteAnswer = async (questionId, answerId) => {
    if (!window.confirm('क्या आप इस उत्तर को हटाना चाहते हैं?')) return;
    try {
      await API.delete(`/discussions/${questionId}/answers/${answerId}`);
      fetchQuestions();
    } catch (err) {
      alert('उत्तर हटाने में त्रुटि: ' + (err.response?.data?.error || err.message));
    }
  };

  const toggleExpand = (id) => {
    setExpandedIds(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'resolved':
        return { label: '🟢 हल हो चुका (Resolved)', bg: '#dcfce7', text: '#15803d' };
      case 'answered':
        return { label: '🟡 उत्तर प्राप्त (Answered)', bg: '#fef3c7', text: '#92400e' };
      default:
        return { label: '🔴 अनसुलझा (Open Doubt)', bg: '#fee2e2', text: '#991b1b' };
    }
  };

  const getFullFileUrl = (path) => {
    if (!path) return '';
    return path.startsWith('http') ? path : `${BACKEND_URL}${path}`;
  };

  return (
    <div>
      {/* Top Banner & Ask Question / Challenge */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '12px',
        marginBottom: '18px',
        background: '#fff',
        padding: '16px 20px',
        borderRadius: '12px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 2px 6px rgba(0,0,0,0.04)'
      }}>
        <div>
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>💬</span> डाउट एवं चर्चा फ़ोरम (Interactive Q&A Community)
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            WhatsApp-स्टाइल कम्युनिटी फ़ोरम: मेंटॉर्स और छात्र टेक्स्ट, फ़ोटो, PDF या <strong>🎤 वॉइस नोट</strong> द्वारा सीधे सवाल व समाधान साझा कर सकते हैं।
          </p>
        </div>

        <button
          onClick={() => setShowAskModal(true)}
          style={{
            padding: '10px 18px',
            background: isMentor ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
            color: '#fff',
            border: 'none',
            borderRadius: '8px',
            fontWeight: '700',
            fontSize: '13px',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.12)'
          }}
        >
          {isMentor ? '🎓 + नया प्रश्न या चुनौती पूछें' : '❓ + नया सवाल पूछें (Ask a Question)'}
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div style={{
        display: 'flex',
        gap: '10px',
        flexWrap: 'wrap',
        alignItems: 'center',
        marginBottom: '18px',
        background: '#fff',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }}>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
        >
          <option value="">-- सभी स्थितियां (All Status) --</option>
          <option value="open">🔴 अनसुलझे सवाल (Open)</option>
          <option value="answered">🟡 उत्तर प्राप्त (Answered)</option>
          <option value="resolved">🟢 हल हो चुके (Resolved)</option>
        </select>

        <select
          value={selectedSubject}
          onChange={(e) => setSelectedSubject(e.target.value)}
          style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
        >
          <option value="">-- सभी विषय (All Subjects) --</option>
          {SUBJECT_LIST.map(s => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 सवाल, विषय या छात्र खोजें..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            flex: 1,
            minWidth: '180px'
          }}
        />
      </div>

      {/* Questions Feed */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          ⏳ चर्चाएं लोड हो रही हैं...
        </div>
      ) : questions.length === 0 ? (
        <div style={{ background: '#fff', padding: '36px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '36px' }}>💬</span>
          <h4 style={{ margin: '12px 0 6px 0', color: '#1e293b' }}>कोई चर्चा उपलब्ध नहीं है</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            ऊपर दिए गए बटन पर क्लिक करके पहला सवाल या वॉइस नोट पोस्ट करें!
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {questions.map((q) => {
            const statusBadge = getStatusBadge(q.status);
            const isOwner = String(q.studentId) === currentUserId;
            const canManage = isOwner || isMentor || isAdmin;
            const isExpanded = expandedIds[q._id] !== false;
            const draft = drafts[q._id] || { text: '', file: null, voiceBlob: null, voiceUrl: '', isRecording: false, timer: 0, submitting: false };
            const isQuestionAuthorMentor = q.studentRole === 'mentor';

            return (
              <div
                key={q._id}
                style={{
                  background: '#fff',
                  border: q.status === 'resolved' ? '1.5px solid #86efac' : '1px solid #cbd5e1',
                  borderRadius: '14px',
                  padding: '18px 20px',
                  boxShadow: '0 2px 10px rgba(0,0,0,0.03)',
                  transition: 'all 0.2s ease'
                }}
              >
                {/* Question Author Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <img
                      src={getImageSrc(q.studentAvatar)}
                      alt={q.studentName}
                      style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: isQuestionAuthorMentor ? '2px solid #d97706' : '2px solid #3b82f6' }}
                      onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                    />
                    <div>
                      <div style={{ fontWeight: '700', fontSize: '14.5px', color: '#0f172a', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span>{q.studentName}</span>
                        {isQuestionAuthorMentor ? (
                          <span style={{ fontSize: '11px', background: '#fef3c7', color: '#92400e', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                            Mentor
                          </span>
                        ) : (
                          <span style={{ fontSize: '11px', background: '#eff6ff', color: '#1d4ed8', padding: '1px 6px', borderRadius: '10px', fontWeight: 'bold' }}>
                            Student
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#64748b', marginTop: '1px' }}>
                        {q.classGrade && q.classGrade !== 'All' ? `${q.classGrade} · ` : ''}
                        {new Date(q.createdAt).toLocaleDateString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span style={{
                      background: statusBadge.bg,
                      color: statusBadge.text,
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11.5px',
                      fontWeight: '700'
                    }}>
                      {statusBadge.label}
                    </span>
                    <span style={{
                      background: '#f1f5f9',
                      color: '#475569',
                      padding: '4px 9px',
                      borderRadius: '6px',
                      fontSize: '11.5px',
                      fontWeight: '600'
                    }}>
                      📖 {q.subject}
                    </span>
                  </div>
                </div>

                {/* Question Title & Content */}
                <h4 style={{ margin: '0 0 8px 0', fontSize: '16.5px', color: '#0f172a', fontWeight: '800' }}>
                  {q.title}
                </h4>

                {q.question && (
                  <p style={{ margin: '0 0 12px 0', fontSize: '14px', color: '#334155', lineHeight: 1.55, whiteSpace: 'pre-line' }}>
                    {q.question}
                  </p>
                )}

                {/* Voice Note Player on Question */}
                {q.audioUrl && (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px solid #e2e8f0',
                    borderRadius: '10px',
                    padding: '10px 14px',
                    marginBottom: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    maxWidth: '420px'
                  }}>
                    <span style={{ fontSize: '20px' }}>🎤</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#64748b', marginBottom: '4px' }}>
                        वॉइस संदेश (Voice Question):
                      </div>
                      <audio controls src={getFullFileUrl(q.audioUrl)} style={{ width: '100%', height: '36px' }} />
                    </div>
                  </div>
                )}

                {/* Attachment: Image or PDF */}
                {q.attachmentUrl && (
                  <div style={{ marginBottom: '14px' }}>
                    {q.attachmentType === 'pdf' || q.attachmentUrl.toLowerCase().endsWith('.pdf') ? (
                      <a
                        href={getFullFileUrl(q.attachmentUrl)}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '8px 14px',
                          background: '#f1f5f9',
                          color: '#1e293b',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '13px',
                          fontWeight: 'bold',
                          border: '1px solid #cbd5e1'
                        }}
                      >
                        📄 संलग्न PDF दस्तावेज देखें / डाउनलोड करें ↗
                      </a>
                    ) : (
                      <a href={getFullFileUrl(q.attachmentUrl)} target="_blank" rel="noreferrer">
                        <img
                          src={getFullFileUrl(q.attachmentUrl)}
                          alt="Question Attachment"
                          style={{ maxWidth: '100%', maxHeight: '320px', borderRadius: '8px', border: '1px solid #e2e8f0', objectFit: 'contain' }}
                        />
                      </a>
                    )}
                  </div>
                )}

                {/* Question Emoji Reactions Bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {EMOJI_OPTIONS.map(emoji => {
                    const reaction = q.reactions?.find(r => r.emoji === emoji);
                    const count = reaction ? reaction.count : 0;
                    const isUserReacted = reaction?.userIds?.some(u => String(u) === currentUserId);

                    return (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => handleReactQuestion(q._id, emoji)}
                        title={`प्रतिक्रिया दें: ${emoji}`}
                        style={{
                          padding: '3px 8px',
                          borderRadius: '16px',
                          border: isUserReacted ? '1.5px solid #2563eb' : '1px solid #e2e8f0',
                          background: isUserReacted ? '#eff6ff' : '#f8fafc',
                          color: '#1e293b',
                          fontSize: '12px',
                          fontWeight: isUserReacted ? 'bold' : 'normal',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          transition: 'all 0.15s ease'
                        }}
                      >
                        <span>{emoji}</span>
                        {count > 0 && <span style={{ fontSize: '11px', color: '#475569' }}>{count}</span>}
                      </button>
                    );
                  })}
                </div>

                {/* Bottom Bar: Replies Toggle & Status/Delete Actions */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px solid #f1f5f9',
                  paddingTop: '10px',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <button
                    onClick={() => toggleExpand(q._id)}
                    style={{
                      background: isExpanded ? '#eff6ff' : '#f8fafc',
                      color: '#2563eb',
                      border: '1px solid #bfdbfe',
                      padding: '6px 14px',
                      borderRadius: '6px',
                      fontSize: '12.5px',
                      fontWeight: '700',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px'
                    }}
                  >
                    💬 {isExpanded ? 'चैट छुपाएं' : 'उत्तर एवं चैट देखें'} ({q.answers?.length || 0})
                  </button>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    {canManage && q.status !== 'resolved' && (
                      <button
                        onClick={() => handleMarkResolved(q._id)}
                        style={{
                          padding: '6px 12px',
                          background: '#dcfce7',
                          color: '#166534',
                          border: '1px solid #86efac',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer'
                        }}
                      >
                        ✓ हल हुआ मार्क करें
                      </button>
                    )}

                    {(isOwner || isAdmin) && (
                      <button
                        onClick={() => handleDeleteQuestion(q._id)}
                        title="प्रश्न हटाएं"
                        style={{
                          padding: '6px 10px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: 'bold',
                          cursor: 'pointer'
                        }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                </div>

                {/* WhatsApp Style In-Thread Replies / Chat Flow */}
                {isExpanded && (
                  <div style={{ marginTop: '16px', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#475569', marginBottom: '10px' }}>
                      💬 उत्तर एवं चर्चा धागा (Conversation Thread):
                    </div>

                    {/* Answers List */}
                    {(!q.answers || q.answers.length === 0) ? (
                      <div style={{ padding: '14px', background: '#f8fafc', borderRadius: '8px', textAlign: 'center', fontSize: '12.5px', color: '#64748b', marginBottom: '14px' }}>
                        अभी इस प्रश्न का कोई उत्तर नहीं है। नीचे दिए गए बॉक्स से टाइप करके, फोटो जोड़कर या <strong>🎤 बोलकर</strong> पहला समाधान भेजें!
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
                        {q.answers.map((ans) => {
                          const isMentorAns = ans.isVerifiedByMentor || ans.authorRole === 'mentor';
                          const isMyAnswer = String(ans.authorId) === currentUserId;

                          return (
                            <div
                              key={ans._id}
                              style={{
                                padding: '12px 16px',
                                borderRadius: '12px',
                                background: isMentorAns ? '#fffbeb' : '#f8fafc',
                                border: isMentorAns ? '1.5px solid #fde68a' : '1px solid #e2e8f0',
                                boxShadow: isMentorAns ? '0 2px 8px rgba(217, 119, 6, 0.08)' : 'none',
                                position: 'relative'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <img
                                    src={getImageSrc(ans.authorAvatar)}
                                    alt={ans.authorName}
                                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                                    onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                                  />
                                  <strong style={{ fontSize: '13px', color: '#0f172a' }}>{ans.authorName}</strong>
                                  {isMentorAns ? (
                                    <span style={{
                                      background: '#fef3c7',
                                      color: '#92400e',
                                      padding: '2px 7px',
                                      borderRadius: '12px',
                                      fontSize: '10.5px',
                                      fontWeight: '700',
                                      border: '1px solid #fde68a'
                                    }}>
                                      ⭐ मेंटॉर द्वारा सत्यापित समाधान
                                    </span>
                                  ) : (
                                    <span style={{
                                      background: '#eff6ff',
                                      color: '#1d4ed8',
                                      padding: '2px 7px',
                                      borderRadius: '12px',
                                      fontSize: '10.5px',
                                      fontWeight: '600'
                                    }}>
                                      🎓 साथी छात्र द्वारा समाधान
                                    </span>
                                  )}
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>
                                    {new Date(ans.createdAt).toLocaleDateString('hi-IN', { hour: '2-digit', minute: '2-digit' })}
                                  </span>
                                  {(isMyAnswer || isAdmin) && (
                                    <button
                                      onClick={() => handleDeleteAnswer(q._id, ans._id)}
                                      title="उत्तर हटाएं"
                                      style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: '12px', cursor: 'pointer' }}
                                    >
                                      ✕
                                    </button>
                                  )}
                                </div>
                              </div>

                              {ans.content && (
                                <p style={{ margin: '4px 0 6px 0', fontSize: '13px', color: '#334155', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                                  {ans.content}
                                </p>
                              )}

                              {/* Audio Player for Voice Solution */}
                              {ans.audioUrl && (
                                <div style={{
                                  background: '#fff',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '8px',
                                  padding: '8px 12px',
                                  marginTop: '6px',
                                  marginBottom: '6px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  maxWidth: '380px'
                                }}>
                                  <span>🔊</span>
                                  <audio controls src={getFullFileUrl(ans.audioUrl)} style={{ width: '100%', height: '32px' }} />
                                </div>
                              )}

                              {/* Attachment: Image or PDF on Answer */}
                              {ans.attachmentUrl && (
                                <div style={{ marginTop: '6px' }}>
                                  {ans.attachmentType === 'pdf' || ans.attachmentUrl.toLowerCase().endsWith('.pdf') ? (
                                    <a
                                      href={getFullFileUrl(ans.attachmentUrl)}
                                      target="_blank"
                                      rel="noreferrer"
                                      style={{ fontSize: '12px', color: '#2563eb', textDecoration: 'none', fontWeight: 'bold' }}
                                    >
                                      📄 संलग्न समाधान PDF देखें / खोलें ↗
                                    </a>
                                  ) : (
                                    <a href={getFullFileUrl(ans.attachmentUrl)} target="_blank" rel="noreferrer">
                                      <img
                                        src={getFullFileUrl(ans.attachmentUrl)}
                                        alt="Answer Attachment"
                                        style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '6px', border: '1px solid #e2e8f0', marginTop: '4px', objectFit: 'contain' }}
                                      />
                                    </a>
                                  )}
                                </div>
                              )}

                              {/* Answer Reactions */}
                              <div style={{ display: 'flex', gap: '4px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                                {EMOJI_OPTIONS.map(emoji => {
                                  const r = ans.reactions?.find(x => x.emoji === emoji);
                                  const count = r ? r.count : 0;
                                  const isReacted = r?.userIds?.some(u => String(u) === currentUserId);
                                  return (
                                    <button
                                      key={emoji}
                                      type="button"
                                      onClick={() => handleReactAnswer(q._id, ans._id, emoji)}
                                      style={{
                                        padding: '2px 6px',
                                        borderRadius: '12px',
                                        border: isReacted ? '1px solid #2563eb' : '1px solid #e2e8f0',
                                        background: isReacted ? '#eff6ff' : '#fff',
                                        fontSize: '11px',
                                        cursor: 'pointer'
                                      }}
                                    >
                                      {emoji} {count > 0 ? count : ''}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    {/* WhatsApp Style Reply Composer */}
                    <div style={{
                      background: '#f8fafc',
                      border: '1.5px solid #cbd5e1',
                      borderRadius: '12px',
                      padding: '12px 14px'
                    }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 'bold', color: '#1e293b', marginBottom: '6px' }}>
                        {isMentor ? '🎓 मेंटॉर के रूप में समाधान दें (Reply as Mentor):' : '✏️ अपना उत्तर या विचार साझा करें:'}
                      </div>

                      {/* Text Input */}
                      <textarea
                        rows={2}
                        placeholder="यहाँ उत्तर टाइप करें (या नीचे से फोटो, PDF या माइक से बोलकर भेजें)..."
                        value={draft.text || ''}
                        onChange={(e) => setDrafts(prev => ({
                          ...prev,
                          [q._id]: { ...draft, text: e.target.value }
                        }))}
                        style={{
                          width: '100%',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          border: '1px solid #cbd5e1',
                          fontSize: '13px',
                          boxSizing: 'border-box',
                          resize: 'vertical',
                          fontFamily: 'inherit'
                        }}
                      />

                      {/* Audio Recording Status Indicator */}
                      {draft.isRecording && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '8px 12px',
                          background: '#fee2e2',
                          color: '#991b1b',
                          borderRadius: '8px',
                          marginTop: '8px',
                          fontSize: '12.5px',
                          fontWeight: 'bold'
                        }}>
                          <span style={{ display: 'inline-block', width: '10px', height: '10px', borderRadius: '50%', background: '#dc2626', animation: 'pulse 1s infinite' }}></span>
                          🔴 रिकॉर्डिंग जारी है... ({formatTimer(draft.timer || 0)})
                          <button
                            type="button"
                            onClick={() => stopRecording(q._id)}
                            style={{
                              marginLeft: 'auto',
                              padding: '4px 10px',
                              background: '#dc2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              fontWeight: 'bold'
                            }}
                          >
                            ⏹ रोकें (Done)
                          </button>
                        </div>
                      )}

                      {/* Audio Preview if Recorded */}
                      {draft.voiceUrl && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '10px',
                          padding: '6px 12px',
                          background: '#ecfdf5',
                          border: '1px solid #a7f3d0',
                          borderRadius: '8px',
                          marginTop: '8px'
                        }}>
                          <span style={{ fontSize: '16px' }}>🎤</span>
                          <audio controls src={draft.voiceUrl} style={{ flex: 1, height: '32px' }} />
                          <button
                            type="button"
                            onClick={() => cancelVoiceNote(q._id)}
                            title="वॉइस नोट हटाएं"
                            style={{ padding: '4px 8px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                          >
                            🗑️
                          </button>
                        </div>
                      )}

                      {/* File attachment preview */}
                      {draft.file && (
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          padding: '4px 10px',
                          background: '#eff6ff',
                          borderRadius: '6px',
                          marginTop: '8px',
                          fontSize: '12px',
                          color: '#1e40af'
                        }}>
                          <span>📎 {draft.file.name}</span>
                          <button
                            type="button"
                            onClick={() => setDrafts(prev => ({ ...prev, [q._id]: { ...draft, file: null } }))}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold', marginLeft: 'auto' }}
                          >
                            ✕
                          </button>
                        </div>
                      )}

                      {/* Controls Bar: Attach File, Mic Button, Send Button */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: '10px',
                        flexWrap: 'wrap',
                        gap: '8px'
                      }}>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          {/* File input */}
                          <input
                            type="file"
                            accept="image/*,.pdf,.doc,.docx"
                            id={`file-input-${q._id}`}
                            style={{ display: 'none' }}
                            onChange={(e) => setDrafts(prev => ({
                              ...prev,
                              [q._id]: { ...draft, file: e.target.files[0] }
                            }))}
                          />
                          <label
                            htmlFor={`file-input-${q._id}`}
                            style={{
                              padding: '6px 12px',
                              background: '#fff',
                              border: '1px solid #cbd5e1',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              fontWeight: '600',
                              color: '#334155'
                            }}
                          >
                            📎 फ़ोटो / PDF
                          </label>

                          {/* Voice Record Button */}
                          {!draft.isRecording && !draft.voiceUrl && (
                            <button
                              type="button"
                              onClick={() => startRecording(q._id)}
                              style={{
                                padding: '6px 12px',
                                background: '#fff',
                                border: '1px solid #f87171',
                                color: '#dc2626',
                                borderRadius: '6px',
                                fontSize: '12px',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '4px',
                                fontWeight: '700'
                              }}
                            >
                              🎤 वॉइस रिकॉर्ड करें
                            </button>
                          )}
                        </div>

                        {/* Send Reply Button */}
                        <button
                          type="button"
                          disabled={draft.submitting || draft.isRecording}
                          onClick={() => handleSendReply(q._id)}
                          style={{
                            padding: '8px 20px',
                            background: isMentor ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            fontSize: '13px',
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)'
                          }}
                        >
                          {draft.submitting ? 'भेजा जा रहा है...' : (isMentor ? '⭐ समाधान भेजें' : '🚀 उत्तर भेजें')}
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Ask Question / Challenge Modal (For both Student & Mentor) */}
      {showAskModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000,
          padding: '16px'
        }}>
          <div style={{
            background: '#fff',
            borderRadius: '14px',
            width: '100%',
            maxWidth: '560px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '24px',
            boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
              <h3 style={{ margin: 0, color: '#0f172a' }}>
                {isMentor ? '🎓 नया प्रश्न या चुनौती पूछें (Post Question / Challenge)' : '❓ नया प्रश्न / डाउट पूछें (Ask a Question)'}
              </h3>
              <button
                onClick={() => setShowAskModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {qMsg.text && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '14px',
                background: qMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: qMsg.type === 'success' ? '#166534' : '#991b1b',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>
                {qMsg.text}
              </div>
            )}

            <form onSubmit={handleAskSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  प्रश्न का शीर्षक (Question Title) *
                </label>
                <input
                  type="text"
                  required={!qVoiceBlob}
                  placeholder="उदा. त्रिकोणमिति में सर्वसमिका sin²θ + cos²θ = 1 समझाइए"
                  value={qForm.title}
                  onChange={(e) => setQForm({ ...qForm, title: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    विषय (Subject) *
                  </label>
                  <select
                    value={qForm.subject}
                    onChange={(e) => setQForm({ ...qForm, subject: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    {SUBJECT_LIST.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    कक्षा (Class Grade)
                  </label>
                  <select
                    value={qForm.classGrade}
                    onChange={(e) => setQForm({ ...qForm, classGrade: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    {CLASS_LIST.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  प्रश्न का विस्तृत विवरण (Detailed Explanation)
                </label>
                <textarea
                  rows={3}
                  placeholder="अपना सवाल विस्तार से लिखें..."
                  value={qForm.question}
                  onChange={(e) => setQForm({ ...qForm, question: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              {/* Voice Note Recording for Question */}
              <div style={{ marginBottom: '14px', background: '#f8fafc', padding: '10px 14px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <div style={{ fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '6px' }}>
                  🎤 अथवा बोलकर पूछें (Voice Note Doubt):
                </div>

                {isRecordingQ ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#dc2626', fontWeight: 'bold', fontSize: '13px' }}>
                    🔴 रिकॉर्डिंग... ({formatTimer(qTimer)})
                    <button
                      type="button"
                      onClick={() => stopRecording('question')}
                      style={{ padding: '4px 10px', background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', fontSize: '12px', cursor: 'pointer' }}
                    >
                      ⏹ रोकें
                    </button>
                  </div>
                ) : qVoiceUrl ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <audio controls src={qVoiceUrl} style={{ flex: 1, height: '32px' }} />
                    <button
                      type="button"
                      onClick={() => cancelVoiceNote('question')}
                      style={{ padding: '4px 8px', background: '#fee2e2', color: '#991b1b', border: 'none', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      🗑️
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => startRecording('question')}
                    style={{ padding: '6px 12px', background: '#fff', border: '1px solid #f87171', color: '#dc2626', borderRadius: '6px', fontSize: '12px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    🎤 वॉइस रिकॉर्डिंग शुरू करें
                  </button>
                )}
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  प्रश्न की फोटो या PDF अटैचमेंट (Optional Photo / PDF)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => setQAttachment(e.target.files[0])}
                  style={{ width: '100%', padding: '7px', fontSize: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowAskModal(false)}
                  style={{ padding: '10px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={submittingQ || isRecordingQ}
                  style={{
                    padding: '10px 22px',
                    background: isMentor ? 'linear-gradient(135deg, #d97706, #b45309)' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  {submittingQ ? 'पोस्ट हो रहा है...' : '🚀 सवाल पोस्ट करें (Submit Question)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DiscussionForumView;
