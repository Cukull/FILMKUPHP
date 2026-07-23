/**
 * RatingBadges
 * ─────────────
 * Baris badge rating lengkap sesuai referensi PHP:
 *   ⭐ 7.0/10  |  🍅 79%  |  Ⓜ 79  |  ⏱ 2h53m  |  [HD]  |  Adventure, War
 *
 * - IMDb   : star SVG kuning solid + "X.X/10"
 * - RT      : tomat SVG (fresh ≥60% / rotten <60%) + "XX%"
 * - Metacritic : lingkaran warna (hijau/kuning/merah) + angka
 * - Durasi  : plain text "Xh XXm", separator "|"
 * - HD      : kotak kecil border
 * - Genre   : plain text muted, koma-separated
 */

type Props = {
  rating?: number | null;
  rottenTomatoes?: string | null;
  metacritic?: string | null;
  durationMin?: number | null;
  genre?: string | null;
  status?: string | null;
  /** compact = hanya IMDb + durasi (untuk card kecil) */
  compact?: boolean;
};

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Parse angka dari string seperti "79%", "79/100", "7.0" */
function parseScore(val: string | null | undefined): number | null {
  if (!val) return null;
  const n = parseFloat(val.replace(/[^0-9.]/g, ''));
  return isNaN(n) ? null : n;
}

// ─── SVG Icons ──────────────────────────────────────────────────────────────

/** Star kuning solid (IMDb) */
function StarIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="#f5c518"
      stroke="#f5c518" strokeWidth="1" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline', verticalAlign: 'middle', flexShrink: 0 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  );
}

/** Tomat RT — bulat merah + daun hijau kecil di atas */
function TomatoFreshIcon() {
  return (
    <svg width="13" height="14" viewBox="0 0 20 22" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline', verticalAlign: 'middle', flexShrink: 0 }}>
      {/* Batang + daun */}
      <path d="M10 5 C10 5 9 2 6 1 C8 3 9 4 10 5Z" fill="#3a9e3a"/>
      <path d="M10 5 C10 5 11 2 14 1 C12 3 11 4 10 5Z" fill="#3a9e3a"/>
      {/* Tomat merah */}
      <circle cx="10" cy="13" r="8" fill="#fa320a"/>
      {/* Highlight kecil */}
      <ellipse cx="7.5" cy="10" rx="2" ry="1.2" fill="rgba(255,255,255,0.25)" transform="rotate(-20,7.5,10)"/>
    </svg>
  );
}

/** Tomat busuk RT — tomat pecah/splat */
function TomatoRottenIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline', verticalAlign: 'middle', flexShrink: 0 }}>
      {/* Tomat hijau kehitaman (rotten) */}
      <circle cx="12" cy="12" r="9" fill="#5a7a2a"/>
      <path d="M12 3 C12 3 11 1 9 0.5 C10.5 2 11 3 12 3Z" fill="#2a4a0a"/>
      {/* Crack/splat */}
      <path d="M8 9 L10 12 L8 15 M14 8 L12 12 L14 16" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none"/>
    </svg>
  );
}

/** Lingkaran Metacritic — warna sesuai skor */
function MetacriticIcon({ score, color }: { score: number; color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 28 28" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="1" y="1" width="26" height="26" rx="5" ry="5"
        fill={color} stroke="rgba(255,255,255,0.15)" strokeWidth="1"/>
      <text x="14" y="19" textAnchor="middle"
        fill="white" fontSize="12" fontWeight="800" fontFamily="Arial,sans-serif">
        {score > 99 ? '99+' : score}
      </text>
    </svg>
  );
}

