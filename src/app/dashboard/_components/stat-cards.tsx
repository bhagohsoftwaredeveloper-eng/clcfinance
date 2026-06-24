'use client';

import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, Users, Landmark, Activity } from 'lucide-react';
import type { Member, Donation, Event } from '@/lib/types';

interface StatCardsProps {
  members: Member[];
  donations: Donation[];
  events: Event[];
}

/** The four summary cards at the top of the dashboard. */
export function StatCards({ members, donations, events }: StatCardsProps) {
  const now = new Date();
  const monthlyTotal = donations
    .filter((d) => {
      const date = new Date(d.date);
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, d) => sum + d.amount, 0);
  const totalGiving = donations.reduce((sum, d) => sum + d.amount, 0);
  const upcomingEvents = events.filter((e) => new Date(e.date) >= now).length;
  const monthLabel = now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const stats = [
    { label: 'Total Members', value: members.length.toLocaleString(), hint: 'Across all networks', icon: Users, tint: 'text-chart-2 bg-chart-2/10' },
    { label: 'Giving This Month', value: `₱${monthlyTotal.toLocaleString()}`, hint: monthLabel, icon: Landmark, tint: 'text-primary bg-primary/10' },
    { label: 'Total Giving', value: `₱${totalGiving.toLocaleString()}`, hint: 'All-time recorded', icon: TrendingUp, tint: 'text-chart-3 bg-chart-3/10' },
    { label: 'Upcoming Events', value: upcomingEvents.toLocaleString(), hint: 'Scheduled ahead', icon: Activity, tint: 'text-chart-4 bg-chart-4/10' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="surface-card">
          <CardContent className="flex flex-col gap-3 p-4 sm:flex-row sm:items-start sm:justify-between sm:p-5">
            <div className="flex flex-col gap-1">
              <p className="text-xs font-medium text-muted-foreground sm:text-sm">{stat.label}</p>
              <p className="text-xl font-bold tracking-tight sm:text-2xl">{stat.value}</p>
              <p className="hidden text-xs text-muted-foreground sm:block">{stat.hint}</p>
            </div>
            <div className={`flex size-9 shrink-0 items-center justify-center rounded-xl sm:size-11 ${stat.tint}`}>
              <stat.icon className="size-4 sm:size-5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
