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
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { QuickSelect, type QuickSelectOption } from '@/components/ui/quick-select';
import { useToast } from '@/hooks/use-toast';
import type { Donation, Member } from '@/lib/types';

interface DonationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The donation being edited, or null when recording a new one. */
  donation: Donation | null;
  members: Member[];
  categories: Array<{ id: string; name: string }>;
  givingTypes: Array<{ id: string; name: string }>;
  serviceTimes: Array<{ id: string; time: string }>;
  userId: string;
  onAddCategory: (name: string) => Promise<QuickSelectOption | null>;
  onAddGivingType: (name: string) => Promise<QuickSelectOption | null>;
  onAddServiceTime: (name: string) => Promise<QuickSelectOption | null>;
  onSave: (donation: Donation) => void;
}

/** The right-drawer for recording / editing a giving record. */
export function DonationFormDialog({ open, onOpenChange, donation, ...rest }: DonationFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{donation ? 'Edit Giving' : 'Record a New Giving'}</DialogTitle>
          <DialogDescription>
            {donation ? 'Update the giving details.' : 'Fill in the details to record a new contribution.'}
          </DialogDescription>
        </DialogHeader>
        <DonationForm
          key={donation?.id ?? 'new'}
          donation={donation}
          onCancel={() => onOpenChange(false)}
          {...rest}
        />
      </DialogContent>
    </Dialog>
  );
}

function DonationForm({
  donation,
  members,
  categories,
  givingTypes,
  serviceTimes,
  userId,
  onAddCategory,
  onAddGivingType,
  onAddServiceTime,
  onSave,
  onCancel,
}: Omit<DonationFormDialogProps, 'open' | 'onOpenChange'> & { onCancel: () => void }) {
  const [memberId, setMemberId] = useState(donation?.memberId || '');
  const [amount, setAmount] = useState<number | string>(donation?.amount || '');
  const [category, setCategory] = useState<Donation['category']>(donation?.category || 'Tithe');
  const [givingTypeId, setGivingTypeId] = useState(donation?.givingTypeId || '');
  const [serviceTime, setServiceTime] = useState(donation?.serviceTime || '');
  const [hasReference, setHasReference] = useState(!!donation?.reference);
  const [reference, setReference] = useState(donation?.reference || '');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const donor = members.find((m) => m.id === memberId);
    if (!donor || !amount || !category) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please select a donor, amount, and category.' });
      return;
    }
    const donationData: Donation = {
      id: donation?.id || `d${Date.now()}`,
      donorName: donor.name,
      memberId,
      amount: Number(amount),
      date: donation?.date || new Date().toISOString().split('T')[0],
      category,
      givingTypeId,
      serviceTime,
      recordedById: donation?.recordedById || userId,
      reference: hasReference ? reference : undefined,
    };
    onSave(donationData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 py-4">
        <div className="space-y-2">
          <Label htmlFor="donor">Donor</Label>
          <Select onValueChange={setMemberId} value={memberId}>
            <SelectTrigger id="donor">
              <SelectValue placeholder="Select a donor" />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>{member.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Amount</Label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-muted-foreground">₱</span>
            <Input id="amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="pl-7" placeholder="0.00" />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <QuickSelect
            id="category"
            value={category}
            onValueChange={(value) => setCategory(value as Donation['category'])}
            options={categories.map((c) => ({ value: c.name, label: c.name }))}
            placeholder="Select a category"
            addLabel="Add category"
            onAdd={onAddCategory}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="giving-type">Giving Type</Label>
          <QuickSelect
            id="giving-type"
            value={givingTypeId}
            onValueChange={setGivingTypeId}
            options={givingTypes.map((t) => ({ value: t.id, label: t.name }))}
            placeholder="Select a giving type"
            addLabel="Add giving type"
            onAdd={onAddGivingType}
          />
        </div>
        <div className="flex items-center justify-between rounded-lg border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="has-reference">Reference</Label>
            <p className="text-xs text-muted-foreground">Attach a reference number</p>
          </div>
          <Switch
            id="has-reference"
            checked={hasReference}
            onCheckedChange={(checked) => {
              setHasReference(checked);
              if (!checked) setReference('');
            }}
          />
        </div>
        {hasReference && (
          <div className="space-y-2">
            <Label htmlFor="reference">Reference details</Label>
            <Input id="reference" value={reference} onChange={(e) => setReference(e.target.value)} placeholder="Enter reference number or details" />
          </div>
        )}
        <div className="space-y-2">
          <Label htmlFor="service-time">Service Time</Label>
          <QuickSelect
            id="service-time"
            value={serviceTime}
            onValueChange={setServiceTime}
            options={serviceTimes.map((t) => ({ value: t.time, label: t.time }))}
            placeholder="Select a service time"
            addLabel="Add service time"
            onAdd={onAddServiceTime}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">{donation ? 'Update Giving' : 'Record Giving'}</Button>
      </DialogFooter>
    </form>
  );
}
