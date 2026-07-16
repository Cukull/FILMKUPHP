'use client';

import { useState } from 'react';
import Link from 'next/link';

export default function MobileNav({ session, logoutAction }: { session?: any, logoutAction?: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Menu"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '0.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          zIndex: 100,
        }}
      >
        <span style={{ display: 'block', width: '20px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '20px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '20px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
      </button>

      {/* Overlay */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
          zIndex: 9998,
        }}
        onClick={() => setIsOpen(false)}
      />

      {/* Sidebar */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          background: '#11131e',
          borderRight: '1px solid rgba(255,255,255,0.05)',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div style={{ padding: '2rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid var(--glass-border)' }}>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            letterSpacing: '0.06em',
            color: 'var(--accent)',
            textTransform: 'uppercase',
            textShadow: '0 0 24px var(--primary-glow)',
            fontFamily: 'var(--font-display)',
          }}>
            FILMKU
          </span>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'none', border: 'none', color: 'var(--text-secondary)',
              fontSize: '1.5rem', cursor: 'pointer', lineHeight: 1
            }}
          >
            ×
          </button>
        </div>

        <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', overflowY: 'auto' }}>
          
          {/* MENU UTAMA */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '1rem' }}>MENU UTAMA</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <Link href="/" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.2)' }}>
                  <span>🏠</span> <span style={{ fontWeight: 600 }}>Beranda</span>
                </div>
              </Link>
              <Link href="/komunitas" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>👥</span> <span style={{ fontWeight: 600 }}>Cine-Community</span>
                </div>
              </Link>
              <Link href="/genre" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>🎞️</span> <span style={{ fontWeight: 600 }}>Genre</span>
                </div>
              </Link>
              <Link href="/wishlist" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>🤍</span> <span style={{ fontWeight: 600 }}>Wishlist</span>
                </div>
              </Link>
              <Link href="/cafe" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <span>🍿</span> <span style={{ fontWeight: 600 }}>Snack-Ku</span>
                </div>
              </Link>
            </div>
          </div>

          {/* ADMIN PANEL */}
          {session?.role === 'ADMIN' && (
            <div>
              <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>ADMIN PANEL</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <Link href="/admin" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span>📊</span> <span style={{ fontWeight: 600 }}>Dashboard Admin</span>
                  </div>
                </Link>
              </div>
            </div>
          )}

          {/* AKUN SAYA */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', letterSpacing: '0.1em', marginBottom: '0.75rem' }}>AKUN SAYA</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {session ? (
                <>
                  <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'white', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(255,255,255,0.05)' }}>
                    <span>👤</span> <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{session.name}</span>
                  </div>
                  <form action={logoutAction} style={{ margin: 0 }}>
                    <button type="submit" onClick={() => setIsOpen(false)} style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '0.5rem', color: '#ff4d4d', display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
                      <span>🚪</span> <span style={{ fontWeight: 600 }}>Keluar (Logout)</span>
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link href="/login" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span>🔑</span> <span style={{ fontWeight: 600 }}>Masuk</span>
                    </div>
                  </Link>
                  <Link href="/register" onClick={() => setIsOpen(false)} style={{ textDecoration: 'none' }}>
                    <div style={{ padding: '0.75rem 1rem', borderRadius: '0.5rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <span>📝</span> <span style={{ fontWeight: 600 }}>Daftar Akun</span>
                    </div>
                  </Link>
                </>
              )}
            </div>
          </div>
          
        </div>
      </div>
    </>
  );
}
