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
  const [isMobile, setIsMobile] = useState(false);
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

      {/* ── ElasticSlider Volume Control (0-100) ── */}
      <div
        className="filmku-volume-pill"
        style={{
          position: 'absolute',
          bottom: '18%',
          right: '4%',
          zIndex: 25,
          pointerEvents: 'auto',
        }}
      >
        <ElasticSlider
          startingValue={0}
          defaultValue={0}
          maxValue={100}
          value={volume}
          onChange={handleVolumeChange}
        />
      </div>
    </>
  );
}
