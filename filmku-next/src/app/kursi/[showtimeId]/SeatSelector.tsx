'use client';

import { useState } from 'react';

const ROWS = ['A', 'B', 'C', 'D'];
const COLS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const AISLE_AFTER = 5; // lorong di antara kolom 5 dan 6

export default function SeatSelector({
  showtimeId,
  price,
  bookedSeats,
  isLoggedIn,
}: {
  showtimeId: string;
  price: number;
  bookedSeats: string[];
  isLoggedIn: boolean;
}) {
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSeatClick = (seat: string) => {
    if (bookedSeats.includes(seat)) return;
    setSelectedSeats((prev) =>
      prev.includes(seat) ? prev.filter((s) => s !== seat) : [...prev, seat]
    );
  };

  const serviceFee = selectedSeats.length * 3000;
  const subtotal = selectedSeats.length * price;
  const total = subtotal + serviceFee;

  const handleCheckout = async () => {
    if (!isLoggedIn) {
      alert('Silakan login terlebih dahulu untuk membeli tiket.');
      return;
    }
    if (selectedSeats.length === 0) {
      alert('Pilih minimal 1 kursi.');
      return;
    }

    setIsProcessing(true);
    const { createTicketOrder } = await import('@/actions/order');
    const res = await createTicketOrder(showtimeId, selectedSeats, total);
    setIsProcessing(false);

    if (res.error) {
      alert(res.error);
    } else {
      // Redirect ke halaman sukses
      window.location.href = `/sukses?orderId=${res.orderId}&seats=${selectedSeats.join(',')}&total=${total}&film=${encodeURIComponent(showtimeId)}`;
    }
  };

  return (
    <>
      {/* ── Seat Grid ── */}
      <div className="seat-grid">
        {ROWS.map((row) => (
          <div key={row} className="seat-row">
            {/* Row label kiri */}
            <span className="seat-row-label">{row}</span>

            {COLS.map((col) => {
              const seatId = `${row}${col}`;
              const isBooked = bookedSeats.includes(seatId);
              const isSelected = selectedSeats.includes(seatId);

              const seatClass = isBooked ? 'seat booked' : isSelected ? 'seat selected' : 'seat available';

              return (
                <>
                  {/* Lorong tengah setelah kolom AISLE_AFTER */}
                  {col === AISLE_AFTER + 1 && <div key={`aisle-${row}`} className="seat-aisle" />}
                  <button
                    key={seatId}
                    className={seatClass}
                    onClick={() => handleSeatClick(seatId)}
                    disabled={isBooked}
                    aria-label={`Kursi ${seatId}${isBooked ? ' (terisi)' : isSelected ? ' (terpilih)' : ''}`}
                  >
                    {seatId}
                  </button>
                </>
              );
            })}

            {/* Row label kanan */}
            <span className="seat-row-label" style={{ textAlign: "left", marginLeft: "0.5rem" }}>{row}</span>
          </div>
        ))}
      </div>

      {/* ── Summary + CTA (update real-time) ── */}
      {selectedSeats.length > 0 && (
        <div style={{
          marginTop: "1.5rem",
          padding: "1.25rem",
          background: "rgba(229,9,20,0.06)",
          border: "1px solid rgba(229,9,20,0.2)",
          borderRadius: "0.75rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "1rem",
        }}>
          <div>
            <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)", marginBottom: "0.3rem" }}>
              {selectedSeats.length} kursi terpilih
            </div>
            <div className="seat-chips">
              {selectedSeats.map((s) => (
                <span key={s} className="seat-chip">{s}</span>
              ))}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
              {selectedSeats.length}x Rp {price.toLocaleString("id-ID")} + Rp {serviceFee.toLocaleString("id-ID")} layanan
            </div>
            <div style={{ fontSize: "1.4rem", fontWeight: 900, color: "#f5c518" }}>
              Rp {total.toLocaleString("id-ID")}
            </div>
          </div>
        </div>
      )}

      {/* ── Sticky Bottom CTA ── */}
      <div style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        padding: "1rem 4rem",
        background: "rgba(8,8,16,0.95)",
        backdropFilter: "blur(20px)",
        borderTop: "1px solid var(--glass-border)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        zIndex: 50,
        gap: "1rem",
      }}>
        <div>
          {selectedSeats.length > 0 ? (
            <>
              <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
                {selectedSeats.length} kursi: {selectedSeats.join(", ")}
              </div>
              <div style={{ fontSize: "1.1rem", fontWeight: 800, color: "#f5c518" }}>
                Total: Rp {total.toLocaleString("id-ID")}
              </div>
            </>
          ) : (
            <span style={{ color: "var(--text-secondary)", fontSize: "0.9rem" }}>
              Pilih kursi untuk melanjutkan
            </span>
          )}
        </div>

        <button
          className="btn-primary"
          style={{
            padding: "0.85rem 2.5rem",
            fontSize: "1rem",
            opacity: selectedSeats.length === 0 || isProcessing ? 0.5 : 1,
            minWidth: "200px",
          }}
          onClick={handleCheckout}
          disabled={selectedSeats.length === 0 || isProcessing}
        >
          {isProcessing ? "⏳ Memproses..." : "→ Lanjut Bayar"}
        </button>
      </div>

      {/* Spacer for sticky button */}
      <div style={{ height: "80px" }} />
    </>
  );
}
