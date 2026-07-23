'use client';

/**
 * DarkTimePicker — Custom time picker pengganti native <input type="time">
 * ─────────────────────────────────────────────────────────────────────────
 * • Output format: "HH:MM" (kompatibel dengan ShowtimeManager state `time`)
 * • Spinner-style: scroll jam (00-23) dan menit (00, 05, 10, ..., 55)
 * • Keyboard: ArrowUp/Down pada setiap kolom, Tab pindah kolom, Escape close
 * • Click outside = close
 * • Dark theme FILMKU
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

type Props = {
  value: string;           // "HH:MM" atau ''
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
};

function pad(n: number) { return String(n).padStart(2, '0'); }

const HOURS = Array.from({ length: 24 }, (_, i) => pad(i));
// Menit per-5
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5));

function formatDisplay(v: string) {
  if (!v) return '';
  const [h, m] = v.split(':');
  const hNum = parseInt(h, 10);
  const period = hNum >= 12 ? 'PM' : 'AM';
  const h12 = hNum === 0 ? 12 : hNum > 12 ? hNum - 12 : hNum;
  return `${pad(h12)}:${m} ${period}`;
}

export default function DarkTimePicker({ value, onChange, placeholder = 'Pilih jam...', style }: Props) {
  const [open, setOpen] = useState(false);

  // Parsed state
  const [hour, setHour] = useState(() => value ? value.split(':')[0] : '08');
  const [minute, setMinute] = useState(() => {
    if (!value) return '00';
    const rawMin = parseInt(value.split(':')[1] ?? '0', 10);
    // Round to nearest 5
    return pad(Math.round(rawMin / 5) * 5 % 60);
  });

  const wrapRef = useRef<HTMLDivElement>(null);
  const hourRef = useRef<HTMLDivElement>(null);
  const minRef = useRef<HTMLDivElement>(null);

  // Emit combined value whenever hour/minute changes
  const emit = (h: string, m: string) => onChange(`${h}:${m}`);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Sync state from value prop
  useEffect(() => {
    if (value) {
      const [h, m] = value.split(':');
      if (h) setHour(h);
      if (m) {
        const rawMin = parseInt(m, 10);
        setMinute(pad(Math.round(rawMin / 5) * 5 % 60));
      }
    }
  }, [value]);

  // Scroll selected item into view in column
  const scrollTo = (ref: React.RefObject<HTMLDivElement | null>, index: number) => {
    const el = ref.current?.children[index] as HTMLElement;
    el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  };

  const handleHourKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = HOURS.indexOf(hour);
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = (cur - 1 + HOURS.length) % HOURS.length;
      setHour(HOURS[next]);
      emit(HOURS[next], minute);
      scrollTo(hourRef, next);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (cur + 1) % HOURS.length;
      setHour(HOURS[next]);
      emit(HOURS[next], minute);
      scrollTo(hourRef, next);
    } else if (e.key === 'Escape') setOpen(false);
  };

  const handleMinKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = MINUTES.indexOf(minute);
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const next = (cur - 1 + MINUTES.length) % MINUTES.length;
      setMinute(MINUTES[next]);
      emit(hour, MINUTES[next]);
      scrollTo(minRef, next);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = (cur + 1) % MINUTES.length;
      setMinute(MINUTES[next]);
      emit(hour, MINUTES[next]);
      scrollTo(minRef, next);
    } else if (e.key === 'Escape') setOpen(false);
  };

  // ── Styles ─────────────────────────────────────────────────
  const triggerStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.8rem 1rem',
    borderRadius: '0.625rem',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${open ? 'rgba(229,9,20,0.5)' : 'rgba(255,255,255,0.1)'}`,
    color: value ? '#fff' : 'rgba(255,255,255,0.4)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    boxShadow: open ? '0 0 0 2px rgba(229,9,20,0.15)' : 'none',
  };

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    zIndex: 1000,
    background: 'rgba(14,14,26,0.98)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '1rem',
    boxShadow: '0 24px 60px rgba(0,0,0,0.75)',
    backdropFilter: 'blur(20px)',
    padding: '1rem',
    width: '220px',
  };

  const colStyle: React.CSSProperties = {
    flex: 1,
    maxHeight: '180px',
    overflowY: 'auto',
    scrollbarWidth: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    outline: 'none',
  };

  const itemStyle = (active: boolean): React.CSSProperties => ({
    padding: '0.45rem 0.5rem',
    borderRadius: '0.4rem',
    textAlign: 'center',
    fontSize: '0.9rem',
    fontWeight: active ? 700 : 400,
    cursor: 'pointer',
    color: active ? '#fff' : 'rgba(255,255,255,0.55)',
    background: active ? '#e50914' : 'transparent',
    transition: 'background 0.1s ease',
    fontFamily: 'monospace',
  });

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={value ? `Jam dipilih: ${formatDisplay(value)}` : placeholder}
        style={triggerStyle}
      >
        {/* Clock icon */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span style={{ flex: 1 }}>
          {value
            ? <span style={{ fontFamily: 'monospace', letterSpacing: '0.05em' }}>{formatDisplay(value)}</span>
            : <span style={{ color: 'rgba(255,255,255,0.4)' }}>{placeholder}</span>
          }
        </span>
      </button>

      {/* ── Time Panel ── */}
      {open && (
        <div style={panelStyle}>
          <p style={{ fontSize: '0.72rem', fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '0.75rem' }}>
            Pilih Jam
          </p>

          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'stretch' }}>
            {/* Hour column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: '0.4rem' }}>JAM</div>
              <div
                ref={hourRef}
                role="spinbutton"
                aria-label="Jam"
                aria-valuemin={0}
                aria-valuemax={23}
                aria-valuenow={parseInt(hour, 10)}
                tabIndex={0}
                onKeyDown={handleHourKey}
                style={colStyle}
              >
                {HOURS.map(h => (
                  <div
                    key={h}
                    onClick={() => { setHour(h); emit(h, minute); }}
                    style={itemStyle(h === hour)}
                  >
                    {h}
                  </div>
                ))}
              </div>
            </div>

            {/* Separator */}
            <div style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem', color: 'rgba(255,255,255,0.4)', fontWeight: 700, fontSize: '1.2rem' }}>:</div>

            {/* Minute column */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.35)', fontWeight: 700, marginBottom: '0.4rem' }}>MENIT</div>
              <div
                ref={minRef}
                role="spinbutton"
                aria-label="Menit"
                aria-valuemin={0}
                aria-valuemax={59}
                aria-valuenow={parseInt(minute, 10)}
                tabIndex={0}
                onKeyDown={handleMinKey}
                style={colStyle}
              >
                {MINUTES.map(m => (
                  <div
                    key={m}
                    onClick={() => { setMinute(m); emit(hour, m); }}
                    style={itemStyle(m === minute)}
                  >
                    {m}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Confirm & Close */}
          <button
            type="button"
            onClick={() => setOpen(false)}
            style={{
              marginTop: '0.875rem',
              width: '100%',
              padding: '0.5rem',
              background: 'linear-gradient(135deg, #e50914, #c0000f)',
              border: 'none',
              borderRadius: '0.5rem',
              color: '#fff',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            Pilih {hour}:{minute}
          </button>
        </div>
      )}
    </div>
  );
}
