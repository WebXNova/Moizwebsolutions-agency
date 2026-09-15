import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { SidebarLine } from '@/components/navigation/SidebarLine';
import { ClosingBand } from '@/components/closing/ClosingBand';
import { DocumentSeo } from '@/components/layout/DocumentSeo';
import { UpdatesBanner } from '@/components/layout/UpdatesBanner';
import { InquiryProvider } from '@/context/InquiryProvider';
import { SiteContentProvider } from '@/hooks/useSiteContent';
import { usePublicLoading } from '@/hooks/usePublicLoading';
import { useAppReveal } from '@/hooks/useAppReveal';
import { PageTransition } from '@/components/motion/PageTransition';
import { ScrollProgress } from '@/components/effects/ScrollProgress';
import { FilmGrain } from '@/components/effects/FilmGrain';
import { AmbientGlow } from '@/components/effects/AmbientGlow';
import { ColorGrade } from '@/components/effects/ColorGrade';
import { CustomCursor } from '@/components/effects/CustomCursor';

/**
 * Shared chrome for public pages — header, route transition, closing navy band.
 * Overlay effects sit outside overflow-clip so fixed layers cover the viewport.
 */
export function PublicLayout() {
  return (
    <SiteContentProvider>
      <InquiryProvider>
        <PublicShell />
      </InquiryProvider>
    </SiteContentProvider>
  );
}

function PublicShell() {
  const loading = usePublicLoading();
  useAppReveal(!loading);

  return (
    <PageTransition>
      <ScrollProgress />
      <SidebarLine />
      <ColorGrade />
      <AmbientGlow />
      <FilmGrain />
      <CustomCursor />
      <div data-site-shell className="relative z-[2] min-h-screen bg-background text-foreground">
        <DocumentSeo />
        <Header />
        <UpdatesBanner />
        {/* Clip horizontal overflow here so the header can use position:sticky. */}
        <div className="overflow-x-clip">
          <Outlet />
          <ClosingBand />
        </div>
      </div>
    </PageTransition>
  );
}
