"use client";

import { useEffect, useRef, useState } from "react";
import { Flag, ShieldCheck, Star } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

function Counter({ to }: { to: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [v, setV] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setV(to);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const dur = 1800;
        const tick = (t: number) => {
          const p = Math.min((t - start) / dur, 1);
          setV(Math.round(to * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [to]);

  return <span ref={ref}>{v}</span>;
}

// These reflect platform rules from the plan, not traffic numbers.
const POINTS = [
  { Icon: ShieldCheck, stat: <><Counter to={100} />%</>, label: "of vendors are reviewed and approved before they sell" },
  { Icon: Star, stat: <><Counter to={100} />%</>, label: "of reviews come from verified purchases" },
  { Icon: Flag, stat: <>1 tap</>, label: "to report a listing, vendor or order problem" },
];

export default function Trust() {
  return (
    <section id="trust" className="bg-emerald-50/60 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Trust & safety"
          title="Shop with confidence"
          sub="Vendor approval, honest reviews, and a clear way to report problems."
        />

        <Reveal className="mx-auto mb-10 h-28 w-28">
          <svg viewBox="0 0 100 110" className="h-full w-full" aria-hidden="true">
            <path
              className="draw"
              pathLength={1}
              d="M50 8 L88 22 V50 C88 74 72 90 50 98 C28 90 12 74 12 50 V22 Z"
              fill="#ecfdf5"
              stroke="#047857"
              strokeWidth="5"
              strokeLinejoin="round"
            />
            <path
              className="draw check"
              pathLength={1}
              d="M32 56 L45 69 L70 40"
              fill="none"
              stroke="#065f46"
              strokeWidth="7"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </Reveal>

        <div className="grid gap-4 md:grid-cols-3">
          {POINTS.map(({ Icon, stat, label }, i) => (
            <Reveal key={i} delay={i * 0.1}>
              <div className="card p-6 text-center">
                <Icon className="mx-auto h-6 w-6 text-emerald-800" />
                <p className="text-brand mt-3 text-4xl font-extrabold">{stat}</p>
                <p className="mt-2 text-sm text-emerald-900/70">{label}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
