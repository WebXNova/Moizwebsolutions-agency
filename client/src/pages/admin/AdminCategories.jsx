import { AdminHeader } from '@/components/admin/AdminHeader';
import { CategoryManager } from '@/components/admin/CategoryManager';

export function AdminCategories() {
  return (
    <>
      <AdminHeader title="Categories" breadcrumb="Admin" />
      <div className="p-4 sm:p-6 lg:p-8">
        <CategoryManager />
      </div>
    </>
  );
}
