"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { Bike, Search, ShoppingCart, Store } from "lucide-react";
import SectionHeading from "./SectionHeading";

const STEPS = [
  { title: "Browse", text: "Search products and stores from your university community.", Icon: Search },
  { title: "Order", text: "Add to your cart and check out securely.", Icon: ShoppingCart },
  { title: "Vendor prepares", text: "Your vendor confirms and gets your order ready.", Icon: Store },
  { title: "Rider delivers", text: "Pick up or get it delivered to you.", Icon: Bike },
];

export default function HowItWorks() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start 75%", "end 60%"] });
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const riderTop = useTransform(progress, [0, 1], ["0%", "100%"]);

  return (
    <section id="how-it-works" className="bg-emerald-50/60 py-20">
      <div className="mx-auto max-w-2xl px-5">
        <SectionHeading eyebrow="How it works" title="From tap to doorstep" />

        <div ref={ref} className="relative pb-6 pl-16">
          <div className="absolute bottom-0 left-5 top-0 w-1 rounded bg-emerald-100" />
          <motion.div
            className="absolute bottom-0 left-5 top-0 w-1 origin-top rounded bg-[linear-gradient(180deg,#4ade80,#047857)]"
            style={{ scaleY: reduce ? 1 : progress }}
          />
          {!reduce && (
            <motion.div
              className="absolute left-0 z-10 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-600/30"
              style={{ top: riderTop }}
            >
              <Bike className="h-5 w-5" />
            </motion.div>
          )}

          <ol className="space-y-8">
            {STEPS.map(({ title, text, Icon }, i) => (
              <motion.li
                key={title}
                className="card flex items-start gap-4 p-5"
                initial={reduce ? false : { opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5 }}
              >
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700">
                  <Icon className="h-6 w-6" />
                </span>
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-emerald-600">Step {i + 1}</p>
                  <h3 className="text-lg font-bold text-emerald-950">{title}</h3>
                  <p className="mt-1 text-sm text-emerald-900/70">{text}</p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}