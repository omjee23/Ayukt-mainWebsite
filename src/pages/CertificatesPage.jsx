import React, { useState, useEffect, useContext, useCallback } from 'react';
import { AuthContext } from '../context/AuthContext';
import CertificateModal from '../components/CertificateModal';
import API from '../config/api';

export default function CertificatesPage({ user: propUser, userId: propUserId } = {}) {
  const { user: authUser } = useContext(AuthContext);
  const user = propUser || authUser;
  const userId = propUserId || user?._id || user?.id;

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
    if (!userId) return;

    try {
      const res = await API.get(`/certificates/my-certificates/${userId}`);
      setMyCertificates(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Error fetching certificates:', err);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchMyCertificates();
    }
  }, [userId, fetchMyCertificates]);

  // Submit Certificate Request
  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestMsg({ type: '', text: '' });

    if (!userId) {
      setRequestMsg({ type: 'error', text: 'यूजर आईडी उपलब्ध नहीं है।' });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        recipientId: userId,
        recipientName: user?.name || 'User',
        recipientRole: user?.role || 'student',
        title: formData.title.trim(),
        category: formData.category,
        rank: formData.rank.trim()
      };

      await API.post('/certificates/request', payload);
      setRequestMsg({ 
        type: 'success', 
        text: '✅ प्रमाणपत्र आवेदन सफलतापूर्वक भेज दिया गया है! एडमिन द्वारा सत्यापन व अनुमोदन (Approval) के बाद आपका आधिकारिक प्रमाणपत्र यहाँ उपलब्ध होगा।' 
      });
      setFormData({ title: '', category: 'Participation', rank: '' });
      // Immediately refresh certificates list
      await fetchMyCertificates();
    } catch (err) {
      setRequestMsg({ type: 'error', text: err.response?.data?.error || 'Failed to submit request' });
    } finally {
      setLoading(false);
    }
  };

  const approvedCertificates = myCertificates.filter((cert) => cert.status === 'approved');
  const pendingCertificates = myCertificates.filter((cert) => cert.status === 'pending');
  const rejectedCertificates = myCertificates.filter((cert) => cert.status === 'rejected');

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
          <p style={{ margin: '6px 0 0 0', fontSize: '13px', color: '#64748b' }}>
            अपने द्वारा पूर्ण किए गए कार्यक्रम, कार्यशाला या उपलब्धि के लिए प्रमाणपत्र हेतु आवेदन करें। आवेदन एडमिन की समीक्षा के बाद जारी किया जाएगा।
          </p>
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

      {/* SECTION 2: PENDING REQUESTS (UNDER ADMIN REVIEW) */}
      {pendingCertificates.length > 0 && (
        <div className="dashboard-card" style={{ padding: '24px 28px', marginBottom: '28px', borderLeft: '4px solid #f59e0b', background: '#fffdf5' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>⏳</span>
              <h3 style={{ margin: 0, color: '#92400e', fontFamily: 'Georgia, serif', fontSize: '19px' }}>
                समीक्षाधीन आवेदन (Pending Admin Approval)
              </h3>
            </div>
            <span className="dashboard-badge badge-gold" style={{ fontSize: '12px' }}>
              {pendingCertificates.length} अनुरोध लंबित
            </span>
          </div>

          <p style={{ margin: '0 0 16px 0', fontSize: '13px', color: '#78350f', lineHeight: '1.5' }}>
            ℹ️ आपके द्वारा सबमिट किए गए निम्नलिखित प्रमाणपत्र आवेदन वर्तमान में एडमिन की समीक्षाधीन हैं। 
            <strong> जब तक एडमिन द्वारा इसे स्वीकृत (Approve) नहीं किया जाता, तब तक प्रमाणपत्र जारी नहीं होगा।</strong>
          </p>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {pendingCertificates.map((cert) => (
              <div 
                key={cert._id} 
                style={{ 
                  border: '1px solid #fde68a', 
                  borderRadius: '10px', 
                  padding: '16px', 
                  backgroundColor: '#ffffff',
                  boxShadow: '0 1px 3px rgba(245, 158, 11, 0.08)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                  <span className="dashboard-badge badge-gold" style={{ fontSize: '10.5px' }}>
                    {cert.category}
                  </span>
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#b45309', background: '#fef3c7', padding: '3px 8px', borderRadius: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                    🟡 समीक्षाधीन (Pending)
                  </span>
                </div>
                <h4 style={{ margin: '8px 0 6px 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '15.5px' }}>
                  {cert.title}
                </h4>
                {cert.rank && (
                  <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#64748b' }}>
                    रैंक/पद: {cert.rank}
                  </p>
                )}
                <p style={{ margin: '0 0 12px 0', fontSize: '11.5px', color: '#94a3b8' }}>
                  आवेदन तिथि: {cert.createdAt ? new Date(cert.createdAt).toLocaleDateString('hi-IN') : 'हाल ही में'}
                </p>
                <div style={{ padding: '8px 10px', background: '#f8faf9', borderRadius: '6px', border: '1px dashed #dce7d9', fontSize: '12px', color: '#4b5563', textAlign: 'center' }}>
                  🔒 एडमिन अनुमोदन के पश्चात डाउनलोड उपलब्ध होगा
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 3: REJECTED REQUESTS (IF ANY) */}
      {rejectedCertificates.length > 0 && (
        <div className="dashboard-card" style={{ padding: '24px 28px', marginBottom: '28px', borderLeft: '4px solid #ef4444', background: '#fef2f2' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>❌</span>
              <h3 style={{ margin: 0, color: '#991b1b', fontFamily: 'Georgia, serif', fontSize: '19px' }}>
                अस्वीकृत आवेदन (Rejected Requests)
              </h3>
            </div>
            <span className="dashboard-badge badge-rose" style={{ fontSize: '12px' }}>
              {rejectedCertificates.length} अस्वीकृत
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
            {rejectedCertificates.map((cert) => (
              <div key={cert._id} style={{ border: '1px solid #fecaca', borderRadius: '10px', padding: '16px', backgroundColor: '#ffffff' }}>
                <span className="dashboard-badge badge-rose" style={{ fontSize: '10.5px' }}>{cert.category}</span>
                <h4 style={{ margin: '8px 0 6px 0', color: '#991b1b', fontFamily: 'Georgia, serif', fontSize: '15.5px' }}>{cert.title}</h4>
                <p style={{ margin: 0, fontSize: '12px', color: '#dc2626' }}>
                  <strong>कारण:</strong> {cert.remarks || 'प्रशासनिक कारणों से अनुरोध अस्वीकृत किया गया है।'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: MY APPROVED CERTIFICATES (ONLY STATUS === APPROVED) */}
      <div className="dashboard-card" style={{ padding: '28px' }}>
        <div style={{ borderBottom: '1px solid #e2ebe4', paddingBottom: '14px', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ margin: 0, color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '20px' }}>
              🏆 स्वीकृत प्रमाणपत्र (Approved Certificates)
            </h3>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#64748b' }}>
              केवल एडमिन द्वारा विधिवत सत्यापित एवं अनुमोदित प्रमाणपत्र
            </p>
          </div>
          <span className="dashboard-badge badge-mint">{approvedCertificates.length} Total</span>
        </div>

        {approvedCertificates.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '36px 20px', color: '#718078' }}>
            <span style={{ fontSize: '36px', display: 'block', marginBottom: '8px' }}>🎖️</span>
            <p style={{ margin: 0, fontWeight: '600', fontSize: '14.5px', color: '#334155' }}>
              अभी तक कोई स्वीकृत प्रमाणपत्र उपलब्ध नहीं है।
            </p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12.5px', color: '#94a3b8' }}>
              यदि आपने आवेदन किया है, तो एडमिन द्वारा स्वीकृति के बाद प्रमाणपत्र यहाँ स्वतः उपलब्ध हो जाएगा।
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '18px' }}>
            {approvedCertificates.map((cert) => (
              <div key={cert._id} style={{ border: '1px solid #bbf7d0', borderRadius: '10px', padding: '18px', backgroundColor: '#ffffff', display: 'flex', flexDirection: 'column', justifyContent: 'space-between', boxShadow: '0 2px 5px rgba(22, 101, 52, 0.05)' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span className="dashboard-badge badge-mint" style={{ fontSize: '11px' }}>
                      {cert.category}
                    </span>
                    <span style={{ fontSize: '11px', fontWeight: '700', color: '#166534', background: '#dcfce7', padding: '2px 8px', borderRadius: '10px' }}>
                      ✓ स्वीकृत
                    </span>
                  </div>
                  <h4 style={{ margin: '12px 0 6px 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '16px' }}>{cert.title}</h4>
                  <p style={{ margin: 0, fontSize: '12px', color: '#718078' }}>ID: {cert.uniqueCertId || 'N/A'}</p>
                  <p style={{ margin: '4px 0 16px 0', fontSize: '12px', color: '#718078' }}>
                    जारी तिथि: {cert.issueDate ? new Date(cert.issueDate).toLocaleDateString('hi-IN') : 'उपलब्ध'}
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