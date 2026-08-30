import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  AdminPanel,
  ConfirmModal,
  FormField,
  StatusBadge,
  inputClass,
  textareaClass,
} from '@/components/admin/cms/AdminForm';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { SpinnerIcon } from '@/lib/icons';

const PLATFORMS = ['facebook', 'instagram', 'linkedin', 'twitter', 'youtube', 'github', 'tiktok'];

const emptySocial = {
  platform: 'facebook',
  href: '',
  label: '',
  icon: 'facebook',
  active: true,
  displayOrder: 0,
};

export function AdminContact() {
  const { showToast } = useToast();
  const [contact, setContact] = useState({});
  const [footer, setFooter] = useState({});
  const [socialLinks, setSocialLinks] = useState([]);
  const [socialForm, setSocialForm] = useState(emptySocial);
  const [editingSocialId, setEditingSocialId] = useState(null);
  const [navigation, setNavigation] = useState([]);
  const [editingNavId, setEditingNavId] = useState(null);
  const [navForm, setNavForm] = useState({ label: '', href: '', active: true, displayOrder: 0 });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteSocialId, setDeleteSocialId] = useState(null);

  const load = useCallback(async () => {
    const [settings, links, nav] = await Promise.all([
      cmsService.getAdminSettings(),
      cmsService.getAdminSocialLinks(),
      cmsService.getAdminNavigation(),
    ]);
    setContact(settings.contact || {});
    setFooter(settings.footer || {});
    setSocialLinks(links);
    setNavigation(nav);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch((e) => showToast(e.message, 'error'));
  }, [load, showToast]);

  const saveContact = async () => {
    setSaving(true);
    try {
      await cmsService.updateSetting('contact', contact);
      showToast('Contact settings saved.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveFooter = async () => {
    setSaving(true);
    try {
      await cmsService.updateSetting('footer', footer);
      showToast('Footer settings saved.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetSocialForm = () => {
    setSocialForm(emptySocial);
    setEditingSocialId(null);
  };

  const handleSocialSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingSocialId) {
        await cmsService.updateSocialLink(editingSocialId, socialForm);
        showToast('Social link updated.');
      } else {
        await cmsService.createSocialLink(socialForm);
        showToast('Social link created.');
      }
      resetSocialForm();
      const links = await cmsService.getAdminSocialLinks();
      setSocialLinks(links);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleSocialEdit = (link) => {
    setEditingSocialId(link.id);
    setSocialForm({
      platform: link.platform,
      href: link.href || '',
      label: link.label || '',
      icon: link.icon || link.platform,
      active: link.active,
      displayOrder: link.displayOrder,
    });
  };

  const handleSocialDelete = async () => {
    if (!deleteSocialId) return;
    setSaving(true);
    try {
      await cmsService.deleteSocialLink(deleteSocialId);
      showToast('Social link deleted.');
      setDeleteSocialId(null);
      const links = await cmsService.getAdminSocialLinks();
      setSocialLinks(links);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleNavEdit = (item) => {
    setEditingNavId(item.id);
    setNavForm({
      label: item.label,
      href: item.href,
      active: item.active,
      displayOrder: item.displayOrder,
    });
  };

  const handleNavSave = async (e) => {
    e.preventDefault();
    if (!editingNavId) return;
    setSaving(true);
    try {
      await cmsService.updateNavigationItem(editingNavId, navForm);
      showToast('Navigation item updated.');
      setEditingNavId(null);
      const nav = await cmsService.getAdminNavigation();
      setNavigation(nav);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Contact & Footer" breadcrumb="Website" />
        <div className="flex justify-center py-16">
          <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Contact & Footer" breadcrumb="Website" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel title="Contact Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Email">
              <input className={inputClass} value={contact.email || ''} onChange={(e) => setContact((p) => ({ ...p, email: e.target.value }))} />
            </FormField>
            <FormField label="Phone">
              <input className={inputClass} value={contact.phone || ''} onChange={(e) => setContact((p) => ({ ...p, phone: e.target.value }))} />
            </FormField>
            <FormField label="WhatsApp">
              <input className={inputClass} value={contact.whatsapp || ''} onChange={(e) => setContact((p) => ({ ...p, whatsapp: e.target.value }))} />
            </FormField>
            <FormField label="Contact CTA">
              <input className={inputClass} value={contact.contactCta || ''} onChange={(e) => setContact((p) => ({ ...p, contactCta: e.target.value }))} />
            </FormField>
            <FormField label="Address" className="md:col-span-2">
              <textarea className={textareaClass} value={contact.address || ''} onChange={(e) => setContact((p) => ({ ...p, address: e.target.value }))} />
            </FormField>
            <FormField label="Office location">
              <input className={inputClass} value={contact.officeLocation || ''} onChange={(e) => setContact((p) => ({ ...p, officeLocation: e.target.value }))} />
            </FormField>
            <FormField label="Business hours">
              <input className={inputClass} value={contact.businessHours || ''} onChange={(e) => setContact((p) => ({ ...p, businessHours: e.target.value }))} />
            </FormField>
            <FormField label="Maps URL">
              <input className={inputClass} value={contact.mapsUrl || ''} onChange={(e) => setContact((p) => ({ ...p, mapsUrl: e.target.value }))} />
            </FormField>
            <FormField label="Availability">
              <input className={inputClass} value={contact.availability || ''} onChange={(e) => setContact((p) => ({ ...p, availability: e.target.value }))} />
            </FormField>
          </div>
          <button type="button" onClick={saveContact} disabled={saving} className="mt-4 rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
            Save Contact
          </button>
        </AdminPanel>

        <AdminPanel title="Footer Settings">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Tagline">
              <input className={inputClass} value={footer.tagline || ''} onChange={(e) => setFooter((p) => ({ ...p, tagline: e.target.value }))} />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <textarea className={textareaClass} value={footer.description || ''} onChange={(e) => setFooter((p) => ({ ...p, description: e.target.value }))} />
            </FormField>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={footer.visible !== false} onChange={(e) => setFooter((p) => ({ ...p, visible: e.target.checked }))} />
              Visible
            </label>
          </div>
          <button type="button" onClick={saveFooter} disabled={saving} className="mt-4 rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
            Save Footer
          </button>
        </AdminPanel>

        <AdminPanel title={editingSocialId ? 'Edit Social Link' : 'Add Social Link'}>
          <form onSubmit={handleSocialSave} className="grid gap-4 md:grid-cols-2">
            <FormField label="Platform">
              <select
                className={inputClass}
                value={socialForm.platform}
                onChange={(e) => setSocialForm((p) => ({ ...p, platform: e.target.value, icon: e.target.value }))}
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Label">
              <input className={inputClass} value={socialForm.label} onChange={(e) => setSocialForm((p) => ({ ...p, label: e.target.value }))} />
            </FormField>
            <FormField label="URL">
              <input className={inputClass} value={socialForm.href} onChange={(e) => setSocialForm((p) => ({ ...p, href: e.target.value }))} placeholder="https://" />
            </FormField>
            <FormField label="Display order">
              <input type="number" className={inputClass} value={socialForm.displayOrder} onChange={(e) => setSocialForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} />
            </FormField>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={socialForm.active} onChange={(e) => setSocialForm((p) => ({ ...p, active: e.target.checked }))} />
              Active
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
                {saving ? 'Saving…' : editingSocialId ? 'Update' : 'Add Link'}
              </button>
              {editingSocialId ? (
                <button type="button" onClick={resetSocialForm} className="rounded-lg border border-border-subtle px-4 py-2 text-[12px]">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </AdminPanel>

        <AdminPanel title="Social Links">
          <div className="space-y-3">
            {socialLinks.map((link) => (
              <div key={link.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle p-3">
                <div>
                  <p className="text-[14px] font-medium">{link.label || link.platform}</p>
                  <p className="text-[12px] text-muted-foreground">{link.href}</p>
                  <StatusBadge status={link.active ? 'active' : 'inactive'} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleSocialEdit(link)} className="text-[12px] text-muted-foreground hover:text-foreground">
                    Edit
                  </button>
                  <button type="button" onClick={() => setDeleteSocialId(link.id)} className="text-[12px] text-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>

        <AdminPanel title="Navigation Items">
          <div className="space-y-3">
            {navigation.map((item) => (
              <div key={item.id} className="rounded-lg border border-border-subtle p-3">
                {editingNavId === item.id ? (
                  <form onSubmit={handleNavSave} className="grid gap-3 md:grid-cols-2">
                    <FormField label="Label">
                      <input className={inputClass} value={navForm.label} onChange={(e) => setNavForm((p) => ({ ...p, label: e.target.value }))} />
                    </FormField>
                    <FormField label="Href">
                      <input className={inputClass} value={navForm.href} onChange={(e) => setNavForm((p) => ({ ...p, href: e.target.value }))} />
                    </FormField>
                    <FormField label="Display order">
                      <input type="number" className={inputClass} value={navForm.displayOrder} onChange={(e) => setNavForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} />
                    </FormField>
                    <label className="flex items-center gap-2 text-[13px]">
                      <input type="checkbox" checked={navForm.active} onChange={(e) => setNavForm((p) => ({ ...p, active: e.target.checked }))} />
                      Active
                    </label>
                    <div className="flex gap-2 md:col-span-2">
                      <button type="submit" disabled={saving} className="rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingNavId(null)} className="rounded-lg border border-border-subtle px-4 py-2 text-[12px]">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-medium">{item.label}</p>
                      <p className="text-[12px] text-muted-foreground">{item.href}</p>
                      <StatusBadge status={item.active ? 'active' : 'inactive'} />
                      {item.isSystem ? <span className="ml-2 text-[11px] text-muted-foreground">(system)</span> : null}
                    </div>
                    <button type="button" onClick={() => handleNavEdit(item)} className="text-[12px] text-muted-foreground hover:text-foreground">
                      Edit
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <ConfirmModal open={Boolean(deleteSocialId)} title="Delete social link?" message="This cannot be undone." onConfirm={handleSocialDelete} onCancel={() => setDeleteSocialId(null)} loading={saving} />
    </>
  );
}
