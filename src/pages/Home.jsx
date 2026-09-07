import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API, { getImageSrc as resolveImageSrc } from '../config/api';
import TestimonialsSection from '../components/TestimonialsSection';
import TeamSection from '../components/TeamSection';
import logoImg from '../assets/logo.png';

const DEFAULT_IMPACT_STATS = [
  {
    icon: '📚',
    number: '12+',
    label: 'सक्रिय शैक्षणिक बैच (Active Batches)',
    iconBg: '#f0fdf4',
    iconColor: '#16a34a',
    isVisible: true
  },
  {
    icon: '🎓',
    number: '250+',
    label: 'विद्यार्थी लाभान्वित (Learners Reached)',
    iconBg: '#eff6ff',
    iconColor: '#2563eb',
    isVisible: true
  },
  {
    icon: '👨‍🏫',
    number: '38+',
    label: 'समर्पित मेंटर्स व शिक्षक (Mentors & Faculty)',
    iconBg: '#fff7ed',
    iconColor: '#ea580c',
    isVisible: true
  },
  {
    icon: '🌱',
    number: '50+',
    label: 'जमीनी अभियान व वृक्षारोपण (Ground Drives)',
    iconBg: '#faf5ff',
    iconColor: '#7c3aed',
    isVisible: true
  }
];

