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
import { Textarea } from '@/components/ui/textarea';
import { QuickSelect, type QuickSelectOption } from '@/components/ui/quick-select';
import { useToast } from '@/hooks/use-toast';
import type { Expense } from '@/lib/types';

interface ExpenseFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The expense being edited, or null when recording a new one. */
  expense: Expense | null;
  categories: string[];
  userId: string;
  onAddCategory: (name: string) => Promise<QuickSelectOption | null>;
  onSave: (expense: Expense) => void;
}

/** The right-drawer for recording / editing an expense. */
export function ExpenseFormDialog({ open, onOpenChange, expense, categories, userId, onAddCategory, onSave }: ExpenseFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{expense ? 'Edit Expense' : 'Record a New Expense'}</DialogTitle>
          <DialogDescription>
            {expense ? 'Update the details of the expense.' : 'Fill in the details to record a new expenditure.'}
          </DialogDescription>
        </DialogHeader>
        <ExpenseForm
          key={expense?.id ?? 'new'}
          expense={expense}
          categories={categories}
          userId={userId}
          onAddCategory={onAddCategory}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function ExpenseForm({
  expense,
  categories,
  userId,
  onAddCategory,
  onSave,
  onCancel,
}: {
  expense: Expense | null;
  categories: string[];
  userId: string;
  onAddCategory: (name: string) => Promise<QuickSelectOption | null>;
  onSave: (expense: Expense) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Expense>>(
    expense || { description: '', amount: 0, category: undefined }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in the description, amount, and category.' });
      return;
    }
    const newExpense: Expense = {
      id: expense?.id || `ex${Date.now()}`,
      date: expense?.date || new Date().toISOString().split('T')[0],
      recordedById: userId,
      ...formData,
      amount: Number(formData.amount),
    } as Expense;
    onSave(newExpense);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 py-4">
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={formData.description || ''} onChange={handleChange} placeholder="What was this expense for?" rows={3} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">₱</span>
            <Input id="amount" name="amount" type="number" value={formData.amount || ''} onChange={handleChange} className="pl-7" placeholder="0.00" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <QuickSelect
            id="category"
            value={formData.category}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, category: value }))}
            options={categories.map((c) => ({ value: c, label: c }))}
            placeholder="Select a category"
            addLabel="Add category"
            onAdd={onAddCategory}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save Expense</Button>
      </DialogFooter>
    </form>
  );
}
