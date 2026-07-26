'use client';

import { useState, Suspense, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMovieStreamUrl } from './action';
import CurtainReveal from '@/components/ui/CurtainReveal';

function StreamingContent() {
  const searchParams = useSearchParams();
  const queryTitle = searchParams.get('title') || 'The Backrooms'; // Default fallback
  
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Otomatis load stream di background saat halaman dibuka agar siap di balik tirai
  useEffect(() => {
    let active = true;
    async function loadStream() {
      setLoading(true);
      setErrorMsg('');
      setStreamUrl(null);
      try {
        const url = await getMovieStreamUrl(queryTitle);
        if (active) {
          if (url) {
            setStreamUrl(url);
          } else {
            setErrorMsg(`Gagal memuat video untuk "${queryTitle}". Film tidak ditemukan atau ID salah.`);
          }
        }
      } catch (err) {
        if (active) setErrorMsg('Terjadi kesalahan saat memproses permintaan.');
      } finally {
        if (active) setLoading(false);
      }
    }
    loadStream();
    return () => { active = false; };
  }, [queryTitle]);

  const handleReload = async () => {
    setLoading(true);
    setErrorMsg('');
    setStreamUrl(null);
    try {
      const url = await getMovieStreamUrl(queryTitle);
      if (url) {
        setStreamUrl(url);
      } else {
        setErrorMsg(`Gagal memuat video untuk "${queryTitle}". Film tidak ditemukan atau ID salah.`);
      }
    } catch (err) {
      setErrorMsg('Terjadi kesalahan saat memproses permintaan.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem', fontWeight: 'bold' }}>
        Nonton: {queryTitle}
      </h1>
      <p style={{ color: '#aaa', marginBottom: '1.5rem' }}>
        Klik tombol pada tirai bioskop di bawah untuk membuka tirai dan menonton video.
      </p>

      {/* ── Area Layar Bioskop & Tirai Velvet Red ── */}
      <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#07070f', borderRadius: '12px', overflow: 'hidden', border: '1px solid #333', boxShadow: '0 20px 50px rgba(0,0,0,0.8)' }}>
        <CurtainReveal 
          buttonText="Tonton Sekarang"
          onOpen={() => {
            console.log("Tirai terbuka penuh. Memulai pemutaran video...");
          }}
        >
          <div style={{ position: 'relative', width: '100%', height: '100%', minHeight: '400px', background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {loading && (
              <div style={{ color: '#aaa', fontSize: '1.1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#e50914', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                <span>Memuat stream video untuk "{queryTitle}"...</span>
              </div>
            )}

            {!loading && errorMsg && (
              <div style={{ padding: '1.5rem', background: 'rgba(255,0,0,0.15)', border: '1px solid rgba(255,0,0,0.4)', borderRadius: '8px', textAlign: 'center', maxWidth: '80%', zIndex: 5 }}>
                <p style={{ color: '#ff8888', margin: '0 0 1rem 0', fontWeight: 'bold' }}>{errorMsg}</p>
                <button 
                  onClick={handleReload}
                  style={{
                    padding: '0.5rem 1.5rem',
                    backgroundColor: '#e50914',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '6px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  🔄 Coba Lagi
                </button>
              </div>
            )}

            {!loading && streamUrl && (
              <iframe 
                src={streamUrl} 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allowFullScreen 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
              />
            )}
          </div>
        </CurtainReveal>
      </div>
    </>
  );
}

export default function TestStreamingPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '900px', margin: '4rem auto', color: '#fff', fontFamily: 'sans-serif' }}>
      <Suspense fallback={<div style={{ color: '#fff' }}>Memuat halaman...</div>}>
        <StreamingContent />
      </Suspense>
    </div>
  );
}
