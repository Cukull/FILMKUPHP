'use client';

import React from 'react';

export default function CinemaSilhouettes() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: '56px',
        zIndex: 60,
        pointerEvents: 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center'
      }}
    >
      {/* ── Gradient Overlay: Hitam pekat di bawah ke transparan ke atas ── */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(0deg, rgba(5,5,5,0.98) 0%, rgba(5,5,5,0.7) 35%, rgba(5,5,5,0.15) 75%, transparent 100%)',
          zIndex: 1
        }}
      />

      {/* ── SVG Siluet Kepala Penonton & Kursi Bioskop (POV dari kursi belakang) ── */}
      <svg
        viewBox="0 0 1000 60"
        preserveAspectRatio="none"
        style={{
          position: 'relative',
          zIndex: 2,
          width: '100%',
          height: '100%',
          display: 'block'
        }}
      >
        {/* Kursi Kosong / Sandaran Antar Penonton */}
        <path d="M25,60 L28,51 C30,48 70,48 72,51 L75,60 Z" fill="#060606" opacity="0.9" />
        <path d="M210,60 L213,50 C215,47 265,47 267,50 L270,60 Z" fill="#050505" opacity="0.85" />
        <path d="M415,60 L418,52 C420,49 465,49 467,52 L470,60 Z" fill="#060606" opacity="0.9" />
        <path d="M620,60 L623,50 C625,47 670,47 672,50 L675,60 Z" fill="#070707" opacity="0.88" />
        <path d="M810,60 L813,51 C815,48 855,48 857,51 L860,60 Z" fill="#050505" opacity="0.9" />

        {/* Penonton 1 (Kiri) - Kepala agak miring */}
        <g opacity="0.95">
          <ellipse cx="140" cy="34" rx="13" ry="15" fill="#080808" />
          <path d="M112,60 C116,47 128,43 140,43 C152,43 164,47 168,60 Z" fill="#060606" />
        </g>

        {/* Penonton 2 (Tengah-Kiri) */}
        <g opacity="0.92">
          <ellipse cx="340" cy="37" rx="12" ry="14" fill="#070707" />
          <path d="M315,60 C319,49 329,46 340,46 C351,46 361,49 365,60 Z" fill="#080808" />
        </g>

        {/* Penonton 3 (Tengah - Sedikit lebih tinggi) */}
        <g opacity="0.96">
          <ellipse cx="540" cy="30" rx="14" ry="16" fill="#090909" />
          <path d="M510,60 C515,46 528,41 540,41 C552,41 565,46 570,60 Z" fill="#070707" />
        </g>

        {/* Penonton 4 (Tengah-Kanan) */}
        <g opacity="0.94">
          <ellipse cx="740" cy="36" rx="12" ry="14" fill="#060606" />
          <path d="M715,60 C719,49 729,46 740,46 C751,46 761,49 765,60 Z" fill="#080808" />
        </g>

        {/* Penonton 5 (Kanan) */}
        <g opacity="0.95">
          <ellipse cx="915" cy="33" rx="13" ry="15" fill="#080808" />
          <path d="M888,60 C893,47 904,43 915,43 C926,43 937,47 942,60 Z" fill="#060606" />
        </g>
      </svg>
    </div>
  );
}
