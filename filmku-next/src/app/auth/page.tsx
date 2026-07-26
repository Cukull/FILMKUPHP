'use client';

import { useState } from 'react';
import { loginAction, registerAction } from '@/actions/auth';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DotField = dynamic(() => import('@/components/DotField'), { ssr: false });
const BorderGlow = dynamic(() => import('@/components/BorderGlow'), { ssr: false });

/**
 * /auth — Card sliding panel di atas DotField fullscreen
 *
 * DotField:  position: fixed, inset: 0, z-index: -1
 *            → menutupi seluruh viewport termasuk di belakang
 *              navbar yang transparan
 *
 * Card:      position: relative, z-index: 1
 *            → centered di layar, overflow: hidden
 *            → berisi 4-panel slider (200% lebar card)
 *
 * Slider:    isRegister=false → translateX(0)    → panel 1+2 (login + red CTA)
 *            isRegister=true  → translateX(-50%) → panel 3+4 (red CTA + register)
 */
export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);

  const [loginError, setLoginError] = useState('');
  const [regError, setRegError] = useState('');
  const [regSuccess, setRegSuccess] = useState('');
  const [loadingLogin, setLoadingLogin] = useState(false);
  const [loadingReg, setLoadingReg] = useState(false);

  // Google OAuth Auth Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleEmail, setGoogleEmail] = useState('');
  const [googleName, setGoogleName] = useState('');
  const [googleError, setGoogleError] = useState('');
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  async function handleGoogleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoadingGoogle(true);
    setGoogleError('');
    import('@/actions/auth').then(async ({ googleAuthAction }) => {
      const res = await googleAuthAction(googleEmail, googleName || googleEmail.split('@')[0] || 'Pengguna Google');
      if (res?.error) {
        setGoogleError(res.error);
        setLoadingGoogle(false);
      } else if (res?.success) {
        window.location.href = '/';
      }
    });
  }

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

  /* ── Shared input / label style ─────────────────────────── */
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '8px',
    border: '1.5px solid rgba(255,255,255,0.1)',
    background: 'rgba(255,255,255,0.06)',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };
  const labelStyle: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.4rem',
    marginBottom: '0.45rem',
    fontSize: '0.68rem', fontWeight: 700,
    letterSpacing: '0.1em', textTransform: 'uppercase',
    color: 'rgba(255,255,255,0.38)',
  };
  const redBtnStyle: React.CSSProperties = {
    width: '100%', padding: '0.9rem',
    background: '#e50914',
    color: '#fff', border: 'none', borderRadius: '8px',
    fontSize: '0.95rem', fontWeight: 700,
    cursor: 'pointer', letterSpacing: '0.02em',
    boxShadow: '0 4px 20px rgba(229,9,20,0.4)',
    transition: 'background 0.18s',
  };
  const outlineBtnStyle: React.CSSProperties = {
    padding: '0.8rem 2.25rem',
    background: 'transparent',
    border: '2px solid rgba(255,255,255,0.9)',
    borderRadius: '50px',
    color: '#fff', fontSize: '0.9rem', fontWeight: 700,
    cursor: 'pointer', letterSpacing: '0.03em',
    transition: 'all 0.18s',
  };
  const googleBtnStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.82rem 1rem',
    background: 'rgba(255,255,255,0.08)',
    border: '1.5px solid rgba(255,255,255,0.18)',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '0.88rem',
    fontWeight: 600,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.65rem',
    transition: 'all 0.2s ease',
    marginTop: '0.65rem',
  };

  /* ── Inline SVG icons ────────────────────────────────────── */
  const GoogleSVG = () => (
    <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  );
  const EmailSVG = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 7-10 6L2 7" />
    </svg>
  );
  const LockSVG = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
  const UserSVG = () => (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
    </svg>
  );
  const KeySVG = () => (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" /><path d="m21 2-9.6 9.6M15.5 7.5l3 3L22 7l-3-3" />
    </svg>
  );

  /* ── Film grid icon (persis seperti referensi PHP) ────────── */
  const FilmGridIcon = () => (
    <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
      {[0, 1, 2].map(row => [0, 1, 2].map(col => (
        <rect
          key={`${row}-${col}`}
          x={3 + col * 22} y={3 + row * 22}
          width="17" height="17" rx="2.5"
          stroke="rgba(255,255,255,0.9)" strokeWidth="2"
          fill={row === 1 && col === 1 ? 'rgba(255,255,255,0.1)' : 'none'}
        />
      )))}
    </svg>
  );

  /* ── Dark panel base (for login & register sides) ────────── */
  const darkSide: React.CSSProperties = {
    width: '25%',               /* 25% of 200% slider = 50% of card */
    minHeight: '560px',
    background: 'linear-gradient(155deg, #13131f 0%, #0e0e1a 100%)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'flex-start',
    padding: '2.75rem 2.5rem',
    boxSizing: 'border-box',
    flexShrink: 0, position: 'relative', overflow: 'hidden',
  };

  /* ── Red panel base (for CTA sides) ─────────────────────── */
  const redSide: React.CSSProperties = {
    width: '25%',
    minHeight: '560px',
    background: 'linear-gradient(140deg, #8b0000 0%, #cc0000 40%, #e50914 75%, #ff2828 100%)',
    display: 'flex', flexDirection: 'column',
    justifyContent: 'center', alignItems: 'center',
    textAlign: 'center', padding: '2.5rem 2rem',
    boxSizing: 'border-box',
    flexShrink: 0, position: 'relative', overflow: 'hidden',
  };

  return (
    /*
      Page root — serves as positioning context for the card.
      DotField is FIXED so it sits outside this flow and covers
      the full viewport including behind the transparent navbar.
    */
    <div style={{
      minHeight: 'calc(100vh - 72px)',   /* account for navbar height */
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1rem',
      position: 'relative',
    }}>

      {/* ══ DotField — fixed, full viewport, behind navbar ══ */}
      <div style={{ position: 'fixed', inset: 0, zIndex: -1 }}>
        <DotField
          dotRadius={1.5}
          dotSpacing={14}
          bulgeStrength={52}
          glowRadius={150}
          sparkle
          waveAmplitude={1}
          cursorRadius={450}
          cursorForce={0.1}
          bulgeOnly
          gradientFrom="#ff0000"
          gradientTo="#ff4d4d"
          glowColor="#ff1a1a"
          style={{ pointerEvents: 'auto' }}
        />
      </div>


      {/* Subtle radial vignette over DotField */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse at 40% 50%, transparent 20%, rgba(7,7,15,0.72) 90%)',
      }} />

      {/* ══ AUTH CARD — wrapped dengan BorderGlow interaktif ══════════
          BorderGlow handles: border, box-shadow, borderRadius
          .auth-border-glow .border-glow-inner → overflow:hidden
          (agar 4-panel slider ter-clip dengan benar)
      ════════════════════════════════════════════════════════════════ */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: '860px' }}>
        <BorderGlow
          className="auth-border-glow"
          colors={['#e50914', '#ff4444', '#9333ea']}
          glowColor="0 85 60"
          backgroundColor="#0a0a14"
          borderRadius={18}
          glowRadius={45}
          glowIntensity={0.95}
          fillOpacity={0.35}
          edgeSensitivity={25}
          coneSpread={22}
        >

          {/*
          ── 4-PANEL SLIDER (width = 200% of card) ──
          panel-1 (25%) | panel-2 (25%) | panel-3 (25%) | panel-4 (25%)
          [dark:login]   [red:daftar]    [red:masuk]     [dark:register]

          translateX(0)    → shows panel-1 + panel-2
          translateX(-50%) → shows panel-3 + panel-4
        */}
          <div style={{
            display: 'flex',
            width: '200%',
            transform: isRegister ? 'translateX(-50%)' : 'translateX(0)',
            transition: 'transform 680ms cubic-bezier(0.77, 0, 0.18, 1)',
          }}>

            {/* ════════ PANEL 1 — LOGIN FORM (dark left) ════════ */}
            <div style={darkSide}>
              {/* Corner ambient glow */}
              <div style={{
                position: 'absolute', top: '-60px', right: '-60px',
                width: '220px', height: '220px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(229,9,20,0.14) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* FILMKU logo */}
              <Link href="/" style={{ textDecoration: 'none', marginBottom: '1.75rem', display: 'block' }}>
                <span style={{
                  fontSize: '1.05rem', fontWeight: 900, letterSpacing: '0.16em',
                  color: '#e50914', textTransform: 'uppercase',
                  textShadow: '0 0 18px rgba(229,9,20,0.55)',
                }}>FILMKU</span>
              </Link>

              <h1 style={{
                fontSize: '1.9rem', fontWeight: 900, color: '#fff',
                margin: '0 0 0.4rem', lineHeight: 1.15, letterSpacing: '-0.02em',
              }}>
                Selamat Datang
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.38)', margin: '0 0 1.75rem' }}>
                Masuk untuk melanjutkan pengalaman bioskop Anda
              </p>

              {/* Error */}
              {loginError && (
                <div style={{
                  background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)',
                  color: '#ff8888', padding: '0.65rem 0.9rem', borderRadius: '7px',
                  fontSize: '0.8rem', marginBottom: '1rem',
                  display: 'flex', gap: '0.4rem', alignItems: 'center', width: '100%',
                }}>⚠️ {loginError}</div>
              )}

              {/* Form */}
              <form action={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                <div>
                  <label style={labelStyle}><EmailSVG /> Email</label>
                  <input type="email" name="email" required placeholder="Filmku@gmail.com"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.55)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}><LockSVG /> Password</label>
                  <input type="password" name="password" required placeholder="••••••••••"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.55)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <button type="submit" disabled={loadingLogin}
                  style={{ ...redBtnStyle, marginTop: '0.2rem', opacity: loadingLogin ? 0.6 : 1, cursor: loadingLogin ? 'not-allowed' : 'pointer' }}
                  onMouseOver={e => { if (!loadingLogin) e.currentTarget.style.background = '#c0000e'; }}
                  onMouseOut={e => { if (!loadingLogin) e.currentTarget.style.background = '#e50914'; }}
                >
                  {loadingLogin ? 'Memproses…' : 'Masuk'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '0.2rem 0', gap: '0.8rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>atau</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <button
                  type="button"
                  onClick={() => { setShowGoogleModal(true); setGoogleError(''); }}
                  style={googleBtnStyle}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  <GoogleSVG />
                  <span>Masuk dengan Google</span>
                </button>
              </form>

              {/* Demo credentials */}
              <div style={{

              }}>

              </div>
            </div>

            {/* ════════ PANEL 2 — CTA DAFTAR (red right) ════════ */}
            <div style={redSide}>
              {/* Decorative circles */}
              <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-30px', left: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(0,0,0,0.12)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
                <div style={{ marginBottom: '1.5rem' }}><FilmGridIcon /></div>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', margin: '0 0 0.85rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  Belum punya akun?
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, margin: '0 0 2rem', maxWidth: '220px' }}>
                  Bergabung dengan jutaan penonton<br />dan nikmati pengalaman bioskop premium
                </p>
                <button
                  onClick={() => setIsRegister(true)}
                  style={outlineBtnStyle}
                  onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#b00010'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
                >
                  Daftar Sekarang
                </button>
              </div>
            </div>

            {/* ════════ PANEL 3 — CTA MASUK (red left) ════════ */}
            <div style={redSide}>
              <div style={{ position: 'absolute', top: '-40px', left: '-40px', width: '200px', height: '200px', borderRadius: '50%', background: 'rgba(255,255,255,0.06)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', bottom: '-30px', right: '-30px', width: '140px', height: '140px', borderRadius: '50%', background: 'rgba(0,0,0,0.12)', pointerEvents: 'none' }} />
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, transparent 50%, rgba(0,0,0,0.15) 100%)', pointerEvents: 'none' }} />

              <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
                {/* Play-button icon */}
                <div style={{ marginBottom: '1.5rem' }}>
                  <svg width="68" height="68" viewBox="0 0 68 68" fill="none">
                    <circle cx="34" cy="34" r="30" stroke="rgba(255,255,255,0.85)" strokeWidth="2.5" />
                    <path d="M27 22l22 12-22 12V22z" fill="rgba(255,255,255,0.9)" />
                  </svg>
                </div>
                <h2 style={{ fontSize: '1.7rem', fontWeight: 900, color: '#fff', margin: '0 0 0.85rem', lineHeight: 1.2, letterSpacing: '-0.01em' }}>
                  Sudah punya akun?
                </h2>
                <p style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.72)', lineHeight: 1.6, margin: '0 0 2rem', maxWidth: '220px' }}>
                  Masuk dan lanjutkan pengalaman<br />sinema premium bersama FILMKU
                </p>
                <button
                  onClick={() => setIsRegister(false)}
                  style={outlineBtnStyle}
                  onMouseOver={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#b00010'; }}
                  onMouseOut={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#fff'; }}
                >
                  Masuk Sekarang
                </button>
              </div>
            </div>

            {/* ════════ PANEL 4 — REGISTER FORM (dark right) ════════ */}
            <div style={darkSide}>
              <div style={{
                position: 'absolute', top: '-60px', left: '-60px',
                width: '220px', height: '220px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(229,9,20,0.14) 0%, transparent 70%)',
                pointerEvents: 'none',
              }} />

              {/* FILMKU logo */}
              <div style={{ marginBottom: '1.5rem' }}>
                <span style={{
                  fontSize: '1.05rem', fontWeight: 900, letterSpacing: '0.16em',
                  color: '#e50914', textTransform: 'uppercase',
                  textShadow: '0 0 18px rgba(229,9,20,0.55)',
                }}>FILMKU</span>
              </div>

              <h1 style={{
                fontSize: '1.7rem', fontWeight: 900, color: '#fff',
                margin: '0 0 0.35rem', lineHeight: 1.15, letterSpacing: '-0.02em',
              }}>
                Buat Akun Baru
              </h1>
              <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.38)', margin: '0 0 1.5rem' }}>
                Gratis selamanya, batalkan kapan saja
              </p>

              {/* Banners */}
              {regError && (
                <div style={{
                  background: 'rgba(229,9,20,0.1)', border: '1px solid rgba(229,9,20,0.3)',
                  color: '#ff8888', padding: '0.65rem 0.9rem', borderRadius: '7px',
                  fontSize: '0.8rem', marginBottom: '0.9rem',
                  display: 'flex', gap: '0.4rem', alignItems: 'center', width: '100%',
                }}>⚠️ {regError}</div>
              )}
              {regSuccess && (
                <div style={{
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                  color: '#6ee7b7', padding: '0.65rem 0.9rem', borderRadius: '7px',
                  fontSize: '0.8rem', marginBottom: '0.9rem',
                  display: 'flex', gap: '0.4rem', alignItems: 'center', width: '100%',
                }}>✅ {regSuccess}</div>
              )}

              <form action={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', width: '100%' }}>
                <div>
                  <label style={labelStyle}><UserSVG /> Nama Lengkap</label>
                  <input type="text" name="name" required placeholder="John Doe"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.55)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}><EmailSVG /> Email</label>
                  <input type="email" name="email" required placeholder="Filmku@email.com"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.55)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <div>
                  <label style={labelStyle}><LockSVG /> Password</label>
                  <input type="password" name="password" required placeholder="Min. 8 karakter"
                    style={inputStyle}
                    onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.55)')}
                    onBlur={e => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
                  />
                </div>
                <button type="submit" disabled={loadingReg}
                  style={{ ...redBtnStyle, marginTop: '0.15rem', opacity: loadingReg ? 0.6 : 1, cursor: loadingReg ? 'not-allowed' : 'pointer' }}
                  onMouseOver={e => { if (!loadingReg) e.currentTarget.style.background = '#c0000e'; }}
                  onMouseOut={e => { if (!loadingReg) e.currentTarget.style.background = '#e50914'; }}
                >
                  {loadingReg ? 'Memproses…' : 'Buat Akun'}
                </button>

                <div style={{ display: 'flex', alignItems: 'center', margin: '0.2rem 0', gap: '0.8rem' }}>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '1px' }}>atau</span>
                  <div style={{ flex: 1, height: '1px', background: 'rgba(255,255,255,0.1)' }} />
                </div>

                <button
                  type="button"
                  onClick={() => { setShowGoogleModal(true); setGoogleError(''); }}
                  style={googleBtnStyle}
                  onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                  onMouseOut={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                >
                  <GoogleSVG />
                  <span>Daftar dengan Google</span>
                </button>
              </form>

              <p style={{ marginTop: '1.25rem', fontSize: '0.78rem', color: 'rgba(255,255,255,0.28)' }}>
                Sudah punya akun?{' '}
                <button onClick={() => setIsRegister(false)}
                  style={{ background: 'none', border: 'none', color: '#e50914', fontWeight: 700, cursor: 'pointer', fontSize: '0.78rem', padding: 0 }}>
                  Masuk
                </button>
              </p>
            </div>

          </div>{/* end 4-panel slider */}
        </BorderGlow>
      </div>{/* end BorderGlow wrapper */}

      {/* ── GOOGLE AUTH VALIDATION MODAL ── */}
      {showGoogleModal && (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0,0,0,0.82)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1.5rem',
        }}>
          <div style={{
            background: '#141414',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '420px',
            padding: '2rem',
            boxShadow: '0 25px 60px rgba(0,0,0,0.9), 0 0 40px rgba(66, 133, 244, 0.15)',
            position: 'relative',
          }}>
            <button
              type="button"
              onClick={() => setShowGoogleModal(false)}
              style={{
                position: 'absolute', top: '16px', right: '16px',
                background: 'none', border: 'none', color: 'rgba(255,255,255,0.5)',
                fontSize: '1.2rem', cursor: 'pointer',
              }}
            >✕</button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1rem' }}>
              <GoogleSVG />
              <span style={{ fontSize: '1.1rem', fontWeight: 800, color: '#fff', letterSpacing: '0.3px' }}>
                Akun Google Resmi
              </span>
            </div>

            <p style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.5, margin: '0 0 1.2rem' }}>
              Demi keamanan dan keaslian ulasan teater, FILMKU mewajibkan penggunaan akun Google asli yang valid (contoh: <strong style={{ color: '#fff' }}>@gmail.com</strong>). Email dummy akan ditolak.
            </p>

            {googleError && (
              <div style={{
                background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.4)',
                color: '#ff8888', padding: '0.75rem 1rem', borderRadius: '8px',
                fontSize: '0.8rem', marginBottom: '1rem', lineHeight: 1.4,
              }}>
                {googleError}
              </div>
            )}

            <form onSubmit={handleGoogleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={labelStyle}>Alamat Gmail Asli (@gmail.com)</label>
                <input
                  type="email"
                  required
                  value={googleEmail}
                  onChange={e => setGoogleEmail(e.target.value)}
                  placeholder="namakamu@gmail.com"
                  style={{ ...inputStyle, borderColor: googleError ? '#e50914' : 'rgba(255,255,255,0.2)' }}
                />
              </div>
              <div>
                <label style={labelStyle}>Nama Akun Google (Opsional)</label>
                <input
                  type="text"
                  value={googleName}
                  onChange={e => setGoogleName(e.target.value)}
                  placeholder="Nama Lengkap Anda"
                  style={inputStyle}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowGoogleModal(false)}
                  style={{
                    flex: 1, padding: '0.8rem', background: 'rgba(255,255,255,0.08)',
                    border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px',
                    color: '#fff', fontWeight: 600, cursor: 'pointer',
                  }}
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={loadingGoogle}
                  style={{
                    flex: 1.5, padding: '0.8rem',
                    background: 'linear-gradient(135deg, #4285F4, #34A853)',
                    border: 'none', borderRadius: '8px',
                    color: '#fff', fontWeight: 700, cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(66, 133, 244, 0.35)',
                    opacity: loadingGoogle ? 0.6 : 1,
                  }}
                >
                  {loadingGoogle ? 'Memproses...' : 'Verifikasi & Masuk'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
