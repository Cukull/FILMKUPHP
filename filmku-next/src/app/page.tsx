import React from "react";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FAQSection from "./FAQSection";
import HomeHero from "./HomeHero";
import MovieLaneCard from "@/components/MovieLaneCard";
import MovieLaneCarousel from "@/components/MovieLaneCarousel";
import FanCardGallery from "@/components/ui/FanCardGallery";
import ScrollFloat from "@/components/ui/ScrollFloat";
import Image from "next/image";
import * as LucideIcons from 'lucide-react';
import AdsterraBanner from "@/components/ads/AdsterraBanner";
import { inferMovieSections } from "@/utils/sectionMatcher";
import FeaturesSection from "@/components/FeaturesSection";
import BestFilmsSection from "@/components/BestFilmsSection";

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

  const getMovieSections = (m: any): string[] => {
    const raw = m.sections ? m.sections.split(',').map((s: string) => s.trim()) : [];
    const validRaw = raw.filter((s: string) => !s.includes('NEW_RELEASE') && !s.includes('POPULAR'));
    if (validRaw.length > 0) return validRaw;
    return inferMovieSections({
      title: m.title || '',
      genres: m.genre ? m.genre.split(',').map((g: string) => g.trim()) : [],
      synopsis: m.synopsis || '',
      rating: m.rating || 0,
      status: m.status,
    });
  };

  // Filter out "Sorotan Layar Utama" so it only appears in the Hero Carousel, not as a lane
  const displaySections = dashboardSections.filter(sec => sec.name !== 'Sorotan Layar Utama');

  // Group movies by dynamic dashboard sections
  const sections = displaySections.map(sec => ({
    name: sec.name,
    icon: sec.icon || 'Film',
    movies: shuffleArray(
      allMovies.filter(m =>
        getMovieSections(m).includes(sec.name)
      )
    ),
  }));

  const bestFilmSections = sections.filter(sec => sec.name.toLowerCase().includes('film terbaik'));

  // Hero films: all tagged "Sorotan Layar Utama" with a valid trailer
  const heroMovies = allMovies
    .filter(
      m =>
        getMovieSections(m).includes('Sorotan Layar Utama') &&
        m.trailerUrl
    )
    .map(m => ({
      id: m.id,
      title: m.title,
      synopsis: m.synopsis,
      rating: m.rating,
      genre: m.genre,
      posterUrl: m.posterUrl,
      backdropUrl: (m as any).backdropUrl || m.posterUrl,
      trailerVideoId: extractYouTubeId(m.trailerUrl),
    }))
    .filter(m => m.trailerVideoId !== '');

  return (
    <div className="page-transition" style={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', position: 'relative', boxSizing: 'border-box' }}>
      {/* ── HERO BANNER (Carousel) ── */}
      <HomeHero films={heroMovies} />

      {/* ── MOVIE SECTIONS ── */}
      <div style={{ paddingTop: '2.5rem', paddingBottom: '1rem', display: 'flex', flexDirection: 'column', gap: '3rem' }}>
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
          <>
            {sections.map((section, idx) => {
              const isBestFilm = section.name.toLowerCase().includes('film terbaik');

              if (isBestFilm) {
                // Find the first 'film terbaik' index to only render the grouped component once
                const firstBestFilmIndex = sections.findIndex(s => s.name.toLowerCase().includes('film terbaik'));
                if (idx !== firstBestFilmIndex) return null;

                return <BestFilmsSection key="best-films-group" bestFilmSections={bestFilmSections} />;
              }

              // Render regular section
              return (
                <React.Fragment key={section.name}>
                  <div className="movie-lane">
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

                    {section.movies.length > 0 ? (
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
                            sections={movie.sections}
                            country={(movie as any).country}
                            originalLanguage={(movie as any).originalLanguage}
                            mediaType={(movie as any).mediaType}
                          />
                        ))}
                      </MovieLaneCarousel>
                    ) : (
                      <div style={{
                        padding: '1.25rem 2rem',
                        borderRadius: '1rem',
                        background: 'rgba(255,255,255,0.02)',
                        border: '1px dashed rgba(255,255,255,0.08)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.75rem',
                        color: 'rgba(255,255,255,0.4)',
                        fontSize: '0.875rem',
                        marginTop: '0.75rem',
                        marginBottom: '1.5rem'
                      }}>
                        <span>🎬</span>
                        <span>Belum ada film di section <strong>{section.name}</strong></span>
                      </div>
                    )}
                  </div>
                  {/* Show Adsterra Banner after the first and third regular sections */}
                  {(idx === 0 || idx === 2) && <AdsterraBanner />}
                </React.Fragment>
              );
            })}
          </>
        )}
      </div>

      <AdsterraBanner />

      {/* ── TUTORIAL SECTION ── */}
      <div style={{ textAlign: 'center', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
        {/* Subtitle */}
        <ScrollFloat
          animationDuration={1}
          ease="back.out(2)"
          stagger={0.03}
          playOnce
          textStyle={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary, #9ca3af)', textTransform: 'uppercase', letterSpacing: '0.1em', whiteSpace: 'normal', display: 'block', marginBottom: '0.5rem' }}
        >
          Belum Tahu Caranya?
        </ScrollFloat>

        {/* Main heading — two ScrollFloats side by side so "FILMKU" can be red */}
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'baseline', flexWrap: 'wrap', gap: '0 0.3em' }}>
          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            stagger={0.03}
            playOnce
            textStyle={{ fontSize: 'clamp(4rem, 6vw, 5.5rem)', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'nowrap', display: 'inline-block' }}
          >
            Nonton di
          </ScrollFloat>
          <ScrollFloat
            animationDuration={1}
            ease="back.inOut(2)"
            stagger={0.03}
            playOnce
            textStyle={{ fontSize: 'clamp(4rem, 6vw, 5.5rem)', fontWeight: 800, color: '#dc2626', whiteSpace: 'nowrap', display: 'inline-block' }}
          >
            FILMKU
          </ScrollFloat>
        </div>
      </div>
      <div style={{ width: '100%', height: '760px', position: 'relative', backgroundColor: 'transparent', marginBottom: '4rem' }}>
        <FanCardGallery
          loop
          bend={3}
          cardWidth={340}
          cardHeight={510}
          gap={20}
          items={[
            { stepLabel: 'Langkah 1', title: 'Cari & Pilih Film', description: 'Cari dan pilih film, serial, atau drama yang ingin ditonton', image: '/images/tutorial/tutorial-1.png' },
            { stepLabel: 'Langkah 2', title: 'Buka Halaman Film', description: 'Buka halaman detail film/serial/drama tersebut', image: '/images/tutorial/tutorial-2.png' },
            { stepLabel: 'Langkah 3', title: 'Klik Tonton Sekarang', description: 'Klik tombol "Tonton Sekarang" pada halaman film', image: '/images/tutorial/tutorial-3.png' },
            { stepLabel: 'Langkah 4', title: 'Klik Sekali Lagi', description: 'Tirai akan tampil, klik tombol "Tonton Sekarang" sekali lagi (iklan singkat akan muncul)', image: '/images/tutorial/tutorial-4.png' },
            { stepLabel: 'Langkah 5', title: 'Tirai Terbuka', description: 'Tirai akan terbuka, klik tombol play sekali lagi untuk mulai film', image: '/images/tutorial/tutorial-5.png' },
            { stepLabel: 'Langkah 6', title: 'Selamat Menonton!', description: 'Nikmati film pilihanmu di FILMKU', image: '/images/tutorial/tutorial-6.png', showCTA: true },
          ]}
        />
      </div>

      {/* ── FAQ ── */}
      <FAQSection />

      {/* ── BOTTOM BANNER AD ── */}
      <div style={{ paddingBottom: '3rem' }}>
        <AdsterraBanner />
      </div>
    </div>
  );
}

