import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import logoImg from '../assets/logo.png';
import ngoStampImg from '../assets/ngo_stamp.png';

// Shared 24K Metallic Gold Gradient Definition
const GoldGradients = () => (
  <defs>
    <linearGradient id="goldGradModal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="#d4af37" />
      <stop offset="25%" stopColor="#fef08a" />
      <stop offset="50%" stopColor="#ca8a04" />
      <stop offset="75%" stopColor="#e8b35a" />
      <stop offset="100%" stopColor="#854d0e" />
    </linearGradient>
    <linearGradient id="goldGradSoftModal" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stopColor="rgba(254, 240, 138, 0.9)" />
      <stop offset="50%" stopColor="rgba(202, 138, 4, 0.85)" />
      <stop offset="100%" stopColor="rgba(133, 77, 14, 0.9)" />
    </linearGradient>
    <radialGradient id="goldRadialModal" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stopColor="#fffbeb" />
      <stop offset="30%" stopColor="#fef08a" />
      <stop offset="65%" stopColor="#ca8a04" />
      <stop offset="100%" stopColor="#854d0e" />
    </radialGradient>
  </defs>
);

// 1. Top-Left Corner: पलाश पुष्प (Palash Flower) एवं कोयल (Koel Bird) in Royal Gold Engraving
const TopLeftPalashKoelGold = () => (
  <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
    <GoldGradients />
    {/* Baroque Corner L-Bracket & Pinstripes */}
    <path d="M4 46 V12 C4 7.6 7.6 4 12 4 H46" stroke="url(#goldGradModal)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M9 36 V14 C9 11.2 11.2 9 14 9 H36" stroke="url(#goldGradModal)" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    <circle cx="5" cy="5" r="3.2" fill="url(#goldGradModal)" />
    <circle cx="5" cy="5" r="1.5" fill="#ffffff" />
    
    {/* Baroque Scroll Branch */}
    <path d="M12 40 C14 26 22 20 34 26 C44 31 52 24 64 16" stroke="url(#goldGradModal)" strokeWidth="1.8" strokeLinecap="round" fill="none" />
    <path d="M28 24 C32 14 42 10 52 14" stroke="url(#goldGradModal)" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.8" />

    {/* Royal Koel Bird Perched on Branch (Gold Engraved Silhouette) */}
    <g transform="translate(18, 12)">
      {/* Body & Wing with feathers */}
      <path d="M4 18 C8 9 18 10 24 13 C28 15 26 23 20 25 C14 27 6 25 4 18 Z" fill="url(#goldGradSoftModal)" stroke="url(#goldGradModal)" strokeWidth="1" />
      <path d="M11 16 C16 14 20 18 18 22 C13 23 9 20 11 16 Z" fill="url(#goldGradModal)" opacity="0.6" />
      {/* Head & Beak */}
      <circle cx="24" cy="11" r="5" fill="url(#goldGradModal)" />
      <path d="M28 10 L34 11.5 L28 13 Z" fill="url(#goldGradModal)" />
      <circle cx="25" cy="10" r="1.2" fill="#713f12" />
      {/* Long Curved Tail Feathers */}
      <path d="M5 21 C-4 28 -8 38 -6 44 M7 23 C0 32 -2 40 1 45" stroke="url(#goldGradModal)" strokeWidth="2" strokeLinecap="round" />
      {/* Claws gripping */}
      <path d="M14 26 L13 30 M17 26 L17 30" stroke="url(#goldGradModal)" strokeWidth="1.5" />
    </g>

    {/* Palash (Flame of the Forest) Blossoms in Gold Foil Filigree */}
    <g transform="translate(46, 12)">
      <path d="M0 8 C6 -4 18 -2 20 8 C15 16 3 14 0 8 Z" fill="url(#goldGradSoftModal)" stroke="url(#goldGradModal)" strokeWidth="1.2" />
      <path d="M-2 5 C3 -6 14 -6 16 3 C9 9 -1 9 -2 5 Z" fill="url(#goldGradModal)" opacity="0.75" />
      <circle cx="0" cy="8" r="3" fill="#854d0e" />
    </g>
    <title>पलाश पुष्प एवं कोयल (Palash & Koel)</title>
  </svg>
);

// 2. Top-Right Corner: साल/सखुआ पत्र (Sal Leaves) एवं कमल (Kamal/Lotus) in Royal Gold Engraving
const TopRightSalLotusGold = () => (
  <svg width="84" height="84" viewBox="0 0 84 84" fill="none" xmlns="http://www.w3.org/2000/svg">
    <GoldGradients />
    {/* Baroque Corner L-Bracket */}
    <path d="M80 46 V12 C80 7.6 76.4 4 72 4 H38" stroke="url(#goldGradModal)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M75 36 V14 C75 11.2 72.8 9 70 9 H48" stroke="url(#goldGradModal)" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    <circle cx="79" cy="5" r="3.2" fill="url(#goldGradModal)" />
    <circle cx="79" cy="5" r="1.5" fill="#ffffff" />

    {/* Sacred Sal / Sakhuwa Leaves with Veins */}
    <g transform="translate(20, 8)">
      {/* Sal Leaf 1 */}
      <path d="M36 28 C20 22 14 8 26 2 C36 6 40 18 36 28 Z" fill="url(#goldGradSoftModal)" stroke="url(#goldGradModal)" strokeWidth="1.2" />
      <path d="M26 3 Q31 14 36 28" stroke="url(#goldGradModal)" strokeWidth="1" fill="none" />
      <line x1="28" y1="10" x2="34" y2="8" stroke="url(#goldGradModal)" strokeWidth="0.8" />
      <line x1="30" y1="16" x2="36" y2="15" stroke="url(#goldGradModal)" strokeWidth="0.8" />
      {/* Sal Leaf 2 */}
      <path d="M40 30 C50 22 60 25 58 12 C48 10 42 20 40 30 Z" fill="url(#goldGradSoftModal)" stroke="url(#goldGradModal)" strokeWidth="1.2" />
      <path d="M57 13 Q50 20 40 30" stroke="url(#goldGradModal)" strokeWidth="1" fill="none" />
    </g>

    {/* Blooming Royal Lotus (कमल) */}
    <g transform="translate(32, 30)">
      <path d="M0 18 C-10 13 -14 4 -5 0 C2 4 4 11 0 18 Z" fill="url(#goldGradSoftModal)" stroke="url(#goldGradModal)" strokeWidth="1.2" />
      <path d="M0 18 C10 13 14 4 5 0 C-2 4 -4 11 0 18 Z" fill="url(#goldGradSoftModal)" stroke="url(#goldGradModal)" strokeWidth="1.2" />
      <path d="M0 18 C-6 9 -5 -5 0 -9 C5 -5 6 9 0 18 Z" fill="url(#goldGradModal)" stroke="#854d0e" strokeWidth="0.8" />
      <circle cx="0" cy="5" r="3.2" fill="#fffbeb" stroke="url(#goldGradModal)" strokeWidth="1" />
      <path d="M-12 20 Q0 24 12 20" stroke="url(#goldGradModal)" strokeWidth="1.4" strokeLinecap="round" fill="none" />
    </g>
    <title>साल (सखुआ) एवं कमल (Sal & Kamal)</title>
  </svg>
);

