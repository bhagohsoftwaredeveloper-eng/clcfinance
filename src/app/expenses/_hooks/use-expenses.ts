'use client';

import { useCallback, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Expense } from '@/lib/types';

/**
 * Owns the expenses list and its create/update/delete operations. Save/delete
 * surface errors via toast and return a success boolean so the page can close
 * the drawer.
 */
export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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
      toast({ variant: 'destructive', title: 'Could not save expense', description: data.error || 'Please try again.' });
      return false;
    } catch (error) {
      console.error('Error saving expense:', error);
      toast({ variant: 'destructive', title: 'Error saving expense', description: 'A network or server error occurred.' });
      return false;
    }
  };

  const deleteExpense = async (id: string): Promise<void> => {
    try {
      const res = await fetch(`/api/expenses?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchExpenses();
      } else {
        toast({ variant: 'destructive', title: 'Could not delete expense', description: 'Please try again.' });
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast({ variant: 'destructive', title: 'Error deleting expense', description: 'A network or server error occurred.' });
    }
  };

  return { expenses, loading, saveExpense, deleteExpense };
}
