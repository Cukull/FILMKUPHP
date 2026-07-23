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

// ─────────────────────────────────────────────
//  Design tokens — semua spacing dari sini
// ─────────────────────────────────────────────
const TOKEN = {
  // Padding dalam semua <input>, <select>, <textarea>
  inputPadding: '0.8rem 1rem',
  // Gap vertikal antar field-group dalam satu card
  sectionGap: '1.5rem',
  // Gap kolom & baris pada grid 2-kolom
  gridGap: '1.25rem',
  // Gap vertikal antar checkbox item
  checkboxGap: '0.65rem',
  // Jarak antara label dan input di bawahnya
  labelGap: '0.45rem',
};

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

      if (json.error) { setOmdbError(json.error); return; }
      if (!json.data) { setOmdbError('Tidak ada data dari API.'); return; }

      const d = json.data;
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

  // ─────────────────────────────────────────────
  //  Shared styles — semua elemen form pakai ini
  // ─────────────────────────────────────────────
  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: TOKEN.inputPadding,       // ← konsisten di semua input
    borderRadius: '0.625rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s, box-shadow 0.2s',
    boxSizing: 'border-box',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    marginBottom: TOKEN.labelGap,      // ← konsisten label → input gap
    color: 'rgba(255,255,255,0.55)',
    fontSize: '0.78rem',
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  };

  // Grid 2-kolom dengan gap seragam
  const grid2: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: TOKEN.gridGap,                // ← gap-x dan gap-y sama
  };

  // Section divider tipis (memisahkan group field)
  const divider: React.CSSProperties = {
    borderTop: '1px solid rgba(255,255,255,0.06)',
    marginTop: 0,
    marginBottom: 0,
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
        gap: TOKEN.sectionGap,         // ← gap antar semua field-group
        boxShadow: '0 20px 60px rgba(0,0,0,0.6)',
        backdropFilter: 'blur(10px)',
      }}>

        {/* ── Judul Film + Tombol Tarik OMDB ── */}
        <div>
          <label style={labelStyle}>Judul Film</label>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'stretch' }}>
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
                background: isFetchingOMDB
                  ? 'rgba(229,9,20,0.5)'
                  : 'linear-gradient(135deg, #e50914, #c0000f)',
                border: 'none',
                borderRadius: '0.625rem',
                color: 'white',
                fontWeight: 700,
                fontSize: '0.875rem',
                cursor: isFetchingOMDB ? 'not-allowed' : 'pointer',
                boxShadow: '0 4px 15px rgba(229,9,20,0.4)',
                transition: 'all 0.2s',
                flexShrink: 0,
              }}
            >
              {isFetchingOMDB ? '⟳ Menarik...' : 'Tarik Data OMDB'}
            </button>
          </div>

          {/* Feedback OMDB */}
          {omdbError && (
            <div style={{
              color: '#ef4444', fontSize: '0.82rem', marginTop: '0.6rem',
              padding: '0.6rem 0.875rem', background: 'rgba(239,68,68,0.08)',
              borderRadius: '0.4rem', border: '1px solid rgba(239,68,68,0.25)',
            }}>
              ⚠️ {omdbError}
            </div>
          )}
          {omdbSuccess && (
            <div style={{
              color: '#22c55e', fontSize: '0.85rem', marginTop: '0.6rem',
              padding: '0.6rem 0.875rem', background: 'rgba(34,197,94,0.08)',
              borderRadius: '0.4rem', border: '1px solid rgba(34,197,94,0.25)',
            }}>
              ✅ Data berhasil ditarik dari OMDB & TMDB dan telah diisi ke form!
            </div>
          )}
        </div>

        <hr style={divider} />

        {/* ── Rating IMDb + Durasi (grid 2 kolom) ── */}
        <div style={grid2}>
          <div>
            <label style={labelStyle}>⭐ Rating IMDb (1–10)</label>
            <input
              type="text"
              value={formData.rating}
              onChange={e => setFormData({ ...formData, rating: e.target.value })}
              placeholder="Contoh: 8.5"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>⏱ Durasi</label>
            <input
              type="text"
              value={formData.durationMin}
              onChange={e => setFormData({ ...formData, durationMin: e.target.value })}
              placeholder="Contoh: 2h 49m"
              style={inputStyle}
            />
          </div>
        </div>

        {/* ── Rotten Tomatoes + Metacritic (grid 2 kolom) ── */}
        <div style={grid2}>
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

        <hr style={divider} />

        {/* ── Genre + Section Dashboard (grid 1fr 1.5fr) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: TOKEN.gridGap, alignItems: 'start' }}>

          {/* Genre checkbox list */}
          <div>
            <label style={labelStyle}>Genre</label>
            <div style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.625rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.02)',
              maxHeight: '236px',
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: TOKEN.checkboxGap,   // ← gap antar checkbox konsisten
            }} className="hide-scrollbar">
              {GENRES.map(g => (
                <label key={g} style={{
                  display: 'flex',
                  alignItems: 'center',  // ← checkbox sejajar teks
                  gap: '0.6rem',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  color: selectedGenres.includes(g) ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontWeight: selectedGenres.includes(g) ? 600 : 400,
                  lineHeight: 1,
                }}>
                  <input
                    type="checkbox"
                    checked={selectedGenres.includes(g)}
                    onChange={e => {
                      if (e.target.checked) setSelectedGenres([...selectedGenres, g]);
                      else setSelectedGenres(selectedGenres.filter(x => x !== g));
                    }}
                    style={{ accentColor: '#e50914', width: '15px', height: '15px', flexShrink: 0 }}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>

          {/* Section Dashboard checkbox grid */}
          <div>
            <label style={labelStyle}>Kategori Section Dashboard</label>
            <div style={{
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: '0.625rem',
              padding: '1rem',
              background: 'rgba(255,255,255,0.02)',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: TOKEN.checkboxGap,   // ← gap seragam (row & column)
            }}>
              {SECTIONS.map(s => (
                <label key={s} style={{
                  display: 'flex',
                  alignItems: 'flex-start',  // ← multi-line: checkbox di atas
                  gap: '0.6rem',
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                  lineHeight: 1.35,
                  color: selectedSections.includes(s) ? '#fff' : 'rgba(255,255,255,0.7)',
                  fontWeight: selectedSections.includes(s) ? 600 : 400,
                }}>
                  <input
                    type="checkbox"
                    checked={selectedSections.includes(s)}
                    onChange={e => {
                      if (e.target.checked) setSelectedSections([...selectedSections, s]);
                      else setSelectedSections(selectedSections.filter(x => x !== s));
                    }}
                    style={{
                      accentColor: '#e50914',
                      width: '15px', height: '15px',
                      marginTop: '0.1rem', flexShrink: 0,  // ← sejajar baris pertama teks
                    }}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>

        <hr style={divider} />

        {/* ── Hidden fields ── */}
        <input type="hidden" value={formData.director} name="director" />
        <input type="hidden" value={formData.cast} name="cast" />

        {/* ── URL Poster ── */}
        <div>
          <label style={labelStyle}>🖼 URL Poster Film (TMDB)</label>
          <input
            type="text"
            value={formData.posterUrl}
            onChange={e => setFormData({ ...formData, posterUrl: e.target.value })}
            placeholder="https://image.tmdb.org/t/p/..."
            style={inputStyle}
          />
        </div>

        {/* ── Link Trailer ── */}
        <div>
          <label style={labelStyle}>▶ Link Trailer YouTube</label>
          <input
            type="text"
            value={formData.trailerUrl}
            onChange={e => setFormData({ ...formData, trailerUrl: e.target.value })}
            placeholder="ID video YouTube atau URL embed (misal: dQw4w9WgXcQ)"
            style={inputStyle}
          />
        </div>

        {/* ── Status Tayang ── */}
        <div>
          <label style={labelStyle}>📡 Status Tayang</label>
          <select
            value={formData.status}
            onChange={e => setFormData({ ...formData, status: e.target.value })}
            style={{ ...inputStyle, appearance: 'auto', cursor: 'pointer' }}
          >
            <option value="NOW_PLAYING">🎬 Sedang Tayang (Now Playing)</option>
            <option value="UPCOMING">🔜 Akan Datang (Upcoming)</option>
          </select>
        </div>

        {/* ── Sinopsis ── */}
        <div>
          <label style={labelStyle}>📝 Sinopsis</label>
          <textarea
            value={formData.synopsis}
            onChange={e => setFormData({ ...formData, synopsis: e.target.value })}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '130px', lineHeight: 1.6 }}
            rows={5}
            placeholder="Tulis sinopsis singkat film..."
          />
        </div>

        <hr style={divider} />

        {/* ── Tombol Simpan ── */}
        <button
          type="submit"
          disabled={isPending}
          style={{
            padding: '0.95rem 1.5rem',
            fontSize: '1rem',
            background: isPending
              ? 'rgba(229,9,20,0.5)'
              : 'linear-gradient(135deg, #e50914, #c0000f)',
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
            // mt-6 dari elemen di atasnya sudah ditangani oleh sectionGap di parent
          }}
        >
          {isPending ? '⟳ Menyimpan...' : '💾 Simpan Perubahan'}
        </button>

      </div>
    </form>
  );
}
