"use client";
import React, { useRef } from "react";
import { useScroll, useTransform, motion, MotionValue } from "framer-motion";

export const ContainerScroll = ({
  titleComponent,
  children,
}: {
  titleComponent: string | React.ReactNode;
  children: React.ReactNode;
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end end"],
  });
  const [isMobile, setIsMobile] = React.useState(false);

  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  const scaleDimensions = () => {
    return isMobile ? [0.7, 0.9] : [1.05, 1];
  };

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], scaleDimensions());
  const translate = useTransform(scrollYProgress, [0, 1], [200, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.2, 1]);

  return (
    // Outer container — must NOT have overflow-hidden
    // Height is tall enough for title + card + animation room
    <div
      className="h-[70rem] md:h-[90rem] flex items-start justify-center relative pt-20 md:pt-32"
      ref={containerRef}
    >
      <div
        className="w-full relative"
        style={{ perspective: "1200px" }}
      >
        <Header translate={translate} opacity={opacity} titleComponent={titleComponent} />
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
};

export const Header = ({
  translate,
  opacity,
  titleComponent,
}: {
  translate: MotionValue<number>;
  opacity: MotionValue<number>;
  titleComponent: string | React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        translateY: translate,
        opacity: opacity,
      }}
      className="max-w-5xl mx-auto text-center relative z-0 px-4"
    >
      {titleComponent}
    </motion.div>
  );
};

export const Card = ({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) => {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        // Realistic layered shadow like a physical device
        boxShadow:
          "0 2px 4px rgba(0,0,0,0.4), 0 12px 40px rgba(0,0,0,0.6), 0 40px 80px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)",
      }}
      // KEY FIX: explicit inline style for border to bypass any Tailwind JIT miss
      // border-[14px] = thick physical bezel; bg dark grey like real tablet body
      // rounded-[40px] = big corner radius like iPad/Android tablet
      // -mt-28 md:-mt-40 = tablet overlaps heading (reveal effect)
      className="max-w-5xl -mt-28 md:-mt-40 mx-auto w-full relative z-20 rounded-[40px]"
      style={{
        height: "clamp(320px, 45vw, 640px)",
        border: "14px solid #2a2a2a",
        padding: "10px",
        backgroundColor: "#1a1a1a",
      }}
    >
      {/* Camera notch — top center of the bezel */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex items-center justify-center z-30"
        style={{ top: "-7px" }}
      >
        <div
          className="rounded-full bg-[#111]"
          style={{
            width: "10px",
            height: "10px",
            border: "1px solid #333",
            boxShadow: "inset 0 0 3px rgba(0,0,0,0.8)",
          }}
        />
      </div>

      {/* Inner screen area */}
      <div
        className="h-full w-full overflow-hidden relative z-10"
        style={{
          borderRadius: "28px",
          backgroundColor: "#000",
          border: "1px solid #333",
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};
