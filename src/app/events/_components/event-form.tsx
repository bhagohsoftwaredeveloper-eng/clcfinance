'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { Event } from '@/lib/types';

interface EventFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (event: Event) => void;
}

/** The right-drawer for scheduling a new event. */
export function EventFormDialog({ open, onOpenChange, onSave }: EventFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Schedule a New Event</DialogTitle>
          <DialogDescription>Fill in the details below to add a new event to the calendar.</DialogDescription>
        </DialogHeader>
        <EventForm onSave={onSave} onCancel={() => onOpenChange(false)} />
      </DialogContent>
    </Dialog>
  );
}

function EventForm({ onSave, onCancel }: { onSave: (event: Event) => void; onCancel: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState<Date | undefined>();
  const [resource, setResource] = useState<Event['resource']>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !date || !resource) {
      alert('Please fill all required fields');
      return;
    }
    onSave({
      id: `e${Date.now()}`,
      title,
      description,
      date: date.toISOString(),
      resource,
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Title</Label>
          <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Event title" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" onChange={(e) => setDate(new Date(e.target.value))} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resource">Resource</Label>
            <Select onValueChange={(value: Event['resource']) => setResource(value)}>
              <SelectTrigger id="resource">
                <SelectValue placeholder="Select a resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Main Hall">Main Hall</SelectItem>
                <SelectItem value="Community Room">Community Room</SelectItem>
                <SelectItem value="Chapel">Chapel</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Details about the event" rows={3} />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Schedule Event</Button>
      </DialogFooter>
    </form>
  );
}
