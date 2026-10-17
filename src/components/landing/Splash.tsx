"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShoppingBag } from "lucide-react";

export default function Splash() {
  const reduce = useReducedMotion();
  const [show, setShow] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setShow(false), reduce ? 300 : 1800);
    return () => clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-white"
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
        >
          <div className="relative flex h-28 w-28 items-center justify-center">
            {!reduce &&
              [0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute h-28 w-28 rounded-full border-2 border-emerald-400"
                  initial={{ scale: 0.6, opacity: 0.6 }}
                  animate={{ scale: 2.6, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    delay: 0.2 + i * 0.35,
                    ease: "easeOut",
                    repeat: Infinity,
                  }}
                />
              ))}
            <motion.div
              className="bg-brand relative flex h-24 w-24 items-center justify-center rounded-3xl shadow-xl shadow-emerald-600/30"
              initial={{ scale: 0.4, opacity: 0, rotate: -12 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 180, damping: 14 }}
            >
              <ShoppingBag className="h-11 w-11 text-white" strokeWidth={2.2} />
            </motion.div>
          </div>
          <motion.p
            className="mt-6 text-lg font-extrabold tracking-tight text-emerald-900"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            FUNAAB <span className="text-brand">Marketplace</span>
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}