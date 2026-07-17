'use client';

import { useState, useTransition } from 'react';
import { createMovie, updateMovie } from '@/actions/admin';
import { useRouter } from 'next/navigation';

const GENRES = ['Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 'Romance', 'Science Fiction', 'Thriller', 'War', 'Western'];
const SECTIONS = ['Sorotan Layar Utama', 'Pesona Asia & K-Drama', 'Rilisan Tersegar', 'Lagi Viral Nih', 'Tangga Teratas Box Office', 'Karya Anak Bangsa', 'Serem Banget', 'Yang Akan Datang', 'Perang'];

export default function FilmForm({ initialData }: { initialData?: any }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isFetchingOMDB, setIsFetchingOMDB] = useState(false);
  const [omdbError, setOmdbError] = useState('');
  const [omdbSuccess, setOmdbSuccess] = useState(false);

  // Convert raw minutes to Xh Ym display
  const formatDuration = (mins?: number | null) => {
    if (!mins) return '';
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    rating: initialData?.rating?.toString() || '',
    durationMin: formatDuration(initialData?.durationMin) || initialData?.durationMin?.toString() || '',
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
    if (!formData.title) {
      setOmdbError('Isi judul film terlebih dahulu');
      return;
    }
    setIsFetchingOMDB(true);
    setOmdbError('');
    setOmdbSuccess(false);
    try {
      const res = await fetch(`/api/fetch-movie?title=${encodeURIComponent(formData.title)}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      
      if (data.error) {
        setOmdbError(data.error);
      } else if (!data.data) {
        setOmdbError('Tidak ada data yang diterima dari API.');
      } else {
        const d = data.data;
        setFormData(prev => ({
          ...prev,
          synopsis: d.synopsis || prev.synopsis,
          posterUrl: d.posterUrl || prev.posterUrl,
          rating: d.rating != null ? String(d.rating) : prev.rating,
          durationMin: d.durationMin != null ? formatDuration(d.durationMin) : prev.durationMin,
          rottenTomatoes: d.rottenTomatoes || prev.rottenTomatoes,
          metacritic: d.metacritic || prev.metacritic,
          director: d.director || prev.director,
          cast: d.cast || prev.cast,
        }));
        setOmdbSuccess(true);
        setTimeout(() => setOmdbSuccess(false), 4000);
      }
    } catch (err: any) {
      setOmdbError('Gagal menghubungi API: ' + (err.message || 'unknown error'));
    } finally {
      setIsFetchingOMDB(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      // clean duration string (e.g. "120m" -> 120)
      let parsedDuration = formData.durationMin;
      if (typeof parsedDuration === 'string') {
        const match = parsedDuration.match(/(\d+)/);
        parsedDuration = match ? match[1] : '';
      }

      const payload = {
        ...formData,
        durationMin: parsedDuration ? Number(parsedDuration) : undefined,
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

  const inputStyle = {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '0.5rem',
    background: 'rgba(255,255,255,0.03)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    transition: 'border-color 0.2s',
  };

  const labelStyle = {
    display: 'block',
    marginBottom: '0.5rem',
    color: 'rgba(255,255,255,0.7)',
    fontSize: '0.85rem',
  };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '700px' }}>
      <div style={{ 
        padding: '2rem', 
        borderRadius: '1rem', 
        background: 'rgba(15, 15, 25, 0.4)',
        border: '1px solid rgba(255,255,255,0.05)',
        display: 'flex', 
        flexDirection: 'column', 
        gap: '1.5rem',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)'
      }}>
        
        {/* Title + OMDB */}
        <div>
          <label style={labelStyle}>Judul Film</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
              style={{ ...inputStyle, flex: 1 }}
            />
            <button 
              type="button" 
              onClick={handleOMDBFetch}
              disabled={isFetchingOMDB}
              style={{ 
                padding: '0 1.5rem', 
                whiteSpace: 'nowrap', 
                backgroundColor: '#e50914', 
                border: 'none', 
                borderRadius: '0.5rem', 
                color: 'white', 
                fontWeight: 600, 
                cursor: isFetchingOMDB ? 'not-allowed' : 'pointer',
                opacity: isFetchingOMDB ? 0.7 : 1
              }}
            >
              {isFetchingOMDB ? 'Menarik...' : 'Tarik Data OMDB'}
            </button>
          </div>
          {omdbError && (
            <div style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(239,68,68,0.08)', borderRadius: '0.35rem', border: '1px solid rgba(239,68,68,0.2)' }}>
              ⚠️ {omdbError}
            </div>
          )}
          {omdbSuccess && (
            <div style={{ color: '#22c55e', fontSize: '0.8rem', marginTop: '0.5rem', padding: '0.5rem 0.75rem', background: 'rgba(34,197,94,0.08)', borderRadius: '0.35rem', border: '1px solid rgba(34,197,94,0.2)' }}>
              ✅ Data OMDB/TMDB berhasil ditarik dan diisi ke form!
            </div>
          )}
        </div>

        {/* Rating & Durasi */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Rating (1-10)</label>
            <input 
              type="text" 
              value={formData.rating}
              onChange={e => setFormData({...formData, rating: e.target.value})}
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Durasi</label>
            <input 
              type="text" 
              value={formData.durationMin}
              onChange={e => setFormData({...formData, durationMin: e.target.value})}
              placeholder="Misal: 2h 53m atau 173m"
              style={inputStyle}
            />
          </div>
        </div>

        {/* RT & Metacritic */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Rating Rotten Tomatoes</label>
            <input 
              type="text" 
              value={formData.rottenTomatoes}
              onChange={e => setFormData({...formData, rottenTomatoes: e.target.value})}
              placeholder="79%"
              style={inputStyle}
            />
          </div>
          <div>
            <label style={labelStyle}>Rating Metacritic</label>
            <input 
              type="text" 
              value={formData.metacritic}
              onChange={e => setFormData({...formData, metacritic: e.target.value})}
              placeholder="Contoh: 73/100"
              style={inputStyle}
            />
          </div>
        </div>

        {/* Checkboxes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem', alignItems: 'start' }}>
          {/* Genre */}
          <div>
            <label style={labelStyle}>Genre</label>
            <div style={{ 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '0.5rem',
              padding: '1rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.75rem',
              background: 'rgba(255,255,255,0.01)',
              maxHeight: '200px',
              overflowY: 'auto'
            }} className="hide-scrollbar">
              {GENRES.map(g => (
                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedGenres.includes(g)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedGenres([...selectedGenres, g]);
                      else setSelectedGenres(selectedGenres.filter(x => x !== g));
                    }}
                    style={{ accentColor: '#0070f3' }}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>
          
          {/* Sections */}
          <div>
            <label style={labelStyle}>Kategori Section Dashboard (Pilih 1 atau lebih)</label>
            <div style={{ 
              border: '1px solid rgba(255,255,255,0.1)', 
              borderRadius: '0.5rem',
              padding: '1rem',
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              background: 'rgba(255,255,255,0.01)',
            }}>
              {SECTIONS.map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer', lineHeight: 1.2 }}>
                  <input 
                    type="checkbox" 
                    checked={selectedSections.includes(s)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedSections([...selectedSections, s]);
                      else setSelectedSections(selectedSections.filter(x => x !== s));
                    }}
                    style={{ accentColor: '#0070f3', marginTop: '0.1rem' }}
                  />
                  {s}
                </label>
              ))}
            </div>
            
            <input 
              type="text" 
              placeholder="Atau ketik nama section baru di sini..." 
              style={{ ...inputStyle, marginTop: '0.75rem', background: 'transparent' }}
            />
          </div>
        </div>

        {/* Director & Cast hidden as they are fetched automatically */}
        <input type="hidden" value={formData.director} />
        <input type="hidden" value={formData.cast} />

        {/* Media URLs */}
        <div>
          <label style={labelStyle}>Nama File Poster / URL</label>
          <input 
            type="text" 
            value={formData.posterUrl}
            onChange={e => setFormData({...formData, posterUrl: e.target.value})}
            style={inputStyle}
          />
        </div>
        <div>
          <label style={labelStyle}>Link Trailer YouTube</label>
          <input 
            type="text" 
            value={formData.trailerUrl}
            onChange={e => setFormData({...formData, trailerUrl: e.target.value})}
            placeholder="<iframe width=&quot;560&quot; height=&quot;315&quot; src=&quot;https://www.youtube.com/embed/...&quot;>"
            style={inputStyle}
          />
        </div>

        {/* Status */}
        <div>
          <label style={labelStyle}>Status Tayang</label>
          <select 
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
            style={{ ...inputStyle, appearance: 'auto' }}
          >
            <option value="NOW_PLAYING">Sedang Tayang (Now Playing)</option>
            <option value="UPCOMING">Akan Datang (Upcoming)</option>
          </select>
        </div>

        {/* Synopsis */}
        <div>
          <label style={labelStyle}>Sinopsis</label>
          <textarea 
            value={formData.synopsis}
            onChange={e => setFormData({...formData, synopsis: e.target.value})}
            style={{ ...inputStyle, resize: 'vertical' }}
            rows={5}
          />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          style={{ 
            padding: '1rem', 
            fontSize: '1rem', 
            marginTop: '0.5rem',
            backgroundColor: '#e50914',
            border: 'none',
            borderRadius: '0.5rem',
            color: 'white',
            fontWeight: 700,
            cursor: isPending ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem'
          }}
        >
          {isPending ? 'Menyimpan...' : '💾 Simpan Perubahan'}
        </button>

      </div>
    </form>
  );
}
