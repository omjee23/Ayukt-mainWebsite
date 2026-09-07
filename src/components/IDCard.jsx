import React from 'react';
import logoImg from '../assets/logo.png';

const ROLE_THEMES = {
  guest: {
    name: 'Guest',
    title: 'OFFICIAL GUEST PASS',
    hindiTitle: 'अतिथि पहचान पत्र',
    idLabel: 'Guest ID',
    primary: '#7c3aed', // Premium Royal Purple
    accent: '#6d28d9',
    border: '#7c3aed',
    badgeBg: '#f3e8ff', // Soft Lavender Tint
    badgeText: '#581c87', // Deep Royal Violet
    headerBg: 'linear-gradient(135deg, #2e1065 0%, #581c87 35%, #7c3aed 70%, #9333ea 100%)',
    avatarRing: '#7c3aed'
  },
  student: {
    name: 'Student',
    title: 'OFFICIAL STUDENT ID CARD',
    hindiTitle: 'विद्यार्थी पहचान पत्र',
    idLabel: 'Student ID',
    primary: '#2563eb', // Blue
    accent: '#1d4ed8',
    border: '#2563eb',
    badgeBg: '#eff6ff',
    badgeText: '#1d4ed8',
    headerBg: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #3b82f6 100%)',
    avatarRing: '#2563eb'
  },
  volunteer: {
    name: 'Volunteer',
    title: 'OFFICIAL VOLUNTEER ID CARD',
    hindiTitle: 'स्वयंसेवक पहचान पत्र',
    idLabel: 'Volunteer ID',
    primary: '#059669', // Green
    accent: '#16a34a',
    border: '#059669',
    badgeBg: '#f0fdf4',
    badgeText: '#065f46',
    headerBg: 'linear-gradient(135deg, #064e3b 0%, #059669 50%, #10b981 100%)',
    avatarRing: '#059669'
  },
  mentor: {
    name: 'Mentor',
    title: 'OFFICIAL MENTOR ID CARD',
    hindiTitle: 'मार्गदर्शक पहचान पत्र',
    idLabel: 'Mentor ID',
    primary: '#d97706', // Premium Golden Yellow
    accent: '#b45309',
    border: '#d97706',
    badgeBg: '#fefce8',
    badgeText: '#92400e',
    headerBg: 'linear-gradient(135deg, #78350f 0%, #b45309 30%, #d97706 70%, #fbbf24 100%)',
    avatarRing: '#d97706'
  },
  admin: {
    name: 'Admin',
    title: 'OFFICIAL ADMIN ID CARD',
    hindiTitle: 'प्रशासक पहचान पत्र',
    idLabel: 'Admin ID',
    primary: '#0f172a',
    accent: '#334155',
    border: '#0f172a',
    badgeBg: '#f1f5f9',
    badgeText: '#0f172a',
    headerBg: 'linear-gradient(135deg, #020617 0%, #0f172a 60%, #334155 100%)',
    avatarRing: '#d97706'
  }
};

