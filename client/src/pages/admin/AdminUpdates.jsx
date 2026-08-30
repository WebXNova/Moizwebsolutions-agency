import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  AdminPanel,
  ConfirmModal,
  FormField,
  ImageUploadField,
  StatusBadge,
  inputClass,
  textareaClass,
} from '@/components/admin/cms/AdminForm';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { uploadProjectImage } from '@/services/projectService';
import { SpinnerIcon } from '@/lib/icons';

const empty = {
  title: '',
  shortDescription: '',
  fullDescription: '',
  imageUrl: '',
  category: 'announcement',
  ctaText: '',
  ctaUrl: '',
  published: false,
  featured: false,
  startDate: '',
  endDate: '',
  displayOrder: 0,
};

export function AdminUpdates() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const data = await cmsService.getAdminUpdates();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch((e) => showToast(e.message, 'error'));
  }, [load, showToast]);

  const filtered = useMemo(
    () => items.filter((u) => u.title.toLowerCase().includes(search.toLowerCase())),
    [items, search],
  );

  const resetForm = () => {
    setForm(empty);
    setEditingId(null);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        startDate: form.startDate || null,
        endDate: form.endDate || null,
      };
      if (editingId) {
        await cmsService.updateWebsiteUpdate(editingId, payload);
        showToast('Update saved.');
      } else {
        await cmsService.createUpdate(payload);
        showToast('Update created.');
      }
      resetForm();
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (item) => {
    setEditingId(item.id);
    setForm({
      title: item.title,
      shortDescription: item.shortDescription || '',
      fullDescription: item.fullDescription || '',
      imageUrl: item.imageUrl || '',
      category: item.category || 'announcement',
      ctaText: item.ctaText || '',
      ctaUrl: item.ctaUrl || '',
      published: item.published,
      featured: item.featured,
      startDate: item.startDate ? item.startDate.slice(0, 10) : '',
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
      displayOrder: item.displayOrder,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await cmsService.deleteUpdate(deleteId);
      showToast('Update deleted.');
      setDeleteId(null);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleImage = async (file) => {
    setUploading(true);
    try {
      const url = await uploadProjectImage(file);
      setForm((p) => ({ ...p, imageUrl: url }));
      showToast('Image uploaded.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Website Updates" breadcrumb="Website" />
        <div className="flex justify-center py-16">
          <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Website Updates" breadcrumb="Website" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel title={editingId ? 'Edit Update' : 'Add Update'}>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <FormField label="Title" required>
              <input className={inputClass} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required />
            </FormField>
            <FormField label="Category">
              <input className={inputClass} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
            </FormField>
            <FormField label="Short description" className="md:col-span-2">
              <textarea className={textareaClass} value={form.shortDescription} onChange={(e) => setForm((p) => ({ ...p, shortDescription: e.target.value }))} />
            </FormField>
            <FormField label="Full description" className="md:col-span-2">
              <textarea className={textareaClass} value={form.fullDescription} onChange={(e) => setForm((p) => ({ ...p, fullDescription: e.target.value }))} />
            </FormField>
            <FormField label="CTA text">
              <input className={inputClass} value={form.ctaText} onChange={(e) => setForm((p) => ({ ...p, ctaText: e.target.value }))} />
            </FormField>
            <FormField label="CTA URL">
              <input className={inputClass} value={form.ctaUrl} onChange={(e) => setForm((p) => ({ ...p, ctaUrl: e.target.value }))} placeholder="https://" />
            </FormField>
            <FormField label="Start date">
              <input type="date" className={inputClass} value={form.startDate} onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))} />
            </FormField>
            <FormField label="End date">
              <input type="date" className={inputClass} value={form.endDate} onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))} />
            </FormField>
            <FormField label="Display order">
              <input type="number" className={inputClass} value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} />
            </FormField>
            <FormField label="Image" className="md:col-span-2">
              <ImageUploadField onSelect={handleImage} uploading={uploading} previewUrl={form.imageUrl} />
            </FormField>
            <div className="flex flex-wrap gap-4 text-[13px] md:col-span-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))} />
                Published
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
                Featured
              </label>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add Update'}
              </button>
              {editingId ? (
                <button type="button" onClick={resetForm} className="rounded-lg border border-border-subtle px-4 py-2 text-[12px]">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </AdminPanel>

        <AdminPanel
          title="All Updates"
          actions={<input className={inputClass} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />}
        >
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle p-3">
                <div>
                  <p className="text-[14px] font-medium">{item.title}</p>
                  <p className="text-[12px] text-muted-foreground">{item.category}</p>
                  <div className="mt-1 flex gap-2">
                    <StatusBadge status={item.status} />
                    {item.featured ? <StatusBadge status="featured" /> : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEdit(item)} className="text-[12px] text-muted-foreground hover:text-foreground">
                    Edit
                  </button>
                  <button type="button" onClick={() => setDeleteId(item.id)} className="text-[12px] text-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <ConfirmModal open={Boolean(deleteId)} title="Delete update?" message="This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </>
  );
}