const DEFAULT_GROUND_INITIATIVES = {
  sectionHeading: {
    kicker: 'हमारी जमीनी गतिविधियां · REAL GROUND INITIATIVES',
    title: 'प्रकृति, समाज और बच्चों के उज्ज्वल भविष्य के लिए समर्पित',
    description: 'अव्युक्त उत्थान संस्था केवल कक्षाओं तक सीमित नहीं है। हम धरातल पर उतरकर पर्यावरण संवर्धन, समाज जागरण, बाल संवाद, प्रकृति-रक्षक लोक पर्व और जनसंवाद के माध्यम से निरंतर सकारात्मक बदलाव ला रहे हैं।'
  },
  cards: [
    {
      tag: '🌱 पर्यावरण संवर्धन',
      title: 'पौधारोपण एवं पर्यावरण संरक्षण',
      subtitle: 'हरित वसुंधरा अभियान · स्वच्छ व हरा-भरा गाँव',
      points: [
        'गाँवों व विद्यालयों में फलदार व छायादार पौधों का व्यापक पौधारोपण।',
        'लगाए गए पौधों की सुरक्षा, नियमित देख-रेख व जल संरक्षण की जिम्मेदारी।',
        'सिंगल-यूज प्लास्टिक कचरा मुक्ति और पर्यावरण स्वच्छता अभियान।',
        'पर्यावरण संतुलन और प्रकृति के प्रति हर परिवार में जागरूकता फैलाना।'
      ],
      missionTag: 'मिशन: हरित वसुंधरा',
      locationTag: 'सोनपुरा · बड़कागांव',
      accentColor: '#16a34a',
      badgeBg: '#f0fdf4',
      order: 1,
      isVisible: true
    },
    {
      tag: '📢 सामाजिक चेतना',
      title: 'समाज को जागृत व सशक्त करना',
      subtitle: 'जन-जागरण अभियान · कुरीति व अंधविश्वास उन्मूलन',
      points: [
        'अंधविश्वास, सामाजिक कुरीतियों और अशिक्षा के विरुद्ध निरंतर जनचेतना।',
        'बालिका शिक्षा को प्राथमिकता, कन्या सुरक्षा व नारी सशक्तिकरण पर बल।',
        'स्वास्थ्य, पोषण, स्वच्छता और नशामुक्त समाज के लिए जागरूकता सत्र।',
        'सरकारी जनकल्याणकारी योजनाओं और अधिकारों की जानकारी ग्रामीणों तक पहुंचाना।'
      ],
      missionTag: 'मिशन: जागरूक समाज',
      locationTag: 'सोनपुरा · बड़कागांव',
      accentColor: '#ea580c',
      badgeBg: '#fff7ed',
      order: 2,
      isVisible: true
    },
    {
      tag: '👦 बाल विकास व संवाद',
      title: 'बच्चों से आत्मीय संवाद व मार्गदर्शन',
      subtitle: 'बाल चेतना मंच · आत्मविश्वास व मानसिक संबल',
      points: [
        'बच्चों के साथ मित्रवत बैठकर उनकी बातें, पढ़ाई की झिझक और समस्याएं सुनना।',
        'डर और हीनभावना को दूर कर उनमें आत्मसम्मान और आत्मविश्वास जगाना।',
        'नैतिक मूल्य, अनुशासन, जिज्ञासा और सीखने की ललक को बढ़ावा देना।',
        'प्रत्येक बच्चे की छिपी प्रतिभा को पहचानकर सही मार्गदर्शन प्रदान करना।'
      ],
      missionTag: 'मिशन: हर बच्चा अनमोल',
      locationTag: 'सोनपुरा · बड़कागांव',
      accentColor: '#2563eb',
      badgeBg: '#eff6ff',
      order: 3,
      isVisible: true
    },
    {
      tag: '🌸 लोक पर्व व पर्यावरण',
      title: 'पर्यावरण-अनुकूल लोक पर्व व संस्कृति',
      subtitle: 'प्रकृति वंदन की परंपरा · करमा, सरहुल, सोहराय',
      points: [
        'सरहुल, करमा और सोहराय जैसे प्रकृति-संरक्षक पारंपरिक पर्वों को सहेजना।',
        'वृक्ष, मिट्टी और जल की पूजा के माध्यम से पर्यावरण संरक्षण का गहरा संदेश।',
        'उत्सवों में प्लास्टिक व प्रदूषण से मुक्त प्राकृतिक रीति-रिवाजों को अपनाना।',
        'नई पीढ़ी को अपनी सांस्कृतिक धरोहर और प्रकृति प्रेम से जोड़े रखना।'
      ],
      missionTag: 'मिशन: प्रकृति वंदन',
      locationTag: 'सोनपुरा · बड़कागांव',
      accentColor: '#d97706',
      badgeBg: '#fefce8',
      order: 4,
      isVisible: true
    },
    {
      tag: '🤝 जनसंवाद व चौपाल',
      title: 'जनसंवाद एवं ग्राम चौपाल',
      subtitle: 'सीधा संवाद · सहभागिता व समस्या समाधान',
      points: [
        'ग्रामीणों, बुजुर्गों और युवाओं के साथ नियमित चौपाल व खुली बैठकें।',
        'गाँव की बुनियादी समस्याओं और ज़रूरतों पर सीधी और पारदर्शी चर्चा।',
        'पारस्परिक सहयोग और जनसहभागिता से सामूहिक समाधान तैयार करना।',
        'गाँव के विकास के लिए युवा शक्ति को संगठित कर सकारात्मक दिशा देना।'
      ],
      missionTag: 'मिशन: सामूहिक सहभागिता',
      locationTag: 'सोनपुरा · बड़कागांव',
      accentColor: '#0d9488',
      badgeBg: '#f0fdfa',
      order: 5,
      isVisible: true
    },
    {
      tag: '📚 शिक्षा एवं प्रतिभा',
      title: 'निशुल्क शिक्षा व जिज्ञासा बैच',
      subtitle: 'गुणवत्तापूर्ण शिक्षा · डिजिटल लर्निंग व मेंटरशिप',
      points: [
        "ग्रामीण व वंचित वर्ग के होनहार विद्यार्थियों के लिए विशेष 'जिज्ञासा बैच'।",
        'प्रतिष्ठित मेंटर्स द्वारा नियमित लाइव इंटरैक्टिव कक्षाएं व डाउट समाधान।',
        'गणित, विज्ञान और डिजिटल तकनीक में बच्चों की रुचि और समझ बढ़ाना।',
        'प्रतियोगी परीक्षाओं और उच्च शिक्षा के लिए निरंतर मार्गदर्शन व सहयोग।'
      ],
      missionTag: 'मिशन: पढ़ेगा गाँव, बढ़ेगा देश',
      locationTag: 'सोनपुरा · बड़कागांव',
      accentColor: '#7c3aed',
      badgeBg: '#faf5ff',
      order: 6,
      isVisible: true
    }
  ]
};

