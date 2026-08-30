import { AdminHeader } from '@/components/admin/AdminHeader';
import { useAuth } from '@/context/AuthProvider';

export function AdminSettings() {
  const { admin } = useAuth();

  return (
    <>
      <AdminHeader title="Settings" breadcrumb="Admin" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="rounded-xl border border-border-subtle bg-surface p-6">
          <h2 className="text-[14px] font-medium text-foreground">Account</h2>
          <p className="mt-2 text-[13px] text-muted-foreground">
            Signed in as <strong className="text-foreground">{admin?.email}</strong>
          </p>
          <p className="mt-4 text-[12px] text-muted-foreground">
            Admin credentials are configured via server environment variables. Contact your
            administrator to update login details.
          </p>
        </div>
      </div>
    </>
  );
}
