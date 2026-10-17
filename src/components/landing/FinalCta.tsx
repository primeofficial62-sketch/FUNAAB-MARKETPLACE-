"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Bike, ShoppingCart, Store } from "lucide-react";
import { ROUTES } from "@/lib/routes";

export default function FinalCta() {
  const reduce = useReducedMotion();
  return (
    <section className="px-5 py-20">
      <div className="bg-brand relative mx-auto max-w-5xl overflow-hidden rounded-[2rem] px-6 py-16 text-center">
        <div aria-hidden className="absolute -left-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl" />
        <div aria-hidden className="absolute -bottom-12 -right-12 h-56 w-56 rounded-full bg-green-300/20 blur-2xl" />

        <motion.div
          className="glass relative mx-auto max-w-xl rounded-3xl px-6 py-10"
          initial={reduce ? false : { opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.span
            className="absolute -top-6 left-1/2 flex h-12 w-12 -translate-x-1/2 items-center justify-center rounded-2xl bg-white text-emerald-700 shadow-lg"
            animate={reduce ? undefined : { y: [0, -8, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          >
            <ShoppingCart className="h-6 w-6" />
          </motion.span>

          <h2 className="text-3xl font-extrabold tracking-tight text-emerald-950">Ready to get started?</h2>
          <p className="mt-3 text-emerald-900/75">Shop from your campus community or start selling today.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link href={ROUTES.explore} className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/25 transition active:scale-95 hover:bg-emerald-700">
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
            <Link href={ROUTES.becomeVendor} className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-6 py-3.5 font-semibold text-emerald-800 transition active:scale-95 hover:bg-emerald-50">
              <Store className="h-4 w-4" /> Become a Vendor
            </Link>
          </div>
        </motion.div>

        <div className="relative mt-10 h-10">
          <div className="absolute inset-x-0 bottom-0 h-px bg-white/30" />
          {!reduce && (
            <motion.div
              className="absolute bottom-1 flex h-9 w-9 items-center justify-center rounded-full bg-white text-emerald-700"
              initial={{ left: "-10%" }}
              animate={{ left: "108%" }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
            >
              <Bike className="h-5 w-5" />
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}