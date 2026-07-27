'use client';

/**
 * MovieLaneCard
 * ─────────────
 * Reusable poster card untuk horizontal-scroll lane (homepage, genre).
 * Size: 160 × 240 px (mobile: 140×210, 120×180).
 *
 * Hover behavior:
 *  - Card scale 1.05 (GPU via transform)
 *  - Overlay vignette slide-UP dari bawah (translateY 100% → 0)
 *  - Di dalam overlay: judul, rating badge, sinopsis (1-2 baris)
 *
 * Touch device: overlay selalu sedikit visible (judul terlihat tanpa hover)
 * via CSS @media (hover: none).
 */

import Link from 'next/link';
import { motion } from 'framer-motion';
import { getFormatBadge } from '@/utils/formatBadge';

type Props = {
  id: string;
  title: string;
  posterUrl: string | null;
  rating: number | null;
  genre: string | null;
  synopsis: string | null;
  status?: 'NOW_PLAYING' | 'UPCOMING' | string | null;
  sections?: string | null;
  country?: string | null;
  originalLanguage?: string | null;
  mediaType?: string | null;
};

export default function MovieLaneCard({
  id,
  title,
  posterUrl,
  rating,
  genre,
  synopsis,
  status,
  sections,
  country,
  originalLanguage,
  mediaType,
}: Props) {
  const poster = posterUrl || 'https://via.placeholder.com/160x240?text=No+Poster';
  const primaryGenre = genre?.split(',')[0]?.trim() ?? '';
  const formatBadge = getFormatBadge({
    genre,
    sections,
    title,
    country,
    originalLanguage,
    mediaType,
  });

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 30 }}
      whileInView={{ opacity: 1, scale: 1, y: 0 }}
      viewport={{ once: false, amount: 0.1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      style={{ flexShrink: 0 }}
    >
      <Link href={`/film/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="mlc-card">
          {/* Format badge */}
          <span className={formatBadge.className}>{formatBadge.label}</span>

          {/* Poster */}
          <img src={poster} alt={title} loading="lazy" className="mlc-img" />

          {/* Hover overlay — slide up dari bawah */}
          <div className="mlc-overlay" aria-hidden="true">
            <div className="mlc-overlay-inner">
              {/* Judul */}
              <h4 className="mlc-title">{title}</h4>

              {/* Rating badge */}
              {rating ? (
                <span className="mlc-rating">⭐ {rating}</span>
              ) : primaryGenre ? (
                <span className="mlc-genre">{primaryGenre}</span>
              ) : null}

              {/* Sinopsis — max 2 baris */}
              {synopsis && (
                <p className="mlc-synopsis">{synopsis}</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
