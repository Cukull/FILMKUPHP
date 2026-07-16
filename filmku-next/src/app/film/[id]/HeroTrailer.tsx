'use client';

import { useState } from 'react';

export default function HeroTrailer({ videoId, title }: { videoId: string, title: string }) {
  const [isMuted, setIsMuted] = useState(true);

  // Re-build embed URL when mute state changes.
  // Note: Changing src will reload the iframe, but it's the simplest way to toggle mute without external libraries.
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&modestbranding=1`;

  return (
    <>
      <div style={{ 
        position: 'absolute', 
        width: '100vw', 
        height: '56.25vw', 
        minHeight: '100vh', 
        minWidth: '177.77vh', 
        transform: 'translate(-50%, -50%)', 
        top: '50%', 
        left: '50%', 
        zIndex: 0,
        pointerEvents: isMuted ? 'none' : 'auto' // Allow interaction when unmuted if desired
      }}>
        <iframe 
          src={embedUrl}
          style={{ width: '100%', height: '100%', border: 'none', transform: 'scale(1.2)' }}
          allow="autoplay; encrypted-media"
          title={title}
        />
      </div>

      {/* Mute/Unmute Button */}
      <button 
        onClick={() => setIsMuted(!isMuted)}
        style={{
          position: 'absolute',
          bottom: '15%',
          right: '5%',
          zIndex: 10,
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: '50%',
          width: '50px',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          backdropFilter: 'blur(5px)',
          transition: 'all 0.3s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.2)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(0,0,0,0.5)'}
        aria-label={isMuted ? "Unmute" : "Mute"}
      >
        {isMuted ? (
          // Muted Icon SVG
          <svg xmlns="http://www.w3.org/EU/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        ) : (
          // Speaker Unmuted Icon SVG
          <svg xmlns="http://www.w3.org/EU/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        )}
      </button>
    </>
  );
}
