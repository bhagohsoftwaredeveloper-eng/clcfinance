'use client';
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
import { Badge } from '@/components/ui/badge';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, XAxis, YAxis, Legend, Label as PieLabel, Sector } from 'recharts';
import { PieSectorDataItem } from 'recharts/types/polar/Pie';
import { TrendingUp, Users, Landmark, Printer, ChevronDown, FileDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import type { Donation, Member } from '@/lib/types';
import { useState, useEffect, useMemo, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AuthContext } from '@/context/auth-context';

const memberNetworks: Member['network'][] = ['Main', 'Youth', 'Couples', 'Singles', 'Kids']; // Fallback for initial load

const membershipData = [
  { month: 'Jan', new: 4, total: 120 },
  { month: 'Feb', new: 3, total: 123 },
  { month: 'Mar', new: 5, total: 128 },
  { month: 'Apr', new: 2, total: 130 },
  { month: 'May', new: 6, total: 136 },
  { month: 'Jun', new: 4, total: 140 },
];

const attendanceData = [
  { day: 'Sun', attendance: 95 },
  { day: 'Wed', attendance: 45 },
  { day: 'Sun', attendance: 110 },
  { day: 'Wed', attendance: 50 },
  { day: 'Sun', attendance: 105 },
  { day: 'Wed', attendance: 48 },
];

// Dynamic chart configuration
const getDynamicChartConfig = (data: any[], keyProperty: string = 'name'): ChartConfig => {
  return Object.fromEntries(
    data.map((item, index) => [
      item[keyProperty] || item.category || item.name,
      {
        label: item[keyProperty] || item.category || item.name,
        color: `hsl(var(--chart-${(index % 5) + 1}))`
      }
    ])
  );
};


const categoryVariant: { [key: string]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  Tithe: 'default',
  Offering: 'secondary',
  'Building Fund': 'outline',
  Missions: 'destructive',
};

const getMonthDateRange = () => {
    const now = new Date();
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    return {
      start: firstDay.toISOString().split('T')[0],
      end: lastDay.toISOString().split('T')[0],
    };
};



export default function ReportsPage() {
  const [isClient, setIsClient] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedNetwork, setSelectedNetwork] = useState<string>('all');
  const [reportsData, setReportsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [networks, setNetworks] = useState<Member['network'][]>(memberNetworks);
  const [printSelection, setPrintSelection] = useState({
    network: true,
    service: true,
    incomeVsExpenses: false,
    membershipGrowth: false,
    givingByNetworkPie: true,
    donationCategoriesPie: false,
    givingByServicePie: true,
  });

  const authContext = useContext(AuthContext);
  const router = useRouter();

  const handlePrintSelectionChange = (key: keyof typeof printSelection, checked: boolean) => {
    setPrintSelection(prev => ({...prev, [key]: checked}));
  };

  const handlePrintAllChange = (checked: boolean) => {
    setPrintSelection({
      network: checked,
      service: checked,
      incomeVsExpenses: checked,
      membershipGrowth: checked,
      givingByNetworkPie: checked,
      donationCategoriesPie: checked,
      givingByServicePie: checked,
    });
  };

  const fetchReports = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        startDate,
        endDate,
        service: selectedService,
        network: selectedNetwork,
      });
      const response = await fetch(`/api/reports?${params}`);
      if (response.ok) {
        const data = await response.json();
        setReportsData(data);
      }
    } catch (error) {
      console.error('Failed to fetch reports:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNetworks = async () => {
    try {
      const response = await fetch('/api/networks');
      if (response.ok) {
        const networksData = await response.json();
        setNetworks(networksData.map((network: { name: string }) => network.name));
      }
    } catch (error) {
      console.error('Failed to fetch networks:', error);
    }
  };

  useEffect(() => {
    setIsClient(true);
    // Set year-to-date as default date range
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    setStartDate(`${currentYear}-01-01`);
    setEndDate(currentDate.toISOString().split('T')[0]);
    fetchNetworks();
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      fetchReports();
    }
  }, [startDate, endDate, selectedService, selectedNetwork]);

  // Check permissions
  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.reports) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  if (authContext?.user && !authContext.user.permissions?.reports) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  // Extract data for convenience
  const totalMembers = reportsData?.summary?.totalMembers || 0;
  const totalDonations = reportsData?.summary?.totalDonations || 0;
  const totalExpenses = reportsData?.summary?.totalExpenses || 0;
  const recentDonations = reportsData?.data?.recentDonations || [];

  // Get data from API - ChartContainer handles color mapping
  const donationsByCategory = reportsData?.data?.donationsByCategory || [];
  const donationsByNetwork = reportsData?.data?.donationsByNetwork || [];
  const donationsByServiceTime = reportsData?.data?.donationsByServiceTime || [];

  const incomeVsExpensesData = reportsData?.data?.incomeVsExpensesData || [];
  const serviceTimes = reportsData?.data?.serviceTimes || [];

  // Membership growth data from database
  const membershipGrowthData = reportsData?.data?.membershipGrowthData || membershipData;

  // Create chart configurations
  const categoryChartConfig = getDynamicChartConfig(donationsByCategory, 'category');
  const networkChartConfig = getDynamicChartConfig(donationsByNetwork);
  const serviceChartConfig = getDynamicChartConfig(donationsByServiceTime);

  // Static config for income vs expenses
  const barChartConfig = {
    income: { label: 'Income', color: 'hsl(var(--chart-1))' },
    expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  // Static config for membership growth
  const membershipChartConfig = {
    new: { label: 'New Members', color: 'hsl(var(--chart-1))' },
    total: { label: 'Total Members', color: 'hsl(var(--chart-2))' },
  } satisfies ChartConfig;

  function InteractivePieChart() {
    const [activeService, setActiveService] = useState(donationsByServiceTime[0]?.name || '')

    const activeIndex = useMemo(
      () => donationsByServiceTime.findIndex((item: any) => item.name === activeService),
      [activeService, donationsByServiceTime]
    )
    const serviceNames = useMemo(() => donationsByServiceTime.map((item: any) => item.name), [donationsByServiceTime])

    if (donationsByServiceTime.length === 0) return null

    // Custom green and yellow color scheme for services
    const getServiceColor = (index: number) => {
      const colors = ['hsl(142 76% 40%)', 'hsl(52 100% 50%)', 'hsl(142 60% 45%)', 'hsl(48 95% 55%)', 'hsl(142 70% 35%)']
      return colors[index % colors.length]
    }

    // Add fill colors to the data
    const chartData = donationsByServiceTime.map((item: any, index: number) => ({
      ...item,
      fill: getServiceColor(index)
    }))

    return (
      <Card data-chart="service-pie" className="flex flex-col">
        <CardHeader className="flex-row items-start space-y-0 pb-0">
          <div className="grid gap-1">
            <CardTitle>Giving by Service</CardTitle>
            <CardDescription>Interactive breakdown of giving by service time.</CardDescription>
          </div>
          <Select value={activeService} onValueChange={setActiveService}>
            <SelectTrigger
              className="ml-auto h-7 w-[180px] rounded-lg pl-2.5"
              aria-label="Select a service"
            >
              <SelectValue placeholder="Select service" />
            </SelectTrigger>
            <SelectContent align="end" className="rounded-xl">
              {serviceNames.map((serviceName: string, index: number) => (
                <SelectItem
                  key={serviceName}
                  value={serviceName}
                  className="rounded-lg [&_span]:flex"
                >
                  <div className="flex items-center gap-2 text-xs">
                    <span
                      className="flex h-3 w-3 shrink-0 rounded-xs"
                      style={{
                        backgroundColor: getServiceColor(index),
                      }}
                    />
                    {serviceName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent className="flex flex-1 justify-center pb-0">
          <ChartContainer
            id="service-pie"
            config={serviceChartConfig}
            className="mx-auto aspect-square w-full max-w-[300px]"
          >
            <PieChart>
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent hideLabel />}
              />
            <Pie
              data={chartData}
              dataKey="amount"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
              activeIndex={activeIndex}
              activeShape={({
                outerRadius = 0,
                ...props
              }: PieSectorDataItem) => (
                <g>
                  <Sector {...props} outerRadius={outerRadius + 10} />
                  <Sector
                    {...props}
                    outerRadius={outerRadius + 25}
                    innerRadius={outerRadius + 12}
                  />
                </g>
              )}
            >
              <PieLabel
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          ₱{donationsByServiceTime[activeIndex]?.amount?.toLocaleString() || '0'}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Giving
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
            </PieChart>
          </ChartContainer>
        </CardContent>
      </Card>
    )
  }

  const handlePrint = () => {
    // Create a print-specific layout that matches the PDF export
    const printContent = document.createElement('div');
    printContent.id = 'print-layout';
    printContent.style.cssText = `
      font-family: Arial, sans-serif;
      font-size: 12px;
      line-height: 1.4;
      color: #000;
      background: #fff;
      padding: 20px;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 9999;
      overflow: auto;
    `;

    // Add title
    const title = document.createElement('h1');
    title.textContent = 'CLC Finances Report';
    title.style.cssText = `
      font-size: 24px;
      font-weight: bold;
      text-align: center;
      margin-bottom: 10px;
      color: #000;
    `;
    printContent.appendChild(title);

    // Add date range
    const dateRange = document.createElement('p');
    dateRange.textContent = `Date Range: ${startDate} to ${endDate}`;
    dateRange.style.cssText = `
      text-align: center;
      font-size: 14px;
      margin-bottom: 20px;
      color: #333;
    `;
    printContent.appendChild(dateRange);

    // Add selected sections
    if (printSelection.network && donationsByNetwork.length > 0) {
      const networkSection = createPrintTable('Giving by Network', ['Network', 'Amount'], donationsByNetwork);
      printContent.appendChild(networkSection);
    }

    if (printSelection.service && donationsByServiceTime.length > 0) {
      const serviceSection = createPrintTable('Giving by Service', ['Service Time', 'Amount'], donationsByServiceTime);
      printContent.appendChild(serviceSection);
    }



    // Add summary section
    const summarySection = document.createElement('div');
    summarySection.style.cssText = `
      margin-top: 30px;
      border-top: 2px solid #000;
      padding-top: 20px;
    `;

    const summaryTitle = document.createElement('h2');
    summaryTitle.textContent = 'Summary Totals';
    summaryTitle.style.cssText = `
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 15px;
      color: #000;
    `;
    summarySection.appendChild(summaryTitle);

    const summaryTable = document.createElement('table');
    summaryTable.style.cssText = `
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    `;

    const summaryData = [
      ['Total Members', totalMembers.toString()],
      ['Total Giving', `PHP ${totalDonations.toLocaleString()}`],
      ['Total Expenses', `PHP ${totalExpenses.toLocaleString()}`],
      ['Net Position', `PHP ${(totalDonations - totalExpenses).toLocaleString()}`]
    ];

    summaryData.forEach(([label, value]) => {
      const row = document.createElement('tr');
      const labelCell = document.createElement('td');
      labelCell.textContent = label;
      labelCell.style.cssText = `
        padding: 8px 12px;
        border: 1px solid #000;
        font-weight: bold;
        width: 200px;
      `;
      const valueCell = document.createElement('td');
      valueCell.textContent = value;
      valueCell.style.cssText = `
        padding: 8px 12px;
        border: 1px solid #000;
        text-align: right;
        font-weight: bold;
      `;
      row.appendChild(labelCell);
      row.appendChild(valueCell);
      summaryTable.appendChild(row);
    });

    summarySection.appendChild(summaryTable);
    printContent.appendChild(summarySection);

    // Helper function to create print tables
    function createPrintTable(title: string, headers: string[], data: any[]) {
      const section = document.createElement('div');
      section.style.cssText = `margin-bottom: 25px;`;

      const sectionTitle = document.createElement('h3');
      sectionTitle.textContent = title;
      sectionTitle.style.cssText = `
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
        color: #000;
      `;
      section.appendChild(sectionTitle);

      const table = document.createElement('table');
      table.style.cssText = `
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 15px;
      `;

      // Add headers
      const headerRow = document.createElement('tr');
      headers.forEach(header => {
        const th = document.createElement('th');
        th.textContent = header;
        th.style.cssText = `
          padding: 8px 12px;
          border: 1px solid #000;
          background-color: #f5f5f5;
          font-weight: bold;
          text-align: left;
        `;
        headerRow.appendChild(th);
      });
      table.appendChild(headerRow);

      // Add data rows
      data.forEach((item: any) => {
        const row = document.createElement('tr');
        Object.values(item).forEach((value: any) => {
          const td = document.createElement('td');
          td.textContent = value;
          td.style.cssText = `
            padding: 6px 12px;
            border: 1px solid #000;
          `;
          row.appendChild(td);
        });
        table.appendChild(row);
      });

      // Add total row if it's a financial table
      if (title.includes('Network') || title.includes('Service')) {
        const totalRow = document.createElement('tr');
        const totalLabel = document.createElement('td');
        totalLabel.textContent = 'TOTAL';
        totalLabel.style.cssText = `
          padding: 8px 12px;
          border: 1px solid #000;
          font-weight: bold;
          background-color: #f0f0f0;
        `;
        const totalValue = document.createElement('td');
        const total = data.reduce((sum: number, item: any) => sum + (item.amount || 0), 0);
        totalValue.textContent = `PHP ${total.toLocaleString()}`;
        totalValue.style.cssText = `
          padding: 8px 12px;
          border: 1px solid #000;
          font-weight: bold;
          text-align: right;
          background-color: #f0f0f0;
        `;
        totalRow.appendChild(totalLabel);
        totalRow.appendChild(totalValue);
        table.appendChild(totalRow);
      }

      section.appendChild(table);
      return section;
    }

    // Add to body and print
    document.body.appendChild(printContent);

    // Print
    window.print();

    // Remove after printing
    setTimeout(() => {
      if (document.body.contains(printContent)) {
        document.body.removeChild(printContent);
      }
    }, 1000);
  };

  const handleExportCSV = () => {
    const headers = [
        'Data Type',
        'Item',
        'Amount',
        'Donor',
        'Category',
        'Date'
    ];

    const rows: string[][] = [];

    // Add selected sections based on print selection
    if (printSelection.network) {
      rows.push(...donationsByNetwork.map((d: {name: string, amount: number}) =>
        ['Giving by Network', d.name, `PHP ${d.amount.toLocaleString()}`, '', '', '']
      ));
    }

    if (printSelection.service) {
      rows.push(...donationsByServiceTime.map((d: {name: string, amount: number}) =>
        ['Giving by Service', d.name, `PHP ${d.amount.toLocaleString()}`, '', '', '']
      ));
    }



    // Always include summary totals
    rows.push(
      ['SUMMARY', 'Total Members', totalMembers.toString(), '', '', ''],
      ['SUMMARY', 'Total Giving', `PHP ${totalDonations.toLocaleString()}`, '', '', ''],
      ['SUMMARY', 'Total Expenses', `PHP ${totalExpenses.toLocaleString()}`, '', '', ''],
      ['SUMMARY', 'Net Position', `PHP ${(totalDonations - totalExpenses).toLocaleString()}`, '', '', '']
    );

    let csvContent = "data:text/csv;charset=utf-8,"
        + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "clc_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  const handleExportPDF = () => {
    const doc = new jsPDF();

    doc.text("CLC Finances Report", 14, 20);
    doc.text(`Date Range: ${startDate} to ${endDate}`, 14, 28);

    let yPosition = 35;
    let hasContent = false;

    // Add selected sections based on print selection
    if (printSelection.network && donationsByNetwork.length > 0) {
      autoTable(doc, {
          startY: yPosition,
          head: [['Giving by Network', 'Amount']],
          body: donationsByNetwork.map((item: {name: string, amount: number}) => [item.name, `PHP ${item.amount.toLocaleString()}`]),
      });
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      hasContent = true;
    }

    if (printSelection.service && donationsByServiceTime.length > 0) {
      autoTable(doc, {
          startY: yPosition,
          head: [['Giving by Service', 'Amount']],
          body: donationsByServiceTime.map((item: {name: string, amount: number}) => [item.name, `PHP ${item.amount.toLocaleString()}`]),
      });
      yPosition = (doc as any).lastAutoTable.finalY + 10;
      hasContent = true;
    }



    // Always add summary section if there's any content
    if (hasContent) {
      doc.text("Summary Totals", 14, yPosition);
      yPosition += 10;

      autoTable(doc, {
          startY: yPosition,
          head: [['Metric', 'Value']],
          body: [
              ['Total Members', totalMembers.toString()],
              ['Total Giving', `PHP ${totalDonations.toLocaleString()}`],
              ['Total Expenses', `PHP ${totalExpenses.toLocaleString()}`],
              ['Net Position', `PHP ${(totalDonations - totalExpenses).toLocaleString()}`]
          ],
      });
    }

    doc.save('clc_report.pdf');
  };

  const isPrintAllChecked = Object.values(printSelection).every(Boolean);

  const handleExportDatabase = async (format: 'json' | 'csv') => {
    try {
      const response = await fetch('/api/backup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ format })
      });

      if (response.ok) {
        const result = await response.json();

        if (format === 'csv') {
          // Create separate CSV files for each table
          Object.entries(result.data).forEach(([tableName, csvContent]) => {
            const blob = new Blob([csvContent as string], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `${tableName}_${result.timestamp}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
          });
        } else {
          // For JSON, create a JSON file
          const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' });
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `database_backup_${result.timestamp}.json`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        }
      } else {
        alert('Failed to export database');
      }
    } catch (error) {
      console.error('Export error:', error);
      alert('Error exporting database');
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-10 w-32" />
                    <Skeleton className="h-10 w-32" />
                  </div>
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-10 w-40" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
            </CardHeader>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-32" />
                </CardHeader>
                <CardContent className="flex items-center gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <Skeleton className="h-8 w-16" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-28" />
                  <Skeleton className="h-4 w-40" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-64 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6" id="reports-content">
        <Card className="print-hide surface-card">
          <CardHeader>
            <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle className="text-xl">Reports & Backup</CardTitle>
                        <CardDescription>View reports and create database backups.</CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline">
                                    Export Reports
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={handlePrint}>
                                    <Printer className="mr-2 h-4 w-4" />
                                    Print Reports
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
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="default">
                                    Database Backup
                                    <ChevronDown className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                                <DropdownMenuItem onClick={() => handleExportDatabase('json')}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export as JSON
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleExportDatabase('csv')}>
                                    <FileDown className="mr-2 h-4 w-4" />
                                    Export as CSV
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
                 <div className="flex flex-wrap items-center gap-4">
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
                    <Select onValueChange={(value) => setSelectedService(value || 'all')} defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by service" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Services</SelectItem>
                            {serviceTimes.map((time: string) => (
                                <SelectItem key={time} value={time}>{time}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <Select onValueChange={(value) => setSelectedNetwork(value || 'all')} defaultValue="all">
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Filter by network" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Networks</SelectItem>
                            {networks.map(network => (
                                <SelectItem key={network} value={network}>{network}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                     <div className="flex items-center space-x-2">
                        <Checkbox id="printAll" checked={isPrintAllChecked} onCheckedChange={(checked) => handlePrintAllChange(Boolean(checked))} />
                        <Label htmlFor="printAll">Select All for Printing</Label>
                    </div>
                </div>
            </div>
          </CardHeader>
        </Card>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 print-hide">
            <Card>
            <CardHeader>
                <CardTitle>Total Members</CardTitle>
                <CardDescription>Current active members</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Users className="h-12 w-12 text-muted-foreground" />
                <div className="text-4xl font-bold">{totalMembers}</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Total Giving</CardTitle>
                <CardDescription>Total donations in period</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <Landmark className="h-12 w-12 text-muted-foreground" />
                <div className="text-4xl font-bold">₱{totalDonations.toLocaleString()}</div>
            </CardContent>
            </Card>
            <Card>
            <CardHeader>
                <CardTitle>Total Expenses</CardTitle>
                <CardDescription>Total expenses in period</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
                <TrendingUp className="h-12 w-12 text-muted-foreground" />
                <div className="text-4xl font-bold">₱{totalExpenses.toLocaleString()}</div>
            </CardContent>
            </Card>
        </div>

        <div className={`mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2 ${!printSelection.incomeVsExpenses && !printSelection.membershipGrowth ? 'print-hide' : ''}`}>
            <Card className={!printSelection.incomeVsExpenses ? 'print-hide' : ''}>
                <CardHeader>
                <CardTitle>Income vs. Expenses</CardTitle>
                <CardDescription>Comparison of total income and expenses.</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                    <BarChart data={incomeVsExpensesData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <CartesianGrid vertical={false} />
                    <XAxis dataKey="name" tickLine={false} axisLine={false} />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Legend />
                    <Bar dataKey="income" fill="var(--color-income)" radius={8} />
                    <Bar dataKey="expenses" fill="var(--color-expenses)" radius={8} />
                    </BarChart>
                </ChartContainer>
                </CardContent>
            </Card>
            <Card className={!printSelection.membershipGrowth ? 'print-hide' : ''}>
                <CardHeader>
                    <CardTitle>Membership Growth</CardTitle>
                    <CardDescription>New vs. Total Members Over Time</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={membershipChartConfig} className="h-[250px] w-full">
                    <LineChart data={membershipGrowthData}>
                        <CartesianGrid vertical={false} />
                        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line dataKey="new" type="monotone" stroke="var(--color-new)" strokeWidth={2} />
                        <Line dataKey="total" type="monotone" stroke="var(--color-total)" strokeWidth={2} />
                    </LineChart>
                    </ChartContainer>
                </CardContent>
            </Card>
        </div>

        <div className={`mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-3 ${!printSelection.givingByNetworkPie && !printSelection.donationCategoriesPie && !printSelection.givingByServicePie ? 'print-hide' : ''}`}>
            <Card className={!printSelection.givingByNetworkPie ? 'print-hide' : ''}>
                <CardHeader>
                <CardTitle>Giving by Network</CardTitle>
                <CardDescription>Breakdown of giving by member network.</CardDescription>
                </CardHeader>
                <CardContent>
                <ChartContainer config={networkChartConfig} className="h-[250px] w-full">
                    <PieChart>
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Pie data={donationsByNetwork} dataKey="amount" nameKey="name" />
                    </PieChart>
                </ChartContainer>
                </CardContent>
            </Card>
            <Card className={!printSelection.donationCategoriesPie ? 'print-hide' : ''}>
                <CardHeader>
                    <CardTitle>Donation Categories</CardTitle>
                    <CardDescription>Breakdown of donations by fund</CardDescription>
                </CardHeader>
                <CardContent>
                    <ChartContainer config={categoryChartConfig} className="h-[250px] w-full">
                    <PieChart>
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Pie data={donationsByCategory} dataKey="amount" nameKey="category" />
                    </PieChart>
                    </ChartContainer>
                </CardContent>
            </Card>
            {printSelection.givingByServicePie && <InteractivePieChart />}
        </div>
        
        <div className={`mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2 ${!printSelection.network && !printSelection.service ? 'print-hide' : ''}`}>
            <Card className={!printSelection.network ? 'print-hide' : ''}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Giving by Network</CardTitle>
                        <CardDescription>Data table of giving by member network.</CardDescription>
                    </div>
                    <div className="flex items-center space-x-2 print-checkbox">
                        <Checkbox id="print-network" checked={printSelection.network} onCheckedChange={(checked) => handlePrintSelectionChange('network', Boolean(checked))} />
                        <Label htmlFor="print-network">Print</Label>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Network</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {donationsByNetwork.map((item: {name: string, amount: number}) => (
                                <TableRow key={item.name}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">₱{item.amount.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                            {/* Total Row */}
                            <TableRow className="border-t-2 font-semibold bg-muted/20">
                                <TableCell className="font-semibold">TOTAL</TableCell>
                                <TableCell className="text-right font-semibold">
                                    ₱{donationsByNetwork.reduce((total: number, item: {name: string, amount: number}) => total + item.amount, 0).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className={!printSelection.service ? 'print-hide' : ''}>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Giving by Service</CardTitle>
                        <CardDescription>Data table of giving by service time.</CardDescription>
                    </div>
                     <div className="flex items-center space-x-2 print-checkbox">
                        <Checkbox id="print-service" checked={printSelection.service} onCheckedChange={(checked) => handlePrintSelectionChange('service', Boolean(checked))} />
                        <Label htmlFor="print-service">Print</Label>
                    </div>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Service Time</TableHead>
                                <TableHead className="text-right">Amount</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {donationsByServiceTime.map((item: {name: string, amount: number}) => (
                                <TableRow key={item.name}>
                                    <TableCell>{item.name}</TableCell>
                                    <TableCell className="text-right">₱{item.amount.toLocaleString()}</TableCell>
                                </TableRow>
                            ))}
                            {/* Total Row */}
                            <TableRow className="border-t-2 font-semibold bg-muted/20">
                                <TableCell className="font-semibold">TOTAL</TableCell>
                                <TableCell className="text-right font-semibold">
                                    ₱{donationsByServiceTime.reduce((total: number, item: {name: string, amount: number}) => total + item.amount, 0).toLocaleString()}
                                </TableCell>
                            </TableRow>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>



        {/* Print Summary Section - Hidden when printing to show only data */}
        <div className="print-hide mt-8 page-break-before">
          <Card className="border-2 border-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">CLC Finances Summary Report</CardTitle>
              <CardDescription className="text-lg">
                Period: {startDate} to {endDate}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">{totalMembers}</div>
                  <div className="text-sm text-muted-foreground">Total Members</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-green-600">₱{totalDonations.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Giving</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-3xl font-bold text-red-600">₱{totalExpenses.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="text-center">
                  <div className="text-xl font-semibold mb-2">Net Financial Position</div>
                  <div className={`text-4xl font-bold ${totalDonations - totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ₱{(totalDonations - totalExpenses).toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {totalDonations - totalExpenses >= 0 ? 'Surplus' : 'Deficit'}
                  </div>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground border-t pt-4">
                Generated on {new Date().toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
