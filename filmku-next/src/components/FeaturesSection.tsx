'use client';

import { motion } from 'framer-motion';

const FEATURES = [
  { 
    icon: "🎬", 
    title: "Koleksi Terlengkap", 
    desc: "Nikmati ribuan judul film, serial, dan drama dari berbagai genre secara eksklusif setiap harinya." 
  },
  { 
    icon: "⚡", 
    title: "Streaming Super Cepat", 
    desc: "Teknologi adaptive bitrate streaming memastikan tayangan selalu lancar tanpa buffering di semua perangkat." 
  },
  { 
    icon: "📺", 
    title: "Ultra HD 4K & Atmos", 
    desc: "Manjakan mata dan telinga Anda dengan resolusi tajam 4K HDR dan kualitas audio memukau dari Dolby Atmos." 
  },
  { 
    icon: "🍿", 
    title: "Tonton Tanpa Iklan", 
    desc: "Rasakan pengalaman sinematik yang utuh dari awal hingga akhir tanpa gangguan iklan sedikitpun." 
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      type: 'spring', 
      stiffness: 100, 
      damping: 12 
    } 
  },
};

export default function FeaturesSection() {
  return (
    <motion.div 
      className="feature-grid"
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        padding: '0 2rem',
        maxWidth: '1280px',
        margin: '0 auto'
      }}
    >
      {FEATURES.map((f, i) => (
        <motion.div 
          key={i} 
          className="feature-card"
          variants={cardVariants}
          whileHover={{ 
            y: -8, 
            scale: 1.02,
            boxShadow: '0 20px 40px rgba(229, 9, 20, 0.15)',
            borderColor: 'rgba(229, 9, 20, 0.3)'
          }}
          style={{
            background: 'linear-gradient(145deg, rgba(20,20,30,0.8) 0%, rgba(10,10,15,0.9) 100%)',
            border: '1px solid rgba(255,255,255,0.05)',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '1rem',
            transition: 'border-color 0.3s ease',
            cursor: 'default'
          }}
        >
          <motion.div 
            className="feature-icon"
            whileHover={{ rotate: [0, -10, 10, -10, 0], scale: 1.1 }}
            transition={{ duration: 0.5 }}
            style={{
              fontSize: '3.5rem',
              background: 'rgba(229, 9, 20, 0.1)',
              width: '80px',
              height: '80px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '20px',
              marginBottom: '0.5rem',
              boxShadow: 'inset 0 0 20px rgba(229,9,20,0.1)'
            }}
          >
            {f.icon}
          </motion.div>
          <h3 className="feature-title" style={{ fontSize: '1.4rem', fontWeight: 700, color: '#fff', margin: 0 }}>
            {f.title}
          </h3>
          <p className="feature-desc" style={{ fontSize: '0.95rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1.6, margin: 0 }}>
            {f.desc}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
