'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import SpecularButton from './SpecularButton';
import { checkIsAdminAction } from '@/actions/check-admin';

// ══════════════════════════════════════════════════════════════════════════════════════
// SMARTLINK (DIRECT LINK) ADSTERRA UNTUK TOMBOL TONTON SEKARANG
// ══════════════════════════════════════════════════════════════════════════════════════
const SMARTLINK_URL = "https://www.effectivecpmnetwork.com/kne0qw3q7?key=9e4530e778fb6f17627bb9b3b53ef516";

interface CurtainRevealProps {
  children: React.ReactNode;
  buttonText?: string;
  movieKey?: string;
  onOpen?: () => void;
}

export default function CurtainReveal({
  children,
  buttonText = 'Tonton Sekarang',
  movieKey,
  onOpen,
}: CurtainRevealProps) {
  // 1. State boolean sederhana untuk mengontrol terbuka/tertutupnya tirai
  const [isOpen, setIsOpen] = useState(false);
  // State untuk unmount tirai dari DOM setelah animasi buka selesai sepenuhnya
  const [isUnmounted, setIsUnmounted] = useState(false);

  const [isAdmin, setIsAdmin] = useState(false);
  const [hasClickedAd, setHasClickedAd] = useState(false);

  // State untuk Pop-Up Sponsor Countdown berkelas setelah mengklik "Tonton Sekarang"
  const [showSponsorPopup, setShowSponsorPopup] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const handleCompleteAd = () => {
    setShowSponsorPopup(false);
    setIsOpen(true);
    if (onOpen) {
      onOpen();
    }
  };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showSponsorPopup && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (showSponsorPopup && countdown === 0) {
      // Otomatis buka tirai setelah timer mencapai 0
      timer = setTimeout(() => {
        handleCompleteAd();
      }, 350);
    }
    return () => clearTimeout(timer);
  }, [showSponsorPopup, countdown]);

  useEffect(() => {
    // Reset state saat berganti film agar tirai tertutup & iklan aktif kembali untuk film baru
    setIsOpen(false);
    setIsUnmounted(false);
    setHasClickedAd(false);
    setShowSponsorPopup(false);
    setCountdown(5);

    checkIsAdminAction().then((adminStatus) => {
      setIsAdmin(adminStatus);
      if (!adminStatus) {
        const storageKey = `filmku_ad_unlocked_${movieKey || 'default'}`;
        const unlocked = sessionStorage.getItem(storageKey);
        if (unlocked === 'true') {
          setHasClickedAd(true);
        }
      }
    });
  }, [movieKey]);

  const handleOpenCurtains = () => {
    // 1. Jika belum admin dan belum pernah klik iklan untuk film ini dalam sesi ini -> buka iklan Smartlink (klik 1x) & tampilkan Pop-up Sponsor Countdown 5 detik!
    if (!isAdmin && !hasClickedAd) {
      setHasClickedAd(true);
      const storageKey = `filmku_ad_unlocked_${movieKey || 'default'}`;
      sessionStorage.setItem(storageKey, 'true');
      if (SMARTLINK_URL && SMARTLINK_URL !== "") {
        window.open(SMARTLINK_URL, '_blank', 'noopener,noreferrer');
      }
      setCountdown(5);
      setShowSponsorPopup(true);
      return; // Tirai belum terbuka dulu, pop-up sponsor berkelas muncul!
    }

    // 2. Klik kedua atau jika admin -> buka tirai & putar film
    if (isOpen) return;
    setIsOpen(true);
    if (onOpen) {
      onOpen();
    }
  };

  // Jika animasi tirai sudah selesai, cukup render children (iframe YouTube/video) murni tanpa overlay DOM
  if (isUnmounted) {
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%' }}>
        {children}
      </div>
    );
  }

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        backgroundColor: '#000',
      }}
    >
      {/* 2. iframe YouTube/video TETAP di-render di belakang tirai sejak awal ( loaded duluan ) */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
          zIndex: 1,
        }}
      >
        {children}
      </div>

      {/* Overlay Tirai & Tombol (z-index tinggi & GPU layer agar menutupi iframe dengan sempurna) */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          inset: 0,
          zIndex: 99999,
          pointerEvents: isOpen ? 'none' : 'auto',
          transform: 'translateZ(100px)', // Memaksa GPU layer agar Chrome tidak me-render iframe di atas tirai
        }}
      >
        {/* ── PANEL TIRAI KIRI (50% Lebar) ── */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isOpen ? '-100%' : 0 }}
          transition={{
            duration: 1.1,
            ease: [0.65, 0, 0.35, 1], // Custom cubic-bezier untuk bobot fisik kain yang berat
          }}
          onAnimationComplete={() => {
            if (isOpen) {
              setIsUnmounted(true);
            }
          }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '50%',
            height: '100%',
            // Base gradient velvet (#4a0505 ke #8b0000 di tengah) + repeating-linear-gradient untuk tekstur lipatan kain
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                rgba(0, 0, 0, 0) 0px,
                rgba(0, 0, 0, 0) 12px,
                rgba(0, 0, 0, 0.38) 15px,
                rgba(0, 0, 0, 0) 18px
              ),
              linear-gradient(90deg, #4a0505 0%, #8b0000 100%)
            `,
            // Shadow gelap di tepi dalam (pertemuan tengah) untuk kesan kedalaman & overlap tirai
            boxShadow: 'inset -15px 0 30px rgba(0, 0, 0, 0.85)',
          }}
        />

        {/* ── PANEL TIRAI KANAN (50% Lebar) ── */}
        <motion.div
          initial={{ x: 0 }}
          animate={{ x: isOpen ? '100%' : 0 }}
          transition={{
            duration: 1.1,
            ease: [0.65, 0, 0.35, 1], // Custom cubic-bezier senada
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '50%',
            height: '100%',
            backgroundImage: `
              repeating-linear-gradient(
                90deg,
                rgba(0, 0, 0, 0) 0px,
                rgba(0, 0, 0, 0) 12px,
                rgba(0, 0, 0, 0.38) 15px,
                rgba(0, 0, 0, 0) 18px
              ),
              linear-gradient(270deg, #4a0505 0%, #8b0000 100%)
            `,
            // Shadow gelap di tepi dalam (pertemuan tengah)
            boxShadow: 'inset 15px 0 30px rgba(0, 0, 0, 0.85)',
          }}
        />

        {/* ── TOMBOL "TONTON SEKARANG" ATAU POP-UP SPONSOR COUNTDOWN ── */}
        <AnimatePresence mode="wait">
          {!isOpen && !showSponsorPopup && (
            <motion.div
              key="cta-button"
              initial={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85 }}
              transition={{ duration: 0.3 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 10,
              }}
            >
              <SpecularButton
                size="lg"
                radius={50}
                tint="#e50914"
                tintOpacity={0.88}
                blur={8}
                textColor="#ffffff"
                lineColor="#ff8088"
                baseColor="#8b0000"
                intensity={1.3}
                shineSize={14}
                shineFade={40}
                thickness={1.5}
                speed={0.35}
                followMouse={true}
                proximity={250}
                autoAnimate={true}
                onClick={handleOpenCurtains}
                style={{
                  boxShadow: '0 12px 30px rgba(229, 9, 20, 0.65), 0 4px 15px rgba(0, 0, 0, 0.8)'
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
                >
                  <path
                    d="M4 6H20M4 12H20M4 18H20"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M7 3.5L10 6.5M14 3.5L17 6.5"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                  <rect
                    x="3"
                    y="6"
                    width="18"
                    height="14"
                    rx="2"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path
                    d="M10 11.5L15 14L10 16.5V11.5Z"
                    fill="currentColor"
                  />
                </svg>
                <span>{buttonText}</span>
              </SpecularButton>
            </motion.div>
          )}

          {!isOpen && showSponsorPopup && (
            <motion.div
              key="sponsor-popup"
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              transition={{ duration: 0.35 }}
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                zIndex: 30,
                background: 'rgba(0, 0, 0, 0.65)',
                backdropFilter: 'blur(8px)',
                padding: '1.5rem',
              }}
            >
              {/* ── KOTAK POP-UP SPONSOR THEATER ── */}
              <div
                style={{
                  background: 'linear-gradient(135deg, rgba(20,20,20,0.95), rgba(45,8,8,0.95))',
                  border: '1px solid rgba(229, 9, 20, 0.45)',
                  borderRadius: '16px',
                  boxShadow: '0 25px 50px rgba(0,0,0,0.95), 0 0 35px rgba(229, 9, 20, 0.25)',
                  width: '90%',
                  maxWidth: '380px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {/* Header VIP Partner */}
                <span
                  style={{
                    fontSize: '0.68rem',
                    fontWeight: '800',
                    letterSpacing: '2px',
                    color: '#ff8088',
                    textTransform: 'uppercase',
                    background: 'rgba(229, 9, 20, 0.18)',
                    padding: '0.35rem 0.85rem',
                    borderRadius: '20px',
                    marginBottom: '1.2rem',
                  }}
                >
                  ★ FILMKU VIP THEATER PARTNER ★
                </span>

                {/* Banner Sponsor (Dibuat seperti card sponsor modern berkelas) */}
                <a
                  href={SMARTLINK_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    width: '100%',
                    background: 'linear-gradient(135deg, #e50914, #730009)',
                    borderRadius: '12px',
                    padding: '1.4rem 1rem',
                    color: '#fff',
                    textDecoration: 'none',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    boxShadow: '0 8px 25px rgba(229, 9, 20, 0.4)',
                    marginBottom: '1.4rem',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease',
                  }}
                  title="Klik untuk membuka sponsor partner"
                >
                  <span style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '1px', textShadow: '0 2px 5px rgba(0,0,0,0.5)' }}>
                    GRATIS UNTUKMU
                  </span>
                  <span style={{ fontSize: '0.78rem', opacity: 0.92, marginTop: '5px', fontWeight: 500 }}>
                    Streaming Film HD • Bebas Biaya
                  </span>
                </a>

                {/* Lingkaran Countdown Angka (persis Screenshot 1 IDLIX) */}
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '50%',
                    border: '2px solid #e50914',
                    background: 'rgba(0,0,0,0.65)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    color: '#fff',
                    boxShadow: '0 0 15px rgba(229, 9, 20, 0.5)',
                  }}
                >
                  {countdown}
                </div>
              </div>

              {/* ── TOMBOL "Skip in X s" / "Skip Ad" DI POJOK KANAN BAWAH (persis Screenshot 2 IDLIX) ── */}
              <button
                type="button"
                onClick={handleCompleteAd}
                style={{
                  position: 'absolute',
                  bottom: '24px',
                  right: '28px',
                  background: 'rgba(15, 15, 15, 0.9)',
                  border: '1px solid rgba(255,255,255,0.25)',
                  borderRadius: '8px',
                  padding: '9px 18px',
                  color: '#fff',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.6)',
                  transition: 'all 0.2s ease',
                  zIndex: 40,
                }}
              >
                <span>{countdown > 0 ? `Skip in ${countdown}s` : 'Skip Ad'}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line x1="19" y1="5" x2="19" y2="19" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
