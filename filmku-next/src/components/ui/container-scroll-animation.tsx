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
  const translate = useTransform(scrollYProgress, [0, 1], [150, 0]);
  const opacity = useTransform(scrollYProgress, [0, 1], [0.3, 1]);

  return (
    // Outer container height reduced from 80rem/90rem down to 40rem/60rem
    <div
      className="h-[40rem] md:h-[60rem] flex items-center justify-center relative p-2 md:p-10"
      ref={containerRef}
    >
      <div
        className="w-full relative py-10 md:py-20"
        style={{ perspective: "1000px" }}
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
        boxShadow:
          "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 24px 50px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        // Inline styles to guarantee rendering even if Tailwind JIT has issues
        border: "14px solid #1a1a1a",
        backgroundColor: "#1a1a1a",
      }}
      // max-w-5xl limits the width, h-[24rem] md:h-[32rem] ensures it is proportional landscape
      // p-3 md:p-5 adds the internal padding so content breathes
      className="max-w-5xl -mt-20 mx-auto h-[24rem] md:h-[32rem] w-full p-3 md:p-5 rounded-[30px] relative z-20"
    >
      {/* Tablet Camera Notch */}
      <div className="absolute top-1.5 left-1/2 -translate-x-1/2 flex items-center justify-center z-30">
        <div className="w-2.5 h-2.5 rounded-full bg-black shadow-[inset_0_0_2px_rgba(255,255,255,0.3)] border border-neutral-700"></div>
      </div>

      <div className="h-full w-full overflow-hidden rounded-[16px] md:rounded-[20px] bg-black relative z-10 border border-neutral-800">
        {children}
      </div>
    </motion.div>
  );
};
