"use client";

import React, { useState } from 'react';
import MovieLaneCarousel from './MovieLaneCarousel';
import MovieLaneCard from './MovieLaneCard';
import * as LucideIcons from 'lucide-react';
import Link from 'next/link';

function RenderLucideIcon({ name, size = 24 }: { name: string, size?: number }) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Film;
  return <IconComponent size={size} />;
}

export default function BestFilmsSection({ bestFilmSections }: { bestFilmSections: any[] }) {
  // Urutkan tahun dari yang terbaru
  const sortedSections = [...bestFilmSections].sort((a, b) => {
    const yearA = parseInt(a.name.replace(/[^0-9]/g, '')) || 0;
    const yearB = parseInt(b.name.replace(/[^0-9]/g, '')) || 0;
    return yearB - yearA;
  });

  const [activeSectionName, setActiveSectionName] = useState(sortedSections[0]?.name || '');

  const activeSection = sortedSections.find(s => s.name === activeSectionName) || sortedSections[0];

  if (!activeSection) return null;

  return (
    <div className="movie-lane" style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 className="movie-lane-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
            <span style={{ color: 'var(--primary)' }}><RenderLucideIcon name="Award" size={20} /></span> Film Terbaik
          </h3>
          <Link
            href="/genre"
            style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.03em' }}
          >
            Lihat Semua →
          </Link>
        </div>
        
        {/* Navigasi Tahun */}
        <div 
          className="hide-scrollbar"
          style={{ 
            display: 'flex', 
            gap: '0.75rem', 
            overflowX: 'auto', 
            width: '100%', 
            paddingBottom: '0.5rem',
            WebkitOverflowScrolling: 'touch'
          }} 
        >
          {sortedSections.map(section => {
            const year = section.name.replace(/[^0-9]/g, '');
            const displayYear = year || section.name;
            const isActive = section.name === activeSectionName;
            
            return (
              <button
                key={section.name}
                onClick={() => setActiveSectionName(section.name)}
                style={{
                  padding: '0.5rem 1.25rem',
                  borderRadius: '2rem',
                  border: isActive ? '1px solid var(--primary)' : '1px solid rgba(255,255,255,0.1)',
                  background: isActive ? 'rgba(229, 9, 20, 0.1)' : 'transparent',
                  color: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.6)',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
                onMouseOver={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'white';
                }}
                onMouseOut={(e) => {
                  if (!isActive) e.currentTarget.style.color = 'rgba(255,255,255,0.6)';
                }}
              >
                {displayYear}
              </button>
            );
          })}
        </div>
      </div>

      {activeSection.movies.length > 0 ? (
        <MovieLaneCarousel>
          {activeSection.movies.map((movie: any) => (
            <MovieLaneCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterUrl={movie.posterUrl}
              rating={movie.rating}
              genre={movie.genre}
              synopsis={movie.synopsis}
              status={movie.status}
              sections={movie.sections}
              country={movie.country}
              originalLanguage={movie.originalLanguage}
              mediaType={movie.mediaType}
            />
          ))}
        </MovieLaneCarousel>
      ) : (
        <div style={{
          padding: '1.25rem 2rem',
          borderRadius: '1rem',
          background: 'rgba(255,255,255,0.02)',
          border: '1px dashed rgba(255,255,255,0.08)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem',
          color: 'rgba(255,255,255,0.4)',
          fontSize: '0.875rem',
          marginTop: '0.75rem',
          marginBottom: '1.5rem'
        }}>
          <span>🎬</span>
          <span>Belum ada film di tahun <strong>{activeSection.name.replace(/[^0-9]/g, '') || activeSection.name}</strong></span>
        </div>
      )}
    </div>
  );
}
