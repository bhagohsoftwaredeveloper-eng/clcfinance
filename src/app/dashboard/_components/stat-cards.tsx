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
  );
}
