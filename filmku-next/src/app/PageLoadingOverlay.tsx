'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { createPortal } from 'react-dom';

/**
 * Global page navigation loading overlay.
 * - Red NProgress-style progress bar at the very top
 * - Subtle dark overlay + blur while navigating
 * - Detects navigation start via link clicks
 * - Detects navigation complete via pathname change
 */
export default function PageLoadingOverlay() {
  const pathname = usePathname();
  const [progress, setProgress]   = useState(0);
  const [visible, setVisible]     = useState(false);
  const [mounted, setMounted]     = useState(false);

  const prevPath      = useRef(pathname);
  const ticker        = useRef<ReturnType<typeof setInterval> | null>(null);
  const hideTimer     = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { setMounted(true); }, []);

  /* ── Increment progress bar slowly up to 82% ── */
  const startProgress = () => {
    setVisible(true);
    setProgress(12);

    if (ticker.current) clearInterval(ticker.current);
    let p = 12;
    ticker.current = setInterval(() => {
      p += Math.random() * 8 + 3;
      if (p >= 82) { clearInterval(ticker.current!); p = 82; }
      setProgress(p);
    }, 180);
  };

  /* ── Complete & hide ── */
  const finishProgress = () => {
    if (ticker.current) clearInterval(ticker.current);
    setProgress(100);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => {
      setVisible(false);
      setProgress(0);
    }, 500);
  };

  /* ── Detect link clicks to trigger loading start ── */
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const anchor = (e.target as HTMLElement).closest('a[href]') as HTMLAnchorElement | null;
      if (!anchor || e.ctrlKey || e.metaKey || e.shiftKey) return;

      try {
        const url = new URL(anchor.href, window.location.href);
        if (url.origin === window.location.origin && url.pathname !== window.location.pathname) {
          startProgress();
        }
      } catch { /* external / relative edge case */ }
    };

    document.addEventListener('click', onClick);
    return () => {
      document.removeEventListener('click', onClick);
      if (ticker.current) clearInterval(ticker.current);
      if (hideTimer.current) clearTimeout(hideTimer.current);
    };
  }, []);

  /* ── Detect pathname change = navigation complete ── */
  useEffect(() => {
    if (prevPath.current !== pathname) {
      prevPath.current = pathname;
      finishProgress();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (!mounted || !visible) return null;

  return createPortal(
    <>
      {/* ── Red progress bar ── */}
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, height: '3px',
        zIndex: 99990,
        background: 'rgba(0,0,0,0.25)',
        pointerEvents: 'none',
      }}>
        <div style={{
          height: '100%',
          width: `${progress}%`,
          background: 'linear-gradient(90deg, #c8000e, #e50914, #ff3333)',
          boxShadow: '0 0 8px rgba(229,9,20,0.9), 0 0 20px rgba(229,9,20,0.5)',
          transition: `width ${progress === 100 ? '0.25s' : '0.18s'} ease`,
          borderRadius: '0 2px 2px 0',
        }} />
        {/* Glow tip */}
        <div style={{
          position: 'absolute',
          top: '-2px',
          left: `calc(${progress}% - 6px)`,
          width: '12px', height: '7px',
          background: 'rgba(229,9,20,0.95)',
          filter: 'blur(4px)',
          borderRadius: '50%',
          transition: `left ${progress === 100 ? '0.25s' : '0.18s'} ease`,
          opacity: progress > 5 && progress < 100 ? 1 : 0,
        }} />
      </div>

      {/* ── Subtle page dim ── */}
      <div style={{
        position: 'fixed', inset: 0,
        zIndex: 99988,
        background: 'rgba(7,7,15,0.18)',
        backdropFilter: 'blur(0.5px)',
        pointerEvents: 'none',
        opacity: progress < 95 ? 1 : 0,
        transition: 'opacity 0.4s ease',
      }} />
    </>,
    document.body
  );
}
