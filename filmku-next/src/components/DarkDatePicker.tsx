'use client';

/**
 * DarkDatePicker — Custom calendar popup pengganti native <input type="date">
 * ──────────────────────────────────────────────────────────────────────────
 * • Zero library dependency
 * • Output format: "YYYY-MM-DD" (kompatibel dengan format ShowtimeManager)
 * • Dark theme FILMKU: glass background, accent merah untuk hari terpilih
 * • Keyboard: arrow keys navigate grid, Enter = select, Escape = close
 * • Click outside = close
 * • Navigasi bulan: prev/next chevron
 * • Highlight: hari ini (border merah tipis), terpilih (solid merah)
 */

import { useState, useRef, useEffect, useId, KeyboardEvent } from 'react';

type Props = {
  value: string;           // "YYYY-MM-DD" atau ''
  onChange: (v: string) => void;
  placeholder?: string;
  style?: React.CSSProperties;
};

const DAYS = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];
const MONTHS = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function pad(n: number) { return String(n).padStart(2, '0'); }

function toDateStr(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function parseDate(str: string): Date | null {
  if (!str) return null;
  const [y, m, d] = str.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function formatDisplay(str: string): string {
  const d = parseDate(str);
  if (!d) return '';
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
}

/** Returns array of Date objects for a 6-week grid starting from the Monday before the 1st */
function buildCalendarGrid(year: number, month: number): Date[] {
  const firstDay = new Date(year, month, 1);
  const startOffset = firstDay.getDay(); // 0=Sun
  const start = new Date(year, month, 1 - startOffset);
  const cells: Date[] = [];
  for (let i = 0; i < 42; i++) {
    cells.push(new Date(start.getFullYear(), start.getMonth(), start.getDate() + i));
  }
  return cells;
}

export default function DarkDatePicker({ value, onChange, placeholder = 'Pilih tanggal...', style }: Props) {
  const today = toDateStr(new Date());
  const parsed = parseDate(value);

  const [open, setOpen] = useState(false);
  const [viewYear, setViewYear] = useState(parsed?.getFullYear() ?? new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(parsed?.getMonth() ?? new Date().getMonth());
  const [focusedDate, setFocusedDate] = useState<string>(value || today);

  const wrapRef = useRef<HTMLDivElement>(null);
  const uid = useId();

  // Sync view when value changes externally
  useEffect(() => {
    if (parsed) {
      setViewYear(parsed.getFullYear());
      setViewMonth(parsed.getMonth());
    }
  }, [value]);

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

  const grid = buildCalendarGrid(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const selectDate = (d: Date) => {
    const str = toDateStr(d);
    onChange(str);
    setOpen(false);
  };

  const handleGridKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const cur = parseDate(focusedDate) || new Date();
    let next: Date | null = null;
    if (e.key === 'ArrowRight') next = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    else if (e.key === 'ArrowLeft') next = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() - 1);
    else if (e.key === 'ArrowDown') next = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 7);
    else if (e.key === 'ArrowUp') next = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() - 7);
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const d = parseDate(focusedDate);
      if (d) selectDate(d);
      return;
    } else if (e.key === 'Escape') { setOpen(false); return; }

    if (next) {
      e.preventDefault();
      const str = toDateStr(next);
      setFocusedDate(str);
      // Navigate view if needed
      if (next.getMonth() !== viewMonth || next.getFullYear() !== viewYear) {
        setViewMonth(next.getMonth());
        setViewYear(next.getFullYear());
      }
    }
  };

  // ── Styles ──────────────────────────────────────────────────
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
    boxShadow: '0 24px 60px rgba(0,0,0,0.75), 0 0 0 1px rgba(229,9,20,0.08)',
    backdropFilter: 'blur(20px)',
    padding: '1rem',
    width: '300px',
    userSelect: 'none',
  };

  return (
    <div ref={wrapRef} style={{ position: 'relative', width: '100%', ...style }}>
      {/* ── Trigger ── */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={value ? `Tanggal dipilih: ${formatDisplay(value)}` : placeholder}
        style={triggerStyle}
      >
        {/* Calendar icon */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.45)"
          strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span style={{ flex: 1 }}>
          {value ? formatDisplay(value) : <span style={{ color: 'rgba(255,255,255,0.4)' }}>{placeholder}</span>}
        </span>
        {value && (
          <span
            onClick={e => { e.stopPropagation(); onChange(''); }}
            title="Hapus tanggal"
            style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.9rem', cursor: 'pointer', lineHeight: 1 }}
          >
            ×
          </span>
        )}
      </button>

      {/* ── Calendar Panel ── */}
      {open && (
        <div style={panelStyle}>
          {/* Month/Year navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.875rem' }}>
            <button type="button" onClick={prevMonth} aria-label="Bulan sebelumnya"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.4rem', color: '#fff', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>

            <span style={{ fontWeight: 700, fontSize: '0.9rem', color: '#fff' }}>
              {MONTHS[viewMonth]} {viewYear}
            </span>

            <button type="button" onClick={nextMonth} aria-label="Bulan berikutnya"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '0.4rem', color: '#fff', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          {/* Day-of-week header */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', marginBottom: '0.35rem' }}>
            {DAYS.map(d => (
              <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.35)', padding: '0.2rem 0', letterSpacing: '0.03em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Date grid */}
          <div
            role="grid"
            aria-label={`Kalender ${MONTHS[viewMonth]} ${viewYear}`}
            onKeyDown={handleGridKey}
            tabIndex={0}
            style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', outline: 'none' }}
          >
            {grid.map(date => {
              const str = toDateStr(date);
              const isCurrentMonth = date.getMonth() === viewMonth;
              const isToday = str === today;
              const isSelected = str === value;
              const isFocused = str === focusedDate;

              let bg = 'transparent';
              let color = isCurrentMonth ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.2)';
              let border = 'none';
              let fontWeight: number | string = 400;

              if (isSelected) {
                bg = '#e50914';
                color = '#fff';
                fontWeight = 700;
              } else if (isFocused) {
                bg = 'rgba(229,9,20,0.2)';
              } else if (isToday) {
                border = '1px solid rgba(229,9,20,0.6)';
                color = '#e50914';
                fontWeight = 700;
              }

              return (
                <button
                  key={str}
                  type="button"
                  role="gridcell"
                  aria-label={date.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                  aria-selected={isSelected}
                  aria-current={isToday ? 'date' : undefined}
                  tabIndex={isFocused ? 0 : -1}
                  onClick={() => selectDate(date)}
                  onMouseEnter={() => setFocusedDate(str)}
                  style={{
                    background: bg,
                    color,
                    border,
                    borderRadius: '0.4rem',
                    fontSize: '0.78rem',
                    fontWeight,
                    padding: '0.3rem 0',
                    cursor: 'pointer',
                    textAlign: 'center',
                    outline: 'none',
                    transition: 'background 0.1s ease',
                    fontFamily: 'inherit',
                  }}
                >
                  {date.getDate()}
                </button>
              );
            })}
          </div>

          {/* Quick actions */}
          <div style={{ marginTop: '0.75rem', paddingTop: '0.75rem', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', gap: '0.5rem' }}>
            <button type="button" onClick={() => { onChange(today); setOpen(false); }}
              style={{ flex: 1, padding: '0.4rem', borderRadius: '0.4rem', background: 'rgba(229,9,20,0.12)', border: '1px solid rgba(229,9,20,0.3)', color: '#e50914', fontSize: '0.75rem', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>
              Hari Ini
            </button>
            <button type="button" onClick={() => setOpen(false)}
              style={{ flex: 1, padding: '0.4rem', borderRadius: '0.4rem', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.6)', fontSize: '0.75rem', cursor: 'pointer', fontFamily: 'inherit' }}>
              Tutup
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
