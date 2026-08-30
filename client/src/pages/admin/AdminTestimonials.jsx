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
import { TestimonialCard } from '@/components/testimonials/TestimonialCard';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { uploadProjectImage } from '@/services/projectService';
import { SpinnerIcon } from '@/lib/icons';

const empty = {
  quote: '',
  author: '',
  role: '',
  company: '',
  avatarUrl: '',
  verified: false,
  featured: false,
  published: true,
  displayOrder: 0,
};

export function AdminTestimonials() {
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
    const data = await cmsService.getAdminTestimonials();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch((e) => showToast(e.message, 'error'));
  }, [load, showToast]);

  const filtered = useMemo(
    () => items.filter((t) => t.author.toLowerCase().includes(search.toLowerCase()) || t.quote.toLowerCase().includes(search.toLowerCase())),
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
      if (editingId) {
        await cmsService.updateTestimonial(editingId, form);
        showToast('Testimonial updated.');
      } else {
        await cmsService.createTestimonial(form);
        showToast('Testimonial created.');
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
      quote: item.quote,
      author: item.author,
      role: item.role || '',
      company: item.company || '',
      avatarUrl: item.avatarUrl || '',
      verified: item.verified,
      featured: item.featured,
      published: item.published,
      displayOrder: item.displayOrder,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await cmsService.deleteTestimonial(deleteId);
      showToast('Testimonial deleted.');
      setDeleteId(null);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatar = async (file) => {
    setUploading(true);
    try {
      const url = await uploadProjectImage(file);
      setForm((p) => ({ ...p, avatarUrl: url }));
      showToast('Avatar uploaded.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Testimonials" breadcrumb="Website" />
        <div className="flex justify-center py-16">
          <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  const previewTestimonial = {
    id: 'preview',
    quote: form.quote,
    author: form.author,
    role: form.role,
    company: form.company,
    avatar: form.avatarUrl,
  };

  return (
    <>
      <AdminHeader title="Testimonials" breadcrumb="Website" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel title={editingId ? 'Edit Testimonial' : 'Add Testimonial'}>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <FormField label="Quote" required className="md:col-span-2">
              <textarea className={textareaClass} value={form.quote} onChange={(e) => setForm((p) => ({ ...p, quote: e.target.value }))} required />
            </FormField>
            <FormField label="Author" required>
              <input className={inputClass} value={form.author} onChange={(e) => setForm((p) => ({ ...p, author: e.target.value }))} required />
            </FormField>
            <FormField label="Role">
              <input className={inputClass} value={form.role} onChange={(e) => setForm((p) => ({ ...p, role: e.target.value }))} />
            </FormField>
            <FormField label="Company">
              <input className={inputClass} value={form.company} onChange={(e) => setForm((p) => ({ ...p, company: e.target.value }))} />
            </FormField>
            <FormField label="Display order">
              <input type="number" className={inputClass} value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} />
            </FormField>
            <FormField label="Avatar" className="md:col-span-2">
              <ImageUploadField onSelect={handleAvatar} uploading={uploading} previewUrl={form.avatarUrl} label="Upload avatar" />
            </FormField>
            <div className="flex flex-wrap gap-4 text-[13px] md:col-span-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.verified} onChange={(e) => setForm((p) => ({ ...p, verified: e.target.checked }))} />
                Verified
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
                Featured
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.published} onChange={(e) => setForm((p) => ({ ...p, published: e.target.checked }))} />
                Published
              </label>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add Testimonial'}
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
          title="All Testimonials"
          actions={<input className={inputClass} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />}
        >
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle p-3">
                <div>
                  <p className="text-[14px] font-medium">{item.author}</p>
                  <p className="mt-1 line-clamp-1 text-[12px] text-muted-foreground">{item.quote}</p>
                  <div className="mt-1 flex gap-2">
                    <StatusBadge status={item.published ? 'published' : 'draft'} />
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

        {form.quote && form.author ? (
          <AdminPanel title="Preview">
            <div className="max-w-md text-foreground">
              <TestimonialCard testimonial={previewTestimonial} active reduced />
            </div>
          </AdminPanel>
        ) : null}
      </div>

      <ConfirmModal open={Boolean(deleteId)} title="Delete testimonial?" message="This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </>
  );
}
