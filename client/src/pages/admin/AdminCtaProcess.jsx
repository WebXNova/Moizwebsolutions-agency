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

const PROCESS_ICONS = ['discovery', 'iterate', 'agile', 'launch'];

const emptyStep = {
  stepNumber: 1,
  title: '',
  description: '',
  icon: 'discovery',
  active: true,
  displayOrder: 0,
};

export function AdminCtaProcess() {
  const { showToast } = useToast();
  const [cta, setCta] = useState({});
  const [heroCta, setHeroCta] = useState({});
  const [sectionLabels, setSectionLabels] = useState({});
  const [steps, setSteps] = useState([]);
  const [stepForm, setStepForm] = useState(emptyStep);
  const [editingStepId, setEditingStepId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteStepId, setDeleteStepId] = useState(null);

  const load = useCallback(async () => {
    const [settings, processSteps] = await Promise.all([
      cmsService.getAdminSettings(),
      cmsService.getAdminProcessSteps(),
    ]);
    setCta(settings.cta || {});
    setHeroCta(settings.heroCta || {});
    setSectionLabels(settings.sectionLabels || {});
    setSteps(processSteps);
    setLoading(false);
  }, []);

  useEffect(() => {
    load().catch((e) => showToast(e.message, 'error'));
  }, [load, showToast]);

  const saveCta = async () => {
    setSaving(true);
    try {
      await cmsService.updateSetting('cta', cta);
      showToast('CTA settings saved.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveHeroCta = async () => {
    setSaving(true);
    try {
      await cmsService.updateSetting('heroCta', heroCta);
      showToast('Hero CTA settings saved.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const saveSectionLabels = async () => {
    setSaving(true);
    try {
      await cmsService.updateSetting('sectionLabels', sectionLabels);
      showToast('Process section labels saved.');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const resetStepForm = () => {
    setStepForm(emptyStep);
    setEditingStepId(null);
  };

  const handleStepSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingStepId) {
        await cmsService.updateProcessStep(editingStepId, stepForm);
        showToast('Process step updated.');
      } else {
        await cmsService.createProcessStep(stepForm);
        showToast('Process step created.');
      }
      resetStepForm();
      const updated = await cmsService.getAdminProcessSteps();
      setSteps(updated);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleStepEdit = (step) => {
    setEditingStepId(step.id);
    setStepForm({
      stepNumber: step.stepNumber,
      title: step.title,
      description: step.description || '',
      icon: step.icon,
      active: step.active,
      displayOrder: step.displayOrder,
    });
  };

  const handleStepDelete = async () => {
    if (!deleteStepId) return;
    setSaving(true);
    try {
      await cmsService.deleteProcessStep(deleteStepId);
      showToast('Process step deleted.');
      setDeleteStepId(null);
      const updated = await cmsService.getAdminProcessSteps();
      setSteps(updated);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <>
        <AdminHeader title="CTA & Process" breadcrumb="Website" />
        <div className="flex justify-center py-16">
          <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="CTA & Process" breadcrumb="Website" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        <AdminPanel title="Contact CTA" description="Main call-to-action section on the homepage.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Eyebrow">
              <input className={inputClass} value={cta.eyebrow || ''} onChange={(e) => setCta((p) => ({ ...p, eyebrow: e.target.value }))} />
            </FormField>
            <FormField label="Headline">
              <input className={inputClass} value={cta.headline || ''} onChange={(e) => setCta((p) => ({ ...p, headline: e.target.value }))} />
            </FormField>
            <FormField label="Title">
              <input className={inputClass} value={cta.title || ''} onChange={(e) => setCta((p) => ({ ...p, title: e.target.value }))} />
            </FormField>
            <FormField label="CTA label">
              <input className={inputClass} value={cta.cta?.label || ''} onChange={(e) => setCta((p) => ({ ...p, cta: { ...p.cta, label: e.target.value } }))} />
            </FormField>
            <FormField label="CTA URL">
              <input className={inputClass} value={cta.cta?.url || ''} onChange={(e) => setCta((p) => ({ ...p, cta: { ...p.cta, url: e.target.value } }))} />
            </FormField>
            <FormField label="Secondary text">
              <input className={inputClass} value={cta.secondaryText || ''} onChange={(e) => setCta((p) => ({ ...p, secondaryText: e.target.value }))} />
            </FormField>
            <FormField label="Subtitle" className="md:col-span-2">
              <textarea className={textareaClass} value={cta.subtitle || ''} onChange={(e) => setCta((p) => ({ ...p, subtitle: e.target.value }))} />
            </FormField>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={cta.visible !== false} onChange={(e) => setCta((p) => ({ ...p, visible: e.target.checked }))} />
              Visible
            </label>
          </div>
          <button type="button" onClick={saveCta} disabled={saving} className="mt-4 rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
            Save CTA
          </button>
        </AdminPanel>

        <AdminPanel title="Hero CTA" description="Secondary CTA block settings.">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Heading">
              <input className={inputClass} value={heroCta.heading || ''} onChange={(e) => setHeroCta((p) => ({ ...p, heading: e.target.value }))} />
            </FormField>
            <FormField label="Label">
              <input className={inputClass} value={heroCta.label || ''} onChange={(e) => setHeroCta((p) => ({ ...p, label: e.target.value }))} />
            </FormField>
            <FormField label="Primary CTA label">
              <input className={inputClass} value={heroCta.primaryCta?.label || ''} onChange={(e) => setHeroCta((p) => ({ ...p, primaryCta: { ...p.primaryCta, label: e.target.value } }))} />
            </FormField>
            <FormField label="Primary CTA URL">
              <input className={inputClass} value={heroCta.primaryCta?.url || ''} onChange={(e) => setHeroCta((p) => ({ ...p, primaryCta: { ...p.primaryCta, url: e.target.value } }))} />
            </FormField>
            <FormField label="Secondary CTA label">
              <input className={inputClass} value={heroCta.secondaryCta?.label || ''} onChange={(e) => setHeroCta((p) => ({ ...p, secondaryCta: { ...p.secondaryCta, label: e.target.value } }))} />
            </FormField>
            <FormField label="Secondary CTA URL">
              <input className={inputClass} value={heroCta.secondaryCta?.url || ''} onChange={(e) => setHeroCta((p) => ({ ...p, secondaryCta: { ...p.secondaryCta, url: e.target.value } }))} />
            </FormField>
            <FormField label="Background image URL">
              <input className={inputClass} value={heroCta.backgroundImageUrl || ''} onChange={(e) => setHeroCta((p) => ({ ...p, backgroundImageUrl: e.target.value }))} />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <textarea className={textareaClass} value={heroCta.description || ''} onChange={(e) => setHeroCta((p) => ({ ...p, description: e.target.value }))} />
            </FormField>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={heroCta.visible !== false} onChange={(e) => setHeroCta((p) => ({ ...p, visible: e.target.checked }))} />
              Visible
            </label>
          </div>
          <button type="button" onClick={saveHeroCta} disabled={saving} className="mt-4 rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
            Save Hero CTA
          </button>
        </AdminPanel>

        <AdminPanel title="Process Section Labels">
          <div className="grid gap-4 md:grid-cols-2">
            <FormField label="Process eyebrow">
              <input className={inputClass} value={sectionLabels.processEyebrow || ''} onChange={(e) => setSectionLabels((p) => ({ ...p, processEyebrow: e.target.value }))} />
            </FormField>
            <FormField label="Process title">
              <input className={inputClass} value={sectionLabels.processTitle || ''} onChange={(e) => setSectionLabels((p) => ({ ...p, processTitle: e.target.value }))} />
            </FormField>
          </div>
          <button type="button" onClick={saveSectionLabels} disabled={saving} className="mt-4 rounded-lg border border-border-subtle px-4 py-2 text-[12px]">
            Save Labels
          </button>
        </AdminPanel>

        <AdminPanel title={editingStepId ? 'Edit Process Step' : 'Add Process Step'}>
          <form onSubmit={handleStepSave} className="grid gap-4 md:grid-cols-2">
            <FormField label="Step number">
              <input type="number" className={inputClass} value={stepForm.stepNumber} onChange={(e) => setStepForm((p) => ({ ...p, stepNumber: Number(e.target.value) }))} />
            </FormField>
            <FormField label="Icon">
              <select className={inputClass} value={stepForm.icon} onChange={(e) => setStepForm((p) => ({ ...p, icon: e.target.value }))}>
                {PROCESS_ICONS.map((icon) => (
                  <option key={icon} value={icon}>{icon}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Title" required>
              <input className={inputClass} value={stepForm.title} onChange={(e) => setStepForm((p) => ({ ...p, title: e.target.value }))} required />
            </FormField>
            <FormField label="Display order">
              <input type="number" className={inputClass} value={stepForm.displayOrder} onChange={(e) => setStepForm((p) => ({ ...p, displayOrder: Number(e.target.value) }))} />
            </FormField>
            <FormField label="Description" className="md:col-span-2">
              <textarea className={textareaClass} value={stepForm.description} onChange={(e) => setStepForm((p) => ({ ...p, description: e.target.value }))} />
            </FormField>
            <label className="flex items-center gap-2 text-[13px]">
              <input type="checkbox" checked={stepForm.active} onChange={(e) => setStepForm((p) => ({ ...p, active: e.target.checked }))} />
              Active
            </label>
            <div className="flex gap-2 md:col-span-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
                {saving ? 'Saving…' : editingStepId ? 'Update' : 'Add Step'}
              </button>
              {editingStepId ? (
                <button type="button" onClick={resetStepForm} className="rounded-lg border border-border-subtle px-4 py-2 text-[12px]">
                  Cancel
                </button>
              ) : null}
            </div>
          </form>
        </AdminPanel>

        <AdminPanel title="All Process Steps">
          <div className="space-y-3">
            {steps.map((step) => (
              <div key={step.id} className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border-subtle p-3">
                <div>
                  <p className="text-[14px] font-medium">
                    {step.stepNumber}. {step.title}
                  </p>
                  <p className="text-[12px] text-muted-foreground">{step.icon}</p>
                  <StatusBadge status={step.active ? 'active' : 'inactive'} />
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => handleStepEdit(step)} className="text-[12px] text-muted-foreground hover:text-foreground">
                    Edit
                  </button>
                  <button type="button" onClick={() => setDeleteStepId(step.id)} className="text-[12px] text-danger">
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </AdminPanel>
      </div>

      <ConfirmModal open={Boolean(deleteStepId)} title="Delete process step?" message="This cannot be undone." onConfirm={handleStepDelete} onCancel={() => setDeleteStepId(null)} loading={saving} />
    </>
  );
}
