import * as React from "react";
import { motion, useReducedMotion } from "framer-motion";

interface IntelligenceRevealProps {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}

/**
 * Classified intelligence scroll-reveal.
 * Starts at opacity ~0.2, blur ~6px, translateY ~20px.
 * Smoothly resolves to opacity 1, blur 0px, translateY 0 as it enters the viewport.
 */
export function IntelligenceReveal({
  children,
  delay = 0,
  className = "",
}: IntelligenceRevealProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 16,
        filter: "blur(2px)",
      }}
      whileInView={{
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
      }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{
        duration: 0.48,
        delay,
        ease: [0.16, 1, 0.3, 1], // Apple HIG easing
      }}
      className={className}
      style={{ willChange: "opacity, transform" }}
    >
      {children}
    </motion.div>
  );
}
