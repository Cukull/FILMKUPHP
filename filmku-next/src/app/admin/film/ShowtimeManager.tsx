'use client';

import { useState, useTransition } from 'react';
import { createShowtime, deleteShowtime } from '@/actions/admin';

type Showtime = {
  id: string;
  movieId: string;
  startTime: Date | string;
  studio: string;
  price: number;
};

export default function ShowtimeManager({ movieId, showtimes }: { movieId: string; showtimes: Showtime[] }) {
  const [isPending, startTransition] = useTransition();
  const [list, setList] = useState<Showtime[]>(showtimes);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [studio, setStudio] = useState('Studio 1');
  const [price, setPrice] = useState('50000');
  const [msg, setMsg] = useState('');

  const inputStyle: React.CSSProperties = {
    padding: '0.65rem 1rem',
    borderRadius: '0.5rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
  };

  const handleAdd = () => {
    if (!date || !time || !studio) {
      setMsg('Isi tanggal, jam, dan studio terlebih dahulu.');
      return;
    }
    const startTime = `${date}T${time}:00`;
    startTransition(async () => {
      const res = await createShowtime({ movieId, startTime, studio, price: Number(price) });
      if (res.success) {
        setList(prev => [...prev, res.showtime as Showtime]);
        setDate(''); setTime(''); setMsg('✅ Jadwal berhasil ditambahkan!');
        setTimeout(() => setMsg(''), 3000);
      }
    });
  };

  const handleDelete = (id: string) => {
    startTransition(async () => {
      await deleteShowtime(id, movieId);
      setList(prev => prev.filter(s => s.id !== id));
    });
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.25rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        🎬 Jadwal Sesi Tayang
      </h2>

      {/* Add Form */}
      <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0.75rem', padding: '1.5rem', marginBottom: '1.5rem' }}>
        <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tambah Jadwal Baru</p>

        {/* Row 1: Tanggal + Jam */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.4rem', fontWeight: 600 }}>📅 Tanggal</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.4rem', fontWeight: 600 }}>🕐 Jam Mulai</label>
            <input type="time" value={time} onChange={e => setTime(e.target.value)} style={inputStyle} />
          </div>
        </div>

        {/* Row 2: Studio + Harga + Button */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '1rem', alignItems: 'end' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.4rem', fontWeight: 600 }}>🎬 Studio</label>
            <select value={studio} onChange={e => setStudio(e.target.value)} style={{ ...inputStyle, appearance: 'auto', cursor: 'pointer' }}>
              <option>Studio 1</option>
              <option>Studio 2</option>
              <option>Studio 3</option>
              <option>Premiere</option>
              <option>IMAX</option>
            </select>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.78rem', color: 'rgba(255,255,255,0.55)', marginBottom: '0.4rem', fontWeight: 600 }}>💰 Harga (Rp)</label>
            <input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} style={inputStyle} />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending}
            style={{
              padding: '0.75rem 1.5rem',
              background: isPending ? 'rgba(229,9,20,0.5)' : 'linear-gradient(135deg, #e50914, #c0000f)',
              border: 'none',
              borderRadius: '0.625rem',
              color: '#fff',
              fontWeight: 700,
              cursor: isPending ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              boxShadow: '0 4px 15px rgba(229,9,20,0.35)',
              height: 'fit-content',
            }}
          >
            + Tambah
          </button>
        </div>

        {msg && (
          <p style={{ marginTop: '0.875rem', fontSize: '0.82rem', padding: '0.5rem 0.75rem', borderRadius: '0.4rem', background: msg.startsWith('✅') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)', color: msg.startsWith('✅') ? '#22c55e' : '#ef4444', border: `1px solid ${msg.startsWith('✅') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}` }}>
            {msg}
          </p>
        )}
      </div>

      {/* Schedule List */}
      {list.length === 0 ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'rgba(255,255,255,0.35)', border: '1px dashed rgba(255,255,255,0.1)', borderRadius: '0.75rem' }}>
          Belum ada jadwal tayang. Tambahkan di atas.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {list.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()).map(st => {
            const d = new Date(st.startTime);
            const isPast = d < new Date();
            return (
              <div key={st.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.875rem 1rem',
                borderRadius: '0.5rem',
                background: isPast ? 'rgba(255,255,255,0.01)' : 'rgba(255,255,255,0.03)',
                border: `1px solid ${isPast ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)'}`,
                opacity: isPast ? 0.5 : 1,
              }}>
                <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: isPast ? 'rgba(255,255,255,0.4)' : '#fff', fontWeight: 700 }}>
                    {d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontSize: '1rem', fontWeight: 800, color: isPast ? 'rgba(255,255,255,0.4)' : '#fff' }}>
                    {d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{
                    padding: '0.2rem 0.6rem',
                    borderRadius: '0.3rem',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    background: st.studio === 'Premiere' ? 'rgba(234,179,8,0.15)' : 'rgba(255,255,255,0.07)',
                    color: st.studio === 'Premiere' ? '#facc15' : 'rgba(255,255,255,0.7)',
                  }}>
                    {st.studio}
                  </span>
                  <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.4)' }}>
                    Rp {Number(st.price).toLocaleString('id-ID')}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => handleDelete(st.id)}
                  disabled={isPending}
                  style={{ padding: '0.35rem 0.75rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '0.35rem', color: '#ef4444', fontSize: '0.75rem', cursor: 'pointer', fontWeight: 600 }}
                >
                  Hapus
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
