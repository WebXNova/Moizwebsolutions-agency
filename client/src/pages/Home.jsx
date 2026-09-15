import { useState } from 'react';
import { Hero } from '@/sections/Hero';
import { TrustedCompanies } from '@/sections/TrustedCompanies';
import { TrustedFounders } from '@/sections/TrustedFounders';
import { Testimonials } from '@/sections/Testimonials';
import { MaintenancePlans } from '@/sections/MaintenancePlans';
import { Services } from '@/sections/Services';
import { Founder } from '@/sections/Founder';
import { Technologies } from '@/sections/Technologies';
import { FeatureHighlights } from '@/sections/FeatureHighlights';
import { NewOurWorks } from '@/components/newPortfolio/NewOurWorks';
import { LeaveReviewModal } from '@/components/testimonials/LeaveReviewModal';
import { testimonialReviews } from '@/data/testimonialSlider';

export function Home() {
  const [reviews, setReviews] = useState(testimonialReviews);
  const [reviewOpen, setReviewOpen] = useState(false);

  return (
    <main className="min-w-0">
      <Hero />
      <NewOurWorks />
      <TrustedCompanies />
      <TrustedFounders onLeaveReview={() => setReviewOpen(true)} />
      <Testimonials reviews={reviews} onLeaveReview={() => setReviewOpen(true)} />
      <MaintenancePlans />
      <Services />
      <Founder />
      <Technologies />
      <FeatureHighlights />
      <LeaveReviewModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onSubmit={(review) => setReviews((current) => [review, ...current])}
      />
    </main>
  );
}
