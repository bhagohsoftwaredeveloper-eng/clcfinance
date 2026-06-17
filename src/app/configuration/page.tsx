'use client';

import { useContext } from 'react';
import { AppLayout } from '@/components/app-layout';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LookupManager } from '@/components/lookup-manager';
import { AuthContext } from '@/context/auth-context';

const TABS = [
  { value: 'networks', label: 'Networks', apiUrl: '/api/networks', field: 'name' as const, itemNoun: 'network' },
  { value: 'donation-categories', label: 'Donation Categories', apiUrl: '/api/donation-categories', field: 'name' as const, itemNoun: 'category' },
  { value: 'expense-categories', label: 'Expense Categories', apiUrl: '/api/expense-categories', field: 'name' as const, itemNoun: 'category' },
  { value: 'giving-types', label: 'Giving Types', apiUrl: '/api/giving-types', field: 'name' as const, itemNoun: 'giving type' },
  { value: 'service-times', label: 'Service Times', apiUrl: '/api/service-times', field: 'time' as const, itemNoun: 'service time' },
];

export default function ConfigurationPage() {
  const authContext = useContext(AuthContext);

  if (authContext?.user && !authContext.user.permissions?.settings) {
    return (
      <AppLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <p className="text-muted-foreground">You do not have permission to access this page.</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Configuration</h1>
          <p className="text-sm text-muted-foreground">
            Manage the lists used across the app — networks, categories, giving types, and service times.
          </p>
        </div>

        <Card className="surface-card">
          <CardContent className="p-4 sm:p-6">
            <Tabs defaultValue="networks" className="w-full">
              <TabsList className="mb-4 flex h-auto w-full flex-wrap justify-start gap-1">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              {TABS.map((tab) => (
                <TabsContent key={tab.value} value={tab.value} className="mt-0">
                  <LookupManager apiUrl={tab.apiUrl} field={tab.field} itemNoun={tab.itemNoun} />
                </TabsContent>
              ))}
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
