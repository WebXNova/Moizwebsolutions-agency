import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  AdminPanel,
  ConfirmModal,
  FormField,
  StatusBadge,
  inputClass,
  textareaClass,
} from '@/components/admin/cms/AdminForm';
import { ServiceCard } from '@/components/services/ServiceCard';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { SpinnerIcon } from '@/lib/icons';

const ICONS = ['design', 'development', 'marketing', 'graphic'];
const empty = {
  title: '', label: '', description: '', icon: 'design', categoryLabel: '',
  details: [], ctaText: '', ctaUrl: '', active: true, featured: false, displayOrder: 0,
};

export function AdminServices() {
  const { showToast } = useToast();
  const [services, setServices] = useState([]);
  const [sectionContent, setSectionContent] = useState({ title: '', subtitle: '' });
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [search, setSearch] = useState('');

  const load = useCallback(async () => {
    const [items, settings] = await Promise.all([
      cmsService.getAdminServices(),
      cmsService.getAdminSettings(),
    ]);
    setServices(items);
    setSectionContent(settings.servicesContent || { title: '', subtitle: '' });
    setLoading(false);
  }, []);

  useEffect(() => { load().catch((e) => showToast(e.message, 'error')); }, [load, showToast]);

  const filtered = useMemo(
    () => services.filter((s) => s.title.toLowerCase().includes(search.toLowerCase())),
    [services, search],
  );

  const resetForm = () => { setForm(empty); setEditingId(null); };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...form,
        details: typeof form.details === 'string'
          ? form.details.split('\n').map((d) => d.trim()).filter(Boolean)
          : form.details,
      };
      if (editingId) {
        await cmsService.updateService(editingId, payload);
        showToast('Service updated.');
      } else {
        await cmsService.createService(payload);
        showToast('Service created.');
      }
      resetForm();
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (service) => {
    setEditingId(service.id);
    setForm({
      title: service.title,
      label: service.label,
      description: service.description,
      icon: service.icon,
      categoryLabel: service.categoryLabel,
      details: service.details,
      ctaText: service.ctaText,
      ctaUrl: service.ctaUrl,
      active: service.active,
      featured: service.featured,
      displayOrder: service.displayOrder,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setSaving(true);
    try {
      await cmsService.deleteService(deleteId);
      showToast('Service deleted.');
      setDeleteId(null);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveSectionContent = async () => {
    try {
      await cmsService.updateSetting('servicesContent', sectionContent);
      showToast('Section heading saved.');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Services" breadcrumb="Website" />
        <div className="flex justify-center py-16"><SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Services" breadcrumb="Website" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel title="Section Heading">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Title (use line breaks)">
              <textarea className={textareaClass} value={sectionContent.title} onChange={(e) => setSectionContent((p) => ({ ...p, title: e.target.value }))} />
            </FormField>
            <FormField label="Subtitle">
              <textarea className={textareaClass} value={sectionContent.subtitle} onChange={(e) => setSectionContent((p) => ({ ...p, subtitle: e.target.value }))} />
            </FormField>
          </div>
          <button type="button" onClick={saveSectionContent} className="mt-4 rounded-lg border border-border-subtle px-4 py-2 text-[12px]">Save Heading</button>
        </AdminPanel>

        <AdminPanel title={editingId ? 'Edit Service' : 'Add Service'}>
          <form onSubmit={handleSave} className="grid gap-4 md:grid-cols-2">
            <FormField label="Title" required><input className={inputClass} value={form.title} onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))} required /></FormField>
            <FormField label="Label"><input className={inputClass} value={form.label} onChange={(e) => setForm((p) => ({ ...p, label: e.target.value }))} /></FormField>
            <FormField label="Category label"><input className={inputClass} value={form.categoryLabel} onChange={(e) => setForm((p) => ({ ...p, categoryLabel: e.target.value }))} /></FormField>
            <FormField label="Icon">
              <select className={inputClass} value={form.icon} onChange={(e) => setForm((p) => ({ ...p, icon: e.target.value }))}>
                {ICONS.map((icon) => <option key={icon} value={icon}>{icon}</option>)}
              </select>
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <textarea className={textareaClass} value={form.description} onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))} />
            </FormField>
            <FormField label="Details (one per line)" className="md:col-span-2">
              <textarea className={textareaClass} value={Array.isArray(form.details) ? form.details.join('\n') : form.details} onChange={(e) => setForm((p) => ({ ...p, details: e.target.value }))} />
            </FormField>
            <FormField label="Display order"><input type="number" className={inputClass} value={form.displayOrder} onChange={(e) => setForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} /></FormField>
            <div className="flex flex-wrap gap-4 text-[13px]">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.active} onChange={(e) => setForm((p) => ({ ...p, active: e.target.checked }))} /> Active</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.featured} onChange={(e) => setForm((p) => ({ ...p, featured: e.target.checked }))} /> Featured</label>
            </div>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">{saving ? 'Saving…' : editingId ? 'Update' : 'Add Service'}</button>
              {editingId ? <button type="button" onClick={resetForm} className="rounded-lg border border-border-subtle px-4 py-2 text-[12px]">Cancel</button> : null}
            </div>
          </form>
        </AdminPanel>

        <AdminPanel title="All Services" actions={<input className={inputClass} placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)} />}>
          <div className="space-y-3">
            {filtered.map((service) => (
              <div key={service.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle p-3">
                <div>
                  <p className="text-[14px] font-medium">{service.title}</p>
                  <div className="mt-1 flex gap-2">
                    <StatusBadge status={service.active ? 'active' : 'inactive'} />
                    {service.featured ? <StatusBadge status="featured" /> : null}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleEdit(service)} className="text-[12px] text-muted-foreground hover:text-foreground">Edit</button>
                  <button type="button" onClick={() => setDeleteId(service.id)} className="text-[12px] text-danger">Delete</button>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        {form.title ? (
          <AdminPanel title="Preview">
            <div className="max-w-md">
              <ServiceCard service={{ id: 'preview', icon: form.icon, title: form.title, label: form.label, description: form.description, details: Array.isArray(form.details) ? form.details : String(form.details || '').split('\n').filter(Boolean) }} revealed active />
            </div>
          </AdminPanel>
        ) : null}
      </div>

      <ConfirmModal open={Boolean(deleteId)} title="Delete service?" message="This cannot be undone." onConfirm={handleDelete} onCancel={() => setDeleteId(null)} loading={saving} />
    </>
  );
}
