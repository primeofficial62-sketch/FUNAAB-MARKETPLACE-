"use client";

import { motion, useReducedMotion } from "framer-motion";
import { BadgeCheck } from "lucide-react";
import SectionHeading from "./SectionHeading";

// SAMPLE DATA: replace with approved vendor stores from the database (Phase 5).
const STORES = [
  { name: "Sample Kitchen", type: "Food & Snacks" },
  { name: "Sample Gadgets", type: "Electronics" },
  { name: "Sample Books", type: "Books & Education" },
  { name: "Sample Print Hub", type: "Printing & Design" },
  { name: "Sample Beauty Bar", type: "Beauty & Care" },
  { name: "Sample Fresh Mart", type: "Groceries" },
];

function StoreCard({ name, type }: { name: string; type: string }) {
  const reduce = useReducedMotion();
  return (
    <div className="card mr-4 flex w-64 shrink-0 items-center gap-3 p-4">
      <span className="bg-brand flex h-12 w-12 items-center justify-center rounded-full text-lg font-extrabold text-white">
        {name.replace("Sample ", "").charAt(0)}
      </span>
      <div className="min-w-0">
        <p className="truncate font-bold text-emerald-950">{name}</p>
        <p className="text-xs text-emerald-800/70">{type}</p>
        <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
          <motion.span
            className="inline-flex"
            animate={reduce ? undefined : { scale: [1, 1.25, 1] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
          >
            <BadgeCheck className="h-4 w-4 text-green-500" />
          </motion.span>
          Verified
        </span>
      </div>
    </div>
  );
}

export default function FeaturedStores() {
  const reduce = useReducedMotion();
  return (
    <section id="stores" className="py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Stores"
          title="Trusted vendors near you"
          sub="Every store is reviewed and approved before it can sell."
        />
      </div>

      {reduce ? (
        <div className="flex overflow-x-auto px-5 pb-2">
          {STORES.map((s) => (
            <StoreCard key={s.name} {...s} />
          ))}
        </div>
      ) : (
        <div className="overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
          <motion.div
            className="flex w-max"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 28, ease: "linear", repeat: Infinity }}
          >
            {[...STORES, ...STORES].map((s, i) => (
              <StoreCard key={i} {...s} />
            ))}
          </motion.div>
        </div>
      )}
    </section>
  );
}