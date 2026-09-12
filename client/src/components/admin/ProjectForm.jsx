import { useEffect, useState } from 'react';
import { ProjectCard } from '@/components/projects/ProjectCard';
import { SpinnerIcon } from '@/lib/icons';
import * as categoryService from '@/services/categoryService';
import * as projectService from '@/services/projectService';
import { apiUrl } from '@/config/api';

const emptyForm = {
  title: '',
  slug: '',
  categoryId: '',
  description: '',
  technologies: '',
  liveUrl: '',
  imageUrl: '',
  featured: false,
  published: true,
  displayOrder: 0,
  client: '',
  year: '',
  githubUrl: '',
  seoTitle: '',
  seoDescription: '',
  previewObjectPosition: 'center',
};

/**
 * @param {string} title
 */
function slugFromTitle(title) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * @param {{
 *   initialValues?: Partial<typeof emptyForm>;
 *   onSubmit: (data: typeof emptyForm) => Promise<void>;
 *   submitLabel?: string;
 * }} props
 */
export function ProjectForm({ initialValues, onSubmit, submitLabel = 'Save Project' }) {
  const [form, setForm] = useState({ ...emptyForm, ...initialValues });
  const [categories, setCategories] = useState([]);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    if (initialValues) setForm((prev) => ({ ...prev, ...initialValues }));
  }, [initialValues]);

  const update = (field, value) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      if (field === 'title' && !prev.slug) next.slug = slugFromTitle(value);
      return next;
    });
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleImageChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml'];
    if (!allowed.includes(file.type)) {
      setUploadError('Use JPG, PNG, WebP, GIF, or SVG.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('Image must be under 5 MB.');
      return;
    }

    setUploading(true);
    setUploadError('');
    try {
      const url = await projectService.uploadProjectImage(file);
      update('imageUrl', url);
    } catch (err) {
      setUploadError(err.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setFormError('');
    setErrors({});

    try {
      await onSubmit({
        ...form,
        year: form.year === '' || form.year === null ? null : form.year,
      });
    } catch (err) {
      if (err.errors) setErrors(err.errors);
      setFormError(err.message || 'Could not save project.');
    } finally {
      setLoading(false);
    }
  };

  const previewProject = {
    id: 'preview',
    title: form.title || 'Project Title',
    slug: form.slug || 'project-title',
    categoryId: form.categoryId,
    category: categories.find((c) => c.id === form.categoryId)?.name || 'Category',
    description: form.description || 'Short project description.',
    technologies: form.technologies,
    imageUrl: form.imageUrl || '/assets/work-dashboard.svg',
    liveUrl: form.liveUrl,
    featured: form.featured,
    displayOrder: form.displayOrder,
  };

  const imagePreviewSrc = previewProject.imageUrl.startsWith('/uploads/')
    ? apiUrl(previewProject.imageUrl)
    : previewProject.imageUrl;

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError ? (
          <p className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] text-danger">
            {formError}
          </p>
        ) : null}

        <div>
          <label htmlFor="title" className="block text-[12px] font-medium text-foreground">
            Project Title <span className="text-danger">*</span>
          </label>
          <input
            id="title"
            type="text"
            value={form.title}
            onChange={(e) => update('title', e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.title ? <p className="mt-1 text-[12px] text-danger">{errors.title}</p> : null}
        </div>

        <div>
          <label htmlFor="slug" className="block text-[12px] font-medium text-foreground">
            Project Slug
          </label>
          <input
            id="slug"
            type="text"
            value={form.slug}
            onChange={(e) => update('slug', e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.slug ? <p className="mt-1 text-[12px] text-danger">{errors.slug}</p> : null}
        </div>

        <div>
          <label htmlFor="categoryId" className="block text-[12px] font-medium text-foreground">
            Category <span className="text-danger">*</span>
          </label>
          <select
            id="categoryId"
            value={form.categoryId}
            onChange={(e) => update('categoryId', e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="">Select category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.categoryId ? (
            <p className="mt-1 text-[12px] text-danger">{errors.categoryId}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="description" className="block text-[12px] font-medium text-foreground">
            Short Description <span className="text-danger">*</span>
          </label>
          <textarea
            id="description"
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.description ? (
            <p className="mt-1 text-[12px] text-danger">{errors.description}</p>
          ) : null}
        </div>

        <div>
          <label htmlFor="technologies" className="block text-[12px] font-medium text-foreground">
            Technologies / Services
          </label>
          <input
            id="technologies"
            type="text"
            value={form.technologies}
            onChange={(e) => update('technologies', e.target.value)}
            placeholder="React, Tailwind CSS, UX/UI"
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          <p className="mt-1 text-[11px] text-muted-foreground">
            Comma-separated labels for this project. This is independent of the Technologies CMS list.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="client" className="block text-[12px] font-medium text-foreground">
              Client
            </label>
            <input
              id="client"
              type="text"
              value={form.client}
              onChange={(e) => update('client', e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="year" className="block text-[12px] font-medium text-foreground">
              Year
            </label>
            <input
              id="year"
              type="number"
              min={1990}
              max={2100}
              value={form.year}
              onChange={(e) => update('year', e.target.value === '' ? '' : Number(e.target.value))}
              className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            {errors.year ? <p className="mt-1 text-[12px] text-danger">{errors.year}</p> : null}
          </div>
        </div>

        <div>
          <label htmlFor="githubUrl" className="block text-[12px] font-medium text-foreground">
            GitHub URL
          </label>
          <input
            id="githubUrl"
            type="url"
            value={form.githubUrl}
            onChange={(e) => update('githubUrl', e.target.value)}
            placeholder="https://github.com/…"
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.githubUrl ? <p className="mt-1 text-[12px] text-danger">{errors.githubUrl}</p> : null}
        </div>

        <div>
          <label htmlFor="liveUrl" className="block text-[12px] font-medium text-foreground">
            Live Preview URL <span className="text-danger">*</span>
          </label>
          <input
            id="liveUrl"
            type="url"
            value={form.liveUrl}
            onChange={(e) => update('liveUrl', e.target.value)}
            placeholder="https://"
            className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
          />
          {errors.liveUrl ? <p className="mt-1 text-[12px] text-danger">{errors.liveUrl}</p> : null}
        </div>

        <div>
          <label htmlFor="image" className="block text-[12px] font-medium text-foreground">
            Project Image <span className="text-danger">*</span>
          </label>
          <input
            id="image"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            onChange={handleImageChange}
            className="mt-1.5 block w-full text-[13px] text-muted-foreground file:mr-3 file:rounded-lg file:border-0 file:bg-brand-navy file:px-4 file:py-2 file:text-[12px] file:text-white"
          />
          {uploading ? (
            <p className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground">
              <SpinnerIcon className="h-4 w-4 animate-spin" /> Uploading…
            </p>
          ) : null}
          {uploadError ? <p className="mt-1 text-[12px] text-danger">{uploadError}</p> : null}
          {errors.imageUrl ? (
            <p className="mt-1 text-[12px] text-danger">{errors.imageUrl}</p>
          ) : null}
          {form.imageUrl ? (
            <img
              src={imagePreviewSrc}
              alt="Project preview"
              className="mt-3 h-32 w-auto rounded-lg border border-border-subtle object-cover"
            />
          ) : null}
        </div>

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={form.featured}
              onChange={(e) => update('featured', e.target.checked)}
              className="h-4 w-4 rounded border-border-subtle"
            />
            Featured project
          </label>

          <label className="flex items-center gap-2 text-[13px]">
            <input
              type="checkbox"
              checked={Boolean(form.published)}
              onChange={(e) => update('published', e.target.checked)}
              className="h-4 w-4 rounded border-border-subtle"
            />
            Published
          </label>

          <div>
            <label htmlFor="displayOrder" className="text-[12px] font-medium text-foreground">
              Display Order
            </label>
            <input
              id="displayOrder"
              type="number"
              min={0}
              value={form.displayOrder}
              onChange={(e) => update('displayOrder', Number(e.target.value))}
              className="mt-1 w-24 rounded-lg border border-border-subtle bg-surface px-3 py-2 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="seoTitle" className="block text-[12px] font-medium text-foreground">
              SEO title
            </label>
            <input
              id="seoTitle"
              type="text"
              value={form.seoTitle}
              onChange={(e) => update('seoTitle', e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div>
            <label htmlFor="previewObjectPosition" className="block text-[12px] font-medium text-foreground">
              Preview position
            </label>
            <input
              id="previewObjectPosition"
              type="text"
              value={form.previewObjectPosition}
              onChange={(e) => update('previewObjectPosition', e.target.value)}
              placeholder="center top"
              className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="seoDescription" className="block text-[12px] font-medium text-foreground">
              SEO description
            </label>
            <textarea
              id="seoDescription"
              rows={2}
              value={form.seoDescription}
              onChange={(e) => update('seoDescription', e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">
              Project SEO fields are stored for a future case-study page. Site-wide SEO is edited under SEO &amp; Site.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || uploading}
            className="rounded-lg bg-brand-yellow px-6 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-ink transition-colors hover:bg-brand-yellow-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:opacity-50"
          >
            {loading ? 'Saving…' : submitLabel}
          </button>
          <button
            type="button"
            onClick={() => setShowPreview((v) => !v)}
            className="rounded-lg border border-border-subtle px-6 py-2.5 text-[12px] font-medium text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
          >
            {showPreview ? 'Hide Preview' : 'Show Preview'}
          </button>
        </div>
      </form>

      {showPreview ? (
        <div>
          <p className="mb-4 text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Card Preview
          </p>
          <ProjectCard project={previewProject} />
        </div>
      ) : null}
    </div>
  );
}
