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
    // ─ 1. Midnight WIB hari ini — pakai pure epoch arithmetic ───────────
    // JANGAN new Date(y,m,d,0,0,0) — itu local TZ (UTC di Vercel) → salah 7 jam!
    const WIB_MS     = 7 * 60 * 60 * 1000;   // 7h dalam ms
    const DAY_MS     = 24 * 60 * 60 * 1000;
    const nowEpoch   = Date.now();            // epoch UTC sekarang
    const wibEpoch   = nowEpoch + WIB_MS;     // epoch "seakan UTC+7"
    // bulatkan ke batas hari WIB → ini EPOCH untuk tengah malam WIB dalam UTC
    const midnightMs = wibEpoch - (wibEpoch % DAY_MS);  // midnight WIB as UTC epoch
    const midnightDate = new Date(midnightMs);

    // Log untuk verifikasi (hapus setelah testing OK)
    console.log(`[showtime] now=${new Date(nowEpoch).toISOString()} midnight-WIB=${midnightDate.toISOString()}`);

    // ─ 2. Cleanup expired (< midnight WIB hari ini) — hapus Seat dulu ───
    const expiredShowtimes = await prisma.showtime.findMany({
      where: { movieId, startTime: { lt: midnightDate } },
      select: { id: true },
    });
    if (expiredShowtimes.length > 0) {
      const ids = expiredShowtimes.map(s => s.id);
      await prisma.seat.deleteMany({ where: { showtimeId: { in: ids } } });
      await prisma.showtime.deleteMany({ where: { id: { in: ids } } });
      console.log(`[showtime] deleted ${ids.length} expired`);
    }

    // ─ 3. Build 28 target slots H+0 … H+6 ──────────────────────────────
    const targetSlots: { startTime: Date; studio: string; price: number }[] = [];
    let si = 0;
    for (let day = 0; day < DUMMY_DAYS; day++) {
      for (const slot of DUMMY_SLOTS) {
        const ms = midnightMs + day * DAY_MS
                 + slot.hour * 3_600_000 + slot.minute * 60_000;
        targetSlots.push({
          startTime: new Date(ms),
          studio:    DUMMY_STUDIOS[si % DUMMY_STUDIOS.length],
          price:     DUMMY_PRICE,
        });
        si++;
      }
    }
    console.log(`[showtime] slots[0]=${targetSlots[0].startTime.toISOString()} (=${DUMMY_SLOTS[0].hour}:00 WIB)`);

    // ─ 4. Cek existing H+0 … H+7 ────────────────────────────────────────
    const rangeEnd = new Date(midnightMs + DUMMY_DAYS * DAY_MS);
    const existing = await prisma.showtime.findMany({
      where: { movieId, startTime: { gte: midnightDate, lt: rangeEnd } },
      select: { startTime: true },
    });
    const existingSet = new Set(existing.map(st => st.startTime.toISOString()));

    // ─ 5. Insert hanya yang belum ada ────────────────────────────────────
    const toInsert = targetSlots.filter(s => !existingSet.has(s.startTime.toISOString()));
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
      console.log(`[showtime] inserted ${toInsert.length} new slots`);
    }
  } catch (err) {
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

  // ─── Parse Cast & Crew ───────────────────────────────────────────
  // Data di DB bisa dua bentuk:
  //   A. JSON array (dari fetch-movie API) → [{tmdbId, name, role, imageUrl}, ...]
  //   B. Plain string (dari input manual / OMDB fallback) → "Tom Hanks, Robin Wright"
  //
  // Untuk B: split by koma, buat entry per orang tanpa imageUrl.
  // tmdbUrl: jika ada tmdbId → direct profile; jika tidak → TMDB search by name
  //          sehingga SEMUA card selalu clickable.
  function parsePeople(raw: string | null | undefined, defaultRole: string) {
    if (!raw) return [];
    try {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr)) return arr;
    } catch { /* bukan JSON — lanjut ke split */ }
    // Plain string: split by koma
    return raw
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
      .map(name => ({ name, role: defaultRole, imageUrl: '', tmdbId: null }));
  }

  const parsedCrew = parsePeople(movie.director, 'Sutradara / Kru');
  const parsedCast = parsePeople(movie.cast, 'Pemeran');
  const allCastAndCrew = [...parsedCrew, ...parsedCast];


  return (
    <div className="page-transition">
      {/* ── HERO BACKDROP ── */}
      <section className="hero-backdrop" style={{ minHeight: "85vh", position: "relative", overflow: "hidden", marginTop: "-72px" }}>
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
              // Build TMDB URL:
              // • Ada tmdbId   → direct profile page
              // • Tidak ada    → TMDB search by name (selalu berfungsi)
              const tmdbUrl = person.tmdbId
                ? `https://www.themoviedb.org/person/${person.tmdbId}`
                : `https://www.themoviedb.org/search/person?query=${encodeURIComponent(person.name)}`;

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

              // tmdbUrl selalu ada (direct profile jika ada tmdbId, search by name jika tidak)
              // → semua card selalu berupa <a> yang bisa diklik
              return (
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
