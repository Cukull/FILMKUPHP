'use client';

import { useEffect } from 'react';

/**
 * Adds/removes `.scrolled` class on `.navbar` based on scroll position.
 * Threshold: 60px — navbar becomes glassmorphism after scrolling 60px.
 * Renders nothing — purely behavioral side-effect component.
 */
export default function NavbarScrollEffect() {
  useEffect(() => {
    const THRESHOLD = 60;

    const update = () => {
      const nav = document.querySelector('.navbar');
      if (!nav) return;
      if (window.scrollY > THRESHOLD) {
        nav.classList.add('scrolled');
      } else {
        nav.classList.remove('scrolled');
      }
    };

    // Run once on mount (in case page loads mid-scroll)
    update();

    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return null;
}
