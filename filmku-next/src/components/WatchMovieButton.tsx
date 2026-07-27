'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { checkIsAdminAction } from '@/actions/check-admin';

// ══════════════════════════════════════════════════════════════════════════════════════
// TEMPELKAN URL SMARTLINK (DIRECT LINK) ADSTERRA ANDA DI SINI:
// ══════════════════════════════════════════════════════════════════════════════════════
const SMARTLINK_URL = "https://dischargeconceiteffort.com/kne0qw3q7?key=9e4530e778fb6f17627bb9b3b53ef516";


interface WatchMovieButtonProps {
  title: string;
  originalTitle?: string;   // Judul asli untuk pencarian TMDB (Inggris / Korea / China)
  movieId: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function WatchMovieButton({
  title,
  originalTitle,
  movieId,
  className = 'btn-primary',
  style,
}: WatchMovieButtonProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [hasClickedAd, setHasClickedAd] = useState(false);

  useEffect(() => {
    checkIsAdminAction().then((adminStatus) => {
      setIsAdmin(adminStatus);
      if (!adminStatus) {
        // Cek apakah user sudah mengklik iklan (Smartlink 1x) untuk film ini dalam sesi ini
        const unlocked = sessionStorage.getItem(`filmku_ad_unlocked_${movieId}`);
        if (unlocked === 'true') {
          setHasClickedAd(true);
        }
      }
    });
  }, [movieId]);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    // searchTitle: gunakan originalTitle (judul asli TMDB) jika tersedia,
    // karena TMDB tidak mengenali judul terjemahan Indonesia
    const searchTitle = originalTitle || title;
    router.push(`/test-streaming?title=${encodeURIComponent(searchTitle)}&displayTitle=${encodeURIComponent(title)}&id=${movieId}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={className}
      style={{
        fontSize: '0.9rem',
        padding: '0.65rem 1.5rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        ...style,
      }}
    >
      <span>▶</span>
      <span>Tonton Film</span>
    </button>
  );
}
