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
import { Skeleton } from '@/components/ui/skeleton';
import { TrendingUp, Users, Landmark, Activity } from 'lucide-react';
import type { Donation, Member, Event } from '@/lib/types';
import { useState, useEffect, useContext } from 'react';
import { AuthContext } from '@/context/auth-context';
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';

const categoryVariant: { [key in Donation['category']]: 'default' | 'secondary' | 'outline' | 'destructive' } = {
  Tithe: 'default',
  Offering: 'secondary',
  'Building Fund': 'outline',
  Missions: 'destructive',
};

export default function DashboardPage() {
    const [isClient, setIsClient] = useState(false);
    const [loading, setLoading] = useState(true);
    const [members, setMembers] = useState<Member[]>([]);
    const [donations, setDonations] = useState<Donation[]>([]);
    const [events, setEvents] = useState<Event[]>([]);
    const authContext = useContext(AuthContext);

    useEffect(() => {
        setIsClient(true);
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [membersRes, donationsRes, eventsRes] = await Promise.all([
                fetch('/api/members'),
                fetch('/api/donations'),
                fetch('/api/events')
            ]);

            if (membersRes.ok) {
                const membersData = await membersRes.json();
                setMembers(membersData);
            }

            if (donationsRes.ok) {
                const donationsData = await donationsRes.json();
                setDonations(donationsData);
            }

            if (eventsRes.ok) {
                const eventsData = await eventsRes.json();
                setEvents(eventsData);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    if (authContext?.user && !authContext.user.permissions?.dashboard) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <p>You do not have permission to access this page.</p>
        </div>
      );
    }

  const totalMembers = members.length;
  const totalDonations = donations.reduce((acc: number, donation: Donation) => acc + donation.amount, 0);
  const recentDonations = [...donations].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);
  const upcomingEvents = events.filter((event: Event) => new Date(event.date) >= new Date()).length;

  // Chart data for members by network (pie chart)
  const membersByNetwork = members.reduce((acc, member) => {
    const network = member.network || 'Main';
    acc[network] = (acc[network] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Define consistent colors for networks
  const networkColors = {
    Main: 'hsl(var(--chart-1))',
    Youth: 'hsl(var(--chart-2))',
    Couples: 'hsl(var(--chart-3))',
    Singles: 'hsl(var(--chart-4))',
    Kids: 'hsl(var(--chart-5))'
  };

  const pieChartData = Object.entries(membersByNetwork).map(([network, count]) => ({
    network,
    count,
    fill: networkColors[network as keyof typeof networkColors] || 'hsl(var(--chart-1))'
  }));

  const pieChartConfig = Object.fromEntries(
    Object.keys(membersByNetwork).map(network => [
      network,
      {
        label: network,
        color: networkColors[network as keyof typeof networkColors] || 'hsl(var(--chart-1))'
      }
    ])
  );

  // Chart data for giving by category this month (bar chart)
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyDonations = donations.filter(donation => {
    const donationDate = new Date(donation.date);
    return donationDate.getMonth() === currentMonth && donationDate.getFullYear() === currentYear;
  });

  const givingByCategory = monthlyDonations.reduce((acc, donation) => {
    acc[donation.category] = (acc[donation.category] || 0) + donation.amount;
    return acc;
  }, {} as Record<string, number>);

  const barChartData = Object.entries(givingByCategory).map(([category, amount]) => ({
    category,
    amount
  }));

  const barChartConfig = {
    amount: {
      label: "Amount",
      color: "hsl(var(--chart-1))",
    },
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-64" />
            </CardHeader>
          </Card>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 flex-1" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-6 w-24" />
                    <Skeleton className="h-4 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </AppLayout>
    );
  }

  const monthLabel = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const stats = [
    {
      label: 'Total Members',
      value: totalMembers.toLocaleString(),
      hint: 'Across all networks',
      icon: Users,
      tint: 'text-chart-2 bg-chart-2/10',
    },
    {
      label: 'Giving This Month',
      value: `₱${monthlyDonations.reduce((acc, d) => acc + d.amount, 0).toLocaleString()}`,
      hint: monthLabel,
      icon: Landmark,
      tint: 'text-primary bg-primary/10',
    },
    {
      label: 'Total Giving',
      value: `₱${totalDonations.toLocaleString()}`,
      hint: 'All-time recorded',
      icon: TrendingUp,
      tint: 'text-chart-3 bg-chart-3/10',
    },
    {
      label: 'Upcoming Events',
      value: upcomingEvents.toLocaleString(),
      hint: 'Scheduled ahead',
      icon: Activity,
      tint: 'text-chart-4 bg-chart-4/10',
    },
  ];

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">An overview of your church's activity.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat) => (
            <Card key={stat.label} className="surface-card">
              <CardContent className="flex items-start justify-between gap-4 p-5">
                <div className="flex flex-col gap-1">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.hint}</p>
                </div>
                <div className={`flex size-11 shrink-0 items-center justify-center rounded-xl ${stat.tint}`}>
                  <stat.icon className="size-5" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-base">Members by Network</CardTitle>
              <CardDescription>Distribution of members across different networks</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={pieChartConfig} className="mx-auto aspect-square max-h-[250px]">
                <PieChart>
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent hideLabel />}
                  />
                  <Pie
                    data={pieChartData}
                    dataKey="count"
                    nameKey="network"
                    innerRadius={60}
                    strokeWidth={5}
                  >
                    {pieChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <ChartLegend
                    content={<ChartLegendContent nameKey="network" />}
                    className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="surface-card">
            <CardHeader>
              <CardTitle className="text-base">Monthly Giving by Category</CardTitle>
              <CardDescription>Giving breakdown for the current month</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={barChartConfig}>
                <BarChart data={barChartData}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                  />
                  <ChartTooltip
                    cursor={false}
                    content={<ChartTooltipContent indicator="dashed" />}
                  />
                  <Bar dataKey="amount" fill="var(--color-amount)" radius={4} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        <Card className="surface-card">
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
            <CardDescription>An overview of the latest donations.</CardDescription>
          </CardHeader>
          <CardContent>
            {recentDonations.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
                <div className="flex size-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
                  <Landmark className="size-5" />
                </div>
                <p className="text-sm font-medium">No donations yet</p>
                <p className="text-xs text-muted-foreground">Recorded giving will appear here.</p>
              </div>
            ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell className="font-medium">{donation.donorName}</TableCell>
                    <TableCell>₱{donation.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={categoryVariant[donation.category as keyof typeof categoryVariant]}>
                        {donation.category}
                      </Badge>
                    </TableCell>
                     <TableCell>
                      {isClient
                        ? new Date(donation.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit',
                             timeZone: 'UTC'
                          })
                        : ''}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
