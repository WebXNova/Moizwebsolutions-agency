import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { DeleteProjectModal } from '@/components/admin/DeleteProjectModal';
import { EditIcon, EyeIcon, SearchIcon, TrashIcon, SpinnerIcon } from '@/lib/icons';
import * as categoryService from '@/services/categoryService';
import * as projectService from '@/services/projectService';
import { apiUrl } from '@/config/api';

export function AdminProjects() {
  const [projects, setProjects] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [featuredFilter, setFeaturedFilter] = useState('');
  const [sort, setSort] = useState('order');
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [featuringId, setFeaturingId] = useState(null);

  const load = () => {
    setLoading(true);
    Promise.all([projectService.getProjects({ includeUnpublished: true }), categoryService.getCategories()])
      .then(([proj, cats]) => {
        setProjects(proj);
        setCategories(cats);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    let list = [...projects];
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((p) => p.title.toLowerCase().includes(q));
    }
    if (categoryFilter) list = list.filter((p) => p.categoryId === categoryFilter);
    if (featuredFilter === 'yes') list = list.filter((p) => p.featured);
    if (featuredFilter === 'no') list = list.filter((p) => !p.featured);
    if (sort === 'order') list.sort((a, b) => a.displayOrder - b.displayOrder);
    if (sort === 'newest') list.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    return list;
  }, [projects, search, categoryFilter, featuredFilter, sort]);

  const toggleFeatured = async (project) => {
    setFeaturingId(project.id);
    try {
      const updated = await projectService.updateProject(project.id, { featured: !project.featured });
      setProjects((list) => list.map((item) => (item.id === updated.id ? { ...item, featured: updated.featured } : item)));
    } catch {
      /* keep previous featured state */
    } finally {
      setFeaturingId(null);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await projectService.deleteProject(deleteTarget.id);
      setDeleteTarget(null);
      load();
    } catch {
      /* error surfaced via modal staying open */
    } finally {
      setDeleting(false);
    }
  };

  return (
    <>
      <AdminHeader title="Projects" breadcrumb="Admin" />
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-3">
            <div className="relative">
              <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search projects…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="rounded-lg border border-border-subtle bg-surface py-2 pl-9 pr-3 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
              />
            </div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-[13px]"
            >
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <select
              value={featuredFilter}
              onChange={(e) => setFeaturedFilter(e.target.value)}
              className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-[13px]"
            >
              <option value="">All projects</option>
              <option value="yes">Featured only</option>
              <option value="no">Not featured</option>
            </select>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-lg border border-border-subtle bg-surface px-3 py-2 text-[13px]"
            >
              <option value="order">Sort by order</option>
              <option value="newest">Sort by newest</option>
            </select>
          </div>
          <Link
            to="/admin/projects/new"
            className="rounded-lg bg-brand-yellow px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-ink hover:bg-brand-yellow-deep"
          >
            Add Project
          </Link>
        </div>

        {loading ? (
          <div className="flex justify-center py-16">
            <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-[13px] text-muted-foreground">
            No projects yet.{' '}
            <Link to="/admin/projects/new" className="underline">Add Project</Link>
          </p>
        ) : (
          <div className="space-y-4">
            {filtered.map((project) => {
              const thumb = project.imageUrl.startsWith('/uploads/')
                ? apiUrl(project.imageUrl)
                : project.imageUrl;
              return (
                <article
                  key={project.id}
                  className="flex flex-col gap-4 rounded-xl border border-border-subtle bg-surface p-4 sm:flex-row sm:items-center"
                >
                  <img
                    src={thumb}
                    alt=""
                    className="h-16 w-24 shrink-0 rounded-lg object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[14px] font-medium text-foreground">{project.title}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {project.category}
                      {project.featured ? ' · Featured' : ''}
                      · Order {project.displayOrder}
                    </p>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 block truncate text-[12px] text-muted-foreground hover:text-foreground"
                    >
                      {project.liveUrl}
                    </a>
                  </div>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleFeatured(project)}
                      disabled={featuringId === project.id}
                      aria-pressed={project.featured}
                      className={
                        project.featured
                          ? 'rounded-lg bg-brand-yellow px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-brand-ink disabled:opacity-50'
                          : 'rounded-lg border border-border-subtle px-3 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground hover:text-foreground disabled:opacity-50'
                      }
                    >
                      {project.featured ? 'Featured' : 'Feature'}
                    </button>
                    <Link
                      to={`/admin/projects/${project.id}/edit`}
                      aria-label={`Edit ${project.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-muted-foreground hover:text-foreground"
                    >
                      <EditIcon className="h-4 w-4" />
                    </Link>
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Preview ${project.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-muted-foreground hover:text-foreground"
                    >
                      <EyeIcon className="h-4 w-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(project)}
                      aria-label={`Delete ${project.title}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-muted-foreground hover:text-danger"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <DeleteProjectModal
        open={Boolean(deleteTarget)}
        projectTitle={deleteTarget?.title}
        loading={deleting}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
