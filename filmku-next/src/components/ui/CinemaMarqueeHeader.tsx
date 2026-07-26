'use client';

import React from 'react';
import './CinemaMarqueeHeader.css';

interface CinemaMarqueeHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export default function CinemaMarqueeHeader({
  title,
  subtitle = 'NOW SHOWING IN FILMKU THEATER',
  className = ''
}: CinemaMarqueeHeaderProps) {
  // Dikurangi jumlah lampu (total 30 lampu) agar sangat ringan untuk CPU/GPU device (tetap simetris dan aestetik)
  const topBulbsCount = 12;
  const bottomBulbsCount = 12;
  const sideBulbsCount = 3;

  return (
    <div className={`cinema-marquee-container ${className}`}>
      {/* Garis Aksen Emas Dalam */}
      <div className="cinema-marquee-inner-border" aria-hidden="true" />

      {/* ── Deretan Lampu Marquee Atas ── */}
      <div className="cinema-marquee-top-bulbs" aria-hidden="true">
        {Array.from({ length: topBulbsCount }).map((_, index) => (
          <div
            key={`top-${index}`}
            className="cinema-marquee-bulb"
            style={{
              position: 'relative',
              animationDelay: `${(index * 0.23) % 2.8}s`
            }}
          />
        ))}
      </div>

      {/* ── Deretan Lampu Marquee Bawah ── */}
      <div className="cinema-marquee-bottom-bulbs" aria-hidden="true">
        {Array.from({ length: bottomBulbsCount }).map((_, index) => (
          <div
            key={`bottom-${index}`}
            className="cinema-marquee-bulb"
            style={{
              position: 'relative',
              animationDelay: `${((index + 6) * 0.23) % 2.8}s`
            }}
          />
        ))}
      </div>

      {/* ── Deretan Lampu Marquee Kiri ── */}
      <div className="cinema-marquee-left-bulbs" aria-hidden="true">
        {Array.from({ length: sideBulbsCount }).map((_, index) => (
          <div
            key={`left-${index}`}
            className="cinema-marquee-bulb"
            style={{
              position: 'relative',
              animationDelay: `${((index + 3) * 0.23) % 2.8}s`
            }}
          />
        ))}
      </div>

      {/* ── Deretan Lampu Marquee Kanan ── */}
      <div className="cinema-marquee-right-bulbs" aria-hidden="true">
        {Array.from({ length: sideBulbsCount }).map((_, index) => (
          <div
            key={`right-${index}`}
            className="cinema-marquee-bulb"
            style={{
              position: 'relative',
              animationDelay: `${((index + 9) * 0.23) % 2.8}s`
            }}
          />
        ))}
      </div>

      {/* ── Konten Teks Judul Marquee ── */}
      <div className="cinema-marquee-content">
        <span className="cinema-marquee-subtitle">{subtitle}</span>
        <h1 className="cinema-marquee-title">
          Nonton: {title}
        </h1>
      </div>
    </div>
  );
}
