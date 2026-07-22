'use client';

/**
 * MovieGridCard
 * ─────────────
 * Reusable poster card untuk grid layout (wishlist, kategori).
 * Size: auto (220px+ via CSS grid auto-fill).
 *
 * Hover behavior sama dengan MovieLaneCard:
 *  - Card scale 1.03
 *  - Overlay vignette slide-UP dari bawah (hanya 28% tinggi card)
 *  - Judul, rating badge, sinopsis
 *
 * Mendukung slot `actions` untuk tombol tambahan (misal tombol hapus wishlist).
 */

import Link from 'next/link';
import type { ReactNode } from 'react';

type Props = {
  id: string;
  title: string;
  posterUrl: string | null;
  rating: number | null;
  synopsis: string | null;
  status?: 'NOW_PLAYING' | 'UPCOMING' | string | null;
  /** Slot untuk elemen tambahan di atas card (misal tombol hapus) */
  actions?: ReactNode;
};

export default function MovieGridCard({
  id,
  title,
  posterUrl,
  rating,
  synopsis,
  status,
  actions,
}: Props) {
  const poster = posterUrl || 'https://via.placeholder.com/500x750?text=No+Poster';

  return (
    <div className="mgc-wrapper">
      {/* Tombol aksi (misal: hapus dari wishlist) */}
      {actions && <div className="mgc-actions">{actions}</div>}

      <Link href={`/film/${id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div className="mgc-card">
          {/* Status badge */}
          {status === 'NOW_PLAYING' && (
            <span className="movie-status-badge badge-now-playing">Tayang</span>
          )}
          {status === 'UPCOMING' && (
            <span className="movie-status-badge badge-upcoming">Segera</span>
          )}

          {/* Poster */}
          <img src={poster} alt={title} loading="lazy" className="mgc-img" />

          {/* Hover overlay */}
          <div className="mgc-overlay" aria-hidden="true">
            <div className="mgc-overlay-inner">
              <h4 className="mgc-title">{title}</h4>

              {rating && (
                <span className="mgc-rating">⭐ {rating} / 10</span>
              )}

              {synopsis && (
                <p className="mgc-synopsis">{synopsis}</p>
              )}
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
}
