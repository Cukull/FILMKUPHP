import type { Metadata } from "next";
import "./globals.css";
import { getSession, logout } from "@/lib/auth";
import Link from "next/link";
import { redirect } from "next/navigation";
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

  return (
    <html lang="id">
      <body>
        {/* Premium Splash Screen */}
        <div className="splash-container">
          <div className="splash-logo">FILMKU</div>
        </div>

        <SmoothScroll>
          <div className="page-transition">
            <nav className="navbar">
              {/* ─── Kiri: Logo + Nav Items ─── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '3rem' }}>
                {/* Logo */}
                <Link href="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
                  <span style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    color: 'var(--accent)',
                    textTransform: 'uppercase',
                    textShadow: '0 0 20px var(--primary-glow)',
                  }}>
                    FILMKU
                  </span>
                </Link>

                {/* Nav Links */}
                <ul style={{ display: 'flex', alignItems: 'center', gap: '2rem', listStyle: 'none', margin: 0, padding: 0 }}>
                  <li><Link href="/" className="nav-link">Beranda</Link></li>
                  <li><Link href="/" className="nav-link">Kategori</Link></li>
                  <li><Link href="/cafe" className="nav-link">Cafe & FnB</Link></li>
                  <li><Link href="/komunitas" className="nav-link">Komunitas</Link></li>
                </ul>
              </div>

              {/* ─── Kanan: Auth Buttons ─── */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {session ? (
                  <>
                    <Link href="/admin" className="nav-link" style={{ marginRight: '0.5rem' }}>
                      Dashboard
                    </Link>
                    <span style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                      Hai, <strong style={{ color: 'var(--text-primary)' }}>{session.name}</strong>
                    </span>
                    <form action={async () => {
                      'use server';
                      const { logoutAction } = await import('@/actions/auth');
                      await logoutAction();
                    }}>
                      <button type="submit" className="btn-outline">Logout</button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login" style={{ textDecoration: 'none' }}>
                      <button className="btn-outline">Masuk</button>
                    </Link>
                    <Link href="/register" style={{ textDecoration: 'none' }}>
                      <button className="btn-primary">Daftar</button>
                    </Link>
                  </>
                )}
              </div>
            </nav>
            
            <main style={{ paddingTop: '100px', minHeight: '100vh' }}>
              {children}
            </main>
            
            <footer className="glass" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', marginTop: '4rem' }}>
              <div style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)', marginBottom: '1rem' }}>FILMKU</div>
              <p>© 2026 FILMKU Premium Cinema. Hak Cipta Dilindungi.</p>
            </footer>
          </div>
        </SmoothScroll>
      </body>
    </html>
  );
}
