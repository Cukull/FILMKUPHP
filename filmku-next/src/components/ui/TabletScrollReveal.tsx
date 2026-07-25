"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

interface TabletScrollRevealProps {
  heading: {
    small: string;
    large: string;
    largeAccent?: string;
  };
  children: React.ReactNode;
}

export function TabletScrollReveal({ heading, children }: TabletScrollRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  // Header Transforms
  const headerTranslateY = useTransform(scrollYProgress, [0, 1], [0, -50]);
  const headerOpacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  // Card Transforms
  const cardRotateX = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const cardScale = useTransform(scrollYProgress, [0, 1], [0.9, 1]);

  return (
    <div
      ref={containerRef}
      className="relative h-[150vh] md:h-[200vh] w-full"
    >
      {/* Sticky wrapper to hold the animation on screen while scrolling */}
      <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden">
        
        {/* Perspective container */}
        <div 
          className="w-full flex flex-col items-center px-4" 
          style={{ perspective: "1200px" }}
        >
          {/* ── HEADER ── */}
          <motion.div
            style={{
              translateY: headerTranslateY,
              opacity: headerOpacity,
            }}
            className="text-center relative z-10 -mb-24 md:-mb-32 flex flex-col items-center"
          >
            <p className="text-lg md:text-2xl font-medium text-gray-300 mt-2">
              {heading.small}
            </p>
            <h2 className="text-4xl md:text-6xl lg:text-8xl font-extrabold leading-none mt-2 text-white">
              {heading.large}{" "}
              {heading.largeAccent && (
                <span style={{ color: "var(--primary, #ff4444)" }}>
                  {heading.largeAccent}
                </span>
              )}
            </h2>
          </motion.div>

          {/* ── TABLET CARD ── */}
          <motion.div
            style={{
              rotateX: cardRotateX,
              scale: cardScale,
              boxShadow: "0 20px 60px rgba(0,0,0,0.5), 0 8px 20px rgba(0,0,0,0.3)",
            }}
            className="relative z-20 w-full max-w-4xl mx-auto h-[18rem] md:h-[34rem] rounded-[20px] md:rounded-[40px] border-[8px] md:border-[18px] border-[#18181b] bg-[#18181b]"
          >
            {/* Camera Notch */}
            <div className="absolute top-2 md:top-3 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gray-600 z-30" />

            {/* Inner Screen */}
            <div className="relative w-full h-full rounded-[12px] md:rounded-[24px] overflow-hidden bg-black">
              {children}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
