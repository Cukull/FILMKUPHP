'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/* ─────────────────────────────────────────
   Navigation items
───────────────────────────────────────── */
const NAV_ITEMS = [
  {
    label: 'Beranda',
    href: '/',
    exact: true,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" />
      </svg>
    ),
  },
  {
    label: 'Cine-Community',
    href: '/komunitas',
    exact: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Wishlist',
    href: '/wishlist',
    exact: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
  },
  {
    label: 'Genre',
    href: '/genre',
    exact: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" /><line x1="7" y1="2" x2="7" y2="22" />
        <line x1="17" y1="2" x2="17" y2="22" /><line x1="2" y1="12" x2="22" y2="12" />
      </svg>
    ),
  },
  {
    label: 'Snack-Ku',
    href: '/cafe',
    exact: false,
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" /><line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
];

const ADMIN_ITEMS = [
  {
    label: 'Dashboard',
    href: '/admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    label: 'Kelola Film',
    href: '/admin/film',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" /><circle cx="12" cy="12" r="4" />
      </svg>
    ),
  },
];

/* ─────────────────────────────────────────
   Sidebar Portal
───────────────────────────────────────── */
function SidebarPortal({ isOpen, onClose, session, logoutAction }: {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  logoutAction: any;
}) {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!mounted) return null;

  const isActive = (href: string, exact: boolean) =>
    exact ? pathname === href : pathname.startsWith(href);

  return createPortal(
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 9000,
          backgroundColor: 'rgba(0,0,0,0.65)',
          backdropFilter: isOpen ? 'blur(8px)' : 'none',
          WebkitBackdropFilter: isOpen ? 'blur(8px)' : 'none',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.35s ease, backdrop-filter 0.35s ease',
        }}
      />

      {/* ── Sidebar Drawer ── */}
      <aside
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          width: '280px',
          zIndex: 9001,
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#0c0c18',
          borderRight: '1px solid rgba(229,9,20,0.15)',
          boxShadow: isOpen ? '6px 0 40px rgba(0,0,0,0.9), 0 0 60px rgba(229,9,20,0.06)' : 'none',
          transform: isOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.35s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.35s ease',
          overflowY: 'auto',
          overflowX: 'hidden',
        }}
      >
        {/* ── Header ── */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 24px',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
        }}>
          {/* Logo */}
          <Link href="/" onClick={onClose} style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '8px',
              background: 'linear-gradient(135deg, #e50914 0%, #a00510 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(229,9,20,0.4)',
              flexShrink: 0,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span style={{ fontSize: '1.3rem', fontWeight: 900, color: '#e50914', letterSpacing: '0.08em', textTransform: 'uppercase', textShadow: '0 0 20px rgba(229,9,20,0.4)' }}>
              FILMKU
            </span>
          </Link>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '8px',
              color: 'rgba(255,255,255,0.6)',
              width: '32px', height: '32px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer',
              fontSize: '1rem',
              transition: 'all 0.2s',
              flexShrink: 0,
            }}
            aria-label="Tutup"
          >
            ✕
          </button>
        </div>

        {/* ── Navigation ── */}
        <div style={{ flex: 1, padding: '16px 0' }}>

          {/* NAVIGATE section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ padding: '8px 24px 10px', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Navigasi
            </div>
            {NAV_ITEMS.map(item => {
              const active = isActive(item.href, item.exact);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '11px 24px',
                    textDecoration: 'none',
                    color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                    fontWeight: active ? 700 : 500,
                    fontSize: '14px',
                    background: active ? 'rgba(229,9,20,0.08)' : 'transparent',
                    borderLeft: `3px solid ${active ? '#e50914' : 'transparent'}`,
                    transition: 'all 0.18s ease',
                    position: 'relative',
                  }}
                >
                  <span style={{ color: active ? '#e50914' : 'rgba(255,255,255,0.35)', flexShrink: 0, transition: 'color 0.18s' }}>
                    {item.icon}
                  </span>
                  {item.label}
                  {active && (
                    <span style={{
                      marginLeft: 'auto', width: '6px', height: '6px',
                      borderRadius: '50%', background: '#e50914',
                      boxShadow: '0 0 8px rgba(229,9,20,0.8)', flexShrink: 0,
                    }} />
                  )}
                </Link>
              );
            })}
          </div>

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 20px 24px' }} />

          {/* ADMIN section */}
          {session?.role === 'ADMIN' && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ padding: '8px 24px 10px', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                Admin Panel
              </div>
              {ADMIN_ITEMS.map(item => {
                const active = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={onClose}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '11px 24px',
                      textDecoration: 'none',
                      color: active ? '#ffffff' : 'rgba(255,255,255,0.55)',
                      fontWeight: active ? 700 : 500,
                      fontSize: '14px',
                      background: active ? 'rgba(229,9,20,0.08)' : 'transparent',
                      borderLeft: `3px solid ${active ? '#e50914' : 'transparent'}`,
                      transition: 'all 0.18s ease',
                    }}
                  >
                    <span style={{ color: active ? '#e50914' : 'rgba(255,255,255,0.35)', flexShrink: 0 }}>{item.icon}</span>
                    {item.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Divider */}
          <div style={{ height: '1px', background: 'rgba(255,255,255,0.05)', margin: '0 20px 24px' }} />

          {/* AKUN section */}
          <div>
            <div style={{ padding: '8px 24px 10px', fontSize: '10px', fontWeight: 800, color: 'rgba(255,255,255,0.25)', letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              Akun Saya
            </div>

            {session ? (
              <>
                {/* User Card */}
                <div style={{
                  margin: '0 16px 8px',
                  padding: '12px 16px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #e50914, #9333ea)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: '14px', color: '#fff', flexShrink: 0,
                    boxShadow: '0 4px 12px rgba(229,9,20,0.3)',
                  }}>
                    {session.name?.[0]?.toUpperCase() ?? '?'}
                  </div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {session.name}
                    </div>
                    <div style={{ fontSize: '11px', color: session.role === 'ADMIN' ? '#e50914' : 'rgba(255,255,255,0.4)', fontWeight: 600 }}>
                      {session.role}
                    </div>
                  </div>
                </div>

                {/* Logout */}
                {logoutAction && (
                  <form action={logoutAction} style={{ margin: 0 }}>
                    <button
                      type="submit"
                      onClick={onClose}
                      style={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '11px 24px',
                        color: '#ef4444',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: 'none',
                        border: 'none',
                        borderLeft: '3px solid transparent',
                        cursor: 'pointer',
                        textAlign: 'left',
                        transition: 'all 0.18s',
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
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
                <Link href="/login" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 24px', textDecoration: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, borderLeft: '3px solid transparent' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                    <polyline points="10 17 15 12 10 7" />
                    <line x1="15" y1="12" x2="3" y2="12" />
                  </svg>
                  Masuk
                </Link>
                <Link href="/register" onClick={onClose} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '11px 24px', textDecoration: 'none', color: 'rgba(255,255,255,0.55)', fontSize: '14px', fontWeight: 500, borderLeft: '3px solid transparent' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Daftar Akun
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Footer brand ── */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid rgba(255,255,255,0.05)',
          flexShrink: 0,
          fontSize: '11px',
          color: 'rgba(255,255,255,0.2)',
          fontWeight: 600,
          letterSpacing: '0.05em',
        }}>
          © 2026 FILMKU Entertainment Inc.
        </div>
      </aside>
    </>,
    document.body
  );
}

/* ─────────────────────────────────────────
   Main MobileNav export (hamburger only)
───────────────────────────────────────── */
export default function MobileNav({ session, logoutAction }: { session?: any; logoutAction?: any }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Hamburger Button */}
      <button
        onClick={() => setIsOpen(true)}
        aria-label="Buka Menu"
        style={{
          background: 'none',
          border: 'none',
          color: 'rgba(255,255,255,0.8)',
          cursor: 'pointer',
          padding: '6px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          flexShrink: 0,
          zIndex: 100,
        }}
      >
        <span style={{ display: 'block', width: '22px', height: '2px', background: 'currentColor', borderRadius: '2px', transition: 'all 0.3s' }} />
        <span style={{ display: 'block', width: '14px', height: '2px', background: 'currentColor', borderRadius: '2px', transition: 'all 0.3s' }} />
        <span style={{ display: 'block', width: '22px', height: '2px', background: 'currentColor', borderRadius: '2px', transition: 'all 0.3s' }} />
      </button>

      {/* Portal Sidebar */}
      <SidebarPortal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        session={session}
        logoutAction={logoutAction}
      />
    </>
  );
}
