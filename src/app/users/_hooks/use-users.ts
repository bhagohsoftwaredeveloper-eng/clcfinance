'use client';

import { useCallback, useEffect, useState } from 'react';
import type { User } from '@/lib/types';

/**
 * Owns the users list, user CRUD, and the destructive system-reset action.
 * Save returns a success boolean so the page can close the drawer.
 */
export function useUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

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
      alert('Failed to save user');
      return false;
    } catch (error) {
      console.error('Error saving user:', error);
      alert('Error saving user');
      return false;
    }
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/users?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUsers();
      } else {
        alert('Failed to delete user');
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Error deleting user');
    }
  };

  /** Wipe member/event/donation/expense data (admin only). Returns success. */
  const resetSystem = async (admin: { id: string; name: string; role: string }): Promise<boolean> => {
    if (admin.role !== 'Admin') {
      alert('Only administrators can reset the system');
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
        alert(`System reset completed successfully!\n\nReset performed by: ${admin.name}\nTimestamp: ${new Date(data.timestamp).toLocaleString()}`);
        return true;
      }
      const error = await res.json().catch(() => ({}));
      alert(`System reset failed: ${error.error || 'Unknown error'}`);
      return false;
    } catch (error) {
      console.error('Error resetting system:', error);
      alert('An error occurred while resetting the system. Please try again.');
      return false;
    }
  };

  return { users, loading, saveUser, deleteUser, resetSystem };
}
