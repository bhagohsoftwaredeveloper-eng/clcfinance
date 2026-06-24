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
  SlidersHorizontal,
  Moon,
  Sun,
  Menu,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarFooter,
  useSidebar,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/logo';
import { AuthContext } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import { cn } from '@/lib/utils';
import type { PagePermission } from '@/lib/types';

type NavItem = {
  href: string;
  label: string;
  mobileLabel: string;
  icon: React.ElementType;
  id: PagePermission;
};

const navItems: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard',        mobileLabel: 'Home',     icon: LayoutDashboard, id: 'dashboard' },
  { href: '/members',   label: 'Members',           mobileLabel: 'Members',  icon: Users,           id: 'members'   },
  { href: '/events',    label: 'Events',             mobileLabel: 'Events',   icon: Calendar,        id: 'events'    },
  { href: '/donations', label: 'Giving',             mobileLabel: 'Giving',   icon: HandCoins,       id: 'donations' },
  { href: '/expenses',  label: 'Expenses',           mobileLabel: 'Expenses', icon: CreditCard,      id: 'expenses'  },
  { href: '/reports',   label: 'Reports',            mobileLabel: 'Reports',  icon: BarChart,        id: 'reports'   },
  { href: '/users',     label: 'User Management',    mobileLabel: 'Users',    icon: Users2,          id: 'users'     },
  { href: '/configuration', label: 'Configuration', mobileLabel: 'Config',   icon: SlidersHorizontal, id: 'settings' },
  { href: '/settings',  label: 'Settings',           mobileLabel: 'Settings', icon: Settings,        id: 'settings'  },
];

// Bottom nav — shows up to 4 primary shortcuts + a "More" button that opens the sidebar sheet.
function MobileBottomNav({
  navItems: items,
  pathname,
}: {
  navItems: NavItem[];
  pathname: string;
}) {
  const { toggleSidebar } = useSidebar();
  const primaryItems = items.slice(0, 4);
  const hasMore = items.length > 4;

  return (
    <nav className="mobile-bottom-nav fixed bottom-0 left-0 right-0 z-50 flex items-stretch border-t bg-background/95 backdrop-blur-xl md:hidden">
      {primaryItems.map((item) => {
        const isActive = pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2 transition-colors',
              isActive ? 'text-primary' : 'text-muted-foreground',
            )}
          >
            {isActive && (
              <span className="absolute top-0 h-0.5 w-8 rounded-full bg-primary" />
            )}
            <item.icon className="size-5 shrink-0" />
            <span className="text-[10px] font-medium leading-none">{item.mobileLabel}</span>
          </Link>
        );
      })}
      {hasMore && (
        <button
          onClick={toggleSidebar}
          className="flex flex-1 flex-col items-center justify-center gap-1 py-2 text-muted-foreground transition-colors"
        >
          <Menu className="size-5 shrink-0" />
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      )}
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { settings, updateSettings } = useSettings();

  if (!authContext) {
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
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const accessibleNavItems = navItems.filter(item => user?.permissions?.[item.id]);
  const currentPage = accessibleNavItems.find((i) => pathname.startsWith(i.href));

  return (
    <SidebarProvider>
      <div className="flex h-screen w-full">
        {/* ── Desktop / mobile-sheet sidebar ── */}
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
                  tooltip={{ children: 'Logout', side: 'right', align: 'center' }}
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

        {/* ── Main content area ── */}
        <main className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile-optimised top header */}
          <header className="app-layout-header sticky top-0 z-10 flex h-14 shrink-0 items-center justify-between gap-3 border-b bg-background/80 px-4 backdrop-blur-xl sm:h-16 sm:px-6">
            {/* Left: logo pill on mobile, page title on desktop */}
            <div className="flex min-w-0 items-center gap-2">
              <span className="block md:hidden">
                <Logo compact />
              </span>
              <div className="hidden flex-col md:flex">
                <h2 className="truncate text-sm font-semibold text-foreground sm:text-base">
                  {currentPage?.label ?? settings.appName}
                </h2>
              </div>
            </div>

            {/* Centre: breadcrumb page title on mobile */}
            <div className="flex min-w-0 flex-1 items-center justify-center md:hidden">
              <span className="truncate text-sm font-semibold text-foreground">
                {currentPage?.label ?? settings.appName}
              </span>
            </div>

            {/* Right: theme toggle */}
            <div className="flex shrink-0 items-center gap-1">
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

          {/* Scrollable page body — leaves room for bottom nav on mobile */}
          <div className="mobile-scroll-area flex-1 overflow-auto">
            <div
              key={pathname}
              className="mx-auto w-full max-w-7xl animate-page-in p-3 sm:p-6 lg:p-8"
            >
              {children}
            </div>
          </div>
        </main>
      </div>

      {/* Mobile bottom navigation (hidden on md+) */}
      <MobileBottomNav navItems={accessibleNavItems} pathname={pathname} />
    </SidebarProvider>
  );
}
