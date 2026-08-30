import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Home } from '@/pages/Home';
import { PortfolioPage } from '@/pages/Portfolio';
import { ContactPage } from '@/pages/Contact';
import { LegalPage } from '@/pages/Legal';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminLogin } from '@/pages/admin/AdminLogin';
import { AdminDashboard } from '@/pages/admin/AdminDashboard';
import { AdminProjects } from '@/pages/admin/AdminProjects';
import { AddProject } from '@/pages/admin/AddProject';
import { EditProject } from '@/pages/admin/EditProject';
import { AdminCategories } from '@/pages/admin/AdminCategories';
import { AdminSettings } from '@/pages/admin/AdminSettings';
import { AdminHero } from '@/pages/admin/AdminHero';
import { AdminServices } from '@/pages/admin/AdminServices';
import { AdminTestimonials } from '@/pages/admin/AdminTestimonials';
import { AdminTrustedCompanies } from '@/pages/admin/AdminTrustedCompanies';
import { AdminTechnologies } from '@/pages/admin/AdminTechnologies';
import { AdminCtaProcess } from '@/pages/admin/AdminCtaProcess';
import { AdminUpdates } from '@/pages/admin/AdminUpdates';
import { AdminContact } from '@/pages/admin/AdminContact';
import { AdminSeo } from '@/pages/admin/AdminSeo';
import { AdminMedia } from '@/pages/admin/AdminMedia';
import { AdminActivityLogs } from '@/pages/admin/AdminActivityLogs';
import { AdminUsers } from '@/pages/admin/AdminUsers';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/privacy" element={<LegalPage slug="privacy" />} />
          <Route path="/terms" element={<LegalPage slug="terms" />} />
          <Route path="/refund" element={<LegalPage slug="refund" />} />
        </Route>

        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="projects" element={<AdminProjects />} />
          <Route path="projects/new" element={<AddProject />} />
          <Route path="projects/:id/edit" element={<EditProject />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="settings" element={<AdminSettings />} />
          <Route path="hero" element={<AdminHero />} />
          <Route path="services" element={<AdminServices />} />
          <Route path="testimonials" element={<AdminTestimonials />} />
          <Route path="trusted-companies" element={<AdminTrustedCompanies />} />
          <Route path="technologies" element={<AdminTechnologies />} />
          <Route path="cta-process" element={<AdminCtaProcess />} />
          <Route path="updates" element={<AdminUpdates />} />
          <Route path="contact" element={<AdminContact />} />
          <Route path="seo" element={<AdminSeo />} />
          <Route path="media" element={<AdminMedia />} />
          <Route path="activity-logs" element={<AdminActivityLogs />} />
          <Route path="users" element={<AdminUsers />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
