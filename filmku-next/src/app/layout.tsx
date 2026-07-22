import type { Metadata } from "next";
import "./globals.css";
import { getSession } from "@/lib/auth";
import Link from "next/link";
import SmoothScroll from "./SmoothScroll";
import MobileNav from "./MobileNav";
import HeaderRight from "./HeaderRight";
import { logoutAction } from "@/actions/auth";
import PageTransition from "./PageTransition";
import SplashScreen from "./SplashScreen";
import NavbarScrollEffect from "./NavbarScrollEffect";
import PageLoadingOverlay from "./PageLoadingOverlay";
import { NavigationProvider } from "./NavigationContext";

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
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,600;12..96,700;12..96,800;12..96,900&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {/* NavigationProvider: detects forward/back direction for page transitions */}
        <NavigationProvider>
        {/* Premium Splash Screen — first visit only */}
        <SplashScreen />

        {/* Global navigation progress bar — all page transitions */}
        <PageLoadingOverlay />

        <SmoothScroll>
          <div className="page-transition">

            {/* ══════════════════ NAVBAR ══════════════════ */}
            <nav className="navbar">
              {/* Scroll-aware transparent→glass effect */}
              <NavbarScrollEffect />
              {/* Kiri: Hamburger + Logo + Nav Links */}
              <div style={{ display: "flex", alignItems: "center", gap: "2rem" }}>
                {/* MobileNav (Hamburger + Sidebar) */}
                <MobileNav session={session} logoutAction={logoutAction} />

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
              <HeaderRight session={session} logoutAction={logoutAction} />
            </nav>

            {/* ══════════════════ MAIN CONTENT ══════════════════ */}
            <main style={{ paddingTop: "72px", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
              <PageTransition>
                {children}
              </PageTransition>
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
        </NavigationProvider>
      </body>
    </html>
  );
}
