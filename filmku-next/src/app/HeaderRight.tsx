'use client';

import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

type SearchResult = {
  id: string;
  title: string;
  posterUrl: string | null;
  rating: number | null;
  genre: string | null;
};

export default function HeaderRight({ session, logoutAction }: { session: any, logoutAction: any }) {
  const [isSearchActive, setIsSearchActive] = useState(false);
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const isAuthPage = pathname === '/auth';
  
  const initials = session?.name
    ? session.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  // Debounced Search API call
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.results || []);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Handle click outside to close search
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchActive(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="header-right-container" style={{ display: "flex", alignItems: "center", gap: "1.25rem" }}>
      
      {/* Search Bar — disembunyikan di halaman /auth */}
      {!isAuthPage && (
        <div style={{ position: 'relative' }} ref={searchContainerRef}>
          <div 
            className="search-container"
            style={{
              position: 'relative',
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              width: isSearchActive ? '300px' : '40px',
              height: '40px',
              background: isSearchActive ? 'rgba(255,255,255,0.08)' : 'transparent',
              border: isSearchActive ? '1px solid rgba(255,255,255,0.2)' : '1px solid transparent',
              borderRadius: '20px',
              cursor: isSearchActive ? 'text' : 'pointer',
              zIndex: 50
            }}
            onClick={() => {
              if (typeof window !== 'undefined' && window.innerWidth <= 768) {
                setIsMobileSearchOpen(true);
              } else if (!isSearchActive) {
                setIsSearchActive(true);
                setTimeout(() => {
                  searchContainerRef.current?.querySelector('input')?.focus();
                }, 100);
              }
            }}
            onMouseEnter={() => {
              if (typeof window !== 'undefined' && window.innerWidth > 768) {
                if (!isSearchActive) {
                  setIsSearchActive(true);
                  setTimeout(() => {
                    searchContainerRef.current?.querySelector('input')?.focus();
                  }, 100);
                }
              }
            }}
          >
            <input 
              type="text" 
              className="desktop-search-input"
              placeholder="Cari judul film..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setIsSearchActive(true)}
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
                fontFamily: 'var(--font-body)',
                borderRadius: '20px',
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

          {/* Search Dropdown */}
          {isSearchActive && searchQuery.trim().length >= 2 && (
            <div style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              right: 0,
              width: '100%',
              minWidth: '300px',
              background: '#111',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '0.75rem',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              zIndex: 49,
              display: 'flex',
              flexDirection: 'column'
            }}>
              {isLoading ? (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Mencari...
                </div>
              ) : results.length > 0 ? (
                results.map(movie => (
                  <Link 
                    key={movie.id} 
                    href={`/film/${movie.id}`}
                    onClick={() => {
                      setIsSearchActive(false);
                      setSearchQuery('');
                    }}
                    style={{
                      display: 'flex',
                      gap: '0.75rem',
                      padding: '0.75rem 1rem',
                      textDecoration: 'none',
                      color: 'var(--text-primary)',
                      borderBottom: '1px solid rgba(255,255,255,0.05)',
                      alignItems: 'center',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    {movie.posterUrl ? (
                      <img src={movie.posterUrl} alt={movie.title} style={{ width: '40px', height: '60px', objectFit: 'cover', borderRadius: '4px' }} />
                    ) : (
                      <div style={{ width: '40px', height: '60px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }} />
                    )}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{movie.title}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{movie.genre?.split(',').slice(0, 2).join(', ')}</span>
                      {movie.rating && <span style={{ fontSize: '0.75rem', color: '#fbbf24', fontWeight: 600 }}>★ {movie.rating}</span>}
                    </div>
                  </Link>
                ))
              ) : (
                <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  Tidak ada film ditemukan
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── DESKTOP AUTH (100% Unchanged) ── */}
      <div className="desktop-only-flex" style={{ alignItems: 'center', height: '100%' }}>
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

      {/* ── MOBILE AUTH (Person SVG Icon Dropdown) ── */}
      <div className="mobile-only-flex profile-dropdown-container" style={{ position: 'relative', height: '100%', alignItems: 'center' }}>
        <div
          style={{
            width: '38px', height: '38px', borderRadius: '50%',
            background: session ? 'linear-gradient(135deg, var(--primary) 0%, #9333ea 100%)' : 'rgba(255,255,255,0.08)',
            border: '1px solid var(--glass-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
            boxShadow: session ? '0 4px 12px rgba(229, 9, 20, 0.3)' : 'none'
          }}
          aria-label="Akun Pengguna"
        >
          {session ? (
            <span style={{ fontWeight: 800, fontSize: '0.95rem' }}>{initials}</span>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
          )}
        </div>

        <div className="profile-dropdown-menu" style={{ right: 0, left: 'auto', minWidth: '180px' }}>
          {session ? (
            <>
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--glass-border)' }}>
                <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{session.name}</div>
                {session.role === 'ADMIN' && (
                  <div style={{ display: 'inline-block', background: 'rgba(229,9,20,0.15)', color: 'var(--primary)', border: '1px solid rgba(229,9,20,0.3)', padding: '0.1rem 0.5rem', borderRadius: '1rem', fontSize: '0.65rem', fontWeight: 800, marginTop: '0.25rem' }}>
                    ADMIN
                  </div>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0' }}>
                {session.role === 'ADMIN' && (
                  <Link href="/admin" className="dropdown-item">Panel Admin</Link>
                )}
                <Link href="/wishlist" className="dropdown-item">Daftar Tontonan</Link>
                <Link href="/orders" className="dropdown-item">My Order</Link>
              </div>
              <div style={{ borderTop: '1px solid var(--glass-border)', padding: '0.5rem 0' }}>
                <form action={logoutAction} style={{ margin: 0 }}>
                  <button type="submit" className="dropdown-item dropdown-item-danger" style={{ width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer' }}>
                    Keluar (Logout)
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', padding: '0.5rem 0' }}>
              <Link href="/auth" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>
                Masuk
              </Link>
              <Link href="/auth" className="dropdown-item" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--primary)' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="8.5" cy="7" r="4"></circle><line x1="20" y1="8" x2="20" y2="14"></line><line x1="23" y1="11" x2="17" y2="11"></line></svg>
                Daftar Baru
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* ── MOBILE REALTIME SEARCH MODAL (with background blur) ── */}
      {isMobileSearchOpen && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(8, 8, 16, 0.82)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            padding: '1.25rem 1rem',
            boxSizing: 'border-box',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsMobileSearchOpen(false);
            }
          }}
        >
          {/* Top Bar with Input & Close Button */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              background: 'rgba(255, 255, 255, 0.12)',
              border: '1px solid rgba(229, 9, 20, 0.7)',
              borderRadius: '25px',
              padding: '0 1rem',
              height: '48px',
              boxShadow: '0 0 20px rgba(229, 9, 20, 0.3)',
            }}>
              <svg 
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"
                style={{ marginRight: '0.6rem', flexShrink: 0 }}
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <input
                type="text"
                autoFocus
                placeholder="Cari film secara realtime..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1rem',
                  width: '100%',
                  outline: 'none',
                  fontFamily: 'var(--font-body)',
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ background: 'transparent', border: 'none', color: '#aaa', fontSize: '1.1rem', cursor: 'pointer', padding: '0.2rem' }}
                >
                  ✕
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsMobileSearchOpen(false)}
              style={{
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                width: '44px',
                height: '44px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                fontSize: '1.1rem',
                cursor: 'pointer',
                flexShrink: 0,
              }}
              aria-label="Tutup pencarian"
            >
              ✕
            </button>
          </div>

          {/* Realtime Search Results */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem',
            paddingRight: '0.25rem',
          }}>
            {isLoading ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.7)', fontSize: '1rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎬</div>
                Mencari film secara realtime...
              </div>
            ) : results.length > 0 ? (
              results.map(movie => (
                <Link
                  key={movie.id}
                  href={`/film/${movie.id}`}
                  onClick={() => {
                    setIsMobileSearchOpen(false);
                    setSearchQuery('');
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.75rem',
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.12)',
                    borderRadius: '1rem',
                    textDecoration: 'none',
                    transition: 'background 0.2s',
                  }}
                >
                  {movie.posterUrl ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      style={{ width: '48px', height: '68px', objectFit: 'cover', borderRadius: '0.5rem', flexShrink: 0 }}
                    />
                  ) : (
                    <div style={{ width: '48px', height: '68px', background: 'rgba(255,255,255,0.1)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', flexShrink: 0 }}>
                      🎬
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#fff', fontWeight: 700, fontSize: '0.95rem', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {movie.title}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.6)' }}>
                      {movie.rating && <span style={{ color: '#f5c518', fontWeight: 700 }}>⭐ {movie.rating}</span>}
                      {movie.genre && <span>• {movie.genre}</span>}
                    </div>
                  </div>
                  <div style={{ color: '#e50914', fontSize: '1.2rem', fontWeight: 800 }}>
                    →
                  </div>
                </Link>
              ))
            ) : searchQuery.trim().length >= 2 ? (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'rgba(255,255,255,0.5)', fontSize: '0.95rem' }}>
                Tidak ada film yang cocok dengan &quot;{searchQuery}&quot;.
              </div>
            ) : (
              <div style={{ padding: '1rem 0.5rem' }}>
                <div style={{
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  color: 'rgba(255,255,255,0.55)',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline>
                    <polyline points="17 6 23 6 23 12"></polyline>
                  </svg>
                  Pencarian Populer / Sering Dicari
                </div>
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.6rem'
                }}>
                  {['Spider-Man', 'Black Box', 'Supergirl', 'Backrooms', 'Horror', 'Action', 'Thriller', 'Animation', 'Robin Hood', 'Ghost'].map((term) => (
                    <button
                      key={term}
                      type="button"
                      onClick={() => setSearchQuery(term)}
                      style={{
                        padding: '0.55rem 1rem',
                        background: 'rgba(255,255,255,0.08)',
                        border: '1px solid rgba(255,255,255,0.15)',
                        borderRadius: '20px',
                        color: 'var(--text-primary)',
                        fontSize: '0.85rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.4rem',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                      </svg>
                      {term}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
