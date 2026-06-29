"use client";

import { motion, useReducedMotion } from "motion/react";
import { usePathname } from "next/navigation";

/**
 * Animates each route change with a quick fade + lift. Keyed on the pathname so
 * the new page re-mounts and plays its enter animation. (App Router discards the
 * outgoing tree, so this is enter-only — no exit transition to coordinate.)
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      key={pathname}
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
