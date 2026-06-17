'use client';
import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { AuthContext } from '@/context/auth-context';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Calendar as CalendarIcon, MapPin } from 'lucide-react';
import type { Event } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const EventForm = ({ onSave, onCancel }: { onSave: (event: Event) => void, onCancel: () => void }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [resource, setResource] = useState<'Main Hall' | 'Community Room' | 'Chapel'>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !resource) {
      alert('Please fill all required fields');
      return;
    }
    const newEvent: Event = {
      id: `e${Date.now()}`,
      title,
      description,
      date: date.toISOString(),
      resource,
    };
    onSave(newEvent);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-4 py-4">
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="title" className="text-right">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="date" className="text-right">Date</Label>
          <Input id="date" type="date" onChange={(e) => setDate(new Date(e.target.value))} className="col-span-3" />
        </div>
        <div className="grid grid-cols-4 items-center gap-4">
          <Label htmlFor="resource" className="text-right">Resource</Label>
          <Select onValueChange={(value: Event['resource']) => setResource(value)}>
            <SelectTrigger className="col-span-3">
              <SelectValue placeholder="Select a resource" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Main Hall">Main Hall</SelectItem>
              <SelectItem value="Community Room">Community Room</SelectItem>
              <SelectItem value="Chapel">Chapel</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-4 items-start gap-4">
          <Label htmlFor="description" className="text-right pt-2">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} className="col-span-3" />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Schedule Event</Button>
      </DialogFooter>
    </form>
  );
};


export default function EventsPage() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<Event[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const authContext = useContext(AuthContext);
  const router = useRouter();

  // Check permissions
  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.events) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  const hasPermission = authContext?.user?.permissions?.events;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('/api/events');
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error('Failed to fetch events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Include events from the start of today onward
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const upcomingEvents = events
    .filter(event => new Date(event.date) >= startOfToday)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  const handleSaveEvent = async (event: Event) => {
    try {
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      if (response.ok) {
        fetchEvents();
        setIsDialogOpen(false);
        toast({
          title: "Event Scheduled",
          description: `${event.title} has been added to the calendar.`,
        });
      } else {
        const data = await response.json().catch(() => ({}));
        toast({
          variant: 'destructive',
          title: 'Could not schedule event',
          description: data.error || 'Please try again.',
        });
      }
    } catch (error) {
      console.error('Error scheduling event:', error);
      toast({
        variant: 'destructive',
        title: 'Error scheduling event',
        description: 'A network or server error occurred.',
      });
    }
  };


  if (loading) {
    return (
      <AppLayout>
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
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
                      <div className="flex items-center gap-4">
                        <Skeleton className="h-4 w-20" />
                        <Skeleton className="h-4 w-24" />
                      </div>
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

  return (
    <AppLayout>
      {hasPermission ? (
        <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card className="surface-card">
              <CardHeader>
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <CardTitle className="text-xl">Upcoming Events</CardTitle>
                    <CardDescription>View and manage all scheduled events.</CardDescription>
                  </div>
                  <Button onClick={() => setIsDialogOpen(true)}>
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Schedule Event
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {upcomingEvents.length > 0 ? (
                  upcomingEvents.map((event) => {
                    const eventDate = new Date(event.date);
                    return (
                    <Card key={event.id} className="flex items-start gap-4 p-4 shadow-sm transition-shadow hover:shadow-md">
                      <div className="flex flex-col items-center justify-center rounded-md bg-primary/10 px-3 py-2 text-primary">
                        <div className="text-xs font-semibold uppercase">
                          {eventDate.toLocaleString('en-US', { month: 'short' })}
                        </div>
                        <div className="text-2xl font-bold leading-none">
                          {eventDate.getDate()}
                        </div>
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
                  })
                ) : (
                  <p className="text-center text-muted-foreground">No upcoming events.</p>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardContent className="p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="w-full"
                  classNames={{
                    day_selected: "bg-primary text-primary-foreground hover:bg-primary/90",
                    day_today: "bg-accent text-accent-foreground",
                  }}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-full">
          <p>You do not have permission to access this page.</p>
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Schedule a New Event</DialogTitle>
            <DialogDescription>
              Fill in the details below to add a new event to the calendar.
            </DialogDescription>
          </DialogHeader>
          <EventForm onSave={handleSaveEvent} onCancel={() => setIsDialogOpen(false)} />
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}
