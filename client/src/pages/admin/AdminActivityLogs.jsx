import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminPanel, StatusBadge } from '@/components/admin/cms/AdminForm';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { SpinnerIcon } from '@/lib/icons';

export function AdminActivityLogs() {
  const { showToast } = useToast();
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 50, total: 0 });
  const [action, setAction] = useState('');
  const [resourceType, setResourceType] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cmsService.getActivityLogs({
        page: pagination.page,
        limit: pagination.limit,
        action,
        resourceType,
      });
      setLogs(result.logs);
      setPagination((p) => ({ ...p, total: result.pagination.total }));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, action, resourceType, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  return (
    <>
      <AdminHeader title="Activity Logs" breadcrumb="Admin" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel
          title="Recent Activity"
          actions={
            <div className="flex flex-wrap gap-2">
              <input
                className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-[12px]"
                placeholder="Action"
                value={action}
                onChange={(e) => {
                  setPagination((p) => ({ ...p, page: 1 }));
                  setAction(e.target.value);
                }}
              />
              <input
                className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-[12px]"
                placeholder="Resource type"
                value={resourceType}
                onChange={(e) => {
                  setPagination((p) => ({ ...p, page: 1 }));
                  setResourceType(e.target.value);
                }}
              />
            </div>
          }
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No activity logs yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border-subtle text-[12px] text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Time</th>
                    <th className="pb-3 pr-4 font-medium">Admin</th>
                    <th className="pb-3 pr-4 font-medium">Action</th>
                    <th className="pb-3 pr-4 font-medium">Resource</th>
                    <th className="pb-3 pr-4 font-medium">Details</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b border-border-subtle">
                      <td className="py-3 pr-4 text-[12px] text-muted-foreground">{log.createdAt}</td>
                      <td className="py-3 pr-4">{log.adminEmail || '—'}</td>
                      <td className="py-3 pr-4">{log.action.replace(/_/g, ' ')}</td>
                      <td className="py-3 pr-4">
                        <span className="text-muted-foreground">{log.resourceType}</span>
                        {log.resourceId ? <span className="ml-1 text-[11px] text-muted-foreground">({log.resourceId.slice(0, 8)}…)</span> : null}
                      </td>
                      <td className="py-3 pr-4 text-[12px] text-muted-foreground">{log.details || '—'}</td>
                      <td className="py-3">
                        <StatusBadge status={log.success ? 'active' : 'inactive'} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination.total > pagination.limit ? (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-[12px] text-muted-foreground">
                Page {pagination.page} of {totalPages} ({pagination.total} total)
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={pagination.page <= 1}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page - 1 }))}
                  className="rounded-lg border border-border-subtle px-3 py-1.5 text-[12px] disabled:opacity-50"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={pagination.page >= totalPages}
                  onClick={() => setPagination((p) => ({ ...p, page: p.page + 1 }))}
                  className="rounded-lg border border-border-subtle px-3 py-1.5 text-[12px] disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          ) : null}
        </AdminPanel>
      </div>
    </>
  );
}
