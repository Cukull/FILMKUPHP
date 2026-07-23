import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import WishlistButton from "./WishlistButton";
import ShowtimeSelector from "./ShowtimeSelector";
import HeroTrailer from "./HeroTrailer";

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { category: true, showtimes: true },
  });

  if (!movie) notFound();

  // Build YouTube video ID
  let videoId: string | null = null;
  if (movie.trailerUrl) {
    videoId = movie.trailerUrl;
    const match = movie.trailerUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?\/]+)/);
    if (match) videoId = match[1];
  }

  const backdropUrl = movie.posterUrl || "https://image.tmdb.org/t/p/original/tElnmtQ6snFIg4VfS768kK9rS9X.jpg";
  const durationHours = movie.durationMin ? Math.floor(movie.durationMin / 60) : null;
  const durationMins = movie.durationMin ? movie.durationMin % 60 : null;
  const todayShowtimes = movie.showtimes;

  // ── Rotten Tomatoes: fresh (≥60%) vs rotten (<60%) ──────────────────
  // RT value dari DB berupa string misal "79%" atau "45%"
  const getRTBadge = (rt: string | null) => {
    if (!rt) return null;
    const numStr = rt.replace(/[^\d]/g, '');
    const score = parseInt(numStr, 10);
    if (isNaN(score)) return { icon: '🍅', color: '#fa320a', bg: 'rgba(250,50,10,0.15)', border: 'rgba(250,50,10,0.35)' };
    if (score >= 60) {
      // Fresh — tomat merah cerah
      return { icon: '🍅', color: '#fa320a', bg: 'rgba(250,50,10,0.15)', border: 'rgba(250,50,10,0.35)' };
    } else {
      // Rotten — warna abu/hijau gelap (splat)
      return { icon: '🤢', color: '#8fbc8f', bg: 'rgba(100,120,100,0.15)', border: 'rgba(100,120,100,0.35)' };
    }
  };

  // ── Metacritic: hijau 61-100, kuning 40-60, merah 0-39 ──────────────
  // MC value dari DB berupa string misal "74/100" atau "38/100"
  const getMCBadge = (mc: string | null) => {
    if (!mc) return null;
    const numStr = mc.replace(/[^\d].*/, ''); // ambil angka sebelum "/"
    const score = parseInt(numStr, 10);
    if (isNaN(score)) return { color: '#f5c518', bg: 'rgba(245,197,24,0.12)', border: 'rgba(245,197,24,0.35)' };
    if (score >= 61) {
      return { color: '#22c55e', bg: 'rgba(34,197,94,0.12)', border: 'rgba(34,197,94,0.35)' };
    } else if (score >= 40) {
      return { color: '#f5c518', bg: 'rgba(245,197,24,0.12)', border: 'rgba(245,197,24,0.35)' };
    } else {
      return { color: '#ef4444', bg: 'rgba(239,68,68,0.12)', border: 'rgba(239,68,68,0.35)' };
    }
  };

  const rtBadge = getRTBadge(movie.rottenTomatoes ?? null);
  const mcBadge = getMCBadge(movie.metacritic ?? null);

  // Parse Cast and Crew
  let parsedCrew: any[] = [];
  try {
    if (movie.director) parsedCrew = JSON.parse(movie.director);
  } catch {
    if (movie.director) parsedCrew = [{ name: movie.director, role: "Sutradara", imageUrl: "" }];
  }
  let parsedCast: any[] = [];
  try {
    if (movie.cast) parsedCast = JSON.parse(movie.cast);
  } catch {
    if (movie.cast) parsedCast = [{ name: movie.cast, role: "Pemeran", imageUrl: "" }];
  }
  const allCastAndCrew = [...parsedCrew, ...parsedCast];

  return (
    <div className="page-transition">
      {/* ── HERO BACKDROP ── */}
      <section className="hero-backdrop" style={{ minHeight: "85vh", position: "relative", overflow: "hidden" }}>
        {videoId ? (
          <HeroTrailer videoId={videoId} title={movie.title} />
        ) : (
          <img className="hero-backdrop-img" src={backdropUrl} alt={movie.title} style={{ zIndex: 0 }} />
        )}
        <div className="hero-backdrop-overlay" style={{ zIndex: 1, position: "absolute", top: 0, left: 0, width: "100%", height: "100%", background: "linear-gradient(to right, var(--bg-base) 0%, rgba(8,8,16,0.75) 40%, rgba(8,8,16,0.1) 100%), linear-gradient(to top, var(--bg-base) 0%, transparent 50%)" }} />

        <div className="hero-content" style={{ paddingBottom: "3rem", zIndex: 2, position: "relative" }}>
          {/* CTA Buttons row */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1.25rem" }}>
            {todayShowtimes.length > 0 ? (
              <a href="#jadwal" style={{ textDecoration: "none" }}>
                <button className="btn-primary" style={{ fontSize: "0.9rem", padding: "0.65rem 1.5rem" }}>
                  🎬 Pilih Sesi Tayang
                </button>
              </a>
            ) : (
              <button className="btn-primary" style={{ opacity: 0.5, cursor: "not-allowed", fontSize: "0.9rem", padding: "0.65rem 1.5rem" }}>
                Belum Ada Jadwal
              </button>
            )}
            <WishlistButton movieId={movie.id} />
            <button aria-label="Bagikan" style={{ width: "38px", height: "38px", borderRadius: "50%", background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)", color: "white", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.9rem" }}>🔗</button>
          </div>

          {/* Title */}
          <h1 style={{ fontSize: "clamp(2rem, 5vw, 3.5rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: "1rem", letterSpacing: "-0.02em", color: "#fff", textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}>
            {movie.title}
          </h1>

          {/* Ratings Row — IMDb → RT → Metacritic → Durasi → HD → Genre → Status */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center", marginBottom: "1rem" }}>

            {/* ⭐ IMDb Rating */}
            {movie.rating && (
              <span className="badge badge-gold" style={{ fontSize: "0.8rem" }}
                title={`IMDb Rating: ${movie.rating}/10`}>
                ⭐ {movie.rating} / 10
              </span>
            )}

            {/* 🍅 Rotten Tomatoes — fresh/rotten logic */}
            {rtBadge && movie.rottenTomatoes && (
              <span
                title={`Rotten Tomatoes: ${movie.rottenTomatoes} — ${parseInt(movie.rottenTomatoes) >= 60 ? 'Fresh 🍅' : 'Rotten 🤢'}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: rtBadge.bg,
                  color: rtBadge.color,
                  border: `1px solid ${rtBadge.border}`,
                }}
              >
                {rtBadge.icon} {movie.rottenTomatoes}
              </span>
            )}

            {/* Ⓜ Metacritic — color-coded by score */}
            {mcBadge && movie.metacritic && (
              <span
                title={`Metacritic: ${movie.metacritic}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                  padding: '0.2rem 0.6rem',
                  borderRadius: '999px',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  background: mcBadge.bg,
                  color: mcBadge.color,
                  border: `1px solid ${mcBadge.border}`,
                }}
              >
                Ⓜ {movie.metacritic}
              </span>
            )}

            {/* ⏱ Durasi */}
            {movie.durationMin && (
              <span className="badge badge-muted" style={{ fontSize: "0.8rem" }}>
                ⏱ {durationHours}h {durationMins}m
              </span>
            )}

            {/* HD */}
            <span className="badge badge-muted" style={{ fontSize: "0.8rem" }}>HD</span>

            {/* Genre / Kategori */}
            {(movie.category || movie.genre) && (
              <span className="badge badge-accent" style={{ fontSize: "0.8rem" }}>
                {movie.genre || movie.category?.name}
              </span>
            )}

            {/* Status tayang */}
            {movie.status === "NOW_PLAYING" && (
              <span className="badge badge-now-playing" style={{ borderRadius: "999px", fontSize: "0.8rem" }}>Sedang Tayang</span>
            )}
          </div>

          {/* Synopsis (short, 3 lines) */}
          {movie.synopsis && (
            <p style={{ color: "rgba(255,255,255,0.75)", lineHeight: 1.7, fontSize: "0.9rem", maxWidth: "520px", display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
              {movie.synopsis}
            </p>
          )}
        </div>
      </section>

      {/* ── AKTOR & KRU (full width below hero) ── */}
      {allCastAndCrew.length > 0 && (
        <section style={{ padding: "2rem 4rem 1.5rem", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "1.25rem", color: "var(--text-primary)" }}>
            Aktor & Kru
          </h2>
          <div className="cast-scroll">
            {allCastAndCrew.map((person, i) => (
              <div key={i} className="cast-item">
                {person.imageUrl ? (
                  <img src={person.imageUrl} alt={person.name} className="cast-avatar" style={{ objectFit: "cover" }} />
                ) : (
                  <div className="cast-avatar" style={{ fontSize: "1.8rem", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    {person.role?.toLowerCase().includes("director") || person.role?.toLowerCase().includes("sutradara") ? "🎬" : "👤"}
                  </div>
                )}
                <span className="cast-name">{person.name}</span>
                <span className="cast-role">{person.role}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ── MAIN CONTENT: Info (left) + Schedule (right) ── */}
      <div style={{ padding: "2rem 4rem 4rem", display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>

        {/* ── LEFT COLUMN: Sinopsis + Info Penayangan ── */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* Sinopsis */}
          <section>
            <h2 style={{ fontSize: "1.1rem", fontWeight: 700, marginBottom: "0.875rem", color: "var(--text-primary)" }}>Sinopsis</h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.9rem" }}>
              {movie.synopsis || "Belum ada sinopsis untuk film ini."}
            </p>
          </section>

          {/* Info Penayangan Grid */}
          <section>
            <div className="info-penayangan-grid">
              <div className="info-penayangan-cell">
                <div className="info-penayangan-label">🎞 Format</div>
                <div className="info-penayangan-value">
                  <span className="badge badge-accent" style={{ fontSize: "0.7rem", marginRight: "0.4rem" }}>Premiere</span>2D
                </div>
              </div>
              <div className="info-penayangan-cell">
                <div className="info-penayangan-label">🔞 Rating Usia</div>
                <div className="info-penayangan-value" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ background: "var(--primary)", color: "white", padding: "0.1rem 0.5rem", borderRadius: "0.3rem", fontSize: "0.85rem", fontWeight: 800 }}>13+</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Remaja</span>
                </div>
              </div>
              <div className="info-penayangan-cell">
                <div className="info-penayangan-label">⏱ Durasi</div>
                <div className="info-penayangan-value">
                  {movie.durationMin ? `${durationHours} jam ${durationMins} menit` : "—"}
                </div>
              </div>
              <div className="info-penayangan-cell">
                <div className="info-penayangan-label">🌐 Bahasa</div>
                <div className="info-penayangan-value" style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><span style={{ color: "#22c55e" }}>●</span> Inggris</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><span style={{ color: "#22c55e" }}>●</span> Indonesia (Dub)</span>
                </div>
              </div>
              <div className="info-penayangan-cell">
                <div className="info-penayangan-label">💬 Subtitel</div>
                <div className="info-penayangan-value" style={{ display: "flex", flexDirection: "column", gap: "0.2rem" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><span style={{ color: "#22c55e" }}>●</span> Indonesia</span>
                  <span style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}><span style={{ color: "#3b82f6" }}>●</span> English</span>
                </div>
              </div>
              <div className="info-penayangan-cell">
                <div className="info-penayangan-label">📅 Jadwal Tayang</div>
                <div className="info-penayangan-value" style={{ fontSize: "0.82rem" }}>
                  Hari Ini, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                  {todayShowtimes.length > 0 && (
                    <span className="badge badge-now-playing" style={{ marginLeft: "0.4rem", fontSize: "0.65rem" }}>
                      {todayShowtimes.length} Sesi
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* ── RIGHT COLUMN: Date + Time Picker ── */}
        <ShowtimeSelector movieTitle={movie.title} movieId={movie.id} showtimes={movie.showtimes} />
      </div>
    </div>
  );
}
