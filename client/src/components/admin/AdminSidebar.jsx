import { NavLink, useNavigate } from 'react-router-dom';
import { assets } from '@/config/assets';
import {
  DashboardIcon,
  FolderIcon,
  LogoutIcon,
  PlusIcon,
  SettingsIcon,
  TagIcon,
  CloseIcon,
  MenuIcon,
  SparkIcon,
  DesignIcon,
  VerifiedIcon,
  BrandIcon,
  DevelopmentIcon,
  RocketIcon,
  MailIcon,
  SearchIcon,
  EditIcon,
} from '@/lib/icons';
import { cn } from '@/lib/cn';
import { useAuth } from '@/context/AuthProvider';
import { useState } from 'react';

const navSections = [
  {
    label: 'Overview',
    items: [
      { to: '/admin/dashboard', label: 'Dashboard', icon: DashboardIcon, end: true },
    ],
  },
  {
    label: 'Website',
    items: [
      { to: '/admin/hero', label: 'Hero', icon: SparkIcon },
      { to: '/admin/services', label: 'Services', icon: DesignIcon },
      { to: '/admin/projects', label: 'Our Works', icon: FolderIcon },
      { to: '/admin/trusted-companies', label: 'Trusted Companies', icon: BrandIcon },
      { to: '/admin/testimonials', label: 'Testimonials', icon: VerifiedIcon },
      { to: '/admin/technologies', label: 'Technologies', icon: DevelopmentIcon },
      { to: '/admin/cta-process', label: 'CTA / Process', icon: RocketIcon },
      { to: '/admin/updates', label: 'Updates', icon: EditIcon },
      { to: '/admin/contact', label: 'Contact & Footer', icon: MailIcon },
    ],
  },
  {
    label: 'Management',
    items: [
      { to: '/admin/inquiries', label: 'Inquiries', icon: MailIcon },
      { to: '/admin/categories', label: 'Categories', icon: TagIcon },
      { to: '/admin/seo', label: 'SEO', icon: SearchIcon },
    ],
  },
  {
    label: 'System',
    items: [
      { to: '/admin/settings', label: 'Settings', icon: SettingsIcon },
      { to: '/admin/users', label: 'Users', icon: SettingsIcon },
      { to: '/admin/activity-logs', label: 'Activity Logs', icon: DashboardIcon },
    ],
  },
];

/**
 * @param {{ onNavigate?: () => void }} props
 */
function SidebarNav({ onNavigate }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
    onNavigate?.();
  };

  return (
    <nav className="flex flex-col gap-4">
      {navSections.map((section) => (
        <div key={section.label}>
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            {section.label}
          </p>
          <div className="flex flex-col gap-0.5">
            {section.items.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onNavigate}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] transition-colors',
                    isActive
                      ? 'bg-brand-navy text-white'
                      : 'text-muted-foreground hover:bg-surface-muted hover:text-foreground',
                  )
                }
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {item.label}
              </NavLink>
            ))}
          </div>
        </div>
      ))}

      <div className="border-t border-border-subtle pt-3">
        <NavLink
          to="/admin/projects/new"
          onClick={onNavigate}
          className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        >
          <PlusIcon className="h-4 w-4 shrink-0" />
          Add Project
        </NavLink>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          className="mb-1 flex items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-muted-foreground hover:bg-surface-muted hover:text-foreground"
        >
          View Site
        </a>
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-[13px] text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
        >
          <LogoutIcon className="h-4 w-4 shrink-0" />
          Logout
        </button>
      </div>
    </nav>
  );
}

export function AdminSidebar() {
  return (
    <aside className="hidden w-56 shrink-0 border-r border-border-subtle bg-surface lg:block">
      <div className="flex h-16 items-center border-b border-border-subtle px-5">
        <img
          src={assets.brand.lockup.src}
          alt="Moiz Web Solutions"
          className="logo-mark h-8 w-auto object-contain object-left"
        />
      </div>
      <div className="max-h-[calc(100vh-4rem)] overflow-y-auto p-4">
        <SidebarNav />
      </div>
    </aside>
  );
}

export function AdminMobileNav() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open navigation"
        className="flex h-10 w-10 items-center justify-center rounded-lg border border-border-subtle text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
      >
        <MenuIcon className="h-5 w-5" />
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-overlay"
            onClick={() => setOpen(false)}
          />
          <aside className="relative ml-0 flex h-full w-64 flex-col bg-surface shadow-elevated">
            <div className="flex h-16 items-center justify-between border-b border-border-subtle px-5">
              <img
                src={assets.brand.lockup.src}
                alt="Moiz Web Solutions"
                className="logo-mark h-8 w-auto"
              />
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close navigation"
                className="text-muted-foreground"
              >
                <CloseIcon className="h-5 w-5" />
              </button>
            </div>
            <div className="overflow-y-auto p-4">
              <SidebarNav onNavigate={() => setOpen(false)} />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
