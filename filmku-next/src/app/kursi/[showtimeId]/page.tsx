import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import SeatSelector from "./SeatSelector";
import { getSession } from "@/lib/auth";

export default async function KursiPage({ params }: { params: Promise<{ showtimeId: string }> }) {
  const { showtimeId } = await params;
  const session = await getSession();

  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId },
    include: {
      movie: true,
      seats: true // Fetch all seats related to this showtime
    }
  });

  if (!showtime) {
    notFound();
  }

  // Find which seats are already booked
  const bookedSeats = showtime.seats
    .filter(s => s.status === 'BOOKED')
    .map(s => s.seatNumber);

  return (
    <div style={{ padding: '2rem 4rem' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Pilih Kursi</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        Film: <strong style={{ color: 'white' }}>{showtime.movie.title}</strong> | 
        Jam: <strong style={{ color: 'var(--accent)' }}>{new Date(showtime.startTime).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</strong> | 
        Studio: <strong>{showtime.studio}</strong>
      </p>
      
      {!session && (
        <div style={{ background: 'rgba(229, 9, 20, 0.1)', border: '1px solid var(--accent)', padding: '1rem', borderRadius: '0.5rem', marginBottom: '2rem' }}>
          ⚠️ Anda harus <a href="/login" style={{ color: 'var(--accent)', fontWeight: 'bold' }}>Masuk (Login)</a> terlebih dahulu sebelum memesan tiket.
        </div>
      )}

      <SeatSelector 
        showtimeId={showtime.id} 
        price={showtime.price} 
        bookedSeats={bookedSeats} 
        isLoggedIn={!!session} 
      />
    </div>
  );
}
