'use client';

import { useState } from 'react';
import Link from 'next/link';

const menuItems = [
  {
    href: '/',
    label: 'Beranda',
    exact: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    href: '/komunitas',
    label: 'Cine-Community',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    href: '/wishlist',
    label: 'Wishlist',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    href: '/genre',
    label: 'Genre',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    href: '/cafe',
    label: 'Snack-Ku',
    exact: false,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" />
        <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" />
        <line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
];

export default function MobileNav({ session, logoutAction }: { session?: any; logoutAction?: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ── Hamburger Button ── */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Buka Menu"
        style={{
          background: 'none',
          border: 'none',
          color: 'var(--text-secondary)',
          cursor: 'pointer',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          zIndex: 100,
          flexShrink: 0,
        }}
      >
        <span style={{ display: 'block', width: '22px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '16px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
        <span style={{ display: 'block', width: '22px', height: '2px', background: 'currentColor', borderRadius: '2px' }} />
      </button>

      {/* ── Backdrop Overlay (blurs page) ── */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 1050,
          }}
        />
      )}

      {/* ── Sidebar Drawer ── */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '260px',
          background: 'var(--bg-surface, #0f0f1a)',
          borderRight: '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          padding: '30px 20px',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          zIndex: 1100,
        }}
      >
        {/* Brand */}
        <div style={{ marginBottom: '32px', paddingLeft: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{
            fontSize: '1.4rem',
            fontWeight: 900,
            letterSpacing: '0.07em',
            color: '#e50914',
            textTransform: 'uppercase',
            textShadow: '0 0 20px rgba(229,9,20,0.5)',
          }}>
            FILMKU
          </span>
          <button
            onClick={() => setIsOpen(false)}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: 'rgba(255,255,255,0.7)',
              width: '30px',
              height: '30px',
              borderRadius: '50%',
              fontSize: '0.9rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* Menu Utama */}
        <div style={{ marginBottom: '28px' }}>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            color: 'var(--text-muted, #4a5568)',
            fontWeight: 800,
            letterSpacing: '1px',
            marginBottom: '12px',
            paddingLeft: '10px',
          }}>
            Menu Utama
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {menuItems.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--text-secondary, #94a3b8)',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  borderLeft: '3px solid transparent',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.color = 'var(--text-primary, #f0f0f8)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.color = 'var(--text-secondary, #94a3b8)';
                  e.currentTarget.style.background = 'transparent';
                }}
              >
                {item.icon}
                {item.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 10px 28px' }} />

        {/* Admin Panel */}
        {session?.role === 'ADMIN' && (
          <div style={{ marginBottom: '28px' }}>
            <div style={{
              fontSize: '11px',
              textTransform: 'uppercase',
              color: 'var(--text-muted, #4a5568)',
              fontWeight: 800,
              letterSpacing: '1px',
              marginBottom: '12px',
              paddingLeft: '10px',
            }}>
              Admin Panel
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <Link
                href="/admin"
                onClick={() => setIsOpen(false)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  color: 'var(--text-secondary, #94a3b8)',
                  fontWeight: 600,
                  fontSize: '14px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  textDecoration: 'none',
                  borderLeft: '3px solid transparent',
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
                Dashboard Admin
              </Link>
            </div>
          </div>
        )}

        {/* Divider */}
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)', margin: '0 10px 28px' }} />

        {/* Akun */}
        <div>
          <div style={{
            fontSize: '11px',
            textTransform: 'uppercase',
            color: 'var(--text-muted, #4a5568)',
            fontWeight: 800,
            letterSpacing: '1px',
            marginBottom: '12px',
            paddingLeft: '10px',
          }}>
            Akun Saya
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {session ? (
              <>
                {/* User Info */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  background: 'rgba(255,255,255,0.04)',
                  marginBottom: '4px',
                }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e50914, #c0000f)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 800,
                    fontSize: '14px',
                    color: 'white',
                    flexShrink: 0,
                  }}>
                    {session.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: 'white' }}>{session.name}</div>
                    <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{session.role}</div>
                  </div>
                </div>
                {/* Logout */}
                {logoutAction && (
                  <form action={logoutAction} style={{ margin: 0 }}>
                    <button
                      type="submit"
                      onClick={() => setIsOpen(false)}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        color: '#ef4444',
                        fontWeight: 600,
                        fontSize: '14px',
                        padding: '10px 16px',
                        borderRadius: '8px',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        textAlign: 'left',
                        borderLeft: '3px solid transparent',
                      }}
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Keluar (Logout)
                    </button>
                  </form>
                )}
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, fontSize: '14px', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', borderLeft: '3px solid transparent' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Masuk
                </Link>
                <Link href="/register" onClick={() => setIsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary, #94a3b8)', fontWeight: 600, fontSize: '14px', padding: '10px 16px', borderRadius: '8px', textDecoration: 'none', borderLeft: '3px solid transparent' }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                    <line x1="12" y1="11" x2="12" y2="17" />
                    <line x1="9" y1="14" x2="15" y2="14" />
                  </svg>
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
