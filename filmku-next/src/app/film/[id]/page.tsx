import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      category: true,
      showtimes: true
    }
  });

  if (!movie) {
    notFound();
  }

  return (
    <div style={{ padding: '2rem 4rem' }}>
      <div className="glass" style={{ display: 'flex', gap: '2rem', padding: '2rem', borderRadius: '1rem' }}>
        <img 
          src={movie.posterUrl || "https://via.placeholder.com/500x750?text=No+Poster"} 
          alt={movie.title} 
          style={{ width: '300px', borderRadius: '0.5rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
        />
        
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, margin: '0 0 1rem 0' }}>{movie.title}</h1>
          <div style={{ display: 'flex', gap: '1rem', color: 'var(--text-secondary)', marginBottom: '2rem' }}>
            {movie.rating && <span>⭐ {movie.rating}/10</span>}
            {movie.durationMin && <span>⏳ {movie.durationMin} Menit</span>}
            {movie.category && <span style={{ color: 'var(--accent)' }}>{movie.category.name}</span>}
          </div>

          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '0.5rem' }}>Sinopsis</h3>
          <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '2rem' }}>
            {movie.synopsis || "Belum ada sinopsis untuk film ini."}
          </p>

          {movie.trailerUrl && (
            <div style={{ marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Trailer Official</h3>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '1rem', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
                <iframe 
                  src={`${movie.trailerUrl.replace('watch?v=', 'embed/')}?autoplay=1&mute=1&loop=1&playlist=${movie.trailerUrl.split('v=')[1] || movie.trailerUrl.split('/').pop()}`} 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }} 
                  allow="autoplay; encrypted-media" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1rem' }}>Jadwal Tayang Hari Ini</h3>
          {movie.showtimes.length > 0 ? (
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
              {movie.showtimes.map(st => (
                <Link href={`/kursi/${st.id}`} key={st.id} style={{ textDecoration: 'none' }}>
                  <button className="btn-primary" style={{ background: 'var(--bg-card)', border: '1px solid var(--glass-border)', color: 'white', cursor: 'pointer' }}>
                    {new Date(st.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </button>
                </Link>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--text-secondary)' }}>Belum ada jadwal tayang tersedia.</p>
          )}

          <div style={{ marginTop: '3rem', display: 'flex', gap: '1rem' }}>
            <p style={{ color: 'var(--text-secondary)' }}>Silakan pilih jadwal tayang di atas untuk membeli tiket.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
