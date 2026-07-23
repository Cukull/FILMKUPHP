'use client';

import { useState } from 'react';
import { loginAction, registerAction } from '@/actions/auth';
import Link from 'next/link';

/**
 * /auth — Split-panel auth page (referensi desain PHP)
 *
 * Teknik slider 4-panel (lebar total 200vw):
 *
 *  ┌──────────────┬──────────────┬──────────────┬──────────────┐
 *  │  1. LOGIN    │  2. CTA REG  │  3. CTA LOG  │  4. REGISTER │
 *  │  (dark)      │  (red)       │  (red)       │  (dark)      │
 *  └──────────────┴──────────────┴──────────────┴──────────────┘
 *        ◄──── visible at translateX(0) ────►
 *                                    ◄──── visible at translateX(-50%) ────►
 *
 * isRegister=false → translateX(0)    → tampilkan panel 1+2
 * isRegister=true  → translateX(-50%) → tampilkan panel 3+4
 * Transisi: duration-700ms ease-in-out (smooth)
 */
export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);

  const [loginError,   setLoginError]   = useState('');
  const [regError,     setRegError]     = useState('');
  const [regSuccess,   setRegSuccess]   = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingReg,   setLoadingReg]   = useState(false);

  async function handleLogin(formData: FormData) {
    setLoadingLogin(true); setLoginError('');
    const res = await loginAction(formData);
    if (res?.error) { setLoginError(res.error); setLoadingLogin(false); }
    else if (res?.success) { window.location.href = '/'; }
  }

  async function handleRegister(formData: FormData) {
    setLoadingReg(true); setRegError(''); setRegSuccess('');
    try {
      const res = await registerAction(formData);
      if (res?.error) { setRegError(res.error); }
      else {
        setRegSuccess('Akun berhasil dibuat! Silakan masuk.');
        setTimeout(() => setIsRegister(false), 1400);
      }
    } catch { setRegError('Terjadi kesalahan, coba lagi.'); }
    setLoadingReg(false);
  }

  /* ── Shared Styles ─────────────────────────────────────────── */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.9rem 1rem',
    borderRadius: '8px',
    border: '1.5px solid rgba(255,255,255,0.12)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: '0.95rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '0.4rem',
    marginBottom: '0.5rem',
    fontSize: '0.7rem',
    fontWeight: 700,
    letterSpacing: '0.1em',
    color: 'rgba(255,255,255,0.4)',
    textTransform: 'uppercase',
  };

  // ── Icon SVGs ───────────────────────────────────────────────
  const EmailIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-10 6L2 7"/>
    </svg>
  );
  const LockIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  );
  const UserIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  );
  const KeyIcon = () => (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5"/>
      <path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3"/>
    </svg>
  );

  // Film grid icon (same as PHP reference)
  const FilmIcon = () => (
    <svg width="72" height="72" viewBox="0 0 72 72" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="4"  y="4"  width="18" height="18" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
      <rect x="27" y="4"  width="18" height="18" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
      <rect x="50" y="4"  width="18" height="18" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
      <rect x="4"  y="27" width="18" height="18" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
      <rect x="27" y="27" width="18" height="18" rx="3" stroke="rgba(255,255,255,0.3)" strokeWidth="2.5" fill="rgba(255,255,255,0.08)"/>
      <rect x="50" y="27" width="18" height="18" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
      <rect x="4"  y="50" width="18" height="18" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
      <rect x="27" y="50" width="18" height="18" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
      <rect x="50" y="50" width="18" height="18" rx="3" stroke="white" strokeWidth="2.5" fill="none"/>
    </svg>
  );

  /* ── Panel base styles ──────────────────────────────────────── */
  const darkPanel: React.CSSProperties = {
    width: '50vw',
    minHeight: '100vh',
    background: 'linear-gradient(160deg, #12121e 0%, #0d0d18 60%, #100b18 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  };

  const redPanel: React.CSSProperties = {
    width: '50vw',
    minHeight: '100vh',
    background: 'linear-gradient(145deg, #8b0000 0%, #cc0000 35%, #e50914 65%, #ff2222 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    position: 'relative',
    overflow: 'hidden',
  };

  return (
    <div style={{ minHeight: '100vh', overflowX: 'hidden', background: '#0d0d18' }}>

      {/* ═══════════════════════════════════════════════════
           4-PANEL SLIDER — lebar total 200vw
           translateX(0)    → panel 1+2 terlihat
           translateX(-50%) → panel 3+4 terlihat
      ════════════════════════════════════════════════════ */}
      <div style={{
        display: 'flex',
        width: '200vw',
        minHeight: '100vh',
        transform: isRegister ? 'translateX(-50%)' : 'translateX(0)',
        transition: 'transform 700ms cubic-bezier(0.77,0,0.18,1)',
      }}>

        {/* ═══════════ PANEL 1 — LOGIN FORM (dark) ═══════════ */}
        <div style={darkPanel}>
          {/* Subtle noise grain */}
          <div style={{
            position: 'absolute', inset: 0, opacity: 0.025, pointerEvents: 'none',
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          }} />
          {/* Red glow top-right corner */}
          <div style={{
            position: 'absolute', top: '-120px', right: '-80px',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px', padding: '3rem 3rem' }}>

            {/* ── FILMKU Logo ── */}
            <div style={{ marginBottom: '2.5rem' }}>
              <Link href="/" style={{ textDecoration: 'none' }}>
                <span style={{
                  fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.15em',
                  color: '#e50914', textTransform: 'uppercase',
                  textShadow: '0 0 16px rgba(229,9,20,0.5)',
                  fontFamily: 'var(--font-display, Inter, sans-serif)',
                }}>
                  FILMKU
                </span>
              </Link>
              <h1 style={{
                fontSize: '2rem', fontWeight: 900, color: '#fff',
                margin: '0.75rem 0 0.4rem', letterSpacing: '-0.02em', lineHeight: 1.2,
              }}>
                Selamat Datang
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Masuk untuk melanjutkan pengalaman bioskop Anda
              </p>
            </div>

            {/* ── Error banner ── */}
            {loginError && (
              <div style={{
                background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)',
                color: '#ff8080', padding: '0.7rem 1rem', borderRadius: '8px',
                fontSize: '0.82rem', marginBottom: '1.25rem', display: 'flex', gap: '0.5rem', alignItems: 'center',
              }}>
                ⚠️ {loginError}
              </div>
            )}

            {/* ── Form ── */}
            <form action={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>

              <div>
                <label style={labelStyle}><EmailIcon /> Email</label>
                <input
                  type="email" name="email" required
                  placeholder="didosyukur123@gmail.com"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.6)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              <div>
                <label style={labelStyle}><LockIcon /> Password</label>
                <input
                  type="password" name="password" required
                  placeholder="••••••••••"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.6)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              <button
                type="submit" disabled={loadingLogin}
                style={{
                  width: '100%', padding: '0.95rem',
                  background: loadingLogin ? 'rgba(229,9,20,0.5)' : '#e50914',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '1rem', fontWeight: 700, cursor: loadingLogin ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.02em', marginTop: '0.25rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 24px rgba(229,9,20,0.35)',
                }}
                onMouseOver={e => { if (!loadingLogin) (e.currentTarget.style.background = '#c0000e'); }}
                onMouseOut={e  => { if (!loadingLogin) (e.currentTarget.style.background = '#e50914'); }}
              >
                {loadingLogin ? 'Memproses…' : 'Masuk'}
              </button>
            </form>

            {/* ── Demo Akun ── */}
            <div style={{
              marginTop: '1.5rem', padding: '0.9rem 1rem', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)',
            }}>
              <p style={{ margin: '0 0 0.4rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <KeyIcon /> <strong style={{ color: 'rgba(255,255,255,0.7)' }}>Akun Demo:</strong>
              </p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>
                Admin: <span style={{ color: '#e85d75' }}>angra@admin.com</span> / admin123
              </p>
              <p style={{ margin: '0.2rem 0', fontSize: '0.76rem', color: 'rgba(255,255,255,0.4)' }}>
                User: <span style={{ color: '#e85d75' }}>syukur@gmail.com</span> / syukur123
              </p>
            </div>
          </div>
        </div>

        {/* ═══════════ PANEL 2 — CTA DAFTAR (red) ═══════════ */}
        <div style={redPanel}>
          {/* Decorative ambient */}
          <div style={{ position: 'absolute', top: '10%', right: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10%', left: '5%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.2) 100%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '340px', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              <FilmIcon />
            </div>
            <h2 style={{
              fontSize: '2rem', fontWeight: 900, color: '#fff',
              margin: '0 0 1rem', lineHeight: 1.2, letterSpacing: '-0.01em',
            }}>
              Belum punya akun?
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 2.5rem' }}>
              Bergabung dengan jutaan penonton<br/>dan nikmati pengalaman bioskop premium
            </p>
            <button
              onClick={() => setIsRegister(true)}
              style={{
                padding: '0.85rem 2.5rem',
                background: 'transparent',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.9)',
                borderRadius: '50px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.03em',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#c0000e'; }}
              onMouseOut={e  => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
            >
              Daftar Sekarang
            </button>
          </div>
        </div>

        {/* ═══════════ PANEL 3 — CTA MASUK (red) ═══════════ */}
        <div style={redPanel}>
          <div style={{ position: 'absolute', top: '10%', left: '10%', width: '300px', height: '300px', borderRadius: '50%', background: 'rgba(255,255,255,0.05)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', bottom: '10%', right: '5%', width: '180px', height: '180px', borderRadius: '50%', background: 'rgba(0,0,0,0.1)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.2) 100%)', pointerEvents: 'none' }} />

          <div style={{ position: 'relative', zIndex: 1, textAlign: 'center', maxWidth: '340px', padding: '2rem' }}>
            <div style={{ marginBottom: '2rem' }}>
              {/* Different icon for this panel */}
              <svg width="72" height="72" viewBox="0 0 72 72" fill="none">
                <path d="M36 8C20.536 8 8 20.536 8 36s12.536 28 28 28 28-12.536 28-28S51.464 8 36 8z" stroke="white" strokeWidth="2.5" fill="none"/>
                <path d="M28 24l20 12-20 12V24z" fill="white"/>
              </svg>
            </div>
            <h2 style={{
              fontSize: '2rem', fontWeight: 900, color: '#fff',
              margin: '0 0 1rem', lineHeight: 1.2, letterSpacing: '-0.01em',
            }}>
              Sudah punya akun?
            </h2>
            <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.75)', lineHeight: 1.6, margin: '0 0 2.5rem' }}>
              Masuk dan lanjutkan pengalaman<br/>sinema premium bersama FILMKU
            </p>
            <button
              onClick={() => setIsRegister(false)}
              style={{
                padding: '0.85rem 2.5rem',
                background: 'transparent',
                color: '#fff',
                border: '2px solid rgba(255,255,255,0.9)',
                borderRadius: '50px',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                letterSpacing: '0.03em',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#c0000e'; }}
              onMouseOut={e  => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
            >
              Masuk Sekarang
            </button>
          </div>
        </div>

        {/* ═══════════ PANEL 4 — REGISTER FORM (dark) ═══════════ */}
        <div style={darkPanel}>
          <div style={{
            position: 'absolute', top: '-120px', left: '-80px',
            width: '400px', height: '400px', borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(229,9,20,0.12) 0%, transparent 70%)',
            pointerEvents: 'none',
          }} />

          <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '400px', padding: '2.5rem 3rem' }}>

            {/* ── FILMKU Logo ── */}
            <div style={{ marginBottom: '2rem' }}>
              <span style={{
                fontSize: '1.1rem', fontWeight: 900, letterSpacing: '0.15em',
                color: '#e50914', textTransform: 'uppercase',
                textShadow: '0 0 16px rgba(229,9,20,0.5)',
              }}>
                FILMKU
              </span>
              <h1 style={{
                fontSize: '1.8rem', fontWeight: 900, color: '#fff',
                margin: '0.65rem 0 0.35rem', letterSpacing: '-0.02em', lineHeight: 1.2,
              }}>
                Buat Akun Baru
              </h1>
              <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.4)', margin: 0 }}>
                Gratis selamanya, batalkan kapan saja
              </p>
            </div>

            {/* ── Banners ── */}
            {regError && (
              <div style={{
                background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)',
                color: '#ff8080', padding: '0.7rem 1rem', borderRadius: '8px',
                fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center',
              }}>⚠️ {regError}</div>
            )}
            {regSuccess && (
              <div style={{
                background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                color: '#6ee7b7', padding: '0.7rem 1rem', borderRadius: '8px',
                fontSize: '0.82rem', marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center',
              }}>✅ {regSuccess}</div>
            )}

            {/* ── Form ── */}
            <form action={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>

              <div>
                <label style={labelStyle}><UserIcon /> Nama Lengkap</label>
                <input
                  type="text" name="name" required
                  placeholder="John Doe"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.6)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              <div>
                <label style={labelStyle}><EmailIcon /> Email</label>
                <input
                  type="email" name="email" required
                  placeholder="kamu@email.com"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.6)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              <div>
                <label style={labelStyle}><LockIcon /> Password</label>
                <input
                  type="password" name="password" required
                  placeholder="Min. 8 karakter"
                  style={inputStyle}
                  onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.6)')}
                  onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.12)')}
                />
              </div>

              <button
                type="submit" disabled={loadingReg}
                style={{
                  width: '100%', padding: '0.95rem',
                  background: loadingReg ? 'rgba(229,9,20,0.5)' : '#e50914',
                  color: '#fff', border: 'none', borderRadius: '8px',
                  fontSize: '1rem', fontWeight: 700, cursor: loadingReg ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.02em', marginTop: '0.25rem',
                  transition: 'all 0.2s',
                  boxShadow: '0 4px 24px rgba(229,9,20,0.35)',
                }}
                onMouseOver={e => { if (!loadingReg) (e.currentTarget.style.background = '#c0000e'); }}
                onMouseOut={e  => { if (!loadingReg) (e.currentTarget.style.background = '#e50914'); }}
              >
                {loadingReg ? 'Memproses…' : 'Buat Akun'}
              </button>
            </form>

            <p style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: 'rgba(255,255,255,0.3)' }}>
              Sudah punya akun?{' '}
              <button
                onClick={() => setIsRegister(false)}
                style={{ background: 'none', border: 'none', color: '#e50914', fontWeight: 700, cursor: 'pointer', fontSize: '0.82rem' }}
              >
                Masuk
              </button>
            </p>
          </div>
        </div>

      </div>{/* end 4-panel slider */}
    </div>
  );
}
