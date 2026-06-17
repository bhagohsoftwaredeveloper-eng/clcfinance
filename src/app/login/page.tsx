'use client';
import { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Church, Loader2 } from 'lucide-react';
import { AuthContext } from '@/context/auth-context';
import { useSettings } from '@/context/settings-context';
import Image from 'next/image';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const authContext = useContext(AuthContext);
  const { settings } = useSettings();

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

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background p-4">
      {/* Ambient gradient backdrop */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 left-1/2 h-[28rem] w-[28rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-chart-2/10 blur-3xl" />
      </div>
      <Card className="w-full max-w-sm border-border/60 shadow-xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center mb-4">
                {settings.logoUrl ? (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary overflow-hidden ring-1 ring-primary/15">
                    <Image
                      src={settings.logoUrl}
                      alt="Logo"
                      width={56}
                      height={56}
                      className="object-cover rounded-2xl"
                    />
                  </div>
                ) : (
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15">
                    <Church className="h-7 w-7" />
                  </div>
                )}
            </div>
          <CardTitle className="text-xl">{settings.appName}</CardTitle>
          <CardDescription>Enter your credentials to access the dashboard.</CardDescription>
        </CardHeader>
        <form onSubmit={handleLogin}>
          <CardContent className="grid gap-4">
            <div className="grid gap-2">
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
            <div className="grid gap-2">
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
            {error && <p className="text-sm text-destructive">{error}</p>}
          </CardContent>
          <CardFooter>
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
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
