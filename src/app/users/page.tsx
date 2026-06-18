'use client';

import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AppLayout } from '@/components/app-layout';
import { AuthContext } from '@/context/auth-context';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Search } from 'lucide-react';
import type { User } from '@/lib/types';

import { useUsers } from './_hooks/use-users';
import { UsersTable } from './_components/users-table';
import { UserFormDialog } from './_components/user-form';
import { SystemReset } from './_components/system-reset';

export default function UsersPage() {
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { users, loading, saveUser, deleteUser, resetSystem } = useUsers();

  const [searchQuery, setSearchQuery] = useState('');
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  const hasPermission = authContext?.user?.permissions?.users;
  const isAdmin = authContext?.user?.role === 'Admin';

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSaveUser = async (user: User) => {
    if (await saveUser(user, !!editingUser)) {
      setIsUserDialogOpen(false);
      setEditingUser(null);
    }
  };

  if (loading) {
    return (
      <AppLayout>
        <Card className="surface-card">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
              </div>
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="relative mt-4">
              <Skeleton className="h-10 w-full md:w-[200px] lg:w-[320px]" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-16" />
                  <Skeleton className="h-8 w-8" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
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
      <div className="space-y-6">
        <Card className="surface-card">
          <CardHeader>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle className="text-xl">User Management</CardTitle>
                <CardDescription>Manage system users and their roles.</CardDescription>
              </div>
              <Button onClick={() => { setEditingUser(null); setIsUserDialogOpen(true); }}>
                <PlusCircle className="mr-2 h-4 w-4" />
                New User
              </Button>
            </div>
            <div className="relative mt-4">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search by name or username..."
                className="w-full rounded-lg bg-background pl-8 md:w-[200px] lg:w-[320px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <UsersTable
              users={filteredUsers}
              onEdit={(user) => { setEditingUser(user); setIsUserDialogOpen(true); }}
              onDelete={deleteUser}
            />
          </CardContent>
        </Card>

        {isAdmin && authContext?.user && (
          <SystemReset
            onReset={() => resetSystem({ id: authContext.user!.id, name: authContext.user!.name, role: authContext.user!.role })}
            onResetComplete={() => router.push('/dashboard')}
          />
        )}
      </div>

      <UserFormDialog
        open={isUserDialogOpen}
        onOpenChange={setIsUserDialogOpen}
        user={editingUser}
        onSave={handleSaveUser}
      />
    </AppLayout>
  );
}
