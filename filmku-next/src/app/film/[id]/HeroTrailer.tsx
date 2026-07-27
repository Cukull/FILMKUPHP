'use client';

import { useState, useEffect, useRef } from 'react';
import ElasticSlider from '@/components/ui/ElasticSlider';

interface HeroTrailerProps {
  videoId: string;
  title: string;
  posterUrl?: string | null;
  backdropUrl?: string | null;
}

export default function HeroTrailer({ videoId, title, posterUrl, backdropUrl }: HeroTrailerProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0);
  const [isMobile, setIsMobile] = useState(true);
  const [showMute, setShowMute] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Selalu mulai dengan mute=1, tapi tambahkan enablejsapi=1 agar bisa dikontrol via postMessage
  const embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&modestbranding=1&enablejsapi=1`;

  const postYT = (action: string, args: any[] = []) => {
    if (iframeRef.current && iframeRef.current.contentWindow) {
      iframeRef.current.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: action, args }),
        '*'
      );
    }
  };

  const handleVolumeChange = (newVol: number) => {
    setVolume(newVol);
    if (newVol > 0) {
      if (isMuted) {
        setIsMuted(false);
        postYT('unMute');
      }
      postYT('setVolume', [newVol]);
    } else {
      setIsMuted(true);
      postYT('mute');
    }
  };

  const toggleMute = () => {
    if (isMuted) {
      setIsMuted(false);
      setVolume(80);
      postYT('unMute');
      postYT('setVolume', [80]);
    } else {
      setIsMuted(true);
      setVolume(0);
      postYT('mute');
    }
  };

  return (
    <>
      {isMobile ? (
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
        }}>
          <img
            src={backdropUrl || posterUrl || '/placeholder.jpg'}
            alt={title}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'center top',
            }}
          />
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          width: '100%',
          maxWidth: '100%',
          height: '56.25vw',
          minHeight: '100vh',
          minWidth: '100%',
          clipPath: 'inset(0 0 0 0)',
          contain: 'paint',
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
      )}

      {/* ── Volume Control: SVG Speaker Icon on Mobile, ElasticSlider on Desktop ── */}
      <div
        className="filmku-volume-pill"
        style={{
          position: 'absolute',
          bottom: '18%',
          right: '4%',
          zIndex: 25,
          pointerEvents: 'auto',
          opacity: showMute ? 1 : (isMobile ? 0.4 : 0),
          transform: (showMute || isMobile) ? 'translateY(0)' : 'translateY(10px)',
          transition: 'all 0.4s ease',
        }}
        onMouseEnter={() => setShowMute(true)}
        onMouseLeave={() => setShowMute(false)}
      >
        {isMobile ? (
          <button
            onClick={toggleMute}
            aria-label={isMuted ? 'Aktifkan Suara' : 'Bisukan Suara'}
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(8, 8, 16, 0.75)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(8px)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
              transition: 'all 0.2s ease',
              padding: 0,
            }}
          >
            {isMuted ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <line x1="23" y1="9" x2="17" y2="15"></line>
                <line x1="17" y1="9" x2="23" y2="15"></line>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
              </svg>
            )}
          </button>
        ) : (
          <ElasticSlider
            startingValue={0}
            defaultValue={0}
            maxValue={100}
            value={volume}
            onChange={handleVolumeChange}
          />
        )}
      </div>
    </>
  );
}
