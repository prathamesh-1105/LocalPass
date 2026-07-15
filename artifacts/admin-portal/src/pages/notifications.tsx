import React from 'react';
import { PageHeader } from '../components/shared/page-header';
import { useNotifications, useMarkAllNotificationsRead, useMarkNotificationRead } from '../hooks/use-api';
import { Button } from '../components/ui/button';
import { CheckCheck, BellRing, FileText, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Link } from 'react-router-dom';
import { cn } from '../lib/utils';
import { EmptyState } from '../components/shared/empty-state';

export default function Notifications() {
  const { data: notifications, isLoading } = useNotifications();
  const markAllRead = useMarkAllNotificationsRead();
  const markRead = useMarkNotificationRead();

  const handleMarkAllRead = () => {
    markAllRead.mutate();
  };

  const hasUnread = notifications?.some(n => !n.read);

  return (
    <div className="space-y-6 max-w-4xl mx-auto animate-in fade-in duration-500">
      <PageHeader 
        title="Notifications" 
        action={
          <Button 
            variant="outline" 
            onClick={handleMarkAllRead} 
            disabled={!hasUnread || markAllRead.isPending}
            className="hidden sm:flex"
          >
            <CheckCheck className="mr-2 h-4 w-4" />
            Mark all as read
          </Button>
        }
      />

      <div className="bg-card border rounded-xl shadow-sm overflow-hidden min-h-[500px]">
        {isLoading ? (
          <div className="divide-y">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="p-4 sm:p-6 flex gap-4">
                <div className="h-10 w-10 rounded-full bg-muted animate-pulse shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-muted rounded w-1/3 animate-pulse" />
                  <div className="h-3 bg-muted rounded w-2/3 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        ) : notifications?.length === 0 ? (
          <div className="h-full flex items-center justify-center p-12">
            <EmptyState 
              icon={BellRing}
              title="You're all caught up"
              description="There are no notifications to display right now."
            />
          </div>
        ) : (
          <div className="divide-y">
            {notifications?.map((notification) => {
              const Icon = notification.type === 'application' ? FileText : AlertCircle;
              const isUnread = !notification.read;
              
              const content = (
                <div 
                  className={cn(
                    "p-4 sm:p-6 flex gap-4 transition-colors hover:bg-muted/50",
                    isUnread ? "bg-muted/20" : ""
                  )}
                  onClick={() => isUnread && markRead.mutate(notification.id)}
                >
                  <div className={cn(
                    "h-10 w-10 rounded-full flex items-center justify-center shrink-0 border",
                    isUnread ? "bg-primary/10 text-primary border-primary/20" : "bg-muted text-muted-foreground"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-start justify-between gap-4">
                      <p className={cn("text-sm font-medium", isUnread && "text-primary")}>
                        {notification.title}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap pt-0.5">
                        {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                      </p>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {notification.message}
                    </p>
                  </div>
                  {isUnread && (
                    <div className="shrink-0 self-center">
                      <div className="w-2.5 h-2.5 bg-primary rounded-full" />
                    </div>
                  )}
                </div>
              );

              return notification.link ? (
                <Link key={notification.id} to={notification.link} className="block group">
                  {content}
                </Link>
              ) : (
                <div key={notification.id}>
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
