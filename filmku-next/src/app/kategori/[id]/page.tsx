import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import MovieGridCard from "@/components/MovieGridCard";

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
            <MovieGridCard
              key={movie.id}
              id={movie.id}
              title={movie.title}
              posterUrl={movie.posterUrl}
              rating={movie.rating}
              synopsis={movie.synopsis}
              status={movie.status}
            />
          ))}
        </div>
      ) : (
        <p style={{ color: 'var(--text-secondary)' }}>Belum ada film dalam kategori ini.</p>
      )}
    </div>
  );
}
