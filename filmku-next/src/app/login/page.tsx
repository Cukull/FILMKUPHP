'use client';

import { loginAction } from '@/actions/auth';
import Link from 'next/link';
import { useState } from 'react';
import dynamic from 'next/dynamic';

// Dynamic import agar canvas tidak di-SSR (window/requestAnimationFrame tidak ada di server)
const DotField = dynamic(() => import('@/components/DotField'), { ssr: false });

export default function Login() {
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (formData: FormData) => {
    setLoading(true);
    setError('');
    const res = await loginAction(formData);
    if (res?.error) {
      setError(res.error);
      setLoading(false);
    } else if (res?.success) {
      window.location.href = '/';
    }
  };

  return (
    /* ── Root: fullscreen, relative → DotField absolute di dalam ── */
    <div style={{
      position: 'relative',
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      background: '#07070f',        /* warna base agar dots terlihat */
    }}>

      {/* ── DotField Background (z-index 0) ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',      /* mouse events tetap menembus ke canvas di dalam */
      }}>
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
          gradientTo="#ffeeee"
          glowColor="#ffe6e6"
          style={{ pointerEvents: 'auto' }}   /* pulihkan mouse di canvas */
        />
      </div>

      {/* ── Subtle vignette + bg dimmer agar form terbaca ── */}
      <div style={{
        position: 'absolute',
        inset: 0,
        zIndex: 1,
        background: 'radial-gradient(ellipse at center, transparent 30%, rgba(7,7,15,0.75) 100%)',
        pointerEvents: 'none',
      }} />

      {/* ── Login Card (z-index 2) ── */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        width: '100%',
        maxWidth: '420px',
        margin: '0 1.5rem',
      }}>
        {/* Glassmorphism card */}
        <div style={{
          background: 'rgba(10, 10, 20, 0.72)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: '1px solid rgba(229, 9, 20, 0.18)',
          borderRadius: '1.25rem',
          padding: '2.5rem 2rem',
          boxShadow: '0 8px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(229,9,20,0.06)',
        }}>

          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <span style={{
              fontSize: '1.8rem',
              fontWeight: 900,
              letterSpacing: '0.08em',
              color: '#e50914',
              textShadow: '0 0 20px rgba(229,9,20,0.6), 0 0 40px rgba(229,9,20,0.3)',
              textTransform: 'uppercase',
            }}>
              FILMKU
            </span>
            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 700,
              color: 'rgba(255,255,255,0.85)',
              margin: '0.5rem 0 0',
              letterSpacing: '-0.01em',
            }}>
              Masuk ke Akun
            </h2>
            <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.35rem' }}>
              Platform Bioskop Premium
            </p>
          </div>

          {/* Error banner */}
          {error && (
            <div style={{
              background: 'rgba(229,9,20,0.12)',
              border: '1px solid rgba(229,9,20,0.35)',
              color: '#ff8080',
              padding: '0.75rem 1rem',
              borderRadius: '0.6rem',
              marginBottom: '1.5rem',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <span>⚠️</span> {error}
            </div>
          )}

          {/* Form */}
          <form action={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>

            {/* Email */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}>
                Email
              </label>
              <input
                type="email"
                name="email"
                required
                placeholder="kamu@email.com"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.6rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.5)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Password */}
            <div>
              <label style={{
                display: 'block',
                marginBottom: '0.45rem',
                fontSize: '0.8rem',
                fontWeight: 600,
                color: 'rgba(255,255,255,0.5)',
                letterSpacing: '0.03em',
                textTransform: 'uppercase',
              }}>
                Password
              </label>
              <input
                type="password"
                name="password"
                required
                placeholder="••••••••"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  borderRadius: '0.6rem',
                  border: '1px solid rgba(255,255,255,0.1)',
                  background: 'rgba(255,255,255,0.05)',
                  color: 'white',
                  fontSize: '0.95rem',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s',
                }}
                onFocus={e => (e.target.style.borderColor = 'rgba(229,9,20,0.5)')}
                onBlur={e  => (e.target.style.borderColor = 'rgba(255,255,255,0.1)')}
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                marginTop: '0.5rem',
                width: '100%',
                padding: '0.95rem',
                borderRadius: '0.6rem',
                border: 'none',
                background: loading
                  ? 'rgba(229,9,20,0.4)'
                  : 'linear-gradient(135deg, #e50914 0%, #c0000e 100%)',
                color: 'white',
                fontSize: '0.95rem',
                fontWeight: 700,
                letterSpacing: '0.03em',
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(229,9,20,0.35)',
              }}
            >
              {loading ? 'Memproses…' : 'Masuk →'}
            </button>
          </form>

          {/* Footer link */}
          <p style={{
            marginTop: '1.75rem',
            textAlign: 'center',
            color: 'rgba(255,255,255,0.35)',
            fontSize: '0.85rem',
          }}>
            Belum punya akun?{' '}
            <Link href="/register" style={{
              color: '#e50914',
              textDecoration: 'none',
              fontWeight: 600,
            }}>
              Daftar di sini
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
