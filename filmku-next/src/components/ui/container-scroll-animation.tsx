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
    offset: ["start end", "end end"], // smooth progress mapping
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
    <div
      className="h-[40rem] md:h-[60rem] flex items-center justify-center relative p-2 md:p-20"
      ref={containerRef}
    >
      <div
        className="py-10 md:py-40 w-full relative"
        style={{
          perspective: "1000px",
        }}
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
  titleComponent 
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
      className="max-w-5xl mx-auto text-center relative z-0"
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
          "0 0 #0000004d, 0 9px 20px #0000004a, 0 37px 37px #00000042, 0 84px 50px #00000026, 0 149px 60px #0000000a, 0 233px 65px #00000003, inset 0 0 0 1px rgba(255,255,255,0.1)",
        backgroundColor: "var(--bg-surface, #0f0f1a)",
        borderColor: "rgba(229, 9, 20, 0.2)"
      }}
      className="max-w-5xl -mt-24 md:-mt-32 mx-auto h-[24rem] md:h-[40rem] w-full border-[3px] p-3 md:p-8 rounded-[40px] shadow-2xl relative z-20"
    >
      {/* Tablet Camera Hole */}
      <div className="absolute top-2 md:top-3 left-1/2 -translate-x-1/2 flex items-center justify-center space-x-2 z-30">
        <div className="w-2 h-2 md:w-3 md:h-3 rounded-full bg-black shadow-[inset_0_0_2px_rgba(255,255,255,0.2)] border border-neutral-800"></div>
      </div>

      <div className="h-full w-full overflow-hidden rounded-[20px] md:rounded-[28px] bg-black relative z-10 border border-neutral-800/50">
        {children}
      </div>
    </motion.div>
  );
};
