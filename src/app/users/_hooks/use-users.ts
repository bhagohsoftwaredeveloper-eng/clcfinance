'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { User } from '@/lib/types';

/**
 * Owns the users list, user CRUD, and the destructive system-reset action.
 * Save returns a success boolean so the page can close the drawer.
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const { toast } = useToast();

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/users');
      if (res.ok) setUsers(await res.json());
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const saveUser = async (user: User, isEditing: boolean): Promise<boolean> => {
    try {
      const res = await fetch('/api/users', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(user),
      });
      if (res.ok) {
        await fetchUsers();
        return true;
      }
      toast({ variant: 'destructive', title: 'Could not save user', description: 'Please try again.' });
      return false;
    } catch (error) {
      console.error('Error saving user:', error);
      toast({ variant: 'destructive', title: 'Error saving user', description: 'A network or server error occurred.' });
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUsers();
      } else {
        toast({ variant: 'destructive', title: 'Could not delete user', description: 'Please try again.' });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({ variant: 'destructive', title: 'Error deleting user', description: 'A network or server error occurred.' });
    }
  };

  /** Wipe member/event/donation/expense data (admin only). Returns success. */
  const resetSystem = async (admin: { id: string; name: string; role: string }): Promise<boolean> => {
    if (admin.role !== 'Admin') {
      toast({ variant: 'destructive', title: 'Not allowed', description: 'Only administrators can reset the system.' });
      return false;
    }
    try {
      const res = await fetch('/api/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': admin.id,
          'x-user-role': admin.role,
        },
        body: JSON.stringify({ confirmReset: true }),
      });
      if (res.ok) {
        const data = await res.json();
        toast({ title: 'System reset complete', description: `Performed by ${admin.name} · ${new Date(data.timestamp).toLocaleString()}` });
        return true;
      }
      const error = await res.json().catch(() => ({}));
      toast({ variant: 'destructive', title: 'System reset failed', description: error.error || 'Unknown error.' });
      return false;
    } catch (error) {
      console.error('Error resetting system:', error);
      toast({ variant: 'destructive', title: 'System reset failed', description: 'An error occurred. Please try again.' });
      return false;
    }
  };

  return { users, loading, saveUser, deleteUser, resetSystem };
}
