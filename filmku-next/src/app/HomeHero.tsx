'use client';

import { useState } from 'react';

type Props = {
  trailerVideoId: string;
  title: string;
  synopsis: string;
  rating: string;
  genre: string;
};

export default function HomeHero({ trailerVideoId, title, synopsis, rating, genre }: Props) {
  const [isMuted, setIsMuted] = useState(true);

  const embedUrl = `https://www.youtube.com/embed/${trailerVideoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${trailerVideoId}&modestbranding=1`;

  return (
    <section className="home-hero" style={{ position: 'relative', overflow: 'hidden' }}>
      {/* YouTube iframe background */}
      <div style={{ position: 'absolute', width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.77vh', transform: 'translate(-50%, -50%)', top: '50%', left: '50%', zIndex: 0, pointerEvents: 'none' }}>
        <iframe
          src={embedUrl}
          style={{ width: '100%', height: '100%', border: 'none', transform: 'scale(1.2)' }}
          allow="autoplay; encrypted-media"
          title="Trailer"
        />
      </div>
      <div className="home-hero-overlay" style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, var(--bg-base) 0%, rgba(8,8,16,0.8) 40%, rgba(8,8,16,0.2) 100%), linear-gradient(to top, var(--bg-base) 0%, transparent 40%)' }} />

      {/* Mute/Unmute Button */}
      <button
        onClick={() => setIsMuted(!isMuted)}
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '5%',
          zIndex: 10,
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '50%',
          width: '48px',
          height: '48px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          backdropFilter: 'blur(8px)',
          transition: 'all 0.25s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
        aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>

      <div className="home-hero-content" style={{ zIndex: 2, position: 'relative' }}>
        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          <span className="badge badge-gold">⭐ {rating} / 10</span>
          <span className="badge badge-accent">{genre}</span>
          <span className="badge badge-muted">HD</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem', color: '#fff', letterSpacing: '-0.02em' }}>
          {title}
        </h1>

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '520px' }}>
          {synopsis}
        </p>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn-primary" style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem' }}>
            🎬 Pilih Sesi Tayang
          </button>
          <button className="btn-outline" style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem' }}>
            ▶ Lihat Trailer
          </button>
        </div>
      </div>
    </section>
  );
}