// 3. Bottom-Left Corner: सोहराय हाथी (Royal Sohrai Elephant with Raised Trunk) in Gold Engraving
const BottomLeftElephantGold = () => (
  <svg width="86" height="86" viewBox="0 0 86 86" fill="none" xmlns="http://www.w3.org/2000/svg">
    <GoldGradients />
    {/* Corner L-Bracket */}
    <path d="M4 40 V74 C4 78.4 7.6 82 12 82 H46" stroke="url(#goldGradModal)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M9 50 V72 C9 74.8 11.2 77 14 77 H36" stroke="url(#goldGradModal)" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    <circle cx="5" cy="81" r="3.2" fill="url(#goldGradModal)" />
    <circle cx="5" cy="81" r="1.5" fill="#ffffff" />

    {/* Imperial Sohrai Elephant Motif */}
    <g transform="translate(10, 18)">
      {/* Body and Powerful Pillars Legs */}
      <path
        d="M14 34 C10 20 25 15 40 19 C52 23 58 29 55 42 L53 58 L46 58 L47 44 L36 44 L35 58 L28 58 L29 44 L19 44 L17 58 L10 58 Z"
        fill="url(#goldGradSoftModal)"
        stroke="url(#goldGradModal)"
        strokeWidth="1.5"
      />
      {/* High Raised Trunk in Royal Salute */}
      <path
        d="M16 30 C10 24 4 14 8 6 C12 1 18 2 16 9 C14 16 18 22 21 26"
        stroke="url(#goldGradModal)"
        strokeWidth="3.2"
        strokeLinecap="round"
        fill="none"
      />
      {/* White/Ivory Tusk */}
      <path d="M12 25 Q5 24 3 20" stroke="#ffffff" strokeWidth="2.4" strokeLinecap="round" fill="none" />
      <circle cx="18" cy="21" r="1.8" fill="#713f12" />
      {/* Royal Ceremonial Ear */}
      <path d="M22 20 C30 18 30 30 22 32 Z" fill="url(#goldGradModal)" stroke="#713f12" strokeWidth="1" />
      {/* Engraved Ceremonial Saddle / Jhul */}
      <rect x="29" y="21" width="18" height="15" rx="2" fill="url(#goldGradModal)" stroke="#713f12" strokeWidth="1" />
      <line x1="29" y1="28" x2="47" y2="28" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
      <line x1="38" y1="21" x2="38" y2="36" stroke="#ffffff" strokeWidth="1" strokeDasharray="2 2" />
      {/* Tail with Tuft */}
      <path d="M54 28 C60 36 58 48 57 50" stroke="url(#goldGradModal)" strokeWidth="1.6" fill="none" />
      <circle cx="57" cy="50" r="1.8" fill="url(#goldGradModal)" />
    </g>
    <title>सोहराय हाथी (Sohrai Elephant)</title>
  </svg>
);

// 4. Bottom-Right Corner: शाही बाघ (Royal Tiger) एवं नगाड़ा / मांदर (Nagada) in Gold Engraving
const BottomRightTigerNagadaGold = () => (
  <svg width="86" height="86" viewBox="0 0 86 86" fill="none" xmlns="http://www.w3.org/2000/svg">
    <GoldGradients />
    {/* Corner L-Bracket */}
    <path d="M82 40 V74 C82 78.4 78.4 82 74 82 H40" stroke="url(#goldGradModal)" strokeWidth="2.5" strokeLinecap="round" />
    <path d="M77 50 V72 C77 74.8 74.8 77 72 77 H50" stroke="url(#goldGradModal)" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
    <circle cx="81" cy="81" r="3.2" fill="url(#goldGradModal)" />
    <circle cx="81" cy="81" r="1.5" fill="#ffffff" />

    {/* Traditional Nagada / Mandar Drum */}
    <g transform="translate(10, 36)">
      <ellipse cx="14" cy="20" rx="9" ry="14" fill="url(#goldGradSoftModal)" stroke="url(#goldGradModal)" strokeWidth="1.5" />
      <path d="M14 6 L28 11 L28 29 L14 34 Z" fill="url(#goldGradModal)" stroke="#713f12" strokeWidth="1" />
      <line x1="14" y1="6" x2="28" y2="29" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
      <line x1="14" y1="34" x2="28" y2="11" stroke="#ffffff" strokeWidth="1" opacity="0.9" />
      <line x1="7" y1="7" x2="20" y2="2" stroke="url(#goldGradModal)" strokeWidth="2" strokeLinecap="round" />
    </g>

    {/* Royal Tiger (बाघ) in Gold Silhouette with Engraved Stripes */}
    <g transform="translate(28, 16)">
      <path
        d="M10 26 C20 18 32 20 42 22 C52 24 54 34 51 44 L47 44 L48 32 L38 32 L36 44 L31 44 L32 32 L22 32 L20 44 L14 44 Z"
        fill="url(#goldGradSoftModal)"
        stroke="url(#goldGradModal)"
        strokeWidth="1.5"
      />
      {/* Engraved Stripes */}
      <path d="M20 26 L23 31 M26 25 L29 30 M32 25 L34 30 M38 26 L40 30" stroke="#713f12" strokeWidth="1.4" strokeLinecap="round" />
      {/* Head, ears, muzzle */}
      <circle cx="9" cy="21" r="6" fill="url(#goldGradModal)" />
      <circle cx="6" cy="16" r="2" fill="#713f12" />
      <circle cx="12" cy="16" r="2" fill="#713f12" />
      <circle cx="8" cy="20" r="1.1" fill="#ffffff" />
      {/* Elegant Curved Tail */}
      <path d="M52 28 C60 18 56 10 50 8" stroke="url(#goldGradModal)" strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </g>
    <title>बाघ एवं नगाड़ा / मांदर (Tiger & Mandar)</title>
  </svg>
);

