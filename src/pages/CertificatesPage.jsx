import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import CertificateModal from '../components/CertificateModal';
import API from '../config/api';

export default function CertificatesPage() {
  const { user } = useContext(AuthContext);
  const [myCertificates, setMyCertificates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestMsg, setRequestMsg] = useState({ type: '', text: '' });

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    category: 'Participation',
    rank: ''
  });

  // Preview & Download Modal State
  const [selectedCert, setSelectedCert] = useState(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // Fetch Certificates
  const fetchMyCertificates = useCallback(async () => {
    const userId = user?._id || user?.id;
    if (!userId) return;

    try {
      const res = await API.get(`/certificates/my-certificates/${userId}`);
      setMyCertificates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchMyCertificates();
    }
  }, [user, fetchMyCertificates]);

  // Submit Certificate Request
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestMsg({ type: '', text: '' });

    const userId = user?._id || user?.id;
    if (!userId) {
      setRequestMsg({ type: 'error', text: 'यूजर आईडी उपलब्ध नहीं है।' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        recipientId: userId,
        recipientName: user.name || 'User',
        recipientRole: user.role || 'student',
        title: formData.title,
        category: formData.category,
        rank: formData.rank
      };

      await API.post('/certificates/request', payload);
      setRequestMsg({ type: 'success', text: 'Certificate Request Sent Successfully! Pending Admin Approval.' });
      setFormData({ title: '', category: 'Participation', rank: '' });
    } catch (err) {
      setRequestMsg({ type: 'error', text: err.response?.data?.error || 'Failed to submit request' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '10px 0', maxWidth: '1000px', margin: '0 auto', fontFamily: "'Avenir Next', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <div style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '11.5px', fontWeight: '800', color: '#e8b35a', textTransform: 'uppercase', letterSpacing: '0.14em' }}>CREDENTIALS & RECOGNITION</span>
        <h2 style={{ fontSize: '26px', color: '#173d35', fontFamily: 'Georgia, serif', margin: '4px 0 0 0' }}>
          प्रमाणपत्र पोर्टल (Certificates Hub)
        </h2>
      </div>

      {/* SECTION 1: REQUEST CERTIFICATE FORM */}
      <div className="dashboard-card" style={{ padding: '28px', marginBottom: '28px' }}>
        <div style={{ borderBottom: '1px solid #e2ebe4', paddingBottom: '14px', marginBottom: '20px' }}>
          <h3 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '20px' }}>📜 नए प्रमाणपत्र के लिए आवेदन करें</h3>
        </div>

        {requestMsg.text && (
          <div style={{ padding: '12px 16px', borderRadius: '8px', marginBottom: '18px', backgroundColor: requestMsg.type === 'success' ? '#e9f0e6' : '#fee2e2', color: requestMsg.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${requestMsg.type === 'success' ? '#bbf7d0' : '#fecaca'}`, fontWeight: '600', fontSize: '13.5px' }}>
            {requestMsg.text}
          </div>
        )}

        <form onSubmit={handleRequestSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '700', fontSize: '12.5px', color: '#173d35' }}>प्रोग्राम या इवेंट का शीर्षक *</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="उदा. Youth Leadership Bootcamp 2026"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', boxSizing: 'border-box', outline: 'none', background: '#ffffff', fontSize: '13.5px' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '700', fontSize: '12.5px', color: '#173d35' }}>श्रेणी (Category)</label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', boxSizing: 'border-box', outline: 'none', background: '#ffffff', fontSize: '13.5px' }}
            >
              <option value="Participation">सहभागिता (Participation)</option>
              <option value="Merit">योग्यता / विजेता (Merit / Winner)</option>
              <option value="Completion">पूर्णता (Completion)</option>
              <option value="Appreciation">प्रशंसा पत्र (Appreciation)</option>
            </select>
          </div>

          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: '700', fontSize: '12.5px', color: '#173d35' }}>पद / रैंक (यदि लागू हो)</label>
            <input
              type="text"
              value={formData.rank}
              onChange={(e) => setFormData({ ...formData, rank: e.target.value })}
              placeholder="उदा. 1st Position / Active Contributor"
              style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #dce7d9', boxSizing: 'border-box', outline: 'none', background: '#ffffff', fontSize: '13.5px' }}
            />
          </div>

          <div style={{ gridColumn: '1 / -1', textAlign: 'right' }}>
            <button
              type="submit"
              disabled={loading}
              className="dashboard-btn-emerald"
              style={{ padding: '10px 24px', fontSize: '14px' }}
            >
              {loading ? 'भेजा जा रहा है...' : '🚀 आवेदन सबमिट करें'}
            </button>
          </div>
        </form>
      </div>

      {/* SECTION 2: MY APPROVED CERTIFICATES */}
      <div className="dashboard-card" style={{ padding: '28px' }}>
        <div style={{ borderBottom: '1px solid #e2ebe4', paddingBottom: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '20px' }}>🏆 स्वीकृत प्रमाणपत्र (Approved Certificates)</h3>
          <span className="dashboard-badge badge-mint">{myCertificates.length} Total</span>
        </div>

        {myCertificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#718078' }}>
            <span style={{ fontSize: '32px' }}>🎖️</span>
            <p style={{ margin: '8px 0 0 0', fontWeight: '600' }}>अभी तक कोई स्वीकृत प्रमाणपत्र उपलब्ध नहीं है।</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
            {myCertificates.map((cert) => (
              <div key={cert._id} style={{ border: '1px solid #e2ebe4', borderRadius: '10px', padding: '18px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <span className="dashboard-badge badge-mint" style={{ fontSize: '11px' }}>
                    {cert.category}
                  </span>
                  <h4 style={{ margin: '12px 0 6px 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '16px' }}>{cert.title}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#718078' }}>ID: {cert.uniqueCertId || 'N/A'}</p>
                  <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: '#718078' }}>
                    जारी तिथि: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('hi-IN') : 'TBA'}
                  </p>
                </div>

                <button
                  onClick={() => { setSelectedCert(cert); setIsPreviewOpen(true); }}
                  className="dashboard-btn-gold"
                  style={{ width: '100%', justifyContent: 'center', fontSize: '13px', padding: '9px' }}
                >
                  👁️ देखें व डाउनलोड करें (PDF)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PREVIEW & DOWNLOAD MODAL */}
      <CertificateModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        certificate={selectedCert}
      />
    </div>
  );
}