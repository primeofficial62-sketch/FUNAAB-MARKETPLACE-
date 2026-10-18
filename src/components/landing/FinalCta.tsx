import Link from "next/link";
import { ArrowRight, Bike, ShoppingCart, Store } from "lucide-react";
import Reveal from "./Reveal";
import { ROUTES } from "@/lib/routes";

export default function FinalCta() {
  return (
    <section className="px-5 py-20">
      <div className="bg-brand relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] px-6 py-16 text-center">
        <div aria-hidden className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-emerald-300/20 blur-2xl" />

        <Reveal className="glass relative mx-auto max-w-xl rounded-3xl px-6 py-10">
          <span className="bob absolute -top-6 inset-x-0 mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-emerald-800 shadow-lg">
            <ShoppingCart className="h-6 w-6" />
          </span>
          <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950">Ready to get started?</h2>
          <p className="mt-3 text-emerald-900/75">Shop from your campus community or start selling today.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={ROUTES.startShopping} className="btn-primary">
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={ROUTES.becomeVendor} className="btn-ghost">
              <Store className="h-4 w-4" /> Become a Vendor
            </Link>
          </div>
        </Reveal>

        <div className="relative mt-10 h-10 overflow-hidden">
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/30" />
          <div className="cta-rider absolute bottom-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-800">
            <Bike className="h-5 w-5" />
          </div>
        </div>
      </div>
    </section>
  );
}
