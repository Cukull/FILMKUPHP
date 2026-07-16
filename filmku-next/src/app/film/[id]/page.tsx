import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import WishlistButton from "./WishlistButton";



// Generate next 7 days for date picker
function getNext7Days() {
  const days = [];
  const dayNames = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];
  const monthNames = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      num: d.getDate(),
      day: dayNames[d.getDay()],
      month: monthNames[d.getMonth()],
      isToday: i === 0,
    });
  }
  return days;
}

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { category: true, showtimes: true },
  });

  if (!movie) notFound();

  const days = getNext7Days();

  // Build YouTube embed URL
  let embedUrl: string | null = null;
  if (movie.trailerUrl) {
    // Check if it's already an embed URL or video ID
    let videoId = movie.trailerUrl;
    const match = movie.trailerUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?\/]+)/);
    if (match) {
      videoId = match[1];
    }
    if (videoId) {
      embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${videoId}&modestbranding=1`;
    }
  }

  // Use posterUrl as backdrop fallback
  const backdropUrl = movie.posterUrl || "https://image.tmdb.org/t/p/original/tElnmtQ6snFIg4VfS768kK9rS9X.jpg";

  const durationHours = movie.durationMin ? Math.floor(movie.durationMin / 60) : null;
  const durationMins = movie.durationMin ? movie.durationMin % 60 : null;

  const todayShowtimes = movie.showtimes;
  const totalSeats = 40;

  // Parse Cast and Crew
  let parsedCrew: any[] = [];
  try {
    if (movie.director) parsedCrew = JSON.parse(movie.director);
  } catch (e) {
    if (movie.director) parsedCrew = [{ name: movie.director, role: "Sutradara", imageUrl: "" }];
  }

  let parsedCast: any[] = [];
  try {
    if (movie.cast) parsedCast = JSON.parse(movie.cast);
  } catch (e) {
    if (movie.cast) parsedCast = [{ name: movie.cast, role: "Pemeran", imageUrl: "" }];
  }

  const allCastAndCrew = [...parsedCrew, ...parsedCast];

  return (
    <div className="page-transition">
      {/* ── HERO BACKDROP ── */}
      <section className="hero-backdrop" style={{ minHeight: "85vh", position: 'relative', overflow: 'hidden' }}>
        {embedUrl ? (
          <div style={{ position: 'absolute', width: '100vw', height: '56.25vw', minHeight: '100vh', minWidth: '177.77vh', transform: 'translate(-50%, -50%)', top: '50%', left: '50%', zIndex: 0, pointerEvents: 'none' }}>
            <iframe 
              src={embedUrl}
              style={{ width: '100%', height: '100%', border: 'none', transform: 'scale(1.2)' }}
              allow="autoplay; encrypted-media"
              title={movie.title}
            />
          </div>
        ) : (
          <img className="hero-backdrop-img" src={backdropUrl} alt={movie.title} style={{ zIndex: 0 }} />
        )}
        <div className="hero-backdrop-overlay" style={{ zIndex: 1, position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'linear-gradient(to right, var(--bg-base) 0%, rgba(8,8,16,0.8) 40%, rgba(8,8,16,0.2) 100%), linear-gradient(to top, var(--bg-base) 0%, transparent 40%)' }} />

        <div className="hero-content" style={{ paddingBottom: "4rem" }}>
          {/* Badges */}
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "1.25rem", zIndex: 2, position: 'relative' }}>
            {movie.rating && <span className="badge badge-gold">⭐ {movie.rating} / 10</span>}
            {movie.rottenTomatoes && <span className="badge" style={{ background: '#fa320a', color: 'white' }}>🍅 {movie.rottenTomatoes}</span>}
            {movie.metacritic && <span className="badge" style={{ background: '#f5c518', color: 'black' }}>Ⓜ️ {movie.metacritic}</span>}
            {movie.durationMin && <span className="badge badge-muted">⏱ {durationHours}j {durationMins}m</span>}
            <span className="badge badge-muted">HD</span>
            {(movie.category || movie.genre) && <span className="badge badge-accent">{movie.genre || movie.category?.name}</span>}
            {movie.status === "NOW_PLAYING" && <span className="badge badge-now-playing" style={{ borderRadius: "999px" }}>Sedang Tayang</span>}
          </div>

          {/* Title */}
          <h1 style={{
            fontSize: "clamp(2rem, 5vw, 3.5rem)",
            fontWeight: 900,
            lineHeight: 1.1,
            marginBottom: "1.25rem",
            letterSpacing: "-0.02em",
            color: "#fff",
            textShadow: "0 2px 20px rgba(0,0,0,0.5)",
          }}>
            {movie.title}
          </h1>

          {/* Synopsis (short) */}
          {movie.synopsis && (
            <p style={{
              color: "rgba(255,255,255,0.75)",
              lineHeight: 1.7,
              fontSize: "0.95rem",
              marginBottom: "2rem",
              maxWidth: "520px",
              display: "-webkit-box",
              WebkitLineClamp: 3,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}>
              {movie.synopsis}
            </p>
          )}

          {/* CTA Buttons */}
          <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", alignItems: "center" }}>
            {todayShowtimes.length > 0 ? (
              <a href="#jadwal" style={{ textDecoration: "none" }}>
                <button className="btn-primary" style={{ fontSize: "1rem", padding: "0.85rem 2rem" }}>
                  🎬 Pilih Sesi Tayang
                </button>
              </a>
            ) : (
              <button className="btn-primary" style={{ opacity: 0.5, cursor: "not-allowed" }}>
                Belum Ada Jadwal
              </button>
            )}

            {/* Wishlist + Share icons */}
            <WishlistButton movieId={movie.id} />
            <button aria-label="Bagikan" style={{
              width: "44px", height: "44px", borderRadius: "50%",
              background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
              color: "white", fontSize: "1rem", cursor: "pointer", display: "flex",
              alignItems: "center", justifyContent: "center",
            }}>🔗</button>
          </div>
        </div>
      </section>

      {/* ── INFO BAR ── */}
      <div className="detail-infobar">
        <div className="detail-infobar-meta">
          <span className="detail-infobar-title">{movie.title}</span>
          {todayShowtimes[0] && (
            <>
              <span className="detail-infobar-item">
                📅 Hari Ini, {new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
              </span>
              <span className="detail-infobar-item">
                🕐 {new Date(todayShowtimes[0].startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
              </span>
              <span className="detail-infobar-item">
                🎭 {todayShowtimes[0].studio}
              </span>
            </>
          )}
        </div>
        {todayShowtimes[0] && (
          <Link href={`/kursi/${todayShowtimes[0].id}`} style={{ textDecoration: "none", flexShrink: 0 }}>
            <button className="btn-primary" style={{ padding: "0.6rem 1.5rem", fontSize: "0.9rem" }}>
              → Konfirmasi & Pesan Tiket
            </button>
          </Link>
        )}
      </div>

      {/* ── MAIN CONTENT ── */}
      <div className="detail-two-col" style={{ padding: "2.5rem 4rem", display: "flex", gap: "2.5rem", alignItems: "flex-start" }}>

        {/* ── LEFT COLUMN ── */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Sinopsis Lengkap */}
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)" }}>
              Sinopsis
            </h2>
            <p style={{ color: "var(--text-secondary)", lineHeight: 1.8, fontSize: "0.95rem" }}>
              {movie.synopsis || "Belum ada sinopsis untuk film ini."}
            </p>
          </section>

          {/* Aktor & Kru */}
          {allCastAndCrew.length > 0 && (
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1.25rem", color: "var(--text-primary)" }}>
                Aktor & Kru
              </h2>
              <div className="cast-scroll">
                {allCastAndCrew.map((person, i) => (
                  <div key={i} className="cast-item">
                    {person.imageUrl ? (
                      <img src={person.imageUrl} alt={person.name} className="cast-avatar" style={{ objectFit: 'cover' }} />
                    ) : (
                      <div className="cast-avatar" style={{ fontSize: "1.8rem", display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {person.role.toLowerCase().includes('director') || person.role.toLowerCase().includes('sutradara') ? "🎬" : "👤"}
                      </div>
                    )}
                    <span className="cast-name">{person.name}</span>
                    <span className="cast-role">{person.role}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trailer */}
          {embedUrl && (
            <section style={{ marginBottom: "2.5rem" }}>
              <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)" }}>
                🎞 Trailer Official
              </h2>
              <div style={{
                position: "relative", paddingBottom: "56.25%", height: 0,
                overflow: "hidden", borderRadius: "0.75rem",
                border: "1px solid var(--glass-border)", boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
              }}>
                <iframe
                  src={embedUrl}
                  style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  allow="autoplay; encrypted-media; fullscreen"
                  allowFullScreen
                />
              </div>
            </section>
          )}



        {/* ── INFO PENAYANGAN ── */}
          <section style={{ marginBottom: "2.5rem" }}>
            <h2 style={{ fontSize: "1.2rem", fontWeight: 700, marginBottom: "1rem", color: "var(--text-primary)" }}>
              ℹ Info Penayangan
            </h2>
            <div className="info-penayangan-grid">
              <div className="info-penayangan-cell">
                <div className="info-penayangan-label">🎞 Format</div>
                <div className="info-penayangan-value">
                  <span className="badge badge-accent" style={{ fontSize: "0.7rem", marginRight: "0.4rem" }}>Premiere</span>
                  2D
                </div>
              </div>
              <div className="info-penayangan-cell">
                <div className="info-penayangan-label">🔞 Rating Usia</div>
                <div className="info-penayangan-value" style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ background: "var(--primary)", color: "white", padding: "0.1rem 0.5rem", borderRadius: "0.3rem", fontSize: "0.85rem", fontWeight: 800 }}>17+</span>
                  <span style={{ color: "var(--text-secondary)", fontSize: "0.8rem" }}>Dewasa</span>
                </div>
              </div>
              <div className="info-penayangan-cell">
                <div className="info-penayangan-label">⏱ Durasi</div>
                <div className="info-penayangan-value">
                  {movie.durationMin
                    ? `${durationHours} jam ${durationMins} menit`
                    : "—"}
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
                    <span className="badge badge-gold" style={{ marginLeft: "0.4rem", fontSize: "0.65rem" }}>
                      {todayShowtimes.length} Sesi Tayang
                    </span>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* ── RIGHT COLUMN: Date + Time Picker ── */}
        <div id="jadwal" style={{ width: "340px", flexShrink: 0 }}>
          <div className="glass-static" style={{ padding: "1.5rem" }}>
            {/* Date Picker */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
              <span style={{ fontSize: "0.8rem" }}>📅</span>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>Pilih Tanggal Tayang</h3>
            </div>
            <div className="date-picker-scroll">
              {days.map((day, i) => (
                <div key={i} className={`date-pill ${day.isToday ? "active" : ""}`}>
                  <span className="day-num">{day.num}</span>
                  <span className="day-label">{day.day}</span>
                  <span className="day-label" style={{ fontSize: "0.6rem" }}>{day.month}</span>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: "1px", background: "var(--glass-border)", margin: "1.25rem 0" }} />

            {/* Time + Studio Picker */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "0.75rem" }}>
              <span style={{ fontSize: "0.8rem" }}>🕐</span>
              <h3 style={{ fontSize: "0.9rem", fontWeight: 700, color: "var(--text-primary)" }}>Pilih Jam Sesi & Lokasi Studio</h3>
            </div>

            {todayShowtimes.length > 0 ? (
              <div className="session-grid">
                {todayShowtimes.map((st) => {
                  const availableCount = totalSeats - Math.floor(Math.random() * 15);
                  const availClass = availableCount > 20 ? "ok" : availableCount > 5 ? "warn" : "full";
                  const availText = availableCount > 5
                    ? `Tersisa ${availableCount} kursi`
                    : "Hampir Penuh!";
                  return (
                    <Link href={`/kursi/${st.id}`} key={st.id} className="session-pill" style={{ textDecoration: "none" }}>
                      <span className="session-time">
                        {new Date(st.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                      <span className="session-studio">{st.studio}</span>
                      <span className={`session-avail ${availClass}`}>{availText}</span>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state">
                <span className="empty-icon">🎭</span>
                <p>Belum ada jadwal tayang tersedia.</p>
              </div>
            )}
          </div>

          {/* Back button */}
          <div style={{ marginTop: "1rem" }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <button className="btn-outline" style={{ width: "100%" }}>
                ← Kembali ke Beranda
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
