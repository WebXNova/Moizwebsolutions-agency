import { useEffect, useState } from 'react';
import { EditIcon, TrashIcon } from '@/lib/icons';
import * as categoryService from '@/services/categoryService';

export function CategoryManager() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const load = () => {
    setLoading(true);
    categoryService
      .getCategories()
      .then(setCategories)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleAdd = async (event) => {
    event.preventDefault();
    if (!newName.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      await categoryService.createCategory(newName.trim());
      setNewName('');
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id) => {
    if (!editName.trim()) return;
    setActionLoading(true);
    setError('');
    try {
      await categoryService.updateCategory(id, editName.trim());
      setEditingId(null);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete category “${name}”? Projects in this category must be moved first.`)) {
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await categoryService.deleteCategory(id);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleAdd} className="flex flex-wrap gap-3">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="min-w-[200px] flex-1 rounded-lg border border-border-subtle bg-surface px-3 py-2.5 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
        />
        <button
          type="submit"
          disabled={actionLoading || !newName.trim()}
          className="rounded-lg bg-brand-yellow px-5 py-2.5 text-[12px] font-semibold uppercase tracking-[0.12em] text-brand-ink hover:bg-brand-yellow-deep disabled:opacity-50"
        >
          Add Category
        </button>
      </form>

      {error ? (
        <p className="rounded-lg border border-danger/30 bg-danger/5 px-4 py-3 text-[13px] text-danger">
          {error}
        </p>
      ) : null}

      {loading ? (
        <p className="text-[13px] text-muted-foreground">Loading categories…</p>
      ) : categories.length === 0 ? (
        <p className="text-[13px] text-muted-foreground">Create your first category above.</p>
      ) : (
        <ul className="divide-y divide-border-subtle rounded-xl border border-border-subtle bg-surface">
          {categories.map((cat) => (
            <li key={cat.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
              {editingId === cat.id ? (
                <div className="flex flex-1 flex-wrap items-center gap-2">
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="flex-1 rounded-lg border border-border-subtle px-3 py-2 text-[13px] focus:border-ring focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                  <button
                    type="button"
                    onClick={() => handleUpdate(cat.id)}
                    disabled={actionLoading}
                    className="rounded-lg bg-brand-navy px-3 py-2 text-[12px] text-white disabled:opacity-50"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingId(null)}
                    className="rounded-lg border border-border-subtle px-3 py-2 text-[12px] disabled:opacity-50"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <>
                  <div>
                    <p className="text-[14px] font-medium text-foreground">{cat.name}</p>
                    <p className="text-[12px] text-muted-foreground">
                      {cat.projectCount} project{cat.projectCount !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setEditingId(cat.id);
                        setEditName(cat.name);
                      }}
                      aria-label={`Edit ${cat.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-muted-foreground hover:text-foreground"
                    >
                      <EditIcon className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(cat.id, cat.name)}
                      disabled={actionLoading}
                      aria-label={`Delete ${cat.name}`}
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border-subtle text-muted-foreground hover:text-danger disabled:opacity-50"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
