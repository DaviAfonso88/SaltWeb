import { connection } from "next/server";

import { AboutSummary } from "@/components/site/home/AboutSummary";
import { ContactSection } from "@/components/site/home/ContactSection";
import { FeaturedEventSection } from "@/components/site/home/FeaturedEventSection";
import { Gallery } from "@/components/site/home/Gallery";
import { Hero } from "@/components/site/home/Hero";
import { Pillars } from "@/components/site/home/Pillars";

export default async function Home() {
  await connection();
  return (
    <>
      <Hero />
      <AboutSummary />
      <Pillars />
      <FeaturedEventSection />
      <Gallery />
      <ContactSection />
    </>
  );
}
