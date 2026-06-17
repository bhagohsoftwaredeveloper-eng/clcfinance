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
    // no-store so a fresh random verse loads each visit
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
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const user = await response.json();
        login(user);
        // Redirect based on permissions
        if (user.permissions?.dashboard) {
          router.push('/dashboard');
        } else if (user.permissions?.members) {
          router.push('/members');
        } else {
          // Fallback to first available page
          const firstAvailablePage = ['members', 'events', 'donations', 'expenses', 'reports', 'users'].find(page => user.permissions?.[page]);
          router.push(`/${firstAvailablePage || 'login'}`);
        }
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Invalid username or password.');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please try again.');
      setIsLoading(false);
    }
  };

  const logo = settings.logoUrl ? (
    <Image src={settings.logoUrl} alt="Logo" width={56} height={56} className="rounded-2xl object-cover" />
  ) : (
    <Church className="h-7 w-7" />
  );

  return (
    <div className="flex min-h-screen w-full">
      {/* Left brand + verse panel */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-primary to-emerald-900 p-12 text-white lg:flex">
        {/* decorative glows */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-black/20 blur-3xl" />
        </div>

        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/15 ring-1 ring-white/20">
            {logo}
          </div>
          <span className="text-lg font-bold tracking-tight">{settings.appName}</span>
        </div>

        <div className="relative z-10 max-w-md">
          <Quote className="mb-5 h-9 w-9 text-white/40" />
          {verse ? (
            <figure className="animate-page-in">
              <blockquote className="text-2xl font-medium leading-relaxed text-white/95">
                {verse.text}
              </blockquote>
              <figcaption className="mt-5 text-sm font-semibold uppercase tracking-wider text-white/70">
                — {verse.reference}
              </figcaption>
            </figure>
          ) : (
            <div className="space-y-3">
              <Skeleton className="h-6 w-full bg-white/20" />
              <Skeleton className="h-6 w-5/6 bg-white/20" />
              <Skeleton className="h-6 w-2/3 bg-white/20" />
            </div>
          )}
          <p className="mt-6 text-xs uppercase tracking-widest text-white/50">A verse for you</p>
        </div>

        <p className="relative z-10 text-sm text-white/60">
          Church Life &amp; Community Finances Management
        </p>
      </div>

      {/* Right login panel */}
      <div className="flex w-full flex-col items-center justify-center bg-background px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* mobile logo (left panel hidden) */}
          <div className="mb-8 flex flex-col items-center text-center lg:hidden">
            <div className="mb-3 flex h-14 w-14 items-center justify-center overflow-hidden rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
              {logo}
            </div>
            <h1 className="text-xl font-bold">{settings.appName}</h1>
          </div>

          <div className="mb-8 hidden lg:block">
            <h1 className="text-2xl font-bold tracking-tight">Welcome back</h1>
            <p className="mt-1 text-sm text-muted-foreground">Enter your credentials to access the dashboard.</p>
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
                  Signing In...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
