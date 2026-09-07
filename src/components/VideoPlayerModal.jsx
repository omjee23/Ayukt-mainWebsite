import React from 'react';

const VideoPlayerModal = ({ isOpen, onClose, videoUrl, recordingSource, title }) => {
  if (!isOpen || !videoUrl) return null;

  // Robust YouTube URL to Embed Transformer
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|shorts\/|live\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2] && match[2].length === 11) {
      return `https://www.youtube-nocookie.com/embed/${match[2]}?autoplay=1&rel=0`;
    }
    return url;
  };

  // Robust Google Drive URL to Embed Transformer
  const getGoogleDriveEmbedUrl = (url) => {
    if (!url) return '';
    const match1 = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match1 && match1[1]) return `https://drive.google.com/file/d/${match1[1]}/preview`;

    const match2 = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match2 && match2[1]) return `https://drive.google.com/file/d/${match2[1]}/preview`;

    if (/^[a-zA-Z0-9_-]{20,}$/.test(url.trim())) {
      return `https://drive.google.com/file/d/${url.trim()}/preview`;
    }

    if (url.includes('/view')) return url.replace('/view', '/preview');
    if (url.includes('/preview')) return url;
    return url;
  };

  const isYouTube = recordingSource === 'youtube' || videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be');
  const isDrive = !isYouTube && (recordingSource === 'googledrive' || videoUrl.includes('drive.google.com') || /^[a-zA-Z0-9_-]{20,}$/.test(videoUrl.trim()));

  const embedUrl = isYouTube 
    ? getYouTubeEmbedUrl(videoUrl) 
    : isDrive 
      ? getGoogleDriveEmbedUrl(videoUrl) 
      : videoUrl;

  const isDirectVideo = !isYouTube && !isDrive && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm'));

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>🎬 {title || 'Class Recording'}</h3>
            <span style={{ fontSize: '11px', color: '#64748b' }}>
              {isYouTube ? 'आधिकारिक यूट्यूब चैनल आर्काइव' : isDrive ? 'गूगल ड्राइव 7-दिवसीय बफर' : 'डायरेक्ट वीडियो लिंक'}
            </span>
          </div>
          <button style={styles.closeBtn} onClick={onClose} aria-label="Close">&times;</button>
        </div>

        {/* Source Badge */}
        <div style={styles.badgeContainer}>
          <span style={{
            ...styles.badge,
            backgroundColor: isYouTube ? '#dc2626' : '#0284c7'
          }}>
            {isYouTube ? '▶️ YouTube Archive (Unlisted HD)' : '📁 Google Drive (7-Day Active Buffer)'}
          </span>
        </div>

        {/* Video Frame Area */}
        <div style={styles.videoWrapper}>
          {isDirectVideo ? (
            <video
              controls
              autoPlay
              style={styles.iframe}
              src={embedUrl}
            />
          ) : (
            <iframe
              src={embedUrl}
              title={title || 'Recording Player'}
              style={styles.iframe}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            ></iframe>
          )}
        </div>

        {/* Footer Fallback Link */}
        <div style={styles.footer}>
          <span style={{ fontSize: '12px', color: '#64748b' }}>
            {isYouTube ? 'सुरक्षित इन-ऐप प्लेयर' : 'ड्राइव बफर प्लेयर'}
          </span>
          <a 
            href={videoUrl} 
            target="_blank" 
            rel="noopener noreferrer" 
            style={styles.externalLink}
          >
            {isYouTube ? 'यूट्यूब पर खोलें ↗' : 'ड्राइव पर खोलें ↗'}
          </a>
        </div>
      </div>
    </div>
  );
};

// Inline CSS Styles for Immediate Clean UI
const styles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '15px'
  },
  modal: {
    backgroundColor: '#ffffff',
    borderRadius: '10px',
    width: '100%',
    maxWidth: '800px',
    overflow: 'hidden',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
    display: 'flex',
    flexDirection: 'column'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '15px 20px',
    borderBottom: '1px solid #eee'
  },
  title: {
    margin: 0,
    fontSize: '1.2rem',
    color: '#333'
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: '1.8rem',
    cursor: 'pointer',
    color: '#666'
  },
  badgeContainer: {
    padding: '8px 20px',
    backgroundColor: '#f8f9fa'
  },
  badge: {
    color: '#fff',
    padding: '4px 10px',
    borderRadius: '4px',
    fontSize: '0.8rem',
    fontWeight: 'bold',
    display: 'inline-block'
  },
  videoWrapper: {
    position: 'relative',
    paddingBottom: '56.25%', /* 16:9 Aspect Ratio */
    height: 0,
    backgroundColor: '#000'
  },
  iframe: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    border: 0
  },
  footer: {
    padding: '12px 20px',
    textAlign: 'right',
    backgroundColor: '#f8f9fa',
    borderTop: '1px solid #eee'
  },
  externalLink: {
    color: '#0066cc',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: 'bold'
  }
};

export default VideoPlayerModal;