import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const movie = await prisma.movie.findUnique({
    where: { id },
    include: {
      category: true,
      showtimes: true,
    },
  });

  if (!movie) {
    notFound();
  }

  // Build YouTube embed URL safely
  let embedUrl: string | null = null;
  if (movie.trailerUrl) {
    const match = movie.trailerUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?\/]+)/);
    const videoId = match ? match[1] : null;
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}&rel=0`;
    }
  }

  return (
    <div className="page-transition" style={{ padding: "2rem 4rem", maxWidth: "1400px", margin: "0 auto" }}>

      {/* ── TOP SECTION: Poster + Meta Info ── */}
      <div
        className="glass-static"
        style={{
          display: "flex",
          gap: "2.5rem",
          padding: "2rem",
          marginBottom: "1.5rem",
          alignItems: "flex-start",
        }}
      >
        {/* Poster */}
        <div className="poster-detail" style={{ aspectRatio: "2/3" }}>
          <img
            src={movie.posterUrl || "https://via.placeholder.com/400x600?text=No+Poster"}
            alt={movie.title}
          />
        </div>

        {/* Info Column */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Title */}
          <h1
            style={{
              fontSize: "clamp(1.8rem, 4vw, 3rem)",
              fontWeight: 900,
              margin: "0 0 1rem 0",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
              color: "var(--text-primary)",
            }}
          >
            {movie.title}
          </h1>

          {/* Badge row: Rating, Durasi, Genre */}
          <div style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1.5rem" }}>
            {movie.rating && (
              <span className="badge badge-gold">⭐ {movie.rating} / 10</span>
            )}
            {movie.durationMin && (
              <span className="badge badge-muted">⏱ {movie.durationMin} Menit</span>
            )}
            {movie.category && (
              <span className="badge badge-accent">{movie.category.name}</span>
            )}
          </div>

          {/* Divider */}
          <div style={{ height: "1px", background: "var(--glass-border)", marginBottom: "1.5rem" }} />

          {/* Sinopsis */}
          <div className="glass-static" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--accent)",
                marginBottom: "0.75rem",
              }}
            >
              Sinopsis
            </h3>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.75, margin: 0, fontSize: "0.95rem" }}>
              {movie.synopsis || "Belum ada sinopsis untuk film ini."}
            </p>
          </div>

          {/* Jadwal Tayang */}
          <div className="glass-static" style={{ padding: "1.5rem" }}>
            <h3
              style={{
                fontSize: "0.75rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.12em",
                color: "var(--accent)",
                marginBottom: "1rem",
              }}
            >
              Jadwal Tayang Hari Ini
            </h3>

            {movie.showtimes.length > 0 ? (
              <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap" }}>
                {movie.showtimes.map((st) => (
                  <Link href={`/kursi/${st.id}`} key={st.id} style={{ textDecoration: "none" }}>
                    <button className="showtime-btn">
                      🎬{" "}
                      {new Date(st.startTime).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </button>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🎭</span>
                <p>Belum ada jadwal tayang tersedia.</p>
              </div>
            )}

            {movie.showtimes.length > 0 && (
              <p
                style={{
                  marginTop: "1rem",
                  fontSize: "0.8rem",
                  color: "var(--text-secondary)",
                  borderTop: "1px solid var(--glass-border)",
                  paddingTop: "1rem",
                }}
              >
                Pilih jam tayang di atas untuk memilih kursi &amp; membeli tiket.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── TRAILER SECTION ── */}
      {embedUrl && (
        <div className="glass-static" style={{ padding: "1.5rem", marginBottom: "1.5rem" }}>
          <h3
            style={{
              fontSize: "0.75rem",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              color: "var(--accent)",
              marginBottom: "1rem",
            }}
          >
            🎞 Trailer Official
          </h3>
          {/* Responsive 16:9 wrapper */}
          <div
            style={{
              position: "relative",
              paddingBottom: "56.25%",
              height: 0,
              overflow: "hidden",
              borderRadius: "0.75rem",
              border: "1px solid var(--glass-border)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
            }}
          >
            <iframe
              src={embedUrl}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                border: 0,
              }}
              allow="autoplay; encrypted-media; fullscreen"
              allowFullScreen
            />
          </div>
        </div>
      )}

      {/* ── BACK BUTTON ── */}
      <div style={{ marginTop: "1rem" }}>
        <Link href="/" style={{ textDecoration: "none" }}>
          <button className="btn-primary" style={{ background: "transparent", border: "1px solid var(--glass-border)", color: "var(--text-secondary)" }}>
            ← Kembali ke Beranda
          </button>
        </Link>
      </div>
    </div>
  );
}
