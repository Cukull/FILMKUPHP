import { prisma } from "@/lib/prisma";
import Link from "next/link";
import FAQSection from "./FAQSection";
import HomeHero from "./HomeHero";

export const revalidate = 60;

// Hero film — bisa diganti dengan film featured dari DB nanti
const HERO_FILM = {
  title: "Obsession (2026)",
  synopsis:
    "After breaking the mysterious \"One Wish Willow\" to win his crush's heart, a hopeless romantic finds himself getting exactly what he asked for — but soon discovers… MORE",
  rating: "8.3",
  genre: "Horror",
  trailerUrl: "dQw4w9WgXcQ",
};

const FEATURES = [
  {
    icon: "🎬",
    title: "Pilih Sesi Tayang",
    desc: "Pilih tanggal, jam, dan studio sesuai keinginan Anda secara real-time.",
  },
  {
    icon: "🪑",
    title: "Pilih Kursi Sendiri",
    desc: "Sistem pemilihan kursi interaktif. Lihat kursi yang tersedia dan pilih favorit Anda.",
  },
  {
    icon: "⚡",
    title: "Seamless & Cepat",
    desc: "Pemesanan selesai dalam hitungan detik. E-ticket langsung terkirim ke email.",
  },
  {
    icon: "🍿",
    title: "Snack-Ku FnB",
    desc: "Pesan makanan & minuman favorit dan dikirim langsung ke kursi Anda.",
  },
];

export default async function Home() {
  const categories = await prisma.category.findMany({
    include: {
      movies: {
        take: 10,
      },
    },
  });

  return (
    <div>
      {/* ── HERO BANNER ── */}
      <HomeHero
        trailerVideoId={HERO_FILM.trailerUrl}
        title={HERO_FILM.title}
        synopsis={HERO_FILM.synopsis}
        rating={HERO_FILM.rating}
        genre={HERO_FILM.genre}
      />

      {/* ── MOVIE LANES PER KATEGORI ── */}
      <div style={{ paddingTop: "2.5rem", paddingBottom: "1rem" }}>
        {categories.map(
          (category) =>
            category.movies.length > 0 && (
              <div key={category.id} className="movie-lane">
                {/* Lane Header */}
                <div className="movie-lane-header">
                  <h3 className="movie-lane-title">{category.name}</h3>
                  <Link
                    href={`/kategori/${category.id}`}
                    style={{
                      fontSize: "0.8rem",
                      color: "var(--accent)",
                      textDecoration: "none",
                      fontWeight: 600,
                      letterSpacing: "0.03em",
                    }}
                  >
                    Lihat Semua →
                  </Link>
                </div>

                {/* Horizontal Scroll Lane */}
                <div className="movie-lane-scroll">
                  {category.movies.map((movie) => (
                    <Link
                      href={`/film/${movie.id}`}
                      key={movie.id}
                      style={{ textDecoration: "none" }}
                    >
                      <div className="movie-lane-card">
                        {/* Status Badge */}
                        <span
                          className={`movie-status-badge ${
                            movie.status === "NOW_PLAYING"
                              ? "badge-now-playing"
                              : "badge-upcoming"
                          }`}
                        >
                          {movie.status === "NOW_PLAYING" ? "Tayang" : "Segera"}
                        </span>

                        {/* Poster */}
                        <img
                          src={
                            movie.posterUrl ||
                            "https://via.placeholder.com/160x240?text=No+Poster"
                          }
                          alt={movie.title}
                          loading="lazy"
                        />

                        {/* Hover Info */}
                        <div className="card-info">
                          <h4>{movie.title}</h4>
                          <p>
                            {movie.rating ? `⭐ ${movie.rating}` : category.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )
        )}
      </div>

      {/* ── FEATURE SECTION ── */}
      <section className="feature-section">
        <div style={{ textAlign: "center", marginBottom: "0.5rem" }}>
          <h2
            style={{
              fontSize: "clamp(1.4rem, 3vw, 2rem)",
              fontWeight: 800,
              color: "var(--text-primary)",
            }}
          >
            Mengapa Nonton FILMKU?
          </h2>
          <p style={{ color: "var(--text-secondary)", marginTop: "0.5rem", fontSize: "0.9rem" }}>
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

      {/* ── FAQ SECTION ── */}
      <FAQSection />
    </div>
  );
}
