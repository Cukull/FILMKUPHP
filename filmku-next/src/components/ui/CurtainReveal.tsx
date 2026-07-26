'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface CurtainRevealProps {
  children: React.ReactNode;
  onOpen?: () => void;
  buttonText?: string;
}

export default function CurtainReveal({
  children,
  onOpen,
  buttonText = 'Tonton Sekarang'
}: CurtainRevealProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUnmounted, setIsUnmounted] = useState(false);

  const handleOpenCurtain = () => {
    if (isOpen) return;
    setIsOpen(true);
  };

  const handleAnimationComplete = () => {
    setIsUnmounted(true);
    if (onOpen) {
      onOpen();
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', overflow: 'hidden', borderRadius: '12px' }}>
      {/* ── Lapisan Konten Video Player di Bawah Tirai ── */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%' }}>
        {children}
      </div>

      {/* ── Lapisan Tirai & Tombol Buka ── */}
      {!isUnmounted && (
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: 20,
            display: 'flex',
            pointerEvents: isOpen ? 'none' : 'auto'
          }}
        >
          {/* Panel Kiri (50% lebar) */}
          <motion.div
            initial={{ x: '0%' }}
            animate={{ x: isOpen ? '-100%' : '0%' }}
            transition={{
              duration: 1.15,
              ease: [0.65, 0.05, 0.36, 1] // Heavy physical velvet fabric feel
            }}
            style={{
              width: '50%',
              height: '100%',
              position: 'relative',
              background: 'linear-gradient(90deg, #380202 0%, #680404 55%, #8b0000 100%)',
              boxShadow: 'inset -20px 0 35px -5px rgba(0,0,0,0.88), 10px 0 25px rgba(0,0,0,0.75)',
              overflow: 'hidden',
              zIndex: 2
            }}
          >
            {/* Tekstur lipatan tirai vertikal */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.08) 12px, rgba(255,255,255,0.07) 24px, rgba(0,0,0,0.45) 36px)',
                pointerEvents: 'none'
              }}
            />
          </motion.div>

          {/* Panel Kanan (50% lebar) */}
          <motion.div
            initial={{ x: '0%' }}
            animate={{ x: isOpen ? '100%' : '0%' }}
            transition={{
              duration: 1.15,
              ease: [0.65, 0.05, 0.36, 1] // Heavy physical velvet fabric feel
            }}
            onAnimationComplete={handleAnimationComplete}
            style={{
              width: '50%',
              height: '100%',
              position: 'relative',
              background: 'linear-gradient(90deg, #8b0000 0%, #680404 45%, #380202 100%)',
              boxShadow: 'inset 20px 0 35px -5px rgba(0,0,0,0.88), -10px 0 25px rgba(0,0,0,0.75)',
              overflow: 'hidden',
              zIndex: 2
            }}
          >
            {/* Tekstur lipatan tirai vertikal */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: 'repeating-linear-gradient(90deg, rgba(0,0,0,0.45) 0px, rgba(0,0,0,0.08) 12px, rgba(255,255,255,0.07) 24px, rgba(0,0,0,0.45) 36px)',
                pointerEvents: 'none'
              }}
            />
          </motion.div>

          {/* Tombol "Tonton Sekarang" di tengah tirai */}
          <AnimatePresence>
            {!isOpen && (
              <motion.div
                initial={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ duration: 0.35, ease: 'easeOut' }}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '1rem'
                }}
              >
                <button
                  onClick={handleOpenCurtain}
                  style={{
                    padding: '1rem 2.5rem',
                    background: 'linear-gradient(135deg, #e50914 0%, #990000 100%)',
                    color: '#ffffff',
                    border: '2px solid rgba(255, 255, 255, 0.25)',
                    borderRadius: '50px',
                    fontSize: '1.15rem',
                    fontWeight: 800,
                    letterSpacing: '0.05em',
                    cursor: 'pointer',
                    boxShadow: '0 12px 35px rgba(229, 9, 20, 0.6), 0 0 25px rgba(0, 0, 0, 0.8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.6rem',
                    transition: 'all 0.3s ease',
                    textTransform: 'uppercase'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.05)';
                    e.currentTarget.style.boxShadow = '0 15px 45px rgba(229, 9, 20, 0.85), 0 0 35px rgba(0, 0, 0, 0.9)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                    e.currentTarget.style.boxShadow = '0 12px 35px rgba(229, 9, 20, 0.6), 0 0 25px rgba(0, 0, 0, 0.8)';
                  }}
                >
                  <span style={{ fontSize: '1.25rem' }}>🎬</span> {buttonText}
                </button>
                <span
                  style={{
                    fontSize: '0.8rem',
                    color: 'rgba(255, 255, 255, 0.7)',
                    textShadow: '0 2px 4px rgba(0,0,0,0.8)',
                    letterSpacing: '0.05em'
                  }}
                >
                  Klik untuk membuka tirai bioskop
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
