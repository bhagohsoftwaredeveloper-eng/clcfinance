'use client';

import React, { useContext } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BarChart,
  Calendar,
  HandCoins,
  Users,
  LogOut,
  LayoutDashboard,
  CreditCard,
  Users2,
  Settings,
  Moon,
  Sun
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarTrigger,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { TitleBar } from '@/components/title-bar';
import { AuthContext } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import type { PagePermission } from '@/lib/types';

const navItems: { href: string; label: string; icon: React.ElementType, id: PagePermission }[] = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
  { href: '/members', label: 'Members', icon: Users, id: 'members' },
  { href: '/events', label: 'Events', icon: Calendar, id: 'events' },
  { href: '/donations', label: 'Giving', icon: HandCoins, id: 'donations' },
  { href: '/expenses', label: 'Expenses', icon: CreditCard, id: 'expenses' },
  { href: '/reports', label: 'Reports', icon: BarChart, id: 'reports' },
  { href: '/users', label: 'User Management', icon: Users2, id: 'users' },
  { href: '/settings', label: 'Settings', icon: Settings, id: 'settings' },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { settings, updateSettings } = useSettings();

  if (!authContext) {
    // This can happen if the component is rendered outside of the AuthProvider
    // You might want to redirect to login or show an error.
    // For now, we can prevent rendering the layout.
     if (typeof window !== 'undefined') {
      router.push('/login');
    }
    return null;
  }

  const { user, logout } = authContext;

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const handleThemeToggle = () => {
    updateSettings({
      theme: settings.theme === 'dark' ? 'light' : 'dark',
    });
  };

  const accessibleNavItems = navItems.filter(item => user?.permissions?.[item.id]);

  return (
    <>
      <SidebarProvider>
        <div className="flex h-screen w-full">
        <Sidebar className="app-layout-main border-r">
          <SidebarHeader className="border-b border-sidebar-border/60 px-4 py-4">
            <Logo />
          </SidebarHeader>
          <SidebarContent className="px-2 py-3">
            <p className="px-3 pb-2 text-[0.65rem] font-semibold uppercase tracking-wider text-muted-foreground/70">
              Menu
            </p>
            <SidebarMenu className="gap-1">
              {accessibleNavItems.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <SidebarMenuItem key={item.label}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={{ children: item.label, side: 'right', align: 'center' }}
                      className="h-10 rounded-lg font-medium transition-colors data-[active=true]:bg-primary data-[active=true]:text-primary-foreground data-[active=true]:shadow-sm"
                    >
                      <Link href={item.href}>
                        <item.icon className="size-[1.15rem]" />
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="border-t border-sidebar-border/60 p-2">
            <div className="flex items-center gap-3 rounded-lg px-2 py-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div className="flex min-w-0 flex-col text-xs leading-tight">
                <span className="truncate font-semibold text-foreground">{user?.name}</span>
                <span className="capitalize text-muted-foreground">{user?.role}</span>
              </div>
            </div>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  tooltip={{ children: "Logout", side: 'right', align: 'center' }}
                  onClick={handleLogout}
                  className="h-10 rounded-lg text-muted-foreground hover:text-destructive"
                >
                  <LogOut />
                  <span>Logout</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <main className="flex flex-1 flex-col overflow-hidden">
          <header className="app-layout-header sticky top-0 z-10 flex h-16 shrink-0 items-center justify-between gap-4 border-b bg-background/70 px-4 backdrop-blur-xl sm:px-6">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden" />
              <h2 className="text-sm font-semibold text-foreground sm:text-base">
                {accessibleNavItems.find((i) => pathname.startsWith(i.href))?.label ?? settings.appName}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleThemeToggle}
                className="size-9 rounded-full text-muted-foreground hover:text-foreground"
              >
                {settings.theme === 'dark' ? (
                  <Sun className="h-[1.15rem] w-[1.15rem]" />
                ) : (
                  <Moon className="h-[1.15rem] w-[1.15rem]" />
                )}
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </header>
          <div className="flex-1 overflow-auto">
            {/* keyed by route so only the page content re-animates, not the sidebar */}
            <div key={pathname} className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 animate-page-in">
              {children}
            </div>
          </div>
        </main>
      </div>
    </SidebarProvider>
    </>
  );
}
