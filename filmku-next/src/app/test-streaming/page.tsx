'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { getMovieStreamUrl } from './action';
import CurtainReveal from '@/components/ui/CurtainReveal';
import CinemaFrame from '@/components/ui/CinemaFrame';

function StreamingContent() {
  const searchParams = useSearchParams();
  const queryTitle = searchParams.get('title') || 'The Backrooms'; // Default fallback
  
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleTontonFilm = async () => {
    setLoading(true);
    setErrorMsg('');
    setStreamUrl(null);
    
    try {
      // Mengirim queryTitle ke action, action akan mencari TMDB ID dan mengembalikan link vidsrc
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
      <p style={{ color: '#aaa', marginBottom: '2rem' }}>
        Klik tombol di bawah untuk memuat video player.
      </p>
      
      {!streamUrl && (
        <div style={{ marginBottom: '2rem' }}>
          <button 
            onClick={handleTontonFilm} 
            disabled={loading}
            style={{
              padding: '0.8rem 2rem',
              backgroundColor: '#e50914',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Memproses...' : '▶ Tonton Film'}
          </button>
        </div>
      )}

      {errorMsg && (
        <div style={{ padding: '1rem', background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)', borderRadius: '8px', marginBottom: '2rem' }}>
          <p style={{ color: '#ff8888', margin: 0 }}>{errorMsg}</p>
        </div>
      )}

      {streamUrl && (
        <CinemaFrame title={`PREMIUM THEATER: ${queryTitle}`}>
          <CurtainReveal buttonText="Tonton Sekarang">
            <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000', borderRadius: '0', overflow: 'hidden' }}>
              <iframe 
                src={streamUrl} 
                width="100%" 
                height="100%" 
                frameBorder="0" 
                allowFullScreen 
                style={{ position: 'absolute', top: 0, left: 0 }}
              />
            </div>
          </CurtainReveal>
        </CinemaFrame>
      )}
    </>
  );
}

export default function TestStreamingPage() {
  return (
    <div style={{ padding: '2rem', maxWidth: '1080px', margin: '4rem auto', color: '#fff', fontFamily: 'sans-serif' }}>
      <Suspense fallback={<div style={{ color: '#fff' }}>Memuat halaman...</div>}>
        <StreamingContent />
      </Suspense>
    </div>
  );
}
