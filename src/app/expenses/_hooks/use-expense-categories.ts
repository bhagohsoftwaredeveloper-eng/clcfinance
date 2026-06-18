'use client';

import { useState } from 'react';
import { expenseCategories as initialExpenseCategories } from '@/lib/placeholder-data';
import type { QuickSelectOption } from '@/components/ui/quick-select';

/**
 * Expense categories list (names only) plus an inline quick-add helper for the
 * category QuickSelect. Seeded with the default categories.
 */
export function useExpenseCategories() {
  const [categories, setCategories] = useState<string[]>(initialExpenseCategories);

  const addCategory = async (name: string): Promise<QuickSelectOption | null> => {
    try {
      const res = await fetch('/api/expense-categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || 'Failed to add category');
        return null;
      }
      const { category } = await res.json();
      setCategories((prev) => [...prev, category.name].sort((a, b) => a.localeCompare(b)));
      return { value: category.name, label: category.name };
    } catch {
      alert('Error adding category');
      return null;
    }
  };

  return { categories, addCategory };
}
