'use client';

import { useState } from 'react';

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

export default function SeatSelector({ 
  showtimeId, 
  price, 
  bookedSeats,
  isLoggedIn 
}: { 
  showtimeId: string, 
  price: number, 
  bookedSeats: string[],
  isLoggedIn: boolean
}) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  const handleSeatClick = (seat: string) => {
    if (bookedSeats.includes(seat)) return; // Prevent clicking booked seats
    
    setSelectedSeats(prev => 
      prev.includes(seat) 
        ? prev.filter(s => s !== seat) 
        : [...prev, seat]
    );
  };

  const total = selectedSeats.length * price;

  const [isProcessing, setIsProcessing] = useState(false);

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      alert("Silakan login terlebih dahulu untuk membeli tiket.");
      return;
    }
    if (selectedSeats.length === 0) {
      alert("Pilih minimal 1 kursi.");
      return;
    }
    
    setIsProcessing(true);
    // Dynamic import to avoid client/server bundle issues if needed, but since it's an action we can just import it at top
    // Wait, let's use dynamic import since we didn't import it at the top
    const { createTicketOrder } = await import('@/actions/order');
    const res = await createTicketOrder(showtimeId, selectedSeats, total);
    setIsProcessing(false);

    if (res.error) {
      alert(res.error);
    } else {
      alert(`Checkout berhasil! Pesanan ID: ${res.orderId}. Memesan kursi: ${selectedSeats.join(', ')}`);
      // Reload page to reflect booked seats
      window.location.reload();
    }
  };

  return (
    <div style={{ display: 'flex', gap: '4rem', flexWrap: 'wrap' }}>
      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', flex: 2, minWidth: '300px' }}>
        <div style={{ background: 'var(--glass-border)', height: '10px', borderRadius: '10px', marginBottom: '3rem', textAlign: 'center', position: 'relative' }}>
          <span style={{ position: 'absolute', top: '15px', left: '50%', transform: 'translateX(-50%)', color: 'var(--text-secondary)', fontSize: '0.8rem', letterSpacing: '0.2rem' }}>LAYAR BIOSKOP</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {ROWS.map(row => (
            <div key={row} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
              <span style={{ width: '20px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{row}</span>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {COLS.map(col => {
                  const seatId = `${row}${col}`;
                  const isBooked = bookedSeats.includes(seatId);
                  const isSelected = selectedSeats.includes(seatId);
                  
                  let bgColor = 'rgba(255,255,255,0.1)';
                  if (isBooked) bgColor = 'rgba(255,255,255,0.02)';
                  if (isSelected) bgColor = 'var(--accent)';

                  return (
                    <button
                      key={seatId}
                      onClick={() => handleSeatClick(seatId)}
                      disabled={isBooked}
                      style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '0.5rem',
                        border: isSelected ? 'none' : '1px solid var(--glass-border)',
                        background: bgColor,
                        color: isBooked ? 'transparent' : 'white',
                        cursor: isBooked ? 'not-allowed' : 'pointer',
                        transition: 'all 0.2s',
                        fontSize: '0.8rem'
                      }}
                    >
                      {!isBooked && col}
                    </button>
                  );
                })}
              </div>
              <span style={{ width: '20px', fontWeight: 'bold', color: 'var(--text-secondary)' }}>{row}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginTop: '3rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', background: 'rgba(255,255,255,0.1)', border: '1px solid var(--glass-border)', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Tersedia</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', background: 'var(--accent)', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Dipilih</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{ width: '20px', height: '20px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--glass-border)', borderRadius: '4px' }}></div>
            <span style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Terisi</span>
          </div>
        </div>
      </div>

      <div className="glass" style={{ padding: '2rem', borderRadius: '1rem', flex: 1, minWidth: '300px', height: 'fit-content' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 600, marginBottom: '1.5rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '1rem' }}>Ringkasan Pesanan</h3>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Kursi Terpilih</span>
          <span style={{ fontWeight: 600 }}>{selectedSeats.length > 0 ? selectedSeats.join(', ') : '-'}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
          <span style={{ color: 'var(--text-secondary)' }}>Harga per Tiket</span>
          <span style={{ fontWeight: 600 }}>Rp {price.toLocaleString('id-ID')}</span>
        </div>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)' }}>
          <span style={{ fontSize: '1.1rem', fontWeight: 600 }}>Total Bayar</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--accent)' }}>Rp {total.toLocaleString('id-ID')}</span>
        </div>

        <button 
          className="btn-primary" 
          style={{ width: '100%', marginTop: '2rem', padding: '1rem', fontSize: '1.1rem', opacity: selectedSeats.length === 0 || isProcessing ? 0.5 : 1 }}
          onClick={handleCheckout}
          disabled={selectedSeats.length === 0 || isProcessing}
        >
          {isProcessing ? 'Memproses...' : 'Lanjut ke Pembayaran'}
        </button>
      </div>
    </div>
  );
}
