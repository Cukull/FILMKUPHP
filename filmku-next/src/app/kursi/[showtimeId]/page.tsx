import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { getSession } from "@/lib/auth";
import SeatSelector from "./SeatSelector";
import Link from "next/link";

export default async function KursiPage({ params }: { params: Promise<{ showtimeId: string }> }) {
  const { showtimeId } = await params;
  const session = await getSession();

  const showtime = await prisma.showtime.findUnique({
    where: { id: showtimeId },
    include: {
      movie: { include: { category: true } },
      seats: true,
    },
  });

  if (!showtime) notFound();

  const bookedSeats = showtime.seats
    .filter((s) => s.status === "BOOKED" || s.status === "LOCKED")
    .map((s) => s.seatNumber);

  const totalSeats = showtime.seats.length || 40;
  const bookedCount = bookedSeats.length;
  const availableCount = totalSeats - bookedCount;

  const showDate = new Date(showtime.startTime).toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long",
  });
  const showTime = new Date(showtime.startTime).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit",
  });

  return (
    <div className="page-transition" style={{ minHeight: "100vh" }}>
      {/* ── HEADER ── */}
      <div style={{
        padding: "2rem 4rem 1.5rem",
        borderBottom: "1px solid var(--glass-border)",
        background: "rgba(8,8,16,0.6)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.4rem" }}>
          <span style={{ fontSize: "1.3rem" }}>🖥</span>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: "var(--text-primary)" }}>
            Pilih Tempat Duduk
          </h1>
        </div>
        <p style={{ color: "var(--text-secondary)", fontSize: "0.9rem", display: "flex", gap: "1rem", flexWrap: "wrap" }}>
          <strong style={{ color: "var(--text-primary)" }}>{showtime.movie.title}</strong>
          <span>·</span>
          <span>{showDate}</span>
          <span>·</span>
          <strong style={{ color: "var(--accent)" }}>{showTime}</strong>
          <span>·</span>
          <span>{showtime.studio}</span>
        </p>
      </div>

      {/* ── LOGIN WARNING ── */}
      {!session && (
        <div style={{
          margin: "1.5rem 4rem 0",
          background: "rgba(229, 9, 20, 0.08)",
          border: "1px solid rgba(229,9,20,0.3)",
          padding: "1rem 1.5rem",
          borderRadius: "0.75rem",
          fontSize: "0.9rem",
        }}>
          ⚠️ Anda harus{" "}
          <Link href="/login" style={{ color: "var(--accent)", fontWeight: 700 }}>
            Masuk (Login)
          </Link>{" "}
          terlebih dahulu sebelum memesan tiket.
        </div>
      )}

      {/* ── MAIN LAYOUT: Seat Grid + Sidebar ── */}
      <div style={{
        padding: "2rem 4rem",
        display: "flex",
        gap: "2rem",
        alignItems: "flex-start",
      }}>
        {/* ── LEFT: Seat Grid ── */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="glass-static" style={{ padding: "2rem" }}>
            {/* Cinema Screen */}
            <div className="cinema-screen" />

            {/* Seat Selector Component */}
            <SeatSelector
              showtimeId={showtime.id}
              price={showtime.price}
              bookedSeats={bookedSeats}
              isLoggedIn={!!session}
            />

            {/* Legend */}
            <div className="seat-legend">
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(255,255,255,0.15)" }} />
                Tersedia
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "var(--primary)", borderColor: "var(--primary-dark)" }} />
                Terpilih
              </div>
              <div className="legend-item">
                <div className="legend-dot" style={{ background: "rgba(59,78,120,0.4)", borderColor: "rgba(59,78,120,0.6)" }} />
                Terisi
              </div>
            </div>
          </div>
        </div>

        {/* ── RIGHT: Order Summary Sidebar ── */}
        <div className="order-sidebar">
          <div className="order-sidebar-title">
            🎟 Ringkasan Pesanan
          </div>

          {/* Movie Poster mini */}
          {showtime.movie.posterUrl && (
            <img
              src={showtime.movie.posterUrl}
              alt={showtime.movie.title}
              style={{
                width: "100%", height: "150px", objectFit: "cover",
                borderRadius: "0.5rem", marginBottom: "1rem",
              }}
            />
          )}

          <div className="order-row">
            <span className="order-row-label">🎬 Film</span>
            <span className="order-row-value" style={{ fontSize: "0.8rem", maxWidth: "140px", textAlign: "right" }}>
              {showtime.movie.title}
            </span>
          </div>
          <div className="order-row">
            <span className="order-row-label">📅 Tanggal</span>
            <span className="order-row-value" style={{ fontSize: "0.8rem" }}>{showDate.split(",")[0] + ", " + new Date(showtime.startTime).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
          </div>
          <div className="order-row">
            <span className="order-row-label">🕐 Jam Tayang</span>
            <span className="order-row-value" style={{ color: "var(--accent)" }}>{showTime}</span>
          </div>
          <div className="order-row">
            <span className="order-row-label">🎭 Studio</span>
            <span className="order-row-value">{showtime.studio}</span>
          </div>
          <div className="order-row" style={{ flexDirection: "column", alignItems: "flex-start" }}>
            <span className="order-row-label" style={{ marginBottom: "0.4rem" }}>🪑 Kursi Terpilih</span>
            <span className="order-row-value" style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>
              (Pilih kursi di sebelah kiri)
            </span>
          </div>

          <div className="order-row">
            <span className="order-row-label">💺 Harga/kursi</span>
            <span className="order-row-value">
              Rp {showtime.price.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="order-row">
            <span className="order-row-label">⚙️ Biaya layanan</span>
            <span className="order-row-value">Rp 3.000</span>
          </div>

          <div className="order-total">
            <span className="order-total-label">Total</span>
            <span className="order-total-amount">
              Rp {(showtime.price + 3000).toLocaleString("id-ID")}
            </span>
          </div>

          <div style={{ marginTop: "0.5rem", fontSize: "0.7rem", color: "var(--text-secondary)", textAlign: "center" }}>
            *Total akan berubah sesuai jumlah kursi yang dipilih
          </div>
        </div>
      </div>
    </div>
  );
}
