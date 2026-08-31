import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  AdminPanel,
  ConfirmModal,
  FormField,
  ImageUploadField,
  inputClass,
} from '@/components/admin/cms/AdminForm';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { SpinnerIcon } from '@/lib/icons';
import { apiUrl } from '@/config/api';

export function AdminMedia() {
  const { showToast } = useToast();
  const [media, setMedia] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: 24, total: 0 });
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [altText, setAltText] = useState('');
  const [editingAltId, setEditingAltId] = useState(null);
  const [editingAlt, setEditingAlt] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const result = await cmsService.getMedia({ search, page: pagination.page, limit: pagination.limit });
      setMedia(result.media);
      setPagination((p) => ({ ...p, total: result.pagination.total }));
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, pagination.page, pagination.limit, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, page: 1 }));
    setSearch(searchInput);
  };

  const handleUpload = async (file) => {
    setUploading(true);
    try {
      await cmsService.uploadMedia(file, altText);
      showToast('Media uploaded.');
      setAltText('');
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await cmsService.deleteMedia(deleteId);
      showToast('Media deleted.');
      setDeleteId(null);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveAlt = async (id) => {
    setSaving(true);
    try {
      await cmsService.updateMedia(id, { altText: editingAlt });
      showToast('Alt text saved.');
      setEditingAltId(null);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const copyUrl = async (url) => {
    try {
      await navigator.clipboard.writeText(url);
      showToast('URL copied to clipboard.');
    } catch {
      showToast('Failed to copy URL.', 'error');
    }
  };

  const totalPages = Math.max(1, Math.ceil(pagination.total / pagination.limit));

  return (
    <>
      <AdminHeader title="Media Library" breadcrumb="Website" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel title="Upload Media">
          <div className="space-y-4">
            <FormField label="Alt text (optional)">
              <input className={inputClass} value={altText} onChange={(e) => setAltText(e.target.value)} />
            </FormField>
            <ImageUploadField onSelect={handleUpload} uploading={uploading} label="Choose file to upload" />
          </div>
        </AdminPanel>

        <AdminPanel
          title="Media Files"
          actions={
            <form onSubmit={handleSearch} className="flex gap-2">
              <input className={inputClass} placeholder="Search…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
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
          ) : media.length === 0 ? (
            <p className="text-[13px] text-muted-foreground">No media files found.</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {media.map((item) => (
                <div key={item.id} className="rounded-lg border border-border-subtle bg-surface p-3">
                  <img src={item.url.startsWith('/uploads/') ? apiUrl(item.url) : item.url} alt={item.altText || item.filename} className="mb-3 h-32 w-full rounded object-cover" />
                  <p className="truncate text-[13px] font-medium">{item.filename}</p>
                  {item.fileMissing ? (
                    <p className="text-[11px] text-danger">File missing on disk</p>
                  ) : null}
                  <p className="text-[11px] text-muted-foreground">
                    {(item.sizeBytes / 1024).toFixed(1)} KB · {item.mimeType}
                  </p>
                  {editingAltId === item.id ? (
                    <div className="mt-2 flex gap-2">
                      <input className={inputClass} value={editingAlt} onChange={(e) => setEditingAlt(e.target.value)} />
                      <button type="button" onClick={() => saveAlt(item.id)} className="rounded-lg border border-border-subtle px-2 py-1 text-[11px]">
                        Save
                      </button>
                    </div>
                  ) : (
                    <p className="mt-1 truncate text-[11px] text-muted-foreground">{item.altText || 'No alt text'}</p>
                  )}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button type="button" onClick={() => copyUrl(item.url)} className="rounded-lg border border-border-subtle px-2 py-1 text-[11px]">
                      Copy URL
                    </button>
                    <button type="button" onClick={() => { setEditingAltId(item.id); setEditingAlt(item.altText || ''); }} className="rounded-lg border border-border-subtle px-2 py-1 text-[11px]">
                      Alt
                    </button>
                    <button type="button" onClick={() => setDeleteId(item.id)} className="text-[11px] text-danger">
                      Delete
                    </button>
                  </div>
                </div>
              ))}
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

      <ConfirmModal open={Boolean(deleteId)} title="Delete media?" message="This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </>
  );
}
