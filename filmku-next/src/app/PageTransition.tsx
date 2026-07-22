'use client';

/**
 * PageTransition
 * ──────────────
 * Wraps every page's content with a directionally-aware enter/exit animation.
 *
 * FORWARD  (link click, redirect):
 *   exit  → fade out  + scale down to 0.97  (current page leaves)
 *   enter → fade in   + scale up  from 0.97 (new page arrives)
 *
 * BACK  (browser back / custom back button):
 *   exit  → fade out  + slide right (+40 px)   (current page leaves right)
 *   enter → fade in   + slide from left (-40 px) (prev page arrives from left)
 *
 * After every enter animation completes we fire a custom DOM event
 * `page-transition-complete` so SmoothScroll can refresh ScrollTrigger
 * without being tightly coupled to this component.
 */

import { usePathname } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigationDirection } from './NavigationContext';

/* ── Shared easing ── */
const EASE_OUT = [0.22, 1, 0.36, 1] as const; // custom cubic-bezier, "snap out"
const DURATION_OUT = 0.25;
const DURATION_IN  = 0.32;

/* ── Variant factories ── */
const forwardVariants = {
  initial: { opacity: 0, scale: 0.97, y: 10 },
  animate: { opacity: 1, scale: 1,    y: 0  },
  exit:    { opacity: 0, scale: 0.97, y: 10  },
};

const backVariants = {
  initial: { opacity: 0, x: -40 },
  animate: { opacity: 1, x:   0 },
  exit:    { opacity: 0, x:  40 },
};

export default function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname  = usePathname();
  const direction = useNavigationDirection();

  const variants = direction === 'back' ? backVariants : forwardVariants;

  return (
    <AnimatePresence
      mode="wait"
      // After exit animation, we want to immediately mount + animate the
      // new page; "wait" ensures exit completes before enter starts.
    >
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{
          // Different durations for exit vs enter
          opacity: { duration: DURATION_IN,  ease: 'easeInOut' },
          scale:   { duration: DURATION_IN,  ease: EASE_OUT },
          x:       { duration: DURATION_IN,  ease: EASE_OUT },
          y:       { duration: DURATION_IN,  ease: EASE_OUT },
        }}
        style={{ width: '100%', minHeight: '100vh' }}
        // Fire custom event when the enter animation is done so other systems
        // (e.g. ScrollTrigger, Lenis) can re-initialise without coupling.
        onAnimationComplete={(definition) => {
          if (definition === 'animate') {
            window.dispatchEvent(new CustomEvent('page-transition-complete'));
          }
        }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

/* ── Exit transition duration export ── */
// Exposed so PageLoadingOverlay can optionally align its hide timing.
export const PAGE_TRANSITION_DURATION_MS = Math.round(
  Math.max(DURATION_OUT, DURATION_IN) * 1000
);
