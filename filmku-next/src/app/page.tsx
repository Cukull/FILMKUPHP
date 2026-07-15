import { prisma } from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

// Force Next.js to re-render this page frequently since movies might update
export const revalidate = 60; 

export default async function Home() {
  // Fetch all movies, grouped by their categories
  const categories = await prisma.category.findMany({
    include: {
      movies: {
        take: 6, // Limit 6 movies per category lane to mimic typical streaming UI
      }
    }
  });

  return (
    <div>
      {/* Hero Banner (Hardcoded for now, can be fetched dynamically later) */}
      <div 
        style={{ 
          height: '60vh', 
          background: 'linear-gradient(to right, rgba(0,0,0,0.9) 20%, rgba(0,0,0,0)), url("https://image.tmdb.org/t/p/original/tElnmtQ6snFIg4VfS768kK9rS9X.jpg") center/cover',
          display: 'flex',
          alignItems: 'center',
          padding: '0 4rem'
        }}
      >
        <div style={{ maxWidth: '600px' }}>
          <h2 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem' }}>Mencuri Raden Saleh 2</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
            Piko dan komplotannya merencanakan pencurian artefak sejarah terbesar di luar negeri untuk menyelamatkan nyawa rekan mereka.
          </p>
          <div className="flex gap-4">
            <button className="btn-primary">Pesan Tiket</button>
            <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.2)', color: 'white' }}>Lihat Trailer</button>
          </div>
        </div>
      </div>

      {/* Dynamic Categories from Supabase */}
      <div style={{ paddingBottom: '4rem' }}>
        {categories.map((category) => (
          category.movies.length > 0 && (
            <div key={category.id}>
              <h3 className="section-title">{category.name}</h3>
              <div className="movie-grid">
                {category.movies.map((movie) => (
                  <Link href={`/film/${movie.id}`} key={movie.id} style={{ textDecoration: 'none' }}>
                    <div className="movie-card glass">
                      <img 
                        src={movie.posterUrl || "https://via.placeholder.com/300x450?text=No+Poster"} 
                        alt={movie.title} 
                      />
                      <div className="overlay">
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: 'white', marginBottom: '0.2rem' }}>{movie.title}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{category.name}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )
        ))}
      </div>
    </div>
  );
}
