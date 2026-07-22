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

type Props = {
  id: string;
  title: string;
  posterUrl: string | null;
  rating: number | null;
  genre: string | null;
  synopsis: string | null;
  status?: 'NOW_PLAYING' | 'UPCOMING' | string | null;
};

export default function MovieLaneCard({
  id,
  title,
  posterUrl,
  rating,
  genre,
  synopsis,
  status,
}: Props) {
  const poster = posterUrl || 'https://via.placeholder.com/160x240?text=No+Poster';
  const primaryGenre = genre?.split(',')[0]?.trim() ?? '';

  return (
    <Link href={`/film/${id}`} style={{ textDecoration: 'none', flexShrink: 0 }}>
      <div className="mlc-card">
        {/* Status badge */}
        {status === 'NOW_PLAYING' && (
          <span className="movie-status-badge badge-now-playing">Tayang</span>
        )}
        {status === 'UPCOMING' && (
          <span className="movie-status-badge badge-upcoming">Segera</span>
        )}

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
  );
}
