'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { User, PagePermission } from '@/lib/types';

const availablePermissions: { id: PagePermission; label: string }[] = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'members', label: 'Members' },
  { id: 'events', label: 'Events' },
  { id: 'donations', label: 'Giving' },
  { id: 'expenses', label: 'Expenses' },
  { id: 'reports', label: 'Reports' },
  { id: 'users', label: 'User Management' },
  { id: 'settings', label: 'Settings' },
];

const rolePermissions = (role: User['role']): User['permissions'] => ({
  dashboard: true,
  members: true,
  events: true,
  donations: true,
  expenses: true,
  reports: true,
  users: role === 'Admin',
  settings: role === 'Admin',
});

interface UserFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User | null;
  onSave: (user: User) => void;
}

/** The right-drawer for creating / editing a system user. */
export function UserFormDialog({ open, onOpenChange, user, onSave }: UserFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{user ? 'Edit User' : 'New User'}</DialogTitle>
          <DialogDescription>
            {user ? "Update the user's details." : 'Add a new user to the system.'}
          </DialogDescription>
        </DialogHeader>
        <UserForm key={user?.id ?? 'new'} user={user} onSave={onSave} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function UserForm({ user, onSave, onCancel }: { user: User | null; onSave: (user: User) => void; onCancel: () => void }) {
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState<Omit<User, 'id'> & { password: string }>(
    user
      ? { name: user.name, username: user.username, email: user.email, role: user.role, password: '', permissions: user.permissions, createdAt: user.createdAt, lastLogin: user.lastLogin }
      : {
          name: '',
          username: '',
          email: '',
          role: 'Staff',
          password: '',
          permissions: {
            dashboard: false, members: false, events: false, donations: false,
            expenses: false, reports: false, users: false, settings: false,
          },
          createdAt: new Date().toISOString(),
        }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRoleChange = (role: User['role']) => {
    setFormData((prev) => ({ ...prev, role, permissions: rolePermissions(role) }));
  };

  const handlePermissionChange = (permissionId: PagePermission, checked: boolean | 'indeterminate') => {
    setFormData((prev) => ({ ...prev, permissions: { ...prev.permissions, [permissionId]: !!checked } }));
  };

  const handleSelectAllPermissions = (checked: boolean) => {
    setFormData((prev) => ({
      ...prev,
      permissions: Object.fromEntries(availablePermissions.map((p) => [p.id, checked])) as Record<PagePermission, boolean>,
    }));
  };

  const allPermissionsSelected = availablePermissions.every((p) => formData.permissions[p.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.username || !formData.role) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in the name, username, and role.' });
      return;
    }
    if (!user && !formData.password) {
      toast({ variant: 'destructive', title: 'Password required', description: 'A password is required for new users.' });
      return;
    }

    const newUser: Omit<User, 'password'> & { password?: string } = {
      id: user?.id || `u${Date.now()}`,
      ...formData,
    };
    // Editing without changing the password keeps the current one.
    if (user && formData.password === '') {
      delete newUser.password;
    }
    onSave(newUser as User);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 py-4">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Full name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" value={formData.username || ''} onChange={handleChange} placeholder="username" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              onChange={handleChange}
              className="pr-10"
              placeholder={user ? 'Leave blank to keep current password' : 'Enter password'}
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="role">Role</Label>
          <Select onValueChange={handleRoleChange} defaultValue={formData.role}>
            <SelectTrigger id="role">
              <SelectValue placeholder="Select a role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Admin">Admin</SelectItem>
              <SelectItem value="Staff">Staff</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Permissions</Label>
          <div className="space-y-3 rounded-lg border p-3">
            <div className="flex items-center gap-2 border-b pb-2">
              <Checkbox id="select-all-permissions" checked={allPermissionsSelected} onCheckedChange={handleSelectAllPermissions} />
              <Label htmlFor="select-all-permissions" className="font-medium">Select All</Label>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {availablePermissions.map((permission) => (
                <div key={permission.id} className="flex items-center gap-2">
                  <Checkbox
                    id={`perm-${permission.id}`}
                    checked={formData.permissions?.[permission.id]}
                    onCheckedChange={(checked) => handlePermissionChange(permission.id, checked)}
                  />
                  <Label htmlFor={`perm-${permission.id}`} className="font-normal">{permission.label}</Label>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}
