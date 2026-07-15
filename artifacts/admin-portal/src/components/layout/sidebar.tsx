import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  BarChart3, 
  Bell, 
  Settings, 
  User, 
  LogOut,
  TrainFront,
  Menu,
  X
} from 'lucide-react';
import { useAuthStore, useLayoutStore } from '../../store';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { useNotifications } from '../../hooks/use-api';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Students', href: '/students', icon: Users },
  { name: 'Reports', href: '/reports', icon: BarChart3 },
];

const secondaryNavigation = [
  { name: 'Notifications', href: '/notifications', icon: Bell, badge: true },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useLayoutStore();
  const logout = useAuthStore(state => state.logout);
  const location = useLocation();
  const { data: notifications } = useNotifications();
  
  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const NavItem = ({ item, isSecondary = false }: any) => {
    const isActive = location.pathname.startsWith(item.href) && (item.href !== '/dashboard' || location.pathname === '/dashboard');
    
    return (
      <NavLink
        to={item.href}
        onClick={() => {
          if (window.innerWidth < 1024) setSidebarOpen(false);
        }}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
          isActive 
            ? 'bg-primary text-primary-foreground shadow-sm' 
            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
        )}
      >
        <item.icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "")} />
        {item.name}
        {item.badge && unreadCount > 0 && (
          <span className={cn(
            "ml-auto flex h-5 w-5 items-center justify-center rounded-full text-[10px]",
            isActive ? "bg-primary-foreground text-primary" : "bg-primary text-primary-foreground"
          )}>
            {unreadCount}
          </span>
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r bg-sidebar transition-transform duration-300 ease-in-out lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center gap-2 font-semibold text-lg tracking-tight">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <TrainFront className="h-5 w-5" />
            </div>
            <span>LocalOne</span>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            className="lg:hidden" 
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="flex-1 px-4 py-6">
          <div className="space-y-6">
            <div>
              <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Overview
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <NavItem key={item.name} item={item} />
                ))}
              </nav>
            </div>
            
            <div>
              <div className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                System
              </div>
              <nav className="space-y-1">
                {secondaryNavigation.map((item) => (
                  <NavItem key={item.name} item={item} isSecondary />
                ))}
              </nav>
            </div>
          </div>
        </ScrollArea>

        <div className="mt-auto border-t p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
            onClick={() => logout()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>
    </>
  );
}
