import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Expense } from '@/lib/types';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  });

const total = (expenses: Expense[]) => expenses.reduce((sum, e) => sum + e.amount, 0);

/** Open a print-friendly window with the expenses table and total. */
export function printExpenses(expenses: Expense[]) {
  try {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups for this site to print.');
      return;
    }

    const rows = expenses
      .map(
        (e) => `
        <tr>
          <td>${e.description}</td>
          <td class="amount">₱${e.amount.toFixed(2)}</td>
          <td>${e.category}</td>
          <td class="date">${formatDate(e.date)}</td>
        </tr>`
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Expenses Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
          .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .amount { text-align: right; }
          .date { text-align: center; }
          .print-date { text-align: right; font-size: 12px; margin-bottom: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="print-date">Printed on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="header">Expenses</div>
        <table>
          <thead>
            <tr><th>Description</th><th class="amount">Amount</th><th>Category</th><th class="date">Date</th></tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="3" style="text-align: right; font-weight: bold; padding: 8px;">TOTAL:</td>
              <td class="amount" style="font-weight: bold; padding: 8px;">₱${total(expenses).toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.onload = () => {
      printWindow.print();
      printWindow.close();
    };
  } catch (error) {
    console.error('Print error:', error);
    alert('Failed to print. Please try again.');
  }
}

/** Download the expenses list as a CSV file (with a total row). */
export function exportExpensesCSV(expenses: Expense[]) {
  const headers = ['Description', 'Amount', 'Category', 'Date'];
  const rows = expenses.map((e) => [
    `"${e.description.replace(/"/g, '""')}"`,
    `₱${e.amount.toFixed(2)}`,
    e.category,
    formatDate(e.date),
  ]);
  rows.push(['Total', `₱${total(expenses).toFixed(2)}`, '', '']);

  const csvContent =
    'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', 'expenses_report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Download the expenses list as a PDF file (with a total row). */
export function exportExpensesPDF(expenses: Expense[]) {
  const doc = new jsPDF();
  const head = [['Description', 'Amount', 'Category', 'Date']];
  const body: (string | number)[][] = expenses.map((e) => [
    e.description,
    `₱${e.amount.toFixed(2)}`,
    e.category,
    formatDate(e.date),
  ]);
  body.push(['Total', `₱${total(expenses).toFixed(2)}`, '', '']);

  doc.text('Expenses Report', 14, 15);
  autoTable(doc, { head, body, startY: 20 });
  doc.save('expenses_report.pdf');
}
