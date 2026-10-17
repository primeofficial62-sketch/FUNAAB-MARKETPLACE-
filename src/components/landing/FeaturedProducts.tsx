"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { BookOpen, Printer, ShoppingCart, Smartphone, Utensils } from "lucide-react";
import SectionHeading from "./SectionHeading";
import { ROUTES } from "@/lib/routes";

// SAMPLE DATA: replace with published products from the database (Phase 4).
const PRODUCTS = [
  { name: "Jollof Rice & Chicken Pack", store: "Sample Kitchen", price: 2500, Icon: Utensils },
  { name: "Wireless Earbuds", store: "Sample Gadgets", price: 12000, Icon: Smartphone },
  { name: "Course Textbook Bundle", store: "Sample Books", price: 6500, Icon: BookOpen },
  { name: "A4 Colour Printing (50 pages)", store: "Sample Print Hub", price: 1500, Icon: Printer },
];

const naira = (n: number) => "₦" + n.toLocaleString("en-NG");

export default function FeaturedProducts() {
  const reduce = useReducedMotion();
  return (
    <section id="featured" className="bg-emerald-50/60 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <SectionHeading
          eyebrow="Featured"
          title="Picked for you"
          sub="Selected products from approved campus vendors."
        />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {PRODUCTS.map(({ name, store, price, Icon }, i) => (
            <motion.article
              key={name}
              className="card overflow-hidden"
              initial={reduce ? false : { opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, delay: i * 0.1 }}
            >
              <div className="flex h-36 items-center justify-center bg-[linear-gradient(135deg,#d1fae5,#a7f3d0)]">
                <Icon className="h-14 w-14 text-emerald-700" strokeWidth={1.6} />
              </div>
              <div className="p-4">
                <p className="text-xs font-medium text-emerald-700">{store}</p>
                <h3 className="mt-1 line-clamp-2 font-bold text-emerald-950">{name}</h3>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-lg font-extrabold text-emerald-900">{naira(price)}</span>
                  <motion.div whileTap={reduce ? undefined : { scale: [1, 0.8, 1.2, 1] }} transition={{ duration: 0.35 }}>
                    <Link
                      href={ROUTES.explore}
                      aria-label={`View ${name}`}
                      className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md shadow-emerald-600/25 hover:bg-emerald-700"
                    >
                      <ShoppingCart className="h-4 w-4" />
                    </Link>
                  </motion.div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}