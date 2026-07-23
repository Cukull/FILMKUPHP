'use client';

/**
 * PageTransition — GSAP FILMKU Text Reveal
 * ─────────────────────────────────────────
 * Setiap perpindahan halaman (forward & back) memunculkan overlay
 * fullscreen dengan text "FILMKU" glow merah, mirip versi PHP.
 *
 * Sequence (~1.3 detik total):
 *  0.00s — overlay black fade in (0.2s)
 *  0.18s — "FILMKU" scale 0.88→1, opacity 0→1 + glow pulse (0.45s)
 *  0.55s — hold (0.3s) — konten baru load di background
 *  0.85s — "FILMKU" fade out scale 1→1.08 (0.2s)
 *  0.95s — overlay fade out (0.3s)
 *  1.25s — selesai, konten baru terlihat
 *
 * Koordinasi dengan SmoothScroll:
 * - Saat overlay muncul → lenis scroll di-pause via CSS pointer-events
 * - Setelah selesai → dispatch 'page-transition-complete' agar ScrollTrigger refresh
 */

import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export const PAGE_TRANSITION_DURATION_MS = 1300;

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname        = usePathname();
  const prevPathname    = useRef<string>(pathname);
  const overlayRef      = useRef<HTMLDivElement>(null);
  const textRef         = useRef<HTMLDivElement>(null);
  const tlRef           = useRef<gsap.core.Timeline | null>(null);
  const [displayedChildren, setDisplayedChildren] = useState(children);
  const pendingChildren = useRef(children);

  // Simpan children terbaru
  useEffect(() => { pendingChildren.current = children; }, [children]);

  useEffect(() => {
    // Jangan jalankan di render pertama (tidak ada "perpindahan")
    if (pathname === prevPathname.current) return;
    prevPathname.current = pathname;

    const overlay = overlayRef.current;
    const text    = textRef.current;
    if (!overlay || !text) return;

    // Kill timeline sebelumnya jika masih jalan
    if (tlRef.current) tlRef.current.kill();

    // Reset awal
    gsap.set(overlay, { display: 'flex', opacity: 0, pointerEvents: 'all' });
    gsap.set(text,    { scale: 0.88, opacity: 0 });

    const tl = gsap.timeline({
      onComplete: () => {
        // Sembunyikan overlay, reset pointer-events
        gsap.set(overlay, { display: 'none', pointerEvents: 'none' });
        // Refresh ScrollTrigger agar animasi scroll halaman baru berjalan benar
        window.dispatchEvent(new CustomEvent('page-transition-complete'));
        // Scroll ke atas
        window.scrollTo({ top: 0 });
      },
    });
    tlRef.current = tl;

    tl
      // 1. Overlay fade in (0.2s)
      .to(overlay, { opacity: 1, duration: 0.2, ease: 'power2.in' })
      // 2. Swap konten halaman di bawah overlay (tidak terlihat user)
      .call(() => { setDisplayedChildren(pendingChildren.current); })
      // 3. "FILMKU" muncul — scale + opacity + glow pulse
      .to(text, {
        scale: 1,
        opacity: 1,
        duration: 0.4,
        ease: 'back.out(1.4)',
      }, '+=0.02')
      // 4. Glow pulse sedikit (breathing effect)
      .to(text, {
        textShadow: [
          '0 0 30px rgba(229,9,20,1), 0 0 60px rgba(229,9,20,0.7), 0 0 120px rgba(229,9,20,0.4)',
          '0 0 20px rgba(229,9,20,0.8), 0 0 40px rgba(229,9,20,0.5), 0 0 80px rgba(229,9,20,0.2)',
        ].join(''),
        duration: 0.3,
        ease: 'power1.inOut',
        yoyo: true,
        repeat: 1,
      }, '<')
      // 5. Hold sebentar (konten baru loading di background)
      .to({}, { duration: 0.28 })
      // 6. "FILMKU" fade out + sedikit membesar
      .to(text, { scale: 1.08, opacity: 0, duration: 0.22, ease: 'power2.in' })
      // 7. Overlay fade out
      .to(overlay, { opacity: 0, duration: 0.28, ease: 'power2.out' });

  }, [pathname]);

  return (
    <>
      {/* ── Fullscreen overlay ─────────────────────────────────── */}
      <div
        ref={overlayRef}
        style={{
          position: 'fixed',
          inset: 0,
          background: '#07070f',         // sama persis dengan SplashScreen
          zIndex: 9000,
          display: 'none',              // hidden by default, GSAP set display:flex
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'none',
          flexDirection: 'column',
          gap: '0.5rem',
        }}
        aria-hidden="true"
      >
        {/* Ambient glow background */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, rgba(229,9,20,0.18) 0%, transparent 65%)',
          pointerEvents: 'none',
        }} />

        {/* "FILMKU" text */}
        <div
          ref={textRef}
          style={{
            fontSize: 'clamp(3rem, 8vw, 5rem)',
            fontWeight: 900,
            color: '#e50914',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-display, "Bricolage Grotesque", Inter, sans-serif)',
            textShadow: [
              '0 0 20px rgba(229,9,20,0.9)',
              '0 0 40px rgba(229,9,20,0.6)',
              '0 0 80px rgba(229,9,20,0.3)',
              '0 0 120px rgba(229,9,20,0.15)',
            ].join(', '),
            position: 'relative',
            userSelect: 'none',
          }}
        >
          FILMKU
        </div>

        {/* Garis bawah merah tipis */}
        <div style={{
          width: '3rem',
          height: '2px',
          background: 'linear-gradient(to right, transparent, rgba(229,9,20,0.8), transparent)',
          borderRadius: '2px',
          marginTop: '0.25rem',
        }} />
      </div>

      {/* ── Konten halaman (tetap di-render, tidak di-unmount) ─ */}
      <div style={{ width: '100%', minHeight: '100vh' }}>
        {displayedChildren}
      </div>
    </>
  );
}
