import { Bike, Lock, ShieldCheck } from "lucide-react";
import type { CSSProperties } from "react";
import RiderScene from "./RiderScene";

const WORDS = ["Everything", "You", "Need,", "Delivered", "to", "You."];

const TRUST = [
  { Icon: ShieldCheck, label: "Verified vendors" },
  { Icon: Lock, label: "Secure payments" },
  { Icon: Bike, label: "Delivered on campus" },
];

export default function Hero() {
  return (
    <section className="bg-brand-soft relative isolate flex min-h-screen items-center overflow-hidden">
      <div aria-hidden className="absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 -right-24 -z-10 h-80 w-80 rounded-full bg-emerald-300/30 blur-3xl" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2">
        <div>
          <span
            className="hero-fade inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700"
            style={{ "--d": "1.7s" } as CSSProperties}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-700 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-800" />
            </span>
            Now live at FUNAAB
          </span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl">
            {WORDS.map((w, i) => (
              <span key={`${w}-${i}`} className="word-wrap">
                <span
                  className={`word ${i === 3 ? "text-brand" : ""}`}
                  style={{ "--i": i } as CSSProperties}
                >
                  {w}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="hero-fade mt-5 max-w-md text-base text-emerald-900/75 sm:text-lg"
            style={{ "--d": "2.3s" } as CSSProperties}
          >
            Discover products, connect with trusted vendors, and shop from your university community.
          </p>

          <div
            className="hero-fade mt-8 grid gap-3 sm:grid-cols-3"
            style={{ "--d": "2.5s" } as CSSProperties}
          >
            {TRUST.map(({ Icon, label }) => (
              <div key={label} className="card flex items-center gap-3 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-800">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-emerald-950">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-fade" style={{ "--d": "2s" } as CSSProperties}>
          <RiderScene />
        </div>
      </div>
    </section>
  );
}
