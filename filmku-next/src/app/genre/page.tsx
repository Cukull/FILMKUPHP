import { prisma } from "@/lib/prisma";
import Link from "next/link";

export default async function GenrePage() {
  const categories = await prisma.category.findMany({
    include: {
      movies: {
        orderBy: { title: 'asc' }
      }
    }
  });

  return (
    <div className="page-transition" style={{ padding: "4rem 4rem 6rem", minHeight: "100vh" }}>
      <div style={{ marginBottom: "3rem", maxWidth: "600px" }}>
        <h1 style={{ fontSize: "2.5rem", fontWeight: 800, marginBottom: "0.75rem", color: "var(--text-primary)" }}>
          Eksplorasi Berdasarkan Genre
        </h1>
        <p style={{ color: "var(--text-secondary)", fontSize: "1.1rem", lineHeight: 1.6 }}>
          Temukan film favorit Anda dari berbagai kategori yang tersedia.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "3rem" }}>
        {categories.map((category) => (
          category.movies.length > 0 && (
            <div key={category.id} className="movie-lane">
              <div className="movie-lane-header" style={{ marginBottom: "1rem" }}>
                <h3 className="movie-lane-title" style={{ fontSize: "1.5rem" }}>{category.name}</h3>
                <Link
                  href={`/kategori/${category.id}`}
                  style={{
                    fontSize: "0.85rem",
                    color: "var(--accent)",
                    textDecoration: "none",
                    fontWeight: 600,
                    letterSpacing: "0.03em",
                  }}
                >
                  Lihat Semua →
                </Link>
              </div>

              <div className="movie-lane-scroll" style={{ paddingBottom: "1rem" }}>
                {category.movies.map((movie) => (
                  <Link
                    href={`/film/${movie.id}`}
                    key={movie.id}
                    style={{ textDecoration: "none", flexShrink: 0 }}
                  >
                    <div className="movie-lane-card">
                      {movie.status === "NOW_PLAYING" && (
                        <span className="movie-status-badge badge-now-playing">Tayang</span>
                      )}
                      {movie.status === "UPCOMING" && (
                        <span className="movie-status-badge badge-upcoming">Segera</span>
                      )}
                      <img
                        src={movie.posterUrl || "https://via.placeholder.com/200x300?text=No+Poster"}
                        alt={movie.title}
                        loading="lazy"
                      />
                      <div className="card-info">
                        <h4>{movie.title}</h4>
                        <p>{movie.rating ? `⭐ ${movie.rating}` : category.name}</p>
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
