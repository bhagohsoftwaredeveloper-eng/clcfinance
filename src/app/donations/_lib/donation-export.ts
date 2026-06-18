import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Donation } from '@/lib/types';

const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  });

const total = (donations: Donation[]) => donations.reduce((sum, d) => sum + d.amount, 0);

/** Open a print-friendly window with the giving table and total. */
export function printDonations(donations: Donation[]) {
  try {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups for this site to print.');
      return;
    }

    const rows = donations
      .map(
        (d) => `
        <tr>
          <td>${d.donorName}</td>
          <td class="amount">₱${d.amount.toFixed(2)}</td>
          <td>${d.category}</td>
          <td>${d.serviceTime || ''}</td>
          <td class="date">${formatDate(d.date)}</td>
        </tr>`
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Giving Report</title>
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
        <div class="header">Giving</div>
        <table>
          <thead>
            <tr><th>Donor</th><th class="amount">Amount</th><th>Category</th><th>Service Time</th><th class="date">Date</th></tr>
          </thead>
          <tbody>${rows}</tbody>
          <tfoot>
            <tr>
              <td colspan="4" style="text-align: right; font-weight: bold; padding: 8px;">TOTAL:</td>
              <td style="text-align: right; font-weight: bold; padding: 8px;">₱${total(donations).toLocaleString()}</td>
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

/** Download the giving list as a CSV file (with a total row). */
export function exportDonationsCSV(donations: Donation[]) {
  const headers = ['Donor', 'Amount', 'Category', 'Service Time', 'Date'];
  const rows = donations.map((d) => [
    `"${d.donorName.replace(/"/g, '""')}"`,
    `PHP ${d.amount.toFixed(2)}`,
    d.category,
    d.serviceTime || '',
    formatDate(d.date),
  ]);
  rows.push(['TOTAL', `PHP ${total(donations).toFixed(2)}`, '', '', '']);

  const csvContent =
    'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', 'donations_report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Download the giving list as a PDF file (with a total row). */
export function exportDonationsPDF(donations: Donation[]) {
  const doc = new jsPDF();
  const head = [['Donor', 'Amount', 'Category', 'Service Time', 'Date']];
  const body: (string | number)[][] = donations.map((d) => [
    d.donorName,
    `PHP ${d.amount.toFixed(2)}`,
    d.category,
    d.serviceTime || '',
    formatDate(d.date),
  ]);
  body.push(['TOTAL', `PHP ${total(donations).toFixed(2)}`, '', '', '']);

  doc.text('Donations Report', 14, 15);
  autoTable(doc, { head, body, startY: 20 });
  doc.save('donations_report.pdf');
}
