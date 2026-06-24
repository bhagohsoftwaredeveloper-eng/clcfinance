'use client';
import { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Skeleton } from '@/components/ui/skeleton';
import { Church, Loader2, Quote } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import Image from 'next/image';

type Verse = { text: string; reference: string };

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [verse, setVerse] = useState<Verse | null>(null);
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { settings } = useSettings();

  useEffect(() => {
    fetch('/api/verse', { cache: 'no-store' })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setVerse(data))
      .catch(() => {});
  }, []);

  if (!authContext) {
    throw new Error('AuthContext must be used within an AuthProvider');
  }

  const { login } = authContext;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (response.ok) {
        const user = await response.json();
        login(user);
        if (user.permissions?.dashboard) {
          router.push('/dashboard');
        } else if (user.permissions?.members) {
          router.push('/members');
        } else {
          const firstAvailablePage = ['members', 'events', 'donations', 'expenses', 'reports', 'users'].find(
            (page) => user.permissions?.[page],
          );
          router.push(`/${firstAvailablePage || 'login'}`);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid username or password.');
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const logoImg = settings.logoUrl ? (
    <Image src={settings.logoUrl} alt="Logo" width={56} height={56} className="rounded-2xl object-cover" />
  ) : (
    <Church className="h-7 w-7" />
  );

  const verseBlock = (dark: boolean) =>
    verse ? (
      <figure className="animate-page-in">
        <blockquote className={`font-medium leading-relaxed ${dark ? 'text-white/95' : 'text-foreground'}`}>
          &ldquo;{verse.text}&rdquo;
        </blockquote>
        <figcaption className={`mt-3 text-xs font-semibold uppercase tracking-wider ${dark ? 'text-white/60' : 'text-muted-foreground'}`}>
          — {verse.reference}
        </figcaption>
      </figure>
    ) : (
      <div className="space-y-2">
        <Skeleton className={`h-4 w-full ${dark ? 'bg-white/20' : ''}`} />
        <Skeleton className={`h-4 w-5/6 ${dark ? 'bg-white/20' : ''}`} />
        <Skeleton className={`h-4 w-3/5 ${dark ? 'bg-white/20' : ''}`} />
      </div>
    );

  return (
    <div className="relative flex min-h-screen w-full flex-col lg:flex-row">

      {/* ── Desktop-only: Left brand + verse panel ───────────────────────── */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-emerald-900 p-12 text-white lg:flex">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-black/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
            {logoImg}
          </div>
          <span className="text-lg font-bold tracking-tight">{settings.appName}</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Quote className="mb-5 h-9 w-9 text-white/40" />
          <div className="text-2xl">{verseBlock(true)}</div>
          <p className="mt-6 text-xs uppercase tracking-widest text-white/50">A verse for you</p>
        </div>

        <p className="relative z-10 text-sm text-white/60">Christian Life Center Finances Management</p>
      </div>

      {/* ── Mobile: gradient hero (hidden on lg) ─────────────────────────── */}
      <div className="relative flex flex-col items-center overflow-hidden bg-gradient-to-br from-primary to-emerald-900 px-6 pb-16 pt-14 text-white lg:hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-10 -top-10 h-52 w-52 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-black/20 blur-3xl" />
        </div>

        {/* Logo */}
        <div className="relative z-10 mb-3 flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
          {logoImg}
        </div>
        <h1 className="relative z-10 text-base font-bold tracking-tight">{settings.appName}</h1>
        <p className="relative z-10 mt-0.5 text-xs text-white/60">Finance Suite</p>

        {/* Verse of the day */}
        <div className="relative z-10 mt-6 w-full max-w-sm">
          <div className="flex items-start gap-2">
            <Quote className="mt-0.5 h-5 w-5 shrink-0 text-white/40" />
            <div className="text-sm">{verseBlock(true)}</div>
          </div>
          <p className="mt-4 text-[10px] uppercase tracking-widest text-white/50">Verse of the Day</p>
        </div>
      </div>

      {/* ── Form card — slides up over hero on mobile, fills right half on desktop ── */}
      <div className="relative z-10 -mt-6 flex flex-1 flex-col items-center rounded-t-3xl bg-background px-6 pb-10 pt-8 shadow-[0_-4px_24px_rgba(0,0,0,0.12)] lg:mt-0 lg:w-1/2 lg:justify-center lg:rounded-none lg:shadow-none lg:py-12">
        <div className="w-full max-w-sm">

          {/* Desktop heading only */}
          <div className="mb-8 hidden lg:block">
            <h2 className="text-2xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to access the dashboard.</p>
          </div>

          {/* Mobile heading */}
          <div className="mb-6 lg:hidden">
            <h2 className="text-xl font-bold tracking-tight">Welcome back</h2>
            <p className="mt-1 text-sm text-muted-foreground">Sign in to continue</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                required
                value={password}
                placeholder="Password"
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            {error && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
            )}
            <Button className="w-full" type="submit" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing In…
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-xs text-muted-foreground lg:hidden">
            Christian Life Center Finances Management
          </p>
          <p className="mt-2 text-center text-xs text-muted-foreground/60">
            &copy; BHAGOH 2026. All rights reserved.
          </p>
        </div>
      </div>

      {/* Desktop copyright */}
      <div className="absolute bottom-4 right-6 hidden lg:block">
        <p className="text-xs text-muted-foreground/50">&copy; BHAGOH 2026. All rights reserved.</p>
      </div>
    </div>
  );
}
