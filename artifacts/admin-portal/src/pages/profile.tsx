import React, { useState } from 'react';
import { PageHeader } from '../components/shared/page-header';
import { useAuthStore } from '../store';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { useToast } from '../hooks/use-toast';
import { UploadCloud, CheckCircle2 } from 'lucide-react';

export default function Profile() {
  const user = useAuthStore(state => state.user);
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || ''
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved successfully.",
      });
      // In a real app, you would also update the store
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="Admin Profile" 
        description="Manage your account settings and preferences."
      />

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="pt-6 flex flex-col items-center text-center">
              <div className="relative group cursor-pointer mb-4">
                <Avatar className="h-32 w-32 border-4 border-background shadow-md">
                  <AvatarImage src={user?.avatar} />
                  <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                    {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                  <UploadCloud className="text-white h-8 w-8" />
                </div>
              </div>
              <h3 className="font-semibold text-xl">{user?.name}</h3>
              <p className="text-sm text-muted-foreground font-medium">{user?.role}</p>
              <div className="mt-4 px-3 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-medium rounded-full flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Active Account
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Update your personal details and public profile.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input 
                    id="name" 
                    value={formData.name} 
                    onChange={e => setFormData({...formData, name: e.target.value})} 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" value={user?.username || ''} disabled className="bg-muted" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  value={formData.email} 
                  onChange={e => setFormData({...formData, email: e.target.value})} 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role (Department)</Label>
                <Input 
                  id="role" 
                  value={formData.role} 
                  onChange={e => setFormData({...formData, role: e.target.value})} 
                  disabled 
                  className="bg-muted"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Contact super-admin to change your role assignment.</p>
              </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
              <Button onClick={handleSave} disabled={isSaving} className="ml-auto">
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
