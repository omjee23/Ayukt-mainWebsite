import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import API, { getImageSrc } from '../config/api';

const FESTIVAL_CATEGORIES = [
  { value: 'लोक पर्व व पावन उत्सव', label: '🌸 लोक पर्व व पावन उत्सव (Diwali, Chhath, Holi, Janmashtami...)' },
  { value: 'राष्ट्रीय दिवस व पर्व', label: '🇮🇳 राष्ट्रीय दिवस व पर्व (Independence Day, Republic Day...)' },
  { value: 'प्रेरणादायक विचार व सीख', label: '💡 विशेष प्रेरणादायक संदेश (Inspirational & Moral Thoughts)' },
  { value: 'सामाजिक चेतना व पर्यावरण', label: '🌿 सामाजिक चेतना व पर्यावरण (Social & Green Harmony)' }
];

export default function FestivalMessagePortal({ user }) {
  const userId = user?._id || user?.id;
  const userRole = user?.role || 'student';
  const userName = user?.name || 'सदस्य';

  const [myPosts, setMyPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState(FESTIVAL_CATEGORIES[0].value);
  const [content, setContent] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const fileInputRef = useRef(null);

  // Fetch logged-in user's own submissions
  const fetchMySubmissions = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await API.get(`/community-posts/my-posts/${userId}`);
      setMyPosts(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      console.error('Failed to fetch user submissions:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchMySubmissions();
  }, [fetchMySubmissions]);

  // Handle Image Selection
  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('फ़ोटो का आकार 5MB से कम होना चाहिए।');
      return;
    }

    setImageFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result);
    };
    reader.readAsDataURL(file);
    setErrorMsg('');
  };

  const handleClearImage = () => {
    setImageFile(null);
    setImagePreview('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Submit Festival Message
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      setErrorMsg('कृपया शीर्षक और संदेश दोनों दर्ज करें।');
      return;
    }

    setSubmitting(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('category', category);
      formData.append('content', content.trim());
      formData.append('authorId', userId);
      formData.append('authorName', userName);
      formData.append('authorRole', userRole);
      if (user?.avatar) {
        formData.append('authorAvatar', user.avatar);
      }

      if (imageFile) {
        formData.append('imageFile', imageFile);
      } else if (imagePreview) {
        formData.append('mediaUrl', imagePreview);
      }

      const res = await API.post('/community-posts/create', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccessMsg(
        res.data?.message ||
        '✅ आपका पर्व/शुभकामना संदेश एडमिन समीक्षा के लिए सबमिट कर दिया गया है! अप्रूवल के बाद यह मुख्य वेबसाइट पर लाइव हो जाएगा।'
      );

      // Reset form
      setTitle('');
      setContent('');
      setCategory(FESTIVAL_CATEGORIES[0].value);
      handleClearImage();

      // Refresh submissions
      fetchMySubmissions();
    } catch (err) {
      setErrorMsg(err.response?.data?.error || 'संदेश सबमिट करने में त्रुटि हुई। कृपया पुनः प्रयास करें।');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ maxWidth: '980px', margin: '0 auto' }}>
      {/* 1. Header Banner & Information */}
      <div
        style={{
          background: 'linear-gradient(135deg, #0d2822 0%, #173d35 70%, #204b41 100%)',
          borderRadius: '16px',
          padding: '24px 28px',
          color: '#ffffff',
          marginBottom: '24px',
          boxShadow: '0 8px 24px rgba(23, 61, 53, 0.15)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px'
        }}
      >
        <div style={{ flex: 1, minWidth: '280px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(212, 175, 55, 0.18)', borderRadius: '20px', border: '1px solid #d4af37', marginBottom: '8px' }}>
            <span style={{ fontSize: '13px' }}>🌸</span>
            <span style={{ fontSize: '11px', fontWeight: '800', color: '#fef08a', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              पर्व व विशेष संदेश मंच • FESTIVAL & SPECIAL MESSAGES
            </span>
          </div>
          <h2 style={{ margin: '4px 0 8px 0', fontSize: '22px', fontFamily: 'Georgia, serif', color: '#ffffff' }}>
            पर्व-उत्सव व पावन संदेश साझा करें
          </h2>
          <p style={{ margin: 0, fontSize: '13px', color: '#d1fae5', lineHeight: '1.6' }}>
            अपने विचार, लोक-पर्व, राष्ट्रीय दिवस या विशेष उत्सव का संदेश व फ़ोटो मुख्य वेबसाइट पर प्रकाशित कराने हेतु यहाँ सबमिट करें। 
            एडमिन अनुमोदन (Approval) के बाद यह संदेश मुख्य वेबसाइट पर <strong>'समाचार व पर्व (News & Notices ➔ विशेष संदेश व पर्व)'</strong> सेक्शन में सार्वजनिक रूप से लाइव दिखेगा।
          </p>
        </div>

        <div>
          <Link
            to="/news"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              background: '#e8b35a',
              color: '#173d35',
              borderRadius: '8px',
              fontWeight: '800',
              fontSize: '13px',
              textDecoration: 'none',
              boxShadow: '0 4px 14px rgba(0,0,0,0.25)',
              whiteSpace: 'nowrap'
            }}
          >
            <span>🌐 लाइव संदेश देखें</span>
            <span>➔</span>
          </Link>
        </div>
      </div>

      {/* 2. Success and Error Alerts */}
      {successMsg && (
        <div
          style={{
            padding: '14px 18px',
            background: '#ecfdf5',
            border: '1px solid #a7f3d0',
            color: '#065f46',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13.5px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '18px' }}>🎉</span>
          <div style={{ flex: 1 }}>{successMsg}</div>
          <button
            onClick={() => setSuccessMsg('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#065f46', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            padding: '14px 18px',
            background: '#fef2f2',
            border: '1px solid #fecaca',
            color: '#991b1b',
            borderRadius: '10px',
            marginBottom: '20px',
            fontSize: '13.5px',
            fontWeight: '600',
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          <span style={{ fontSize: '18px' }}>⚠️</span>
          <div style={{ flex: 1 }}>{errorMsg}</div>
          <button
            onClick={() => setErrorMsg('')}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#991b1b', fontWeight: 'bold' }}
          >
            ✕
          </button>
        </div>
      )}

      {/* 3. Message Creation Form Card */}
      <div
        style={{
          background: '#ffffff',
          borderRadius: '14px',
          border: '1px solid #cbd5e1',
          padding: '24px',
          marginBottom: '32px',
          boxShadow: '0 4px 14px rgba(0,0,0,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
          <span style={{ fontSize: '20px' }}>✍️</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '17px', color: '#173d35', fontFamily: 'Georgia, serif' }}>
              नया पर्व / शुभकामना संदेश सबमिट करें
            </h3>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              प्रेषक: <strong>{userName}</strong> ({userRole === 'mentor' ? 'मेंटर' : userRole === 'student' ? 'विद्यार्थी' : userRole})
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Row 1: Title and Category */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#173d35' }}>
                संदेश का शीर्षक (Title) *
              </label>
              <input
                type="text"
                placeholder="उदा. दीपावली की हार्दिक शुभकामनाएं / शिक्षक दिवस का संदेश..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#173d35' }}>
                अवसर / श्रेणी (Category) *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13.5px',
                  boxSizing: 'border-box',
                  background: '#ffffff',
                  outline: 'none'
                }}
              >
                {FESTIVAL_CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Message Content */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#173d35' }}>
              संदेश / विचार (Detailed Message) *
            </label>
            <textarea
              rows="4"
              placeholder="यहाँ अपने पर्व की शुभकामनाएं, पावन संदेश या विचार विस्तार से लिखें..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '12px 14px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13.5px',
                lineHeight: '1.6',
                boxSizing: 'border-box',
                resize: 'vertical',
                outline: 'none'
              }}
            />
          </div>

          {/* Row 3: Photo / Greeting Poster Upload */}
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontSize: '13px', fontWeight: '700', color: '#173d35' }}>
              फ़ोटो या शुभकामना कार्ड पोस्टर (Photo / Poster) - वैकल्पिक (Optional)
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
                id="festival-image-input"
              />
              <label
                htmlFor="festival-image-input"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '9px 16px',
                  background: '#f1f5f9',
                  border: '1px solid #cbd5e1',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: '600',
                  color: '#334155',
                  transition: 'background 0.2s'
                }}
              >
                <span>📷 फ़ोटो / पोस्टर चुनें</span>
              </label>

              {imageFile && (
                <span style={{ fontSize: '12.5px', color: '#166534', fontWeight: '600' }}>
                  ✓ {imageFile.name} ({(imageFile.size / 1024).toFixed(0)} KB)
                </span>
              )}

              {imagePreview && (
                <button
                  type="button"
                  onClick={handleClearImage}
                  style={{
                    background: '#fee2e2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    padding: '6px 12px',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer',
                    fontWeight: '700'
                  }}
                >
                  ✕ फ़ोटो हटाएं
                </button>
              )}
            </div>

            {/* Thumbnail Preview */}
            {imagePreview && (
              <div style={{ marginTop: '12px', display: 'inline-block', position: 'relative' }}>
                <img
                  src={imagePreview}
                  alt="Preview"
                  style={{
                    maxHeight: '180px',
                    maxWidth: '320px',
                    borderRadius: '8px',
                    border: '2px solid #d4af37',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    display: 'block'
                  }}
                />
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginTop: '6px', borderTop: '1px solid #f1f5f9', paddingTop: '14px' }}>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              🔒 सुरक्षित मॉडरेशन: सबमिट करने पर पोस्ट एडमिन समीक्षा के लिए जाएगी।
            </span>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '11px 24px',
                background: submitting ? '#94a3b8' : 'linear-gradient(135deg, #173d35 0%, #204b41 100%)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '700',
                cursor: submitting ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 12px rgba(23, 61, 53, 0.25)',
                transition: 'transform 0.15s ease'
              }}
            >
              {submitting ? 'सबमिट किया जा रहा है...' : '🚀 संदेश एडमिन समीक्षा के लिए भेजें'}
            </button>
          </div>
        </form>
      </div>

      {/* 4. Logged-in User's Submitted Messages */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ margin: 0, fontSize: '18px', color: '#173d35', fontFamily: 'Georgia, serif', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span>📜 मेरे सबमिट किए गए संदेश</span>
            <span style={{ fontSize: '12px', background: '#e2ebe4', color: '#173d35', padding: '2px 8px', borderRadius: '12px', fontWeight: '800' }}>
              {myPosts.length}
            </span>
          </h3>
          <button
            onClick={fetchMySubmissions}
            style={{ background: 'none', border: 'none', color: '#2563eb', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            🔄 रीफ्रेश करें
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '30px', color: '#64748b' }}>लोड हो रहा है...</div>
        ) : myPosts.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '40px 20px',
              background: '#ffffff',
              borderRadius: '12px',
              border: '1px dashed #cbd5e1'
            }}
          >
            <div style={{ fontSize: '38px', marginBottom: '10px' }}>🌸</div>
            <h4 style={{ margin: '0 0 6px 0', color: '#173d35', fontSize: '16px' }}>आपने अभी कोई पर्व या विशेष संदेश सबमिट नहीं किया है</h4>
            <p style={{ margin: 0, color: '#64748b', fontSize: '13px' }}>
              ऊपर दिए गए फॉर्म से अपना पहला पर्व व शुभकामना संदेश लिखें और मुख्य वेबसाइट पर प्रकाशित करवाएं!
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {myPosts.map((post) => {
              const imageSrc = post.mediaUrl ? getImageSrc(post.mediaUrl) : null;
              const isApproved = post.status === 'approved';
              const isRejected = post.status === 'rejected';

              return (
                <div
                  key={post._id}
                  style={{
                    background: '#ffffff',
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    padding: '18px 20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                    borderLeft: isApproved ? '5px solid #10b981' : isRejected ? '5px solid #ef4444' : '5px solid #f59e0b'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '10px' }}>
                    <div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#f1f5f9',
                          color: '#475569',
                          textTransform: 'uppercase'
                        }}
                      >
                        {post.category || 'विशेष संदेश'}
                      </span>
                      <h4 style={{ margin: '6px 0 2px 0', fontSize: '16px', color: '#173d35', fontFamily: 'Georgia, serif' }}>
                        {post.title}
                      </h4>
                      <span style={{ fontSize: '11.5px', color: '#94a3b8' }}>
                        सबमिट तिथि: {post.createdAt ? new Date(post.createdAt).toLocaleDateString('hi-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''}
                      </span>
                    </div>

                    <div>
                      {isApproved ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: '#dcfce7', color: '#166534', fontSize: '12px', fontWeight: '800' }}>
                          🟢 स्वीकृत एवं लाइव (Live on Website)
                        </span>
                      ) : isRejected ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: '#fee2e2', color: '#991b1b', fontSize: '12px', fontWeight: '800' }}>
                          🔴 अस्वीकृत (Rejected)
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px', borderRadius: '20px', background: '#fef3c7', color: '#b45309', fontSize: '12px', fontWeight: '800' }}>
                          🟡 समीक्षाधीन (Under Admin Review)
                        </span>
                      )}
                    </div>
                  </div>

                  <p style={{ margin: '8px 0', color: '#334155', fontSize: '13.5px', lineHeight: '1.6' }}>
                    {post.content}
                  </p>

                  {imageSrc && (
                    <div style={{ marginTop: '10px', marginBottom: '10px' }}>
                      <img
                        src={imageSrc}
                        alt={post.title}
                        style={{ maxHeight: '160px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                      />
                    </div>
                  )}

                  {isRejected && post.rejectionReason && (
                    <div style={{ marginTop: '8px', padding: '8px 12px', background: '#fef2f2', borderRadius: '6px', fontSize: '12px', color: '#991b1b' }}>
                      <strong>अस्वीकृति का कारण:</strong> {post.rejectionReason}
                    </div>
                  )}

                  {isApproved && (
                    <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'flex-end' }}>
                      <Link
                        to="/news"
                        style={{
                          fontSize: '12.5px',
                          color: '#065f46',
                          fontWeight: '800',
                          textDecoration: 'none',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px'
                        }}
                      >
                        <span>🌐 मुख्य वेबसाइट (विशेष संदेश व पर्व) पर देखें</span>
                        <span>➔</span>
                      </Link>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
