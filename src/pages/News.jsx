import React, { useState, useEffect } from 'react';
import API, { getImageSrc, BACKEND_URL } from '../config/api';
import logoImg from '../assets/logo.png';

const News = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [lightboxImage, setLightboxImage] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  // Close lightbox on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setLightboxImage(null);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const [likedPosts, setLikedPosts] = useState({});

  const fetchAnnouncements = async () => {
    try {
      setLoading(true);
      // Fetch all official announcements AND approved festival/community posts
      const [eventsRes, communityRes] = await Promise.all([
        API.get('/posts/all').catch(() => ({ data: [] })),
        API.get('/community-posts/approved').catch(() => ({ data: [] }))
      ]);

      const adminAnnouncements = (eventsRes.data || []).filter((item) => {
        const cat = item.category || '';
        return cat !== 'Event' && cat !== 'Workshop' && cat !== 'Contest' && cat !== 'Competition' && cat !== 'Debate';
      });

      // Format community posts (approved festival & special messages from students/mentors)
      const communityAnnouncements = (communityRes.data || []).map(cp => ({
        _id: cp._id,
        title: cp.title,
        description: cp.content,
        eventDate: cp.createdAt,
        category: 'विशेष संदेश व पर्व',
        originalCategory: cp.category,
        imageUrl: cp.mediaUrl,
        location: '',
        isCommunityPost: true,
        authorName: cp.authorName,
        authorRole: cp.authorRole,
        authorAvatar: cp.authorAvatar,
        likesCount: Array.isArray(cp.likes) ? cp.likes.length : (cp.likesCount || 0),
        likes: cp.likes || [],
        createdAt: cp.createdAt
      }));

      // Combine and sort newest first
      const combined = [...adminAnnouncements, ...communityAnnouncements].sort((a, b) => {
        const dateA = new Date(a.eventDate || a.createdAt || 0).getTime();
        const dateB = new Date(b.eventDate || b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      setAnnouncements(combined);
    } catch (err) {
      console.error('Failed to fetch announcements:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLikeCommunityPost = async (postId) => {
    try {
      // Get or create persistent visitor ID for anonymous/student likes
      let visitorId = localStorage.getItem('au_visitor_id');
      if (!visitorId) {
        visitorId = 'v_' + Math.random().toString(36).substring(2, 11);
        localStorage.setItem('au_visitor_id', visitorId);
      }

      const res = await API.post(`/community-posts/${postId}/like`, { userId: visitorId });
      setAnnouncements(prev => prev.map(item => {
        if (item._id === postId) {
          return { ...item, likesCount: res.data.likesCount };
        }
        return item;
      }));
      setLikedPosts(prev => ({ ...prev, [postId]: res.data.isLiked }));
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  };

  const handleShare = (item) => {
    const url = window.location.href.split('#')[0] + `#post-${item._id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setCopiedId(item._id);
      setTimeout(() => setCopiedId(null), 2500);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return new Date(dateStr).toLocaleDateString();
    }
  };

  // Filter announcements
  const filteredList = announcements.filter((item) => {
    // Category match
    if (selectedCategory !== 'ALL') {
      const cat = (item.category || '').toLowerCase();
      if (selectedCategory === 'GREETINGS') {
        if (!cat.includes('संदेश') && !cat.includes('पर्व') && !cat.includes('latest') && !cat.includes('special')) {
          return false;
        }
      } else if (selectedCategory === 'NEWS') {
        if (!cat.includes('news') && !cat.includes('समाचार')) {
          return false;
        }
      } else if (selectedCategory === 'NOTICES') {
        if (!cat.includes('notice') && !cat.includes('सूचना') && !cat.includes('परिपत्र')) {
          return false;
        }
      } else if (selectedCategory === 'EXAMS') {
        if (!cat.includes('exam') && !cat.includes('opportunity') && !cat.includes('परीक्षा') && !cat.includes('अवसर') && !cat.includes('scholarship')) {
          return false;
        }
      }
    }

    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = (item.title || '').toLowerCase().includes(q);
      const matchDesc = (item.description || '').toLowerCase().includes(q);
      const matchLoc = (item.location || '').toLowerCase().includes(q);
      const matchAuthor = (item.authorName || '').toLowerCase().includes(q);
      return matchTitle || matchDesc || matchLoc || matchAuthor;
    }

    return true;
  });

  return (
    <div style={{ background: '#fbfaf5', minHeight: '85vh', padding: 'clamp(20px, 4vw, 50px) clamp(12px, 2.5vw, 20px) 80px', fontFamily: "'Avenir Next', 'Helvetica Neue', sans-serif" }}>
      <div style={{ maxWidth: '1000px', margin: '0 auto' }}>

        {/* Section Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '5px 14px', background: '#e9f0e6', borderRadius: '30px', marginBottom: '12px', border: '1px solid #cce0d2' }}>
            <img src={logoImg} alt="Emblem" style={{ width: '18px', height: '18px', borderRadius: '50%' }} />
            <span style={{ color: '#173d35', fontSize: '11px', fontWeight: '800', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              आधिकारिक सूचना एवं समाचार पट्ट · OFFICIAL BULLETIN
            </span>
          </div>

          <h1 style={{ fontFamily: 'Georgia, serif', color: '#173d35', fontSize: 'clamp(24px, 4vw, 42px)', fontWeight: '600', margin: '0 0 12px 0', lineHeight: 1.2 }}>
            समाचार, पर्व-उत्सव एवं ताज़ा सूचनाएं
          </h1>
          <p style={{ color: '#547664', fontSize: 'clamp(13.5px, 2vw, 16px)', maxWidth: '680px', margin: '0 auto', lineHeight: '1.6' }}>
            अव्युक्त उत्थान संस्था (रजि.) की जमीनी गतिविधियां, लोक पर्व, पावन संदेश, शैक्षणिक सूचनाएं एवं जनसंवाद से जुड़ी सभी आधिकारिक घोषणाएं।
          </p>

          <div style={{ width: '80px', height: '3px', background: 'linear-gradient(90deg, #ea580c, #c4a04c, #173d35)', margin: '18px auto 0', borderRadius: '2px' }} />
        </div>

        {/* Controls Bar: Categories & Search */}
        <div style={{ 
          background: '#ffffff', 
          padding: '14px clamp(12px, 2vw, 20px)', 
          borderRadius: '12px', 
          border: '1px solid #e2ebe4', 
          boxShadow: '0 4px 16px rgba(23, 61, 53, 0.04)',
          marginBottom: '28px',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '12px',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          {/* Category Filter Pills - Touch scrollable */}
          <div className="touch-scroll-bar" style={{ alignItems: 'center', flex: '1 1 auto' }}>
            {[
              { id: 'ALL', label: 'सभी सूचनाएं (All)' },
              { id: 'GREETINGS', label: '🌸 विशेष संदेश व पर्व' },
              { id: 'NEWS', label: '📰 ताज़ा समाचार' },
              { id: 'NOTICES', label: '📢 नोटिस व परिपत्र' },
              { id: 'EXAMS', label: '🎓 प्रतियोगी परीक्षाएं' },
            ].map((cat) => {
              const active = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '24px',
                    border: active ? '1px solid #173d35' : '1px solid #dce5df',
                    background: active ? '#173d35' : '#f7faf7',
                    color: active ? '#ffffff' : '#335043',
                    fontSize: '12px',
                    fontWeight: active ? '700' : '500',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    flexShrink: 0,
                    transition: 'all 0.2s ease',
                    boxShadow: active ? '0 2px 8px rgba(23, 61, 53, 0.2)' : 'none'
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div style={{ position: 'relative', width: '100%', maxWidth: '280px', flex: '1 1 200px' }}>
            <input
              type="text"
              placeholder="खोजें (शीर्षक या शब्द)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 14px 8px 34px',
                borderRadius: '20px',
                border: '1px solid #d4dfd8',
                fontSize: '12.5px',
                outline: 'none',
                background: '#fcfdfc',
                color: '#173d35',
                boxSizing: 'border-box'
              }}
            />
            <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#7a9687', fontSize: '14px' }}>
              🔍
            </span>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  color: '#999',
                  cursor: 'pointer',
                  fontSize: '14px'
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div style={{ textAlign: 'center', padding: '60px 20px', color: '#547664' }}>
            <div style={{ display: 'inline-block', width: '36px', height: '36px', border: '3px solid #e0ebe4', borderTopColor: '#173d35', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
            <p style={{ marginTop: '14px', fontSize: '15px' }}>सूचनाएं लोड की जा रही हैं...</p>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredList.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 20px', background: '#ffffff', borderRadius: '12px', border: '1px dashed #d1ded6' }}>
            <div style={{ fontSize: '42px', marginBottom: '10px' }}>📋</div>
            <h3 style={{ fontFamily: 'Georgia, serif', color: '#173d35', margin: '0 0 8px 0' }}>कोई सूचना उपलब्ध नहीं है</h3>
            <p style={{ color: '#718078', fontSize: '14px', maxWidth: '420px', margin: '0 auto' }}>
              {searchQuery ? 'आपके द्वारा खोजे गए शब्दों से मेल खाती कोई सूचना नहीं मिली। कृपया पुनः प्रयास करें।' : 'वर्तमान में इस श्रेणी में कोई सक्रिय सूचना नहीं है। कृपया बाद में देखें।'}
            </p>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{ marginTop: '16px', padding: '8px 18px', background: '#173d35', color: '#ffffff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
              >
                सर्च साफ़ करें
              </button>
            )}
          </div>
        )}

        {/* Announcements List */}
        {!loading && filteredList.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
            {filteredList.map((item) => {
              const imageSrc = getImageSrc(item.imageUrl);
              const isFestivalOrSpecial = (item.category || '').includes('संदेश') || (item.category || '').includes('पर्व') || (item.category || '').includes('Latest') || (item.title || '').includes('जन्माष्टमी');

              return (
                <article
                  key={item._id}
                  id={`post-${item._id}`}
                  style={{
                    background: '#ffffff',
                    borderRadius: '14px',
                    border: '1px solid #e0ebe2',
                    boxShadow: '0 8px 24px rgba(23, 61, 53, 0.05)',
                    overflow: 'hidden',
                    borderTop: isFestivalOrSpecial ? '4px solid #ea580c' : '4px solid #c4a04c',
                    transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                  }}
                >
                  {/* Dedicated Poster / Image Stage (NO CROPPING: Fully contained with rich framing) */}
                  {imageSrc && (
                    <div 
                      style={{ 
                        position: 'relative',
                        background: 'linear-gradient(180deg, #0e241f 0%, #173d35 100%)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        padding: '20px 14px',
                        cursor: 'pointer',
                        borderBottom: '1px solid #e2ebe4'
                      }}
                      onClick={() => setLightboxImage(imageSrc)}
                    >
                      <img
                        src={imageSrc}
                        alt={item.title}
                        style={{
                          maxWidth: '100%',
                          maxHeight: '480px',
                          width: 'auto',
                          height: 'auto',
                          objectFit: 'contain',
                          borderRadius: '8px',
                          boxShadow: '0 8px 28px rgba(0,0,0,0.35)',
                          display: 'block'
                        }}
                      />
                      
                      {/* Zoom Indicator Badge */}
                      <div style={{
                        position: 'absolute',
                        bottom: '16px',
                        right: '18px',
                        background: 'rgba(23, 61, 53, 0.88)',
                        color: '#ffffff',
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '11px',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.25)',
                        backdropFilter: 'blur(4px)',
                        border: '1px solid rgba(255,255,255,0.2)'
                      }}>
                        🔍 पूर्ण आकार में देखें
                      </div>
                    </div>
                  )}

                  {/* Card Content */}
                  <div style={{ padding: '26px 28px' }}>

                    {/* Metadata Header: Category & Date */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        {/* Category Chip */}
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '5px',
                          padding: '4px 12px',
                          borderRadius: '16px',
                          fontSize: '12px',
                          fontWeight: '700',
                          background: isFestivalOrSpecial ? '#fff7ed' : '#e9f0e6',
                          color: isFestivalOrSpecial ? '#c2410c' : '#173d35',
                          border: isFestivalOrSpecial ? '1px solid #ffedd5' : '1px solid #cbe0d2'
                        }}>
                          {isFestivalOrSpecial ? '🌸' : '📌'} {item.category || 'आधिकारिक सूचना'}
                        </span>

                        {/* Community / Festival Sender Attribution */}
                        {item.isCommunityPost && item.authorName && (
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '5px',
                            padding: '4px 12px',
                            borderRadius: '16px',
                            fontSize: '11.5px',
                            fontWeight: '700',
                            background: '#fef3c7',
                            color: '#92400e',
                            border: '1px solid #fde68a'
                          }}>
                            <span>🌸 प्रेषक:</span>
                            <span>{item.authorName}</span>
                            <span style={{ fontSize: '10px', background: '#d97706', color: '#ffffff', padding: '1px 6px', borderRadius: '8px' }}>
                              {item.authorRole === 'mentor' ? 'मेंटर' : item.authorRole === 'student' ? 'विद्यार्थी' : 'सदस्य'}
                            </span>
                          </span>
                        )}

                        {/* Audience Chip */}
                        {item.targetAudience && item.targetAudience !== 'Open to All' && (
                          <span style={{
                            padding: '4px 10px',
                            borderRadius: '16px',
                            fontSize: '11px',
                            fontWeight: '600',
                            background: '#f1f5f9',
                            color: '#475569',
                            border: '1px solid #e2e8f0'
                          }}>
                            👥 {item.targetAudience}
                          </span>
                        )}
                      </div>

                      {/* Date Badge */}
                      <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '13px',
                        color: '#547664',
                        fontWeight: '600'
                      }}>
                        🗓️ {formatDate(item.eventDate || item.createdAt)}
                      </span>
                    </div>

                    {/* Title */}
                    <h2 style={{
                      margin: '0 0 16px 0',
                      fontFamily: 'Georgia, serif',
                      color: '#173d35',
                      fontSize: 'clamp(20px, 2.4vw, 25px)',
                      fontWeight: '600',
                      lineHeight: '1.35'
                    }}>
                      {item.title}
                    </h2>

                    {/* Location Badge (If applicable) */}
                    {item.location && item.location !== 'Avyukt Main Center / Online' && item.location !== 'NGO Main Center' && (
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: '#688574', fontSize: '12px', marginBottom: '14px', background: '#f5f8f5', padding: '4px 10px', borderRadius: '4px' }}>
                        📍 <span>स्थान: {item.location}</span>
                      </div>
                    )}

                    {/* Formatted Description */}
                    <div style={{
                      color: '#243b31',
                      fontSize: '15.5px',
                      lineHeight: '1.85',
                      whiteSpace: 'pre-line',
                      background: isFestivalOrSpecial ? 'linear-gradient(180deg, #fffcf7 0%, #ffffff 100%)' : 'transparent',
                      padding: isFestivalOrSpecial ? '16px 20px' : '0',
                      borderRadius: '8px',
                      borderLeft: isFestivalOrSpecial ? '3px solid #e8b35a' : 'none',
                      margin: '12px 0 20px 0'
                    }}>
                      {item.description}
                    </div>

                    {/* Action Bar */}
                    <div style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center', 
                      flexWrap: 'wrap', 
                      gap: '12px', 
                      paddingTop: '16px', 
                      borderTop: '1px solid #edf3ef' 
                    }}>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        {/* Dynamic Link Button */}
                        {(item.driveUrl || item.youtubeUrl) && (
                          <a
                            href={item.driveUrl || item.youtubeUrl}
                            target="_blank"
                            rel="noreferrer"
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 18px',
                              background: '#173d35',
                              color: '#ffffff',
                              textDecoration: 'none',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '700',
                              boxShadow: '0 2px 6px rgba(23, 61, 53, 0.18)',
                              transition: 'background 0.2s'
                            }}
                          >
                            <span>संबंधित दस्तावेज़ / लिंक खोलें</span>
                            <span>↗</span>
                          </a>
                        )}

                        {/* View Full Poster Button */}
                        {imageSrc && (
                          <button
                            onClick={() => setLightboxImage(imageSrc)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              background: '#f0f5f2',
                              color: '#173d35',
                              border: '1px solid #cce0d2',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer'
                            }}
                          >
                            🖼️ पोस्टर देखें
                          </button>
                        )}

                        {/* Community Post Like Button */}
                        {item.isCommunityPost && (
                          <button
                            onClick={() => handleLikeCommunityPost(item._id)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              padding: '8px 14px',
                              background: likedPosts[item._id] ? '#fee2e2' : '#f8fafc',
                              color: '#dc2626',
                              border: '1px solid #fecaca',
                              borderRadius: '6px',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease'
                            }}
                          >
                            <span>❤️</span>
                            <span>{item.likesCount || 0} लाइक्स</span>
                          </button>
                        )}
                      </div>

                      {/* Share & Copy Link Button */}
                      <button
                        onClick={() => handleShare(item)}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          background: copiedId === item._id ? '#e9f0e6' : 'transparent',
                          color: copiedId === item._id ? '#2a6a48' : '#5d7d6c',
                          border: copiedId === item._id ? '1px solid #b3d7c0' : '1px solid #dce6df',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '600',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        {copiedId === item._id ? '✓ लिंक कॉपी हो गया!' : '🔗 लिंक कॉपी करें'}
                      </button>

                      {/* WhatsApp 1-Click Share Button */}
                      <a
                        href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`📢 *${item.title}*\n\n${item.description || ''}\n\nअव्युक्त फाउंडेशन पोर्टल देखें: ${window.location.origin}/news#post-${item._id}`)}`}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '7px 14px',
                          background: '#25d366',
                          color: '#ffffff',
                          border: 'none',
                          borderRadius: '6px',
                          fontSize: '12px',
                          fontWeight: '700',
                          textDecoration: 'none',
                          cursor: 'pointer'
                        }}
                      >
                        💬 व्हाट्सएप
                      </a>
                    </div>

                  </div>
                </article>
              );
            })}
          </div>
        )}

      </div>

      {/* High-Resolution Full-Screen Lightbox Modal */}
      {lightboxImage && (
        <div 
          className="image-lightbox"
          onClick={() => setLightboxImage(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: 'rgba(14, 36, 31, 0.94)',
            backdropFilter: 'blur(6px)',
            cursor: 'zoom-out'
          }}
        >
          {/* Close Button */}
          <button
            type="button"
            aria-label="Close image"
            onClick={() => setLightboxImage(null)}
            style={{
              position: 'absolute',
              top: '20px',
              right: '24px',
              width: '44px',
              height: '44px',
              border: '1px solid rgba(255,255,255,0.4)',
              borderRadius: '50%',
              background: 'rgba(0,0,0,0.5)',
              color: '#ffffff',
              cursor: 'pointer',
              fontSize: '28px',
              lineHeight: '1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s'
            }}
          >
            ×
          </button>

          {/* Centered Image */}
          <img
            src={lightboxImage}
            alt="Full size notice poster"
            onClick={(e) => e.stopPropagation()}
            style={{
              maxWidth: 'min(1100px, 92vw)',
              maxHeight: '88vh',
              objectFit: 'contain',
              borderRadius: '8px',
              cursor: 'default',
              boxShadow: '0 24px 60px rgba(0,0,0,0.6)',
              border: '2px solid rgba(232, 179, 90, 0.4)'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default News;