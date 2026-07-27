import React from "react";
import { prisma } from "@/lib/prisma";
import MovieLaneCard from "@/components/MovieLaneCard";
import MovieLaneCarousel from "@/components/MovieLaneCarousel";
import AdsterraBanner from "@/components/ads/AdsterraBanner";

export const revalidate = 60;

// All possible genres — same list as FilmForm checkboxes
const ALL_GENRES = [
  'Action', 'Adventure', 'Animation', 'Comedy', 'Crime',
  'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror',
  'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western',
];

const GENRE_ICONS: Record<string, string> = {
  'Action': '💥',
  'Adventure': '🗺️',
  'Animation': '🎨',
  'Comedy': '😂',
  'Crime': '🔍',
  'Documentary': '📽️',
  'Drama': '🎭',
  'Family': '👨‍👩‍👧',
  'Fantasy': '🧙',
  'Horror': '👻',
  'Mystery': '🕵️',
  'Romance': '❤️',
  'Science Fiction': '🚀',
  'Thriller': '😱',
  'War': '⚔️',
  'Western': '🤠',
};

function movieHasGenre(movieGenreStr: string | null, targetGenre: string): boolean {
  if (!movieGenreStr) return false;
  const genres = movieGenreStr.toLowerCase().split(',').map(g => g.trim());
  const target = targetGenre.toLowerCase();
  if (genres.includes(target)) return true;
  if (target === 'animation' && (genres.includes('animasi') || genres.includes('anime') || genres.includes('kartun'))) return true;
  if (target === 'action' && (genres.includes('aksi') || genres.includes('aksi & petualangan'))) return true;
  if (target === 'adventure' && (genres.includes('petualangan') || genres.includes('aksi & petualangan'))) return true;
  if (target === 'comedy' && genres.includes('komedi')) return true;
  if (target === 'crime' && genres.includes('kriminal')) return true;
  if (target === 'documentary' && genres.includes('dokumenter')) return true;
  if (target === 'family' && genres.includes('keluarga')) return true;
  if (target === 'fantasy' && (genres.includes('fantasi') || genres.includes('sci-fi & fantasi'))) return true;
  if (target === 'horror' && genres.includes('horor')) return true;
  if (target === 'mystery' && genres.includes('misteri')) return true;
  if (target === 'romance' && (genres.includes('romantis') || genres.includes('percintaan'))) return true;
  if (target === 'science fiction' && (genres.includes('fiksi ilmiah') || genres.includes('sci-fi') || genres.includes('sci-fi & fantasi'))) return true;
  if (target === 'war' && (genres.includes('perang') || genres.includes('perang & politik'))) return true;
  if (target === 'western' && genres.includes('koboi')) return true;
  return false;
}

export default async function GenrePage() {
  const allMovies = await prisma.movie.findMany({
    orderBy: { title: 'asc' },
  });

  // Group movies by genre string field (each movie can have multiple genres)
  const genres = ALL_GENRES
    .map(name => ({
      name,
      icon: GENRE_ICONS[name] ?? '🎬',
      movies: allMovies.filter(m => movieHasGenre(m.genre, name)),
    }))
    .filter(g => g.movies.length > 0);

  return (
    <div className="page-transition genre-page-container">
      {/* Page Header */}
      <div style={{ marginBottom: '3rem', maxWidth: '650px' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          Eksplorasi Berdasarkan Genre
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem', lineHeight: 1.6 }}>
          Temukan film favorit Anda dari berbagai genre yang tersedia.
        </p>
      </div>

      {/* Genre Sections */}
      {genres.length === 0 ? (
        <div style={{
          padding: '5rem 2rem',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.35)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '1rem',
        }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
          <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
            Belum ada film dengan genre yang ditentukan
          </p>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.2)' }}>
            Buka Admin Panel → Edit Film → pilih Genre untuk film tersebut.
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          {genres.map((genre, idx) => (
            <React.Fragment key={genre.name}>
              <div className="movie-lane">
                {/* Genre Header */}
                <div className="movie-lane-header" style={{ marginBottom: '1rem' }}>
                  <h3 className="movie-lane-title" style={{ fontSize: '1.4rem' }}>
                    {genre.icon} {genre.name}
                    <span style={{
                      marginLeft: '0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      background: 'rgba(229,9,20,0.15)',
                      color: '#e50914',
                      padding: '0.2rem 0.6rem',
                      borderRadius: '20px',
                      border: '1px solid rgba(229,9,20,0.3)',
                      verticalAlign: 'middle',
                    }}>
                      {genre.movies.length} film
                    </span>
                  </h3>
                </div>

                <MovieLaneCarousel>
                  {genre.movies.map(movie => (
                    <MovieLaneCard
                      key={movie.id}
                      id={movie.id}
                      title={movie.title}
                      posterUrl={movie.posterUrl}
                      rating={movie.rating}
                      genre={genre.name}
                      synopsis={movie.synopsis}
                      status={movie.status}
                      sections={movie.sections}
                    />
                  ))}
                </MovieLaneCarousel>
              </div>
              {(idx === 1 || idx === 4) && <AdsterraBanner />}
            </React.Fragment>
          ))}

          <AdsterraBanner />
        </div>
      )}
    </div>
  );
}
