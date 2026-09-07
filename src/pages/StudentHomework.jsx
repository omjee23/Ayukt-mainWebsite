import React, { useState, useEffect } from 'react';
import API from '../config/api';

const StudentHomework = ({ currentUser }) => {
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [submissionText, setSubmissionText] = useState('');
  const [submissionUrl, setSubmissionUrl] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const student = currentUser || JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    fetchClassesWithHomework();
  }, []);

  const fetchClassesWithHomework = async () => {
    try {
      const res = await API.get('/classes/all');
      // Filter classes that have homework set
      const classesWithHw = res.data.filter(c => c.homework && c.homework.trim() !== '');
      setClasses(classesWithHw);
    } catch (err) {
      console.error('Failed to fetch homework classes', err);
    }
  };

  const handleSubmitHomework = async (e) => {
    e.preventDefault();
    if (!selectedClass) return;
    
    setLoading(true);
    setMsg('');

    try {
      const payload = {
        classId: selectedClass._id,
        studentId: student?._id,
        studentName: student?.name,
        submissionText,
        submissionUrl
      };

      await API.post('/homework/submit', payload);
      setMsg('✅ Homework submitted successfully!');
      setSubmissionText('');
      setSubmissionUrl('');
      setSelectedClass(null);
    } catch (err) {
      setMsg('❌ Failed to submit homework. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
      <h3 style={{ margin: '0 0 16px 0', color: '#0f172a' }}>📝 Homework Portal</h3>
      
      {msg && (
        <div style={{ padding: '10px 14px', borderRadius: '6px', fontSize: '14px', marginBottom: '16px', backgroundColor: msg.includes('✅') ? '#dcfce7' : '#fee2e2', color: msg.includes('✅') ? '#166534' : '#991b1b' }}>
          {msg}
        </div>
      )}

      {selectedClass ? (
        <div>
          <button onClick={() => setSelectedClass(null)} style={{ padding: '6px 12px', background: '#64748b', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '16px' }}>
            ← Back to Homework List
          </button>
          
          <div style={{ background: '#fbfaf5', padding: '16px', borderRadius: '10px', marginBottom: '20px', borderLeft: '4px solid #173d35', border: '1px solid #e2e8f0' }}>
            <h4 style={{ margin: '0 0 6px 0', color: '#173d35' }}>Subject: {selectedClass.subject}</h4>
            <p style={{ margin: 0, fontSize: '14px', color: '#475569' }}><strong>Task:</strong> {selectedClass.homework}</p>
          </div>

          <form onSubmit={handleSubmitHomework}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Your Answer / Solution Details</label>
              <textarea 
                rows="4" 
                value={submissionText} 
                onChange={(e) => setSubmissionText(e.target.value)} 
                placeholder="Write your answer or solution text here..." 
                required 
                style={inputStyle} 
              />
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={labelStyle}>File / Drive Link (Optional)</label>
              <input 
                type="url" 
                value={submissionUrl} 
                onChange={(e) => setSubmissionUrl(e.target.value)} 
                placeholder="https://drive.google.com/your-file-link" 
                style={inputStyle} 
              />
            </div>

            <button type="submit" disabled={loading} style={btnPrimary}>
              {loading ? 'Submitting...' : 'Submit Homework 🚀'}
            </button>
          </form>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '16px' }}>
          {classes.length === 0 ? (
            <p style={{ color: '#64748b' }}>No pending homework assigned right now.</p>
          ) : (
            classes.map((cls) => (
              <div key={cls._id} style={{ padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0', background: '#fbfaf5', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                <div style={{ minWidth: '220px' }}>
                  <h4 style={{ margin: '0 0 4px 0', color: '#173d35' }}>{cls.subject}</h4>
                  <p style={{ margin: 0, fontSize: '13px', color: '#64748b' }}>📝 {cls.homework}</p>
                </div>
                <button onClick={() => setSelectedClass(cls)} style={{ padding: '9px 16px', backgroundColor: '#173d35', color: '#fbfaf5', border: '1px solid #e8b35a', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '13px' }}>
                  Submit Assignment 📤
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

const labelStyle = { display: 'block', marginBottom: '6px', fontSize: '14px', fontWeight: 'bold', color: '#173d35' };
const inputStyle = { width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', fontSize: '14px', boxSizing: 'border-box', outline: 'none' };
const btnPrimary = { width: '100%', padding: '12px', backgroundColor: '#173d35', color: '#fbfaf5', border: '1px solid #e8b35a', borderRadius: '8px', fontWeight: 'bold', fontSize: '15px', cursor: 'pointer' };

export default StudentHomework;