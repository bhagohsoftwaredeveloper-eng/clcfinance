'use client';

import { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash, Edit } from 'lucide-react';
import type { Expense } from '@/lib/types';

const categoryVariant: Record<string, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  Utilities: 'default',
  Maintenance: 'secondary',
  'Office Supplies': 'outline',
  Events: 'destructive',
};

const PAGE_SIZE = 10;

interface ExpensesTableProps {
  /** Already-filtered list; the table paginates it internally. */
  expenses: Expense[];
  isClient: boolean;
  isAdmin: boolean;
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpensesTable({ expenses, isClient, isAdmin, onEdit, onDelete }: ExpensesTableProps) {
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(expenses.length / PAGE_SIZE);
  const startIndex = (currentPage - 1) * PAGE_SIZE;
  const endIndex = startIndex + PAGE_SIZE;
  const pageExpenses = expenses.slice(startIndex, endIndex);
  const totalAmount = expenses.reduce((sum, e) => sum + e.amount, 0);

  if (currentPage > 1 && startIndex >= expenses.length) {
    setCurrentPage(1);
  }

  return (
    <>
      <Table className="responsive-cards">
        <TableHeader>
          <TableRow>
            <TableHead>Description</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Date</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {pageExpenses.length === 0 && (
            <TableRow>
              <TableCell colSpan={5} className="h-32 text-center text-sm text-muted-foreground">
                No expenses found.
              </TableCell>
            </TableRow>
          )}
          {pageExpenses.map((expense) => (
            <TableRow key={expense.id}>
              <TableCell data-label="Description" className="font-medium">{expense.description}</TableCell>
              <TableCell data-label="Amount">₱{expense.amount.toFixed(2)}</TableCell>
              <TableCell data-label="Category">
                <Badge variant={categoryVariant[expense.category] || 'secondary'}>{expense.category}</Badge>
              </TableCell>
              <TableCell data-label="Date">
                {isClient
                  ? new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' })
                  : ''}
              </TableCell>
              <TableCell data-label="Actions" className="text-right">
                {isAdmin && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onEdit(expense)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => onDelete(expense.id)}>
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-4 rounded-lg border bg-muted/20 p-4">
        <div className="flex items-center justify-between">
          <span className="text-lg font-semibold">Total Expenses:</span>
          <span className="text-2xl font-bold text-primary">₱{totalAmount.toLocaleString()}</span>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-col gap-2 border-t px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 sm:py-4">
          <p className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
            Showing {startIndex + 1}–{Math.min(endIndex, expenses.length)} of {expenses.length} expenses
          </p>
          <div className="flex items-center justify-center gap-1">
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))} disabled={currentPage === 1}>
              Previous
            </Button>
            <span className="mx-2 text-sm text-muted-foreground sm:hidden">
              {currentPage} / {totalPages}
            </span>
            <div className="hidden items-center gap-1 sm:flex">
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((pageNum) => (
                <Button key={pageNum} variant={currentPage === pageNum ? 'default' : 'outline'} size="sm" onClick={() => setCurrentPage(pageNum)} className="h-8 w-8 p-0">
                  {pageNum}
                </Button>
              ))}
            </div>
            <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))} disabled={currentPage === totalPages}>
              Next
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
