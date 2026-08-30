import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  AdminPanel,
  ConfirmModal,
  FormField,
  StatusBadge,
  inputClass,
} from '@/components/admin/cms/AdminForm';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { SpinnerIcon } from '@/lib/icons';

const empty = {
  name: '',
  slug: '',
  category: '',
  logoUrl: '',
  color: '',
  invertOnDark: false,
  active: true,
  featured: false,
  displayOrder: 0,
};

export function AdminTechnologies() {
  const { showToast } = useToast();
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const data = await cmsService.getAdminTechnologies();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch((e) => showToast(e.message, 'error'));
  }, [load, showToast]);

  const filtered = useMemo(
    () => items.filter((t) => t.name.toLowerCase().includes(search.toLowerCase()) || t.category?.toLowerCase().includes(search.toLowerCase())),
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
        await cmsService.updateTechnology(editingId, form);
        showToast('Technology updated.');
      } else {
        await cmsService.createTechnology(form);
        showToast('Technology created.');
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
      name: item.name,
      slug: item.slug || '',
      category: item.category || '',
      logoUrl: item.logoUrl || '',
      color: item.color || '',
      invertOnDark: item.invertOnDark,
      active: item.active,
      featured: item.featured,
      displayOrder: item.displayOrder,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await cmsService.deleteTechnology(deleteId);
      showToast('Technology deleted.');
      setDeleteId(null);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Technologies" breadcrumb="Website" />
        <div className="flex justify-center py-16">
          <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Technologies" breadcrumb="Website" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel title={editingId ? 'Edit Technology' : 'Add Technology'}>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <FormField label="Name" required>
              <input className={inputClass} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </FormField>
            <FormField label="Slug">
              <input className={inputClass} value={form.slug} onChange={(e) => setForm((p) => ({ ...p, slug: e.target.value }))} placeholder="auto-generated if empty" />
            </FormField>
            <FormField label="Category">
              <input className={inputClass} value={form.category} onChange={(e) => setForm((p) => ({ ...p, category: e.target.value }))} />
            </FormField>
            <FormField label="Logo URL">
              <input className={inputClass} value={form.logoUrl} onChange={(e) => setForm((p) => ({ ...p, logoUrl: e.target.value }))} placeholder="/assets/tech/react.svg" />
            </FormField>
            <FormField label="Color">
              <input className={inputClass} value={form.color} onChange={(e) => setForm((p) => ({ ...p, color: e.target.value }))} placeholder="#61DAFB" />
            </FormField>
            <FormField label="Display order">
              <input type="number" className={inputClass} value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} />
            </FormField>
            <div className="flex flex-wrap gap-4 text-[13px] md:col-span-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.invertOnDark} onChange={(e) => setForm((p) => ({ ...p, invertOnDark: e.target.checked }))} />
                Invert on dark
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
                Active
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} />
                Featured
              </label>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add Technology'}
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
          title="All Technologies"
          actions={<input className={inputClass} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />}
        >
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle p-3">
                <div className="flex items-center gap-3">
                  {item.logoUrl ? (
                    <img src={item.logoUrl} alt={item.name} className="h-8 w-8 object-contain" style={item.color ? { color: item.color } : undefined} />
                  ) : null}
                  <div>
                    <p className="text-[14px] font-medium">{item.name}</p>
                    <p className="text-[12px] text-muted-foreground">{item.category}</p>
                    <div className="mt-1 flex gap-2">
                      <StatusBadge status={item.active ? 'active' : 'inactive'} />
                      {item.featured ? <StatusBadge status="featured" /> : null}
                    </div>
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

      <ConfirmModal open={Boolean(deleteId)} title="Delete technology?" message="This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </>
  );
}
