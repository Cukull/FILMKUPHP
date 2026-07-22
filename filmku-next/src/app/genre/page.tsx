import { prisma } from "@/lib/prisma";
import MovieLaneCard from "@/components/MovieLaneCard";

export const revalidate = 30;

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

export default async function GenrePage() {
  const allMovies = await prisma.movie.findMany({
    orderBy: { title: 'asc' },
  });

  // Group movies by genre string field (each movie can have multiple genres)
  const genres = ALL_GENRES
    .map(name => ({
      name,
      icon: GENRE_ICONS[name] ?? '🎬',
      movies: allMovies.filter(m =>
        m.genre
          ?.split(',')
          .map(g => g.trim())
          .includes(name)
      ),
    }))
    .filter(g => g.movies.length > 0);

  return (
    <div className="page-transition" style={{ padding: '4rem 4rem 6rem', minHeight: '100vh' }}>
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
          {genres.map(genre => (
            <div key={genre.name} className="movie-lane">
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

              <div className="movie-lane-scroll" style={{ paddingBottom: '1rem' }}>
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
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
