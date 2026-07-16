import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import SmoothScroll from "./SmoothScroll";

export const metadata: Metadata = {
  title: "FILMKU | Platform Bioskop Premium",
  description: "Pesan tiket bioskop, streaming trailer, dan nikmati makanan cafe kami secara real-time.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await getSession();
  const initials = session?.name
    ? session.name.split(" ").map((n: string) => n[0]).join("").slice(0, 2).toUpperCase()
    : null;

  return (
    <html lang="id">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body>
        {/* Premium Splash Screen */}
        <div className="splash-container">
          <div className="splash-logo">FILMKU</div>
        </div>

        <SmoothScroll>
          <div className="page-transition">

            {/* ══════════════════ NAVBAR ══════════════════ */}
            <nav className="navbar">
              {/* Kiri: Hamburger + Logo + Nav Links */}
              <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                {/* Hamburger (visual only, mobile) */}
                <button
                  aria-label="Menu"
                  style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", padding: "0.25rem", display: "flex", flexDirection: "column", gap: "5px" }}
                >
                  <span style={{ display: "block", width: "20px", height: "2px", background: "currentColor", borderRadius: "2px" }} />
                  <span style={{ display: "block", width: "20px", height: "2px", background: "currentColor", borderRadius: "2px" }} />
                  <span style={{ display: "block", width: "20px", height: "2px", background: "currentColor", borderRadius: "2px" }} />
                </button>

                {/* Logo */}
                <Link href="/" style={{ textDecoration: "none", flexShrink: 0 }}>
                  <span style={{
                    fontSize: "1.4rem",
                    fontWeight: 900,
                    letterSpacing: "0.06em",
                    color: "var(--accent)",
                    textTransform: "uppercase",
                    textShadow: "0 0 24px var(--primary-glow)",
                    fontFamily: "Inter, sans-serif",
                  }}>
                    FILMKU
                  </span>
                </Link>

                {/* Nav Links */}
                <ul style={{ display: "flex", alignItems: "center", gap: "1.75rem", listStyle: "none", margin: 0, padding: 0 }}>
                  <li><Link href="/" className="nav-link">Beranda</Link></li>
                  <li><Link href="/komunitas" className="nav-link">Cine-Community</Link></li>
                  <li><Link href="/wishlist" className="nav-link">Wishlist</Link></li>
                  <li><Link href="/kategori/genre" className="nav-link">Genre</Link></li>
                  <li><Link href="/cafe" className="nav-link">Snack-Ku</Link></li>
                </ul>
              </div>

              {/* Kanan: Search + Auth */}
              <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                {/* Search Icon */}
                <button
                  aria-label="Cari film"
                  style={{ background: "none", border: "none", color: "var(--text-secondary)", cursor: "pointer", fontSize: "1.1rem", padding: "0.25rem", transition: "color 0.2s ease" }}
                >
                  🔍
                </button>

                {session ? (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <Link href="/admin" className="nav-link" style={{ fontSize: "0.8rem" }}>Dashboard</Link>
                    {/* User Avatar Menu */}
                    <div className="nav-user-menu">
                      <div className="nav-avatar">{initials}</div>
                      <span style={{ fontSize: "0.875rem", fontWeight: 600, color: "var(--text-primary)" }}>
                        {session.name?.split(" ")[0]}
                      </span>
                      <span style={{ color: "var(--text-secondary)", fontSize: "0.75rem" }}>▾</span>
                    </div>
                    <form action={async () => {
                      "use server";
                      const { logoutAction } = await import("@/actions/auth");
                      await logoutAction();
                    }}>
                      <button type="submit" className="btn-outline" style={{ fontSize: "0.8rem", padding: "0.35rem 0.9rem" }}>Keluar</button>
                    </form>
                  </div>
                ) : (
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                    <Link href="/login" style={{ textDecoration: "none" }}>
                      <button className="btn-outline">Masuk</button>
                    </Link>
                    <Link href="/register" style={{ textDecoration: "none" }}>
                      <button className="btn-primary">Daftar</button>
                    </Link>
                  </div>
                )}
              </div>
            </nav>

            {/* ══════════════════ MAIN CONTENT ══════════════════ */}
            <main style={{ paddingTop: "72px", minHeight: "100vh" }}>
              {children}
            </main>

            {/* ══════════════════ FOOTER PREMIUM ══════════════════ */}
            <footer className="footer-premium">
              <div className="footer-top">
                {/* Kiri: Copyright + Links */}
                <div style={{ display: "flex", alignItems: "center", gap: "2rem", flexWrap: "wrap" }}>
                  <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "var(--text-secondary)" }}>
                    © 2026 FILMKU Entertainment Inc.
                  </span>
                  <div className="footer-links">
                    <a href="#" className="footer-link">Privacy Policy</a>
                    <a href="#" className="footer-link">Terms of Use</a>
                  </div>
                </div>

                {/* Kanan: Sosial Media Icons */}
                <div className="footer-social">
                  <a href="#" className="social-icon" aria-label="X (Twitter)">𝕏</a>
                  <a href="#" className="social-icon" aria-label="LinkedIn">in</a>
                  <a href="#" className="social-icon" aria-label="Instagram">ig</a>
                </div>
              </div>

              <div className="footer-bottom">
                <p>FILMKU is a trademark and registered trademark of FILMKU Entertainment Inc. Any other trademark logos are the property of their respective owners. Unless
                otherwise noted, use of third party logos does not imply endorsement of, sponsorship of, or affiliation with FILMKU.</p>
                <p style={{ marginTop: "0.5rem" }}>FILMKU is a cinema technology platform, providing semantic web data for the ultimate cinematic experience.</p>
              </div>
            </footer>

          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
