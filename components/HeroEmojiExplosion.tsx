"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";

export default function HeroEmojiExplosion() {
  const emojiRef = useRef<HTMLDivElement>(null);
  const inView = useInView(emojiRef, { margin: "-20% 0px -20% 0px", amount: 0.2 });

  return (
    <div
      ref={emojiRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-10"
    >
      <motion.span
        className="absolute left-[12%] top-[34%] text-2xl animate-emoji-float-1 hidden sm:block"
        style={{ animationDelay: "0.1s" }}
        role="img"
        aria-label="Airplane"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >✈️</motion.span>
      <motion.span
        className="absolute left-[80%] top-[18%] text-2xl animate-emoji-float-2 hidden sm:block"
        style={{ animationDelay: "0.3s" }}
        role="img"
        aria-label="Palm Tree"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >🌴</motion.span>
      <motion.span
        className="absolute right-[20%] bottom-[10%] text-2xl animate-emoji-float-4"
        style={{ animationDelay: "0.2s" }}
        role="img"
        aria-label="Camera"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.3 }}
      >📷</motion.span>
      <motion.span
        className="absolute left-[50%] top-[5%] text-2xl animate-emoji-float-5"
        style={{ animationDelay: "0.4s" }}
        role="img"
        aria-label="Luggage"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.4 }}
      >🧳</motion.span>
      <motion.span
        className="absolute left-[15%] top-[80%] text-2xl animate-emoji-float-6"
        style={{ animationDelay: "0.6s" }}
        role="img"
        aria-label="Sun"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.5 }}
      >☀️</motion.span>
      <motion.span
        className="absolute right-[10%] top-[50%] text-2xl animate-emoji-float-7 hidden sm:block"
        style={{ animationDelay: "0.7s" }}
        role="img"
        aria-label="Globe"
        initial={{ opacity: 0, y: 40 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 40 }}
        transition={{ duration: 0.6, delay: 0.6 }}
      >🌍</motion.span>
    </div>
  );
} 