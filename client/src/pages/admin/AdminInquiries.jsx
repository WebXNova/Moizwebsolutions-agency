import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminPanel, StatusBadge, inputClass, textareaClass } from '@/components/admin/cms/AdminForm';
import { useToast } from '@/context/ToastProvider';
import * as inquiryService from '@/services/inquiryService';
import { SpinnerIcon } from '@/lib/icons';

const STATUSES = ['new', 'contacted', 'qualified', 'proposal', 'won', 'lost', 'archived'];

function formatWhen(value) {
  if (!value) return '—';
  const date = new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString();
}

export function AdminInquiries() {
  const { showToast } = useToast();
  const [inquiries, setInquiries] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0 });
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await inquiryService.getInquiries({
        page: pagination.page,
        limit: pagination.limit,
        search,
        status,
      });
      setInquiries(result.inquiries);
      setPagination((prev) => ({ ...prev, total: result.pagination.total }));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [pagination.page, pagination.limit, search, status, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }
    inquiryService
      .getInquiry(selectedId)
      .then((inquiry) => {
        setDetail(inquiry);
        setNotes(inquiry.notes || '');
      })
      .catch((err) => showToast(err.message, 'error'));
  }, [selectedId, showToast]);

  const handleSearch = (event) => {
    event.preventDefault();
    setPagination((prev) => ({ ...prev, page: 1 }));
    setSearch(searchInput);
  };

  const changeStatus = async (nextStatus) => {
    if (!detail) return;
    setSaving(true);
    try {
      const inquiry = await inquiryService.updateInquiry(detail.id, { status: nextStatus, notes });
      setDetail(inquiry);
      showToast('Inquiry updated.');
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const resend = async () => {
    if (!detail) return;
    setSaving(true);
    try {
      const inquiry = await inquiryService.resendInquiry(detail.id);
      setDetail(inquiry);
      showToast('Notification resent.');
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  return (
    <>
      <AdminHeader title="Inquiries" breadcrumb="Management" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel
          title="Leads"
          actions={
            <form onSubmit={handleSearch} className="flex flex-wrap gap-2">
              <input
                className={inputClass}
                placeholder="Search name, email, id…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />
              <select
                className={inputClass}
                value={status}
                onChange={(e) => {
                  setPagination((prev) => ({ ...prev, page: 1 }));
                  setStatus(e.target.value);
                }}
              >
                <option value="">All statuses</option>
                {STATUSES.map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </select>
              <button type="submit" className="rounded-lg border border-border-subtle px-3 py-2 text-[12px]">
                Search
              </button>
            </form>
          }
        >
          {loading ? (
            <div className="flex justify-center py-12">
              <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : inquiries.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No inquiries yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-[13px]">
                <thead>
                  <tr className="border-b border-border-subtle text-[12px] text-muted-foreground">
                    <th className="pb-3 pr-4 font-medium">Received</th>
                    <th className="pb-3 pr-4 font-medium">Name</th>
                    <th className="pb-3 pr-4 font-medium">Email</th>
                    <th className="pb-3 pr-4 font-medium">Service</th>
                    <th className="pb-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {inquiries.map((inquiry) => (
                    <tr
                      key={inquiry.id}
                      className="cursor-pointer border-b border-border-subtle hover:bg-surface-muted"
                      onClick={() => setSelectedId(inquiry.id)}
                    >
                      <td className="py-3 pr-4 text-[12px] text-muted-foreground">{formatWhen(inquiry.createdAt)}</td>
                      <td className="py-3 pr-4 font-medium">{inquiry.name}</td>
                      <td className="py-3 pr-4">{inquiry.email}</td>
                      <td className="py-3 pr-4 text-muted-foreground">
                        {(inquiry.services || []).map((service) => service.title).join(', ') || '—'}
                      </td>
                      <td className="py-3">
                        <StatusBadge status={inquiry.status} />
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

        {detail ? (
          <AdminPanel title={`Inquiry ${detail.id}`}>
            <dl className="grid gap-3 text-[13px] md:grid-cols-2">
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Name</dt>
                <dd>{detail.name}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Email</dt>
                <dd>{detail.email}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Phone</dt>
                <dd>{detail.phone || '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Business</dt>
                <dd>{detail.business || '—'}</dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Budget</dt>
                <dd>
                  {[detail.budgetCurrency, detail.budgetLabel].filter(Boolean).join(' · ') || '—'}
                </dd>
              </div>
              <div>
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Timeline</dt>
                <dd>{detail.timeline || '—'}</dd>
              </div>
              <div className="md:col-span-2">
                <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">Brief</dt>
                <dd className="mt-1 whitespace-pre-wrap text-muted-foreground">{detail.description}</dd>
              </div>
            </dl>

            <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto] md:items-end">
              <label className="block text-[12px] font-medium">
                Notes
                <textarea
                  className={`${textareaClass} mt-1`}
                  rows={3}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </label>
              <div className="flex flex-wrap gap-2">
                <select
                  className={inputClass}
                  value={detail.status}
                  disabled={saving}
                  onChange={(e) => changeStatus(e.target.value)}
                >
                  {STATUSES.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => changeStatus(detail.status)}
                  className="rounded-lg border border-border-subtle px-3 py-2 text-[12px]"
                >
                  Save notes
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={resend}
                  className="rounded-lg bg-brand-navy px-3 py-2 text-[12px] font-medium text-white disabled:opacity-50"
                >
                  Resend notification
                </button>
              </div>
            </div>
          </AdminPanel>
        ) : null}
      </div>
    </>
  );
}
