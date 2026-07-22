'use client';

/**
 * NavigationContext
 * ─────────────────
 * Tracks whether the user is navigating *forward* or *back* so that
 * PageTransition can play a directionally-aware animation.
 *
 * Strategy:
 *   - Browser history entries carry a sequential `idx` in
 *     window.history.state (Next.js App Router sets this automatically).
 *   - We listen to the `popstate` event (back/forward button) and compare
 *     the incoming idx against the last known idx.
 *   - Link clicks always count as "forward" (no popstate fires for them).
 */

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { usePathname } from 'next/navigation';

type Direction = 'forward' | 'back';

const NavigationContext = createContext<Direction>('forward');

export function useNavigationDirection() {
  return useContext(NavigationContext);
}

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [direction, setDirection] = useState<Direction>('forward');
  const pathname   = usePathname();
  // Track the history index from the browser's state object
  const lastIdx    = useRef<number>(
    typeof window !== 'undefined'
      ? (window.history.state?.idx ?? 0)
      : 0
  );

  useEffect(() => {
    const onPopState = () => {
      const currentIdx: number = window.history.state?.idx ?? 0;
      setDirection(currentIdx < lastIdx.current ? 'back' : 'forward');
      lastIdx.current = currentIdx;
    };

    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  // On every link-click navigation (pathname change without popstate),
  // reset direction to forward and update the stored idx.
  useEffect(() => {
    // Give the browser time to update history.state after the soft navigation
    const id = setTimeout(() => {
      const currentIdx: number = window.history.state?.idx ?? 0;
      if (currentIdx > lastIdx.current) {
        // Confirmed forward push — state already set by popstate listener for back
        setDirection('forward');
        lastIdx.current = currentIdx;
      }
    }, 0);
    return () => clearTimeout(id);
  // pathname change signals navigation complete
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <NavigationContext.Provider value={direction}>
      {children}
    </NavigationContext.Provider>
  );
}
