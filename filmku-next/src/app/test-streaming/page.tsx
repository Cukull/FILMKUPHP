'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getStreamingDetails, getMovieStreamUrl, StreamDetails, StreamServer, SeasonInfo } from './action';
import CurtainReveal from '@/components/ui/CurtainReveal';
import CinemaFrame from '@/components/ui/CinemaFrame';
import CinemaMarqueeHeader from '@/components/ui/CinemaMarqueeHeader';
import SpecularButton from '@/components/ui/SpecularButton';
import AdsterraBanner from '@/components/ads/AdsterraBanner';

type PlayerState = 'idle' | 'playing' | 'paused' | 'ended';

function StreamingContent() {
  const searchParams = useSearchParams();
  const initialQueryTitle = searchParams.get('title') || 'Squid Game'; // Judul asli (TMDB search title)
  const initialDisplayTitle = searchParams.get('displayTitle') || initialQueryTitle; // Judul tampilan (Indonesia)
  const queryId = searchParams.get('id') || '';

  // State judul film/drama aktif — activeTitle = judul asli untuk TMDB, displayTitle = judul tampilan
  const [activeTitle, setActiveTitle] = useState(initialQueryTitle);
  const [displayTitle, setDisplayTitle] = useState(initialDisplayTitle);
  const movieKey = queryId ? `${activeTitle}_${queryId}` : activeTitle;

  // State data streaming
  const [streamDetails, setStreamDetails] = useState<StreamDetails | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // State pilihan Server, Season, dan Episode
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState(1);

  // State untuk mengontrol status pemutaran film & efek meredup (Time-Based Dim)
  const [playerState, setPlayerState] = useState<PlayerState>('idle');
  const [isDimmed, setIsDimmed] = useState(false);
  const hasTriggeredFirstPlayRef = useRef(false);

  // 1. useEffect: Time-Based Dim dengan delay 3 detik (trigger pertama kali)
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;

    if (playerState === 'playing') {
      if (!hasTriggeredFirstPlayRef.current) {
        timeoutId = setTimeout(() => {
          hasTriggeredFirstPlayRef.current = true;
          setIsDimmed(true);
        }, 3000);
      } else {
        setIsDimmed(true);
      }
    } else if (playerState === 'paused' || playerState === 'ended' || playerState === 'idle') {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(() => setIsDimmed(false), 0);
    }

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [playerState]);

  // 2. useEffect: Animasi Navbar opacity (0.35 saat dim) & Hover effect
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

  // 3. useEffect: Listen ke pesan HTML5 dari iframe eksternal
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

  useEffect(() => {
    if (activeTitle) {
      loadMedia(activeTitle, undefined, 1, 1);
    }
  }, [activeTitle]);

  const loadMedia = async (
    titleToSearch: string,
    type?: 'movie' | 'tv',
    season: number = 1,
    episode: number = 1
  ) => {
    setLoading(true);
    setErrorMsg('');
    setPlayerState('idle');
    hasTriggeredFirstPlayRef.current = false;

    try {
      const details = await getStreamingDetails(titleToSearch, type, season, episode);
      if (details) {
        setStreamDetails(details);
        setSelectedSeason(details.currentSeason);
        setSelectedEpisode(details.currentEpisode);
        setSelectedServerIndex(0); // Selalu reset ke Server 1 saat ganti judul
      } else {
        setStreamDetails(null);
        setErrorMsg(`Gagal memuat video untuk "${titleToSearch}". Judul tidak ditemukan di database TMDB.`);
      }
    } catch (err) {
      setStreamDetails(null);
      setErrorMsg('Terjadi kesalahan saat memuat server pemutar video.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchInput.trim()) return;
    // Pencarian manual: activeTitle = displayTitle = apa yang diketik user
    setActiveTitle(searchInput.trim());
    setDisplayTitle(searchInput.trim());
  };

  const handleEpisodeChange = (newSeason: number, newEpisode: number) => {
    setSelectedSeason(newSeason);
    setSelectedEpisode(newEpisode);
    if (streamDetails) {
      loadMedia(activeTitle, streamDetails.mediaType, newSeason, newEpisode);
    }
  };

  const currentServer = streamDetails?.servers[selectedServerIndex];
  const activeUrl = currentServer?.url || null;

  // Cek jumlah episode pada season yang sedang aktif
  const activeSeasonInfo = streamDetails?.seasons?.find(
    (s) => s.season_number === selectedSeason
  ) || streamDetails?.seasons?.[0];
  const totalEpisodes = activeSeasonInfo?.episode_count || 16;

  return (
    <>
      {/* ── Overlay Gelap Halaman (Time-Based Dim Effect) ── */}
      <div
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: '#000000',
          opacity: isDimmed ? 0.75 : 0,
          pointerEvents: 'none',
          transition: isDimmed ? 'opacity 1.8s ease-in-out' : 'opacity 0.5s ease-out',
          willChange: 'opacity',
          transform: 'translateZ(0)',
          zIndex: 40,
        }}
      />

      {/* Konten Utama di Atas Overlay (zIndex: 50) */}
      <div
        style={{
          position: 'relative',
          zIndex: 50,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <CinemaMarqueeHeader
          title={
            streamDetails
              ? `${displayTitle} ${
                  streamDetails.mediaType === 'tv'
                    ? `(S${selectedSeason} Ep ${selectedEpisode})`
                    : ''
                }`
              : displayTitle
          }
        />

        {/* ── NOTIFIKASI ERROR / LOADING ── */}
        {errorMsg && (
          <div
            style={{
              padding: '1rem 1.5rem',
              background: 'rgba(229, 9, 20, 0.15)',
              border: '1px solid rgba(229, 9, 20, 0.4)',
              borderRadius: '12px',
              marginBottom: '2rem',
              textAlign: 'center',
            }}
          >
            <p style={{ color: '#ff8888', margin: 0, fontWeight: 600 }}>{errorMsg}</p>
          </div>
        )}

        {/* ── PEMILIH MULTI-SERVER (SERVER 1 - 6) ── */}
        {streamDetails && streamDetails.servers.length > 0 && (
          <div
            style={{
              width: '100%',
              maxWidth: '1000px',
              marginBottom: '1rem',
              background: 'rgba(12, 12, 15, 0.9)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '14px',
              padding: '1rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '0.75rem',
                flexWrap: 'wrap',
                gap: '0.5rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#fff' }}>
                  🌐 Pilih Server Pemutar:
                </span>
                <span style={{ fontSize: '0.78rem', color: '#888' }}>
                  (Jika server 1 kosong atau macet, klik server lainnya)
                </span>
              </div>
              <span style={{ fontSize: '0.78rem', color: '#00e5ff', fontWeight: 600 }}>
                ✓ {streamDetails.mediaType === 'tv' ? '📺 TV Series / Drama' : '🎬 Movie'} • TMDB ID: {streamDetails.tmdbId}
              </span>
            </div>

            <div
              className="compact-scroll-mobile"
              style={{
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                whiteSpace: 'nowrap',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {streamDetails.servers.map((srv, idx) => {
                const isSelected = selectedServerIndex === idx;
                return (
                  <button
                    key={srv.id}
                    type="button"
                    onClick={() => setSelectedServerIndex(idx)}
                    style={{
                      padding: '0.55rem 1rem',
                      borderRadius: '10px',
                      border: '1px solid',
                      borderColor: isSelected ? '#e50914' : 'rgba(255,255,255,0.15)',
                      background: isSelected
                        ? 'linear-gradient(135deg, #e50914, #99050d)'
                        : 'rgba(255,255,255,0.05)',
                      color: isSelected ? '#ffffff' : '#cccccc',
                      fontSize: '0.83rem',
                      fontWeight: isSelected ? 700 : 500,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.4rem',
                      boxShadow: isSelected ? '0 0 16px rgba(229, 9, 20, 0.4)' : 'none',
                      transition: 'all 0.25s ease',
                    }}
                  >
                    <span>{idx === 0 ? '🚀' : idx === 1 ? '⚡' : '📡'}</span>
                    <span>{srv.label}</span>
                    {srv.badge && (
                      <span
                        style={{
                          background: srv.badge.includes('Dub Indo')
                            ? 'linear-gradient(135deg, #f5c518, #d4af37)'
                            : isSelected
                            ? 'rgba(0,0,0,0.3)'
                            : 'rgba(255,255,255,0.1)',
                          color: srv.badge.includes('Dub Indo') ? '#000000' : 'inherit',
                          padding: '0.15rem 0.5rem',
                          borderRadius: '6px',
                          fontSize: '0.68rem',
                          fontWeight: 'bold',
                          boxShadow: srv.badge.includes('Dub Indo')
                            ? '0 0 8px rgba(245, 197, 24, 0.6)'
                            : 'none',
                        }}
                      >
                        {srv.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ── PEMILIH SEASON & EPISODE (KHUSUS TV SERIES / DRAMA KOREA / DRAMA CHINA) ── */}
        {streamDetails && streamDetails.mediaType === 'tv' && (
          <div
            style={{
              width: '100%',
              maxWidth: '1000px',
              marginBottom: '1.25rem',
              background: 'rgba(18, 18, 22, 0.95)',
              border: '1px solid rgba(229, 9, 20, 0.3)',
              borderRadius: '14px',
              padding: '1.25rem',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
                marginBottom: '1rem',
              }}
            >
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700, color: '#fff', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <span>📺</span>
                <span>Pilih Episode — {streamDetails.title}</span>
              </h3>

              {/* Pilihan Season */}
              {streamDetails.seasons && streamDetails.seasons.length > 1 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '0.8rem', color: '#888' }}>Season:</span>
                  <select
                    value={selectedSeason}
                    onChange={(e) => handleEpisodeChange(Number(e.target.value), 1)}
                    style={{
                      background: '#111',
                      color: '#fff',
                      border: '1px solid rgba(255,255,255,0.2)',
                      borderRadius: '8px',
                      padding: '0.4rem 0.8rem',
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                    }}
                  >
                    {streamDetails.seasons.map((s) => (
                      <option key={s.season_number} value={s.season_number}>
                        {s.name} ({s.episode_count} Ep)
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div
              className="compact-scroll-mobile"
              style={{
                display: 'flex',
                gap: '0.5rem',
                overflowX: 'auto',
                paddingBottom: '0.5rem',
                whiteSpace: 'nowrap',
                WebkitOverflowScrolling: 'touch',
              }}
            >
              {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map((epNum) => {
                const isCurrentEp = selectedEpisode === epNum;
                return (
                  <button
                    key={epNum}
                    type="button"
                    onClick={() => handleEpisodeChange(selectedSeason, epNum)}
                    style={{
                      padding: '0.5rem 0.2rem',
                      borderRadius: '8px',
                      border: '1px solid',
                      borderColor: isCurrentEp ? '#e50914' : 'rgba(255,255,255,0.15)',
                      background: isCurrentEp ? '#e50914' : 'rgba(255,255,255,0.06)',
                      color: '#fff',
                      fontSize: '0.83rem',
                      fontWeight: isCurrentEp ? 'bold' : 'normal',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      textAlign: 'center',
                    }}
                  >
                    Ep {epNum}
                  </button>
                );
              })}
            </div>

            {/* Tombol Navigasi Cepat Episode Prev & Next */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: '1rem',
                paddingTop: '0.75rem',
                borderTop: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <button
                type="button"
                disabled={selectedEpisode <= 1}
                onClick={() => handleEpisodeChange(selectedSeason, selectedEpisode - 1)}
                style={{
                  background: 'rgba(255,255,255,0.1)',
                  color: selectedEpisode <= 1 ? '#555' : '#fff',
                  border: '1px solid rgba(255,255,255,0.15)',
                  borderRadius: '8px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  cursor: selectedEpisode <= 1 ? 'not-allowed' : 'pointer',
                }}
              >
                ◀ Episode Sebelumnya
              </button>

              <span style={{ fontSize: '0.85rem', color: '#aaa', display: 'flex', alignItems: 'center' }}>
                Sedang Memutar: <strong style={{ color: '#fff', marginLeft: '0.3rem' }}>S{selectedSeason} • Ep {selectedEpisode}</strong>
              </span>

              <button
                type="button"
                disabled={selectedEpisode >= totalEpisodes}
                onClick={() => handleEpisodeChange(selectedSeason, selectedEpisode + 1)}
                style={{
                  background: 'linear-gradient(135deg, #e50914, #b20710)',
                  color: selectedEpisode >= totalEpisodes ? '#bbb' : '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.45rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 'bold',
                  cursor: selectedEpisode >= totalEpisodes ? 'not-allowed' : 'pointer',
                }}
              >
                Episode Selanjutnya ▶
              </button>
            </div>
          </div>
        )}

        {/* ── CINEMA PLAYER / THEATER FRAME ── */}
        {!activeUrl && !loading && (
          <div style={{ marginBottom: '2rem', textAlign: 'center' }}>
            <SpecularButton
              size="md"
              radius={25}
              tint="#e50914"
              tintOpacity={0.88}
              blur={6}
              textColor="#ffffff"
              lineColor="#ff8088"
              baseColor="#6d0000"
              intensity={1.2}
              shineSize={14}
              shineFade={40}
              thickness={1.5}
              speed={0.35}
              followMouse={true}
              proximity={250}
              autoAnimate={true}
              disabled={loading}
              onClick={() => loadMedia(activeTitle, undefined, selectedSeason, selectedEpisode)}
            >
              <span>{loading ? 'Memuat Teater...' : 'Tonton Sekarang'}</span>
            </SpecularButton>
          </div>
        )}

        {activeUrl && (
          <>
            <CinemaFrame
              title={`PREMIUM THEATER: ${displayTitle} ${
                streamDetails?.mediaType === 'tv' ? `(S${selectedSeason} Ep ${selectedEpisode})` : ''
              }`}
            >
              <CurtainReveal
                buttonText="Tonton Sekarang"
                movieKey={`${movieKey}_srv_${selectedServerIndex}_s${selectedSeason}_e${selectedEpisode}`}
                onOpen={() => {
                  setPlayerState('playing');
                }}
              >
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/9',
                    background: '#000',
                    borderRadius: '0',
                    overflow: 'hidden',
                  }}
                >
                  <iframe
                    key={`${activeUrl}_srv_${selectedServerIndex}_s${selectedSeason}_e${selectedEpisode}`}
                    src={activeUrl}
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    allowFullScreen
                    style={{ position: 'absolute', top: 0, left: 0 }}
                  />
                </div>
              </CurtainReveal>
            </CinemaFrame>

            {/* ── Cinema Status & Control Bar ── */}
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
                color: '#fff',
              }}
            >
              <span style={{ color: '#aaa' }}>
                Cinema Lighting Status:{' '}
                <strong style={{ color: isDimmed ? '#00e5ff' : '#ffaa00' }}>
                  {isDimmed ? '🌙 DIMMED THEATER' : '☀️ BRIGHT (NORMAL)'}
                </strong>
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
                    fontWeight: 'bold',
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
                    fontWeight: 'bold',
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
                    fontWeight: 'bold',
                  }}
                >
                  ⏹ Ended {playerState === 'ended' && '✓'}
                </button>
              </div>
            </div>
            <AdsterraBanner />
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
