'use client';

/**
 * DarkSelect — Custom dropdown pengganti native <select>
 * ──────────────────────────────────────────────────────
 * • Zero library dependency
 * • ARIA combobox pattern (role="combobox" + role="listbox" + role="option")
 * • Keyboard: ArrowUp/Down = navigate, Enter/Space = select, Escape = close, Tab = close
 * • Click outside = close
 * • Cocok dengan dark theme FILMKU (glass background)
 */

import { useState, useRef, useEffect, useId, KeyboardEvent } from 'react';

export type SelectOption = {
  value: string;
  label: string;
};

type Props = {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  style?: React.CSSProperties;
};

export default function DarkSelect({ value, onChange, options, placeholder = 'Pilih...', style }: Props) {
  const [open, setOpen] = useState(false);
  const [focusedIdx, setFocusedIdx] = useState(-1);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const uid = useId();

  const selected = options.find(o => o.value === value);

  // Close when clicking outside
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        triggerRef.current && !triggerRef.current.contains(e.target as Node) &&
        listRef.current && !listRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Focus first/selected item when opening
  useEffect(() => {
    if (open) {
      const idx = options.findIndex(o => o.value === value);
      setFocusedIdx(idx >= 0 ? idx : 0);
    }
  }, [open]);

  // Scroll focused item into view
  useEffect(() => {
    if (!open || focusedIdx < 0) return;
    const item = listRef.current?.children[focusedIdx] as HTMLElement;
    item?.scrollIntoView({ block: 'nearest' });
  }, [focusedIdx, open]);

  const handleTriggerKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === ' ') {
      e.preventDefault();
      setOpen(true);
    }
    if (e.key === 'Escape') setOpen(false);
  };

  const handleListKey = (e: KeyboardEvent<HTMLUListElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setFocusedIdx(i => Math.min(i + 1, options.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setFocusedIdx(i => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (focusedIdx >= 0) {
        onChange(options[focusedIdx].value);
        setOpen(false);
        triggerRef.current?.focus();
      }
    } else if (e.key === 'Escape' || e.key === 'Tab') {
      setOpen(false);
      triggerRef.current?.focus();
    }
  };

  const base: React.CSSProperties = {
    position: 'relative',
    width: '100%',
    ...style,
  };

  const triggerStyle: React.CSSProperties = {
    width: '100%',
    padding: '0.8rem 2.5rem 0.8rem 1rem', // extra right padding for chevron
    borderRadius: '0.625rem',
    background: 'rgba(255,255,255,0.04)',
    border: `1px solid ${open ? 'rgba(229,9,20,0.5)' : 'rgba(255,255,255,0.1)'}`,
    color: selected ? '#fff' : 'rgba(255,255,255,0.4)',
    fontSize: '0.9rem',
    fontFamily: 'inherit',
    textAlign: 'left',
    cursor: 'pointer',
    boxSizing: 'border-box',
    outline: 'none',
    transition: 'border-color 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '0.5rem',
    boxShadow: open ? '0 0 0 2px rgba(229,9,20,0.15)' : 'none',
  };

  const panelStyle: React.CSSProperties = {
    position: 'absolute',
    top: 'calc(100% + 6px)',
    left: 0,
    right: 0,
    zIndex: 999,
    background: 'rgba(14,14,26,0.97)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '0.75rem',
    boxShadow: '0 20px 50px rgba(0,0,0,0.7), 0 0 0 1px rgba(229,9,20,0.1)',
    backdropFilter: 'blur(16px)',
    overflow: 'hidden',
    padding: '0.35rem',
    maxHeight: '260px',
    overflowY: 'auto',
  };

  return (
    <div style={base}>
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        role="combobox"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={`${uid}-list`}
        aria-activedescendant={open && focusedIdx >= 0 ? `${uid}-opt-${focusedIdx}` : undefined}
        onClick={() => setOpen(v => !v)}
        onKeyDown={handleTriggerKey}
        style={triggerStyle}
      >
        <span>{selected?.label ?? placeholder}</span>
        {/* Chevron icon */}
        <svg
          width="14" height="14" viewBox="0 0 24 24"
          fill="none" stroke="currentColor" strokeWidth="2.5"
          strokeLinecap="round" strokeLinejoin="round"
          style={{
            flexShrink: 0,
            color: 'rgba(255,255,255,0.4)',
            transform: open ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s ease',
          }}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown panel */}
      {open && (
        <ul
          ref={listRef}
          id={`${uid}-list`}
          role="listbox"
          tabIndex={-1}
          onKeyDown={handleListKey}
          aria-label="Pilih opsi"
          style={{ listStyle: 'none', margin: 0, padding: 0, ...panelStyle }}
        >
          {options.map((opt, idx) => {
            const isSelected = opt.value === value;
            const isFocused = idx === focusedIdx;
            return (
              <li
                key={opt.value}
                id={`${uid}-opt-${idx}`}
                role="option"
                aria-selected={isSelected}
                onMouseEnter={() => setFocusedIdx(idx)}
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}
                style={{
                  padding: '0.65rem 0.875rem',
                  borderRadius: '0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.5rem',
                  color: isSelected ? '#fff' : 'rgba(255,255,255,0.75)',
                  background: isSelected
                    ? 'rgba(229,9,20,0.18)'
                    : isFocused
                    ? 'rgba(255,255,255,0.07)'
                    : 'transparent',
                  fontWeight: isSelected ? 600 : 400,
                  transition: 'background 0.12s ease',
                }}
              >
                <span>{opt.label}</span>
                {/* Checkmark jika terpilih */}
                {isSelected && (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                    stroke="#e50914" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
