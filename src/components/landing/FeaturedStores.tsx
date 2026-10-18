import { BadgeCheck } from "lucide-react";
import SectionHeading from "./SectionHeading";

// SAMPLE DATA: replace with approved vendor stores from the database (Phase 5).
const STORES = [
  { initial: "K", name: "Sample Kitchen", type: "Food & Snacks" },
  { initial: "G", name: "Sample Gadgets", type: "Electronics" },
  { initial: "B", name: "Sample Books", type: "Books & Education" },
  { initial: "P", name: "Sample Print Hub", type: "Printing & Design" },
  { initial: "B", name: "Sample Beauty Bar", type: "Beauty & Care" },
  { initial: "F", name: "Sample Fresh Mart", type: "Groceries" },
];

export default function FeaturedStores() {
  return (
    <section id="stores" className="py-20">
      <SectionHeading
        eyebrow="Stores"
        title="Trusted vendors near you"
        sub="Every store is reviewed and approved before it can sell."
      />
      <div
        className="overflow-hidden"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
          maskImage: "linear-gradient(to right, transparent, black 8%, black 92%, transparent)",
        }}
      >
        <div className="marquee flex w-max">
          {[...STORES, ...STORES].map((s, i) => (
            <div key={i} className="card mr-4 flex w-64 shrink-0 items-center gap-3 p-4">
              <span className="bg-brand flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white">
                {s.initial}
              </span>
              <div className="min-w-0">
                <p className="truncate font-bold text-emerald-950">{s.name}</p>
                <p className="text-xs text-emerald-800/70">{s.type}</p>
                <span className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-emerald-800">
                  <span className="pulse-badge inline-flex">
                    <BadgeCheck className="h-4 w-4 text-emerald-700" />
                  </span>
                  Verified
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
