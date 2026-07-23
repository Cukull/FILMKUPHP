'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

type HeroFilm = {
  id: string;
  title: string;
  synopsis: string | null;
  rating: number | null;
  genre: string | null;
  trailerVideoId: string;
};

type Props = {
  films: HeroFilm[];
};

const AUTOPLAY_DURATION = 12000; // 12s per slide
const MUTE_FADE_DELAY   = 1500;  // 1.5s inactivity → fade speaker icon

export default function HomeHero({ films }: Props) {
  const [index, setIndex]         = useState(0);
  const [isMuted, setIsMuted]     = useState(true);
  const [showMute, setShowMute]   = useState(false); // speaker visibility
  const [fading, setFading]       = useState(false); // crossfade between slides
  const [showPrev, setShowPrev]   = useState(false); // left hover-zone active
  const [showNext, setShowNext]   = useState(false); // right hover-zone active

  const muteTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroRef      = useRef<HTMLElement | null>(null);
  // ref ke iframe YouTube — untuk postMessage mute/unmute tanpa reload
  const iframeRef    = useRef<HTMLIFrameElement | null>(null);

  const total = films.length;
  const film  = films[index] ?? null;

  /* ── Auto-advance carousel ── */
  const scheduleNext = useCallback(() => {
    if (autoTimer.current) clearTimeout(autoTimer.current);
    if (total <= 1) return;
    autoTimer.current = setTimeout(() => {
      setIndex(prev => (prev + 1) % total);
    }, AUTOPLAY_DURATION);
  }, [total]);

  useEffect(() => {
    scheduleNext();
    return () => { if (autoTimer.current) clearTimeout(autoTimer.current); };
  }, [index, scheduleNext]);

  /* ── Cleanup ── */
  useEffect(() => () => {
    if (muteTimer.current) clearTimeout(muteTimer.current);
  }, []);

  /* ── Speaker fade on cursor inactivity ── */
  const handleMouseMove = useCallback(() => {
    setShowMute(true);
    if (muteTimer.current) clearTimeout(muteTimer.current);
    muteTimer.current = setTimeout(() => setShowMute(false), MUTE_FADE_DELAY);
  }, []);

  /* ── YouTube postMessage helper — toggle mute tanpa reload iframe ── */
  const postYT = useCallback((cmd: 'mute' | 'unMute') => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: cmd, args: [] }),
      '*'
    );
  }, []);

  /* ── Manual navigation ── */
  const goTo = (i: number) => {
    if (i === index) return;
    setFading(true);
    setTimeout(() => {
      setIndex(i);
      setFading(false);
    }, 280);
    scheduleNext();
  };

  const goPrev = () => goTo((index - 1 + total) % total);
  const goNext = () => goTo((index + 1) % total);

  if (!film) {
    return (
      <section className="home-hero" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
          <p>Belum ada film di Sorotan Layar Utama</p>
        </div>
      </section>
    );
  }

  // ⚠️  isMuted TIDAK masuk ke URL — URL statis per slide agar iframe tidak reload.
  //     Mute awal = 1 (muted). Toggle dilakukan via postMessage ke YouTube IFrame API.
  const embedUrl = `https://www.youtube.com/embed/${film.trailerVideoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${film.trailerVideoId}&modestbranding=1&enablejsapi=1`;

  return (
    <section
      ref={heroRef}
      className="home-hero"
      style={{
        position: 'relative',
        overflow: 'hidden',
        marginTop: '-72px',        /* pull up behind transparent navbar */
        minHeight: '100vh',        /* fill full viewport including navbar height */
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (muteTimer.current) clearTimeout(muteTimer.current);
        muteTimer.current = setTimeout(() => setShowMute(false), 600);
      }}
    >
      {/* ── YouTube iframe background ── */}
      <div style={{
        position: 'absolute',
        width: '100vw', height: '56.25vw',
        minHeight: '100vh', minWidth: '177.77vh',
        transform: 'translate(-50%, -50%)',
        top: '50%', left: '50%',
        zIndex: 0, pointerEvents: 'none',
        opacity: fading ? 0 : 1,
        transition: 'opacity 0.28s ease',
      }}>
        <iframe
          ref={iframeRef}
          key={`${film.id}-${index}`}
          src={embedUrl}
          style={{ width: '100%', height: '100%', border: 'none', transform: 'scale(1.2)' }}
          allow="autoplay; encrypted-media"
          title={film.title}
          // Saat iframe baru load (slide berganti), sync state mute ke iframe
          onLoad={() => {
            // Iframe selalu mulai muted=1; kalau user sudah unmute sebelumnya,
            // kirim perintah unMute setelah iframe siap.
            if (!isMuted) {
              // Beri jeda singkat agar YouTube player API benar-benar ready
              setTimeout(() => postYT('unMute'), 800);
            }
          }}
        />
      </div>

      {/* ── Gradient overlay ── */}
      <div className="home-hero-overlay" style={{
        zIndex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'linear-gradient(to right, var(--bg-base) 0%, rgba(8,8,16,0.75) 40%, rgba(8,8,16,0.15) 100%), linear-gradient(to top, var(--bg-base) 0%, transparent 40%)',
      }} />

      {/* ── Mute/Unmute button ── fades out on inactivity */}
      <button
        onClick={() => {
          // Toggle icon state (hanya untuk SVG icon — TIDAK mengubah src iframe)
          setIsMuted(prev => {
            const next = !prev;
            // Kirim perintah ke YouTube IFrame API via postMessage
            postYT(next ? 'mute' : 'unMute');
            return next;
          });
        }}
        aria-label={isMuted ? 'Unmute trailer' : 'Mute trailer'}
        style={{
          position: 'absolute',
          bottom: total > 1 ? '13%' : '15%',
          right: '5%',
          zIndex: 10,
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.25)',
          borderRadius: '50%',
          width: '48px', height: '48px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer',
          color: 'white',
          backdropFilter: 'blur(8px)',
          opacity: showMute ? 1 : 0,
          transition: 'opacity 0.6s ease, background 0.2s ease',
          pointerEvents: showMute ? 'auto' : 'none',
        }}
        onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.2)')}
        onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.5)')}
      >
        {isMuted ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <line x1="23" y1="9" x2="17" y2="15" /><line x1="17" y1="9" x2="23" y2="15" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
          </svg>
        )}
      </button>

      {/* ── Carousel Prev / Next arrows ── only if multiple films */}
      {total > 1 && (
        <>
          {/* ── Left hover-zone + Prev button ── */}
          <div
            onMouseEnter={() => setShowPrev(true)}
            onMouseLeave={() => setShowPrev(false)}
            style={{
              position: 'absolute',
              inset: '0',
              right: 'auto',
              width: '17%',
              zIndex: 9,
              // no background — fully invisible trigger zone
            }}
          >
            <button
              onClick={goPrev}
              aria-label="Film sebelumnya"
              className="hero-carousel-arrow"
              style={{
                position: 'absolute',
                left: '1.25rem',
                top: '50%',
                transform: `translateY(-50%) translateX(${showPrev ? '0px' : '-14px'})`,
                zIndex: 10,
                background: 'rgba(0,0,0,0.50)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '50%',
                width: '48px', height: '48px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
                backdropFilter: 'blur(8px)',
                fontSize: '1.4rem',
                opacity: showPrev ? 1 : 0,
                pointerEvents: showPrev ? 'auto' : 'none',
                transition: 'opacity 0.25s ease, transform 0.25s ease, background 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,9,20,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.50)'; }}
            >
              ‹
            </button>
          </div>

          {/* ── Right hover-zone + Next button ── */}
          <div
            onMouseEnter={() => setShowNext(true)}
            onMouseLeave={() => setShowNext(false)}
            style={{
              position: 'absolute',
              inset: '0',
              left: 'auto',
              width: '17%',
              zIndex: 9,
            }}
          >
            <button
              onClick={goNext}
              aria-label="Film berikutnya"
              className="hero-carousel-arrow"
              style={{
                position: 'absolute',
                right: '1.25rem',
                top: '50%',
                transform: `translateY(-50%) translateX(${showNext ? '0px' : '14px'})`,
                zIndex: 10,
                background: 'rgba(0,0,0,0.50)',
                border: '1px solid rgba(255,255,255,0.18)',
                borderRadius: '50%',
                width: '48px', height: '48px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
                backdropFilter: 'blur(8px)',
                fontSize: '1.4rem',
                opacity: showNext ? 1 : 0,
                pointerEvents: showNext ? 'auto' : 'none',
                transition: 'opacity 0.25s ease, transform 0.25s ease, background 0.2s ease',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(229,9,20,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.50)'; }}
            >
              ›
            </button>
          </div>

        </>
      )}

      {/* ── Hero content ── */}
      <div
        className="home-hero-content"
        style={{
          zIndex: 2, position: 'relative',
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(10px)' : 'translateY(0)',
          transition: 'opacity 0.28s ease, transform 0.28s ease',
        }}
      >
        {/* Badges */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
          {film.rating && <span className="badge badge-gold">⭐ {film.rating} / 10</span>}
          {film.genre && <span className="badge badge-accent">{film.genre.split(',')[0].trim()}</span>}
          <span className="badge badge-muted">HD</span>
        </div>

        <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 900, lineHeight: 1.1, marginBottom: '1rem', color: '#fff', letterSpacing: '-0.02em' }}>
          {film.title}
        </h1>

        <p style={{ color: 'var(--text-secondary)', lineHeight: 1.7, fontSize: '0.95rem', marginBottom: '2rem', maxWidth: '520px' }}>
          {film.synopsis ? (film.synopsis.length > 180 ? film.synopsis.slice(0, 180) + '…' : film.synopsis) : ''}
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Link
            href={`/film/${film.id}`}
            className="btn-primary"
            style={{ fontSize: '0.95rem', padding: '0.75rem 1.75rem', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
          >
            🎬 Pilih Sesi Tayang
          </Link>
          <Link
            href={`/film/${film.id}`}
            className="btn-outline"
            style={{ padding: '0.75rem 1.75rem', fontSize: '0.95rem', textDecoration: 'none' }}
          >
            ▶ Detail Film
          </Link>
        </div>

        {/* ── Dot indicators ── */}
        {total > 1 && (
          <div style={{ display: 'flex', gap: '8px', marginTop: '2rem', alignItems: 'center' }}>
            {films.map((f, i) => (
              <button
                key={f.id}
                onClick={() => goTo(i)}
                aria-label={`Slide ${i + 1}`}
                style={{
                  width: i === index ? '28px' : '8px',
                  height: '8px',
                  borderRadius: '4px',
                  background: i === index ? '#e50914' : 'rgba(255,255,255,0.3)',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0,
                  transition: 'all 0.35s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: i === index ? '0 0 10px rgba(229,9,20,0.6)' : 'none',
                }}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
