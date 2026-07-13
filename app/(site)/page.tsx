import Hero from "@/app/components/home/Hero";
import About from "@/app/components/home/About";
import Pillars from "@/app/components/home/Pillars";
import Gallery from "@/app/components/home/Gallery";
import ContactForm from "@/app/components/ContactForm";
import MapSection from "@/app/components/home/MapSection";

export default function Home() {
  return (
    <>
      <Hero />
      <About />
      <Pillars />
      <Gallery />
      <ContactForm />
      <MapSection />
    </>
  );
}
