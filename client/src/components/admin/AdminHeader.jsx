import { ThemeToggle } from '@/components/common/ThemeToggle';
import { AdminMobileNav } from '@/components/admin/AdminSidebar';
import { useAuth } from '@/context/AuthProvider';

/**
 * @param {{ title: string; breadcrumb?: string }} props
 */
export function AdminHeader({ title, breadcrumb }) {
  const { admin } = useAuth();

  return (
    <header className="border-b border-border-subtle bg-surface">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3">
          <AdminMobileNav />
          <div>
            {breadcrumb ? (
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
                {breadcrumb}
              </p>
            ) : null}
            <h1 className="text-[18px] font-medium text-foreground">{title}</h1>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          {admin ? (
            <span className="hidden text-[12px] text-muted-foreground sm:block">{admin.email}</span>
          ) : null}
        </div>
      </div>
    </header>
  );
}
