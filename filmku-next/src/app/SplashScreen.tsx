'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const LETTERS = 'FILMKU'.split('');

export default function SplashScreen() {
  const [showSplash, setShowSplash] = useState(false);

  useEffect(() => {
    const seen = sessionStorage.getItem('hasSeenSplash');
    if (!seen) {
      setShowSplash(true);
      sessionStorage.setItem('hasSeenSplash', 'true');
      const t = setTimeout(() => setShowSplash(false), 3000);
      return () => clearTimeout(t);
    }
  }, []);

  return (
    <AnimatePresence>
      {showSplash && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.9, ease: [0.4, 0, 0.2, 1] }}
          style={{
            position: 'fixed',
            inset: 0,
            background: '#07070f',
            zIndex: 99999,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* ── Ambient neon red glow (pulsing) ── */}
          <motion.div
            animate={{ scale: [1, 1.4, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '700px', height: '500px',
              background: 'radial-gradient(ellipse at center, rgba(229,9,20,0.28) 0%, rgba(229,9,20,0.1) 40%, transparent 70%)',
              filter: 'blur(60px)',
              pointerEvents: 'none',
            }}
          />
          {/* Secondary inner glow */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], opacity: [0.8, 0.4, 0.8] }}
            transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
            style={{
              position: 'absolute',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '280px', height: '160px',
              background: 'radial-gradient(ellipse at center, rgba(229,9,20,0.35) 0%, transparent 70%)',
              pointerEvents: 'none',
            }}
          />

          {/* ── Film perforation strips ── */}
          {['top', 'bottom'].map(pos => (
            <motion.div
              key={pos}
              initial={{ opacity: 0, x: pos === 'top' ? -40 : 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.6, ease: 'easeOut' }}
              style={{
                position: 'absolute',
                [pos]: '14%',
                display: 'flex',
                gap: '10px',
                opacity: 0.2,
              }}
            >
              {Array.from({ length: 14 }).map((_, i) => (
                <div key={i} style={{ width: '16px', height: '10px', borderRadius: '2px', border: '1.5px solid rgba(229,9,20,0.8)', background: 'transparent' }} />
              ))}
            </motion.div>
          ))}

          {/* ── FILMKU letter-by-letter reveal ── */}
          <div style={{ display: 'flex', gap: '0.15em', position: 'relative' }}>
            {LETTERS.map((char, i) => (
              <motion.span
                key={i}
                initial={{ opacity: 0, y: 70, filter: 'blur(12px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                transition={{ duration: 0.75, delay: i * 0.1 + 0.25, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontSize: 'clamp(3.5rem, 9vw, 5.5rem)',
                  fontWeight: 900,
                  color: '#e50914',
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  textShadow: `
                    0 0 20px rgba(229,9,20,0.9),
                    0 0 40px rgba(229,9,20,0.6),
                    0 0 80px rgba(229,9,20,0.3),
                    0 0 120px rgba(229,9,20,0.15)
                  `,
                  display: 'inline-block',
                }}
              >
                {char}
              </motion.span>
            ))}
          </div>

          {/* ── Tagline ── */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 0.45, y: 0 }}
            transition={{ duration: 0.8, delay: 1.3, ease: 'easeOut' }}
            style={{
              marginTop: '1rem',
              fontSize: '0.7rem',
              letterSpacing: '0.35em',
              color: 'rgba(255,255,255,0.5)',
              textTransform: 'uppercase',
              fontWeight: 600,
            }}
          >
            Platform Bioskop Premium
          </motion.p>

          {/* ── Progress bar ── */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{ position: 'absolute', bottom: '15%', width: '200px' }}
          >
            <div style={{ height: '2px', background: 'rgba(255,255,255,0.07)', borderRadius: '2px', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.4, delay: 1.5, ease: 'easeInOut' }}
                style={{
                  height: '100%',
                  background: 'linear-gradient(to right, rgba(229,9,20,0.6), #e50914, rgba(229,9,20,0.6))',
                  borderRadius: '2px',
                  boxShadow: '0 0 12px rgba(229,9,20,0.9)',
                }}
              />
            </div>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              transition={{ delay: 1.6 }}
              style={{ textAlign: 'center', fontSize: '0.65rem', color: 'rgba(255,255,255,0.35)', marginTop: '0.75rem', letterSpacing: '0.12em' }}
            >
              Memuat pengalaman sinema...
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
