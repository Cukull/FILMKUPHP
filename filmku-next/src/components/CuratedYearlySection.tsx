'use client';

/**
 * CuratedYearlySection
 * ────────────────────
 * Interactive tab-based section showing the best films per year (2010–2024).
 * Users click year tabs to browse curated picks. Uses horizontal scroll for film cards.
 */

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

interface FilmWithPoster {
  title: string;
  year: number;
  tmdbId: number;
  imdbRating: number;
  posterUrl: string;
}

interface YearlyData {
  year: number;
  films: FilmWithPoster[];
}

interface Props {
  yearlyData: YearlyData[];
}

export default function CuratedYearlySection({ yearlyData }: Props) {
  const [activeYear, setActiveYear] = useState(yearlyData[0]?.year ?? 2024);
  const tabsRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showScrollLeft, setShowScrollLeft] = useState(false);
  const [showScrollRight, setShowScrollRight] = useState(false);

  const activeData = yearlyData.find(y => y.year === activeYear);

  // Check scroll state for film cards
  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setShowScrollLeft(scrollLeft > 2);
    setShowScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth - 2);
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll, activeYear]);

  // Reset scroll when year changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setTimeout(checkScroll, 100);
    }
  }, [activeYear, checkScroll]);

  const scrollByAmount = (offset: number) => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScroll, 100);
      setTimeout(checkScroll, 400);
    }
  };

  // Scroll year tabs
  const scrollTabs = (dir: 'left' | 'right') => {
    if (tabsRef.current) {
      tabsRef.current.scrollBy({
        left: dir === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  return (
    <div className="curated-yearly-section">
      {/* Section header */}
      <div className="curated-yearly-header">
        <div className="curated-yearly-title-wrap">
          <span className="curated-yearly-icon"><Trophy size={22} /></span>
          <h2 className="curated-yearly-title">Film Terbaik Per Tahun</h2>
        </div>
        <p className="curated-yearly-subtitle">
          Koleksi kurasi film terbaik dari tahun 2010 hingga 2024
        </p>
      </div>

      {/* Year tabs */}
      <div className="curated-yearly-tabs-wrap">
        <button
          className="curated-yearly-tabs-arrow curated-yearly-tabs-arrow--left"
          onClick={() => scrollTabs('left')}
          aria-label="Scroll tahun ke kiri"
        >
          <ChevronLeft size={18} />
        </button>

        <div className="curated-yearly-tabs" ref={tabsRef}>
          {yearlyData.map(y => (
            <button
              key={y.year}
              className={`curated-year-tab ${activeYear === y.year ? 'curated-year-tab--active' : ''}`}
              onClick={() => setActiveYear(y.year)}
            >
              {y.year}
            </button>
          ))}
        </div>

        <button
          className="curated-yearly-tabs-arrow curated-yearly-tabs-arrow--right"
          onClick={() => scrollTabs('right')}
          aria-label="Scroll tahun ke kanan"
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Film cards for the selected year */}
      <div style={{ position: 'relative' }}>
        {/* Left arrow */}
        <div
          className="curated-scroll-arrow curated-scroll-arrow--left"
          style={{ opacity: showScrollLeft ? 1 : 0, pointerEvents: showScrollLeft ? 'auto' : 'none' }}
        >
          <button onClick={() => scrollByAmount(-500)} aria-label="Geser ke kiri">
            <ChevronLeft size={22} />
          </button>
        </div>

        {/* Right arrow */}
        <div
          className="curated-scroll-arrow curated-scroll-arrow--right"
          style={{ opacity: showScrollRight ? 1 : 0, pointerEvents: showScrollRight ? 'auto' : 'none' }}
        >
          <button onClick={() => scrollByAmount(500)} aria-label="Geser ke kanan">
            <ChevronRight size={22} />
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeYear}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
            className="curated-cards-scroll"
            ref={scrollRef}
            onScroll={checkScroll}
          >
            {activeData?.films.map((film, i) => (
              <motion.div
                key={film.tmdbId}
                className="curated-card"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: i * 0.06 }}
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

                {/* Title & rating below card */}
                <div className="curated-card-info">
                  <p className="curated-card-info-title">{film.title}</p>
                  <span className="curated-card-info-rating">⭐ {film.imdbRating}</span>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
