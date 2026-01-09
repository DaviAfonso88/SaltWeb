import Hero from "./components/home/Hero";
import About from "./components/home/About";
import Pillars from "./components/home/Pillars";
import Gallery from "./components/home/Gallery";
import ContactForm from "./components/ContactForm";
import MapSection from "./components/home/MapSection"; // Import MapSection

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
