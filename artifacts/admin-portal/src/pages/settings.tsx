import React, { useState, useEffect } from 'react';
import { PageHeader } from '../components/shared/page-header';
import { useAuthStore } from '../store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';
import { useTheme } from 'next-themes';
import { LogOut, Moon, Sun, Monitor } from 'lucide-react';
import { Switch } from '../components/ui/switch';

export default function Settings() {
  const { toast } = useToast();
  const logout = useAuthStore(state => state.logout);
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePasswordChange = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast({ title: "Error", description: "New passwords do not match.", variant: "destructive" });
      return;
    }
    if (passwords.new.length < 8) {
      toast({ title: "Error", description: "Password must be at least 8 characters.", variant: "destructive" });
      return;
    }
    
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPasswords({ current: '', new: '', confirm: '' });
      toast({ title: "Password Updated", description: "Your password has been changed successfully." });
    }, 800);
  };

  if (!mounted) return null;

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="Settings" 
        description="Manage system preferences and security settings."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1">
          <nav className="flex flex-col space-y-1">
            <Button variant="secondary" className="justify-start">Appearance</Button>
            <Button variant="ghost" className="justify-start">Security</Button>
            <Button variant="ghost" className="justify-start text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30" onClick={logout}>
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
          </nav>
        </div>

        <div className="md:col-span-2 space-y-6">
          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>Customize how the LocalOne portal looks on your device.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <button 
                  onClick={() => setTheme('light')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${theme === 'light' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                >
                  <Sun className="h-6 w-6 mb-2 text-amber-500" />
                  <span className="text-sm font-medium">Light</span>
                </button>
                <button 
                  onClick={() => setTheme('dark')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${theme === 'dark' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                >
                  <Moon className="h-6 w-6 mb-2 text-indigo-400" />
                  <span className="text-sm font-medium">Dark</span>
                </button>
                <button 
                  onClick={() => setTheme('system')}
                  className={`flex flex-col items-center justify-center p-4 border-2 rounded-xl transition-all ${theme === 'system' ? 'border-primary bg-primary/5' : 'border-muted hover:border-primary/50'}`}
                >
                  <Monitor className="h-6 w-6 mb-2 text-slate-500" />
                  <span className="text-sm font-medium">System</span>
                </button>
              </div>
              
              <div className="mt-8 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Compact sidebar</h4>
                    <p className="text-xs text-muted-foreground">Use less space for the navigation menu.</p>
                  </div>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-sm">Animations</h4>
                    <p className="text-xs text-muted-foreground">Enable interface transitions and effects.</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Ensure your account is using a long, random password to stay secure.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Current Password</Label>
                  <Input 
                    id="current-password" 
                    type="password" 
                    value={passwords.current}
                    onChange={e => setPasswords({...passwords, current: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input 
                    id="new-password" 
                    type="password" 
                    value={passwords.new}
                    onChange={e => setPasswords({...passwords, new: e.target.value})}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm New Password</Label>
                  <Input 
                    id="confirm-password" 
                    type="password" 
                    value={passwords.confirm}
                    onChange={e => setPasswords({...passwords, confirm: e.target.value})}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit" disabled={isSaving || !passwords.current || !passwords.new || !passwords.confirm}>
                  {isSaving ? 'Updating...' : 'Update Password'}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}
