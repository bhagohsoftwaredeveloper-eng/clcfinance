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
import { QuickSelect, type QuickSelectOption } from '@/components/ui/quick-select';
import { useToast } from '@/hooks/use-toast';
import type { Member, Donation } from '@/lib/types';

interface DonationFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The member the donation is being recorded for. */
  member: Member | null;
  categories: Array<{ id: string; name: string }>;
  givingTypes: Array<{ id: string; name: string }>;
  serviceTimes: Array<{ id: string; time: string }>;
  onAddCategory: (name: string) => Promise<QuickSelectOption | null>;
  onAddGivingType: (name: string) => Promise<QuickSelectOption | null>;
  onAddServiceTime: (name: string) => Promise<QuickSelectOption | null>;
  onSave: (donation: Donation) => void;
}

/** The right-drawer for recording a member's giving. */
export function DonationFormDialog({
  open,
  onOpenChange,
  member,
  categories,
  givingTypes,
  serviceTimes,
  onAddCategory,
  onAddGivingType,
  onAddServiceTime,
  onSave,
}: DonationFormDialogProps) {
  if (!member) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Giving</DialogTitle>
          <DialogDescription>Record a new contribution for {member.name}.</DialogDescription>
        </DialogHeader>
        <DonationForm
          key={member.id}
          member={member}
          categories={categories}
          givingTypes={givingTypes}
          serviceTimes={serviceTimes}
          onAddCategory={onAddCategory}
          onAddGivingType={onAddGivingType}
          onAddServiceTime={onAddServiceTime}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function DonationForm({
  member,
  categories,
  givingTypes,
  serviceTimes,
  onAddCategory,
  onAddGivingType,
  onAddServiceTime,
  onSave,
  onCancel,
}: {
  member: Member;
  categories: Array<{ id: string; name: string }>;
  givingTypes: Array<{ id: string; name: string }>;
  serviceTimes: Array<{ id: string; time: string }>;
  onAddCategory: (name: string) => Promise<QuickSelectOption | null>;
  onAddGivingType: (name: string) => Promise<QuickSelectOption | null>;
  onAddServiceTime: (name: string) => Promise<QuickSelectOption | null>;
  onSave: (donation: Donation) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [amount, setAmount] = useState<number | string>('');
  const [categoryId, setCategoryId] = useState<string>();
  const [serviceTimeId, setServiceTimeId] = useState<string>();
  const [givingTypeId, setGivingTypeId] = useState<string>();
  const [hasReference, setHasReference] = useState(false);
  const [reference, setReference] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!member || !amount || !categoryId) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please enter an amount and select a category.' });
      return;
    }
    const selectedCategory = categories.find((c) => c.id === categoryId);
    const selectedServiceTime = serviceTimes.find((t) => t.id === serviceTimeId);
    const newDonation: Donation = {
      id: `d${Date.now()}`,
      donorName: member.name,
      memberId: member.id,
      amount: Number(amount),
      date: new Date().toISOString().split('T')[0],
      category: selectedCategory?.name as Donation['category'],
      serviceTime: selectedServiceTime?.time,
      givingTypeId,
      reference: hasReference ? reference : undefined,
    };
    onSave(newDonation);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 py-4">
        <div className="space-y-2">
          <Label htmlFor="donor">Donor</Label>
          <Input id="donor" name="name" value={member.name || ''} readOnly className="bg-muted/50" />
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
            value={categoryId}
            onValueChange={setCategoryId}
            options={categories.map((c) => ({ value: c.id, label: c.name }))}
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
            value={serviceTimeId}
            onValueChange={setServiceTimeId}
            options={serviceTimes.map((t) => ({ value: t.id, label: t.time }))}
            placeholder="Select a service time"
            addLabel="Add service time"
            onAdd={onAddServiceTime}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Record Giving</Button>
      </DialogFooter>
    </form>
  );
}
