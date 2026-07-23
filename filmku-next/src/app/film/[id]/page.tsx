import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import WishlistButton from "./WishlistButton";
import ShowtimeSelector from "./ShowtimeSelector";
import HeroTrailer from "./HeroTrailer";
import RatingBadges from "@/components/RatingBadges";

// ───────────────────────────────────────────────────────────────────
// DUMMY SHOWTIME GENERATOR — Opsi B (on-the-fly, idempotent)
//
// Jalan setiap kali halaman detail film diakses untuk film NOW_PLAYING.
// • Cleanup: hapus showtime yang sudah lewat (< tengah malam hari ini).
// • Generate: buat showtime untuk H+0 s/d H+6 (7 hari) jika belum ada.
// • Idempotent: cek existing sebelum insert — tidak akan duplikat.
// ─────────────────────────────────────────────────────────────────────────

const DUMMY_SLOTS   = [
  { hour: 13, minute: 0  },
  { hour: 16, minute: 0  },
  { hour: 19, minute: 0  },
  { hour: 21, minute: 30 },
];
const DUMMY_STUDIOS = ['Studio 1', 'Studio 2', 'Studio 3'];
const DUMMY_PRICE   = 50_000;
const DUMMY_DAYS    = 7; // H+0 … H+6

async function ensureDummyShowtimes(movieId: string): Promise<void> {
  try {
    // ─ 1. Tentukan "tengah malam hari ini" (WIB = UTC+7) ───────────────
    const nowUtc    = new Date();
    const wibOffset = 7 * 60; // menit
    const todayWib  = new Date(nowUtc.getTime() + wibOffset * 60_000);
    const midnightWib = new Date(
      todayWib.getUTCFullYear(),
      todayWib.getUTCMonth(),
      todayWib.getUTCDate(),
      0, 0, 0, 0
    );
    const midnightUtc = new Date(midnightWib.getTime() - wibOffset * 60_000);

    // ─ 2. Cleanup showtime expired ──────────────────────────────────
    // WAJIB hapus Seat dulu sebelum Showtime (FK constraint)
    const expiredShowtimes = await prisma.showtime.findMany({
      where: { movieId, startTime: { lt: midnightUtc } },
      select: { id: true },
    });
    if (expiredShowtimes.length > 0) {
      const expiredIds = expiredShowtimes.map(s => s.id);
      await prisma.seat.deleteMany({ where: { showtimeId: { in: expiredIds } } });
      await prisma.showtime.deleteMany({ where: { id: { in: expiredIds } } });
    }

    // ─ 3. Build daftar semua startTime yang harus ada (28 slot) ─────────
    const targetSlots: { startTime: Date; studio: string; price: number }[] = [];
    let studioIdx = 0;

    for (let day = 0; day < DUMMY_DAYS; day++) {
      for (const slot of DUMMY_SLOTS) {
        const slotWib = new Date(
          todayWib.getUTCFullYear(),
          todayWib.getUTCMonth(),
          todayWib.getUTCDate() + day,
          slot.hour,
          slot.minute,
          0, 0
        );
        const slotUtc = new Date(slotWib.getTime() - wibOffset * 60_000);
        targetSlots.push({
          startTime: slotUtc,
          studio:    DUMMY_STUDIOS[studioIdx % DUMMY_STUDIOS.length],
          price:     DUMMY_PRICE,
        });
        studioIdx++;
      }
    }

    // ─ 4. Cek existing dalam range H+0 … H+7 ───────────────────────
    const rangeEnd = new Date(midnightUtc.getTime() + DUMMY_DAYS * 24 * 3600_000);
    const existing = await prisma.showtime.findMany({
      where: { movieId, startTime: { gte: midnightUtc, lt: rangeEnd } },
      select: { startTime: true },
    });
    const existingSet = new Set(existing.map(st => st.startTime.toISOString()));

    // ─ 5. Insert hanya slot yang belum ada ─────────────────────────
    const toInsert = targetSlots.filter(
      s => !existingSet.has(s.startTime.toISOString())
    );
    if (toInsert.length > 0) {
      await prisma.showtime.createMany({
        data: toInsert.map(s => ({
          movieId,
          startTime: s.startTime,
          studio:    s.studio,
          price:     s.price,
        })),
        skipDuplicates: true,
      });
    }
  } catch (err) {
    // Jangan crash halaman — dummy showtime bersifat best-effort
    console.error('[ensureDummyShowtimes] Error (non-fatal):', err);
  }
}

