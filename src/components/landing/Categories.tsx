import Link from "next/link";
import type { CSSProperties } from "react";
import {
  Armchair, BookOpen, Droplets, LayoutGrid, Printer,
  Shirt, ShoppingBasket, Smartphone, Sparkles, Utensils,
} from "lucide-react";
import Reveal from "./Reveal";
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
  return (
    <section id="categories" className="mx-auto max-w-6xl px-5 py-20">
      <SectionHeading
        eyebrow="Categories"
        title="Shop by what you need"
        sub="From food to printing, find it all from vendors in your campus community."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {CATEGORIES.map(({ slug, name, Icon }, i) => (
          <Reveal key={slug} delay={(i % 5) * 0.06} className="h-full">
            <Link
              href={ROUTES.category(slug)}
              className="tilt card flex h-full flex-col items-center gap-3 p-5 text-center"
            >
              <span
                className="idle flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-800"
                style={{ "--t": `${2.6 + (i % 3) * 0.4}s` } as CSSProperties}
              >
                <Icon className="h-7 w-7" />
              </span>
              <span className="text-sm font-semibold text-emerald-950">{name}</span>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
