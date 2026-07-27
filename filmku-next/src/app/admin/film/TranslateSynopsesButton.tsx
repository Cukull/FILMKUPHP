'use client';

import { useState } from 'react';
import { translateAllSynopsesToIndonesian } from '@/actions/translate-synopsis';

export default function TranslateSynopsesButton() {
  const [loading, setLoading] = useState(false);
  const [resultMsg, setResultMsg] = useState('');

  const handleTranslate = async () => {
    if (
      !confirm(
        'Apakah kamu yakin ingin memperbarui semua sinopsis film/drama di database ke Bahasa Indonesia (menggunakan data resmi TMDB id-ID)?'
      )
    ) {
      return;
    }

    setLoading(true);
    setResultMsg('');

    try {
      const res = await translateAllSynopsesToIndonesian();
      if (res.success) {
        setResultMsg(`🎉 ${res.message}`);
      } else {
        setResultMsg(`⚠️ ${res.message}`);
      }
    } catch (err) {
      console.error(err);
      setResultMsg('⚠️ Terjadi kesalahan koneksi saat memperbarui sinopsis.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'inline-block' }}>
      <button
        type="button"
        disabled={loading}
        onClick={handleTranslate}
        style={{
          background: 'linear-gradient(135deg, #2563eb, #1d4ed8)',
          color: '#fff',
          border: '1px solid rgba(59, 130, 246, 0.4)',
          borderRadius: '0.5rem',
          padding: '0.5rem 1.15rem',
          fontWeight: 700,
          cursor: loading ? 'wait' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          boxShadow: '0 4px 14px rgba(37, 99, 235, 0.3)',
          transition: 'transform 0.2s ease',
        }}
        title="Terjemahkan / Ambil sinopsis resmi bahasa Indonesia untuk semua judul di database"
      >
        <span>🇮🇩</span>
        <span>{loading ? 'Memperbarui Sinopsis...' : 'Perbarui Sinopsis ke Bahasa Indonesia'}</span>
      </button>

      {resultMsg && (
        <div
          style={{
            marginTop: '0.75rem',
            padding: '0.65rem 1rem',
            borderRadius: '8px',
            background: resultMsg.includes('🎉') ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)',
            border: `1px solid ${resultMsg.includes('🎉') ? '#10b981' : '#ef4444'}`,
            color: resultMsg.includes('🎉') ? '#34d399' : '#f87171',
            fontSize: '0.85rem',
            fontWeight: 600,
          }}
        >
          {resultMsg}
        </div>
      )}
    </div>
  );
}
