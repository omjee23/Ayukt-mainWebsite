import React, { useState, useEffect, useCallback } from 'react';
import { API, BACKEND_URL } from '../config/api';

const MATERIAL_TYPES = [
  { key: '', label: 'सभी प्रकार (All Types)' },
  { key: 'pyq', label: '📜 पिछले वर्षों के प्रश्न (PYQ)' },
  { key: 'notes', label: '📝 नोट्स (Notes)' },
  { key: 'question_set', label: '❓ प्रश्न सेट (Question Sets)' },
  { key: 'sample_paper', label: '📋 मॉडल / सैंपल पेपर' },
  { key: 'syllabus', label: '🧭 सिलेबस व गाइड' },
  { key: 'other', label: '📁 अन्य अध्ययन सामग्री' }
];

const SUBJECT_LIST = [
  'Mathematics (गणित)',
  'Science (विज्ञान)',
  'English (अंग्रेजी)',
  'Hindi (हिंदी)',
  'Social Science (सामाजिक विज्ञान)',
  'Computer / Coding (कम्प्यूटर शिक्षा)',
  'General Knowledge',
  'Physics',
  'Chemistry',
  'Biology'
];

const CLASS_LIST = ['All', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12'];

const StudyMaterialsView = ({ user, canUpload = false, themeColor = '#2563eb' }) => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Upload Modal State
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    materialType: 'notes',
    subject: 'Mathematics (गणित)',
    classGrade: 'All',
    externalUrl: ''
  });
  const [materialFile, setMaterialFile] = useState(null);

  const fetchMaterials = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedType) params.append('materialType', selectedType);
      if (selectedSubject) params.append('subject', selectedSubject);
      if (selectedClass) params.append('classGrade', selectedClass);
      if (searchQuery) params.append('search', searchQuery);

      const res = await API.get(`/materials?${params.toString()}`);
      setMaterials(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to load study materials:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedType, selectedSubject, selectedClass, searchQuery]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.subject) {
      setFormMsg({ text: 'कृपया शीर्षक और विषय अवश्य चुनें!', type: 'error' });
      return;
    }

    if (!materialFile && !formData.externalUrl.trim()) {
      setFormMsg({ text: 'कृपया कोई PDF फ़ाइल चुनें या गूगल ड्राइव लिंक दर्ज करें!', type: 'error' });
      return;
    }

    setUploading(true);
    setFormMsg({ text: '', type: '' });

    try {
      const uploadData = new FormData();
      uploadData.append('title', formData.title.trim());
      uploadData.append('description', formData.description.trim());
      uploadData.append('materialType', formData.materialType);
      uploadData.append('subject', formData.subject);
      uploadData.append('classGrade', formData.classGrade);
      if (formData.externalUrl) uploadData.append('externalUrl', formData.externalUrl.trim());

      uploadData.append('uploaderId', user?._id || user?.id || '');
      uploadData.append('uploaderName', user?.name || 'Mentor');
      uploadData.append('uploaderRole', user?.role || 'mentor');

      if (materialFile) {
        uploadData.append('file', materialFile);
      }

      await API.post('/materials', uploadData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormMsg({ text: 'अध्ययन सामग्री सफलतापूर्वक अपलोड हो गई!', type: 'success' });
      setTimeout(() => {
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          materialType: 'notes',
          subject: 'Mathematics (गणित)',
          classGrade: 'All',
          externalUrl: ''
        });
        setMaterialFile(null);
        setFormMsg({ text: '', type: '' });
        fetchMaterials();
      }, 1500);
    } catch (err) {
      setFormMsg({ text: err.response?.data?.error || 'अपलोड में त्रुटि आई। कृपया पुनः प्रयास करें।', type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async (item) => {
    try {
      await API.post(`/materials/${item._id}/download`);
    } catch (e) {
      console.warn('Could not record download:', e);
    }

    const targetUrl = item.fileUrl 
      ? (item.fileUrl.startsWith('http') ? item.fileUrl : `${BACKEND_URL}${item.fileUrl}`)
      : item.externalUrl;

    if (targetUrl) {
      window.open(targetUrl, '_blank', 'noopener,noreferrer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('क्या आप निश्चित रूप से इस सामग्री को हटाना चाहते हैं?')) return;
    try {
      await API.delete(`/materials/${id}`);
      fetchMaterials();
    } catch (err) {
      alert('हटाने में त्रुटि आई: ' + (err.response?.data?.error || err.message));
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'pyq': return { label: '📜 PYQ पेपर', bg: '#fef3c7', text: '#92400e' };
      case 'notes': return { label: '📝 नोट्स', bg: '#e0f2fe', text: '#0369a1' };
      case 'question_set': return { label: '❓ प्रश्न सेट', bg: '#f3e8ff', text: '#6b21a8' };
      case 'sample_paper': return { label: '📋 सैंपल पेपर', bg: '#dcfce7', text: '#15803d' };
      case 'syllabus': return { label: '🧭 सिलेबस / गाइड', bg: '#ffedd5', text: '#c2410c' };
      default: return { label: '📁 अध्ययन सामग्री', bg: '#f1f5f9', text: '#334155' };
    }
  };

  const currentUserId = String(user?._id || user?.id || '');
  const isAdmin = user?.role === 'admin';

  return (
    <div>
      {/* Top Banner & Upload Action */}
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
          <h3 style={{ margin: 0, color: '#0f172a', fontSize: '18px', fontWeight: '800' }}>
            📚 अध्ययन सामग्री व नोट्स आर्काइव (Study Material & PYQ Sets)
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            विभिन्न कक्षाओं के पिछले वर्षों के प्रश्न (PYQs), नोट्स, मॉडल पेपर एवं प्रतियोगी परीक्षा की शिक्षण सामग्री।
          </p>
        </div>

        {canUpload && (
          <button
            onClick={() => setShowModal(true)}
            style={{
              padding: '10px 18px',
              background: 'linear-gradient(135deg, #d97706, #b45309)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 4px 12px rgba(217, 119, 6, 0.25)'
            }}
          >
            📤 + नई सामग्री अपलोड करें (Upload Notes/PYQ)
          </button>
        )}
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
        {/* Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
        >
          {MATERIAL_TYPES.map(t => (
            <option key={t.key} value={t.key}>{t.label}</option>
          ))}
        </select>

        {/* Subject Filter */}
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

        {/* Class Filter */}
        <select
          value={selectedClass}
          onChange={(e) => setSelectedClass(e.target.value)}
          style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px' }}
        >
          <option value="">-- सभी कक्षाएं (All Classes) --</option>
          {CLASS_LIST.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder="🔍 शीर्षक या विषय खोजें..."
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

      {/* Material Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          ⏳ अध्ययन सामग्री लोड हो रही है...
        </div>
      ) : materials.length === 0 ? (
        <div style={{ background: '#fff', padding: '36px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '36px' }}>📚</span>
          <h4 style={{ margin: '12px 0 6px 0', color: '#1e293b' }}>कोई अध्ययन सामग्री नहीं मिली</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            इस फ़िल्टर के तहत अभी कोई नोट्स या PYQ उपलब्ध नहीं है। कृपया फ़िल्टर बदलें या नई सामग्री अपलोड करें।
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '16px' }}>
          {materials.map((item) => {
            const badge = getTypeBadge(item.materialType);
            const canDelete = isAdmin || String(item.uploaderId) === currentUserId;

            return (
              <div
                key={item._id}
                style={{
                  background: '#fff',
                  border: '1px solid #cbd5e1',
                  borderRadius: '12px',
                  padding: '18px',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{
                      background: badge.bg,
                      color: badge.text,
                      padding: '3px 8px',
                      borderRadius: '4px',
                      fontSize: '11px',
                      fontWeight: 'bold'
                    }}>
                      {badge.label}
                    </span>
                    <span style={{ fontSize: '11px', color: '#64748b' }}>
                      {item.classGrade && item.classGrade !== 'All' ? `कक्षा: ${item.classGrade}` : 'सभी कक्षाएं'}
                    </span>
                  </div>

                  <h4 style={{ margin: '6px 0 6px 0', fontSize: '15px', color: '#0f172a', fontWeight: '700' }}>
                    {item.title}
                  </h4>

                  <div style={{ fontSize: '12px', color: '#0369a1', fontWeight: '600', marginBottom: '6px' }}>
                    📖 {item.subject}
                  </div>

                  {item.description && (
                    <p style={{ margin: 0, fontSize: '12.5px', color: '#475569', lineHeight: 1.45 }}>
                      {item.description}
                    </p>
                  )}

                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b', display: 'flex', justifyContent: 'space-between' }}>
                    <span>अपलोडर: <strong>{item.uploaderName}</strong></span>
                    <span>📥 {item.downloadsCount || 0} डाउनलोड</span>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <button
                    onClick={() => handleDownload(item)}
                    style={{
                      flex: 1,
                      padding: '9px 12px',
                      background: themeColor,
                      color: '#fff',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '13px',
                      fontWeight: 'bold',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    📥 देखें एवं डाउनलोड करें (PDF/Link)
                  </button>

                  {canDelete && (
                    <button
                      onClick={() => handleDelete(item._id)}
                      title="सामग्री हटाएं"
                      style={{
                        padding: '9px 12px',
                        background: '#fee2e2',
                        color: '#991b1b',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        cursor: 'pointer'
                      }}
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Upload Modal Form */}
      {showModal && (
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
              <h3 style={{ margin: 0, color: '#0f172a' }}>📤 नई अध्ययन सामग्री / PYQ अपलोड करें</h3>
              <button 
                onClick={() => setShowModal(false)}
                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            {formMsg.text && (
              <div style={{
                padding: '10px 14px',
                borderRadius: '8px',
                marginBottom: '14px',
                background: formMsg.type === 'success' ? '#dcfce7' : '#fee2e2',
                color: formMsg.type === 'success' ? '#166534' : '#991b1b',
                fontWeight: 'bold',
                fontSize: '13px'
              }}>
                {formMsg.text}
              </div>
            )}

            <form onSubmit={handleUploadSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  सामग्री का शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. कक्षा 10 विज्ञान अध्याय 1 PYQs (2018-2024)"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    प्रकार (Material Type) *
                  </label>
                  <select
                    value={formData.materialType}
                    onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    <option value="pyq">📜 पिछले वर्षों के प्रश्न (PYQ)</option>
                    <option value="notes">📝 नोट्स (Notes)</option>
                    <option value="question_set">❓ प्रश्न सेट (Question Sets)</option>
                    <option value="sample_paper">📋 सैंपल पेपर (Model Paper)</option>
                    <option value="syllabus">🧭 सिलेबस व गाइड</option>
                    <option value="other">📁 अन्य सामग्री</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    कक्षा (Class Grade)
                  </label>
                  <select
                    value={formData.classGrade}
                    onChange={(e) => setFormData({ ...formData, classGrade: e.target.value })}
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
                  विषय (Subject) *
                </label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                >
                  {SUBJECT_LIST.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  फ़ाइल चुनें (PDF / Word / Image - अधिकतम 25MB)
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                  onChange={(e) => setMaterialFile(e.target.files[0])}
                  style={{ width: '100%', padding: '7px', fontSize: '12px', border: '1px dashed #cbd5e1', borderRadius: '8px' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  अथवा गूगल ड्राइव / बाहरी लिंक (External / Google Drive Link)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/file/d/..."
                  value={formData.externalUrl}
                  onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  विवरण व निर्देश (Optional Description)
                </label>
                <textarea
                  rows={3}
                  placeholder="इस सामग्री के बारे में कोई विशेष बात या पढ़ने का निर्देश..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box', resize: 'vertical' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '10px 18px', background: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  रद्द करें
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {uploading ? 'अपलोड हो रहा है...' : '📤 अपलोड करें (Submit)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudyMaterialsView;
