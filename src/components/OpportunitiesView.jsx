import React, { useState, useEffect, useCallback } from 'react';
import { API, getImageSrc } from '../config/api';

const OPPORTUNITY_CATEGORIES = [
  'Exam',
  'Opportunity',
  'Scholarship',
  'Navodaya',
  'Olympiad',
  'Contest',
  'Workshop',
  'Notice'
];

const OpportunitiesView = ({ user, canPost = false, themeColor = '#2563eb' }) => {
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Post Modal States
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formMsg, setFormMsg] = useState({ text: '', type: '' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Exam',
    eventDate: '',
    registrationDeadline: '',
    driveUrl: '',
    location: 'अखिल भारतीय / राज्य स्तर'
  });
  const [imageFile, setImageFile] = useState(null);

  const fetchOpportunities = useCallback(async () => {
    setLoading(true);
    try {
      const res = await API.get('/posts/all');
      const allPosts = Array.isArray(res.data) ? res.data : [];
      // Filter to relevant exam/opportunity/scholarship posts
      const opps = allPosts.filter(item => {
        const cat = (item.category || '').toLowerCase();
        const t = (item.title || '').toLowerCase();
        return cat.includes('exam') || 
               cat.includes('opportunity') || 
               cat.includes('scholarship') || 
               cat.includes('navodaya') || 
               cat.includes('olympiad') || 
               cat.includes('contest') || 
               cat.includes('notice') || 
               t.includes('नवोदय') || 
               t.includes('jee') || 
               t.includes('neet') || 
               t.includes('छात्रवृत्ति') ||
               t.includes('scholarship');
      });
      setOpportunities(opps.length > 0 ? opps : allPosts);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOpportunities();
  }, [fetchOpportunities]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      setFormMsg({ text: 'कृपया शीर्षक (Title) दर्ज करें!', type: 'error' });
      return;
    }

    setSubmitting(true);
    setFormMsg({ text: '', type: '' });

    try {
      const postData = new FormData();
      postData.append('title', formData.title.trim());
      postData.append('description', formData.description.trim());
      postData.append('category', formData.category);
      postData.append('location', formData.location);
      if (formData.eventDate) postData.append('eventDate', formData.eventDate);
      if (formData.registrationDeadline) postData.append('registrationDeadline', formData.registrationDeadline);
      if (formData.driveUrl) postData.append('driveUrl', formData.driveUrl.trim());
      
      // Poster attribution
      postData.append('postedBy', user?._id || user?.id || '');
      postData.append('postedByName', user?.name || 'Mentor');
      postData.append('postedByRole', user?.role || 'mentor');
      postData.append('status', 'published');

      if (imageFile) {
        postData.append('imageFile', imageFile);
      }

      await API.post('/events/create', postData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFormMsg({ text: 'अवसर / परीक्षा अधिसूचना सफलतापूर्वक प्रकाशित हो गई!', type: 'success' });
      setTimeout(() => {
        setShowModal(false);
        setFormData({
          title: '',
          description: '',
          category: 'Exam',
          eventDate: '',
          registrationDeadline: '',
          driveUrl: '',
          location: 'अखिल भारतीय / राज्य स्तर'
        });
        setImageFile(null);
        setFormMsg({ text: '', type: '' });
        fetchOpportunities();
      }, 1500);
    } catch (err) {
      setFormMsg({ text: err.response?.data?.error || 'प्रकाशन में त्रुटि आई। कृपया पुनः प्रयास करें।', type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  const filteredOpps = opportunities.filter(item => {
    const matchesCategory = !selectedCategory || (item.category || '').toLowerCase() === selectedCategory.toLowerCase();
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = !searchQuery || 
      (item.title || '').toLowerCase().includes(searchLower) ||
      (item.description || '').toLowerCase().includes(searchLower) ||
      (item.category || '').toLowerCase().includes(searchLower);
    return matchesCategory && matchesSearch;
  });

  return (
    <div>
      {/* Top Banner & Action Header */}
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
            🎯 प्रतियोगी परीक्षाएं व अवसर बुलेटिन (Exams & Opportunities)
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            नवोदय विद्यालय, JEE, NEET, छात्रवृत्ति, ओलंपियाड एवं राष्ट्रीय प्रतियोगिताओं के फॉर्म, दिशा-निर्देश व पीडीएफ।
          </p>
        </div>

        {canPost && (
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
            📢 + नया अवसर / परीक्षा पोस्ट करें
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div style={{ 
        display: 'flex', 
        gap: '10px', 
        flexWrap: 'wrap', 
        alignItems: 'center',
        marginBottom: '16px',
        background: '#fff',
        padding: '12px 16px',
        borderRadius: '10px',
        border: '1px solid #e2e8f0'
      }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', flex: 1 }}>
          <button
            onClick={() => setSelectedCategory('')}
            style={{
              padding: '6px 12px',
              borderRadius: '20px',
              border: !selectedCategory ? `1.5px solid ${themeColor}` : '1px solid #cbd5e1',
              background: !selectedCategory ? `${themeColor}15` : '#fff',
              color: !selectedCategory ? themeColor : '#475569',
              fontSize: '12px',
              fontWeight: !selectedCategory ? '700' : '500',
              cursor: 'pointer'
            }}
          >
            सभी (All)
          </button>
          {OPPORTUNITY_CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 12px',
                borderRadius: '20px',
                border: selectedCategory === cat ? `1.5px solid ${themeColor}` : '1px solid #cbd5e1',
                background: selectedCategory === cat ? `${themeColor}15` : '#fff',
                color: selectedCategory === cat ? themeColor : '#475569',
                fontSize: '12px',
                fontWeight: selectedCategory === cat ? '700' : '500',
                cursor: 'pointer'
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        <input
          type="text"
          placeholder="🔍 परीक्षा या अवसर खोजें..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: '7px 12px',
            borderRadius: '8px',
            border: '1px solid #cbd5e1',
            fontSize: '13px',
            minWidth: '220px'
          }}
        />
      </div>

      {/* Opportunity Cards Grid */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#64748b' }}>
          ⏳ अवसर लोड हो रहे हैं...
        </div>
      ) : filteredOpps.length === 0 ? (
        <div style={{ background: '#fff', padding: '36px', borderRadius: '12px', textAlign: 'center', border: '1px solid #e2e8f0' }}>
          <span style={{ fontSize: '36px' }}>📢</span>
          <h4 style={{ margin: '12px 0 6px 0', color: '#1e293b' }}>वर्तमान में कोई अधिसूचना प्रकाशित नहीं है</h4>
          <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>
            जैसे ही मेंटॉर या एडमिन कोई नई परीक्षा अथवा छात्रवृत्ति जोड़ेंगे, वह यहाँ प्रदर्शित होगी।
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
          {filteredOpps.map((item) => {
            const whatsappText = encodeURIComponent(`📢 *${item.title}*\n\n${item.description || ''}\n\nअव्युक्त फाउंडेशन पोर्टल से प्राप्त जानकारी: ${window.location.origin}`);
            const isMentorPost = item.postedByRole === 'mentor';

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
                  justifyContent: 'space-between',
                  position: 'relative'
                }}
              >
                <div>
                  {item.imageUrl && (
                    <img 
                      src={getImageSrc(item.imageUrl)} 
                      alt={item.title} 
                      style={{ width: '100%', height: '140px', objectFit: 'cover', borderRadius: '8px', marginBottom: '12px' }} 
                    />
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ 
                      background: '#fef3c7', 
                      color: '#92400e', 
                      padding: '3px 9px', 
                      borderRadius: '4px', 
                      fontSize: '11px', 
                      fontWeight: 'bold' 
                    }}>
                      🎓 {item.category || 'Exam / Opportunity'}
                    </span>
                    {item.eventDate && (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        📅 {new Date(item.eventDate).toLocaleDateString('hi-IN')}
                      </span>
                    )}
                  </div>

                  <h4 style={{ margin: '6px 0 6px 0', fontSize: '16px', color: '#0f172a', fontWeight: '700' }}>
                    {item.title}
                  </h4>

                  <p style={{ margin: 0, fontSize: '13px', color: '#475569', lineHeight: 1.5, whiteSpace: 'pre-line' }}>
                    {item.description}
                  </p>

                  {item.registrationDeadline && (
                    <div style={{ marginTop: '10px', fontSize: '12px', color: '#b91c1c', fontWeight: '600' }}>
                      ⏰ आवेदन की अंतिम तिथि: {new Date(item.registrationDeadline).toLocaleDateString('hi-IN')}
                    </div>
                  )}

                  {/* Uploader Attribution */}
                  <div style={{ marginTop: '10px', fontSize: '11px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <span>✍️ पोस्ट किया:</span>
                    <strong style={{ color: isMentorPost ? '#b45309' : '#0284c7' }}>
                      {item.postedByName || 'Admin'} {isMentorPost ? '(Mentor)' : '(Admin)'}
                    </strong>
                  </div>
                </div>

                <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {item.driveUrl && (
                    <a 
                      href={item.driveUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      style={{ 
                        padding: '8px 12px', 
                        background: '#f1f5f9', 
                        color: '#1e293b', 
                        borderRadius: '6px', 
                        textDecoration: 'none', 
                        fontSize: '12px', 
                        fontWeight: 'bold', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        gap: '6px' 
                      }}
                    >
                      📄 आधिकारिक नोटिफिकेशन (PDF / Link)
                    </a>
                  )}
                  <a 
                    href={`https://api.whatsapp.com/send?text=${whatsappText}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    style={{ 
                      padding: '9px 12px', 
                      background: '#25d366', 
                      color: '#fff', 
                      borderRadius: '6px', 
                      textDecoration: 'none', 
                      fontSize: '13px', 
                      fontWeight: 'bold', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '6px' 
                    }}
                  >
                    💬 व्हाट्सएप पर शेयर करें (1-Click Share)
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post Modal Form for Mentors */}
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
              <h3 style={{ margin: 0, color: '#0f172a' }}>📢 नया अवसर / परीक्षा प्रकाशित करें</h3>
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

            <form onSubmit={handleFormSubmit}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  शीर्षक (Title) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="उदा. नवोदय कक्षा 6 प्रवेश परीक्षा 2026 या JEE Main सत्र 2"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    श्रेणी (Category)
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  >
                    {OPPORTUNITY_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    परीक्षा / अवसर की तिथि
                  </label>
                  <input
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    आवेदन की अंतिम तिथि (Deadline)
                  </label>
                  <input
                    type="date"
                    value={formData.registrationDeadline}
                    onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                    स्थान / स्तर (Level)
                  </label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  आधिकारिक लिंक या PDF ड्राइव लिंक (Google Drive / Official URL)
                </label>
                <input
                  type="url"
                  placeholder="https://drive.google.com/... या https://navodaya.gov.in"
                  value={formData.driveUrl}
                  onChange={(e) => setFormData({ ...formData, driveUrl: e.target.value })}
                  style={{ width: '100%', padding: '9px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '13px', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  पोस्टर / अधिसूचना चित्र (Optional Image)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files[0])}
                  style={{ width: '100%', padding: '6px', fontSize: '12px' }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 'bold', color: '#334155', marginBottom: '4px' }}>
                  विवरण एवं पात्रता (Description & Eligibility)
                </label>
                <textarea
                  rows={4}
                  placeholder="पात्रता, आयु सीमा, आवेदन प्रक्रिया और आवश्यक दस्तावेज़ों का विवरण लिखें..."
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
                  disabled={submitting}
                  style={{ padding: '10px 22px', background: 'linear-gradient(135deg, #d97706, #b45309)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
                >
                  {submitting ? 'प्रकाशन हो रहा है...' : '🚀 प्रकाशित करें (Publish)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default OpportunitiesView;
