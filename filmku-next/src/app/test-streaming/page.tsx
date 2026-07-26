'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMovieStreamUrl } from './action';
import CurtainReveal from '@/components/ui/CurtainReveal';
import CinemaFrame from '@/components/ui/CinemaFrame';
import CinemaMarqueeHeader from '@/components/ui/CinemaMarqueeHeader';

type PlayerState = 'idle' | 'playing' | 'paused' | 'ended';

function StreamingContent() {
  const searchParams = useSearchParams();
  const queryTitle = searchParams.get('title') || 'The Backrooms'; // Default fallback
  
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // State untuk mengontrol status pemutaran film & efek meredup (Time-Based Dim)
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [isDimmed, setIsDimmed] = useState(false);
  const hasTriggeredFirstPlayRef = useRef(false);

  // 1. useEffect: Time-Based Dim dengan delay 3 detik (trigger pertama kali)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (playerState === 'playing') {
      if (!hasTriggeredFirstPlayRef.current) {
        // PERTAMA KALI playing: tunggu 3 detik sebelum trigger animasi dim
        timeoutId = setTimeout(() => {
          hasTriggeredFirstPlayRef.current = true;
          setIsDimmed(true);
        }, 3000);
      } else {
        // Resume play setelah pause: langsung dim dengan transisi halus tanpa delay 3 detik lagi
        setIsDimmed(true);
      }
    } else if (playerState === 'paused') {
      // Pause: clear timeout & fade back ke terang dalam ~0.5s supaya nyaman berinteraksi
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsDimmed(false), 0);
    } else if (playerState === 'ended' || playerState === 'idle') {
      // Ended / Idle: clear timeout & otomatis netral/reset (menghindari konflik dengan End Credits)
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsDimmed(false), 0);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [playerState]);

  // 2. useEffect: Animasi Navbar opacity (0.35 saat dim) & Hover effect supaya tetap accessible
  useEffect(() => {
    const navbar = document.querySelector('.navbar') as HTMLElement | null;
    if (!navbar) return;

    const handleMouseEnter = () => {
      if (isDimmed) {
        navbar.style.opacity = '1';
        navbar.style.transition = 'opacity 0.3s ease-out';
      }
    };

    const handleMouseLeave = () => {
      if (isDimmed && playerState === 'playing') {
        navbar.style.opacity = '0.35';
        navbar.style.transition = 'opacity 1.5s ease-in-out';
      }
    };

    navbar.addEventListener('mouseenter', handleMouseEnter);
    navbar.addEventListener('mouseleave', handleMouseLeave);

    if (isDimmed) {
      navbar.style.opacity = '0.35';
      navbar.style.transition = 'opacity 1.8s ease-in-out';
    } else {
      navbar.style.opacity = '1';
      navbar.style.transition = 'opacity 0.5s ease-out';
    }

    return () => {
      navbar.removeEventListener('mouseenter', handleMouseEnter);
      navbar.removeEventListener('mouseleave', handleMouseLeave);
      navbar.style.opacity = '1';
      navbar.style.transition = '';
    };
  }, [isDimmed, playerState]);

  // 3. useEffect: Listen ke pesan HTML5 dari iframe eksternal (jika didukung pemutar)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === 'string' || typeof event.data === 'object') {
        const msg = JSON.stringify(event.data).toLowerCase();
        if (msg.includes('play') && !msg.includes('pause')) setPlayerState('playing');
        else if (msg.includes('pause')) setPlayerState('paused');
        else if (msg.includes('ended') || msg.includes('finish')) setPlayerState('ended');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const handleTontonFilm = async () => {
    setLoading(true);
    setErrorMsg('');
    setStreamUrl(null);
    setPlayerState('idle');
    hasTriggeredFirstPlayRef.current = false;
    
    try {
      // Mengirim queryTitle ke action, action akan mencari TMDB ID dan mengembalikan link vidsrc
      const url = await getMovieStreamUrl(queryTitle);
      if (url) {
        setStreamUrl(url);
      } else {
        setErrorMsg(`Gagal memuat video untuk "${queryTitle}". Film tidak ditemukan atau ID salah.`);
      }
    } catch {
      setErrorMsg('Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* ── Overlay Gelap Halaman (Time-Based Dim Effect) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000000',
          opacity: isDimmed ? 0.7 : 0,
          pointerEvents: 'none',
          transition: isDimmed ? 'opacity 1.8s ease-in-out' : 'opacity 0.5s ease-out',
          willChange: 'opacity',
          transform: 'translateZ(0)',
          zIndex: 40
        }}
      />

      {/* Konten Utama di Atas Overlay (zIndex: 50) */}
      <div style={{ position: 'relative', zIndex: 50 }}>
        <CinemaMarqueeHeader title={queryTitle} />
        <p style={{ color: '#aaa', marginBottom: '2rem', textAlign: 'center' }}>
          Klik tombol di bawah untuk memuat video player.
        </p>
        
        {!streamUrl && (
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <button 
              onClick={handleTontonFilm} 
              disabled={loading}
              style={{
                padding: '0.8rem 2rem',
                backgroundColor: '#e50914',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: loading ? 'not-allowed' : 'pointer',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? 'Memproses...' : '▶ Tonton Film'}
            </button>
          </div>
        )}

        {errorMsg && (
          <div style={{ padding: '1rem', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', marginBottom: '2rem' }}>
            <p style={{ color: '#ff8888', margin: 0 }}>{errorMsg}</p>
          </div>
        )}

        {streamUrl && (
          <>
            <CinemaFrame title={`PREMIUM THEATER: ${queryTitle}`}>
              <CurtainReveal 
                buttonText="Tonton Sekarang"
                onOpen={() => {
                  setPlayerState('playing');
                }}
              >
                <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '0', overflow: 'hidden' }}>
                  <iframe 
                    src={streamUrl} 
                    width="100%" 
                    height="100%" 
                    frameBorder="0" 
                    allowFullScreen 
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  />
                </div>
              </CurtainReveal>
            </CinemaFrame>

            {/* ── Cinema Status & Control Bar (Simulator untuk Tes Time-Based Dim) ── */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '1rem',
                flexWrap: 'wrap',
                marginTop: '1.2rem',
                padding: '0.7rem 1.2rem',
                background: 'rgba(15, 15, 15, 0.9)',
                border: '1px solid rgba(229, 9, 20, 0.4)',
                borderRadius: '50px',
                fontSize: '0.82rem',
                color: '#fff'
              }}
            >
              <span style={{ color: '#aaa' }}>
                Cinema Lighting Status: <strong style={{ color: isDimmed ? '#00e5ff' : '#ffaa00' }}>{isDimmed ? '🌙 DIMMED THEATER' : '☀️ BRIGHT (NORMAL)'}</strong>
              </span>
              <span style={{ opacity: 0.3 }}>|</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={() => setPlayerState('playing')}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    border: '1px solid #444',
                    background: playerState === 'playing' ? '#e50914' : '#222',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  ▶ Playing {playerState === 'playing' && '✓'}
                </button>
                <button
                  onClick={() => setPlayerState('paused')}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    border: '1px solid #444',
                    background: playerState === 'paused' ? '#e50914' : '#222',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  ⏸ Pause {playerState === 'paused' && '✓'}
                </button>
                <button
                  onClick={() => setPlayerState('ended')}
                  style={{
                    padding: '0.35rem 0.8rem',
                    borderRadius: '20px',
                    border: '1px solid #444',
                    background: playerState === 'ended' ? '#e50914' : '#222',
                    color: '#fff',
                    cursor: 'pointer',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}
                >
                  ⏹ Ended {playerState === 'ended' && '✓'}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}

export default function TestStreamingPage() {
  return (
    <div style={{ padding: '1.5rem', maxWidth: '1400px', margin: '3rem auto', color: '#fff', fontFamily: 'sans-serif' }}>
      <Suspense fallback={<div style={{ color: '#fff' }}>Memuat halaman...</div>}>
        <StreamingContent />
      </Suspense>
    </div>
  );
}
