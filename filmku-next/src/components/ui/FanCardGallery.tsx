'use client';

import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import BorderGlow from './BorderGlow';

export interface FanCardItem {
  image: string;
  title: string;
  description?: string;
  stepLabel?: string;  // e.g. "LANGKAH 1"
  showCTA?: boolean;   // show "Mulai Nonton" button on last card
}

interface FanCardGalleryProps {
  items: FanCardItem[];
  /** When true, the gallery loops infinitely */
  loop?: boolean;
  bend?: number;
  cardWidth?: number;
  cardHeight?: number;
  gap?: number;
  ease?: number;
}

export default function FanCardGallery({
  items,
  loop = false,
  bend = 3,
  cardWidth = 280,
  cardHeight = 420,
  gap = 24,
  ease = 0.08,
}: FanCardGalleryProps) {
  const step = cardWidth + gap;

  /* ── For looping: triple the items array and start in the middle set ── */
  const renderItems = loop ? [...items, ...items, ...items] : items;
  const loopOffset = loop ? items.length * step : 0;          // pixel offset to middle set
  const maxScroll = (renderItems.length - 1) * step;

  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>(0);
  const scrollCurrent = useRef(loopOffset);
  const scrollTarget = useRef(loopOffset);
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const dragStartTarget = useRef(0);
  const snapTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [activeIndex, setActiveIndex] = useState(
    loop ? items.length + Math.floor(items.length / 2) : Math.floor(items.length / 2)
  );

  /* ── Snap to nearest card ── */
  const snapToIndex = useCallback(
    (raw: number) => {
      let clamped = raw;

      if (loop) {
        // If we drifted into the first clone set, silently teleport to middle set
        if (raw < loopOffset - step * 0.5) {
          const jump = items.length * step;
          scrollCurrent.current += jump;
          scrollTarget.current += jump;
          clamped = scrollTarget.current;
        }
        // If we drifted into the last clone set
        if (raw > loopOffset + items.length * step - step * 0.5) {
          const jump = items.length * step;
          scrollCurrent.current -= jump;
          scrollTarget.current -= jump;
          clamped = scrollTarget.current;
        }
      } else {
        clamped = Math.max(0, Math.min(raw, maxScroll));
      }

      const idx = Math.round(clamped / step);
      scrollTarget.current = idx * step;
      setActiveIndex(idx);
    },
    [loop, loopOffset, items.length, maxScroll, step]
  );

  const scheduleSnap = useCallback(() => {
    if (snapTimer.current) clearTimeout(snapTimer.current);
    snapTimer.current = setTimeout(() => snapToIndex(scrollTarget.current), 150);
  }, [snapToIndex]);

  /* ── Navigation buttons — always clamp, never wrap ── */
  const goTo = useCallback(
    (idx: number) => {
      // Hard clamp: never go below 0 or above last real item
      const last = loop ? items.length * 2 - 1 : items.length - 1;
      const min = loop ? items.length : 0;
      const target = Math.max(min, Math.min(idx, last));
      scrollTarget.current = target * step;
      setActiveIndex(target);
    },
    [loop, items.length, step]
  );

  /* ── Init scroll position ── */
  useEffect(() => {
    // When looping: start at the middle set so card #1 is centred.
    // The first copy of items sits to the LEFT, giving us cards 5 & 6 there.
    const initScroll = loop ? items.length * step : 0;
    scrollTarget.current = initScroll;
    scrollCurrent.current = initScroll;
    setActiveIndex(loop ? items.length : 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // run once on mount

  /* ── RAF render loop ── */
  useEffect(() => {
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const tick = () => {
      scrollCurrent.current = lerp(scrollCurrent.current, scrollTarget.current, ease);

      const container = containerRef.current;
      if (!container) { rafRef.current = requestAnimationFrame(tick); return; }

      const containerW = container.clientWidth;
      const centerX = containerW / 2 - cardWidth / 2;

      const cards = container.querySelectorAll<HTMLElement>('.fan-card');
      cards.forEach((card, i) => {
        const rawX = i * step - scrollCurrent.current;
        const screenX = centerX + rawX;

        const norm        = rawX / (containerW * 0.5);
        const clampedNorm = Math.max(-2.2, Math.min(2.2, norm));
        const rotZ        = clampedNorm * bend * 9;
        const arcY        = clampedNorm * clampedNorm * bend * 38;

        const opacity = Math.abs(clampedNorm) > 2.0 ? 0 : 1;
        const zIndex  = Math.round(100 - Math.abs(clampedNorm) * 20);

        card.style.transform = `translateX(${screenX}px) translateY(${arcY}px) rotateZ(${rotZ}deg) scale(1)`;

        card.style.opacity = String(opacity);
        card.style.zIndex = String(zIndex);
      });

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [activeIndex, bend, cardWidth, ease, step]);

  /* ── Pointer / Touch events ── */
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const onDown = (e: MouseEvent | TouchEvent) => {
      isDragging.current = true;
      dragStartX.current = 'touches' in e ? e.touches[0].clientX : e.clientX;
      dragStartTarget.current = scrollTarget.current;
    };

    const onMove = (e: MouseEvent | TouchEvent) => {
      if (!isDragging.current) return;
      const x = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const delta = dragStartX.current - x;
      scrollTarget.current = dragStartTarget.current + delta;
    };

    const onUp = () => {
      if (!isDragging.current) return;
      isDragging.current = false;
      scheduleSnap();
    };

    container.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    container.addEventListener('touchstart', onDown, { passive: true });
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('touchend', onUp);

    return () => {
      container.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      container.removeEventListener('touchstart', onDown);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
  }, [maxScroll, scheduleSnap]);

  /* ── Placeholder SVG ── */
  const PlaceholderIcon = () => (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#52525b" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <polyline points="21 15 16 10 5 21" />
    </svg>
  );

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* ── Card track ── */}
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          overflow: 'hidden',
          cursor: 'grab',
          userSelect: 'none',
        }}
      >
        {renderItems.map((item, i) => {
          return (
            <div
              key={i}
              className="fan-card"
              onClick={() => goTo(i)}
              style={{
                position: 'absolute',
                top: '50%',
                left: 0,
                marginTop: `-${cardHeight / 2}px`,
                width: `${cardWidth}px`,
                height: `${cardHeight}px`,
                willChange: 'transform',
                transformOrigin: 'center bottom',
                transition: 'opacity 0.3s',
                borderRadius: '20px',
                cursor: 'pointer',
              }}
            >
              <BorderGlow
                edgeSensitivity={40}
                glowColor="0 100 50"
                backgroundColor="#18181b"
                borderRadius={20}
                glowRadius={25}
                glowIntensity={1.5}
                coneSpread={35}
                colors={['#e50914', '#ff0000', '#ff4d4d']}
                fillOpacity={0.2}
                animated={false}
                style={{ width: '100%', height: '100%' }}
              >
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  width: '100%',
                  height: '100%',
                  borderRadius: '20px',
                  overflow: 'hidden',
                  background: '#18181b'
                }}>
              {/* ── Image / Screenshot area (top ~58%) ── */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  height: '58%',
                  background: '#27272a',
                  overflow: 'hidden',
                  flexShrink: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {item.image && item.image !== 'placeholder' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                ) : (
                  /* Placeholder: grey area with icon */
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                    <PlaceholderIcon />
                    <span style={{ fontSize: '0.65rem', color: '#9ca3af' }}>Screenshot Tutorial</span>
                  </div>
                )}
              </div>

              {/* ── Text area (bottom ~42%) — white background ── */}
              <div
                style={{
                  padding: '16px 18px',
                  background: '#18181b',
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}
              >
                <div>
                  {/* Step label */}
                  {item.stepLabel && (
                    <span style={{
                      display: 'inline-block',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      color: '#dc2626',
                      textTransform: 'uppercase',
                      letterSpacing: '0.08em',
                      marginBottom: '6px',
                    }}>
                      {item.stepLabel}
                    </span>
                  )}

                  {/* Title */}
                  <h3 style={{
                    margin: '0 0 6px',
                    fontSize: '1rem',
                    fontWeight: 700,
                    color: '#ffffff',
                    lineHeight: 1.3,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {item.title}
                  </h3>

                  {/* Description */}
                  {item.description && (
                    <p style={{
                      margin: 0,
                      fontSize: '0.78rem',
                      color: '#a1a1aa',
                      lineHeight: 1.5,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}>
                      {item.description}
                    </p>
                  )}
                </div>

                {/* CTA button for last step */}
                {item.showCTA && (
                  <Link
                    href="/"
                    style={{
                      display: 'block',
                      marginTop: '12px',
                      padding: '8px 0',
                      background: '#dc2626',
                      color: '#ffffff',
                      textAlign: 'center',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                      fontWeight: 700,
                      textDecoration: 'none',
                      transition: 'background 0.2s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.background = '#b91c1c')}
                    onMouseLeave={e => (e.currentTarget.style.background = '#dc2626')}
                  >
                    Mulai Nonton →
                  </Link>
                )}
              </div>
                </div>
              </BorderGlow>
            </div>
          );
        })}
      </div>

      {/* ── Navigation buttons ── */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: 0,
        width: '100%',
        display: 'flex',
        justifyContent: 'center',
        gap: '16px',
        pointerEvents: 'none',
        zIndex: 200,
      }}>
        {(['prev', 'next'] as const).map(dir => (
          <button
            key={dir}
            onClick={() => goTo(activeIndex + (dir === 'next' ? 1 : -1))}
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '50%',
              border: '1.5px solid rgba(255,255,255,0.35)',
              background: 'rgba(0,0,0,0.35)',
              backdropFilter: 'blur(6px)',
              color: '#fff',
              pointerEvents: 'auto',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,255,255,0.15)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(0,0,0,0.35)')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              {dir === 'prev'
                ? <polyline points="15 18 9 12 15 6" />
                : <polyline points="9 18 15 12 9 6" />}
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
