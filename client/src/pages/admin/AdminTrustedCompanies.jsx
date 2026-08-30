import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  AdminPanel,
  ConfirmModal,
  FormField,
  ImageUploadField,
  StatusBadge,
  inputClass,
} from '@/components/admin/cms/AdminForm';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { uploadProjectImage } from '@/services/projectService';
import { SpinnerIcon } from '@/lib/icons';

const empty = {
  name: '',
  logoUrl: '',
  websiteUrl: '',
  logoAlt: '',
  active: true,
  displayOrder: 0,
};

export function AdminTrustedCompanies() {
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
    const data = await cmsService.getAdminCompanies();
    setItems(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch((e) => showToast(e.message, 'error'));
  }, [load, showToast]);

  const filtered = useMemo(
    () => items.filter((c) => c.name.toLowerCase().includes(search.toLowerCase())),
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
        await cmsService.updateCompany(editingId, form);
        showToast('Company updated.');
      } else {
        await cmsService.createCompany(form);
        showToast('Company created.');
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
      logoUrl: item.logoUrl || '',
      websiteUrl: item.websiteUrl || '',
      logoAlt: item.logoAlt || '',
      active: item.active,
      displayOrder: item.displayOrder,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await cmsService.deleteCompany(deleteId);
      showToast('Company deleted.');
      setDeleteId(null);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLogo = async (file) => {
    setUploading(true);
    try {
      const url = await uploadProjectImage(file);
      setForm((p) => ({ ...p, logoUrl: url }));
      showToast('Logo uploaded.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Trusted Companies" breadcrumb="Website" />
        <div className="flex justify-center py-16">
          <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Trusted Companies" breadcrumb="Website" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel title={editingId ? 'Edit Company' : 'Add Company'}>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <FormField label="Name" required>
              <input className={inputClass} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} required />
            </FormField>
            <FormField label="Website URL">
              <input className={inputClass} value={form.websiteUrl} onChange={(e) => setForm((p) => ({ ...p, websiteUrl: e.target.value }))} placeholder="https://" />
            </FormField>
            <FormField label="Logo alt text">
              <input className={inputClass} value={form.logoAlt} onChange={(e) => setForm((p) => ({ ...p, logoAlt: e.target.value }))} />
            </FormField>
            <FormField label="Display order">
              <input type="number" className={inputClass} value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} />
            </FormField>
            <FormField label="Logo" className="md:col-span-2">
              <ImageUploadField onSelect={handleLogo} uploading={uploading} previewUrl={form.logoUrl} label="Upload logo" />
            </FormField>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} />
              Active
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
                {saving ? 'Saving…' : editingId ? 'Update' : 'Add Company'}
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
          title="All Companies"
          actions={<input className={inputClass} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />}
        >
          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle p-3">
                <div className="flex items-center gap-3">
                  {item.logoUrl ? (
                    <img src={item.logoUrl} alt={item.logoAlt || item.name} className="h-8 w-auto max-w-[80px] object-contain" />
                  ) : null}
                  <div>
                    <p className="text-[14px] font-medium">{item.name}</p>
                    <StatusBadge status={item.active ? 'active' : 'inactive'} />
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

      <ConfirmModal open={Boolean(deleteId)} title="Delete company?" message="This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </>
  );
}