// ─── Separator ──────────────────────────────────────────────────────────────
function Sep() {
  return (
    <span style={{ color: 'rgba(255,255,255,0.2)', fontSize: '0.75rem', userSelect: 'none' }}>
      |
    </span>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────
export default function RatingBadges({
  rating,
  rottenTomatoes,
  metacritic,
  durationMin,
  genre,
  status,
  compact = false,
}: Props) {
  const durationHours = durationMin ? Math.floor(durationMin / 60) : null;
  const durationMins  = durationMin ? durationMin % 60 : null;

  // RT logic
  const rtScore = parseScore(rottenTomatoes);
  const isFresh  = rtScore !== null && rtScore >= 60;
  const rtLabel  = rottenTomatoes
    ? (rottenTomatoes.includes('%') ? rottenTomatoes : `${rottenTomatoes}%`)
    : null;

  // Metacritic color
  const mcScore = parseScore(metacritic);
  const mcColor = mcScore === null ? '#666'
    : mcScore >= 61 ? '#3a9e3a'   // hijau
    : mcScore >= 40 ? '#c7ae00'   // kuning
    : '#e30000';                   // merah

  const hasAnyRating = !!rating || !!rtLabel || !!mcScore;
  const hasDuration  = !!durationMin;

  // ── Shared badge style ──────────────────────────────────────────────────
  const baseBadge: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.28rem',
    padding: '0.2rem 0.55rem',
    borderRadius: '0.35rem',
    fontSize: '0.78rem',
    fontWeight: 700,
    lineHeight: 1,
    whiteSpace: 'nowrap',
  };

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      flexWrap: 'wrap',
    }}>

      {/* ── ⭐ IMDb Rating ── */}
      {rating && (
        <span
          title={`IMDb: ${rating}/10`}
          style={{
            ...baseBadge,
            background: 'rgba(245,197,24,0.12)',
            border: '1px solid rgba(245,197,24,0.35)',
            color: '#f5c518',
          }}
        >
          <StarIcon /> {rating}/10
        </span>
      )}

      {/* ── 🍅 Rotten Tomatoes ── */}
      {!compact && rtLabel && (
        <>
          {hasAnyRating && rating && <Sep />}
          <span
            title={`Rotten Tomatoes: ${rtLabel} — ${isFresh ? 'Fresh' : 'Rotten'}`}
            style={{
              ...baseBadge,
              background: isFresh ? 'rgba(250,50,10,0.12)' : 'rgba(90,122,42,0.15)',
              border: `1px solid ${isFresh ? 'rgba(250,50,10,0.35)' : 'rgba(90,122,42,0.35)'}`,
              color: isFresh ? '#fa5a30' : '#8fbc4f',
            }}
          >
            {isFresh ? <TomatoFreshIcon /> : <TomatoRottenIcon />}
            {rtLabel}
          </span>
        </>
      )}

      {/* ── Ⓜ Metacritic ── */}
      {!compact && mcScore !== null && metacritic && (
        <>
          <Sep />
          <span
            title={`Metacritic: ${mcScore}`}
            style={{
              ...baseBadge,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: 'rgba(255,255,255,0.85)',
              gap: '0.35rem',
            }}
          >
            <MetacriticIcon score={mcScore} color={mcColor} />
            <span style={{ fontSize: '0.76rem' }}>{mcScore}</span>
          </span>
        </>
      )}

      {/* ── ⏱ Durasi ── */}
      {hasDuration && (
        <>
          <Sep />
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.65)', fontWeight: 500, whiteSpace: 'nowrap' }}>
            {durationHours}h {String(durationMins).padStart(2,'0')}m
          </span>
        </>
      )}

      {/* ── [HD] ── */}
      {!compact && (
        <>
          <Sep />
          <span style={{
            fontSize: '0.68rem',
            fontWeight: 800,
            padding: '0.15rem 0.42rem',
            border: '1px solid rgba(255,255,255,0.3)',
            borderRadius: '0.25rem',
            color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.04em',
          }}>
            HD
          </span>
        </>
      )}

      {/* ── Genre ── */}
      {!compact && genre && (
        <>
          <Sep />
          <span style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.5)', fontWeight: 400 }}>
            {genre.split(',').map(g => g.trim()).join(', ')}
          </span>
        </>
      )}

      {/* ── Status Tayang ── */}
      {status === 'NOW_PLAYING' && (
        <>
          <Sep />
          <span style={{
            ...baseBadge,
            background: 'rgba(229,9,20,0.15)',
            border: '1px solid rgba(229,9,20,0.4)',
            color: '#ff6b6b',
            fontSize: '0.7rem',
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
          }}>
            Sedang Tayang
          </span>
        </>
      )}
    </div>
  );
}