const IDCard = ({ user }) => {
  if (!user) return null;

  const roleKey = (user.role || '').toLowerCase().trim();
  const theme = ROLE_THEMES[roleKey] || ROLE_THEMES.student;

  const isStudent = roleKey === 'student';
  const isMentor = roleKey === 'mentor';
  const isVolunteer = roleKey === 'volunteer';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '20px 0' }}>
      {/* Printable Official ID Card */}
      <div id="digital-id-card" style={{ ...cardContainerStyle, borderColor: theme.border }}>
        {/* Top Gold Metallic Accent Line */}
        <div style={{ height: '4px', background: 'linear-gradient(90deg, #e8b35a, #fff, #e8b35a)' }} />

        {/* Card Header Banner */}
        <div style={{ ...headerStyle, background: theme.headerBg }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
            <img
              src={logoImg}
              alt="AU Logo"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#ffffff',
                padding: '1.5px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                border: '1.5px solid rgba(255,255,255,0.9)',
                flexShrink: 0
              }}
            />
            <div style={{ textAlign: 'left' }}>
              <strong style={{ fontSize: '15px', letterSpacing: '.4px', display: 'block', textShadow: '0 1px 3px rgba(0,0,0,0.35)', lineHeight: 1.15 }}>
                अव्युक्त उत्थान संस्था
              </strong>
              <span style={{ fontSize: '9px', letterSpacing: '0.8px', opacity: 0.95, textTransform: 'uppercase', display: 'block', marginTop: '2px' }}>
                Avyukt Utthan Sanstha
              </span>
            </div>
          </div>

          <div style={{
            marginTop: '8px',
            padding: '3px 12px',
            borderRadius: '12px',
            backgroundColor: 'rgba(255, 255, 255, 0.18)',
            border: '1px solid rgba(255, 255, 255, 0.25)',
            backdropFilter: 'blur(4px)',
            fontSize: '11px',
            fontWeight: '700',
            letterSpacing: '.5px',
            display: 'inline-block'
          }}>
            {theme.title}
          </div>
          <div style={{ fontSize: '9px', opacity: 0.85, marginTop: '2px' }}>
            {theme.hindiTitle}
          </div>
        </div>

        {/* Tricolor Ribbon Divider */}
        <div style={{ display: 'flex', height: '3px', width: '100%' }}>
          <div style={{ flex: 1, backgroundColor: '#ea580c' }} />
          <div style={{ flex: 1, backgroundColor: '#ffffff' }} />
          <div style={{ flex: 1, backgroundColor: '#16a34a' }} />
        </div>

        {/* Card Body with Background Watermark */}
        <div style={bodyStyle}>
          {/* Subtle Watermark Logo in Background */}
          <div
            style={{
              position: 'absolute',
              top: '55%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '210px',
              height: '210px',
              backgroundImage: `url(${logoImg})`,
              backgroundSize: 'contain',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center',
              opacity: 0.08,
              pointerEvents: 'none',
              zIndex: 0
            }}
          />

          {/* User Avatar with Role Ring */}
          <div style={{ ...avatarWrapperStyle, borderColor: theme.avatarRing }}>
            <img
              src={user.avatar || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png'}
              alt={user.name}
              style={avatarStyle}
            />
          </div>

          {/* User Name & Role Unique ID Badge */}
          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', width: '100%' }}>
            <h3 style={{ margin: '8px 0 3px 0', color: '#0f172a', fontSize: '18px', fontWeight: '700' }}>
              {user.name}
            </h3>

            <div
              style={{
                ...idBadgeStyle,
                color: theme.badgeText,
                borderColor: theme.border,
                background: theme.badgeBg
              }}
            >
              {theme.idLabel}: {user.uniqueId || 'PENDING ID'}
            </div>
          </div>

          {/* Structured Information Table */}
          <div style={infoGridStyle}>
            <div style={infoRowStyle}>
              <span style={labelStyle}>Role:</span>
              <span style={{ ...valueStyle, color: theme.primary }}>{theme.name.toUpperCase()}</span>
            </div>

            {/* Student Specific Fields */}
            {isStudent && (
              <>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Class:</span>
                  <span style={valueStyle}>{user.studentClass || user.class || 'N/A'}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>School:</span>
                  <span style={valueStyle}>{user.schoolName || user.school || 'N/A'}</span>
                </div>
                {user.programId?.title && (
                  <div style={infoRowStyle}>
                    <span style={labelStyle}>Batch:</span>
                    <span style={valueStyle}>{user.programId.title}</span>
                  </div>
                )}
              </>
            )}

            {/* Mentor Specific Fields */}
            {isMentor && (
              <>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>College/Org:</span>
                  <span style={valueStyle}>{user.collegeOrOrganization || user.collegeName || 'N/A'}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Subjects:</span>
                  <span style={valueStyle}>
                    {Array.isArray(user.subjects) ? user.subjects.join(', ') : user.subjects || 'All Subjects'}
                  </span>
                </div>
              </>
            )}

            {/* Volunteer Specific Fields */}
            {isVolunteer && (
              <>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>College/Org:</span>
                  <span style={valueStyle}>{user.collegeOrOrganization || user.collegeName || 'N/A'}</span>
                </div>
                <div style={infoRowStyle}>
                  <span style={labelStyle}>Initiative:</span>
                  <span style={valueStyle}>{user.programId?.title || 'Community Welfare'}</span>
                </div>
              </>
            )}

            {/* Address Details */}
            <div style={infoRowStyle}>
              <span style={labelStyle}>Village/Town:</span>
              <span style={valueStyle}>{user.villageName || user.village || 'N/A'}</span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>District:</span>
              <span style={valueStyle}>{user.district || 'Hazaribagh'}</span>
            </div>

            <div style={infoRowStyle}>
              <span style={labelStyle}>Contact:</span>
              <span style={valueStyle}>{user.whatsappPhone || user.phone || 'N/A'}</span>
            </div>
          </div>

          {/* Verification & Security Footer */}
          <div style={footerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '4px' }}>
              <span style={{ display: 'inline-block', width: '7px', height: '7px', borderRadius: '50%', backgroundColor: theme.primary }} />
              <span style={{ fontSize: '10px', fontWeight: '700', letterSpacing: '.4px', color: '#334155' }}>
                VERIFIED DIGITAL IDENTITY PASS
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '9px', color: '#64748b' }}>
              पढ़ेगा गाँव बढ़ेगा देश · चलो चलें दीप जलाएं
            </p>
            <p style={{ margin: '2px 0 0 0', fontSize: '8.5px', color: '#94a3b8' }}>
              सोनपुरा, बड़कागांव, हजारीबाग, झारखंड – 825311
            </p>
          </div>
        </div>
      </div>

      {/* Action Button: Download/Print ID Card */}
      <div style={{ display: 'flex', gap: '10px', marginTop: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button
          onClick={handlePrint}
          style={{ ...printBtnStyle, backgroundColor: theme.primary }}
        >
          📥 Download / Print ID Card (PDF)
        </button>
      </div>

      {/* Print CSS for Clean Printouts */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #digital-id-card, #digital-id-card * {
            visibility: visible !important;
          }
          #digital-id-card {
            position: absolute !important;
            left: 50% !important;
            top: 15% !important;
            transform: translate(-50%, 0) !important;
            box-shadow: none !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
};

// Component Styles
const cardContainerStyle = {
  width: 'min(330px, 94vw)',
  borderRadius: '16px',
  overflow: 'hidden',
  boxShadow: '0 12px 36px rgba(0,0,0,0.14), 0 2px 6px rgba(0,0,0,0.06)',
  background: '#ffffff',
  border: '2px solid #2563eb',
  fontFamily: 'system-ui, -apple-system, sans-serif',
  position: 'relative',
  boxSizing: 'border-box'
};

const headerStyle = {
  color: '#ffffff',
  padding: '16px 14px 14px 14px',
  textAlign: 'center',
  position: 'relative',
  zIndex: 1
};

const bodyStyle = {
  padding: '16px 18px 14px 18px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  background: '#ffffff'
};

const avatarWrapperStyle = {
  width: '92px',
  height: '92px',
  borderRadius: '50%',
  padding: '3px',
  background: '#ffffff',
  border: '3.5px solid #2563eb',
  marginTop: '-44px',
  boxShadow: '0 6px 16px rgba(0,0,0,0.18)',
  position: 'relative',
  zIndex: 2
};

const avatarStyle = {
  width: '100%',
  height: '100%',
  borderRadius: '50%',
  objectFit: 'cover'
};

const idBadgeStyle = {
  display: 'inline-block',
  padding: '4px 14px',
  borderRadius: '20px',
  fontSize: '12px',
  fontWeight: '700',
  letterSpacing: '.3px',
  border: '1.5px solid',
  marginBottom: '12px'
};

const infoGridStyle = {
  width: '100%',
  fontSize: '12px',
  borderTop: '1px dashed #cbd5e1',
  paddingTop: '10px',
  position: 'relative',
  zIndex: 1
};

const infoRowStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  marginBottom: '6px',
  lineHeight: 1.35
};

const labelStyle = {
  color: '#64748b',
  fontWeight: '600'
};

const valueStyle = {
  color: '#0f172a',
  fontWeight: '700',
  textAlign: 'right',
  maxWidth: '190px',
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis'
};

const footerStyle = {
  marginTop: '12px',
  textAlign: 'center',
  borderTop: '1px solid #e2e8f0',
  paddingTop: '8px',
  width: '100%',
  position: 'relative',
  zIndex: 1
};

const printBtnStyle = {
  padding: '11px 22px',
  color: '#ffffff',
  border: 'none',
  borderRadius: '8px',
  fontWeight: '700',
  fontSize: '13.5px',
  cursor: 'pointer',
  boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
  transition: 'transform 0.15s ease, box-shadow 0.15s ease'
};

export default IDCard;