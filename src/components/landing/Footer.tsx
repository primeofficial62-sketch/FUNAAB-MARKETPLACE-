import Link from "next/link";
import { ROUTES } from "@/lib/routes";

const COLUMNS = [
  {
    title: "Company",
    links: [
      { label: "About Us", href: ROUTES.about },
      { label: "Contact", href: ROUTES.contact },
      { label: "Help Centre", href: ROUTES.help },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms and Conditions", href: ROUTES.terms },
      { label: "Privacy Policy", href: ROUTES.privacy },
    ],
  },
  {
    title: "Community",
    links: [
      { label: "Vendor Guidelines", href: ROUTES.vendorGuidelines },
      { label: "Community Guidelines", href: ROUTES.communityGuidelines },
    ],
  },
];

// TODO: replace "#" with your real social profile URLs.
const SOCIALS = ["Instagram", "X", "WhatsApp"];

export default function Footer() {
  return (
    <footer className="relative bg-emerald-950 text-emerald-50">
      <svg
        viewBox="0 0 1440 60"
        preserveAspectRatio="none"
        className="absolute inset-x-0 h-[60px] w-full"
        style={{ top: "-59px" }}
        aria-hidden="true"
      >
        <path d="M0 30 C240 70 480 0 720 30 C960 60 1200 0 1440 30 V60 H0 Z" fill="#022c22" />
      </svg>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-5">
        <div className="md:col-span-2">
          <p className="text-xl font-extrabold">FUNAAB Marketplace</p>
          <p className="mt-2 max-w-xs text-sm text-emerald-100/70">Everything You Need, Delivered to You.</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {SOCIALS.map((s) => (
              <a
                key={s}
                href="#"
                className="rounded-full border border-emerald-700 px-4 py-1.5 text-sm text-emerald-100 transition hover:bg-emerald-800"
              >
                {s}
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-bold uppercase tracking-wider text-emerald-400">{c.title}</p>
            <ul className="mt-3 space-y-2">
              {c.links.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-sm text-emerald-100/80 hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="border-t border-emerald-900 py-5 text-center text-xs text-emerald-100/60">
        © {new Date().getFullYear()} FUNAAB Marketplace. All rights reserved.
      </div>
    </footer>
  );
}
