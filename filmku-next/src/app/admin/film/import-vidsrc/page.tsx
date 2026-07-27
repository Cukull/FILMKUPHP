'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getTrendingToImport,
  searchTmdbForImport,
  importMovieToDatabase,
  ImportCandidate,
} from '@/actions/import-vidsrc';

export default function AdminImportVidSrcPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'drakor' | 'drachin' | 'movie'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [candidates, setCandidates] = useState<ImportCandidate[]>([]);
  const [loading, setLoading] = useState(false);
  const [importingId, setImportingId] = useState<number | null>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Ambil data trending saat tab atau halaman berubah
  useEffect(() => {
    if (!searchQuery.trim()) {
      fetchTrending(activeTab, currentPage);
    } else {
      fetchSearch(searchQuery, currentPage);
    }
  }, [activeTab, currentPage]);

  const fetchTrending = async (tab: 'all' | 'drakor' | 'drachin' | 'movie', pageNum: number) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await getTrendingToImport(tab, pageNum);
      setCandidates(data);
    } catch (err) {
      console.error(err);
      setErrorMsg('Gagal memuat daftar dari server.');
    } finally {
      setLoading(false);
    }
  };

  const fetchSearch = async (query: string, pageNum: number) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const data = await searchTmdbForImport(query, pageNum);
      setCandidates(data);
      if (data.length === 0) {
        setErrorMsg(`Tidak ditemukan hasil untuk "${query}" di Halaman ${pageNum}.`);
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan saat mencari judul.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    if (!searchQuery.trim()) {
      fetchTrending(activeTab, 1);
    } else {
      fetchSearch(searchQuery, 1);
    }
  };

  const handleImport = async (item: ImportCandidate) => {
    setImportingId(item.tmdbId);
    setSuccessMsg('');
    setErrorMsg('');
    try {
      const res = await importMovieToDatabase({
        title: item.title,
        originalTitle: item.originalTitle || item.title, // Simpan judul asli untuk pencarian TMDB
        synopsis: item.overview,
        posterUrl: item.posterUrl,
        rating: item.rating,
        genre: item.genres,
        mediaType: item.mediaType,
        releaseYear: item.releaseYear,
        tmdbId: item.tmdbId,
        country: item.country,
        originalLanguage: item.originalLanguage,
      });

      if (res.success) {
        setSuccessMsg(`🎉 "${item.title}" berhasil diimport ke database FilmKu!`);
        setCandidates((prev) =>
          prev.map((c) => (c.tmdbId === item.tmdbId ? { ...c, alreadyInDb: true } : c))
        );
      } else {
        setErrorMsg(res.message || 'Gagal mengimport film.');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('Terjadi kesalahan koneksi.');
    } finally {
      setImportingId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    if (newPage < 1) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 350, behavior: 'smooth' });
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', color: '#fff' }}>
      {/* ── HEADER ── */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '2rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <Link
            href="/admin/film"
            style={{
              color: '#888',
              textDecoration: 'none',
              fontSize: '0.85rem',
              display: 'inline-block',
              marginBottom: '0.5rem',
            }}
          >
            ← Kembali ke Daftar Film
          </Link>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 800, margin: 0 }}>
            ⚡ Auto-Import Film, Drakor & Drachin
          </h1>
          <p style={{ color: '#aaa', margin: '0.4rem 0 0' }}>
            Ambil poster, sinopsis, genre, dan rating resmi secara otomatis langsung ke database kamu (40 Item per Halaman).
          </p>
        </div>

        <Link href="/admin/film">
          <button
            style={{
              background: 'rgba(255,255,255,0.08)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#fff',
              padding: '0.6rem 1.25rem',
              borderRadius: '8px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            📋 Lihat Database FilmKu
          </button>
        </Link>
      </div>

      {/* ── ALERTS / PESAN SUKSES ── */}
      {successMsg && (
        <div
          style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid #10b981',
            color: '#34d399',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <span>{successMsg}</span>
          <button
            onClick={() => setSuccessMsg('')}
            style={{ background: 'none', border: 'none', color: '#34d399', cursor: 'pointer', fontSize: '1.1rem' }}
          >
            ✕
          </button>
        </div>
      )}

      {errorMsg && (
        <div
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid #ef4444',
            color: '#f87171',
            padding: '1rem 1.25rem',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            fontWeight: 600,
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {/* ── FORM PENCARIAN ── */}
      <form
        onSubmit={handleSearchSubmit}
        style={{
          display: 'flex',
          gap: '0.75rem',
          marginBottom: '2rem',
          background: 'rgba(255,255,255,0.04)',
          padding: '0.75rem',
          borderRadius: '16px',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari judul apa pun (misal: Squid Game, Queen of Tears, Hidden Love, Agak Laen)..."
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            color: '#fff',
            fontSize: '1rem',
            padding: '0.5rem 1rem',
            outline: 'none',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => {
              setSearchQuery('');
              setCurrentPage(1);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#888',
              cursor: 'pointer',
              padding: '0 0.5rem',
            }}
          >
            ✕ Reset
          </button>
        )}
        <button
          type="submit"
          style={{
            background: 'linear-gradient(135deg, #e50914, #99050d)',
            color: '#fff',
            border: 'none',
            borderRadius: '10px',
            padding: '0.65rem 1.75rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(229, 9, 20, 0.4)',
          }}
        >
          🔍 Cari untuk Import
        </button>
      </form>

      {/* ── TAB FILTER POPULER ── */}
      {!searchQuery && (
        <div style={{ display: 'flex', gap: '0.6rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
          {[
            { id: 'all', label: '🔥 Semua Trending', icon: '✨' },
            { id: 'drakor', label: '🇰🇷 Drama Korea Populer', icon: '📺' },
            { id: 'drachin', label: '🇨🇳 Drama China Populer', icon: '🏮' },
            { id: 'movie', label: '🎬 Film Populer', icon: '🍿' },
          ].map((t) => {
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id as any);
                  setCurrentPage(1);
                }}
                style={{
                  padding: '0.65rem 1.4rem',
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: isActive ? '#e50914' : 'rgba(255,255,255,0.12)',
                  background: isActive
                    ? 'linear-gradient(135deg, #e50914, #99050d)'
                    : 'rgba(255,255,255,0.05)',
                  color: isActive ? '#fff' : '#ccc',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  transition: 'all 0.25s ease',
                }}
              >
                <span>{t.icon}</span>
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ── BARIS PAGINATION ATAS ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          background: 'rgba(255,255,255,0.04)',
          padding: '0.8rem 1.25rem',
          borderRadius: '14px',
          border: '1px solid rgba(255,255,255,0.08)',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <span style={{ fontSize: '0.9rem', color: '#ccc' }}>
          Menampilkan <strong>{candidates.length} Judul</strong> di Halaman <strong>{currentPage}</strong>
        </span>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <button
            type="button"
            disabled={currentPage <= 1 || loading}
            onClick={() => handlePageChange(currentPage - 1)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: currentPage <= 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
              color: currentPage <= 1 ? '#555' : '#fff',
              cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            ◀ Sebelumnya
          </button>

          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pageNum) => (
            <button
              key={pageNum}
              type="button"
              onClick={() => handlePageChange(pageNum)}
              style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                border: '1px solid',
                borderColor: currentPage === pageNum ? '#e50914' : 'rgba(255,255,255,0.12)',
                background: currentPage === pageNum ? '#e50914' : 'transparent',
                color: '#fff',
                fontWeight: currentPage === pageNum ? 700 : 500,
                cursor: 'pointer',
                fontSize: '0.85rem',
              }}
            >
              {pageNum}
            </button>
          ))}

          <button
            type="button"
            disabled={loading || candidates.length === 0}
            onClick={() => handlePageChange(currentPage + 1)}
            style={{
              padding: '0.45rem 1rem',
              borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.15)',
              background: 'rgba(255,255,255,0.08)',
              color: '#fff',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.85rem',
            }}
          >
            Selanjutnya ▶
          </button>
        </div>
      </div>

      {/* ── GRID DAFTAR CANDIDATE ── */}
      {loading ? (
        <div style={{ padding: '5rem 0', textAlign: 'center', color: '#aaa', fontSize: '1.2rem' }}>
          ⏳ Sedang memuat 40 judul dari server TMDB & VidSrc (Halaman {currentPage})...
        </div>
      ) : candidates.length === 0 ? (
        <div style={{ padding: '4rem 0', textAlign: 'center', color: '#888' }}>
          Tidak ada judul yang tersedia di halaman ini.
        </div>
      ) : (
        <>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: '1.75rem',
              marginBottom: '3rem',
            }}
          >
            {candidates.map((item) => {
              const isImporting = importingId === item.tmdbId;
              return (
                <div
                  key={item.tmdbId}
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.09)',
                    borderRadius: '16px',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.25s ease, border-color 0.25s ease',
                  }}
                >
                  {/* Poster */}
                  <div style={{ position: 'relative', width: '100%', aspectRatio: '2/3', background: '#111' }}>
                    {item.posterUrl ? (
                      <img
                        src={item.posterUrl}
                        alt={item.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#666',
                          fontSize: '0.8rem',
                        }}
                      >
                        No Poster
                      </div>
                    )}

                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        left: '10px',
                        background: 'rgba(0,0,0,0.75)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '8px',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: '#fbbf24',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      ★ {item.rating}
                    </div>

                    <div
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background:
                          item.mediaType === 'tv'
                            ? 'rgba(59, 130, 246, 0.85)'
                            : 'rgba(229, 9, 20, 0.85)',
                        padding: '0.3rem 0.6rem',
                        borderRadius: '8px',
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        color: '#fff',
                        backdropFilter: 'blur(4px)',
                      }}
                    >
                      {item.mediaType === 'tv' ? '📺 TV SERIES' : '🎬 MOVIE'}
                    </div>
                  </div>

                  {/* Deskripsi Singkat */}
                  <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <h3
                      style={{
                        fontSize: '1.05rem',
                        fontWeight: 700,
                        margin: '0 0 0.4rem',
                        color: '#fff',
                        display: '-webkit-box',
                        WebkitLineClamp: 1,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                      title={item.title}
                    >
                      {item.title}
                    </h3>

                    <div
                      style={{
                        fontSize: '0.8rem',
                        color: '#888',
                        marginBottom: '0.75rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                      }}
                    >
                      <span>{item.releaseYear}</span>
                      <span>•</span>
                      <span style={{ color: '#bbb' }}>{item.genres}</span>
                    </div>

                    <p
                      style={{
                        fontSize: '0.82rem',
                        color: '#aaa',
                        lineHeight: 1.4,
                        marginBottom: '1.25rem',
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {item.overview}
                    </p>

                    <div style={{ marginTop: 'auto' }}>
                      {item.alreadyInDb ? (
                        <button
                          disabled
                          style={{
                            width: '100%',
                            padding: '0.7rem',
                            borderRadius: '10px',
                            border: '1px solid rgba(16, 185, 129, 0.3)',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: '#34d399',
                            fontWeight: 700,
                            fontSize: '0.85rem',
                            cursor: 'not-allowed',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                          }}
                        >
                          <span>✓</span>
                          <span>Sudah di Database</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled={isImporting}
                          onClick={() => handleImport(item)}
                          style={{
                            width: '100%',
                            padding: '0.7rem',
                            borderRadius: '10px',
                            border: 'none',
                            background: isImporting
                              ? '#444'
                              : 'linear-gradient(135deg, #e50914, #99050d)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.9rem',
                            cursor: isImporting ? 'wait' : 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.4rem',
                            boxShadow: isImporting ? 'none' : '0 4px 14px rgba(229, 9, 20, 0.4)',
                            transition: 'all 0.2s ease',
                          }}
                        >
                          <span>{isImporting ? '⏳' : '⚡'}</span>
                          <span>{isImporting ? 'Mengimport...' : '+ Import ke Database'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ── BARIS PAGINATION BAWAH ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              padding: '1.5rem',
              background: 'rgba(255,255,255,0.04)',
              borderRadius: '14px',
              border: '1px solid rgba(255,255,255,0.08)',
              flexWrap: 'wrap',
            }}
          >
            <button
              type="button"
              disabled={currentPage <= 1 || loading}
              onClick={() => handlePageChange(currentPage - 1)}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: currentPage <= 1 ? 'rgba(255,255,255,0.02)' : 'rgba(255,255,255,0.08)',
                color: currentPage <= 1 ? '#555' : '#fff',
                cursor: currentPage <= 1 ? 'not-allowed' : 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              ◀ Halaman Sebelumnya
            </button>

            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => handlePageChange(pageNum)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: currentPage === pageNum ? '#e50914' : 'rgba(255,255,255,0.12)',
                  background: currentPage === pageNum ? '#e50914' : 'transparent',
                  color: '#fff',
                  fontWeight: currentPage === pageNum ? 700 : 500,
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                }}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={loading || candidates.length === 0}
              onClick={() => handlePageChange(currentPage + 1)}
              style={{
                padding: '0.55rem 1.25rem',
                borderRadius: '8px',
                border: '1px solid rgba(255,255,255,0.15)',
                background: 'rgba(255,255,255,0.08)',
                color: '#fff',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '0.9rem',
              }}
            >
              Halaman Selanjutnya ▶
            </button>
          </div>
        </>
      )}
    </div>
  );
}
