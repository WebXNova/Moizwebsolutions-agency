import { useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminPanel, FormField, ImageUploadField, inputClass, textareaClass } from '@/components/admin/cms/AdminForm';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { uploadProjectImage } from '@/services/projectService';
import { SpinnerIcon } from '@/lib/icons';
import { assets } from '@/config/assets';

export function AdminHero() {
  const { showToast } = useToast();
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    cmsService.getHero().then(setHero).finally(() => setLoading(false));
  }, []);

  const update = (field, value) => setHero((prev) => ({ ...prev, [field]: value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await cmsService.updateHero(hero);
      showToast('Hero settings saved.');
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
      update('imageUrl', url);
      showToast('Hero image uploaded.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="Hero" breadcrumb="Website" />
        <div className="flex justify-center py-16">
          <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  const previewImage = hero?.imageUrl || assets.heroVisual?.src;

  return (
    <>
      <AdminHeader title="Hero Settings" breadcrumb="Website" />
      <form onSubmit={handleSave} className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel title="Hero Content" description="Control the main homepage hero section.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Title lines (one per line)" required>
              <textarea
                className={textareaClass}
                value={(hero?.titleLines || []).join('\n')}
                onChange={(e) => update('titleLines', e.target.value.split('\n').filter(Boolean))}
              />
            </FormField>
            <FormField label="Description">
              <textarea
                className={textareaClass}
                value={hero?.paragraph || ''}
                onChange={(e) => update('paragraph', e.target.value)}
              />
            </FormField>
            <FormField label="Primary CTA text">
              <input
                className={inputClass}
                value={hero?.cta?.label || ''}
                onChange={(e) => update('cta', { ...hero?.cta, label: e.target.value })}
              />
            </FormField>
            <FormField label="Primary CTA URL">
              <input
                className={inputClass}
                value={hero?.cta?.url || ''}
                onChange={(e) => update('cta', { ...hero?.cta, url: e.target.value })}
                placeholder="Leave blank to open the inquiry form"
              />
            </FormField>
            <FormField label="Secondary CTA text">
              <input
                className={inputClass}
                value={hero?.secondaryCta?.label || ''}
                onChange={(e) => update('secondaryCta', { ...hero?.secondaryCta, label: e.target.value })}
                placeholder="Shown only when set"
              />
            </FormField>
            <FormField label="Secondary CTA URL">
              <input
                className={inputClass}
                value={hero?.secondaryCta?.url || ''}
                onChange={(e) => update('secondaryCta', { ...hero?.secondaryCta, url: e.target.value })}
              />
            </FormField>
            <FormField label="Badge / label">
              <input className={inputClass} value={hero?.badge || ''} onChange={(e) => update('badge', e.target.value)} />
            </FormField>
            <FormField label="Availability text">
              <input
                className={inputClass}
                value={hero?.availability || ''}
                onChange={(e) => update('availability', e.target.value)}
              />
            </FormField>
            <FormField label="Stat value">
              <input
                className={inputClass}
                value={hero?.stat?.value || ''}
                onChange={(e) => update('stat', { ...hero?.stat, value: e.target.value })}
              />
            </FormField>
            <FormField label="Stat label">
              <input
                className={inputClass}
                value={hero?.stat?.label || ''}
                onChange={(e) => update('stat', { ...hero?.stat, label: e.target.value })}
              />
            </FormField>
            <FormField label="Image alt text">
              <input
                className={inputClass}
                value={hero?.imageAlt || ''}
                onChange={(e) => update('imageAlt', e.target.value)}
              />
            </FormField>
            <FormField label="Image position">
              <select
                className={inputClass}
                value={hero?.imagePosition || 'center'}
                onChange={(e) => update('imagePosition', e.target.value)}
              >
                <option value="center">Center</option>
                <option value="top">Top</option>
                <option value="bottom">Bottom</option>
              </select>
            </FormField>
            <label className="flex items-center gap-2 text-[13px]">
              <input
                type="checkbox"
                checked={hero?.visible !== false}
                onChange={(e) => update('visible', e.target.checked)}
              />
              Visible on homepage
            </label>
          </div>
        </AdminPanel>

        <AdminPanel title="Hero Image">
          <ImageUploadField onSelect={handleImage} uploading={uploading} previewUrl={previewImage} />
        </AdminPanel>

        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-brand-navy px-6 py-2.5 text-[12px] font-semibold uppercase tracking-wide text-white disabled:opacity-50"
        >
          {saving ? 'Saving…' : 'Save Hero'}
        </button>
      </form>
    </>
  );
}
