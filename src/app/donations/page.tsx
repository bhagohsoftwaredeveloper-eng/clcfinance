'use client';

import { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PlusCircle, Search, ChevronDown, FileDown, Printer, Download } from 'lucide-react';
import type { Donation } from '@/lib/types';

import { useDonations } from './_hooks/use-donations';
import { useDonationLookups } from './_hooks/use-donation-lookups';
import { DonationsTable } from './_components/donations-table';
import { DonationFormDialog } from './_components/donation-form';
import { printDonations, exportDonationsCSV, exportDonationsPDF } from './_lib/donation-export';
import { useConfirm } from '@/components/confirm-dialog';

export default function DonationsPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { donations, members, loading, saveDonation, deleteDonation } = useDonations();
  const lookups = useDonationLookups();
  const confirm = useConfirm();

  const handleDeleteDonation = async (id: string) => {
    const donation = donations.find((d) => d.id === id);
    const ok = await confirm({
      title: 'Delete giving record?',
      description: `${donation ? `₱${donation.amount.toFixed(2)} from ${donation.donorName}` : 'This record'} will be permanently removed. This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) deleteDonation(id);
  };

  const [isClient, setIsClient] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.donations) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  const filteredDonations = donations.filter((d) =>
    d.donorName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const closeDialog = (open: boolean) => {
    setIsDialogOpen(open);
    if (!open) setEditingDonation(null);
  };

  const handleSaveDonation = async (donation: Donation) => {
    if (await saveDonation(donation, !!editingDonation)) {
      closeDialog(false);
    }
  };

  if (authContext?.user && !authContext.user.permissions?.donations) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>You do not have permission to access this page.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <AppLayout>
        <Card className="surface-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-16" />
                <Skeleton className="h-4 w-48" />
              </div>
              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-24" />
                <Skeleton className="h-10 w-32" />
              </div>
            </div>
            <div className="relative mt-4">
              <Skeleton className="h-10 w-full md:w-[200px] lg:w-[320px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-6 w-24" />
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Card className="surface-card">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-xl">Giving</CardTitle>
              <CardDescription>Track all financial contributions.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 sm:hidden" />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown className="ml-1 h-4 w-4 hidden sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => printDonations(filteredDonations)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportDonationsCSV(filteredDonations)}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportDonationsPDF(filteredDonations)}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => { setEditingDonation(null); setIsDialogOpen(true); }}>
                <PlusCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">Record Giving</span>
              </Button>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by donor name..."
              className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <DonationsTable
            donations={filteredDonations}
            givingTypes={lookups.givingTypes}
            isClient={isClient}
            isAdmin={authContext?.user?.role === 'Admin'}
            onEdit={(donation) => { setEditingDonation(donation); setIsDialogOpen(true); }}
            onDelete={handleDeleteDonation}
          />
        </CardContent>
      </Card>

      <DonationFormDialog
        open={isDialogOpen}
        onOpenChange={closeDialog}
        donation={editingDonation}
        members={members}
        networks={lookups.networks}
        givingTypes={lookups.givingTypes}
        serviceTimes={lookups.serviceTimes}
        userId={authContext?.user?.id || ''}
        onAddNetwork={lookups.addNetwork}
        onAddGivingType={lookups.addGivingType}
        onAddServiceTime={lookups.addServiceTime}
        onSave={handleSaveDonation}
      />
    </AppLayout>
  );
}