// Professional SVG Icons for Events Section
const IconLeaf = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const IconBulb = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-1 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </svg>
);

const IconTrophy = ({ size = 18, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H8c-.55 0-1 .45-1 1v1h10v-1c0-.55-.45-1-1-1h-1c-.55 0-1-.45-1-1v-2.34" />
    <path d="M6 4h12v7a6 6 0 0 1-12 0V4Z" />
  </svg>
);

const IconCalendar = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const IconMapPin = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const IconArrowRight = ({ size = 14, color = 'currentColor' }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const DEFAULT_COMMUNITY_EVENTS = [
  {
    _id: 'default-1',
    title: 'हरित सोनपुरा - वृहद पौधारोपण एवं पर्यावरण संरक्षण महाभियान',
    description: 'ग्राम सोनपुरा व आसपास के क्षेत्रों में 500+ फलदार व छायादार पौधों का रोपण, जल संरक्षण एवं सिंगल-यूज प्लास्टिक मुक्ति अभियान।',
    category: 'अभियान व शिविर',
    location: 'सोनपुरा, बड़कागांव (हजारीबाग)',
    mode: 'Offline',
    eventDate: new Date(Date.now() + 86400000 * 3).toISOString()
  },
  {
    _id: 'default-2',
    title: 'डिजिटल साक्षरता व युवा कौशल विकास कार्यशाला',
    description: 'ग्रामीण विद्यार्थियों व युवाओं के लिए कंप्यूटर दक्षता, इंटरनेट सुरक्षा और ऑनलाइन शैक्षणिक संसाधनों के उपयोग पर व्यावहारिक प्रशिक्षण।',
    category: 'कार्यशाला एवं कौशल',
    location: 'पंचायत भवन, सोनपुरा',
    mode: 'Offline',
    eventDate: new Date(Date.now() + 86400000 * 7).toISOString()
  },
  {
    _id: 'default-3',
    title: 'पर्यावरण व सामाजिक चेतना वाद-विवाद प्रतियोगिता',
    description: 'युवाओं के बौद्धिक विकास और नेतृत्व क्षमता को निखारने हेतु अंतर-ग्राम भाषण एवं वाद-विवाद प्रतियोगिता। आकर्षक पुरस्कार व प्रमाणपत्र।',
    category: 'प्रतिभा मंच व प्रतियोगिता',
    location: 'सामुदायिक केंद्र, सोनपुरा',
    mode: 'Offline',
    eventDate: new Date(Date.now() + 86400000 * 12).toISOString()
  }
];

const Home = () => {
  const navigate = useNavigate();
  const [impactStats, setImpactStats] = useState(DEFAULT_IMPACT_STATS);
  const [initiativesData, setInitiativesData] = useState(DEFAULT_GROUND_INITIATIVES);
  const [events, setEvents] = useState(DEFAULT_COMMUNITY_EVENTS);


  useEffect(() => {
    const fetchImpactStats = async () => {
      try {
        const res = await API.get('/site-settings/impact-stats');
        if (res.data?.success && Array.isArray(res.data.impactStats) && res.data.impactStats.length > 0) {
          setImpactStats(res.data.impactStats);
        }
      } catch (err) {
        console.warn('Using default impact stats due to network or server status:', err.message);
      }
    };

    const fetchInitiatives = async () => {
      try {
        const res = await API.get('/site-settings/initiatives');
        if (res.data?.success && Array.isArray(res.data.cards) && res.data.cards.length > 0) {
          setInitiativesData({
            sectionHeading: res.data.sectionHeading || DEFAULT_GROUND_INITIATIVES.sectionHeading,
            cards: res.data.cards
          });
        }
      } catch (err) {
        console.warn('Using default ground initiatives due to network or server status:', err.message);
      }
    };

    const fetchEvents = async () => {
      try {
        const res = await API.get('/posts/all');
        const communityEvents = (res.data || []).filter((item) => {
          const cat = (item.category || '').toLowerCase();
          return (
            cat.includes('event') ||
            cat.includes('workshop') ||
            cat.includes('competition') ||
            cat.includes('contest') ||
            cat.includes('debate') ||
            cat.includes('अभियान') ||
            cat.includes('शिविर') ||
            cat.includes('कार्यशाला') ||
            item.isRegistrationRequired === true ||
            Boolean(item.location)
          );
        });
        if (communityEvents.length > 0) {
          setEvents(communityEvents);
        }
      } catch (err) {
        console.warn('Using default events due to network or server status:', err.message);
      }
    };

    fetchImpactStats();
    fetchInitiatives();
    fetchEvents();
  }, []);

  const getImageSrc = (url) => resolveImageSrc(url);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('hi-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  const getCategoryMeta = (item) => {
    const cat = (item?.category || '').toLowerCase();
    if (cat.includes('workshop') || cat.includes('कार्यशाला')) {
      return {
        label: 'कार्यशाला एवं कौशल',
        icon: <IconBulb size={13} color="#173d35" />,
        bg: '#eff6f2',
        color: '#173d35',
        border: '#cbe0d3'
      };
    }
    if (cat.includes('competition') || cat.includes('contest') || cat.includes('debate') || cat.includes('प्रतियोगिता')) {
      return {
        label: 'प्रतिभा मंच व प्रतियोगिता',
        icon: <IconTrophy size={13} color="#9a6208" />,
        bg: '#fdf8ec',
        color: '#9a6208',
        border: '#f5ddad'
      };
    }
    return {
      label: 'जमीनी अभियान व शिविर',
      icon: <IconLeaf size={13} color="#173d35" />,
      bg: '#eaf4ee',
      color: '#173d35',
      border: '#c3ded0'
    };
  };


  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-container">
          <div className="hero-copy">
            <span className="section-kicker">
              🏛️ अव्युक्त उत्थान संस्था · सोनपुरा, बड़कागांव (हजारीबाग)
            </span>
            <h1>Learning is a bridge to a wider life.</h1>
            <p>
              सुदूर ग्रामीण अंचलों से लेकर हर कोने तक विद्यार्थियों, समर्पित मेंटर्स और कर्मठ स्वयंसेवकों को जोड़कर शिक्षा, पर्यावरण संवर्धन और सामाजिक चेतना का नया सवेरा।
            </p>

            {/* Action Buttons */}
            <div className="hero-actions" style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', alignItems: 'center', marginTop: '24px' }}>
              <button 
                onClick={() => navigate('/live-sessions')}
                style={{
                  background: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
                  color: '#ffffff',
                  border: '1px solid #f87171',
                  padding: '12px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  boxShadow: '0 4px 16px rgba(220, 38, 38, 0.4)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'transform 0.15s ease'
                }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ffffff', display: 'inline-block', boxShadow: '0 0 8px #ffffff' }}></span>
                <span>🔴 लाइव सत्र (Live Sessions)</span>
              </button>

              <button 
                onClick={() => navigate('/events')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '12px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  backdropFilter: 'blur(4px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>🌱 जन अभियान (Events & Drives)</span>
              </button>

              <button 
                onClick={() => navigate('/news')}
                style={{
                  background: 'rgba(255, 255, 255, 0.08)',
                  color: '#ffffff',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  padding: '12px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  backdropFilter: 'blur(4px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.16)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.5)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255, 255, 255, 0.08)';
                  e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>📰 समाचार व सूचनाएं (News & Notices)</span>
              </button>

              <button 
                onClick={() => navigate('/team')}
                style={{
                  background: 'rgba(232, 179, 90, 0.12)',
                  color: '#e8b35a',
                  border: '1px solid rgba(232, 179, 90, 0.5)',
                  padding: '12px 18px',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontWeight: '700',
                  fontSize: '13.5px',
                  backdropFilter: 'blur(4px)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'all 0.15s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(232, 179, 90, 0.22)';
                  e.currentTarget.style.borderColor = '#e8b35a';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(232, 179, 90, 0.12)';
                  e.currentTarget.style.borderColor = 'rgba(232, 179, 90, 0.5)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>👥 हमारी टीम (Our Team)</span>
              </button>
            </div>
          </div>

          {/* Hero Official Emblem Showcase Card */}
          <div className="hero-emblem-wrap">
            <div className="hero-emblem-card">
              <div style={{
                position: 'relative',
                padding: '10px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(232, 179, 90, 0.28) 0%, rgba(23, 61, 53, 0) 70%)',
                boxShadow: '0 0 60px rgba(232, 179, 90, 0.35)',
                marginBottom: '16px'
              }}>
                <img
                  src={logoImg}
                  alt="Avyukt Utthan Sanstha Official Emblem"
                  style={{
                    width: 'min(240px, 58vw)',
                    height: 'min(240px, 58vw)',
                    borderRadius: '50%',
                    boxShadow: '0 16px 40px rgba(0,0,0,0.5)',
                    border: '3.5px solid rgba(232, 179, 90, 0.9)',
                    objectFit: 'contain'
                  }}
                />
              </div>

              <div style={{ color: '#d1e3d7', fontSize: '13px', lineHeight: '1.5', maxWidth: '320px', margin: '0 auto' }}>

                <span style={{ color: '#fff', fontWeight: '700' }}>सत्यमेव जयते · तमसो मा ज्योतिर्गमय</span><br />
                <span style={{ fontSize: '11.5px', color: '#a7c4b5' }}>शिक्षा, संस्कृति और पर्यावरण संवर्धन को समर्पित</span>
              </div>

              {/* 3 Trust Chips */}
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '14px' }}>
                <span style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px', color: '#b9d9c5' }}>🌱 पर्यावरण रक्षा</span>
                <span style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px', color: '#b9d9c5' }}>📚 निशुल्क शिक्षा</span>
                <span style={{ padding: '3px 9px', background: 'rgba(255,255,255,0.08)', borderRadius: '12px', fontSize: '11px', color: '#b9d9c5' }}>🤝 समाज जागरण</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Core Ground Initiatives Section */}
      <div className="programs-section">
        <div className="section-heading" style={{ maxWidth: '780px', marginBottom: '40px' }}>
          <span className="section-kicker">
            {initiativesData.sectionHeading?.kicker || 'हमारी जमीनी गतिविधियां · REAL GROUND INITIATIVES'}
          </span>
          <h2 style={{ fontSize: '36px', color: '#173d35', margin: '12px 0 10px 0', fontFamily: 'Georgia, serif' }}>
            {initiativesData.sectionHeading?.title || 'प्रकृति, समाज और बच्चों के उज्ज्वल भविष्य के लिए समर्पित'}
          </h2>
          <p style={{ fontSize: '16px', color: '#547664', lineHeight: '1.7' }}>
            {initiativesData.sectionHeading?.description || 'अव्युक्त उत्थान संस्था केवल कक्षाओं तक सीमित नहीं है। हम धरातल पर उतरकर पर्यावरण संवर्धन, समाज जागरण, बाल संवाद, प्रकृति-रक्षक लोक पर्व और जनसंवाद के माध्यम से निरंतर सकारात्मक बदलाव ला रहे हैं।'}
          </p>
        </div>

        <div className="program-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(330px, 1fr))', gap: '22px' }}>
          {(initiativesData.cards || [])
            .filter((c) => c.isVisible !== false)
            .map((card, idx) => (
              <div
                key={card._id || idx}
                className="program-card"
                style={{
                  borderTop: `4px solid ${card.accentColor || '#16a34a'}`,
                  borderRadius: '10px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between'
                }}
              >
                <div>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      background: card.badgeBg || '#f0fdf4',
                      color: card.accentColor || '#166534',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '700',
                      marginBottom: '12px'
                    }}
                  >
                    {card.tag}
                  </div>
                  <h3 style={{ color: card.accentColor || '#166534', margin: '0 0 6px 0', fontSize: '20px' }}>
                    {card.title}
                  </h3>
                  <p style={{ color: '#64748b', fontSize: '13px', margin: '0 0 12px 0', fontWeight: '500' }}>
                    {card.subtitle}
                  </p>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '9px' }}>
                    {(card.points || []).map((pt, pIdx) => (
                      <li key={pIdx} style={{ display: 'flex', gap: '9px', alignItems: 'flex-start', fontSize: '13.5px', color: '#334155', lineHeight: 1.5 }}>
                        <span style={{ color: card.accentColor || '#16a34a', fontWeight: 'bold', flexShrink: 0 }}>✓</span>
                        <span>{pt}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div style={{ marginTop: '18px', paddingTop: '12px', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
                  <span style={{ fontWeight: '700', color: card.accentColor || '#16a34a' }}>{card.missionTag}</span>
                  <span style={{ color: '#94a3b8' }}>{card.locationTag}</span>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Platform Impact Stats Strip */}
      <div className="impact-strip">
        <div className="impact-strip-container">
          {impactStats
            .filter((item) => item.isVisible !== false)
            .map((stat, idx) => (
              <div className="impact-card" key={stat._id || idx}>
                <div
                  className="impact-card-icon"
                  style={{
                    background: stat.iconBg || '#f0fdf4',
                    color: stat.iconColor || '#16a34a'
                  }}
                >
                  {stat.icon || '📊'}
                </div>
                <div>
                  <div className="impact-card-number">{stat.number}</div>
                  <div className="impact-card-label">{stat.label}</div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Events & Community Drives Section (Top 3) */}
      <section style={{
        maxWidth: '1320px',
        margin: '0 auto',
        padding: 'clamp(50px, 6vw, 84px) clamp(16px, 3vw, 32px)',
        position: 'relative'
      }}>
        {/* Section Heading with Desktop Explore More Button */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
          flexWrap: 'wrap',
          gap: '20px',
          marginBottom: '38px'
        }}>
          <div style={{ maxWidth: '780px' }}>
            <span className="section-kicker">
              ✦ आगामी एवं सक्रिय अभियान · EVENTS & COMMUNITY DRIVES
            </span>
            <h2 style={{
              fontSize: 'clamp(28px, 3.5vw, 40px)',
              color: '#173d35',
              margin: '12px 0 10px 0',
              fontFamily: 'Georgia, serif',
              fontWeight: '600',
              lineHeight: 1.2
            }}>
              समाज व पर्यावरण संवर्धन हेतु सक्रिय अभियान
            </h2>
            <p style={{ fontSize: '15.5px', color: '#547664', lineHeight: '1.65', margin: 0 }}>
              पर्यावरण संरक्षण, पौधारोपण महाभियान, कौशल विकास कार्यशालाएं और वाद-विवाद प्रतियोगिताएं। इन अभियानों में भाग लेकर समाज और प्रकृति के संवर्धन में अपना अमूल्य योगदान दें।
            </p>
          </div>

          <button
            onClick={() => navigate('/events')}
            style={{
              padding: '11px 22px',
              borderRadius: '24px',
              background: '#173d35',
              color: '#ffffff',
              border: '1px solid #173d35',
              fontWeight: '700',
              fontSize: '13px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(23, 61, 53, 0.2)',
              transition: 'all 0.2s ease',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#102e29';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#173d35';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>सभी अभियान देखें (Explore More)</span>
            <IconArrowRight size={14} color="#e8b35a" />
          </button>
        </div>

        {/* 3 Events Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 330px), 1fr))',
          gap: '24px'
        }}>
          {events.slice(0, 3).map((evt) => {
            const dateStr = formatDate(evt.eventDate || evt.createdAt);
            const imgSrc = getImageSrc(evt.bannerUrl || evt.imageUrl);
            const meta = getCategoryMeta(evt);

            return (
              <div
                key={evt._id}
                style={{
                  background: '#ffffff',
                  borderRadius: '16px',
                  border: '1px solid #d8e5d6',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: '0 6px 20px rgba(31, 61, 48, 0.05)',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 28px rgba(31, 61, 48, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(31, 61, 48, 0.05)';
                }}
              >
                {/* Banner Poster */}
                <div
                  onClick={() => navigate('/events')}
                  style={{
                    height: '190px',
                    width: '100%',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    position: 'relative',
                    background: 'radial-gradient(circle at 50% 50%, #1e4d43 0%, #173d35 100%)'
                  }}
                >
                  {imgSrc ? (
                    <img
                      src={imgSrc}
                      alt={evt.title}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#d1e3d7'
                    }}>
                      <div style={{
                        width: '50px',
                        height: '50px',
                        borderRadius: '50%',
                        background: 'rgba(255, 255, 255, 0.1)',
                        border: '1px solid rgba(232, 179, 90, 0.3)',
                        display: 'grid',
                        placeItems: 'center',
                        marginBottom: '8px'
                      }}>
                        {meta.icon}
                      </div>
                      <span style={{ fontSize: '11.5px', fontWeight: '600', letterSpacing: '0.04em' }}>
                        विशेष आयोजन पोस्टर
                      </span>
                    </div>
                  )}

                  {/* Date Badge */}
                  {dateStr && (
                    <div style={{
                      position: 'absolute',
                      top: '12px',
                      left: '12px',
                      background: 'rgba(13, 40, 34, 0.85)',
                      backdropFilter: 'blur(8px)',
                      WebkitBackdropFilter: 'blur(8px)',
                      color: '#ffffff',
                      padding: '4px 10px',
                      borderRadius: '20px',
                      fontSize: '11px',
                      fontWeight: '700',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '5px',
                      border: '1px solid rgba(232, 179, 90, 0.4)',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                    }}>
                      <IconCalendar size={12} color="#e8b35a" />
                      <span>{dateStr}</span>
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div style={{ padding: '22px 20px', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  {/* Category Chip */}
                  <div style={{ marginBottom: '12px' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '4px 11px',
                      borderRadius: '20px',
                      background: meta.bg,
                      color: meta.color,
                      border: `1px solid ${meta.border}`,
                      fontSize: '11.5px',
                      fontWeight: '700'
                    }}>
                      {meta.icon}
                      <span>{meta.label}</span>
                    </span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    margin: '0 0 10px 0',
                    fontSize: '18.5px',
                    color: '#173d35',
                    fontFamily: 'Georgia, serif',
                    lineHeight: '1.38',
                    fontWeight: '600'
                  }}>
                    {evt.title}
                  </h3>

                  {/* Description */}
                  <p style={{
                    color: '#64748b',
                    fontSize: '13.5px',
                    lineHeight: '1.65',
                    margin: '0 0 18px 0',
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    flex: 1
                  }}>
                    {evt.description}
                  </p>

                  {/* Footer Metadata & CTA */}
                  <div style={{ borderTop: '1px solid #edf3ee', paddingTop: '16px', marginTop: 'auto' }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '14px',
                      fontSize: '12px',
                      color: '#547664'
                    }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '500' }}>
                        <IconMapPin size={14} color="#173d35" />
                        <span>{evt.location || 'सोनपुरा (हजारीबाग)'}</span>
                      </span>
                      <span style={{
                        fontWeight: '700',
                        color: '#173d35',
                        background: '#f1f7f3',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        border: '1px solid #dcebe2'
                      }}>
                        {evt.mode || 'Offline'}
                      </span>
                    </div>

                    <button
                      onClick={() => navigate('/events')}
                      style={{
                        width: '100%',
                        padding: '10px 14px',
                        background: '#173d35',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: '700',
                        fontSize: '13px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 12px rgba(23, 61, 53, 0.18)',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = '#102e29'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = '#173d35'; }}
                    >
                      <IconCalendar size={14} color="#e8b35a" />
                      <span>सहभागिता हेतु विवरण देखें</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Bottom Explore More CTA Button */}
        <div style={{ textAlign: 'center', marginTop: '38px' }}>
          <button
            onClick={() => navigate('/events')}
            style={{
              padding: '13px 32px',
              borderRadius: '8px',
              background: '#173d35',
              color: '#ffffff',
              border: 'none',
              fontWeight: '700',
              fontSize: '14.5px',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              boxShadow: '0 6px 20px rgba(23, 61, 53, 0.25)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#102e29';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#173d35';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            <span>सभी कार्यक्रम व अभियान देखें (Explore All Events & Drives)</span>
            <IconArrowRight size={16} color="#e8b35a" />
          </button>
        </div>
      </section>

      <TeamSection featured />

      {/* Testimonials Section Component */}
      <TestimonialsSection />
    </div>
  );
};

export default Home;