import { GraduationCap, MapPin } from "lucide-react";
import Reveal from "./Reveal";
import SectionHeading from "./SectionHeading";

// Only FUNAAB is active. Others stay "Coming soon" until configured and activated.
const OTHERS = [
  "University of Ibadan",
  "University of Lagos",
  "Obafemi Awolowo University",
  "University of Benin",
];

export default function Universities() {
  return (
    <section id="universities" className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        eyebrow="Universities"
        title="Your campus, your marketplace"
        sub="We're starting at FUNAAB and growing to more universities across Nigeria."
      />
      <div className="grid gap-4 md:grid-cols-3">
        <Reveal className="md:row-span-2">
          <div className="card relative h-full p-6">
            <span className="absolute right-4 top-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-700 opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-800" />
              </span>
              Live
            </span>
            <span className="bg-brand flex h-14 w-14 items-center justify-center rounded-2xl text-white">
              <GraduationCap className="h-7 w-7" />
            </span>
            <h3 className="mt-4 text-xl font-extrabold text-emerald-950">FUNAAB</h3>
            <p className="mt-1 flex items-center gap-1 text-sm text-emerald-800/70">
              <MapPin className="h-4 w-4" /> Federal University of Agriculture, Abeokuta
            </p>
            <p className="mt-4 text-sm text-emerald-900/70">
              Shop from approved campus vendors and get your orders delivered or ready for pickup.
            </p>
          </div>
        </Reveal>

        {OTHERS.map((u, i) => (
          <Reveal key={u} delay={0.1 + i * 0.08}>
            <div
              className="card flex items-center justify-between gap-3 p-5"
              style={{ opacity: 0.6, filter: "grayscale(1)" }}
            >
              <span className="font-semibold text-emerald-950">{u}</span>
              <span className="shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                Coming soon
              </span>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
