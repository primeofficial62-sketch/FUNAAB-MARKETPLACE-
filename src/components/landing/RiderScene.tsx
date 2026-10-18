import { BookOpen, Check, Package, ShoppingBag, Smartphone } from "lucide-react";
import type { CSSProperties } from "react";

const FLOATERS = [
  { Icon: ShoppingBag, pos: { left: "3%", top: "10%" }, t: "4.2s" },
  { Icon: Smartphone, pos: { left: "38%", top: "0%" }, t: "5.1s" },
  { Icon: BookOpen, pos: { left: "5%", top: "44%" }, t: "4.7s" },
  { Icon: Package, pos: { right: "1%", top: "46%" }, t: "5.5s" },
];

function Wheel({ cx }: { cx: number }) {
  return (
    <g transform={`translate(${cx} 0)`}>
      <circle r="13" fill="#022c22" />
      <g className="wheel-spin">
        <circle r="8" fill="none" stroke="#a7f3d0" strokeWidth="2" strokeDasharray="4 5" />
        <line x1="-8" y1="0" x2="8" y2="0" stroke="#a7f3d0" strokeWidth="2" />
      </g>
      <circle r="3" fill="#d1fae5" />
    </g>
  );
}

export default function RiderScene() {
  return (
    <div className="relative mx-auto w-full max-w-xl" style={{ aspectRatio: "10 / 7" }}>
      {FLOATERS.map(({ Icon, pos, t }, i) => (
        <div
          key={i}
          className="glass floaty absolute z-10 flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ ...pos, "--t": t } as CSSProperties}
        >
          <Icon className="h-5 w-5 text-emerald-800" />
        </div>
      ))}

      <div className="glass delivered absolute right-[3%] top-[8%] z-20 flex items-center gap-2 rounded-2xl px-3 py-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-800">
          <Check className="h-4 w-4 text-white" strokeWidth={3} />
        </span>
        <span className="text-sm font-bold text-emerald-900">Order delivered</span>
      </div>

      <svg viewBox="0 0 400 280" className="h-full w-full" role="img" aria-label="A delivery rider on a scooter delivering a package">
        <defs>
          <linearGradient id="bgA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#d1fae5" />
            <stop offset="1" stopColor="#ffffff" />
          </linearGradient>
          <linearGradient id="bldA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#047857" />
            <stop offset="1" stopColor="#064e3b" />
          </linearGradient>
          <linearGradient id="bldB" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#065f46" />
            <stop offset="1" stopColor="#022c22" />
          </linearGradient>
        </defs>

        <rect width="400" height="280" rx="28" fill="url(#bgA)" />
        <circle cx="330" cy="60" r="34" fill="#bbf7d0" opacity="0.7" />

        {/* city strip */}
        <rect x="18" y="130" width="46" height="102" rx="6" fill="url(#bldB)" />
        <rect x="70" y="100" width="54" height="132" rx="6" fill="url(#bldA)" />
        <rect x="130" y="144" width="40" height="88" rx="6" fill="url(#bldB)" />
        <rect x="176" y="116" width="50" height="116" rx="6" fill="url(#bldA)" />
        <rect x="232" y="150" width="36" height="82" rx="6" fill="url(#bldB)" />
        <g fill="#d1fae5" opacity="0.85">
          <rect x="80" y="114" width="10" height="12" rx="2" />
          <rect x="100" y="114" width="10" height="12" rx="2" />
          <rect x="80" y="138" width="10" height="12" rx="2" />
          <rect x="100" y="138" width="10" height="12" rx="2" />
          <rect x="80" y="162" width="10" height="12" rx="2" />
          <rect x="100" y="162" width="10" height="12" rx="2" />
          <rect x="186" y="130" width="10" height="12" rx="2" />
          <rect x="206" y="130" width="10" height="12" rx="2" />
          <rect x="186" y="154" width="10" height="12" rx="2" />
          <rect x="206" y="154" width="10" height="12" rx="2" />
          <rect x="28" y="144" width="10" height="12" rx="2" />
          <rect x="28" y="168" width="10" height="12" rx="2" />
        </g>

        {/* destination house */}
        <rect x="278" y="170" width="86" height="62" rx="6" fill="#fff" stroke="#047857" strokeWidth="2" />
        <path d="M270 172 L321 136 L372 172 Z" fill="#065f46" />
        <rect x="310" y="196" width="22" height="36" rx="4" fill="#047857" />
        <rect x="288" y="184" width="14" height="14" rx="3" fill="#d1fae5" />

        {/* road */}
        <rect x="0" y="232" width="400" height="48" fill="#064e3b" />
        <rect x="0" y="232" width="400" height="5" fill="#047857" />
        <line className="lane" x1="0" y1="258" x2="400" y2="258" stroke="#a7f3d0" strokeWidth="3" strokeDasharray="14 12" />

        {/* package */}
        <g transform="translate(300 222)">
          <g className="pkg">
            <rect x="-11" y="-20" width="22" height="20" rx="3" fill="#065f46" />
            <rect x="-2" y="-20" width="4" height="20" fill="#ecfdf5" />
          </g>
        </g>

        {/* rider */}
        <g className="rider">
          <g transform="translate(0 219)">
            <ellipse cx="29" cy="14" rx="46" ry="5" fill="#022c22" opacity="0.25" />
            <circle className="dust" cx="-16" cy="4" r="4" fill="#d1fae5" style={{ animationDelay: "0s" }} />
            <circle className="dust" cx="-25" cy="4" r="4" fill="#d1fae5" style={{ animationDelay: "0.25s" }} />
            <circle className="dust" cx="-34" cy="4" r="4" fill="#d1fae5" style={{ animationDelay: "0.5s" }} />

            <rect x="-18" y="-74" width="32" height="30" rx="6" fill="#065f46" />
            <rect x="-18" y="-62" width="32" height="5" fill="#ecfdf5" opacity="0.9" />

            <rect x="-4" y="-24" width="28" height="15" rx="7" fill="#047857" />
            <rect x="8" y="-11" width="42" height="6" rx="3" fill="#064e3b" />
            <line x1="50" y1="-8" x2="46" y2="-48" stroke="#022c22" strokeWidth="5" strokeLinecap="round" />
            <line x1="40" y1="-50" x2="55" y2="-50" stroke="#022c22" strokeWidth="5" strokeLinecap="round" />

            <path d="M20 -26 L38 -28 L42 -10" fill="none" stroke="#022c22" strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M18 -28 L22 -58" stroke="#047857" strokeWidth="13" strokeLinecap="round" />
            <path d="M25 -54 L47 -49" stroke="#047857" strokeWidth="5" strokeLinecap="round" />
            <circle cx="27" cy="-71" r="9" fill="#fcd9b6" />
            <path d="M17 -72 A10 10 0 0 1 37 -72 Z" fill="#022c22" />

            <Wheel cx={0} />
            <Wheel cx={58} />
          </g>
        </g>
      </svg>
    </div>
  );
}
