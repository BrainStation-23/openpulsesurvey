
import React from "react";
import { motion } from "framer-motion";

const pills = [
  {
    className: "left-[-10vw] top-[4vh] w-[40vw] h-[7vw] bg-gradient-to-r from-[#7d7ddc88] to-[#30304866]",
    animate: { x: [0, 80, 0], rotate: [13, 23, 13] },
    transition: { duration: 16, repeat: Infinity, ease: "linear" },
  },
  {
    className: "right-[-5vw] top-[10vh] w-[20vw] h-[5vw] bg-gradient-to-r from-[#ecc6d899] to-[#32324633]",
    animate: { x: [0, -70, 0], rotate: [7, 19, 7] },
    transition: { duration: 18, repeat: Infinity, ease: "linear" },
  },
  {
    className: "left-[-5vw] bottom-[5vh] w-[30vw] h-[6vw] bg-gradient-to-r from-[#5f5f8888] to-[#22224433]",
    animate: { x: [0, 100, 0], rotate: [0, 28, 0] },
    transition: { duration: 20, repeat: Infinity, ease: "linear" },
  },
  {
    className: "right-[-12vw] bottom-[-3vw] w-[50vw] h-[8vw] bg-gradient-to-l from-[#cd8da788] to-[#00000022]",
    animate: { x: [0, 90, 0], rotate: [-5, 11, -5] },
    transition: { duration: 22, repeat: Infinity, ease: "linear" },
  },
];

type Props = {
  children: React.ReactNode;
};

const AnimatedAuroraBackground = ({ children }: Props) => {
  return (
    <div className="relative w-full min-h-screen bg-[#101113] overflow-hidden z-0 select-none flex items-center justify-center">
      {/* Animated Pills */}
      {pills.map((pill, idx) => (
        <motion.div
          key={idx}
          className={`absolute rounded-full blur-3xl opacity-70 pointer-events-none will-change-transform border border-[#fff2]/5 ${pill.className}`}
          animate={pill.animate}
          transition={pill.transition}
        />
      ))}
      {/* Children overlay */}
      <div className="z-10 w-full h-full flex items-center justify-center">{children}</div>
    </div>
  );
};

export default AnimatedAuroraBackground;