// 5. Vertical Left & Right Borders: झूमर एवं करम नृत्य गोल्ड फिलीग्री लेस (Golden Jhumar & Karam Filigree Lace)
const KaramJhumarFiligreeVertical = ({ height = 410, isRight = false }) => (
  <svg
    width="26"
    height={height}
    viewBox="0 0 26 410"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    style={{ opacity: 0.9 }}
  >
    <GoldGradients />
    {/* Fine Vertical Guilloche Golden Thread */}
    <line x1="13" y1="4" x2="13" y2="406" stroke="url(#goldGradModal)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />

    {/* Repeating 7 Elegant Connected Dancers in Gold Filigree */}
    {[24, 86, 148, 210, 272, 334, 388].map((y, idx) => (
      <g key={idx} transform={`translate(13, ${y}) ${isRight ? 'scale(-1, 1)' : ''}`}>
        {/* Head with Gold Crown / Flower Motif */}
        <circle cx="0" cy="-15" r="4" fill="url(#goldGradModal)" />
        <circle cx={idx % 2 === 0 ? "2.5" : "-2.5"} cy="-17" r="1.4" fill="#ffffff" />

        {/* Hourglass Torso (Folk dance attire in gold filigree) */}
        <path d="M-5 -10 L5 -10 L0 -2 Z" fill="url(#goldGradSoftModal)" stroke="url(#goldGradModal)" strokeWidth="0.8" />
        <path d="M0 -2 L-6 8 L6 8 Z" fill="url(#goldGradSoftModal)" stroke="url(#goldGradModal)" strokeWidth="0.8" />

        {/* Linked Arms in graceful rhythmic arch */}
        <path d="M-4 -7 L-10 -13 L-11 -22" stroke="url(#goldGradModal)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M4 -7 L10 -1 L11 7" stroke="url(#goldGradModal)" strokeWidth="1.8" strokeLinecap="round" />

        {/* Dancing legs */}
        <path d="M-3 8 L-6 17 L-9 17" stroke="url(#goldGradModal)" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M3 8 L6 16 L9 20" stroke="url(#goldGradModal)" strokeWidth="1.8" strokeLinecap="round" />

        {/* Mini Gold Mandar Drum on alternate figures */}
        {idx % 2 === 1 ? (
          <ellipse cx="0" cy="-1" rx="3.8" ry="2.2" fill="#fffbeb" stroke="url(#goldGradModal)" strokeWidth="1" />
        ) : (
          <circle cx="0" cy="-1" r="1.4" fill="url(#goldGradModal)" />
        )}
      </g>
    ))}
  </svg>
);

// 6. Horizontal Sohrai & Khovar Geometric Gold Guilloche Frieze (Top & Bottom)
const SohraiKhovarGuillocheFrieze = ({ width = 640 }) => (
  <svg width={width} height="12" viewBox={`0 0 ${width} 12`} fill="none" xmlns="http://www.w3.org/2000/svg" style={{ display: 'block', margin: '0 auto' }}>
    <GoldGradients />
    {Array.from({ length: Math.floor(width / 24) }).map((_, i) => (
      <g key={i} transform={`translate(${i * 24}, 0)`}>
        <polygon points="0,11 6,2 12,11" fill="url(#goldGradSoftModal)" stroke="url(#goldGradModal)" strokeWidth="0.8" opacity="0.9" />
        <polygon points="12,1 18,10 24,1" fill="#0d2822" stroke="url(#goldGradModal)" strokeWidth="0.8" opacity="0.6" />
        <circle cx="6" cy="2" r="1.2" fill="#ffffff" />
        <circle cx="18" cy="10" r="1.2" fill="url(#goldGradModal)" />
      </g>
    ))}
  </svg>
);

// 7. Background Sacred Sal Tree (सखुआ) + Saura / Khovar Mandala Watermark
const SacredSalTreeWatermark = () => (
  <svg width="400" height="400" viewBox="0 0 400 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <GoldGradients />
    {/* Outer Sacred Sun / Lotus Circle */}
    <circle cx="200" cy="200" r="185" stroke="url(#goldGradModal)" strokeWidth="1.2" strokeDasharray="5 4" opacity="0.4" />
    <circle cx="200" cy="200" r="165" stroke="#0d2822" strokeWidth="0.8" opacity="0.35" />

    {/* Radiating Saura folk sun rays */}
    {Array.from({ length: 24 }).map((_, idx) => {
      const angle = (idx * 15 * Math.PI) / 180;
      const x1 = 200 + 165 * Math.cos(angle);
      const y1 = 200 + 165 * Math.sin(angle);
      const x2 = 200 + 185 * Math.cos(angle);
      const y2 = 200 + 185 * Math.sin(angle);
      return <line key={idx} x1={x1} y1={y1} x2={x2} y2={y2} stroke="url(#goldGradModal)" strokeWidth="1.2" opacity="0.35" />;
    })}

    {/* Sacred Sal / Sakhuwa Tree of Life (सखुआ वृक्ष) */}
    <g opacity="0.55">
      <path d="M196 350 L194 210 Q194 170 200 150 Q206 170 206 210 L204 350 Z" fill="#854d0e" />
      <path d="M196 350 Q175 375 150 385 M204 350 Q225 375 250 385" stroke="#854d0e" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M200 210 Q160 180 130 150 M200 210 Q240 180 270 150" stroke="url(#goldGradModal)" strokeWidth="2.2" strokeLinecap="round" />
      <path d="M200 170 Q150 130 120 80 M200 170 Q250 130 280 80" stroke="url(#goldGradModal)" strokeWidth="2" strokeLinecap="round" />
      <path d="M200 140 Q200 90 200 50" stroke="url(#goldGradModal)" strokeWidth="2.2" strokeLinecap="round" />

      {/* Sal Leaves clusters */}
      {[
        [130, 150], [120, 80], [200, 50], [280, 80], [270, 150],
        [160, 110], [240, 110], [170, 65], [230, 65]
      ].map(([lx, ly], lidx) => (
        <g key={lidx} transform={`translate(${lx}, ${ly})`}>
          <ellipse cx="0" cy="0" rx="13" ry="6.5" fill="url(#goldGradSoftModal)" opacity="0.45" />
          <ellipse cx="0" cy="0" rx="6.5" ry="13" fill="#15803d" opacity="0.3" />
          <circle cx="0" cy="0" r="2.2" fill="url(#goldGradModal)" />
        </g>
      ))}
    </g>
  </svg>
);

// 8. Authentic Official NGO Stamp with Hanging Satin Ribbons
const OfficialNGOStamp = ({ bgMode }) => (
  <div style={{ position: 'relative', width: '84px', height: '94px', margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
    {/* Hanging Satin Ribbon Tails */}
    <svg width="46" height="34" viewBox="0 0 46 34" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ position: 'absolute', bottom: '0', zIndex: 1 }}>
      <path d="M8 0 L18 0 L15 32 L11 26 L7 32 Z" fill="#991b1b" stroke="#ca8a04" strokeWidth="0.8" />
      <line x1="11" y1="0" x2="11" y2="26" stroke="#fde047" strokeWidth="0.8" opacity="0.6" />
      <path d="M26 0 L36 0 L39 32 L35 26 L31 32 Z" fill="#ca8a04" stroke="#713f12" strokeWidth="0.8" />
      <line x1="35" y1="0" x2="35" y2="26" stroke="#fef08a" strokeWidth="0.8" opacity="0.8" />
    </svg>

    {/* Authentic Official NGO Rubber Stamp on Pristine Medallion Disc */}
    <div
      style={{
        position: 'relative',
        zIndex: 2,
        width: '74px',
        height: '74px',
        borderRadius: '50%',
        background: bgMode === 'dark'
          ? 'radial-gradient(circle at 35% 30%, #ffffff 0%, #fef9c3 60%, #fef08a 100%)'
          : 'radial-gradient(circle at 35% 30%, #ffffff 0%, #fefce8 70%, #fef08a 100%)',
        border: '2px solid #ca8a04',
        boxShadow: '0 6px 18px rgba(0, 0, 0, 0.4), inset 0 2px 4px rgba(255,255,255,0.8), inset 0 -2px 6px rgba(0,0,0,0.25)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxSizing: 'border-box'
      }}
    >
      <img
        src={ngoStampImg}
        alt="आधिकारिक संस्था मुहर (Official NGO Stamp)"
        style={{
          width: '66px',
          height: '66px',
          objectFit: 'contain',
          filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.25))',
          transform: 'rotate(-4deg)'
        }}
      />
    </div>
  </div>
);

