import Splash from "@/components/landing/Splash";
import Hero from "@/components/landing/Hero";
import Categories from "@/components/landing/Categories";
import FeaturedStores from "@/components/landing/FeaturedStores";
import HowItWorks from "@/components/landing/HowItWorks";
import Universities from "@/components/landing/Universities";
import Trust from "@/components/landing/Trust";
import FinalCta from "@/components/landing/FinalCta";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <>
      <Splash />
      <main className="overflow-x-hidden">
        <Hero />
        <Categories />
        <FeaturedStores />
        <HowItWorks />
        <Universities />
        <Trust />
        <FinalCta />
      </main>
      <Footer />
    </>
  );
}