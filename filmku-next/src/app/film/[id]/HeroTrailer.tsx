'use client';

import { useState, useRef } from 'react';

export default function HeroTrailer({ videoId, title }: { videoId: string; title: string }) {
  const [isMuted, setIsMuted] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Selalu mulai dengan mute=1, tapi tambahkan enablejsapi=1 agar bisa dikontrol via postMessage
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&modestbranding=1&enablejsapi=1`;

  const postYT = (action: string) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: action, args: [] }),
        '*'
      );
    }
  };

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
        pointerEvents: 'none',
      }}>
        <iframe
          ref={iframeRef}
          src={embedUrl}
          style={{ width: '100%', height: '100%', border: 'none', transform: 'scale(1.2)' }}
          allow="autoplay; encrypted-media"
          title={title}
          onLoad={() => {
            // Jika user sebelumnya sudah unmute, sinkronisasikan state ke iframe saat load
            if (!isMuted) {
              setTimeout(() => postYT('unMute'), 800);
            }
          }}
        />
      </div>

      {/* Mute / Unmute Button */}
      <button
        onClick={() => {
          setIsMuted(prev => {
            const next = !prev;
            postYT(next ? 'mute' : 'unMute');
            return next;
          });
        }}
        style={{
          position: 'absolute',
          bottom: '18%',
          right: '4%',
          zIndex: 25,
          background: 'rgba(0,0,0,0.55)',
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
          pointerEvents: 'auto',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.55)')}
        aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
      >
        {isMuted ? (
          // Muted — speaker with X
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" />
            <line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          // Unmuted — speaker with waves
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>
    </>
  );
}
