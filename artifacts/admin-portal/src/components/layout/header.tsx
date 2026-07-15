import React, { useState } from 'react';
import { Menu, Bell, Search, User as UserIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useLayoutStore } from '../../store';
import { useNotifications } from '../../hooks/use-api';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { Link, useNavigate } from 'react-router-dom';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { useAuthStore } from '../../store';

export function Header() {
  const toggleSidebar = useLayoutStore(state => state.toggleSidebar);
  const { data: notifications } = useNotifications();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const user = useAuthStore(state => state.user);

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/applications?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4 shadow-sm sm:gap-6 sm:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={toggleSidebar}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      <div className="flex flex-1 items-center justify-between gap-4 sm:gap-6">
        <form onSubmit={handleSearch} className="flex-1 sm:max-w-md relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search applications or students..."
            className="w-full bg-muted/50 pl-9 md:w-[300px] lg:w-[400px]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="flex items-center gap-2 sm:gap-4">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-2 top-2 flex h-2 w-2 rounded-full bg-destructive" />
                )}
                <span className="sr-only">Notifications</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 p-0">
              <div className="flex items-center justify-between border-b px-4 py-3">
                <h3 className="font-semibold">Notifications</h3>
                <Link to="/notifications" className="text-xs text-primary hover:underline">
                  View all
                </Link>
              </div>
              <ScrollArea className="h-80">
                {notifications?.length === 0 ? (
                  <div className="p-4 text-center text-sm text-muted-foreground">
                    No new notifications
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {notifications?.slice(0, 5).map((notification) => (
                      <Link
                        key={notification.id}
                        to={notification.link || '/notifications'}
                        className={cn(
                          "flex flex-col gap-1 border-b p-4 text-sm hover:bg-muted/50 transition-colors",
                          !notification.read && "bg-muted/30"
                        )}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className={cn("font-medium", !notification.read && "text-primary")}>
                            {notification.title}
                          </span>
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                          </span>
                        </div>
                        <span className="text-muted-foreground line-clamp-2">
                          {notification.message}
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </PopoverContent>
          </Popover>

          <div className="hidden h-6 w-px bg-border sm:block" />

          <Link to="/profile" className="flex items-center gap-2 outline-none">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-sm font-medium leading-none">{user?.name || 'Admin'}</span>
              <span className="text-xs text-muted-foreground">{user?.role || 'Administrator'}</span>
            </div>
            <Avatar className="h-8 w-8 border">
              <AvatarImage src={user?.avatar} alt={user?.name} />
              <AvatarFallback className="bg-primary/10 text-primary text-xs">
                {user?.name?.substring(0, 2).toUpperCase() || 'AD'}
              </AvatarFallback>
            </Avatar>
          </Link>
        </div>
      </div>
    </header>
  );
}
