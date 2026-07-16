'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // ── Lenis Smooth Scroll ──
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
    });

    // Connect Lenis to GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add((time) => {
      lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ── Navbar slide-in ──
    gsap.fromTo(
      '.navbar',
      { y: -80, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: 'power3.out', delay: 0.2 }
    );

    // ── Splash screen fade-out after 1.8s ──
    gsap.to('.splash-container', {
      opacity: 0,
      pointerEvents: 'none',
      duration: 0.6,
      ease: 'power2.inOut',
      delay: 1.8,
    });

    // ── Hero content entrance ──
    const heroContent = document.querySelector('.home-hero-content, .hero-content');
    if (heroContent) {
      const children = heroContent.children;
      gsap.fromTo(
        children,
        { y: 30, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.15, ease: 'power3.out', delay: 0.5 }
      );
    }

    // ── Movie Lane Cards — scroll-triggered stagger ──
    const lanes = document.querySelectorAll('.movie-lane');
    lanes.forEach((lane) => {
      const cards = lane.querySelectorAll('.movie-lane-card');
      if (cards.length === 0) return;

      gsap.fromTo(
        cards,
        { y: 25, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: lane,
            start: 'top 88%',
            toggleActions: 'play none none none',
          },
        }
      );
    });

    // ── Feature Cards — scroll-triggered ──
    const featureCards = document.querySelectorAll('.feature-card');
    if (featureCards.length > 0) {
      gsap.fromTo(
        featureCards,
        { y: 40, opacity: 0, scale: 0.96 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.feature-section',
            start: 'top 80%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // ── FAQ Items — scroll-triggered ──
    const faqItems = document.querySelectorAll('.faq-item');
    if (faqItems.length > 0) {
      gsap.fromTo(
        faqItems,
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.faq-section',
            start: 'top 82%',
            toggleActions: 'play none none none',
          },
        }
      );
    }

    // ── Detail film hero content ──
    const detailContent = document.querySelector('.hero-content');
    if (detailContent && !document.querySelector('.home-hero')) {
      gsap.fromTo(
        detailContent.children,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.7, stagger: 0.12, ease: 'power2.out', delay: 0.3 }
      );
    }

    // ── Info Penayangan cells ──
    const penayangCells = document.querySelectorAll('.info-penayangan-cell');
    if (penayangCells.length > 0) {
      gsap.fromTo(
        penayangCells,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.07,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.info-penayangan-grid',
            start: 'top 85%',
          },
        }
      );
    }

    // ── Cast scroll items ──
    const castItems = document.querySelectorAll('.cast-item');
    if (castItems.length > 0) {
      gsap.fromTo(
        castItems,
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.4,
          stagger: 0.06,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: '.cast-scroll',
            start: 'top 85%',
          },
        }
      );
    }

    // ── Seat grid entrance ──
    const seatRows = document.querySelectorAll('.seat-row');
    if (seatRows.length > 0) {
      gsap.fromTo(
        seatRows,
        { y: 15, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.35,
          stagger: 0.05,
          ease: 'power2.out',
          delay: 0.3,
        }
      );
    }

    // ── Footer entrance ──
    const footer = document.querySelector('.footer-premium');
    if (footer) {
      gsap.fromTo(
        footer,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: footer,
            start: 'top 95%',
          },
        }
      );
    }

    return () => {
      lenis.destroy();
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  return <>{children}</>;
}
