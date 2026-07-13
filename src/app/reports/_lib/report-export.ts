import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface AmountItem {
  name: string;
  amount: number;
}

export interface PrintSelection {
  network: boolean;
  service: boolean;
  incomeVsExpenses: boolean;
  membershipGrowth: boolean;
  givingByNetworkPie: boolean;
  donationCategoriesPie: boolean;
  givingByServicePie: boolean;
}

export interface ReportExportData {
  startDate: string;
  endDate: string;
  donationsByNetwork: AmountItem[];
  donationsByServiceTime: AmountItem[];
  totalMembers: number;
  totalDonations: number;
  totalExpenses: number;
  printSelection: PrintSelection;
}

/**
 * Build the report as a jsPDF document. Shared by both PDF export and print so
 * the print preview and the downloaded PDF have an identical layout.
 */
function buildReportPDF(data: ReportExportData): jsPDF {
  const { startDate, endDate, donationsByNetwork, donationsByServiceTime, totalMembers, totalDonations, totalExpenses, printSelection } = data;
  const doc = new jsPDF();
  doc.text('CLC Finances Report', 14, 20);
  doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 28);

  let y = 35;
  let hasContent = false;

  if (printSelection.network && donationsByNetwork.length > 0) {
    const total = donationsByNetwork.reduce((acc, i) => acc + (i.amount || 0), 0);
    autoTable(doc, {
      startY: y,
      head: [['Giving by Network', 'Amount']],
      body: donationsByNetwork.map((i) => [i.name, `PHP ${i.amount.toLocaleString()}`]),
      foot: [['TOTAL', `PHP ${total.toLocaleString()}`]],
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    hasContent = true;
  }
  if (printSelection.service && donationsByServiceTime.length > 0) {
    const total = donationsByServiceTime.reduce((acc, i) => acc + (i.amount || 0), 0);
    autoTable(doc, {
      startY: y,
      head: [['Giving by Service', 'Amount']],
      body: donationsByServiceTime.map((i) => [i.name, `PHP ${i.amount.toLocaleString()}`]),
      foot: [['TOTAL', `PHP ${total.toLocaleString()}`]],
    });
    y = (doc as any).lastAutoTable.finalY + 10;
    hasContent = true;
  }
  if (hasContent) {
    doc.text('Summary Totals', 14, y);
    autoTable(doc, {
      startY: y + 10,
      head: [['Metric', 'Value']],
      body: [
        ['Total Members', totalMembers.toString()],
        ['Total Giving', `PHP ${totalDonations.toLocaleString()}`],
        ['Total Expenses', `PHP ${totalExpenses.toLocaleString()}`],
        ['Net Position', `PHP ${(totalDonations - totalExpenses).toLocaleString()}`],
      ],
    });
  }
  return doc;
}

/** Open the report PDF in the browser print dialog (same layout as the PDF export). */
export function printReport(data: ReportExportData) {
  const doc = buildReportPDF(data);
  // Reuse jsPDF's built-in auto-print so the preview matches the exported PDF exactly.
  doc.autoPrint();
  const blobUrl = doc.output('bloburl');
  window.open(blobUrl, '_blank');
}

/** Download the selected report sections as a single CSV. */
export function exportReportCSV(data: ReportExportData) {
  const { donationsByNetwork, donationsByServiceTime, totalMembers, totalDonations, totalExpenses, printSelection } = data;
  const headers = ['Data Type', 'Item', 'Amount', 'Donor', 'Category', 'Date'];
  const rows: string[][] = [];

  if (printSelection.network) {
    rows.push(...donationsByNetwork.map((d) => ['Giving by Network', d.name, `PHP ${d.amount.toLocaleString()}`, '', '', '']));
  }
  if (printSelection.service) {
    rows.push(...donationsByServiceTime.map((d) => ['Giving by Service', d.name, `PHP ${d.amount.toLocaleString()}`, '', '', '']));
  }
  rows.push(
    ['SUMMARY', 'Total Members', totalMembers.toString(), '', '', ''],
    ['SUMMARY', 'Total Giving', `PHP ${totalDonations.toLocaleString()}`, '', '', ''],
    ['SUMMARY', 'Total Expenses', `PHP ${totalExpenses.toLocaleString()}`, '', '', ''],
    ['SUMMARY', 'Net Position', `PHP ${(totalDonations - totalExpenses).toLocaleString()}`, '', '', '']
  );

  const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', 'clc_report.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Download the selected report sections as a PDF. */
export function exportReportPDF(data: ReportExportData) {
  const doc = buildReportPDF(data);
  doc.save('clc_report.pdf');
}

/** Export the full database (all tables) as JSON or per-table CSVs. */
export async function exportDatabase(format: 'json' | 'csv') {
  try {
    const res = await fetch('/api/backup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ format }),
    });
    if (!res.ok) {
      alert('Failed to export database');
      return;
    }
    const result = await res.json();
    const download = (content: BlobPart, type: string, filename: string) => {
      const url = window.URL.createObjectURL(new Blob([content], { type }));
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    };

    if (format === 'csv') {
      Object.entries(result.data).forEach(([tableName, csvContent]) => {
        download(csvContent as string, 'text/csv', `${tableName}_${result.timestamp}.csv`);
      });
    } else {
      download(JSON.stringify(result.data, null, 2), 'application/json', `database_backup_${result.timestamp}.json`);
    }
  } catch (error) {
    console.error('Export error:', error);
    alert('Error exporting database');
  }
}
