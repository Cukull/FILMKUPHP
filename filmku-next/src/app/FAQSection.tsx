'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ScrollFloat from '@/components/ui/ScrollFloat';

const faqs = [
  {
    q: "Apakah FILMKU bisa ditonton di berbagai perangkat?",
    a: "Tentu saja! Anda bisa menikmati tayangan FILMKU melalui smartphone, tablet, laptop, komputer desktop, hingga Smart TV yang didukung.",
  },
  {
    q: "Apakah ada biaya tambahan untuk resolusi 4K?",
    a: "Tidak ada biaya tersembunyi. Semua tayangan dengan resolusi Ultra HD 4K dan dukungan audio Dolby Atmos sudah termasuk secara gratis.",
  },
  {
    q: "Apakah saya bisa menonton secara offline?",
    a: "Ya, Anda bisa mengunduh film atau serial favorit Anda melalui aplikasi FILMKU untuk ditonton kapan saja dan di mana saja tanpa koneksi internet.",
  },
  {
    q: "Berapa banyak profil yang bisa dibuat dalam 1 akun?",
    a: "Anda dapat membuat hingga 5 profil pengguna berbeda dalam satu akun, lengkap dengan rekomendasi dan daftar tontonan (Wishlist) yang terpisah.",
  },
];

export default function FAQSection() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="faq-section" style={{ padding: '4rem 2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <ScrollFloat
          animationDuration={1}
          ease="back.inOut(2)"
          scrollStart="center bottom+=50%"
          scrollEnd="bottom bottom-=40%"
          stagger={0.03}
          textStyle={{ fontSize: 'clamp(4rem, 6vw, 5.5rem)', fontWeight: 800, color: 'var(--text-primary)', whiteSpace: 'normal', display: 'block' }}
        >
          Tanya Jawab (FAQ)
        </ScrollFloat>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <motion.div 
              key={i} 
              className="faq-item"
              initial={false}
              animate={{ 
                backgroundColor: isOpen ? 'rgba(229, 9, 20, 0.05)' : 'rgba(20, 20, 30, 0.5)',
                borderColor: isOpen ? 'rgba(229, 9, 20, 0.5)' : 'rgba(255, 255, 255, 0.05)'
              }}
              style={{
                borderRadius: '16px',
                border: '1px solid',
                overflow: 'hidden'
              }}
            >
              <button 
                className="faq-question" 
                onClick={() => setOpen(isOpen ? null : i)}
                style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1.5rem',
                  background: 'transparent',
                  border: 'none',
                  color: '#fff',
                  fontSize: '1.1rem',
                  fontWeight: 500,
                  textAlign: 'left',
                  cursor: 'pointer'
                }}
              >
                <span>{faq.q}</span>
                <motion.span 
                  style={{ color: 'var(--accent)', fontSize: '1.5rem', flexShrink: 0, fontWeight: 300 }}
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.3, ease: 'easeInOut' }}
                >
                  +
                </motion.span>
              </button>
              
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    <div className="faq-answer" style={{ padding: '0 1.5rem 1.5rem 1.5rem', color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
                      {faq.a}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
