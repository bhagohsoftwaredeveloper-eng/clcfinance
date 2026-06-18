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

/** Build a print-only DOM layout and trigger the browser print dialog. */
export function printReport(data: ReportExportData) {
  const { startDate, endDate, donationsByNetwork, donationsByServiceTime, totalMembers, totalDonations, totalExpenses, printSelection } = data;

  const printContent = document.createElement('div');
  printContent.id = 'print-layout';
  printContent.style.cssText =
    'font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #000; background: #fff; padding: 20px; position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 9999; overflow: auto;';

  const title = document.createElement('h1');
  title.textContent = 'CLC Finances Report';
  title.style.cssText = 'font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 10px; color: #000;';
  printContent.appendChild(title);

  const dateRange = document.createElement('p');
  dateRange.textContent = `Date Range: ${startDate} to ${endDate}`;
  dateRange.style.cssText = 'text-align: center; font-size: 14px; margin-bottom: 20px; color: #333;';
  printContent.appendChild(dateRange);

  function createPrintTable(tableTitle: string, headers: string[], rows: any[]) {
    const section = document.createElement('div');
    section.style.cssText = 'margin-bottom: 25px;';

    const sectionTitle = document.createElement('h3');
    sectionTitle.textContent = tableTitle;
    sectionTitle.style.cssText = 'font-size: 16px; font-weight: bold; margin-bottom: 10px; color: #000;';
    section.appendChild(sectionTitle);

    const table = document.createElement('table');
    table.style.cssText = 'width: 100%; border-collapse: collapse; margin-bottom: 15px;';

    const headerRow = document.createElement('tr');
    headers.forEach((header) => {
      const th = document.createElement('th');
      th.textContent = header;
      th.style.cssText = 'padding: 8px 12px; border: 1px solid #000; background-color: #f5f5f5; font-weight: bold; text-align: left;';
      headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    rows.forEach((item: any) => {
      const row = document.createElement('tr');
      Object.values(item).forEach((value: any) => {
        const td = document.createElement('td');
        td.textContent = value;
        td.style.cssText = 'padding: 6px 12px; border: 1px solid #000;';
        row.appendChild(td);
      });
      table.appendChild(row);
    });

    if (tableTitle.includes('Network') || tableTitle.includes('Service')) {
      const totalRow = document.createElement('tr');
      const totalLabel = document.createElement('td');
      totalLabel.textContent = 'TOTAL';
      totalLabel.style.cssText = 'padding: 8px 12px; border: 1px solid #000; font-weight: bold; background-color: #f0f0f0;';
      const totalValue = document.createElement('td');
      const sum = rows.reduce((acc: number, item: any) => acc + (item.amount || 0), 0);
      totalValue.textContent = `PHP ${sum.toLocaleString()}`;
      totalValue.style.cssText = 'padding: 8px 12px; border: 1px solid #000; font-weight: bold; text-align: right; background-color: #f0f0f0;';
      totalRow.appendChild(totalLabel);
      totalRow.appendChild(totalValue);
      table.appendChild(totalRow);
    }

    section.appendChild(table);
    return section;
  }

  if (printSelection.network && donationsByNetwork.length > 0) {
    printContent.appendChild(createPrintTable('Giving by Network', ['Network', 'Amount'], donationsByNetwork));
  }
  if (printSelection.service && donationsByServiceTime.length > 0) {
    printContent.appendChild(createPrintTable('Giving by Service', ['Service Time', 'Amount'], donationsByServiceTime));
  }

  const summarySection = document.createElement('div');
  summarySection.style.cssText = 'margin-top: 30px; border-top: 2px solid #000; padding-top: 20px;';
  const summaryTitle = document.createElement('h2');
  summaryTitle.textContent = 'Summary Totals';
  summaryTitle.style.cssText = 'font-size: 18px; font-weight: bold; margin-bottom: 15px; color: #000;';
  summarySection.appendChild(summaryTitle);

  const summaryTable = document.createElement('table');
  summaryTable.style.cssText = 'width: 100%; border-collapse: collapse; margin-bottom: 20px;';
  const summaryRows = [
    ['Total Members', totalMembers.toString()],
    ['Total Giving', `PHP ${totalDonations.toLocaleString()}`],
    ['Total Expenses', `PHP ${totalExpenses.toLocaleString()}`],
    ['Net Position', `PHP ${(totalDonations - totalExpenses).toLocaleString()}`],
  ];
  summaryRows.forEach(([label, value]) => {
    const row = document.createElement('tr');
    const labelCell = document.createElement('td');
    labelCell.textContent = label;
    labelCell.style.cssText = 'padding: 8px 12px; border: 1px solid #000; font-weight: bold; width: 200px;';
    const valueCell = document.createElement('td');
    valueCell.textContent = value;
    valueCell.style.cssText = 'padding: 8px 12px; border: 1px solid #000; text-align: right; font-weight: bold;';
    row.appendChild(labelCell);
    row.appendChild(valueCell);
    summaryTable.appendChild(row);
  });
  summarySection.appendChild(summaryTable);
  printContent.appendChild(summarySection);

  document.body.appendChild(printContent);
  window.print();
  setTimeout(() => {
    if (document.body.contains(printContent)) document.body.removeChild(printContent);
  }, 1000);
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
  const { startDate, endDate, donationsByNetwork, donationsByServiceTime, totalMembers, totalDonations, totalExpenses, printSelection } = data;
  const doc = new jsPDF();
  doc.text('CLC Finances Report', 14, 20);
  doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 28);

  let y = 35;
  let hasContent = false;

  if (printSelection.network && donationsByNetwork.length > 0) {
    autoTable(doc, { startY: y, head: [['Giving by Network', 'Amount']], body: donationsByNetwork.map((i) => [i.name, `PHP ${i.amount.toLocaleString()}`]) });
    y = (doc as any).lastAutoTable.finalY + 10;
    hasContent = true;
  }
  if (printSelection.service && donationsByServiceTime.length > 0) {
    autoTable(doc, { startY: y, head: [['Giving by Service', 'Amount']], body: donationsByServiceTime.map((i) => [i.name, `PHP ${i.amount.toLocaleString()}`]) });
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
