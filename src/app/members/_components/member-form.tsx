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
import { QuickSelect, type QuickSelectOption } from '@/components/ui/quick-select';
import { useToast } from '@/hooks/use-toast';
import type { Member } from '@/lib/types';

interface MemberFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** The member being edited, or null when creating a new one. */
  member: Member | null;
  networks: Array<{ id: string; name: string }>;
  onAddNetwork: (name: string) => Promise<QuickSelectOption | null>;
  onSave: (member: Member) => void;
}

/** The right-drawer for creating / editing a member. */
export function MemberFormDialog({ open, onOpenChange, member, networks, onAddNetwork, onSave }: MemberFormDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{member ? 'Edit Member' : 'New Member'}</DialogTitle>
          <DialogDescription>
            {member ? "Update the member's details." : 'Add a new member to the directory.'}
          </DialogDescription>
        </DialogHeader>
        {/* keyed so the form resets when switching between members */}
        <MemberForm
          key={member?.id ?? 'new'}
          member={member}
          networks={networks}
          onAddNetwork={onAddNetwork}
          onSave={onSave}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

function MemberForm({
  member,
  networks,
  onAddNetwork,
  onSave,
  onCancel,
}: {
  member: Member | null;
  networks: Array<{ id: string; name: string }>;
  onAddNetwork: (name: string) => Promise<QuickSelectOption | null>;
  onSave: (member: Member) => void;
  onCancel: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<Member>>(
    member || { name: '', email: '', phone: '', address: '', network: 'Main' }
  );

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.network) {
      toast({ variant: 'destructive', title: 'Missing fields', description: 'Please fill in the name and network.' });
      return;
    }
    const newMember: Member = {
      id: member?.id || `m${Date.now()}`,
      joinDate: member?.joinDate || new Date().toISOString().split('T')[0],
      avatarUrl: member?.avatarUrl || '',
      email: formData.email || '',
      phone: formData.phone || '',
      address: formData.address || '',
      ...formData,
    } as Member;
    onSave(newMember);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-5 py-4">
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={formData.name || ''} onChange={handleChange} placeholder="Full name" />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="name@email.com" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="phone">Phone</Label>
            <Input id="phone" name="phone" value={formData.phone || ''} onChange={handleChange} placeholder="+63..." />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" value={formData.address || ''} onChange={handleChange} placeholder="Street, city" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="network">Network</Label>
          <QuickSelect
            id="network"
            value={formData.network}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, network: value }))}
            options={networks.map((n) => ({ value: n.name, label: n.name }))}
            placeholder="Select a network"
            addLabel="Add network"
            onAdd={onAddNetwork}
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>Cancel</Button>
        <Button type="submit">Save</Button>
      </DialogFooter>
    </form>
  );
}
