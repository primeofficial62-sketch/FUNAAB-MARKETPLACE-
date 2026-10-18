"use client";

import { useEffect, useRef } from "react";
import { Bike, Search, ShoppingCart, Store } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

const STEPS = [
  { title: "Browse", text: "Search products and stores from your university community.", Icon: Search },
  { title: "Order", text: "Add to your cart and check out securely.", Icon: ShoppingCart },
  { title: "Vendor prepares", text: "Your vendor confirms and gets your order ready.", Icon: Store },
  { title: "Rider delivers", text: "Pick up or get it delivered to you.", Icon: Bike },
];

export default function HowItWorks() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);
  const riderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const update = () => {
      const wrap = wrapRef.current;
      const line = lineRef.current;
      const rider = riderRef.current;
      if (!wrap || !line || !rider) return;
      const r = wrap.getBoundingClientRect();
      const start = window.innerHeight * 0.75;
      const span = r.height + window.innerHeight * 0.15;
      const p = Math.max(0, Math.min(1, (start - r.top) / span));
      line.style.height = `${p * 100}%`;
      rider.style.top = `${p * 100}%`;
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <section id="how-it-works" className="bg-emerald-50/60 py-20">
      <div className="mx-auto max-w-2xl px-5">
        <SectionHeading eyebrow="How it works" title="From tap to doorstep" />

        <div ref={wrapRef} className="relative pb-6 pl-16">
          <div className="absolute bottom-0 left-5 top-0 w-1 rounded bg-emerald-100" />
          <div
            ref={lineRef}
            className="absolute left-5 top-0 w-1 rounded"
            style={{ height: 0, background: "linear-gradient(180deg, #059669, #064e3b)" }}
          />
          <div
            ref={riderRef}
            className="absolute left-0 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-800 text-white shadow-lg shadow-emerald-900/30"
            style={{ top: 0, transform: "translateY(-50%)" }}
          >
            <Bike className="h-5 w-5" />
          </div>

          <ol className="space-y-8">
            {STEPS.map(({ title, text, Icon }, i) => (
              <li key={title}>
                <Reveal>
                  <div className="card flex items-start gap-4 p-5">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800">
                      <Icon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Step {i + 1}</p>
                      <h3 className="text-lg font-bold text-emerald-950">{title}</h3>
                      <p className="mt-1 text-sm text-emerald-900/70">{text}</p>
                    </div>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}
