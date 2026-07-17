import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FAQSection from "./FAQSection";
import HomeHero from "./HomeHero";

export const revalidate = 30;

// Ordered list — same names used in FilmForm checkboxes
const SECTION_ORDER = [
  'Sorotan Layar Utama',
  'Rilisan Tersegar',
  'Lagi Viral Nih',
  'Tangga Teratas Box Office',
  'Pesona Asia & K-Drama',
  'Karya Anak Bangsa',
  'Serem Banget',
  'Yang Akan Datang',
  'Perang',
];

const SECTION_ICONS: Record<string, string> = {
  'Sorotan Layar Utama': '🎬',
  'Rilisan Tersegar': '🆕',
  'Lagi Viral Nih': '🔥',
  'Tangga Teratas Box Office': '🏆',
  'Pesona Asia & K-Drama': '🌸',
  'Karya Anak Bangsa': '🇮🇩',
  'Serem Banget': '👻',
  'Yang Akan Datang': '🔜',
  'Perang': '⚔️',
};

// Extract 11-char YouTube video ID from any trailerUrl format
export function extractYouTubeId(url: string | null | undefined): string {
  if (!url) return '';
  const embedMatch = url.match(/youtube\.com\/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  return '';
}

const FEATURES = [
  { icon: "🎬", title: "Pilih Sesi Tayang", desc: "Pilih tanggal, jam, dan studio sesuai keinginan Anda secara real-time." },
  { icon: "🪑", title: "Pilih Kursi Sendiri", desc: "Sistem pemilihan kursi interaktif. Lihat kursi yang tersedia dan pilih favorit Anda." },
  { icon: "⚡", title: "Seamless & Cepat", desc: "Pemesanan selesai dalam hitungan detik. E-ticket langsung terkirim ke email." },
  { icon: "🍿", title: "Snack-Ku FnB", desc: "Pesan makanan & minuman favorit dan dikirim langsung ke kursi Anda." },
];

export default async function Home() {
  // Fetch ALL movies — grouping is done in JS by sections/genre strings
  const allMovies = await prisma.movie.findMany({
    orderBy: { title: 'asc' },
  });

  // Group by sections (each movie can belong to multiple sections)
  const sections = SECTION_ORDER
    .map(name => ({
      name,
      icon: SECTION_ICONS[name] ?? '🎬',
      movies: allMovies.filter(m =>
        m.sections
          ?.split(',')
          .map(s => s.trim())
          .includes(name)
      ),
    }))
    .filter(s => s.movies.length > 0);

  // Hero films: all tagged "Sorotan Layar Utama" with a valid trailer
  const heroMovies = allMovies
    .filter(
      m =>
        m.sections?.split(',').map(s => s.trim()).includes('Sorotan Layar Utama') &&
        m.trailerUrl
    )
    .map(m => ({
      id: m.id,
      title: m.title,
      synopsis: m.synopsis,
      rating: m.rating,
      genre: m.genre,
      trailerVideoId: extractYouTubeId(m.trailerUrl),
    }))
    .filter(m => m.trailerVideoId !== '');

  return (
    <div>
      {/* ── HERO BANNER (Carousel) ── */}
      <HomeHero films={heroMovies} />

      {/* ── MOVIE SECTIONS ── */}
      <div style={{ paddingTop: '2.5rem', paddingBottom: '1rem' }}>
        {sections.length === 0 ? (
          <div style={{ padding: '4rem 2rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎬</div>
            <p style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Belum ada film yang dikategorikan
            </p>
            <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.25)' }}>
              Tambah film di Admin Panel, lalu pilih Section untuk menampilkannya di sini.
            </p>
          </div>
        ) : (
          sections.map(section => (
            <div key={section.name} className="movie-lane">
              <div className="movie-lane-header">
                <h3 className="movie-lane-title">
                  {section.icon} {section.name}
                </h3>
                <Link
                  href="/genre"
                  style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.03em' }}
                >
                  Lihat Semua →
                </Link>
              </div>

              <div className="movie-lane-scroll">
                {section.movies.map(movie => (
                  <Link href={`/film/${movie.id}`} key={movie.id} style={{ textDecoration: 'none' }}>
                    <div className="movie-lane-card">
                      <span className={`movie-status-badge ${movie.status === 'NOW_PLAYING' ? 'badge-now-playing' : 'badge-upcoming'}`}>
                        {movie.status === 'NOW_PLAYING' ? 'Tayang' : 'Segera'}
                      </span>
                      <img
                        src={movie.posterUrl || 'https://via.placeholder.com/160x240?text=No+Poster'}
                        alt={movie.title}
                        loading="lazy"
                      />
                      <div className="card-info">
                        <h4>{movie.title}</h4>
                        <p>{movie.rating ? `⭐ ${movie.rating}` : (movie.genre?.split(',')[0]?.trim() ?? '')}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))
        )}
      </div>

      {/* ── FEATURE SECTION ── */}
      <section className="feature-section">
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <h2 style={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text-primary)' }}>
            Mengapa Nonton FILMKU?
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem' }}>
            Platform bioskop premium dengan pengalaman pesan tiket paling mudah di Indonesia.
          </p>
        </div>
        <div className="feature-grid">
          {FEATURES.map((f, i) => (
            <div key={i} className="feature-card">
              <span className="feature-icon">{f.icon}</span>
              <div className="feature-title">{f.title}</div>
              <p className="feature-desc">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQSection />
    </div>
  );
}
