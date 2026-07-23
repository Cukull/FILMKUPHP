'use client';

import { useState, useTransition } from 'react';
import { createShowtime, deleteShowtime } from '@/actions/admin';
import DarkDatePicker from '@/components/DarkDatePicker';
import DarkTimePicker from '@/components/DarkTimePicker';
import DarkSelect, { type SelectOption } from '@/components/DarkSelect';

const STUDIO_OPTIONS: SelectOption[] = [
  { value: 'Studio 1',  label: 'Studio 1' },
  { value: 'Studio 2',  label: 'Studio 2' },
  { value: 'Studio 3',  label: 'Studio 3' },
  { value: 'Premiere',  label: '⭐ Premiere' },
  { value: 'IMAX',      label: '🎬 IMAX' },
];

type Showtime = {
  id: string;
  movieId: string;
  startTime: Date | string;
  studio: string;
  price: number;
};

// ─────────────────────────────────────────────
//  Design tokens — selaras dengan FilmForm.tsx
// ─────────────────────────────────────────────
const TOKEN = {
  inputPadding: '0.8rem 1rem',   // sama persis dengan FilmForm
  gridGap: '1.25rem',            // gap seragam antar kolom & baris
  labelGap: '0.45rem',           // jarak label → input
};

export default function ShowtimeManager({ movieId, showtimes }: { movieId: string; showtimes: Showtime[] }) {
  const [isPending, startTransition] = useTransition();
  const [list, setList] = useState<Showtime[]>(showtimes);
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [studio, setStudio] = useState('Studio 1');
  const [price, setPrice] = useState('50000');
  const [msg, setMsg] = useState('');

  // Shared input style — identik dengan FilmForm.tsx
  const inputStyle: React.CSSProperties = {
    padding: TOKEN.inputPadding,
    borderRadius: '0.5rem',
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.1)',
    color: '#fff',
    fontSize: '0.9rem',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  };

  const labelStyle: React.CSSProperties = {
    display: 'block',
    fontSize: '0.78rem',
    color: 'rgba(255,255,255,0.55)',
    marginBottom: TOKEN.labelGap,   // ← konsisten dengan FilmForm
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
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
        setDate(''); setTime('');
        setMsg('✅ Jadwal berhasil ditambahkan!');
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
    <div>
      <h2 style={{
        fontSize: '1.1rem', fontWeight: 700, marginBottom: '1.5rem',
        color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem',
      }}>
        🎬 Jadwal Sesi Tayang
      </h2>

      {/* ── Form Tambah Jadwal ── */}
      <div style={{
        background: 'rgba(255,255,255,0.02)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '0.875rem',
        padding: '1.75rem',
        marginBottom: '1.5rem',
      }}>
        <p style={{
          fontSize: '0.72rem', fontWeight: 700,
          color: 'rgba(255,255,255,0.4)',
          marginBottom: '1.5rem',
          textTransform: 'uppercase', letterSpacing: '0.08em',
        }}>
          Tambah Jadwal Baru
        </p>

        {/* Row 1: Tanggal + Jam Mulai — grid 2 kolom dengan gap seragam */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: TOKEN.gridGap,
          marginBottom: TOKEN.gridGap,
        }}>
          <div>
            <label style={labelStyle}>📅 Tanggal</label>
            {/* Custom dark date picker — output: "YYYY-MM-DD" */}
            <DarkDatePicker
              value={date}
              onChange={setDate}
              placeholder="Pilih tanggal..."
            />
          </div>
          <div>
            <label style={labelStyle}>🕐 Jam Mulai</label>
            {/* Custom dark time picker — output: "HH:MM" */}
            <DarkTimePicker
              value={time}
              onChange={setTime}
              placeholder="Pilih jam..."
            />
          </div>
        </div>

        {/* Row 2: Studio + Harga + Tombol Tambah */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr auto',
          gap: TOKEN.gridGap,
          alignItems: 'end',
        }}>
          <div>
            <label style={labelStyle}>🎬 Studio</label>
            {/* Custom dark select untuk studio */}
            <DarkSelect
              value={studio}
              onChange={setStudio}
              options={STUDIO_OPTIONS}
            />
          </div>

          <div>
            <label style={labelStyle}>💰 Harga (Rp)</label>
            {/*
              Input number: padding normal.
              Tidak perlu icon custom — label sudah cukup.
            */}
            <input
              type="number"
              value={price}
              onChange={e => setPrice(e.target.value)}
              min={0}
              style={inputStyle}
            />
          </div>

          {/*
            Tombol "+ Tambah" harus tingginya sama dengan input di sebelah kiri.
            Kita set minHeight agar selalu sejajar meski teks satu baris.
            mt-0 karena alignItems: end sudah menangani posisi vertikal.
          */}
          <button
            type="button"
            onClick={handleAdd}
            disabled={isPending}
            style={{
              padding: '0 1.5rem',
              // Tinggi menyesuaikan inputPadding (0.8rem top + 0.8rem bottom + ~1.4rem font + border)
              minHeight: '44px',
              background: isPending
                ? 'rgba(229,9,20,0.5)'
                : 'linear-gradient(135deg, #e50914, #c0000f)',
              border: 'none',
              borderRadius: '0.625rem',
              color: '#fff',
              fontWeight: 700,
              cursor: isPending ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap',
              fontSize: '0.9rem',
              boxShadow: '0 4px 15px rgba(229,9,20,0.35)',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
            }}
          >
            + Tambah
          </button>
        </div>

        {/* Pesan status tambah jadwal */}
        {msg && (
          <p style={{
            marginTop: '1rem',         // ← mt-6 analog: 1rem dari baris input
            fontSize: '0.82rem',
            padding: '0.6rem 0.875rem',
            borderRadius: '0.4rem',
            background: msg.startsWith('✅') ? 'rgba(34,197,94,0.08)' : 'rgba(239,68,68,0.08)',
            color: msg.startsWith('✅') ? '#22c55e' : '#ef4444',
            border: `1px solid ${msg.startsWith('✅') ? 'rgba(34,197,94,0.2)' : 'rgba(239,68,68,0.2)'}`,
          }}>
            {msg}
          </p>
        )}
      </div>

      {/* ── Daftar Jadwal yang Sudah Ada ── */}
      {list.length === 0 ? (
        <div style={{
          padding: '2rem',
          textAlign: 'center',
          color: 'rgba(255,255,255,0.35)',
          border: '1px dashed rgba(255,255,255,0.1)',
          borderRadius: '0.75rem',
          fontSize: '0.9rem',
        }}>
          Belum ada jadwal tayang. Tambahkan di atas.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {list
            .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            .map(st => {
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
                    style={{
                      padding: '0.35rem 0.875rem',
                      background: 'rgba(239,68,68,0.1)',
                      border: '1px solid rgba(239,68,68,0.3)',
                      borderRadius: '0.35rem',
                      color: '#ef4444',
                      fontSize: '0.75rem',
                      cursor: 'pointer',
                      fontWeight: 600,
                    }}
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
