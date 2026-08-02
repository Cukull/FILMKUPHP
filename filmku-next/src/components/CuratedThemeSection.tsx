'use client';

/**
 * CuratedThemeSection
 * ───────────────────
 * Horizontal scroll carousel for a single themed curated film collection.
 * Similar to MovieLane but with richer card design and themed header.
 */

import { useRef, useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface FilmWithPoster {
  title: string;
  year: number;
  tmdbId: number;
  imdbRating: number;
  posterUrl: string;
}

interface Props {
  name: string;
  icon: string;
  emoji: string;
  description: string;
  films: FilmWithPoster[];
}

function RenderIcon({ name, size = 20 }: { name: string; size?: number }) {
  const Icon = (LucideIcons as any)[name] || LucideIcons.Film;
  return <Icon size={size} />;
}

export default function CuratedThemeSection({ name, icon, emoji, description, films }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showPrev, setShowPrev] = useState(false);
  const [showNext, setShowNext] = useState(true);
  const [hovering, setHovering] = useState(false);

  // Drag to scroll
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
  }, [checkScroll]);

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
    scrollRef.current.style.cursor = 'grabbing';
    scrollRef.current.style.scrollSnapType = 'none';
  };

  const handleMouseLeave = () => {
    isDragging.current = false;
    if (scrollRef.current) {
      scrollRef.current.style.cursor = 'grab';
      scrollRef.current.style.scrollSnapType = '';
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
    e.preventDefault();
    const x = e.pageX - scrollRef.current.offsetLeft;
    const walk = (x - startX.current) * 1.5;
    scrollRef.current.scrollLeft = scrollLeftStart.current - walk;
  };

  return (
    <div className="curated-theme-section">
      {/* Header */}
      <div className="curated-theme-header">
        <div className="curated-theme-title-row">
          <span className="curated-theme-icon">
            <RenderIcon name={icon} size={20} />
          </span>
          <h3 className="curated-theme-title">
            {emoji} {name}
          </h3>
        </div>
        <p className="curated-theme-desc">{description}</p>
      </div>

      {/* Carousel */}
      <div
        style={{ position: 'relative' }}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        {/* Left arrow */}
        <div
          className="curated-scroll-arrow curated-scroll-arrow--left"
          style={{
            opacity: hovering && showPrev ? 1 : 0,
            pointerEvents: showPrev ? 'auto' : 'none',
          }}
        >
          <button onClick={() => scrollByAmount(-500)} aria-label="Geser ke kiri">
            <ChevronLeft size={22} />
          </button>
        </div>

        {/* Right arrow */}
        <div
          className="curated-scroll-arrow curated-scroll-arrow--right"
          style={{
            opacity: hovering && showNext ? 1 : 0,
            pointerEvents: showNext ? 'auto' : 'none',
          }}
        >
          <button onClick={() => scrollByAmount(500)} aria-label="Geser ke kanan">
            <ChevronRight size={22} />
          </button>
        </div>

        <div
          className="curated-cards-scroll"
          ref={scrollRef}
          onScroll={checkScroll}
          onMouseDown={handleMouseDown}
          onMouseLeave={handleMouseLeave}
          onMouseUp={handleMouseUp}
          onMouseMove={handleMouseMove}
          style={{ cursor: 'grab' }}
        >
          {films.map((film, i) => (
            <motion.div
              key={film.tmdbId}
              className="curated-card"
              initial={{ opacity: 0, scale: 0.85, y: 20 }}
              whileInView={{ opacity: 1, scale: 1, y: 0 }}
              viewport={{ once: true, amount: 0.1 }}
              transition={{ duration: 0.35, delay: i * 0.04 }}
            >
              <div className="curated-card-poster">
                {film.posterUrl ? (
                  <img
                    src={film.posterUrl}
                    alt={film.title}
                    loading="lazy"
                    draggable={false}
                  />
                ) : (
                  <div className="curated-card-fallback">
                    <span>{film.title}</span>
                  </div>
                )}

                {/* Hover overlay */}
                <div className="curated-card-overlay">
                  <div className="curated-card-overlay-inner">
                    <h4>{film.title}</h4>
                    <div className="curated-card-meta">
                      <span className="curated-card-year">{film.year}</span>
                      <span className="curated-card-rating">⭐ {film.imdbRating}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Info below */}
              <div className="curated-card-info">
                <p className="curated-card-info-title">{film.title}</p>
                <span className="curated-card-info-rating">⭐ {film.imdbRating}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
