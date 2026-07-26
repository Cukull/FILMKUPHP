'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import ElasticSlider from '@/components/ui/ElasticSlider';
import WatchMovieButton from '@/components/WatchMovieButton';

type HeroFilm = {
  id: string;
  title: string;
  synopsis: string | null;
  rating: number | null;
  genre: string | null;
  posterUrl?: string | null;
  backdropUrl?: string | null;
  trailerVideoId: string;
};

type Props = {
  films: HeroFilm[];
};

const AUTOPLAY_DURATION = 12000; // 12s per slide
const MUTE_FADE_DELAY   = 3000;  // 3s inactivity → fade volume slider

export default function HomeHero({ films }: Props) {
  const [index, setIndex]         = useState(0);
  const [isMuted, setIsMuted]     = useState(true);
  const [volume, setVolume]       = useState(0);     // 0-100 volume level for ElasticSlider
  const [showMute, setShowMute]   = useState(false); // speaker/slider visibility
  const [fading, setFading]       = useState(false); // crossfade between slides
  const [showPrev, setShowPrev]   = useState(false); // left hover-zone active
  const [showNext, setShowNext]   = useState(false); // right hover-zone active
  const [isMobile, setIsMobile]   = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const muteTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimer    = useRef<ReturnType<typeof setTimeout> | null>(null);
  const heroRef      = useRef<HTMLElement | null>(null);
  // ref ke iframe YouTube — untuk postMessage mute/unmute tanpa reload
  const iframeRef    = useRef<HTMLIFrameElement | null>(null);
  const touchStartX  = useRef<number | null>(null);

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

  /* ── YouTube postMessage helper ── */
  const postYT = useCallback((cmd: string, args: any[] = []) => {
    iframeRef.current?.contentWindow?.postMessage(
      JSON.stringify({ event: 'command', func: cmd, args }),
      '*'
    );
  }, []);

  const handleVolumeChange = useCallback((newVol: number) => {
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
  }, [isMuted, postYT]);

  /* ── Pause on scroll out of viewport ── */
  useEffect(() => {
    if (!heroRef.current) return;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting) {
        postYT('playVideo');
      } else {
        postYT('pauseVideo');
      }
    }, { threshold: 0.1 });
    
    observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, [postYT]);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(diff) > 45) {
      if (diff > 0) goPrev();
      else goNext();
    }
    touchStartX.current = null;
  };

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
        clipPath: 'inset(0 0 0 0)',
        contain: 'paint',
        marginTop: 0,
        minHeight: '100vh',
        width: '100%',
        maxWidth: '100%',
        boxSizing: 'border-box',
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => {
        if (muteTimer.current) clearTimeout(muteTimer.current);
        muteTimer.current = setTimeout(() => setShowMute(false), 600);
      }}
    >
      {/* ── Background: Poster/Backdrop Image on Mobile, YouTube iframe on Desktop ── */}
      {isMobile ? (
        <div style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          pointerEvents: 'none',
          opacity: fading ? 0 : 1,
          transition: 'opacity 0.28s ease',
        }}>
          <img
            key={`${film.id}-${index}-img`}
            src={film.backdropUrl || film.posterUrl || '/placeholder.jpg'}
            alt={film.title}
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
          width: '100%', height: '56.25vw',
          minHeight: '100vh', minWidth: '100%',
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
      )}

      {/* ── Gradient overlay: gelap hanya di sekitar judul/deskripsi (kiri bawah) ── */}
      <div className="home-hero-overlay" style={{
        zIndex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
        background: 'radial-gradient(circle at 15% 85%, rgba(8,8,16,0.9) 0%, rgba(8,8,16,0.5) 30%, transparent 60%), linear-gradient(to top, rgba(8,8,16,0.7) 0%, transparent 15%)',
        pointerEvents: 'none',
      }} />

      {/* ── ElasticSlider Volume Control (0-100) ── */}
      <div
        className="filmku-volume-pill"
        style={{
          position: 'absolute',
          bottom: total > 1 ? '13%' : '15%',
          right: '5%',
          zIndex: 25,
          opacity: showMute ? 1 : 0,
          transition: 'opacity 0.6s ease, transform 0.6s ease',
          transform: showMute ? 'translateY(0)' : 'translateY(10px)',
          pointerEvents: showMute ? 'auto' : 'none',
        }}
        onMouseEnter={() => {
          setShowMute(true);
          if (muteTimer.current) clearTimeout(muteTimer.current);
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

      {/* ── Vignette tepi kiri & kanan — selalu terlihat, pointer-events-none ── */}
      {/* Tipis saja (8%) untuk kontras arrow putih */}
      <div style={{
        position: 'absolute', inset: '0', left: 0,
        width: '8%',
        background: 'linear-gradient(to right, rgba(8,8,16,0.65) 0%, transparent 100%)',
        zIndex: 3, pointerEvents: 'none',
      }} />
      <div style={{
        position: 'absolute', inset: '0', right: 0, left: 'auto',
        width: '8%',
        background: 'linear-gradient(to left, rgba(8,8,16,0.65) 0%, transparent 100%)',
        zIndex: 3, pointerEvents: 'none',
      }} />

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
              width: '18%',
              zIndex: 10,
            }}
          >
            <button
              onClick={goPrev}
              aria-label="Film sebelumnya"
              className="hero-carousel-arrow"
              style={{
                position: 'absolute',
                left: '1.5rem',
                top: '50%',
                /* slide dari tepi: hidden → dalam */
                transform: `translateY(-50%) translateX(${showPrev ? '0px' : '-18px'})`,
                zIndex: 11,
                /* NO solid background — hanya drop-shadow dan blur halus */
                background: 'none',
                border: 'none',
                borderRadius: '50%',
                width: '52px', height: '52px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
                opacity: showPrev ? 1 : 0,
                pointerEvents: showPrev ? 'auto' : 'none',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
                padding: 0,
              }}
              onMouseEnter={e => {
                (e.currentTarget.querySelector('svg') as SVGElement | null)
                  ?.setAttribute('stroke', 'rgba(229,9,20,0.9)');
              }}
              onMouseLeave={e => {
                (e.currentTarget.querySelector('svg') as SVGElement | null)
                  ?.setAttribute('stroke', 'rgba(255,255,255,0.92)');
              }}
            >
              {/* SVG chevron kiri — stroke tipis, bukan filled */}
              <svg
                width="28" height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.92)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: 'block' }}
              >
                <polyline points="15 18 9 12 15 6" />
              </svg>
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
              width: '18%',
              zIndex: 10,
            }}
          >
            <button
              onClick={goNext}
              aria-label="Film berikutnya"
              className="hero-carousel-arrow"
              style={{
                position: 'absolute',
                right: '1.5rem',
                top: '50%',
                transform: `translateY(-50%) translateX(${showNext ? '0px' : '0px'})`,
                zIndex: 11,
                background: 'none',
                border: 'none',
                borderRadius: '50%',
                width: '52px', height: '52px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: 'white',
                filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.7))',
                opacity: showNext ? 1 : 0,
                pointerEvents: showNext ? 'auto' : 'none',
                transition: 'opacity 0.25s ease, transform 0.25s ease',
                padding: 0,
              }}
              onMouseEnter={e => {
                (e.currentTarget.querySelector('svg') as SVGElement | null)
                  ?.setAttribute('stroke', 'rgba(229,9,20,0.9)');
              }}
              onMouseLeave={e => {
                (e.currentTarget.querySelector('svg') as SVGElement | null)
                  ?.setAttribute('stroke', 'rgba(255,255,255,0.92)');
              }}
            >
              {/* SVG chevron kanan */}
              <svg
                width="28" height="28"
                viewBox="0 0 24 24"
                fill="none"
                stroke="rgba(255,255,255,0.92)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ display: 'block' }}
              >
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

        </>
      )}

      {/* ── Hero content ── */}
      <div
        className="home-hero-content"
        style={{
          zIndex: 20, position: 'relative',
          opacity: fading ? 0 : 1,
          transform: fading ? 'translateY(10px)' : 'translateY(0)',
          transition: 'opacity 0.28s ease, transform 0.28s ease',
        }}
      >
        {/* ── Judul film ── */}
        <h1 style={{
          fontSize: 'clamp(2rem, 4vw, 3rem)',      // lebih besar, proporsional
          fontWeight: 800,
          lineHeight: 1.15,
          marginBottom: '0.6rem',
          color: '#fff',
          letterSpacing: '-0.015em',
          maxWidth: '560px',
        }}>
          {film.title}
        </h1>

        {/* ── Baris atribut: Rating • Durasi • Badge usia • Genre ── */}
        {/* Semua kecil, sejajar horizontal, gap konsisten — mirip referensi PHP */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
          marginBottom: '0.875rem',
        }}>
          {/* ⭐ IMDb Rating */}
          {film.rating && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', fontWeight: 700, color: '#f5c518' }}>
              ⭐ {film.rating}
            </span>
          )}

          {/* Separator dot */}
          {film.rating && <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>●</span>}

          {/* Durasi — ambil dari synopsis placeholder, atau tampil "HD" */}
          <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
            HD
          </span>

          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>●</span>

          {/* Badge rating usia — pill kecil dengan border */}
          <span style={{
            fontSize: '0.8rem',
            fontWeight: 700,
            padding: '0.1rem 0.45rem',
            borderRadius: '0.3rem',
            border: '1px solid rgba(255,255,255,0.4)',
            color: 'rgba(255,255,255,0.85)',
            lineHeight: 1.5,
            letterSpacing: '0.02em',
          }}>
            13+
          </span>

          {/* Genre — ambil genre pertama */}
          {film.genre && (
            <>
              <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.7rem' }}>●</span>
              <span style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500 }}>
                {film.genre.split(',')[0].trim()}
              </span>
            </>
          )}
        </div>

        {/* ── Sinopsis — max 3 baris ── */}
        <p style={{
          color: 'rgba(255,255,255,0.65)',
          lineHeight: 1.65,
          fontSize: '0.875rem',
          marginBottom: '1.75rem',
          maxWidth: '500px',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}>
          {film.synopsis ?? ''}
        </p>

        {/* ── CTA Buttons ── */}
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <WatchMovieButton title={film.title} movieId={film.id} />
          <Link
            href={`/film/${film.id}`}
            className="btn-outline"
            style={{ padding: '0.65rem 1.5rem', fontSize: '0.9rem', textDecoration: 'none' }}
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
