'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CurtainRevealProps {
  children: React.ReactNode;
  buttonText?: string;
  onOpen?: () => void;
}

export default function CurtainReveal({
  children,
  buttonText = 'Tonton Sekarang',
  onOpen,
}: CurtainRevealProps) {
  // 1. State boolean sederhana untuk mengontrol terbuka/tertutupnya tirai
  const [isOpen, setIsOpen] = useState(false);
  // State untuk unmount tirai dari DOM setelah animasi buka selesai sepenuhnya
  const [isUnmounted, setIsUnmounted] = useState(false);

  const handleOpenCurtains = () => {
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

        {/* ── TOMBOL "TONTON SEKARANG" (CTA Merah FILMKU) ── */}
        <AnimatePresence>
          {!isOpen && (
            <motion.div
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
              <button
                type="button"
                onClick={handleOpenCurtains}
                style={{
                  padding: '1rem 2.8rem',
                  fontSize: '1.1rem',
                  fontWeight: 800,
                  color: '#ffffff',
                  background: 'linear-gradient(135deg, #e50914 0%, #b80710 100%)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  boxShadow:
                    '0 12px 30px rgba(229, 9, 20, 0.65), 0 4px 15px rgba(0, 0, 0, 0.8)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.6rem',
                  letterSpacing: '0.04em',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                  e.currentTarget.style.boxShadow =
                    '0 16px 35px rgba(229, 9, 20, 0.8), 0 6px 20px rgba(0, 0, 0, 0.9)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                  e.currentTarget.style.boxShadow =
                    '0 12px 30px rgba(229, 9, 20, 0.65), 0 4px 15px rgba(0, 0, 0, 0.8)';
                }}
              >
                <span>🎬</span>
                <span>{buttonText}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
