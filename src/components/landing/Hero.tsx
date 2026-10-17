"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, Store } from "lucide-react";
import RiderScene from "./RiderScene";
import { ROUTES } from "@/lib/routes";

const WORDS = ["Everything", "You", "Need,", "Delivered", "to", "You."];

export default function Hero() {
  const reduce = useReducedMotion();
  const base = reduce ? 0 : 1.7;

  return (
    <section className="bg-brand-soft relative isolate flex min-h-svh items-center overflow-hidden">
      <div aria-hidden className="absolute -left-24 -top-24 -z-10 h-72 w-72 rounded-full bg-emerald-200/50 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 -right-24 -z-10 h-80 w-80 rounded-full bg-green-300/30 blur-3xl" />

      <div className="mx-auto grid w-full max-w-6xl items-center gap-10 px-5 py-16 lg:grid-cols-2">
        <div>
          <motion.span
            className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-3 py-1 text-xs font-semibold text-emerald-700"
            initial={reduce ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: base, duration: 0.5 }}
          >
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-green-400 opacity-75 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-green-500" />
            </span>
            Now live at FUNAAB
          </motion.span>

          <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-emerald-950 sm:text-5xl lg:text-6xl">
            {WORDS.map((w, i) => (
              <span key={i} className="mr-[0.25em] inline-block overflow-hidden pb-1 align-bottom">
                <motion.span
                  className={`inline-block ${i === 3 ? "text-brand" : ""}`}
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.6, delay: base + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                >
                  {w}
                </motion.span>
              </span>
            ))}
          </h1>

          <motion.p
            className="mt-5 max-w-md text-base text-emerald-900/75 sm:text-lg"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: base + 0.6, duration: 0.6 }}
          >
            Discover products, connect with trusted vendors, and shop from your university community.
          </motion.p>

          <motion.div
            className="mt-8 flex flex-wrap gap-3"
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: base + 0.8, duration: 0.6 }}
          >
            <Link
              href={ROUTES.explore}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-600 px-6 py-3.5 font-semibold text-white shadow-lg shadow-emerald-600/25 transition active:scale-95 hover:bg-emerald-700"
            >
              Start Shopping <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href={ROUTES.becomeVendor}
              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-white px-6 py-3.5 font-semibold text-emerald-800 transition active:scale-95 hover:bg-emerald-50"
            >
              <Store className="h-4 w-4" /> Become a Vendor
            </Link>
          </motion.div>
        </div>

        <motion.div
          initial={reduce ? false : { opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: base + 0.3, duration: 0.8 }}
        >
          <RiderScene />
        </motion.div>
      </div>
    </section>
  );
}