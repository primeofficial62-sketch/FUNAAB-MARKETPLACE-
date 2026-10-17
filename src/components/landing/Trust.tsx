"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "framer-motion";
import { Flag, ShieldCheck, Star } from "lucide-react";
import SectionHeading from "./SectionHeading";

function Counter({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);

  useEffect(() => {
    if (reduce) {
      setV(to);
      return;
    }
    if (!inView) return;
    const c = animate(0, to, { duration: 1.8, ease: "easeOut", onUpdate: (l) => setV(Math.round(l)) });
    return () => c.stop();
  }, [inView, to, reduce]);

  return <span ref={ref}>{v}{suffix}</span>;
}

// These reflect platform rules from the plan, not traffic numbers.
const POINTS = [
  { Icon: ShieldCheck, stat: <Counter to={100} suffix="%" />, label: "of vendors are reviewed and approved before they sell" },
  { Icon: Star, stat: <Counter to={100} suffix="%" />, label: "of reviews come from verified purchases" },
  { Icon: Flag, stat: <>1 tap</>, label: "to report a listing, vendor or order problem" },
];

export default function Trust() {
  const reduce = useReducedMotion();
  return (
    <section id="trust" className="bg-emerald-50/60 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Trust & safety"
          title="Shop with confidence"
          sub="Vendor approval, honest reviews, and a clear way to report problems."
        />

        <div className="mx-auto mb-10 h-28 w-28">
          <svg viewBox="0 0 100 110" className="h-full w-full" aria-hidden>
            <motion.path
              d="M50 8 L88 22 V50 C88 74 72 90 50 98 C28 90 12 74 12 50 V22 Z"
              fill="#ecfdf5" stroke="#059669" strokeWidth="5" strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
            />
            <motion.path
              d="M32 56 L45 69 L70 40"
              fill="none" stroke="#22c55e" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round"
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 1.1, ease: "easeOut" }}
            />
          </svg>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {POINTS.map(({ Icon, stat, label }, i) => (
            <motion.div
              key={i}
              className="card p-6 text-center"
              initial={reduce ? false : { opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Icon className="mx-auto h-6 w-6 text-emerald-600" />
              <p className="text-brand mt-3 text-4xl font-extrabold">{stat}</p>
              <p className="mt-2 text-sm text-emerald-900/70">{label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}