export default async function MovieDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const movie = await prisma.movie.findUnique({
    where: { id },
    include: { category: true, showtimes: true },
  });

  if (!movie) notFound();

  // Generate dummy jadwal jika film sedang tayang & belum ada jadwal (Opsi B)
  // Cleanup otomatis jadwal expired + fill H+0 s/d H+6 jika kosong
  if (movie.status === 'NOW_PLAYING') {
    await ensureDummyShowtimes(movie.id);
  }

  // Re-fetch showtimes setelah generate supaya ShowtimeSelector dapat data terbaru
  const freshShowtimes = await prisma.showtime.findMany({
    where: { movieId: id },
    orderBy: { startTime: 'asc' },
  });

  let videoId: string | null = null;
  if (movie.trailerUrl) {
    videoId = movie.trailerUrl;
    const match = movie.trailerUrl.match(/(?:v=|\/embed\/|youtu\.be\/)([^&?\/]+)/);
    if (match) videoId = match[1];
  }

  const backdropUrl = movie.posterUrl || "https://image.tmdb.org/t/p/original/tElnmtQ6snFIg4VfS768kK9rS9X.jpg";
  const durationHours = movie.durationMin ? Math.floor(movie.durationMin / 60) : null;
  const durationMins = movie.durationMin ? movie.durationMin % 60 : null;
  // freshShowtimes sudah di-fetch setelah generate di atas
  const todayShowtimes = freshShowtimes;

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

          {/* Ratings Row — satu baris horizontal sesuai referensi PHP */}
          <RatingBadges
            rating={movie.rating}
            rottenTomatoes={movie.rottenTomatoes}
            metacritic={movie.metacritic}
            durationMin={movie.durationMin}
            genre={movie.genre}
            status={movie.status}
          />

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
          <h2 style={{ fontSize: "1.25rem", fontWeight: 800, marginBottom: "0.25rem", color: "var(--text-primary)" }}>
            Aktor & Kru
          </h2>
          <p style={{ fontSize: "0.78rem", color: "rgba(255,255,255,0.35)", marginBottom: "1.25rem" }}>
            Klik foto untuk melihat profil lengkap di TMDB
          </p>
          <div className="cast-scroll">
            {allCastAndCrew.map((person, i) => {
              // Build TMDB profile URL if we have a person ID
              const tmdbUrl = person.tmdbId
                ? `https://www.themoviedb.org/person/${person.tmdbId}`
                : null;

              // Inner card content (avatar + name + role)
              const cardContent = (
                <>
                  {/* Avatar — with hover ring effect via CSS class */}
                  <div className={tmdbUrl ? 'cast-avatar-wrap cast-avatar-wrap--link' : 'cast-avatar-wrap'}>
                    {person.imageUrl ? (
                      <img
                        src={person.imageUrl}
                        alt={person.name}
                        className="cast-avatar"
                        style={{ objectFit: "cover" }}
                      />
                    ) : (
                      <div className="cast-avatar" style={{
                        fontSize: "1.8rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}>
                        {person.role?.toLowerCase().includes("director") || person.role?.toLowerCase().includes("sutradara") ? "🎬" : "👤"}
                      </div>
                    )}
                    {/* Overlay hint when clickable */}
                    {tmdbUrl && (
                      <div className="cast-avatar-overlay">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                          stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                          <polyline points="15 3 21 3 21 9" />
                          <line x1="10" y1="14" x2="21" y2="3" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="cast-name">{person.name}</span>
                  <span className="cast-role">{person.role}</span>
                </>
              );

              // If TMDB ID exists → clickable anchor, else plain div
              return tmdbUrl ? (
                <a
                  key={i}
                  href={tmdbUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cast-item cast-item--linked"
                  title={`Lihat profil ${person.name} di TMDB`}
                >
                  {cardContent}
                </a>
              ) : (
                <div key={i} className="cast-item">
                  {cardContent}
                </div>
              );
            })}
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
        <ShowtimeSelector movieTitle={movie.title} movieId={movie.id} showtimes={freshShowtimes} />
      </div>
    </div>
  );
}
