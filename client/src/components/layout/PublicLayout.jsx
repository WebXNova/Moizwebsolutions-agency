import { Outlet } from 'react-router-dom';
import { Header } from '@/components/layout/Header';
import { SidebarLine } from '@/components/navigation/SidebarLine';
import { ClosingBand } from '@/components/closing/ClosingBand';
import { InquiryProvider } from '@/context/InquiryProvider';
import { SiteContentProvider } from '@/hooks/useSiteContent';
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
      <PageTransition>
        <ScrollProgress />
        <SidebarLine />
        <ColorGrade />
        <AmbientGlow />
        <FilmGrain />
        <CustomCursor />
        <div className="relative z-[2] min-h-screen overflow-x-clip bg-background text-foreground">
          <Header />
          <Outlet />
          <ClosingBand />
        </div>
      </PageTransition>
      </InquiryProvider>
    </SiteContentProvider>
  );
}
