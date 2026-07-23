'use client';

import { useState } from 'react';
import { loginAction, registerAction } from '@/actions/auth';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const DotField = dynamic(() => import('@/components/DotField'), { ssr: false });

/**
 * /auth — Halaman autentikasi gabungan Login + Register
 *
 * Layout:
 *  ┌──── Form Login ────┬──── Form Register ────┐
 *  │  (kiri, z-0)       │  (kanan, z-0)         │
 *  └────────────────────┴───────────────────────┘
 *                        ↑
 *  Panel merah (w-1/2, z-10) fixed di left:0
 *    • isRegister=false → translateX(100%) → menutupi KANAN (form register tersembunyi)
 *    • isRegister=true  → translateX(0)    → menutupi KIRI  (form login tersembunyi)
 *  Transisi CSS duration-[600ms] → panel benar-benar bergeser mulus
 */
export default function AuthPage() {
  // false = mode Login (panel di kanan), true = mode Register (panel di kiri)
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
        setTimeout(() => setIsRegister(false), 1200);
      }
    } catch { setRegError('Terjadi kesalahan, coba lagi.'); }
    setLoadingReg(false);
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#07070f]">

      {/* ── DotField background ── */}
      <div className="absolute inset-0 z-0">
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
          style={{ pointerEvents: 'auto' }}
        />
      </div>

      {/* Vignette */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at center, transparent 30%, rgba(7,7,15,0.82) 100%)' }} />

      {/* ── Back link ── */}
      <Link href="/"
            className="absolute top-6 left-6 z-20 text-white/30 hover:text-white/60 text-sm transition-colors flex items-center gap-1">
        ← Beranda
      </Link>

      {/*
      ════════════════════════════════════════════════
        CARD UTAMA
        min-h agar panel tidak "kolaps" di mobile
      ════════════════════════════════════════════════
      */}
      <div className="relative z-[2] w-full max-w-[860px] mx-4 rounded-2xl overflow-hidden
                      flex min-h-[540px]
                      bg-[#0d0d1a]
                      border border-white/[0.07]
                      shadow-[0_40px_100px_rgba(0,0,0,0.7)]">

        {/* ════ FORM LOGIN — sisi kiri ════ */}
        <div className={`
          w-1/2 flex flex-col justify-center px-10 py-12
          transition-opacity duration-300
          ${isRegister ? 'opacity-0 pointer-events-none' : 'opacity-100'}
        `}>
          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-[1.5rem] font-black tracking-[0.12em] text-red-500"
               style={{ textShadow: '0 0 24px rgba(229,9,20,0.55)' }}>
              FILMKU
            </p>
            <h2 className="mt-2 text-[1.2rem] font-bold text-white/90">Masuk ke Akun</h2>
            <p className="mt-1 text-xs text-white/30">Platform Bioskop Premium</p>
          </div>

          {loginError && (
            <div className="mb-5 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30
                            text-red-400 text-[0.82rem] flex gap-2 items-center">
              ⚠️ {loginError}
            </div>
          )}

          <form action={handleLogin} className="flex flex-col gap-4">
            <div>
              <label className="block mb-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-white/35">
                Email
              </label>
              <input type="email" name="email" required placeholder="kamu@email.com"
                     className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-white/25
                                bg-white/[0.05] border border-white/10
                                focus:outline-none focus:border-red-500/50 focus:bg-white/[0.08]
                                transition-all duration-200" />
            </div>
            <div>
              <label className="block mb-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-white/35">
                Password
              </label>
              <input type="password" name="password" required placeholder="••••••••"
                     className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-white/25
                                bg-white/[0.05] border border-white/10
                                focus:outline-none focus:border-red-500/50 focus:bg-white/[0.08]
                                transition-all duration-200" />
            </div>
            <button type="submit" disabled={loadingLogin}
                    className="mt-2 w-full py-3 rounded-lg font-bold text-sm tracking-wide text-white
                               bg-gradient-to-r from-red-600 to-red-800
                               hover:from-red-500 hover:to-red-700
                               shadow-lg shadow-red-900/30
                               transition-all duration-200 active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed">
              {loadingLogin ? 'Memproses…' : 'Masuk →'}
            </button>
          </form>

          <p className="mt-6 text-center text-xs text-white/25">
            Belum punya akun?{' '}
            <button onClick={() => setIsRegister(true)}
                    className="text-red-400 hover:text-red-300 font-semibold transition-colors">
              Daftar di sini
            </button>
          </p>
        </div>

        {/* ════ FORM REGISTER — sisi kanan ════ */}
        <div className={`
          w-1/2 flex flex-col justify-center px-10 py-12
          transition-opacity duration-300
          ${isRegister ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}>
          <div className="mb-7 text-center">
            <p className="text-[1.5rem] font-black tracking-[0.12em] text-red-500"
               style={{ textShadow: '0 0 24px rgba(229,9,20,0.55)' }}>
              FILMKU
            </p>
            <h2 className="mt-2 text-[1.2rem] font-bold text-white/90">Buat Akun Baru</h2>
            <p className="mt-1 text-xs text-white/30">Gratis selamanya ✨</p>
          </div>

          {regError && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-red-500/10 border border-red-500/30
                            text-red-400 text-[0.82rem] flex gap-2 items-center">
              ⚠️ {regError}
            </div>
          )}
          {regSuccess && (
            <div className="mb-4 px-4 py-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30
                            text-emerald-400 text-[0.82rem] flex gap-2 items-center">
              ✅ {regSuccess}
            </div>
          )}

          <form action={handleRegister} className="flex flex-col gap-3.5">
            <div>
              <label className="block mb-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-white/35">
                Nama Lengkap
              </label>
              <input type="text" name="name" required placeholder="John Doe"
                     className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-white/25
                                bg-white/[0.05] border border-white/10
                                focus:outline-none focus:border-red-500/50 focus:bg-white/[0.08]
                                transition-all duration-200" />
            </div>
            <div>
              <label className="block mb-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-white/35">
                Email
              </label>
              <input type="email" name="email" required placeholder="kamu@email.com"
                     className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-white/25
                                bg-white/[0.05] border border-white/10
                                focus:outline-none focus:border-red-500/50 focus:bg-white/[0.08]
                                transition-all duration-200" />
            </div>
            <div>
              <label className="block mb-1.5 text-[0.7rem] font-semibold uppercase tracking-widest text-white/35">
                Password
              </label>
              <input type="password" name="password" required placeholder="Min. 8 karakter"
                     className="w-full px-4 py-3 rounded-lg text-sm text-white placeholder-white/25
                                bg-white/[0.05] border border-white/10
                                focus:outline-none focus:border-red-500/50 focus:bg-white/[0.08]
                                transition-all duration-200" />
            </div>
            <button type="submit" disabled={loadingReg}
                    className="mt-1 w-full py-3 rounded-lg font-bold text-sm tracking-wide text-white
                               bg-gradient-to-r from-red-600 to-red-800
                               hover:from-red-500 hover:to-red-700
                               shadow-lg shadow-red-900/30
                               transition-all duration-200 active:scale-[0.98]
                               disabled:opacity-50 disabled:cursor-not-allowed">
              {loadingReg ? 'Memproses…' : 'Buat Akun →'}
            </button>
          </form>

          <p className="mt-5 text-center text-xs text-white/25">
            Sudah punya akun?{' '}
            <button onClick={() => setIsRegister(false)}
                    className="text-red-400 hover:text-red-300 font-semibold transition-colors">
              Masuk
            </button>
          </p>
        </div>

        {/*
        ════════════════════════════════════════════════════════
          SLIDING PANEL MERAH  (z-10, w-50%, h-full)
          Fixed di left:0 — bergerak via translateX SAJA
          ────────────────────────────────────────────────────
          isRegister = false (Login mode):
            translateX(100%)  → panel ada di sisi kanan
            → menutupi form Register

          isRegister = true (Register mode):
            translateX(0)     → panel ada di sisi kiri
            → menutupi form Login
        ════════════════════════════════════════════════════════
        */}
        <div
          className={`
            absolute top-0 left-0 w-1/2 h-full z-10
            flex flex-col items-center justify-center text-center
            px-10 py-12
            bg-gradient-to-br from-red-500 via-red-700 to-rose-900
            transition-transform duration-[600ms] ease-in-out
            ${isRegister ? 'translate-x-0' : 'translate-x-full'}
          `}
        >
          {/* Decorative rings */}
          <div className="absolute top-6 right-6 w-28 h-28 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute bottom-8 left-6 w-16 h-16 rounded-full border border-white/10 pointer-events-none" />
          {/* Big ambient glow */}
          <div className="absolute inset-0 pointer-events-none"
               style={{ background: 'radial-gradient(ellipse at 70% 30%, rgba(255,255,255,0.08) 0%, transparent 60%)' }} />

          {/* ── Konten Mode LOGIN (panel di kanan) ── */}
          <div className={`transition-opacity duration-200 delay-200 flex flex-col items-center gap-4
                           ${isRegister ? 'opacity-0 pointer-events-none absolute' : 'opacity-100'}`}>
            <div className="text-5xl">🍿</div>
            <h3 className="text-2xl font-black text-white leading-tight">
              Belum punya<br/>akun?
            </h3>
            <p className="text-sm text-white/65 max-w-[200px] leading-relaxed">
              Bergabung gratis dan nikmati jadwal bioskop, wishlist, dan komunitas film.
            </p>
            <button
              onClick={() => setIsRegister(true)}
              className="mt-2 px-8 py-3 rounded-full border-2 border-white text-white text-sm font-bold
                         hover:bg-white hover:text-red-700 transition-all duration-200 active:scale-95"
            >
              Daftar Sekarang
            </button>
          </div>

          {/* ── Konten Mode REGISTER (panel di kiri) ── */}
          <div className={`transition-opacity duration-200 delay-200 flex flex-col items-center gap-4
                           ${isRegister ? 'opacity-100' : 'opacity-0 pointer-events-none absolute'}`}>
            <div className="text-5xl">🎬</div>
            <h3 className="text-2xl font-black text-white leading-tight">
              Sudah punya<br/>akun?
            </h3>
            <p className="text-sm text-white/65 max-w-[200px] leading-relaxed">
              Masuk dan lanjutkan pengalaman sinema premium bersama FILMKU.
            </p>
            <button
              onClick={() => setIsRegister(false)}
              className="mt-2 px-8 py-3 rounded-full border-2 border-white text-white text-sm font-bold
                         hover:bg-white hover:text-red-700 transition-all duration-200 active:scale-95"
            >
              Masuk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
