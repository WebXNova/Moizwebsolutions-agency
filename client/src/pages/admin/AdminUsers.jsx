import { useCallback, useEffect, useState } from 'react';
import { AdminHeader } from '@/components/admin/AdminHeader';
import {
  AdminPanel,
  FormField,
  StatusBadge,
  inputClass,
} from '@/components/admin/cms/AdminForm';
import { useAuth } from '@/context/AuthProvider';
import { useToast } from '@/context/ToastProvider';
import * as cmsService from '@/services/cmsService';
import { SpinnerIcon } from '@/lib/icons';

const ROLES = ['super_admin', 'content_manager', 'editor', 'viewer'];

const emptyCreate = {
  email: '',
  password: '',
  name: '',
  role: 'content_manager',
};

const emptyEdit = {
  name: '',
  role: 'content_manager',
  active: true,
  password: '',
};

export function AdminUsers() {
  const { admin } = useAuth();
  const canManageUsers = admin?.role === 'super_admin';
  const { showToast } = useToast();
  const [users, setUsers] = useState([]);
  const [createForm, setCreateForm] = useState(emptyCreate);
  const [editForm, setEditForm] = useState(emptyEdit);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!canManageUsers) {
      setUsers([]);
      setLoading(false);
      return;
    }
    const data = await cmsService.getAdminUsers();
    setUsers(data);
    setLoading(false);
  }, [canManageUsers]);

  useEffect(() => {
    load().catch((e) => showToast(e.message, 'error'));
  }, [load, showToast]);

  const handleCreate = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await cmsService.createAdminUser(createForm);
      showToast('User created.');
      setCreateForm(emptyCreate);
      await load();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    setEditForm({
      name: user.name || '',
      role: user.role,
      active: user.active,
      password: '',
    });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingId) return;
    setSaving(true);
    try {
      const payload = {
        name: editForm.name,
        role: editForm.role,
        active: editForm.active,
      };
      if (editForm.password) payload.password = editForm.password;
      await cmsService.updateAdminUser(editingId, payload);
      showToast('User updated.');
      setEditingId(null);
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
        <AdminHeader title="Users" breadcrumb="Admin" />
        <div className="flex justify-center py-16">
          <SpinnerIcon className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </>
    );
  }

  return (
    <>
      <AdminHeader title="Admin Users" breadcrumb="Admin" />
      <div className="space-y-6 p-4 sm:p-6 lg:p-8">
        {canManageUsers ? (
        <AdminPanel title="Create User">
          <form onSubmit={handleCreate} className="grid gap-4 md:grid-cols-2">
            <FormField label="Email" required>
              <input type="email" className={inputClass} value={createForm.email} onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))} required />
            </FormField>
            <FormField label="Password" required>
              <input type="password" className={inputClass} value={createForm.password} onChange={(e) => setCreateForm((p) => ({ ...p, password: e.target.value }))} required minLength={8} />
            </FormField>
            <FormField label="Name">
              <input className={inputClass} value={createForm.name} onChange={(e) => setCreateForm((p) => ({ ...p, name: e.target.value }))} />
            </FormField>
            <FormField label="Role">
              <select className={inputClass} value={createForm.role} onChange={(e) => setCreateForm((p) => ({ ...p, role: e.target.value }))}>
                {ROLES.map((role) => (
                  <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </FormField>
            <div className="md:col-span-2">
              <button type="submit" disabled={saving} className="rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
                {saving ? 'Creating…' : 'Create User'}
              </button>
            </div>
          </form>
        </AdminPanel>
        ) : (
          <p className="text-[13px] text-muted-foreground">
            Only a super admin can view, create, or edit admin users.
          </p>
        )}

        {canManageUsers ? (
        <AdminPanel title="All Users">
          <div className="space-y-3">
            {users.map((user) => (
              <div key={user.id} className="rounded-lg border border-border-subtle p-3">
                {editingId === user.id ? (
                  <form onSubmit={handleUpdate} className="grid gap-4 md:grid-cols-2">
                    <FormField label="Name">
                      <input className={inputClass} value={editForm.name} onChange={(e) => setEditForm((p) => ({ ...p, name: e.target.value }))} />
                    </FormField>
                    <FormField label="Role">
                      <select className={inputClass} value={editForm.role} onChange={(e) => setEditForm((p) => ({ ...p, role: e.target.value }))}>
                        {ROLES.map((role) => (
                          <option key={role} value={role}>{role.replace(/_/g, ' ')}</option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="New password (optional)">
                      <input type="password" className={inputClass} value={editForm.password} onChange={(e) => setEditForm((p) => ({ ...p, password: e.target.value }))} minLength={8} placeholder="Leave blank to keep current" />
                    </FormField>
                    <label className="flex items-center gap-2 text-[13px]">
                      <input type="checkbox" checked={editForm.active} onChange={(e) => setEditForm((p) => ({ ...p, active: e.target.checked }))} />
                      Active
                    </label>
                    <div className="flex gap-2 md:col-span-2">
                      <button type="submit" disabled={saving} className="rounded-lg bg-brand-navy px-4 py-2 text-[12px] font-semibold text-white">
                        Save
                      </button>
                      <button type="button" onClick={() => setEditingId(null)} className="rounded-lg border border-border-subtle px-4 py-2 text-[12px]">
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-[14px] font-medium">{user.name || user.email}</p>
                      <p className="text-[12px] text-muted-foreground">{user.email}</p>
                      <div className="mt-1 flex gap-2">
                        <StatusBadge status={user.active ? 'active' : 'inactive'} />
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">{user.role.replace(/_/g, ' ')}</span>
                      </div>
                    </div>
                    {canManageUsers ? (
                    <button type="button" onClick={() => handleEdit(user)} className="text-[12px] text-muted-foreground hover:text-foreground">
                      Edit
                    </button>
                    ) : null}
                  </div>
                )}
              </div>
            ))}
          </div>
        </AdminPanel>
        ) : null}
      </div>
    </>
  );
}
