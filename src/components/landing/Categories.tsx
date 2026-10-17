"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  Armchair, BookOpen, Droplets, LayoutGrid, Printer,
  Shirt, ShoppingBasket, Smartphone, Sparkles, Utensils,
} from "lucide-react";
import SectionHeading from "./SectionHeading";
import { ROUTES } from "@/lib/routes";

const CATEGORIES = [
  { slug: "food-snacks", name: "Food & Snacks", Icon: Utensils },
  { slug: "fashion", name: "Fashion & Clothing", Icon: Shirt },
  { slug: "electronics", name: "Electronics & Gadgets", Icon: Smartphone },
  { slug: "books", name: "Books & Education", Icon: BookOpen },
  { slug: "beauty", name: "Beauty & Personal Care", Icon: Sparkles },
  { slug: "groceries", name: "Groceries", Icon: ShoppingBasket },
  { slug: "home", name: "Home & Household", Icon: Armchair },
  { slug: "printing-design", name: "Printing & Design", Icon: Printer },
  { slug: "laundry-cleaning", name: "Laundry & Cleaning", Icon: Droplets },
  { slug: "other", name: "Other Products & Services", Icon: LayoutGrid },
];

export default function Categories() {
  const reduce = useReducedMotion();
  return (
    <section id="categories" className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        eyebrow="Categories"
        title="Shop by what you need"
        sub="From food to printing, find it all from vendors in your campus community."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5" style={{ perspective: 800 }}>
        {CATEGORIES.map(({ slug, name, Icon }, i) => (
          <motion.div
            key={slug}
            initial={reduce ? false : { opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.5, delay: (i % 5) * 0.06 }}
            whileHover={reduce ? undefined : { y: -6, rotateX: 8, rotateY: -6 }}
            whileTap={{ scale: 0.97 }}
          >
            <Link href={ROUTES.category(slug)} className="card flex h-full flex-col items-center gap-3 p-5 text-center">
              <motion.span
                className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-700"
                animate={reduce ? undefined : { y: [0, -4, 0] }}
                transition={{ duration: 2.6 + (i % 3) * 0.4, repeat: Infinity, ease: "easeInOut" }}
              >
                <Icon className="h-7 w-7" />
              </motion.span>
              <span className="text-sm font-semibold text-emerald-950">{name}</span>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}