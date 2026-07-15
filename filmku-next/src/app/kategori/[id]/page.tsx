import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function CategoryDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      movies: true
    }
  });

  if (!category) {
    notFound();
  }

  return (
    <div style={{ padding: '2rem 4rem' }}>
      <h1 className="section-title" style={{ marginLeft: 0, marginBottom: '2rem', fontSize: '2rem' }}>
        Kategori: {category.name}
      </h1>
      
      {category.movies.length > 0 ? (
        <div className="movie-grid" style={{ padding: 0 }}>
          {category.movies.map((movie) => (
            <Link href={`/film/${movie.id}`} key={movie.id} style={{ textDecoration: 'none' }}>
              <div className="movie-card glass">
                <img 
                  src={movie.posterUrl || "https://via.placeholder.com/500x750?text=No+Poster"} 
                  alt={movie.title} 
                  className="movie-poster"
                />
                <div className="movie-overlay">
                  <h4 style={{ fontWeight: 600, fontSize: '1.1rem', margin: '0 0 0.5rem 0' }}>{movie.title}</h4>
                  {movie.rating && (
                    <div style={{ color: 'var(--accent)', fontWeight: 'bold' }}>⭐ {movie.rating}/10</div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-secondary)' }}>Belum ada film dalam kategori ini.</p>
      )}
    </div>
  );
}
