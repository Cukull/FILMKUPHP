'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getMoviesByIds } from '@/actions/movies';
import MovieGridCard from '@/components/MovieGridCard';

export default function WishlistClient() {
  const [movies, setMovies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadWishlist() {
      const stored = localStorage.getItem('filmku_wishlist');
      if (stored) {
        try {
          const ids = JSON.parse(stored);
          if (Array.isArray(ids) && ids.length > 0) {
            const data = await getMoviesByIds(ids);
            setMovies(data);
          }
        } catch (e) {
          console.error('Error loading wishlist', e);
        }
      }
      setLoading(false);
    }
    
    loadWishlist();
  }, []);

  const removeFromWishlist = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    const stored = localStorage.getItem('filmku_wishlist');
    if (stored) {
      let ids = JSON.parse(stored);
      ids = ids.filter((item: string) => item !== id);
      localStorage.setItem('filmku_wishlist', JSON.stringify(ids));
      setMovies(prev => prev.filter(m => m.id !== id));
    }
  };

  return (
    <div className="page-transition" style={{ padding: '4rem 4rem 6rem', minHeight: '100vh' }}>
      <div style={{ marginBottom: '3rem', maxWidth: '600px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Wishlist Saya 🤍
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', lineHeight: 1.6 }}>
          Kumpulan film favorit yang ingin Anda tonton.
        </p>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-secondary)' }}>Memuat wishlist...</div>
      ) : movies.length > 0 ? (
        <div className="movie-grid" style={{ padding: 0 }}>
          {movies.map((movie) => (
            <MovieGridCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterUrl={movie.posterUrl}
              rating={movie.rating}
              synopsis={movie.synopsis}
              status={movie.status}
              actions={
                <button
                  onClick={(e) => removeFromWishlist(movie.id, e)}
                  style={{
                    background: 'rgba(0,0,0,0.6)', border: 'none', borderRadius: '50%',
                    width: '32px', height: '32px', display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: 'var(--primary)', cursor: 'pointer',
                    backdropFilter: 'blur(4px)',
                  }}
                  title="Hapus dari Wishlist"
                >
                  ✕
                </button>
              }
            />
          ))}
        </div>
      ) : (
        <div className="glass-static" style={{ padding: '3rem', textAlign: 'center', borderRadius: '1rem' }}>
          <span style={{ fontSize: '2rem', display: 'block', marginBottom: '1rem' }}>📭</span>
          <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.5rem' }}>Wishlist Anda Kosong</h3>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Anda belum menambahkan film apapun ke wishlist.</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Eksplor Film</Link>
        </div>
      )}
    </div>
  );
}
