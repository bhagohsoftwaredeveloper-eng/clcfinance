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
import type { Member, Donation } from '@/lib/types';

import { useMembers } from './_hooks/use-members';
import { useMemberLookups } from './_hooks/use-member-lookups';
import { MembersTable } from './_components/members-table';
import { MemberFormDialog } from './_components/member-form';
import { DonationFormDialog } from './_components/donation-form';
import { printMembers, exportMembersCSV, exportMembersPDF } from './_lib/member-export';
import { useConfirm } from '@/components/confirm-dialog';

export default function MembersPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { members, loading, saveMember, deleteMember, saveDonation } = useMembers();
  const lookups = useMemberLookups();
  const confirm = useConfirm();

  const [isClient, setIsClient] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMemberDialogOpen, setIsMemberDialogOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | null>(null);
  const [donatingMember, setDonatingMember] = useState<Member | null>(null);
  const [isDonationDialogOpen, setIsDonationDialogOpen] = useState(false);

  useEffect(() => setIsClient(true), []);

  useEffect(() => {
    if (authContext?.user && !authContext.user.permissions?.members) {
      router.push('/dashboard');
    }
  }, [authContext, router]);

  const filteredMembers = members.filter((m) =>
    m.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveMember = async (member: Member) => {
    if (await saveMember(member, !!editingMember)) {
      setIsMemberDialogOpen(false);
      setEditingMember(null);
    }
  };

  const handleSaveDonation = async (donation: Donation) => {
    if (await saveDonation(donation)) {
      setIsDonationDialogOpen(false);
      setDonatingMember(null);
    }
  };

  const handleDeleteMember = async (id: string) => {
    const member = members.find((m) => m.id === id);
    const ok = await confirm({
      title: 'Delete member?',
      description: `${member?.name ?? 'This member'} will be permanently removed. This cannot be undone.`,
      confirmText: 'Delete',
      destructive: true,
    });
    if (ok) deleteMember(id);
  };

  if (authContext?.user && !authContext.user.permissions?.members) {
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
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-4 w-64" />
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
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-4 w-20" />
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
              <CardTitle className="text-xl">Members</CardTitle>
              <CardDescription>Manage church members and their information.</CardDescription>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 sm:mr-2 sm:hidden" />
                    <span className="hidden sm:inline">Export</span>
                    <ChevronDown className="ml-1 h-4 w-4 hidden sm:inline" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => printMembers(filteredMembers)}>
                    <Printer className="mr-2 h-4 w-4" />
                    Print
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportMembersCSV(filteredMembers)}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => exportMembersPDF(filteredMembers)}>
                    <FileDown className="mr-2 h-4 w-4" />
                    Export to PDF
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button onClick={() => { setEditingMember(null); setIsMemberDialogOpen(true); }}>
                <PlusCircle className="h-4 w-4 sm:mr-2" />
                <span className="hidden sm:inline">New Member</span>
              </Button>
            </div>
          </div>
          <div className="relative mt-4">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by member name..."
              className="w-full rounded-lg bg-background pl-8 pr-4 md:w-[200px] lg:w-[320px]"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') setSearchQuery(searchInput);
              }}
            />
          </div>
        </CardHeader>
        <CardContent>
          <MembersTable
            members={filteredMembers}
            searchQuery={searchQuery}
            isClient={isClient}
            onEdit={(member) => { setEditingMember(member); setIsMemberDialogOpen(true); }}
            onDelete={handleDeleteMember}
            onAddDonation={(member) => { setDonatingMember(member); setIsDonationDialogOpen(true); }}
          />
        </CardContent>
      </Card>

      <MemberFormDialog
        open={isMemberDialogOpen}
        onOpenChange={setIsMemberDialogOpen}
        member={editingMember}
        networks={lookups.networks}
        onAddNetwork={lookups.addNetwork}
        onSave={handleSaveMember}
      />

      <DonationFormDialog
        open={isDonationDialogOpen}
        onOpenChange={setIsDonationDialogOpen}
        member={donatingMember}
        categories={lookups.categories}
        givingTypes={lookups.givingTypes}
        serviceTimes={lookups.serviceTimes}
        onAddCategory={lookups.addCategory}
        onAddGivingType={lookups.addGivingType}
        onAddServiceTime={lookups.addServiceTime}
        onSave={handleSaveDonation}
      />
    </AppLayout>
  );
}
