import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Member } from '@/lib/types';

/** Format an ISO date as MM/DD/YYYY in UTC (matches how the table renders). */
const formatDate = (date: string) =>
  new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    timeZone: 'UTC',
  });

/** Open a print-friendly window with the members table. */
export function printMembers(members: Member[]) {
  try {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    if (!printWindow) {
      alert('Please allow popups for this site to print.');
      return;
    }

    const rows = members
      .map(
        (m) => `
        <tr>
          <td>${m.name}</td>
          <td>${m.email}</td>
          <td>${m.phone}</td>
          <td>${m.address}</td>
          <td>${m.network}</td>
          <td class="date">${formatDate(m.joinDate)}</td>
        </tr>`
      )
      .join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Members Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; color: #000; }
          .header { text-align: center; font-size: 24px; font-weight: bold; margin-bottom: 20px; border-bottom: 2px solid #000; padding-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #000; padding: 8px; text-align: left; }
          th { background-color: #f5f5f5; font-weight: bold; }
          .date { text-align: center; }
          .print-date { text-align: right; font-size: 12px; margin-bottom: 20px; color: #666; }
        </style>
      </head>
      <body>
        <div class="print-date">Printed on: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        <div class="header">Members</div>
        <table>
          <thead>
            <tr>
              <th>Name</th><th>Email</th><th>Phone</th><th>Address</th><th>Network</th><th class="date">Join Date</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
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

/** Download the members list as a CSV file. */
export function exportMembersCSV(members: Member[]) {
  const headers = ['Name', 'Email', 'Phone', 'Address', 'Network', 'Join Date'];
  const rows = members.map((m) => [
    `"${m.name.replace(/"/g, '""')}"`,
    m.email,
    m.phone,
    `"${m.address.replace(/"/g, '""')}"`,
    m.network,
    formatDate(m.joinDate),
  ]);

  const csvContent =
    'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const link = document.createElement('a');
  link.setAttribute('href', encodeURI(csvContent));
  link.setAttribute('download', 'members_list.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/** Download the members list as a PDF file. */
export function exportMembersPDF(members: Member[]) {
  const doc = new jsPDF();
  const head = [['Name', 'Email', 'Phone', 'Network', 'Join Date']];
  const body = members.map((m) => [m.name, m.email, m.phone, m.network, formatDate(m.joinDate)]);

  doc.text('Members List', 14, 15);
  autoTable(doc, { head, body, startY: 20 });
  doc.save('members_list.pdf');
}
