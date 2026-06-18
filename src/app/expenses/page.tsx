'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, Search, ChevronDown, FileDown, Printer } from 'lucide-react';
import type { Expense } from '@/lib/types';

import { useExpenses } from './_hooks/use-expenses';
import { useExpenseCategories } from './_hooks/use-expense-categories';
import { ExpensesTable } from './_components/expenses-table';
import { ExpenseFormDialog } from './_components/expense-form';
import { printExpenses, exportExpensesCSV, exportExpensesPDF } from './_lib/expense-export';
import { useConfirm } from '@/components/confirm-dialog';

export default function ExpensesPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { expenses, loading, saveExpense, deleteExpense } = useExpenses();
  const { categories, addCategory } = useExpenseCategories();
  const confirm = useConfirm();

  const handleDeleteExpense = async (id: string) => {
    const expense = expenses.find((e) => e.id === id);
    const ok = await confirm({
      title: 'Delete expense?',
      description: `${expense ? `“${expense.description}”` : 'This expense'} will be permanently removed. This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) deleteExpense(id);
  };

  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.expenses) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch = expense.description.toLowerCase().includes(searchQuery.toLowerCase());

    const expenseDate = new Date(expense.date);
    const start = startDate ? new Date(startDate) : null;
    const end = endDate ? new Date(endDate) : null;
    if (start) start.setUTCHours(0, 0, 0, 0);
    if (end) end.setUTCHours(23, 59, 59, 999);
    const matchesDate = (!start || expenseDate >= start) && (!end || expenseDate <= end);

    const matchesCategory = !selectedCategory || expense.category === selectedCategory;

    return matchesSearch && matchesDate && matchesCategory;
  });

  const handleSaveExpense = async (expense: Expense) => {
    if (await saveExpense(expense, !!editingExpense)) {
      setIsDialogOpen(false);
      setEditingExpense(null);
    }
  };

  if (authContext?.user && !authContext.user.permissions?.expenses) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <Card className="surface-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-20" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Skeleton className="h-10 w-full md:w-[200px] lg:w-[320px]" />
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card className="surface-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Expenses</CardTitle>
              <CardDescription>Track all financial expenditures.</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    Export
                    <ChevronDown className="ml-2 h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => printExpenses(filteredExpenses)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportExpensesCSV(filteredExpenses)}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportExpensesPDF(filteredExpenses)}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => { setEditingExpense(null); setIsDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                Record Expense
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by description..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-auto" />
              <span className="text-muted-foreground">to</span>
              <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-auto" />
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge
              variant={!selectedCategory ? 'default' : 'secondary'}
              onClick={() => setSelectedCategory(null)}
              className="cursor-pointer"
            >
              All
            </Badge>
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? 'default' : 'secondary'}
                onClick={() => setSelectedCategory(category)}
                className="cursor-pointer"
              >
                {category}
              </Badge>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ExpensesTable
            expenses={filteredExpenses}
            isClient={isClient}
            isAdmin={authContext?.user?.role === 'Admin'}
            onEdit={(expense) => { setEditingExpense(expense); setIsDialogOpen(true); }}
            onDelete={handleDeleteExpense}
          />
        </CardContent>
      </Card>

      <ExpenseFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        expense={editingExpense}
        categories={categories}
        userId={authContext?.user?.id || ''}
        onAddCategory={addCategory}
        onSave={handleSaveExpense}
      />
    </AppLayout>
  );
}
