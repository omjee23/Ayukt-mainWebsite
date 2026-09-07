import React, { useState } from 'react';
import API from '../config/api';

const SpecialRequestForm = ({ currentUser }) => {
  const student = currentUser || JSON.parse(localStorage.getItem('user'));

  const [category, setCategory] = useState('Academic Help');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    try {
      const payload = {
        senderId: student?._id,
        senderName: student?.name || 'Anonymous Student',
        senderUniqueId: student?.uniqueId || 'N/A',
        senderRole: student?.role || 'student',
        category,
        subject: subject.trim(),
        message: message.trim()
      };

      await API.post('/special-requests/create', payload);
      setMsg('✅ Request submitted successfully! The team will reach out soon.');
      setSubject('');
      setMessage('');
    } catch (err) {
      setMsg('❌ Failed to submit request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <h3 style={{ margin: '0 0 6px 0', color: '#0f172a' }}>🙋‍♂️ Special Help & Request Form</h3>
      <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#64748b' }}>
        Need extra guidance, tech support, or have a personal query? Submit your request below.
      </p>

      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', backgroundColor: msg.includes('✅') ? '#dcfce7' : '#fee2e2', color: msg.includes('✅') ? '#166534' : '#991b1b' }}>
          {msg}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Request Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} style={inputStyle}>
            <option value="Academic Help">Academic & Study Help</option>
            <option value="Technical Issue">Technical Support / App Issue</option>
            <option value="Mentorship Request">1-on-1 Mentorship Request</option>
            <option value="Other">Other Query</option>
          </select>
        </div>

        <div style={{ marginBottom: '14px' }}>
          <label style={labelStyle}>Subject / Title</label>
          <input 
            type="text" 
            value={subject} 
            onChange={(e) => setSubject(e.target.value)} 
            placeholder="e.g. Need extra class for Maths" 
            required 
            style={inputStyle} 
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={labelStyle}>Detailed Message</label>
          <textarea 
            rows="5" 
            value={message} 
            onChange={(e) => setMessage(e.target.value)} 
            placeholder="Describe your request or issue in detail..." 
            required 
            style={inputStyle} 
          />
        </div>

        <button type="submit" disabled={loading} style={btnPrimary}>
          {loading ? 'Sending Request...' : 'Send Request 📩'}
        </button>
      </form>
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#173d35' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
const btnPrimary = { width: '100%', padding: '12px', backgroundColor: '#173d35', color: '#fbfaf5', border: '1px solid #e8b35a', borderRadius: '8px', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s ease' };

export default SpecialRequestForm;