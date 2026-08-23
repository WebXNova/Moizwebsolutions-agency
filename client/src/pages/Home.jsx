import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Hero } from '@/sections/Hero';
import { TrustedCompanies } from '@/sections/TrustedCompanies';
import { Services } from '@/sections/Services';
import { Technologies } from '@/sections/Technologies';
import { Work } from '@/sections/Work';
import { Process } from '@/sections/Process';
import { Testimonials } from '@/sections/Testimonials';
import { FinalCTA } from '@/sections/FinalCTA';

export function Home() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <TrustedCompanies />
        <Services />
        <Technologies />
        <Work />
        <Process />
        <Testimonials />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
