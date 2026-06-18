'use client';

import { useContext } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { AuthContext } from '@/context/auth-context';

import { useDashboard } from './_hooks/use-dashboard';
import { StatCards } from './_components/stat-cards';
import { NetworkChart } from './_components/network-chart';
import { GivingChart } from './_components/giving-chart';
import { RecentTransactions } from './_components/recent-transactions';

export default function DashboardPage() {
  const authContext = useContext(AuthContext);
  const { members, donations, events, loading } = useDashboard();

  if (authContext?.user && !authContext.user.permissions?.dashboard) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardContent className="flex items-start justify-between gap-4 p-5">
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                    <Skeleton className="h-3 w-28" />
                  </div>
                  <Skeleton className="size-11 rounded-xl" />
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {[...Array(2)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-5 w-40" />
                  <Skeleton className="h-4 w-48" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-[250px] w-full" />
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
      <div className="space-y-6">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">An overview of your church's activity.</p>
        </div>

        <StatCards members={members} donations={donations} events={events} />

        <div className="grid gap-4 md:grid-cols-2">
          <NetworkChart members={members} />
          <GivingChart donations={donations} />
        </div>

        <RecentTransactions donations={donations} />
      </div>
    </AppLayout>
  );
}
