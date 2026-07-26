'use client';

import { useState, useRef } from 'react';
import ElasticSlider from '@/components/ui/ElasticSlider';

export default function HeroTrailer({ videoId, title }: { videoId: string; title: string }) {
  const [isMuted, setIsMuted] = useState(true);
  const [volume, setVolume] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

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
