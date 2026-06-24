'use client';

import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle } from 'lucide-react';
import type { Event } from '@/lib/types';

import { useEvents } from './_hooks/use-events';
import { EventFormDialog } from './_components/event-form';
import { UpcomingEvents } from './_components/upcoming-events';

export default function EventsPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { upcomingEvents, loading, saveEvent } = useEvents();

  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const hasPermission = authContext?.user?.permissions?.events;

  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.events) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  const handleSaveEvent = async (event: Event) => {
    if (await saveEvent(event)) {
      setIsDialogOpen(false);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="surface-card">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-32" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                  <Skeleton className="h-10 w-32" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <Card key={i} className="flex items-start gap-4 p-4 shadow-sm">
                    <Skeleton className="h-16 w-16 rounded-md" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-48" />
                      <Skeleton className="h-4 w-96" />
                    </div>
                  </Card>
                ))}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-0">
                <Skeleton className="h-80 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!hasPermission) {
    return (
      <AppLayout>
        <div className="flex h-full items-center justify-center">
          <p>You do not have permission to access this page.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-3">
        {/* Calendar — shown first on mobile for quick date reference */}
        <div className="order-first lg:order-last">
          <Card>
            <CardContent className="p-0">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="w-full"
                classNames={{
                  day_selected: 'bg-primary text-primary-foreground hover:bg-primary/90',
                  day_today: 'bg-accent text-accent-foreground',
                }}
              />
            </CardContent>
          </Card>
        </div>

        {/* Upcoming events list */}
        <div className="lg:col-span-2 lg:row-start-1">
          <Card className="surface-card">
            <CardHeader>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <CardTitle className="text-xl">Upcoming Events</CardTitle>
                  <CardDescription>View and manage all scheduled events.</CardDescription>
                </div>
                <Button onClick={() => setIsDialogOpen(true)} className="w-full sm:w-auto">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Schedule Event
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <UpcomingEvents events={upcomingEvents} />
            </CardContent>
          </Card>
        </div>
      </div>

      <EventFormDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} onSave={handleSaveEvent} />
    </AppLayout>
  );
}
