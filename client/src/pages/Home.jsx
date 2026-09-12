import { Hero } from '@/sections/Hero';
import { TrustedCompanies } from '@/sections/TrustedCompanies';
import { Testimonials } from '@/sections/Testimonials';
import { Services } from '@/sections/Services';
import { Founder } from '@/sections/Founder';
import { Technologies } from '@/sections/Technologies';
import { FeatureHighlights } from '@/sections/FeatureHighlights';
import { NewOurWorks } from '@/components/newPortfolio/NewOurWorks';

export function Home() {
  return (
    <main className="min-w-0">
      <Hero />
      <NewOurWorks />
      <TrustedCompanies />
      <Testimonials />
      <Services />
      <Founder />
      <Technologies />
      <FeatureHighlights />
    </main>
  );
}
