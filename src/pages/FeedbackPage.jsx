import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../config/api';

const FeedbackPage = () => {
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    userName: '',
    userEmail: '',
    category: 'General Suggestion',
    targetName: '',
    rating: 5,
    feedbackText: ''
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        userName: user.name || '',
        userEmail: user.email || ''
      }));
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ text: '', type: '' });

    try {
      const payload = {
        userId: user ? (user._id || user.id) : null,
        userName: formData.userName,
        userEmail: formData.userEmail,
        userRole: user ? (user.role || 'Student') : 'Guest',
        userAvatar: user ? (user.avatar || '') : '',
        category: formData.category,
        targetName: formData.targetName,
        rating: formData.rating,
        feedbackText: formData.feedbackText
      };

      const res = await API.post('/feedback', payload);

      setMsg({ text: 'आपका फ़ीडबैक सफलतापूर्वक दर्ज हो गया है! धन्यवाद।', type: 'success' });
      setFormData({
        userName: user ? user.name : '',
        userEmail: user ? user.email : '',
        category: 'General Suggestion',
        targetName: '',
        rating: 5,
        feedbackText: ''
      });
    } catch (err) {
      setMsg({ text: err.response?.data?.error || 'सर्वर से संपर्क नहीं हो सका। कृपया पुनः प्रयास करें।', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '650px', margin: '30px auto', padding: '24px 20px', background: '#fbfaf5', borderRadius: '14px', boxShadow: '0 4px 20px rgba(23,61,53,0.08)', border: '1px solid #dce9df', boxSizing: 'border-box' }}>
      <h2 style={{ color: '#173d35', marginTop: 0, textAlign: 'center', borderBottom: '2px solid #e8b35a', paddingBottom: '12px', fontFamily: 'Georgia, serif', fontSize: '24px' }}>
        फ़ीडबैक एवं सुझाव (Feedback Form)
      </h2>
      <p style={{ textAlign: 'center', color: '#475569', fontSize: '14px', marginBottom: '20px' }}>
        {user ? `नमस्ते ${user.name}! अपनी राय हमारे साथ साझा करें।` : 'गेस्ट यूज़र्स एवं सदस्य अपने सुझाव या अनुभव यहाँ साझा कर सकते हैं।'}
      </p>

      {msg.text && (
        <div style={{ padding: '12px', borderRadius: '6px', marginBottom: '15px', background: msg.type === 'success' ? '#dcfce7' : '#fee2e2', color: msg.type === 'success' ? '#166534' : '#991b1b', fontWeight: 'bold', fontSize: '14px', textAlign: 'center' }}>
          {msg.text}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div>
            <label style={labelStyle}>आपका नाम *</label>
            <input
              type="text"
              value={formData.userName}
              onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
              style={inputStyle}
              required
              disabled={!!user}
            />
          </div>
          <div>
            <label style={labelStyle}>ईमेल (ऐच्छिक)</label>
            <input
              type="email"
              value={formData.userEmail}
              onChange={(e) => setFormData({ ...formData, userEmail: e.target.value })}
              style={inputStyle}
              disabled={!!user}
            />
          </div>
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>फ़ीडबैक की श्रेणी (Category) *</label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            style={inputStyle}
          >
            <option value="Event Review">इवेंट का फ़ीडबैक (Event Review)</option>
            <option value="News Review">न्यूज़ / अपडेट का फ़ीडबैक (News Review)</option>
            <option value="Class/Session Review">क्लास का अनुभव (Class Review)</option>
            <option value="Mentor Review">मेंटॉर का रिव्यू (Mentor Review)</option>
            <option value="Volunteer Review">वॉलंटियर का रिव्यू (Volunteer Review)</option>
            <option value="Team Member Review">टीम मेंबर का रिव्यू (Team Member Review)</option>
            <option value="Issue/Complaint">शिकायत / परेशानी (Issue/Complaint)</option>
            <option value="General Suggestion">सामान्य सुझाव (General Suggestion)</option>
          </select>
        </div>

        {formData.category !== 'General Suggestion' && formData.category !== 'Issue/Complaint' && (
          <div style={{ marginBottom: '16px' }}>
            <label style={labelStyle}>विशिष्ट नाम (Event/Mentor/Class Name)</label>
            <input
              type="text"
              placeholder="उदा. Science Workshop, Amit Sir, Batch A"
              value={formData.targetName}
              onChange={(e) => setFormData({ ...formData, targetName: e.target.value })}
              style={inputStyle}
            />
          </div>
        )}

        <div style={{ marginBottom: '16px' }}>
          <label style={labelStyle}>रेटिंग (Rating) *</label>
          <div style={{ display: 'flex', gap: '8px', marginTop: '6px', cursor: 'pointer' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => setFormData({ ...formData, rating: star })}
                style={{ fontSize: '28px', color: star <= formData.rating ? '#f59e0b' : '#cbd5e1' }}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>आपका फ़ीडबैक / संदेश *</label>
          <textarea
            rows="5"
            placeholder="यहाँ अपना अनुभव या सुझाव लिखें..."
            value={formData.feedbackText}
            onChange={(e) => setFormData({ ...formData, feedbackText: e.target.value })}
            style={inputStyle}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '14px', background: '#173d35', color: '#fbfaf5', border: '1px solid #e8b35a', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', boxShadow: '0 4px 12px rgba(23,61,53,0.2)', transition: 'all 0.2s' }}
        >
          {loading ? 'सबमिट हो रहा है...' : 'फ़ीडबैक जमा करें / Submit Feedback'}
        </button>
      </form>
    </div>
  );
};

const inputStyle = { width: '100%', padding: '11px 13px', borderRadius: '8px', border: '1px solid #cbd5e1', marginTop: '4px', boxSizing: 'border-box', fontSize: '14px', outline: 'none' };
const labelStyle = { fontSize: '14px', fontWeight: '600', color: '#173d35' };

export default FeedbackPage;