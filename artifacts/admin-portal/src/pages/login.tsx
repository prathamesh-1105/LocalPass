import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useLogin } from '../hooks/use-api';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Checkbox } from '../components/ui/checkbox';
import { TrainFront, Loader2 } from 'lucide-react';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const location = useLocation();
  const loginMutation = useLogin();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username || !password) {
      setError('Please enter both username and password.');
      return;
    }
    
    loginMutation.mutate(
      { username, password },
      {
        onSuccess: () => {
          navigate(from, { replace: true });
        },
        onError: (err: any) => {
          setError(err.message || 'Invalid credentials');
        }
      }
    );
  };

  return (
    <div className="min-h-[100dvh] w-full grid lg:grid-cols-2">
      {/* Brand Panel */}
      <div className="hidden lg:flex flex-col bg-slate-900 text-white p-12 justify-between relative overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-400 via-slate-900 to-slate-900"></div>
        <div className="absolute top-0 right-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1541819580479-7a70a8d3e23b?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
        
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500 text-white shadow-lg">
            <TrainFront className="h-6 w-6" />
          </div>
          <span className="text-2xl font-bold tracking-tight">LocalOne</span>
        </div>
        
        <div className="relative z-10 max-w-lg mt-auto pb-12">
          <h1 className="text-4xl font-bold tracking-tight leading-tight mb-6">
            Streamline college railway concessions.
          </h1>
          <p className="text-slate-300 text-lg">
            A unified administrative portal to verify, approve, and track student applications with enterprise-grade speed and reliability.
          </p>
        </div>
      </div>

      {/* Login Form */}
      <div className="flex flex-col items-center justify-center p-8 bg-background sm:p-12 lg:p-24 relative">
        <div className="w-full max-w-sm space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          <div className="flex flex-col space-y-2 text-center lg:text-left">
            <div className="lg:hidden flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
                <TrainFront className="h-7 w-7" />
              </div>
            </div>
            <h2 className="text-3xl font-bold tracking-tight">Welcome back</h2>
            <p className="text-muted-foreground text-sm">
              Enter your credentials to access the admin portal
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-3 text-sm text-destructive-foreground bg-destructive/90 rounded-md shadow-sm font-medium animate-in fade-in zoom-in-95 duration-200">
                {error}
              </div>
            )}
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input 
                  id="username" 
                  placeholder="admin" 
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={loginMutation.isPending}
                  className="h-11"
                  autoComplete="username"
                  autoFocus
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline underline-offset-4">
                    Forgot password?
                  </a>
                </div>
                <Input 
                  id="password" 
                  type="password" 
                  placeholder="••••••••" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loginMutation.isPending}
                  className="h-11"
                  autoComplete="current-password"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox id="remember" disabled={loginMutation.isPending} />
              <Label htmlFor="remember" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                Remember me for 30 days
              </Label>
            </div>
            
            <Button 
              type="submit" 
              className="w-full h-11 text-base font-medium shadow-md" 
              disabled={loginMutation.isPending}
            >
              {loginMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In'
              )}
            </Button>
          </form>
          
          <div className="text-center text-xs text-muted-foreground pt-4 border-t">
            Demo credentials: <span className="font-semibold text-foreground">admin</span> / <span className="font-semibold text-foreground">admin123</span>
          </div>
        </div>
      </div>
    </div>
  );
}
