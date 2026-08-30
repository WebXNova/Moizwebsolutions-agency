import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminPanel, FormField, inputClass, textareaClass } from '@/components/admin/cms/AdminForm';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { SpinnerIcon } from '@/lib/icons';

export function AdminSeo() {
  const { showToast } = useToast();
  const [site, setSite] = useState({});
  const [seo, setSeo] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    cmsService
      .getAdminSettings()
      .then((settings) => {
        setSite(settings.site || {});
        setSeo(settings.seo || {});
      })
      .catch((e) => showToast(e.message, 'error'))
      .finally(() => setLoading(false));
  }, [showToast]);

  const saveSite = async () => {
    setSaving(true);
    try {
      await cmsService.updateSetting('site', site);
      showToast('Site settings saved.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveSeo = async () => {
    setSaving(true);
    try {
      await cmsService.updateSetting('seo', seo);
      showToast('SEO settings saved.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="SEO & Site" breadcrumb="Website" />
        <div className="flex justify-center py-16">
          <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="SEO & Site" breadcrumb="Website" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel title="Site Settings" description="General site identity and metadata.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Site name">
              <input className={inputClass} value={site.name || ''} onChange={(e) => setSite((p) => ({ ...p, name: e.target.value }))} />
            </FormField>
            <FormField label="Short name">
              <input className={inputClass} value={site.shortName || ''} onChange={(e) => setSite((p) => ({ ...p, shortName: e.target.value }))} />
            </FormField>
            <FormField label="Tagline">
              <input className={inputClass} value={site.tagline || ''} onChange={(e) => setSite((p) => ({ ...p, tagline: e.target.value }))} />
            </FormField>
            <FormField label="Site URL">
              <input className={inputClass} value={site.url || ''} onChange={(e) => setSite((p) => ({ ...p, url: e.target.value }))} placeholder="https://" />
            </FormField>
            <FormField label="Locale">
              <input className={inputClass} value={site.locale || ''} onChange={(e) => setSite((p) => ({ ...p, locale: e.target.value }))} />
            </FormField>
            <FormField label="Timezone">
              <input className={inputClass} value={site.timezone || ''} onChange={(e) => setSite((p) => ({ ...p, timezone: e.target.value }))} />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <textarea className={textareaClass} value={site.description || ''} onChange={(e) => setSite((p) => ({ ...p, description: e.target.value }))} />
            </FormField>
            <FormField label="Copyright" className="md:col-span-2">
              <input className={inputClass} value={site.copyright || ''} onChange={(e) => setSite((p) => ({ ...p, copyright: e.target.value }))} />
            </FormField>
          </div>
          <button type="button" onClick={saveSite} disabled={saving} className="mt-4 rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
            Save Site Settings
          </button>
        </AdminPanel>

        <AdminPanel title="SEO Settings" description="Search engine and social sharing metadata.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Homepage title">
              <input className={inputClass} value={seo.homeTitle || ''} onChange={(e) => setSeo((p) => ({ ...p, homeTitle: e.target.value }))} />
            </FormField>
            <FormField label="Canonical URL">
              <input className={inputClass} value={seo.canonicalUrl || ''} onChange={(e) => setSeo((p) => ({ ...p, canonicalUrl: e.target.value }))} />
            </FormField>
            <FormField label="Homepage description" className="md:col-span-2">
              <textarea className={textareaClass} value={seo.homeDescription || ''} onChange={(e) => setSeo((p) => ({ ...p, homeDescription: e.target.value }))} />
            </FormField>
            <FormField label="Default keywords" className="md:col-span-2">
              <input className={inputClass} value={seo.defaultKeywords || ''} onChange={(e) => setSeo((p) => ({ ...p, defaultKeywords: e.target.value }))} />
            </FormField>
            <FormField label="OG title">
              <input className={inputClass} value={seo.ogTitle || ''} onChange={(e) => setSeo((p) => ({ ...p, ogTitle: e.target.value }))} />
            </FormField>
            <FormField label="OG image URL">
              <input className={inputClass} value={seo.ogImage || ''} onChange={(e) => setSeo((p) => ({ ...p, ogImage: e.target.value }))} />
            </FormField>
            <FormField label="OG description" className="md:col-span-2">
              <textarea className={textareaClass} value={seo.ogDescription || ''} onChange={(e) => setSeo((p) => ({ ...p, ogDescription: e.target.value }))} />
            </FormField>
            <FormField label="Twitter card">
              <select className={inputClass} value={seo.twitterCard || 'summary_large_image'} onChange={(e) => setSeo((p) => ({ ...p, twitterCard: e.target.value }))}>
                <option value="summary">summary</option>
                <option value="summary_large_image">summary_large_image</option>
              </select>
            </FormField>
            <FormField label="Robots">
              <input className={inputClass} value={seo.robots || ''} onChange={(e) => setSeo((p) => ({ ...p, robots: e.target.value }))} placeholder="index,follow" />
            </FormField>
          </div>
          <button type="button" onClick={saveSeo} disabled={saving} className="mt-4 rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
            Save SEO Settings
          </button>
        </AdminPanel>
      </div>
    </>
  );
}
