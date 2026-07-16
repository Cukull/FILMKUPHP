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

  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    rating: initialData?.rating?.toString() || '',
    durationMin: initialData?.durationMin?.toString() || '',
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
    try {
      const res = await fetch(`/api/fetch-movie?title=${encodeURIComponent(formData.title)}`);
      const data = await res.json();
      
      if (data.error) {
        setOmdbError(data.error);
      } else {
        setFormData(prev => ({
          ...prev,
          title: data.data?.title || prev.title,
          synopsis: data.data?.synopsis || prev.synopsis,
          posterUrl: data.data?.posterUrl || prev.posterUrl,
          rating: data.data?.rating?.toString() || prev.rating,
          durationMin: data.data?.durationMin?.toString() || prev.durationMin,
          rottenTomatoes: data.data?.rottenTomatoes || prev.rottenTomatoes,
          metacritic: data.data?.metacritic || prev.metacritic,
          director: data.data?.director || prev.director,
          cast: data.data?.cast || prev.cast,
        }));

        if (data.data?.genre) {
          const fetchedGenres = data.data.genre.split(',').map((g: string) => g.trim());
          const validGenres = fetchedGenres.filter((g: string) => GENRES.includes(g));
          setSelectedGenres(validGenres);
        }
      }
    } catch (err) {
      setOmdbError('Gagal mengambil data OMDB');
    } finally {
      setIsFetchingOMDB(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    startTransition(async () => {
      const payload = {
        ...formData,
        durationMin: formData.durationMin ? Number(formData.durationMin) : undefined,
        rating: formData.rating ? Number(formData.rating) : undefined,
        genre: selectedGenres.join(', '),
        sections: selectedSections.join(', '),
        // Dummy categoryId since it's required by Prisma schema
        // Normally we'd select this, but we're relying on sections now.
        // We can just leave it undefined if it's optional in update, or null.
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

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: '800px' }}>
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Title + OMDB */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Judul Film</label>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <input 
              type="text" 
              value={formData.title}
              onChange={e => setFormData({...formData, title: e.target.value})}
              required
              className="input-field"
              style={{ flex: 1 }}
            />
            <button 
              type="button" 
              onClick={handleOMDBFetch}
              disabled={isFetchingOMDB}
              className="btn-primary"
              style={{ padding: '0 1.5rem', whiteSpace: 'nowrap', backgroundColor: '#e50914', border: 'none', borderRadius: '0.5rem', color: 'white', fontWeight: 600, cursor: 'pointer' }}
            >
              {isFetchingOMDB ? 'Menarik...' : 'Tarik Data OMDB'}
            </button>
          </div>
          {omdbError && <div style={{ color: 'var(--primary)', fontSize: '0.8rem', marginTop: '0.5rem' }}>{omdbError}</div>}
        </div>

        {/* Rating & Durasi */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Rating (1-10)</label>
            <input 
              type="text" 
              value={formData.rating}
              onChange={e => setFormData({...formData, rating: e.target.value})}
              className="input-field"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Durasi (menit)</label>
            <input 
              type="number" 
              value={formData.durationMin}
              onChange={e => setFormData({...formData, durationMin: e.target.value})}
              className="input-field"
            />
          </div>
        </div>

        {/* RT & Metacritic */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Rating Rotten Tomatoes</label>
            <input 
              type="text" 
              value={formData.rottenTomatoes}
              onChange={e => setFormData({...formData, rottenTomatoes: e.target.value})}
              placeholder="Misal: 79%"
              className="input-field"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Rating Metacritic</label>
            <input 
              type="text" 
              value={formData.metacritic}
              onChange={e => setFormData({...formData, metacritic: e.target.value})}
              placeholder="Misal: 73/100"
              className="input-field"
            />
          </div>
        </div>

        {/* Checkboxes Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          {/* Genre */}
          <div>
            <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Genre</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {GENRES.map(g => (
                <label key={g} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedGenres.includes(g)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedGenres([...selectedGenres, g]);
                      else setSelectedGenres(selectedGenres.filter(x => x !== g));
                    }}
                  />
                  {g}
                </label>
              ))}
            </div>
          </div>
          
          {/* Sections */}
          <div>
            <label style={{ display: 'block', marginBottom: '1rem', color: 'var(--text-secondary)' }}>Kategori Section Dashboard</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              {SECTIONS.map(s => (
                <label key={s} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                  <input 
                    type="checkbox" 
                    checked={selectedSections.includes(s)}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedSections([...selectedSections, s]);
                      else setSelectedSections(selectedSections.filter(x => x !== s));
                    }}
                  />
                  {s}
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Director & Cast hidden as they are fetched automatically */}
        <input type="hidden" value={formData.director} />
        <input type="hidden" value={formData.cast} />

        {/* Media URLs */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Nama File Poster / URL</label>
          <input 
            type="text" 
            value={formData.posterUrl}
            onChange={e => setFormData({...formData, posterUrl: e.target.value})}
            className="input-field"
          />
        </div>
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Link Trailer YouTube</label>
          <input 
            type="text" 
            value={formData.trailerUrl}
            onChange={e => setFormData({...formData, trailerUrl: e.target.value})}
            placeholder="<iframe width=&quot;560&quot; height=&quot;315&quot; src=&quot;https://www.youtube.com/embed/...&quot;>"
            className="input-field"
          />
        </div>

        {/* Status */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Status Tayang</label>
          <select 
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
            className="input-field"
          >
            <option value="NOW_PLAYING">Sedang Tayang (Now Playing)</option>
            <option value="UPCOMING">Akan Datang (Upcoming)</option>
          </select>
        </div>

        {/* Synopsis */}
        <div>
          <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>Sinopsis</label>
          <textarea 
            value={formData.synopsis}
            onChange={e => setFormData({...formData, synopsis: e.target.value})}
            className="input-field"
            rows={5}
          />
        </div>

        <button 
          type="submit" 
          disabled={isPending}
          className="btn-primary"
          style={{ padding: '1rem', fontSize: '1.1rem', marginTop: '1rem' }}
        >
          {isPending ? 'Menyimpan...' : '💾 Simpan Perubahan'}
        </button>

      </div>
    </form>
  );
}
