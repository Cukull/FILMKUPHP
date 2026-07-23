'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// Helper: tanggal WIB "YYYY-MM-DD" dari epoch ms ─────────────────────────────
// Showtime disimpan sebagai UTC di DB (slot.hour:00 WIB = (slot.hour-7):00 UTC).
// Agar tab "HARI INI" selalu cocok dengan row di DB, kita pakai offset +7h
// di KEDUA sisi: days-tab generation DAN showtime filtering.
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
function toWIBDateStr(epochMs: number): string {
  const d = new Date(epochMs + WIB_OFFSET_MS);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

type Showtime = {
  id: string;
  movieId: string;
  startTime: string | Date;
  studio: string;
  price: number;
};

export default function ShowtimeSelector({ 
  movieTitle, 
  movieId, 
  showtimes 
}: { 
  movieTitle: string; 
  movieId: string; 
  showtimes: Showtime[]; 
}) {
  const [selectedDateStr, setSelectedDateStr] = useState<string>('');
  const [selectedTimeId, setSelectedTimeId] = useState<string>('');
  const [now, setNow] = useState(new Date());

  // Update time continuously so "Sudah lewat" is accurate
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Generate 7 hari (Hari Ini … H+6) pakai WIB date string
  const days = useMemo(() => {
    const arr = [];
    const dayNames  = ['Min','Sen','Sel','Rab','Kam','Jum','Sab'];
    const monthNames = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

    // Midnight WIB hari ini (dalam UTC epoch)
    const nowMs       = Date.now();
    const wibMs       = nowMs + WIB_OFFSET_MS;
    const dayMs       = 24 * 60 * 60 * 1000;
    const midnightWib = wibMs - (wibMs % dayMs); // midnight WIB, epoch "shifted"

    for (let i = 0; i < 7; i++) {
      // epoch ms di pertengahan hari WIB ke-i (untuk ambil nama hari & tanggal)
      const shiftedMs = midnightWib + i * dayMs + 12 * 3600_000;
      const d = new Date(shiftedMs); // pakai UTC methods karena epoch sudah di-shift

      let label = dayNames[d.getUTCDay()].toUpperCase();
      if (i === 0) label = 'HARI INI';
      else if (i === 1) label = 'BESOK';

      // dateStr = WIB calendar date, cocok dengan toWIBDateStr() di bawah
      const dateStr = toWIBDateStr(midnightWib - WIB_OFFSET_MS + i * dayMs);

      arr.push({
        dateStr,
        num:   d.getUTCDate(),
        month: monthNames[d.getUTCMonth()],
        label,
      });
    }
    return arr;
  }, []);

  // Initialize selected date
  useEffect(() => {
    if (days.length > 0 && !selectedDateStr) {
      setSelectedDateStr(days[0].dateStr);
    }
  }, [days, selectedDateStr]);

  // Filter showtimes by selected date (pakai WIB date string untuk match)
  const filteredShowtimes = useMemo(() => {
    return showtimes.filter(st => {
      const stMs = new Date(st.startTime).getTime();
      return toWIBDateStr(stMs) === selectedDateStr;
    }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
  }, [showtimes, selectedDateStr]);

  const selectedShowtime = useMemo(() => {
    return showtimes.find(st => st.id === selectedTimeId);
  }, [showtimes, selectedTimeId]);

  // Generate a stable random number based on ID for seats
  const getSeatsInfo = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const totalSeats = 40;
    const occupied = hash % 35; // max 34 occupied
    const available = totalSeats - occupied;
    
    if (available > 20) return { text: "Banyak Tersedia", color: "#22c55e" };
    if (available > 5) return { text: `Tersisa ${available} kursi`, color: "#eab308" };
    return { text: "Hampir Penuh!", color: "#ef4444" };
  };

  const getFormat = (id: string) => {
    const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return hash % 3 === 0 ? 'Premiere' : 'Studio ' + ((hash % 3) + 1);
  };

  return (
    <>
      <div id="jadwal" style={{ width: '100%', maxWidth: '420px', flexShrink: 0 }}>
        <div className="glass" style={{ 
          padding: "1.5rem", 
          borderRadius: "1rem",
          background: "rgba(10, 10, 20, 0.6)",
          border: "1px solid rgba(255,255,255,0.05)"
        }}>
          {/* Date Picker */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.2rem" }}>📅</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>Pilih Tanggal Tayang</h3>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.4rem' }}>
            {days.map((day) => {
              const isActive = day.dateStr === selectedDateStr;
              return (
                <button
                  key={day.dateStr}
                  onClick={() => {
                    setSelectedDateStr(day.dateStr);
                    setSelectedTimeId('');
                  }}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    padding: '0.6rem 0.25rem',
                    borderRadius: '0.75rem',
                    background: isActive ? 'rgba(229, 9, 20, 0.12)' : 'rgba(255,255,255,0.03)',
                    border: `1px solid ${isActive ? 'rgba(229, 9, 20, 0.8)' : 'rgba(255,255,255,0.08)'}`,
                    boxShadow: isActive ? '0 0 12px rgba(229, 9, 20, 0.25)' : 'none',
                    cursor: 'pointer',
                    width: '100%',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: "0.7rem", fontWeight: 700, color: isActive ? "#fff" : "var(--text-secondary)", marginBottom: "0.25rem" }}>
                    {day.label}
                  </span>
                  <span style={{ fontSize: "1.5rem", fontWeight: 800, color: isActive ? "#fff" : "#ccc", lineHeight: 1 }}>
                    {day.num}
                  </span>
                  <span style={{ fontSize: "0.8rem", color: isActive ? "#fff" : "var(--text-secondary)", marginTop: "0.25rem" }}>
                    {day.month}
                  </span>
                </button>
              );
            })}
          </div>

          <div style={{ height: "1px", background: "rgba(255,255,255,0.05)", margin: "1.5rem 0" }} />

          {/* Time Picker */}
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
            <span style={{ fontSize: "1.2rem" }}>🕐</span>
            <h3 style={{ fontSize: "1.1rem", fontWeight: 700, color: "#fff" }}>Pilih Jam Sesi & Lokasi Studio</h3>
          </div>

          {filteredShowtimes.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {filteredShowtimes.map((st) => {
                const stDate = new Date(st.startTime);
                const isPassed = stDate.getTime() < now.getTime();
                const seats = getSeatsInfo(st.id);
                const format = getFormat(st.id);
                const isSelected = selectedTimeId === st.id;

                return (
                  <button
                    key={st.id}
                    disabled={isPassed}
                    onClick={() => setSelectedTimeId(st.id)}
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      padding: '1rem',
                      borderRadius: '0.75rem',
                      background: isSelected ? 'rgba(229, 9, 20, 0.1)' : 'rgba(255,255,255,0.03)',
                      border: `1px solid ${isSelected ? 'rgba(229, 9, 20, 0.5)' : 'rgba(255,255,255,0.05)'}`,
                      opacity: isPassed ? 0.4 : 1,
                      cursor: isPassed ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span style={{ fontSize: "1.3rem", fontWeight: 800, color: isSelected ? "#fff" : "#ddd", marginBottom: "0.25rem" }}>
                      {stDate.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span style={{ 
                      fontSize: "0.7rem", 
                      fontWeight: 700, 
                      padding: "0.15rem 0.5rem", 
                      borderRadius: "1rem",
                      background: format === 'Premiere' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(255,255,255,0.1)',
                      color: format === 'Premiere' ? '#facc15' : '#aaa',
                      marginBottom: "0.5rem"
                    }}>
                      {format}
                    </span>
                    <span style={{ 
                      fontSize: "0.7rem", 
                      color: isPassed ? "#888" : seats.color, 
                      fontWeight: 600,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}>
                      <span style={{ fontSize: "0.5rem" }}>●</span> 
                      {isPassed ? "Sudah lewat" : seats.text}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "2rem 0", textAlign: "center", color: "var(--text-secondary)" }}>
              <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🎭</div>
              <p>Belum ada jadwal tayang untuk tanggal ini.</p>
            </div>
          )}
        </div>
      </div>

      {/* Floating Action Bar at the bottom */}
      <AnimatePresence>
        {selectedShowtime && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            style={{
              position: 'fixed',
              bottom: 0,
              left: 0,
              right: 0,
              background: 'rgba(10, 10, 15, 0.95)',
              backdropFilter: 'blur(10px)',
              borderTop: '1px solid rgba(255,255,255,0.1)',
              padding: '1rem 2rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              zIndex: 100,
              boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            }}
          >
            <div>
              <h4 style={{ fontSize: "1.1rem", fontWeight: 800, color: "#fff", margin: 0, marginBottom: "0.25rem" }}>
                {movieTitle}
              </h4>
              <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)", margin: 0 }}>
                {(() => {
                  const dayObj = days.find(d => d.dateStr === selectedDateStr);
                  const label = dayObj?.label === "HARI INI" ? "Hari Ini" : dayObj?.label === "BESOK" ? "Besok" : dayObj?.label;
                  return `${label}, ${dayObj?.num} ${dayObj?.month} - ${new Date(selectedShowtime.startTime).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })} - ${getFormat(selectedShowtime.id)}`;
                })()}
              </p>
            </div>
            
            <Link href={`/kursi/${selectedShowtime.id}`} style={{ textDecoration: "none" }}>
              <button 
                className="btn-primary" 
                style={{ 
                  padding: "0.75rem 2rem", 
                  fontSize: "1rem", 
                  fontWeight: 700,
                  backgroundColor: '#e50914',
                  border: 'none',
                  borderRadius: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  cursor: 'pointer'
                }}
              >
                <span>→ Konfirmasi & Pesan Tiket</span>
              </button>
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
