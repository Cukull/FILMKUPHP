'use client';

import { useState, useTransition } from 'react';
import { createMovie, updateMovie } from '@/actions/admin';
import { useRouter } from 'next/navigation';

const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'];
const SECTIONS = ['Sorotan Layar Utama', 'Pesona Asia & K-Drama', 'Rilisan Tersegar', 'Lagi Viral Nih', 'Tangga Teratas Box Office', 'Karya Anak Bangsa', 'Serem Banget', 'Yang Akan Datang', 'Perang'];

// Convert raw minutes → "Xh Ym"
function formatDuration(mins?: number | null) {
  if (!mins) return '';
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

// Parse "Xh Ym" / "Xhm" / "Xm" / plain number → total minutes
function parseDurationToMinutes(str: string): number | undefined {
  if (!str) return undefined;
  const hMatch = str.match(/(\d+)\s*h/i);
  const mMatch = str.match(/(?:^|\s)(\d+)\s*m/i);
  if (hMatch || mMatch) {
    const h = hMatch ? parseInt(hMatch[1]) : 0;
    const m = mMatch ? parseInt(mMatch[1]) : 0;
    return h * 60 + m;
  }
  const plain = str.match(/^(\d+)$/);
  return plain ? parseInt(plain[1]) : undefined;
}

export default function FilmForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetchingOMDB, setIsFetchingOMDB] = useState(false);
  const [omdbError, setOmdbError] = useState('');
  const [omdbSuccess, setOmdbSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    rating: initialData?.rating?.toString() || '',
    durationMin: formatDuration(initialData?.durationMin) || '',
    rottenTomatoes: initialData?.rottenTomatoes || '',
    metacritic: initialData?.metacritic || '',
    posterUrl: initialData?.posterUrl || '',
    trailerUrl: initialData?.trailerUrl || '',
    synopsis: initialData?.synopsis || '',
    director: initialData?.director || '',
    cast: initialData?.cast || '',
    status: initialData?.status || 'NOW_PLAYING',
  });

  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    initialData?.genre ? initialData.genre.split(',').map((g: string) => g.trim()) : []
  );
  const [selectedSections, setSelectedSections] = useState<string[]>(
    initialData?.sections ? initialData.sections.split(',').map((g: string) => g.trim()) : []
  );

  const handleOMDBFetch = async () => {
    if (!formData.title) { setOmdbError('Isi judul film terlebih dahulu'); return; }
    setIsFetchingOMDB(true);
    setOmdbError('');
    setOmdbSuccess(false);
    try {
      const res = await fetch(`/api/fetch-movie?title=${encodeURIComponent(formData.title)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();

      if (json.error) {
        setOmdbError(json.error);
        return;
      }
      if (!json.data) {
        setOmdbError('Tidak ada data dari API.');
        return;
      }

      const d = json.data;
      // Always replace field if API returned a value (including empty string → keep prev)
      setFormData(prev => ({
        ...prev,
        synopsis: d.synopsis ? d.synopsis : prev.synopsis,
        posterUrl: d.posterUrl ? d.posterUrl : prev.posterUrl,
        rating: d.rating != null ? String(d.rating) : prev.rating,
        durationMin: d.durationMin != null ? formatDuration(d.durationMin) : prev.durationMin,
        rottenTomatoes: d.rottenTomatoes ? d.rottenTomatoes : prev.rottenTomatoes,
        metacritic: d.metacritic ? d.metacritic : prev.metacritic,
        director: d.director ? d.director : prev.director,
        cast: d.cast ? d.cast : prev.cast,
      }));

      // Update genres from TMDB if returned
      if (d.genre) {
        const fetchedGenres = d.genre.split(',').map((g: string) => g.trim());
        const validGenres = fetchedGenres.filter((g: string) => GENRES.includes(g));
        if (validGenres.length > 0) setSelectedGenres(validGenres);
      }

      setOmdbSuccess(true);
      setTimeout(() => setOmdbSuccess(false), 5000);
    } catch (err: any) {
      setOmdbError('Gagal menghubungi API: ' + (err.message || 'unknown error'));
    } finally {
      setIsFetchingOMDB(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const durationNumber = parseDurationToMinutes(formData.durationMin);
      const payload = {
        ...formData,
        durationMin: durationNumber,
        rating: formData.rating ? Number(formData.rating) : undefined,
        genre: selectedGenres.join(', '),
        sections: selectedSections.join(', '),
      };
      try {
        if (initialData?.id) {
          await updateMovie(initialData.id, payload as any);
        } else {
          await createMovie(payload as any);
        }
        router.push('/admin/film');
      } catch (err) {
        console.error(err);
        alert('Gagal menyimpan film');
      }
    });
  };

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.85rem 1rem',
    borderRadius: '0.625rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
    boxSizing: 'border-box',
  };
  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    color: 'rgba(255,255,255,0.6)',
    fontSize: '0.82rem',
    fontWeight: 600,
    letterSpacing: '0.02em',
  };

  return (
    <form onSubmit={handleSubmit} style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{
        padding: '2.5rem',
        borderRadius: '1.25rem',
        background: 'rgba(12, 12, 22, 0.7)',
        border: '1px solid rgba(255,255,255,0.07)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1.75rem',
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
      }}>

        {/* Title + OMDB */}
        <div>
          <label style={labelStyle}>Judul Film</label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <input
              type="text"
              value={formData.title}
              onChange={e => setFormData({ ...formData, title: e.target.value })}
              required
              placeholder="Contoh: Interstellar (2014)"
              style={{ ...inputStyle, flex: 1 }}
            />
            <button
              type="button"
              onClick={handleOMDBFetch}
              disabled={isFetchingOMDB}
              style={{
                padding: '0 1.5rem',
                whiteSpace: 'nowrap',
                background: isFetchingOMDB ? 'rgba(229,9,20,0.5)' : 'linear-gradient(135deg, #e50914, #c0000f)',
                border: 'none',
                borderRadius: '0.625rem',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: isFetchingOMDB ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(229,9,20,0.4)',
                transition: 'all 0.2s',
              }}
            >
              {isFetchingOMDB ? '⟳ Menarik...' : 'Tarik Data OMDB'}
            </button>
          </div>
          {omdbError && (
            <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.6rem', padding: '0.6rem 0.875rem', background: 'rgba(239,68,68,0.08)', borderRadius: '0.4rem', border: '1px solid rgba(239,68,68,0.25)' }}>
              ⚠️ {omdbError}
            </div>
          )}
          {omdbSuccess && (
            <div style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '0.6rem', padding: '0.6rem 0.875rem', background: 'rgba(34,197,94,0.08)', borderRadius: '0.4rem', border: '1px solid rgba(34,197,94,0.25)' }}>
              ✅ Data berhasil ditarik dari OMDB & TMDB dan telah diisi ke form!
            </div>
          )}
        </div>

        {/* Rating & Durasi */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>Rating IMDb (1-10)</label>
            <input
              type="text"
              value={formData.rating}
              onChange={e => setFormData({ ...formData, rating: e.target.value })}
              placeholder="Contoh: 8.5"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Durasi</label>
            <input
              type="text"
              value={formData.durationMin}
              onChange={e => setFormData({ ...formData, durationMin: e.target.value })}
              placeholder="Contoh: 2h 49m"
              style={inputStyle}
            />
          </div>
        </div>

        {/* RT & Metacritic */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
          <div>
            <label style={labelStyle}>🍅 Rating Rotten Tomatoes</label>
            <input
              type="text"
              value={formData.rottenTomatoes}
              onChange={e => setFormData({ ...formData, rottenTomatoes: e.target.value })}
              placeholder="Contoh: 79%"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Ⓜ Rating Metacritic</label>
            <input
              type="text"
              value={formData.metacritic}
              onChange={e => setFormData({ ...formData, metacritic: e.target.value })}
              placeholder="Contoh: 74/100"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Genre + Sections */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>
          <div>
            <label style={labelStyle}>Genre</label>
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.625rem', padding: '0.875rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', background: 'rgba(255,255,255,0.02)', maxHeight: '220px', overflowY: 'auto' }} className="hide-scrollbar">
              {GENRES.map(g => (
                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', color: 'rgba(255,255,255,0.8)' }}>
                  <input type="checkbox" checked={selectedGenres.includes(g)} onChange={e => { if (e.target.checked) setSelectedGenres([...selectedGenres, g]); else setSelectedGenres(selectedGenres.filter(x => x !== g)); }} style={{ accentColor: '#e50914' }} />
                  {g}
                </label>
              ))}
            </div>
          </div>
          <div>
            <label style={labelStyle}>Kategori Section Dashboard (Pilih 1 atau lebih)</label>
            <div style={{ border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.625rem', padding: '0.875rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.6rem', background: 'rgba(255,255,255,0.02)' }}>
              {SECTIONS.map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.82rem', cursor: 'pointer', lineHeight: 1.3, color: 'rgba(255,255,255,0.8)' }}>
                  <input type="checkbox" checked={selectedSections.includes(s)} onChange={e => { if (e.target.checked) setSelectedSections([...selectedSections, s]); else setSelectedSections(selectedSections.filter(x => x !== s)); }} style={{ accentColor: '#e50914', marginTop: '0.15rem', flexShrink: 0 }} />
                  {s}
                </label>
              ))}
            </div>
            <input type="text" placeholder="Atau ketik nama section baru di sini..." style={{ ...inputStyle, marginTop: '0.75rem', background: 'transparent' }} />
          </div>
        </div>

        {/* Hidden fields for director & cast */}
        <input type="hidden" value={formData.director} name="director" />
        <input type="hidden" value={formData.cast} name="cast" />

        {/* Poster URL */}
        <div>
          <label style={labelStyle}>URL Poster Film (TMDB)</label>
          <input
            type="text"
            value={formData.posterUrl}
            onChange={e => setFormData({ ...formData, posterUrl: e.target.value })}
            placeholder="https://image.tmdb.org/t/p/..."
            style={inputStyle}
          />
        </div>

        {/* Trailer URL */}
        <div>
          <label style={labelStyle}>Link Trailer YouTube</label>
          <input
            type="text"
            value={formData.trailerUrl}
            onChange={e => setFormData({ ...formData, trailerUrl: e.target.value })}
            placeholder="ID video YouTube atau URL embed (misal: dQw4w9WgXcQ)"
            style={inputStyle}
          />
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Status Tayang</label>
          <select
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            style={{ ...inputStyle, appearance: 'auto', cursor: 'pointer' }}
          >
            <option value="NOW_PLAYING">🎬 Sedang Tayang (Now Playing)</option>
            <option value="UPCOMING">🔜 Akan Datang (Upcoming)</option>
          </select>
        </div>

        {/* Synopsis */}
        <div>
          <label style={labelStyle}>Sinopsis</label>
          <textarea
            value={formData.synopsis}
            onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '120px' }}
            rows={5}
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '1rem',
            fontSize: '1rem',
            background: isPending ? 'rgba(229,9,20,0.5)' : 'linear-gradient(135deg, #e50914, #c0000f)',
            border: 'none',
            borderRadius: '0.75rem',
            color: 'white',
            fontWeight: 700,
            cursor: isPending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 20px rgba(229,9,20,0.4)',
            transition: 'all 0.2s',
          }}
        >
          {isPending ? '⟳ Menyimpan...' : '💾 Simpan Perubahan'}
        </button>
      </div>
    </form>
  );
}
