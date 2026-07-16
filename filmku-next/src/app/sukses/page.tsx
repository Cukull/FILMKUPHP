'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Suspense } from 'react';

function SuksesContent() {
  const params = useSearchParams();
  const orderId = params.get('orderId') || 'FK-XXXX';
  const seats = params.get('seats') || '';
  const total = params.get('total') || '0';
  const seatList = seats.split(',').filter(Boolean);

  const today = new Date();
  const dateStr = today.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div className="page-transition" style={{ minHeight: '100vh', padding: '3rem 4rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* ── SUCCESS ANIMATION ── */}
      <div style={{
        width: '80px', height: '80px', borderRadius: '50%',
        background: 'linear-gradient(135deg, #22c55e, #16a34a)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '2.5rem', marginBottom: '1.5rem',
        boxShadow: '0 0 40px rgba(34,197,94,0.4)',
        animation: 'successPop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      }}>
        ✓
      </div>

      <h1 style={{
        fontSize: '2rem', fontWeight: 900,
        color: '#22c55e', marginBottom: '0.5rem',
        textShadow: '0 0 30px rgba(34,197,94,0.3)',
      }}>
        Pembayaran Berhasil!
      </h1>

      {/* Checklist */}
      <div className="glass-static" style={{ padding: '1.5rem 2rem', marginBottom: '2rem', width: '100%', maxWidth: '520px' }}>
        {['Pembayaran berhasil', 'Kursi telah dikunci', 'E-ticket aktif dan siap dipindai di bioskop'].map((item, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.5rem 0' }}>
            <span style={{ color: '#22c55e', fontSize: '1rem', flexShrink: 0 }}>✓</span>
            <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>{item}</span>
          </div>
        ))}
      </div>

      {/* ── E-TICKET CARD ── */}
      <div style={{
        width: '100%', maxWidth: '520px',
        border: '2px dashed rgba(229,9,20,0.5)',
        borderRadius: '1rem',
        background: 'rgba(12,12,22,0.95)',
        overflow: 'hidden',
        marginBottom: '2rem',
      }}>
        {/* Ticket Header */}
        <div style={{
          background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))',
          padding: '1.25rem 2rem',
          textAlign: 'center',
        }}>
          <div style={{
            fontSize: '1.5rem', fontWeight: 900,
            letterSpacing: '0.15em', color: 'white',
            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
          }}>
            FILMKU E-TICKET
          </div>
        </div>

        {/* Ticket Body */}
        <div style={{ padding: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Judul Film
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                FILMKU Cinema
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Tanggal Tayang
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>{dateStr}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Jam Sesi
              </div>
              <div style={{ fontSize: '1.1rem', color: 'var(--accent)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                🕐 —
              </div>
            </div>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Lokasi / Studio
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-primary)' }}>Studio 1</div>
            </div>
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              Nomor Kursi (Seat)
            </div>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              {seatList.length > 0 ? seatList.map(s => (
                <span key={s} className="seat-chip">{s}</span>
              )) : <span style={{ color: 'var(--text-secondary)' }}>—</span>}
            </div>
          </div>

          {/* Divider bergaya tiket sobek */}
          <div style={{ position: 'relative', margin: '1.5rem -2rem' }}>
            <div style={{ height: '1px', background: 'rgba(229,9,20,0.3)', borderTop: '1px dashed rgba(229,9,20,0.5)' }} />
            <div style={{ position: 'absolute', top: '-10px', left: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-base)' }} />
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '20px', height: '20px', borderRadius: '50%', background: 'var(--bg-base)' }} />
          </div>

          {/* Total + QR */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'var(--text-secondary)', marginBottom: '0.3rem' }}>
                Total Pembayaran
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--text-primary)' }}>
                Rp {parseInt(total).toLocaleString('id-ID')}
              </div>
            </div>
            {/* QR Code placeholder */}
            <div style={{
              width: '80px', height: '80px',
              background: 'white', borderRadius: '0.5rem',
              display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)',
              padding: '8px', gap: '2px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}>
              {Array.from({ length: 49 }).map((_, i) => (
                <div key={i} style={{
                  background: [0,1,2,7,8,9,14,3,10,4,11,5,12,6,13,
                    21,28,35,42,22,29,36,43,23,30,37,44,24,31,38,45,
                    25,32,39,46,26,33,40,47,27,34,41,48,15,16,17,18,19,20].includes(i)
                    ? '#000' : 'transparent',
                  borderRadius: '1px',
                }} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── ACTION BUTTONS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', width: '100%', maxWidth: '520px', marginBottom: '1.5rem' }}>
        {[
          { icon: '⬇', label: 'Unduh E-ticket' },
          { icon: '🖼', label: 'Simpan ke Galeri' },
          { icon: '📧', label: 'Kirim ulang Email' },
          { icon: '📅', label: 'Tambah ke Kalender' },
        ].map((btn, i) => (
          <button key={i} className="btn-outline" style={{ padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', fontSize: '0.85rem' }}>
            {btn.icon} {btn.label}
          </button>
        ))}
      </div>

      <Link href="/" style={{ textDecoration: 'none', width: '100%', maxWidth: '520px' }}>
        <button className="btn-primary" style={{ width: '100%', padding: '1rem', fontSize: '1rem' }}>
          🏠 Kembali ke Beranda
        </button>
      </Link>

      <style>{`
        @keyframes successPop {
          0% { transform: scale(0); opacity: 0; }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}

export default function SuksesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>⏳ Memuat konfirmasi...</div>}>
      <SuksesContent />
    </Suspense>
  );
}
