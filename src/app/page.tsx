import { Nav } from "@/components/Nav";
import { Footer } from "@/components/Footer";
import { Hero } from "@/components/sections/Hero";
import { Work } from "@/components/sections/Work";
import { Craft } from "@/components/sections/Craft";
import { Timeline } from "@/components/sections/Timeline";
import { About } from "@/components/sections/About";
import { Contact } from "@/components/sections/Contact";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main" className="relative z-10">
        <Hero />
        <Work />
        <Craft />
        <Timeline />
        <About />
        <Contact />
      </main>
      <Footer />
    </>
  );
}
