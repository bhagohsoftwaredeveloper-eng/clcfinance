'use client';

import { useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from '@/components/ui/chart';
import { Bar, BarChart, CartesianGrid, Line, LineChart, Pie, PieChart, XAxis, YAxis, Legend } from 'recharts';
import { TrendingUp, Users, Landmark, Printer, ChevronDown, FileDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { AuthContext } from '@/context/auth-context';

import { useReports } from './_hooks/use-reports';
import { InteractivePieChart } from './_components/interactive-pie-chart';
import { printReport, exportReportCSV, exportReportPDF, exportDatabase, type ReportExportData } from './_lib/report-export';

const barChartConfig = {
  income: { label: 'Income', color: 'hsl(var(--chart-1))' },
  expenses: { label: 'Expenses', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

const membershipChartConfig = {
  new: { label: 'New Members', color: 'hsl(var(--chart-1))' },
  total: { label: 'Total Members', color: 'hsl(var(--chart-2))' },
} satisfies ChartConfig;

export default function ReportsPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const r = useReports();

  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.reports) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  if (authContext?.user && !authContext.user.permissions?.reports) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  const exportData: ReportExportData = {
    startDate: r.startDate,
    endDate: r.endDate,
    donationsByNetwork: r.donationsByNetwork,
    donationsByServiceTime: r.donationsByServiceTime,
    totalMembers: r.totalMembers,
    totalDonations: r.totalDonations,
    totalExpenses: r.totalExpenses,
    printSelection: r.printSelection,
  };

  return (
    <AppLayout>
      <div className="space-y-6" id="reports-content">
        <Card className="print-hide surface-card">
          <CardHeader>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">Reports &amp; Backup</CardTitle>
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
                      <DropdownMenuItem onClick={() => printReport(exportData)}>
                        <Printer className="mr-2 h-4 w-4" />
                        Print Reports
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportReportCSV(exportData)}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export to CSV
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportReportPDF(exportData)}>
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
                      <DropdownMenuItem onClick={() => exportDatabase('json')}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export as JSON
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => exportDatabase('csv')}>
                        <FileDown className="mr-2 h-4 w-4" />
                        Export as CSV
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                  <Input type="date" value={r.startDate} onChange={(e) => r.setStartDate(e.target.value)} className="w-auto" />
                  <span className="text-muted-foreground">to</span>
                  <Input type="date" value={r.endDate} onChange={(e) => r.setEndDate(e.target.value)} className="w-auto" />
                </div>
                <Select onValueChange={(value) => r.setSelectedService(value || 'all')} defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by service" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Services</SelectItem>
                    {r.serviceTimes.map((time: string) => (
                      <SelectItem key={time} value={time}>{time}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select onValueChange={(value) => r.setSelectedNetwork(value || 'all')} defaultValue="all">
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Filter by network" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Networks</SelectItem>
                    {r.networks.map((network) => (
                      <SelectItem key={network} value={network}>{network}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Checkbox id="printAll" checked={r.isPrintAllChecked} onCheckedChange={(checked) => r.setAllPrintFlags(Boolean(checked))} />
                  <Label htmlFor="printAll">Select All for Printing</Label>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Summary cards */}
        <div className="print-hide grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Total Members</CardTitle>
              <CardDescription>Current active members</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Users className="h-12 w-12 text-muted-foreground" />
              <div className="text-4xl font-bold">{r.totalMembers}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Giving</CardTitle>
              <CardDescription>Total donations in period</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <Landmark className="h-12 w-12 text-muted-foreground" />
              <div className="text-4xl font-bold">₱{r.totalDonations.toLocaleString()}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Total Expenses</CardTitle>
              <CardDescription>Total expenses in period</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center gap-4">
              <TrendingUp className="h-12 w-12 text-muted-foreground" />
              <div className="text-4xl font-bold">₱{r.totalExpenses.toLocaleString()}</div>
            </CardContent>
          </Card>
        </div>

        {/* Income vs Expenses + Membership Growth */}
        <div className={`mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2 ${!r.printSelection.incomeVsExpenses && !r.printSelection.membershipGrowth ? 'print-hide' : ''}`}>
          <Card className={!r.printSelection.incomeVsExpenses ? 'print-hide' : ''}>
            <CardHeader>
              <CardTitle>Income vs. Expenses</CardTitle>
              <CardDescription>Comparison of total income and expenses.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig} className="h-[250px] w-full">
                <BarChart data={r.incomeVsExpensesData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
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
          <Card className={!r.printSelection.membershipGrowth ? 'print-hide' : ''}>
            <CardHeader>
              <CardTitle>Membership Growth</CardTitle>
              <CardDescription>New vs. Total Members Over Time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={membershipChartConfig} className="h-[250px] w-full">
                <LineChart data={r.membershipGrowthData}>
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

        {/* Pie charts */}
        <div className={`mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-3 ${!r.printSelection.givingByNetworkPie && !r.printSelection.donationCategoriesPie && !r.printSelection.givingByServicePie ? 'print-hide' : ''}`}>
          <Card className={!r.printSelection.givingByNetworkPie ? 'print-hide' : ''}>
            <CardHeader>
              <CardTitle>Giving by Network</CardTitle>
              <CardDescription>Breakdown of giving by member network.</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={r.networkChartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={r.donationsByNetwork} dataKey="amount" nameKey="name" />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          <Card className={!r.printSelection.donationCategoriesPie ? 'print-hide' : ''}>
            <CardHeader>
              <CardTitle>Donation Categories</CardTitle>
              <CardDescription>Breakdown of donations by fund</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={r.categoryChartConfig} className="h-[250px] w-full">
                <PieChart>
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Pie data={r.donationsByCategory} dataKey="amount" nameKey="category" />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
          {r.printSelection.givingByServicePie && <InteractivePieChart donationsByServiceTime={r.donationsByServiceTime} />}
        </div>

        {/* Data tables */}
        <div className={`mt-6 grid gap-6 md:grid-cols-1 lg:grid-cols-2 ${!r.printSelection.network && !r.printSelection.service ? 'print-hide' : ''}`}>
          <Card className={!r.printSelection.network ? 'print-hide' : ''}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Giving by Network</CardTitle>
                <CardDescription>Data table of giving by member network.</CardDescription>
              </div>
              <div className="print-checkbox flex items-center space-x-2">
                <Checkbox id="print-network" checked={r.printSelection.network} onCheckedChange={(checked) => r.setPrintFlag('network', Boolean(checked))} />
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
                  {r.donationsByNetwork.map((item: { name: string; amount: number }) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">₱{item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 bg-muted/20 font-semibold">
                    <TableCell className="font-semibold">TOTAL</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₱{r.donationsByNetwork.reduce((total: number, item: { amount: number }) => total + item.amount, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Card className={!r.printSelection.service ? 'print-hide' : ''}>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Giving by Service</CardTitle>
                <CardDescription>Data table of giving by service time.</CardDescription>
              </div>
              <div className="print-checkbox flex items-center space-x-2">
                <Checkbox id="print-service" checked={r.printSelection.service} onCheckedChange={(checked) => r.setPrintFlag('service', Boolean(checked))} />
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
                  {r.donationsByServiceTime.map((item: { name: string; amount: number }) => (
                    <TableRow key={item.name}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell className="text-right">₱{item.amount.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="border-t-2 bg-muted/20 font-semibold">
                    <TableCell className="font-semibold">TOTAL</TableCell>
                    <TableCell className="text-right font-semibold">
                      ₱{r.donationsByServiceTime.reduce((total: number, item: { amount: number }) => total + item.amount, 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>

        {/* Print summary */}
        <div className="print-hide page-break-before mt-8">
          <Card className="border-2 border-primary">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">CLC Finances Summary Report</CardTitle>
              <CardDescription className="text-lg">Period: {r.startDate} to {r.endDate}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-3xl font-bold text-blue-600">{r.totalMembers}</div>
                  <div className="text-sm text-muted-foreground">Total Members</div>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-3xl font-bold text-green-600">₱{r.totalDonations.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Giving</div>
                </div>
                <div className="rounded-lg border p-4 text-center">
                  <div className="text-3xl font-bold text-red-600">₱{r.totalExpenses.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">Total Expenses</div>
                </div>
              </div>
              <div className="border-t pt-6 text-center">
                <div className="mb-2 text-xl font-semibold">Net Financial Position</div>
                <div className={`text-4xl font-bold ${r.totalDonations - r.totalExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  ₱{(r.totalDonations - r.totalExpenses).toLocaleString()}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {r.totalDonations - r.totalExpenses >= 0 ? 'Surplus' : 'Deficit'}
                </div>
              </div>
              <div className="border-t pt-4 text-center text-xs text-muted-foreground">
                Generated on {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
