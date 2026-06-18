'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Expense } from '@/lib/types';

/**
 * Owns the expenses list and its create/update/delete operations. Save/delete
 * surface errors via alert (matching this module's existing style) and return a
 * success boolean so the page can close the drawer.
 */
export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchExpenses = useCallback(async () => {
    try {
      const res = await fetch('/api/expenses');
      if (res.ok) setExpenses(await res.json());
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  const saveExpense = async (expense: Expense, isEditing: boolean): Promise<boolean> => {
    try {
      const res = await fetch('/api/expenses', {
        method: isEditing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(expense),
      });
      if (res.ok) {
        await fetchExpenses();
        return true;
      }
      const data = await res.json().catch(() => ({}));
      alert(data.error || 'Failed to save expense');
      return false;
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense');
      return false;
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchExpenses();
      } else {
        alert('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense');
    }
  };

  return { expenses, loading, saveExpense, deleteExpense };
}
