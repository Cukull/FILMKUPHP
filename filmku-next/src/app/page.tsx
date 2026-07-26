import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FAQSection from "./FAQSection";
import HomeHero from "./HomeHero";
import MovieLaneCard from "@/components/MovieLaneCard";
import MovieLaneCarousel from "@/components/MovieLaneCarousel";
import DomeGallery from "@/components/ui/DomeGallery";
import ScrollFloat from "@/components/ui/ScrollFloat";
import * as LucideIcons from 'lucide-react';
import AdsterraBanner from "@/components/ads/AdsterraBanner";

export const revalidate = 30;

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

// Helper to render Lucide Icon by name
function RenderLucideIcon({ name, size = 24 }: { name: string, size?: number }) {
  const IconComponent = (LucideIcons as any)[name] || LucideIcons.Film;
  return <IconComponent size={size} />;
}

const FEATURES = [
  { icon: "🎬", title: "Pilih Sesi Tayang", desc: "Pilih tanggal, jam, dan studio sesuai keinginan Anda secara real-time." },
  { icon: "🪑", title: "Pilih Kursi Sendiri", desc: "Sistem pemilihan kursi interaktif. Lihat kursi yang tersedia dan pilih favorit Anda." },
  { icon: "⚡", title: "Seamless & Cepat", desc: "Pemesanan selesai dalam hitungan detik. E-ticket langsung terkirim ke email." },
  { icon: "🍿", title: "Snack-Ku FnB", desc: "Pesan makanan & minuman favorit dan dikirim langsung ke kursi Anda." },
];

// Fisher-Yates shuffle to randomize movie order for dynamic UI
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default async function Home() {
  // Fetch ALL movies — grouping is done in JS by sections/genre strings
  const allMovies = await prisma.movie.findMany({
    orderBy: { title: 'asc' },
  });

  // Fetch dynamic sections
  const dashboardSections = await prisma.dashboardSection.findMany({
    orderBy: { order: 'asc' },
  });

  // Group by sections (each movie can belong to multiple sections)
  const sections = dashboardSections
    .map(sec => ({
      name: sec.name,
      icon: sec.icon || 'Film',
      movies: shuffleArray(
        allMovies.filter(m =>
          m.sections
            ?.split(',')
            .map(s => s.trim())
            .includes(sec.name)
        )
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
                <h3 className="movie-lane-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ color: 'var(--primary)' }}><RenderLucideIcon name={section.icon} size={20} /></span> {section.name}
                </h3>
                <Link
                  href="/genre"
                  style={{ fontSize: '0.8rem', color: 'var(--accent)', textDecoration: 'none', fontWeight: 600, letterSpacing: '0.03em' }}
                >
                  Lihat Semua →
                </Link>
              </div>

              <MovieLaneCarousel>
                {section.movies.map(movie => (
                  <MovieLaneCard
                    key={movie.id}
                    id={movie.id}
                    title={movie.title}
                    posterUrl={movie.posterUrl}
                    rating={movie.rating}
                    genre={movie.genre}
                    synopsis={movie.synopsis}
                    status={movie.status}
                  />
                ))}
              </MovieLaneCarousel>
            </div>
          ))
        )}
      </div>

      <AdsterraBanner />

      {/* ── DOME GALLERY ── */}
      <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#000' }}>
        <DomeGallery
          images={allMovies.filter(m => m.posterUrl).slice(0, 25).map(m => ({ src: m.posterUrl, alt: m.title }))}
          fit={0.8}
          minRadius={600}
          maxVerticalRotationDeg={0}
          segments={25}
          dragDampening={2}
          grayscale={false}
        />
      </div>

      {/* ── FEATURE SECTION ── */}
      <section className="feature-section">
        <div style={{ textAlign: 'center', marginBottom: '0.5rem' }}>
          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            scrollStart="center bottom+=50%"
            scrollEnd="bottom bottom-=40%"
            stagger={0.03}
            textStyle={{ fontSize: 'clamp(1.4rem, 3vw, 2rem)', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'normal', display: 'block' }}
          >
            Mengapa Nonton FILMKU?
          </ScrollFloat>

          <ScrollFloat
            animationDuration={1}
            ease="back.out(2)"
            scrollStart="center bottom+=50%"
            scrollEnd="bottom bottom-=40%"
            stagger={0.01}
            textStyle={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.9rem', fontWeight: 400, whiteSpace: 'normal', display: 'block' }}
          >
            Platform bioskop premium dengan pengalaman pesan tiket paling mudah di Indonesia.
          </ScrollFloat>
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