// Luxury Ornate Gold Divider
const LuxuryOrnateDivider = () => (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '5px auto 2px auto' }}>
    <div style={{ height: '1.2px', width: '90px', background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
    <span style={{ color: '#d4af37', fontSize: '9px' }}>✦</span>
    <span style={{ color: '#ca8a04', fontSize: '11px' }}>❖</span>
    <span style={{ color: '#d4af37', fontSize: '9px' }}>✦</span>
    <div style={{ height: '1.2px', width: '90px', background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
  </div>
);

export default function CertificateModal({ isOpen, onClose, certificate }) {
  const certRef = useRef(null);
  const [downloading, setDownloading] = useState(false);

  if (!isOpen || !certificate) return null;

  // Security guard: Only approved certificates can be viewed and downloaded
  if (certificate.status && certificate.status !== 'approved') {
    return (
      <div style={{ position: 'fixed', inset: 0, zIndex: 99999, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
        <div style={{ background: '#fff', borderRadius: '12px', padding: '28px', maxWidth: '420px', width: '100%', textAlign: 'center', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)' }}>
          <span style={{ fontSize: '42px', display: 'block', marginBottom: '12px' }}>⏳</span>
          <h3 style={{ margin: '0 0 10px 0', color: '#173d35', fontFamily: 'Georgia, serif', fontSize: '20px' }}>समीक्षाधीन प्रमाणपत्र</h3>
          <p style={{ color: '#64748b', fontSize: '13.5px', lineHeight: '1.6', margin: 0 }}>
            यह प्रमाणपत्र अभी एडमिन द्वारा स्वीकृत (Approved) नहीं हुआ है। संस्था के एडमिन द्वारा अनुमोदन मिलने के बाद ही आधिकारिक प्रमाणपत्र यहाँ प्रदर्शित व डाउनलोड किया जा सकेगा।
          </p>
          <button 
            onClick={onClose} 
            className="dashboard-btn-secondary" 
            style={{ marginTop: '20px', width: '100%', justifyContent: 'center', padding: '10px' }}
          >
            बंद करें (Close)
          </button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = async () => {
    if (!certRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(certRef.current, {
        scale: 3,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('landscape', 'mm', 'a4');
      const imgWidth = 297;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      const fileName = `${(certificate?.recipientName || 'Certificate').replace(/\s+/g, '_')}_Certificate.pdf`;
      pdf.save(fileName);
    } catch (err) {
      alert('Failed to generate PDF');
      console.error(err);
    } finally {
      setDownloading(false);
    }
  };

  const recipientRole = certificate.recipientRole || 'guest';
  const rank = certificate.rank;
  const templateType = certificate.templateType || 'default';

  // 5 Comprehensive Luxury Royal Color Themes (Dark Velvet & Light Tinted)
  const themeKey = certificate.themeColor || (
    templateType === 'merit' ? 'bronze' :
    templateType === 'appreciation' ? 'burgundy' : 'emerald'
  );
  const bgMode = certificate.bgMode || 'dark'; // 'dark' (default full rich color) or 'light' (tinted parchment)

  const themeConfigs = {
    emerald: {
      name: 'Royal Emerald',
      dark: {
        bg: 'radial-gradient(ellipse at 50% 45%, #0e332a 0%, #08211b 55%, #04120f 100%)',
        border: '#0d2822',
        primaryText: '#ffffff',
        titleColor: '#fef08a',
        accentColor: '#facc15',
        bodyText: '#f1f5f9',
        subText: '#cbd5e1',
        nameColor: '#fef08a',
        signColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #0d2822 0%, #164e3f 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(13, 40, 34, 0.8) 50%, rgba(212, 175, 55, 0.15) 100%)',
        watermarkOpacity: 0.08
      },
      light: {
        bg: 'radial-gradient(ellipse at 50% 45%, #f2fbf6 0%, #dcf5e7 55%, #b6ebd0 100%)',
        border: '#0d2822',
        primaryText: '#0d2822',
        titleColor: '#0d2822',
        accentColor: '#b45309',
        bodyText: '#1e293b',
        subText: '#475569',
        nameColor: '#0f172a',
        signColor: '#0d2822',
        badgeBg: 'linear-gradient(135deg, #0d2822 0%, #164e3f 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(13, 40, 34, 0.15) 50%, rgba(212, 175, 55, 0.12) 100%)',
        watermarkOpacity: 0.05
      }
    },
    navy: {
      name: 'Imperial Navy',
      dark: {
        bg: 'radial-gradient(ellipse at 50% 45%, #0d274c 0%, #081a33 55%, #040e1c 100%)',
        border: '#091b2e',
        primaryText: '#ffffff',
        titleColor: '#93c5fd',
        accentColor: '#60a5fa',
        bodyText: '#f1f5f9',
        subText: '#cbd5e1',
        nameColor: '#fef08a',
        signColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #091b2e 0%, #1e3a8a 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(9, 27, 46, 0.8) 50%, rgba(212, 175, 55, 0.15) 100%)',
        watermarkOpacity: 0.08
      },
      light: {
        bg: 'radial-gradient(ellipse at 50% 45%, #f2f7ff 0%, #dceaff 55%, #b8d7ff 100%)',
        border: '#091b2e',
        primaryText: '#091b2e',
        titleColor: '#1e3a8a',
        accentColor: '#1e40af',
        bodyText: '#1e293b',
        subText: '#475569',
        nameColor: '#091b2e',
        signColor: '#091b2e',
        badgeBg: 'linear-gradient(135deg, #091b2e 0%, #1e3a8a 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(9, 27, 46, 0.15) 50%, rgba(212, 175, 55, 0.12) 100%)',
        watermarkOpacity: 0.05
      }
    },
    burgundy: {
      name: 'Regal Burgundy',
      dark: {
        bg: 'radial-gradient(ellipse at 50% 45%, #4e0813 0%, #34040c 55%, #1c0206 100%)',
        border: '#42070f',
        primaryText: '#ffffff',
        titleColor: '#fecdd3',
        accentColor: '#fb7185',
        bodyText: '#f1f5f9',
        subText: '#cbd5e1',
        nameColor: '#fef08a',
        signColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #42070f 0%, #9f1239 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(66, 7, 15, 0.8) 50%, rgba(212, 175, 55, 0.15) 100%)',
        watermarkOpacity: 0.08
      },
      light: {
        bg: 'radial-gradient(ellipse at 50% 45%, #fff2f4 0%, #fde0e5 55%, #f8bcc6 100%)',
        border: '#42070f',
        primaryText: '#42070f',
        titleColor: '#881337',
        accentColor: '#991b1b',
        bodyText: '#1e293b',
        subText: '#475569',
        nameColor: '#42070f',
        signColor: '#42070f',
        badgeBg: 'linear-gradient(135deg, #42070f 0%, #9f1239 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(66, 7, 15, 0.15) 50%, rgba(212, 175, 55, 0.12) 100%)',
        watermarkOpacity: 0.05
      }
    },
    bronze: {
      name: 'Antique Bronze',
      dark: {
        bg: 'radial-gradient(ellipse at 50% 45%, #422d08 0%, #2b1d04 55%, #170f02 100%)',
        border: '#382604',
        primaryText: '#ffffff',
        titleColor: '#fef08a',
        accentColor: '#facc15',
        bodyText: '#f1f5f9',
        subText: '#cbd5e1',
        nameColor: '#fef08a',
        signColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #382604 0%, #92400e 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(56, 38, 4, 0.8) 50%, rgba(212, 175, 55, 0.15) 100%)',
        watermarkOpacity: 0.08
      },
      light: {
        bg: 'radial-gradient(ellipse at 50% 45%, #fefcf0 0%, #fef3c7 55%, #fde68a 100%)',
        border: '#382604',
        primaryText: '#382604',
        titleColor: '#78350f',
        accentColor: '#b45309',
        bodyText: '#1e293b',
        subText: '#475569',
        nameColor: '#382604',
        signColor: '#382604',
        badgeBg: 'linear-gradient(135deg, #382604 0%, #92400e 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(56, 38, 4, 0.15) 50%, rgba(212, 175, 55, 0.12) 100%)',
        watermarkOpacity: 0.05
      }
    },
    sapphire: {
      name: 'Royal Sapphire',
      dark: {
        bg: 'radial-gradient(ellipse at 50% 45%, #0e2254 0%, #081538 55%, #040a1d 100%)',
        border: '#0c1938',
        primaryText: '#ffffff',
        titleColor: '#93c5fd',
        accentColor: '#60a5fa',
        bodyText: '#f1f5f9',
        subText: '#cbd5e1',
        nameColor: '#fef08a',
        signColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #0c1938 0%, #2563eb 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(12, 25, 56, 0.8) 50%, rgba(212, 175, 55, 0.15) 100%)',
        watermarkOpacity: 0.08
      },
      light: {
        bg: 'radial-gradient(ellipse at 50% 45%, #f0f5ff 0%, #dbe7fe 55%, #b4cefd 100%)',
        border: '#0c1938',
        primaryText: '#0c1938',
        titleColor: '#1d4ed8',
        accentColor: '#2563eb',
        bodyText: '#1e293b',
        subText: '#475569',
        nameColor: '#0c1938',
        signColor: '#0c1938',
        badgeBg: 'linear-gradient(135deg, #0c1938 0%, #2563eb 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(12, 25, 56, 0.15) 50%, rgba(212, 175, 55, 0.12) 100%)',
        watermarkOpacity: 0.05
      }
    },
    amethyst: {
      name: 'Imperial Amethyst',
      dark: {
        bg: 'radial-gradient(ellipse at 50% 45%, #3b0764 0%, #2e1065 55%, #16022e 100%)',
        border: '#2e1065',
        primaryText: '#ffffff',
        titleColor: '#e9d5ff',
        accentColor: '#c084fc',
        bodyText: '#f1f5f9',
        subText: '#cbd5e1',
        nameColor: '#fef08a',
        signColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #2e1065 0%, #7e22ce 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(46, 16, 101, 0.8) 50%, rgba(212, 175, 55, 0.15) 100%)',
        watermarkOpacity: 0.08
      },
      light: {
        bg: 'radial-gradient(ellipse at 50% 45%, #faf5ff 0%, #f3e8ff 55%, #e9d5ff 100%)',
        border: '#2e1065',
        primaryText: '#2e1065',
        titleColor: '#6b21a8',
        accentColor: '#7e22ce',
        bodyText: '#1e293b',
        subText: '#475569',
        nameColor: '#2e1065',
        signColor: '#2e1065',
        badgeBg: 'linear-gradient(135deg, #2e1065 0%, #7e22ce 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(46, 16, 101, 0.15) 50%, rgba(212, 175, 55, 0.12) 100%)',
        watermarkOpacity: 0.05
      }
    },
    obsidian: {
      name: 'Royal Obsidian',
      dark: {
        bg: 'radial-gradient(ellipse at 50% 45%, #1c1c20 0%, #101014 55%, #08080a 100%)',
        border: '#09090b',
        primaryText: '#ffffff',
        titleColor: '#fef08a',
        accentColor: '#facc15',
        bodyText: '#f1f5f9',
        subText: '#cbd5e1',
        nameColor: '#fef08a',
        signColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #09090b 0%, #27272a 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(24, 24, 27, 0.8) 50%, rgba(212, 175, 55, 0.15) 100%)',
        watermarkOpacity: 0.08
      },
      light: {
        bg: 'radial-gradient(ellipse at 50% 45%, #f8fafc 0%, #f1f5f9 55%, #e2e8f0 100%)',
        border: '#0f172a',
        primaryText: '#0f172a',
        titleColor: '#0f172a',
        accentColor: '#b45309',
        bodyText: '#1e293b',
        subText: '#475569',
        nameColor: '#0f172a',
        signColor: '#0f172a',
        badgeBg: 'linear-gradient(135deg, #0f172a 0%, #334155 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(15, 23, 42, 0.15) 50%, rgba(212, 175, 55, 0.12) 100%)',
        watermarkOpacity: 0.05
      }
    },
    peacock: {
      name: 'Royal Peacock',
      dark: {
        bg: 'radial-gradient(ellipse at 50% 45%, #042f2e 0%, #02201f 55%, #011211 100%)',
        border: '#134e4a',
        primaryText: '#ffffff',
        titleColor: '#99f6e4',
        accentColor: '#2dd4bf',
        bodyText: '#f1f5f9',
        subText: '#cbd5e1',
        nameColor: '#fef08a',
        signColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #134e4a 0%, #0f766e 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(19, 78, 74, 0.8) 50%, rgba(212, 175, 55, 0.15) 100%)',
        watermarkOpacity: 0.08
      },
      light: {
        bg: 'radial-gradient(ellipse at 50% 45%, #f0fdfa 0%, #ccfbf1 55%, #99f6e4 100%)',
        border: '#134e4a',
        primaryText: '#134e4a',
        titleColor: '#115e59',
        accentColor: '#0f766e',
        bodyText: '#1e293b',
        subText: '#475569',
        nameColor: '#134e4a',
        signColor: '#134e4a',
        badgeBg: 'linear-gradient(135deg, #134e4a 0%, #0f766e 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(19, 78, 74, 0.15) 50%, rgba(212, 175, 55, 0.12) 100%)',
        watermarkOpacity: 0.05
      }
    },
    terracotta: {
      name: 'Royal Terracotta',
      dark: {
        bg: 'radial-gradient(ellipse at 50% 45%, #451a03 0%, #301102 55%, #1c0901 100%)',
        border: '#7c2d12',
        primaryText: '#ffffff',
        titleColor: '#fed7aa',
        accentColor: '#fb923c',
        bodyText: '#f1f5f9',
        subText: '#cbd5e1',
        nameColor: '#fef08a',
        signColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(124, 45, 18, 0.8) 50%, rgba(212, 175, 55, 0.15) 100%)',
        watermarkOpacity: 0.08
      },
      light: {
        bg: 'radial-gradient(ellipse at 50% 45%, #fffbeb 0%, #fef3c7 55%, #fed7aa 100%)',
        border: '#7c2d12',
        primaryText: '#7c2d12',
        titleColor: '#9a3412',
        accentColor: '#ea580c',
        bodyText: '#1e293b',
        subText: '#475569',
        nameColor: '#7c2d12',
        signColor: '#7c2d12',
        badgeBg: 'linear-gradient(135deg, #7c2d12 0%, #c2410c 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(124, 45, 18, 0.15) 50%, rgba(212, 175, 55, 0.12) 100%)',
        watermarkOpacity: 0.05
      }
    },
    maroon: {
      name: 'Classic Maroon',
      dark: {
        bg: 'radial-gradient(ellipse at 50% 45%, #58131a 0%, #3d0a10 55%, #220306 100%)',
        border: '#3c0a0f',
        primaryText: '#ffffff',
        titleColor: '#fecdd3',
        accentColor: '#f43f5e',
        bodyText: '#f1f5f9',
        subText: '#cbd5e1',
        nameColor: '#fef08a',
        signColor: '#fef08a',
        badgeBg: 'linear-gradient(135deg, #3c0a0f 0%, #881337 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.15) 0%, rgba(60, 10, 15, 0.8) 50%, rgba(212, 175, 55, 0.15) 100%)',
        watermarkOpacity: 0.08
      },
      light: {
        bg: 'radial-gradient(ellipse at 50% 45%, #fff1f2 0%, #ffe4e6 55%, #fecdd3 100%)',
        border: '#3c0a0f',
        primaryText: '#3c0a0f',
        titleColor: '#881337',
        accentColor: '#9f1239',
        bodyText: '#1e293b',
        subText: '#475569',
        nameColor: '#3c0a0f',
        signColor: '#3c0a0f',
        badgeBg: 'linear-gradient(135deg, #3c0a0f 0%, #881337 100%)',
        bannerBg: 'linear-gradient(90deg, rgba(212, 175, 55, 0.12) 0%, rgba(60, 10, 15, 0.15) 50%, rgba(212, 175, 55, 0.12) 100%)',
        watermarkOpacity: 0.05
      }
    }
  };

  const themeData = themeConfigs[themeKey] || themeConfigs.emerald;
  const currentTheme = themeData[bgMode] || themeData.dark;
  const themeBorderColor = currentTheme.border;
  const themeBadgeBg = currentTheme.badgeBg;
  const themeBannerBg = currentTheme.bannerBg;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.8)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
    >
      <div
        style={{
          backgroundColor: '#fff',
          borderRadius: '12px',
          padding: '20px',
          maxWidth: '890px',
          width: '100%',
          maxHeight: '95vh',
          overflowY: 'auto'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <div>
            <h3 style={{ margin: 0, color: '#0d2822', fontFamily: "'Cinzel', serif", fontWeight: '800' }}>
              आधिकारिक सम्मान पत्र पूर्वावलोकन (Certificate Preview)
            </h3>
            <span style={{ fontSize: '11px', color: '#64748b', letterSpacing: '1px', textTransform: 'uppercase', fontFamily: "'Montserrat', sans-serif" }}>
              Avyukt Utthan Sanstha · Executive Credential Portal
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              border: 'none',
              background: '#f1f5f9',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              fontSize: '16px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            ✕
          </button>
        </div>

        {/* CANVAS CONTAINER - A4 LANDSCAPE RATIO (840px x 595px) */}
        <div style={{ overflowX: 'auto', maxWidth: '100%', WebkitOverflowScrolling: 'touch', paddingBottom: '12px' }}>
          <div
            ref={certRef}
            style={{
              width: '840px',
              height: '595px',
              margin: '0 auto',
              position: 'relative',
              backgroundColor: currentTheme.border,
              background: currentTheme.bg,
              border: `12px solid ${themeBorderColor}`,
              boxSizing: 'border-box',
              padding: '20px 48px 12px 48px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              textAlign: 'center',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
              color: currentTheme.bodyText,
              overflow: 'hidden',
              fontFamily: "'Playfair Display', Georgia, serif"
            }}
          >
            {/* 1. Metallic Gold Inner Border */}
            <div
              style={{
                position: 'absolute',
                top: '6px',
                left: '6px',
                right: '6px',
                bottom: '6px',
                border: '2px solid #d4af37',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />

            {/* 2. Fine Gold Pinstripe Sub-border */}
            <div
              style={{
                position: 'absolute',
                top: '11px',
                left: '11px',
                right: '11px',
                bottom: '11px',
                border: '1px solid rgba(212, 175, 55, 0.45)',
                pointerEvents: 'none',
                zIndex: 2
              }}
            />

            {/* 3. FOUR CULTURAL CORNERS IN 24K GOLD ENGRAVING */}
            {/* Top-Left: पलाश पुष्प + कोयल */}
            <div style={{ position: 'absolute', top: '8px', left: '8px', zIndex: 4, pointerEvents: 'none' }}>
              <TopLeftPalashKoelGold />
            </div>

            {/* Top-Right: साल/सखुआ पत्र + कमल */}
            <div style={{ position: 'absolute', top: '8px', right: '8px', zIndex: 4, pointerEvents: 'none' }}>
              <TopRightSalLotusGold />
            </div>

            {/* Bottom-Left: सोहराय हाथी */}
            <div style={{ position: 'absolute', bottom: '8px', left: '8px', zIndex: 4, pointerEvents: 'none' }}>
              <BottomLeftElephantGold />
            </div>

            {/* Bottom-Right: शाही बाघ + नगाड़ा/मांदर */}
            <div style={{ position: 'absolute', bottom: '8px', right: '8px', zIndex: 4, pointerEvents: 'none' }}>
              <BottomRightTigerNagadaGold />
            </div>

            {/* 4. VERTICAL LEFT & RIGHT BORDERS: झूमर एवं करम नृत्य गोल्ड फिलीग्री लेस */}
            <div
              style={{
                position: 'absolute',
                top: '84px',
                left: '12px',
                bottom: '84px',
                width: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
                pointerEvents: 'none'
              }}
            >
              <KaramJhumarFiligreeVertical height={410} isRight={false} />
            </div>

            <div
              style={{
                position: 'absolute',
                top: '84px',
                right: '12px',
                bottom: '84px',
                width: '26px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 3,
                pointerEvents: 'none'
              }}
            >
              <KaramJhumarFiligreeVertical height={410} isRight={true} />
            </div>

            {/* 5. HORIZONTAL SOHRAI & KHOVAR GUILLOCHE FRIEZE (Top & Bottom) */}
            <div style={{ position: 'absolute', top: '12px', left: '92px', right: '92px', zIndex: 3, pointerEvents: 'none' }}>
              <SohraiKhovarGuillocheFrieze width={620} />
            </div>

            <div style={{ position: 'absolute', bottom: '26px', left: '92px', right: '92px', zIndex: 3, pointerEvents: 'none' }}>
              <SohraiKhovarGuillocheFrieze width={620} />
            </div>

            {/* 6. BACKGROUND WATERMARKS: साल (सखुआ) वृक्ष एवं कोहबर सौर चक्र + NGO Logo */}
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '400px',
                height: '400px',
                opacity: currentTheme.watermarkOpacity,
                pointerEvents: 'none',
                zIndex: 1
              }}
            >
              <SacredSalTreeWatermark />
            </div>

            <div
              style={{
                position: 'absolute',
                top: '51%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '260px',
                height: '260px',
                backgroundImage: `url(${logoImg})`,
                backgroundSize: 'contain',
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                opacity: currentTheme.watermarkOpacity * 1.4,
                pointerEvents: 'none',
                zIndex: 1
              }}
            />

            {/* SECTION A: REGAL HEADER */}
            <div style={{ position: 'relative', zIndex: 2, marginTop: '25px', marginBottom: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', width: '100%' }}>
                {/* Left Circular NGO Logo */}
                <div
                  style={{
                    position: 'absolute',
                    left: '26px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: '54px',
                    height: '54px',
                    borderRadius: '50%',
                    background: '#ffffff',
                    padding: '2px',
                    boxShadow: '0 3px 12px rgba(212, 175, 55, 0.35)',
                    border: '2px solid #d4af37',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <img src={logoImg} alt="AU Logo" style={{ width: '46px', height: '46px', borderRadius: '50%' }} />
                </div>

                {/* Centered NGO Name & Subtitles */}
                <div style={{ textAlign: 'center', width: '100%', boxSizing: 'border-box', padding: '0 85px', margin: '0 auto' }}>
                  <h2
                    style={{
                      margin: '0 0 2px 0',
                      paddingTop: '6px',
                      fontSize: '25px',
                      color: currentTheme.primaryText,
                      fontFamily: "'Noto Sans Devanagari', 'Poppins', 'Playfair Display', Georgia, serif",
                      fontWeight: '900',
                      letterSpacing: '1px',
                      lineHeight: 1.35
                    }}
                  >
                    अव्युक्त उत्थान संस्था
                  </h2>
                  <span
                    style={{
                      fontSize: '12px',
                      letterSpacing: '5px',
                      color: currentTheme.accentColor,
                      textTransform: 'uppercase',
                      fontWeight: '800',
                      display: 'block',
                      margin: '2px 0 3px 0',
                      fontFamily: "'Cinzel', serif"
                    }}
                  >
                    Avyukt Utthan Sanstha
                  </span>
                  <span
                    style={{
                      fontSize: '8.5px',
                      color: currentTheme.subText,
                      letterSpacing: '0.8px',
                      display: 'block',
                      textTransform: 'uppercase',
                      fontFamily: "'Montserrat', sans-serif",
                      fontWeight: '600'
                    }}
                  >
                    Regd. Under Societies Registration Act XXI of 1860 · Hazaribagh, Jharkhand (India)
                  </span>
                </div>
              </div>

              <LuxuryOrnateDivider />
            </div>

            {/* SECTION B: CERTIFICATE TITLE */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <span
                style={{
                  fontSize: '9.5px',
                  fontWeight: '800',
                  letterSpacing: '3px',
                  textTransform: 'uppercase',
                  color: currentTheme.accentColor,
                  fontFamily: "'Montserrat', sans-serif"
                }}
              >
                OFFICIAL RECOGNITION OF EXCELLENCE · आधिकारिक सम्मान पत्र
              </span>
              <h1
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '27px',
                  fontFamily: "'Cinzel', serif",
                  letterSpacing: '3px',
                  fontWeight: '900',
                  color: currentTheme.titleColor
                }}
              >
                CERTIFICATE OF {certificate.category ? certificate.category.toUpperCase() : 'PARTICIPATION'}
              </h1>
              <p
                style={{
                  margin: '2px 0 0 0',
                  fontSize: '12px',
                  color: currentTheme.subText,
                  fontStyle: 'italic',
                  fontFamily: "'Playfair Display', Georgia, serif"
                }}
              >
                यह सम्मान प्रमाणपत्र अत्यंत गौरव एवं कृतज्ञतापूर्वक प्रदान किया जाता है / This certificate is proudly conferred upon
              </p>
            </div>

            {/* SECTION C: RECIPIENT NAME (ROYAL CALLIGRAPHY) */}
            <div style={{ position: 'relative', zIndex: 2, margin: '2px 0' }}>
              <h2
                style={{
                  fontSize: '44px',
                  fontFamily: "'Great Vibes', 'Alex Brush', cursive, serif",
                  color: currentTheme.nameColor,
                  margin: '0 0 2px 0',
                  fontWeight: 'normal',
                  letterSpacing: '1px',
                  lineHeight: 1.15
                }}
              >
                {certificate.recipientName || 'Recipient Name'}
              </h2>

              {/* Golden Underline Flourish with Center Diamond */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', margin: '0 auto 6px auto', maxWidth: '340px' }}>
                <div style={{ flex: 1, height: '1.2px', background: 'linear-gradient(90deg, transparent, #d4af37)' }} />
                <span style={{ color: '#d4af37', fontSize: '10px' }}>❖</span>
                <div style={{ flex: 1, height: '1.2px', background: 'linear-gradient(90deg, #d4af37, transparent)' }} />
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' }}>
                {recipientRole && (
                  <span
                    style={{
                      padding: '3px 14px',
                      borderRadius: '16px',
                      fontSize: '10.5px',
                      fontWeight: '700',
                      background: themeBadgeBg,
                      color: '#fef08a',
                      border: '1px solid #d4af37',
                      fontFamily: "'Montserrat', sans-serif",
                      letterSpacing: '0.8px',
                      textTransform: 'uppercase',
                      boxShadow: '0 2px 6px rgba(13, 40, 34, 0.2)'
                    }}
                  >
                    {recipientRole.toLowerCase() === 'guest'
                      ? '🌟 GUEST OF HONOR (सम्मानित अतिथि)'
                      : recipientRole.toLowerCase() === 'student'
                        ? '👨‍🎓 SCHOLAR / STUDENT (विद्यार्थी)'
                        : recipientRole.toLowerCase() === 'volunteer'
                          ? '🤝 ACTIVE VOLUNTEER (स्वयंसेवक)'
                          : recipientRole.toLowerCase() === 'mentor'
                            ? '🌿 HONORED MENTOR (मेंटर)'
                            : recipientRole}
                  </span>
                )}
                {rank && (
                  <span
                    style={{
                      padding: '3px 14px',
                      borderRadius: '16px',
                      fontSize: '10.5px',
                      fontWeight: '700',
                      background: 'linear-gradient(135deg, #b45309 0%, #d97706 100%)',
                      color: '#ffffff',
                      border: '1px solid #fde68a',
                      fontFamily: "'Montserrat', sans-serif",
                      letterSpacing: '0.8px'
                    }}
                  >
                    🏅 {rank}
                  </span>
                )}
              </div>
            </div>

            {/* SECTION D: CITATION STATEMENT */}
            <div style={{ position: 'relative', zIndex: 2, maxWidth: '660px', margin: '0 auto' }}>
              {certificate.citationMatter && certificate.citationMatter.trim() ? (
                <div>
                  <p style={{ fontSize: '13px', color: currentTheme.bodyText, lineHeight: '1.5', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                    {certificate.citationMatter}
                  </p>
                  {certificate.title && (
                    <div style={{ marginTop: '2px' }}>
                      <strong
                        style={{
                          color: currentTheme.titleColor,
                          fontSize: '15.5px',
                          fontFamily: "'Cinzel', Georgia, serif",
                          display: 'inline-block',
                          margin: '1px 0',
                          letterSpacing: '0.6px',
                          fontWeight: '800'
                        }}
                      >
                        "{certificate.title}"
                      </strong>
                    </div>
                  )}
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: currentTheme.bodyText, lineHeight: '1.5', margin: 0, fontFamily: "'Playfair Display', Georgia, serif" }}>
                  संस्था के अभियान एवं सामाजिक उत्थान कार्यक्रम में सक्रिय सहभागिता, निष्ठा एवं उत्कृष्ट योगदान के उपलक्ष्य में:
                  <br />
                  <strong
                    style={{
                      color: currentTheme.titleColor,
                      fontSize: '16px',
                      fontFamily: "'Cinzel', Georgia, serif",
                      display: 'inline-block',
                      margin: '3px 0',
                      letterSpacing: '0.6px',
                      fontWeight: '800'
                    }}
                  >
                    "{certificate.title || 'Institutional Event'}"
                  </strong>
                  <br />
                  <span style={{ fontSize: '11.5px', color: currentTheme.subText }}>
                    संस्था आपके अमूल्य समर्पण की सराहना करती है तथा आपके उज्ज्वल भविष्य की मंगलकामना करती है।
                  </span>
                </p>
              )}
            </div>

            {/* SECTION E: REGAL FOOTER - DATES, EMBOSSED SEAL & SIGNATURE */}
            <div
              style={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-end',
                padding: '0 16px',
                marginTop: '3px'
              }}
            >
              {/* Left: Date of Conformance */}
              <div style={{ textAlign: 'left', minWidth: '160px' }}>
                <span
                  style={{
                    fontSize: '9px',
                    color: currentTheme.accentColor,
                    textTransform: 'uppercase',
                    letterSpacing: '1.2px',
                    fontWeight: '800',
                    display: 'block',
                    fontFamily: "'Montserrat', sans-serif"
                  }}
                >
                  DATE OF ISSUANCE / जारी तिथि
                </span>
                <strong
                  style={{
                    fontSize: '13px',
                    color: currentTheme.primaryText,
                    fontFamily: "'Cinzel', serif",
                    display: 'block',
                    marginTop: '1px'
                  }}
                >
                  {certificate.issueDate
                    ? new Date(certificate.issueDate).toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' })
                    : new Date().toLocaleDateString('hi-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                </strong>
                <span style={{ fontSize: '9.5px', color: currentTheme.subText, display: 'block', marginTop: '1px', fontFamily: "'Montserrat', sans-serif" }}>
                  📍 हजारीबाग, झारखंड (भारत)
                </span>
              </div>

              {/* Center: Authentic Official NGO Stamp with Satin Ribbons */}
              <div style={{ textAlign: 'center' }}>
                <OfficialNGOStamp bgMode={bgMode} />
              </div>

              {/* Right: Authorized Signature */}
              <div style={{ textAlign: 'right', minWidth: '160px' }}>
                <div
                  style={{
                    fontFamily: "'Great Vibes', cursive",
                    fontSize: '27px',
                    color: currentTheme.signColor,
                    marginBottom: '1px',
                    lineHeight: 1
                  }}
                >
                  {certificate.signatoryName || 'Arun Singh'}
                </div>
                <div style={{ width: '130px', height: '1.5px', background: `linear-gradient(90deg, transparent, #d4af37, ${currentTheme.signColor})`, marginLeft: 'auto', marginBottom: '3px' }} />
                <span
                  style={{
                    fontSize: '9.5px',
                    fontWeight: '800',
                    color: currentTheme.primaryText,
                    display: 'block',
                    letterSpacing: '1px',
                    fontFamily: "'Montserrat', sans-serif",
                    textTransform: 'uppercase'
                  }}
                >
                  AUTHORIZED SIGNATORY
                </span>
                <span style={{ fontSize: '9px', color: currentTheme.subText, display: 'block', fontFamily: "'Playfair Display', serif" }}>
                  {certificate.signatoryTitle || 'निदेशक, अव्युक्त उत्थान संस्था'}
                </span>
              </div>
            </div>

            {/* SECTION F: HERITAGE BANNER OF FESTIVALS */}
            <div style={{ position: 'relative', zIndex: 2, margin: '2px 0 0 0', textAlign: 'center' }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '2px 14px',
                  background: themeBannerBg,
                  borderRadius: '12px',
                  border: '1px solid rgba(212, 175, 55, 0.35)'
                }}
              >
                <span style={{ color: currentTheme.accentColor, fontSize: '9px' }}>✦</span>
                <span style={{ fontSize: '8.5px', fontWeight: '800', color: currentTheme.primaryText, letterSpacing: '0.6px', fontFamily: "'Montserrat', sans-serif" }}>
                  पावन लोक-धरोहर: सोहराय (Sohrai) · करम (Karam) · सरहुल (Sarhul) · जावा पर्व (Jawa) · टुसू पर्व (Tusu Parab)
                </span>
                <span style={{ color: currentTheme.accentColor, fontSize: '9px' }}>✦</span>
              </div>
            </div>

            {/* SECTION G: HIGH-SECURITY DIGITAL VERIFICATION BAR */}
            <div style={{ position: 'relative', zIndex: 2, margin: '1px 0 0 0', textAlign: 'center' }}>
              <span
                style={{
                  fontSize: '8.8px',
                  color: currentTheme.subText,
                  letterSpacing: '0.8px',
                  fontFamily: "'Montserrat', sans-serif",
                  fontWeight: '600'
                }}
              >
                VERIFICATION ID: <strong style={{ color: currentTheme.primaryText }}>AU-{certificate.uniqueCertId || certificate._id?.slice(-8).toUpperCase() || 'CERT'}</strong> · VALIDATE AT: <strong style={{ color: currentTheme.primaryText }}>portal.avyukt.org/verify</strong> · REGISTERED CHARITABLE SOCIETY
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '16px' }}>
          <button
            onClick={onClose}
            style={{
              padding: '10px 20px',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              background: '#ffffff',
              color: '#475569',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            बंद करें (Close)
          </button>
          <button
            onClick={handleDownloadPDF}
            disabled={downloading}
            className="dashboard-btn-gold"
            style={{ padding: '11px 26px', fontSize: '14px', cursor: 'pointer' }}
          >
            {downloading ? 'डाउनलोड हो रहा है...' : '📥 Download Official PDF Certificate'}
          </button>
        </div>
      </div>
    </div>
  );
}
