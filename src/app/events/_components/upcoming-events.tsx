'use client';

import { Card } from '@/components/ui/card';
import { Calendar as CalendarIcon, MapPin } from 'lucide-react';
import type { Event } from '@/lib/types';

interface UpcomingEventsProps {
  events: Event[];
}

/** Presentational list of upcoming events as date-badge cards. */
export function UpcomingEvents({ events }: UpcomingEventsProps) {
  if (events.length === 0) {
    return <p className="text-center text-muted-foreground">No upcoming events.</p>;
  }

  return (
    <>
      {events.map((event) => {
        const eventDate = new Date(event.date);
        return (
          <Card key={event.id} className="flex items-start gap-4 p-4 shadow-sm transition-shadow hover:shadow-md">
            <div className="flex flex-col items-center justify-center rounded-md bg-primary/10 px-3 py-2 text-primary">
              <div className="text-xs font-semibold uppercase">{eventDate.toLocaleString('en-US', { month: 'short' })}</div>
              <div className="text-2xl font-bold leading-none">{eventDate.getDate()}</div>
            </div>
            <div>
              <h3 className="font-semibold">{event.title}</h3>
              <p className="text-sm text-muted-foreground">{event.description}</p>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <CalendarIcon className="h-4 w-4" />
                  {eventDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                </div>
                <div className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {event.resource}
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </>
  );
}
