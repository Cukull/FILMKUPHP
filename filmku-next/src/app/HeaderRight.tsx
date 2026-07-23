'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

export default function HeaderRight({ session, logoutAction }: { session: any, logoutAction: any }) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';
  
  const initials = session?.name
    ? session.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
      
      {/* Search Bar — disembunyikan di halaman /auth */}
      {!isAuthPage && (
        <div 
          className="search-container"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            width: isSearchActive ? '260px' : '40px',
            height: '40px',
            background: isSearchActive ? 'rgba(255,255,255,0.05)' : 'transparent',
            border: isSearchActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
            borderRadius: '20px',
            overflow: 'hidden',
            cursor: isSearchActive ? 'text' : 'pointer'
          }}
          onMouseEnter={() => setIsSearchActive(true)}
          onMouseLeave={(e) => {
            if (document.activeElement !== e.currentTarget.querySelector('input')) {
              setIsSearchActive(false);
            }
          }}
        >
          <input 
            type="text" 
            placeholder="Cari judul film..."
            onFocus={() => setIsSearchActive(true)}
            onBlur={() => setIsSearchActive(false)}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-primary)',
              fontSize: '0.9rem',
              width: '100%',
              height: '100%',
              padding: isSearchActive ? '0 40px 0 16px' : '0',
              opacity: isSearchActive ? 1 : 0,
              transition: 'opacity 0.2s',
              outline: 'none',
              fontFamily: 'var(--font-body)'
            }}
          />
          <svg 
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            style={{
              position: 'absolute',
              right: '10px',
              color: isSearchActive ? 'var(--text-secondary)' : 'var(--text-primary)',
              transition: 'color 0.2s',
              pointerEvents: 'none'
            }}
          >
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
        </div>
      )}

      {session ? (
        <div 
          className="profile-dropdown-container"
          style={{ position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}
        >
          {/* User Avatar Menu Trigger */}
          <div 
            style={{ 
              display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer',
              padding: '0.5rem 0'
            }}
          >
            <div style={{
              width: "36px", height: "36px", borderRadius: "50%",
              background: "linear-gradient(135deg, var(--primary) 0%, #9333ea 100%)",
              color: "white", display: "flex", alignItems: "center", justifyContent: "center",
              fontWeight: 800, fontSize: "1rem", letterSpacing: "0.05em",
              boxShadow: "0 4px 12px rgba(229, 9, 20, 0.3)"
            }}>
              {initials}
            </div>
            <span style={{ fontSize: "0.95rem", fontWeight: 700, color: "var(--text-primary)", fontFamily: 'var(--font-body)' }}>
              {session.name?.split(" ")[0]}
            </span>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ transition: 'transform 0.2s' }}>
              <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
          </div>

          {/* Dropdown Menu (handled by CSS hover on container) */}
          <div className="profile-dropdown-menu">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--glass-border)' }}>
              <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>{session.name}</div>
              {session.role === 'ADMIN' && (
                <div style={{ display: 'inline-block', background: 'rgba(229,9,20,0.15)', color: 'var(--primary)', border: '1px solid rgba(229,9,20,0.3)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                  ADMIN
                </div>
              )}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0' }}>
              {session.role === 'ADMIN' && (
                <Link href="/admin" className="dropdown-item">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"></rect><rect x="14" y="3" width="7" height="7"></rect><rect x="14" y="14" width="7" height="7"></rect><rect x="3" y="14" width="7" height="7"></rect></svg>
                  Panel Admin
                </Link>
              )}
              <Link href="/wishlist" className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                Daftar Tontonan
              </Link>
              <Link href="/orders" className="dropdown-item">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"></line><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path></svg>
                My Order
              </Link>
            </div>
            
            <div style={{ borderTop: '1px solid var(--glass-border)', padding: '0.5rem 0' }}>
              <form action={logoutAction} style={{ margin: 0 }}>
                <button type="submit" className="dropdown-item dropdown-item-danger" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  Keluar (Logout)
                </button>
              </form>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Link href="/auth" style={{ textDecoration: "none" }}>
            <button className="btn-outline">Masuk</button>
          </Link>
          <Link href="/auth" style={{ textDecoration: "none" }}>
            <button className="btn-primary">Daftar</button>
          </Link>

        </div>
      )}
    </div>
  );
}
