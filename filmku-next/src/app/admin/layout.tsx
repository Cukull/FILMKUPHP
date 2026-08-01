'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import React, { useState, useEffect } from 'react';

const navItems = [
  {
    name: 'Ringkasan',
    path: '/admin',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
        <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
      </svg>
    ),
  },
  {
    name: 'Kelola Film',
    path: '/admin/film',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18" />
        <line x1="7" y1="2" x2="7" y2="22" /><line x1="17" y1="2" x2="17" y2="22" />
        <line x1="2" y1="12" x2="22" y2="12" /><line x1="2" y1="7" x2="7" y2="7" />
        <line x1="2" y1="17" x2="7" y2="17" /><line x1="17" y1="17" x2="22" y2="17" />
        <line x1="17" y1="7" x2="22" y2="7" />
      </svg>
    ),
  },
  {
    name: 'Kelola Menu F&B',
    path: '/admin/fnb',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 8h1a4 4 0 0 1 0 8h-1" /><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z" />
        <line x1="6" y1="1" x2="6" y2="4" /><line x1="10" y1="1" x2="10" y2="4" />
        <line x1="14" y1="1" x2="14" y2="4" />
      </svg>
    ),
  },
  {
    name: 'Kategori Dashboard',
    path: '/admin/sections',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <line x1="3" y1="9" x2="21" y2="9" />
        <line x1="9" y1="21" x2="9" y2="9" />
      </svg>
    ),
  },
  {
    name: 'Kelola User',
    path: '/admin/users',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: 'calc(100vh - 72px)', background: 'var(--bg-base)' }}>
      <style>{`
        .admin-sidebar {
          width: 240px;
          flex-shrink: 0;
          background: rgba(8, 8, 16, 0.95);
          border-right: 1px solid rgba(255,255,255,0.06);
          padding: 1.5rem 0.75rem;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          transition: transform 0.3s ease;
        }
        .admin-main {
          flex: 1;
          padding: 2rem;
          overflow-y: auto;
          overflow-x: hidden;
        }
        .admin-mobile-header {
          display: none;
        }
        .admin-overlay {
          display: none;
        }
        @media (max-width: 768px) {
          .admin-layout-wrapper {
            flex-direction: column !important;
          }
          .admin-sidebar {
            position: fixed;
            top: 72px; /* below navbar */
            left: 0;
            bottom: 0;
            z-index: 50;
            transform: translateX(-100%);
            background: #080810;
          }
          .admin-sidebar.open {
            transform: translateX(0);
          }
          .admin-main {
            padding: 1rem 0.75rem;
          }
          .admin-mobile-header {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem;
            background: rgba(8, 8, 16, 0.95);
            border-bottom: 1px solid rgba(255,255,255,0.06);
            position: sticky;
            top: 0;
            z-index: 40;
          }
          .admin-overlay.open {
            display: block;
            position: fixed;
            top: 72px;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            backdrop-filter: blur(2px);
            z-index: 45;
          }
        }
      `}</style>

      {/* Mobile Header (Only visible on mobile) */}
      <div className="admin-mobile-header">
        <span style={{ fontSize: '1rem', fontWeight: 700, color: '#fff', letterSpacing: '0.05em' }}>Dashboard Admin</span>
        <button 
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', padding: '0.5rem' }}
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>

      <div className="admin-layout-wrapper" style={{ display: 'flex', flex: 1, position: 'relative' }}>
        
        {/* Mobile Overlay */}
        <div 
          className={`admin-overlay ${isMobileMenuOpen ? 'open' : ''}`} 
          onClick={() => setIsMobileMenuOpen(false)}
        />

        {/* Sidebar Admin */}
        <aside className={`admin-sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
          <div style={{
            fontSize: '0.7rem',
            fontWeight: 700,
            color: 'rgba(255,255,255,0.35)',
            marginBottom: '0.75rem',
            paddingLeft: '0.75rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}>
            MENU ADMIN
          </div>

          <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {navItems.map((item) => {
              const isActive = pathname === item.path || (item.path !== '/admin' && pathname.startsWith(item.path));
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.875rem',
                    padding: '0.875rem 1rem',
                    borderRadius: '0.625rem',
                    textDecoration: 'none',
                    color: isActive ? '#fff' : 'rgba(255,255,255,0.55)',
                    background: isActive
                      ? 'linear-gradient(90deg, rgba(229, 9, 20, 0.25) 0%, rgba(229, 9, 20, 0.05) 100%)'
                      : 'transparent',
                    borderLeft: `3px solid ${isActive ? '#e50914' : 'transparent'}`,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: '0.875rem',
                    transition: 'all 0.2s ease',
                    fontFamily: 'var(--font-body)',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'rgba(255,255,255,0.04)';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.85)';
                    }
                  }}
                  onMouseLeave={e => {
                    if (!isActive) {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = 'rgba(255,255,255,0.55)';
                    }
                  }}
                >
                  <span style={{ color: isActive ? '#e50914' : 'inherit', flexShrink: 0 }}>
                    {item.icon}
                  </span>
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </aside>

        {/* Main Content Admin */}
        <main className="admin-main">
          {children}
        </main>
      </div>
    </div>
  );
}
