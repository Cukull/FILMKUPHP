'use client';

import { useRef, useState, useCallback, useEffect } from 'react';

export default function MovieLaneCarousel({ children }: { children: React.ReactNode }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);
  const [hovering, setHovering] = useState(false);
  
  // Drag to scroll state
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollLeftStart = useRef(0);

  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    
    setShowPrev(scrollLeft > 2);
    setShowNext(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, children]);

  const scrollByAmount = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 100);
      setTimeout(checkScroll, 400);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    isDragging.current = true;
    startX.current = e.pageX - scrollRef.current.offsetLeft;
    scrollLeftStart.current = scrollRef.current.scrollLeft;
    // Optional: ubah cursor saat drag
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.scrollSnapType = 'none'; // Matikan snap sementara saat drag
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.scrollSnapType = ''; // Kembalikan snap
    }
  };

  const handleMouseUp = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.scrollSnapType = '';
      checkScroll();
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current || !scrollRef.current) return;
    e.preventDefault(); // Mencegah highlight teks / drag default
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5; // Kecepatan scroll
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  return (
    <div 
      style={{ position: 'relative' }} 
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* ── Left hover-zone + Prev button ── */}
      <div
        className="movie-lane-arrow-zone"
        style={{
          position: 'absolute',
          inset: '0 auto 0 0',
          width: '5rem', // enough to cover the lane padding
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          paddingLeft: '0.5rem',
          background: 'linear-gradient(to right, rgba(8,8,16,0.95) 0%, transparent 100%)',
          opacity: (hovering && showPrev) ? 1 : 0,
          pointerEvents: showPrev ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      >
        <button
          onClick={() => scrollByAmount(-600)}
          aria-label="Geser ke kiri"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white',
            backdropFilter: 'blur(4px)',
            transition: 'background 0.2s, border-color 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(229,9,20,0.9)';
            (e.currentTarget.querySelector('svg') as SVGElement | null)?.setAttribute('stroke', 'rgba(229,9,20,0.9)');
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
            (e.currentTarget.querySelector('svg') as SVGElement | null)?.setAttribute('stroke', 'rgba(255,255,255,0.92)');
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
      </div>

      {/* ── Right hover-zone + Next button ── */}
      <div
        className="movie-lane-arrow-zone"
        style={{
          position: 'absolute',
          inset: '0 0 0 auto',
          width: '5rem',
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingRight: '0.5rem',
          background: 'linear-gradient(to left, rgba(8,8,16,0.95) 0%, transparent 100%)',
          opacity: (hovering && showNext) ? 1 : 0,
          pointerEvents: showNext ? 'auto' : 'none',
          transition: 'opacity 0.25s ease',
        }}
      >
        <button
          onClick={() => scrollByAmount(600)}
          aria-label="Geser ke kanan"
          style={{
            background: 'rgba(0,0,0,0.5)',
            border: '1px solid rgba(255,255,255,0.2)',
            borderRadius: '50%',
            width: '44px', height: '44px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'white',
            backdropFilter: 'blur(4px)',
            transition: 'background 0.2s, border-color 0.2s',
            boxShadow: '0 2px 8px rgba(0,0,0,0.5)'
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(229,9,20,0.9)';
            (e.currentTarget.querySelector('svg') as SVGElement | null)?.setAttribute('stroke', 'rgba(229,9,20,0.9)');
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'rgba(255,255,255,0.2)';
            (e.currentTarget.querySelector('svg') as SVGElement | null)?.setAttribute('stroke', 'rgba(255,255,255,0.92)');
          }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.92)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
      </div>

      {/* The scrollable container */}
      <div 
        ref={scrollRef} 
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseLeave={handleMouseLeave}
        onMouseUp={handleMouseUp}
        onMouseMove={handleMouseMove}
        className="movie-lane-scroll" 
        style={{ cursor: 'grab' }}
      >
        {children}
      </div>
    </div>
  );
}
