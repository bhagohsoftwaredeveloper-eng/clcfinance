'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { MoreHorizontal, PlusCircle, Edit, Trash, Search, Pencil, ChevronDown, FileDown, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { expenseCategories as initialExpenseCategories } from '@/lib/placeholder-data';
import type { Expense } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { QuickSelect, type QuickSelectOption } from '@/components/ui/quick-select';
import { Textarea } from '@/components/ui/textarea';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { AuthContext } from '@/context/auth-context';

const safeCategoryVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  Utilities: 'default',
  Salaries: 'secondary',
  Maintenance: 'outline',
  Supplies: 'destructive',
  Outreach: 'secondary',
};

const ManageCategoriesForm = ({
  categories,
  onSave,
  onCancel,
  onDelete,
  onUpdate,
}: {
  categories: string[];
  onSave: (category: string) => void;
  onCancel: () => void;
  onDelete: (category: string) => void;
  onUpdate: (oldCategory: string, newCategory: string) => void;
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editedName, setEditedName] = useState('');

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCategory.trim()) {
      alert('Category name cannot be empty.');
      return;
    }
    onSave(newCategory);
    setNewCategory('');
  };

  const handleEditClick = (category: string) => {
    setEditingCategory(category);
    setEditedName(category);
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editedName.trim() || !editingCategory) {
      alert('Category name cannot be empty.');
      return;
    }
    onUpdate(editingCategory, editedName);
    setEditingCategory(null);
    setEditedName('');
  };

  return (
    <div>
      <form onSubmit={handleAddSubmit} className="mb-6">
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="category-name">New Category</Label>
            <Input
              id="category-name"
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="e.g., Special Project"
            />
          </div>
        </div>
        <DialogFooter>
          <Button type="submit">Add Category</Button>
        </DialogFooter>
      </form>
      
      <h3 className="text-lg font-medium mb-2">Existing Categories</h3>
      <div className="max-h-60 overflow-y-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((category) => (
              <TableRow key={category}>
                {editingCategory === category ? (
                  <TableCell colSpan={2}>
                    <form onSubmit={handleUpdateSubmit} className="flex items-center gap-2">
                      <Input
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        className="flex-grow"
                      />
                      <Button type="submit" size="sm">Save</Button>
                      <Button type="button" variant="outline" size="sm" onClick={() => setEditingCategory(null)}>Cancel</Button>
                    </form>
                  </TableCell>
                ) : (
                  <>
                    <TableCell>{category}</TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" onClick={() => handleEditClick(category)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={() => onDelete(category)}>
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </>
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DialogFooter className="mt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Close
        </Button>
      </DialogFooter>
    </div>
  );
};


const ExpenseForm = ({ expense, onSave, onCancel, categories, onAddCategoryClick, userId, onAddCategory }: { expense?: Expense | null, onSave: (expense: Expense) => void, onCancel: () => void, categories: string[], onAddCategoryClick: () => void, userId: string, onAddCategory: (name: string) => Promise<QuickSelectOption | null> }) => {
  const [formData, setFormData] = useState<Partial<Expense>>(
    expense || { description: '', amount: 0, category: undefined }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: Expense['category']) => {
    setFormData(prev => ({...prev, category: value}));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount || !formData.category) {
      alert('Please fill all fields');
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
            onValueChange={(value) => handleSelectChange(value as Expense['category'])}
            options={categories.map(c => ({ value: c, label: c }))}
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
};


export default function ExpensesPage() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [categories, setCategories] = useState<string[]>(initialExpenseCategories);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const authContext = useContext(AuthContext);
  const router = useRouter();

  // Check permissions
  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.expenses) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  useEffect(() => {
    setIsClient(true);
    fetchExpenses();
  }, []);

  if (authContext?.user && !authContext.user.permissions?.expenses) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  const fetchExpenses = async () => {
    try {
      const response = await fetch('/api/expenses');
      if (response.ok) {
        const data = await response.json();
        setExpenses(data);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewExpense = () => {
    setEditingExpense(null);
    setIsDialogOpen(true);
  };
  
  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setIsDialogOpen(true);
  };

  // Inline quick-add for the category QuickSelect: creates the category, adds it
  // to the in-memory list, and returns it for auto-selection.
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

  const handleSaveExpense = async (expense: Expense) => {
    try {
      const method = editingExpense ? 'PUT' : 'POST';
      const response = await fetch('/api/expenses', {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(expense),
      });

      if (response.ok) {
        fetchExpenses();
        setIsDialogOpen(false);
        setEditingExpense(null);
      } else {
        const data = await response.json().catch(() => ({}));
        alert(data.error || 'Failed to save expense');
      }
    } catch (error) {
      console.error('Error saving expense:', error);
      alert('Error saving expense');
    }
  };

  const handleDelete = async (expenseId: string) => {
    try {
      const response = await fetch(`/api/expenses?id=${expenseId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchExpenses();
      } else {
        alert('Failed to delete expense');
      }
    } catch (error) {
      console.error('Error deleting expense:', error);
      alert('Error deleting expense');
    }
  };
  
  const handleSaveCategory = (category: string) => {
    if (!categories.includes(category)) {
        setCategories([...categories, category]);
    }
  };
  
  const handleDeleteCategory = (categoryToDelete: string) => {
    if (expenses.some(e => e.category === categoryToDelete)) {
      alert('Cannot delete category with associated expenses.');
      return;
    }
    setCategories(categories.filter(c => c !== categoryToDelete));
  };

  const handleUpdateCategory = (oldCategory: string, newCategory: string) => {
    if (categories.includes(newCategory) && oldCategory !== newCategory) {
      alert('Category name already exists.');
      return;
    }
    setCategories(categories.map(c => c === oldCategory ? newCategory : c));
    setExpenses(expenses.map(e => e.category === oldCategory ? { ...e, category: newCategory } : e));
    if (selectedCategory === oldCategory) {
        setSelectedCategory(newCategory);
    }
  };

  const filteredExpenses = expenses.filter(expense => {
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

  // Pagination logic
  const totalPages = Math.ceil(filteredExpenses.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedExpenses = filteredExpenses.slice(startIndex, endIndex);

  const total = filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0);

  const handlePrint = () => {
    try {
      // Create a new window for printing
      const printWindow = window.open('', '_blank', 'width=800,height=600');
      if (!printWindow) {
        alert('Please allow popups for this site to print.');
        return;
      }

      // Generate print content
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Expenses Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #000;
            }
            .header {
              text-align: center;
              font-size: 24px;
              font-weight: bold;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #000;
              padding: 8px;
              text-align: left;
            }
            th {
              background-color: #f5f5f5;
              font-weight: bold;
            }
            .amount {
              text-align: right;
            }
            .date {
              text-align: center;
            }
            .print-date {
              text-align: right;
              font-size: 12px;
              margin-bottom: 20px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="print-date">Printed on: ${new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</div>
          <div class="header">Expenses</div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th class="amount">Amount</th>
                <th>Category</th>
                <th class="date">Date</th>
              </tr>
            </thead>
            <tbody>
              ${filteredExpenses.map(expense => `
                <tr>
                  <td>${expense.description}</td>
                  <td class="amount">₱${expense.amount.toFixed(2)}</td>
                  <td>${expense.category}</td>
                  <td class="date">${isClient ? new Date(expense.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    timeZone: 'UTC'
                  }) : ''}</td>
                </tr>
              `).join('')}
              <tr>
                <td><strong>Total</strong></td>
                <td class="amount"><strong>₱${total.toFixed(2)}</strong></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </body>
        </html>
      `;

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = () => {
        printWindow.print();
        printWindow.close();
      };
    } catch (error) {
      console.error('Print error:', error);
      alert('Failed to print. Please try again.');
    }
  };

  const handleExportCSV = () => {
    const headers = ['Description', 'Amount', 'Category', 'Date'];
    const rows = filteredExpenses.map(expense => [
      `"${expense.description.replace(/"/g, '""')}"`,
      `₱${expense.amount.toFixed(2)}`,
      expense.category,
      isClient ? new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }) : ''
    ]);

    rows.push(['Total', `₱${total.toFixed(2)}`, '', '']);

    let csvContent = "data:text/csv;charset=utf-8,"
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "expenses_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportPDF = () => {
    const doc = new jsPDF();
    const tableColumn = ["Description", "Amount", "Category", "Date"];
    const tableRows: (string | number)[][] = [];

    filteredExpenses.forEach(expense => {
      const expenseData = [
        expense.description,
        `₱${expense.amount.toFixed(2)}`,
        expense.category,
        isClient ? new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }) : ''
      ];
      tableRows.push(expenseData);
    });

    tableRows.push(['Total', `₱${total.toFixed(2)}`, '', '']);

    doc.text("Expenses Report", 14, 15);
    autoTable(doc, { head: [tableColumn], body: tableRows, startY: 20 });
    doc.save('expenses_report.pdf');
  };

  if (loading) {
    return (
      <AppLayout>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
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
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-6 w-16" />
              ))}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-16" />
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
                  <DropdownMenuItem onClick={handlePrint}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportCSV}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleExportPDF}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={handleAddNewExpense}>
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
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-auto"
              />
              <span className="text-muted-foreground">to</span>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-auto"
              />
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
            {categories.map(category => (
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
          <Table>
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
              {paginatedExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell className="font-medium">{expense.description}</TableCell>
                  <TableCell>₱{expense.amount.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={safeCategoryVariant[expense.category] || 'secondary'}>
                      {expense.category}
                    </Badge>
                  </TableCell>
                  <TableCell>{isClient ? new Date(expense.date).toLocaleDateString('en-US', { year: 'numeric', month: '2-digit', day: '2-digit', timeZone: 'UTC' }) : ''}</TableCell>
                  <TableCell className="text-right">
                    {authContext?.user?.role === 'Admin' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditExpense(expense)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(expense.id)}>
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
          {/* Total Amount Display */}
          <div className="mt-4 p-4 bg-muted/20 rounded-lg border">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">Total Expenses:</span>
              <span className="text-2xl font-bold text-green-600">
                ₱{total.toLocaleString()}
              </span>
            </div>
          </div>
        </CardContent>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t">
            <div className="text-sm text-muted-foreground">
              Showing {startIndex + 1} to {Math.min(endIndex, filteredExpenses.length)} of {filteredExpenses.length} expenses
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              >
                Previous
              </Button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                  const pageNum = i + 1;
                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(pageNum)}
                      className="w-8 h-8 p-0"
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

       <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingExpense ? 'Edit Expense' : 'Record a New Expense'}</DialogTitle>
            <DialogDescription>
              {editingExpense ? 'Update the details of the expense.' : 'Fill in the details to record a new expenditure.'}
            </DialogDescription>
          </DialogHeader>
          <ExpenseForm
            expense={editingExpense}
            onSave={handleSaveExpense}
            onCancel={() => setIsDialogOpen(false)}
            categories={categories}
            onAddCategoryClick={() => setIsCategoryDialogOpen(true)}
            userId={authContext?.user?.id || ''}
            onAddCategory={addCategory}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={isCategoryDialogOpen} onOpenChange={setIsCategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Expense Categories</DialogTitle>
            <DialogDescription>
              Add, edit, or delete expense categories.
            </DialogDescription>
          </DialogHeader>
          <ManageCategoriesForm
            categories={categories}
            onSave={handleSaveCategory}
            onCancel={() => setIsCategoryDialogOpen(false)}
            onDelete={handleDeleteCategory}
            onUpdate={handleUpdateCategory}
          />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
