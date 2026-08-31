import { Hero } from '@/sections/Hero';
import { TrustedCompanies } from '@/sections/TrustedCompanies';
import { Testimonials } from '@/sections/Testimonials';
import { Services } from '@/sections/Services';
import { Technologies } from '@/sections/Technologies';
import { FeatureHighlights } from '@/sections/FeatureHighlights';
import { NewOurWorks } from '@/components/newPortfolio/NewOurWorks';

export function Home() {
  return (
    <main>
      <Hero />
      <NewOurWorks />
      <TrustedCompanies />
      <Testimonials />
      <Services />
      <Technologies />
      <FeatureHighlights />
    </main>
  );
}
