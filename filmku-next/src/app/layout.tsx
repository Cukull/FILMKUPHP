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
            <nav className="navbar glass">
              <div className="flex items-center gap-4">
                <Link href="/" style={{ textDecoration: 'none' }}>
                  <h1 className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>FILMKU</h1>
                </Link>
                <ul className="flex items-center gap-8 ml-8 text-sm font-medium" style={{ color: 'var(--text-secondary)', listStyle: 'none', margin: 0, padding: 0 }}>
                  <li className="cursor-pointer hover:text-white transition-colors"><Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '0.5rem 0' }}>Beranda</Link></li>
                  <li className="cursor-pointer hover:text-white transition-colors"><Link href="/" style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '0.5rem 0' }}>Kategori</Link></li>
                  <li className="cursor-pointer hover:text-white transition-colors"><Link href="/cafe" style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '0.5rem 0' }}>Cafe & FnB</Link></li>
                  <li className="cursor-pointer hover:text-white transition-colors"><Link href="/komunitas" style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: '0.5rem 0' }}>Komunitas</Link></li>
                </ul>
              </div>
              <div className="flex items-center gap-4">
                {session ? (
                  <>
                    <Link href="/admin" style={{ color: 'var(--text-secondary)', textDecoration: 'none', marginRight: '1rem', fontSize: '0.9rem' }}>Dashboard</Link>
                    <span style={{ fontWeight: 600 }}>Hai, {session.name}</span>
                    <form action={async () => {
                      'use server';
                      const { logoutAction } = await import('@/actions/auth');
                      await logoutAction();
                    }}>
                      <button type="submit" className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--accent)', color: 'var(--accent)' }}>Logout</button>
                    </form>
                  </>
                ) : (
                  <>
                    <Link href="/login"><button className="btn-primary" style={{ background: 'transparent', border: '1px solid var(--glass-border)' }}>Masuk</button></Link>
                    <Link href="/register"><button className="btn-primary">Daftar</button></Link>
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
