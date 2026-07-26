'use client';

import React from 'react';
import './CinemaFrame.css';
import CinemaSilhouettes from './CinemaSilhouettes';

interface CinemaFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  showSilhouettes?: boolean;
}

export default function CinemaFrame({
  children,
  title = 'FILMKU PREMIUM THEATER',
  className = '',
  showSilhouettes = true
}: CinemaFrameProps) {
  return (
    <div className={`cinema-frame-container ${className}`}>
      {/* ── Top Valance / Drapery Panggung (Proscenium Arch) ── */}
      <div className="cinema-valance">
        <div className="cinema-valance-title">
          <span>★</span>
          <span>{title}</span>
          <span>★</span>
        </div>
        <div className="cinema-valance-glow" />
      </div>

      {/* ── Row Pilar Kiri - Konten Video - Pilar Kanan ── */}
      <div className="cinema-stage-row">
        {/* Kolom Pilar Dekoratif Kiri */}
        <div className="cinema-pillar cinema-pillar-left" aria-hidden="true" />

        {/* Konten Utama (Video Player) */}
        <div className="cinema-stage-content">
          {children}
          {/* Siluet Penonton & Kursi Bioskop di Tepi Bawah */}
          {showSilhouettes && <CinemaSilhouettes />}
        </div>

        {/* Kolom Pilar Dekoratif Kanan */}
        <div className="cinema-pillar cinema-pillar-right" aria-hidden="true" />
      </div>
    </div>
  );
}
