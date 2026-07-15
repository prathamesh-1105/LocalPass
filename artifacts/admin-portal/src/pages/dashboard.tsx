import React from 'react';
import { useDashboardStats } from '../hooks/use-api';
import { PageHeader } from '../components/shared/page-header';
import { KpiCard } from '../components/shared/kpi-card';
import { StatusBadge } from '../components/shared/status-badge';
import { ErrorState } from '../components/shared/error-state';
import { FileText, CheckCircle2, XCircle, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

export default function Dashboard() {
  const { data: stats, isLoading, isError, refetch } = useDashboardStats();

  if (isError) {
    return <ErrorState onRetry={() => refetch()} />;
  }

  // Generate some mock chart data for the dashboard
  const chartData = [
    { name: 'Jan', applications: 120 },
    { name: 'Feb', applications: 150 },
    { name: 'Mar', applications: 180 },
    { name: 'Apr', applications: 220 },
    { name: 'May', applications: 290 },
    { name: 'Jun', applications: 200 },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <PageHeader 
        title="Dashboard" 
        description="Overview of railway concession applications and student statistics." 
      />

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : stats ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <KpiCard
            title="Pending Applications"
            value={stats.pending}
            icon={FileText}
            trend={{ value: 12, isPositive: false, text: "from last week" }}
          />
          <KpiCard
            title="Approved Applications"
            value={stats.approved}
            icon={CheckCircle2}
            trend={{ value: 8.5, isPositive: true, text: "from last month" }}
          />
          <KpiCard
            title="Rejected Applications"
            value={stats.rejected}
            icon={XCircle}
            trend={{ value: 2.1, isPositive: false, text: "from last month" }}
          />
          <KpiCard
            title="Total Students"
            value={stats.totalStudents}
            icon={Users}
            trend={{ value: 15, isPositive: true, text: "new registrations" }}
          />
        </div>
      ) : null}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm lg:col-span-4">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="font-semibold leading-none tracking-tight">Application Trends</h3>
            <p className="text-sm text-muted-foreground">Applications submitted over the last 6 months.</p>
          </div>
          <div className="p-6 pt-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                  />
                  <Tooltip 
                    cursor={{ fill: 'hsl(var(--muted)/0.5)' }}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--background))', 
                      borderColor: 'hsl(var(--border))',
                      borderRadius: 'var(--radius)'
                    }}
                  />
                  <Bar dataKey="applications" radius={[4, 4, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill="hsl(var(--primary))" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm lg:col-span-3 flex flex-col">
          <div className="flex flex-col space-y-1.5 p-6">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold leading-none tracking-tight">Recent Applications</h3>
              <Button variant="ghost" size="sm" asChild className="h-8 text-xs px-2 text-muted-foreground">
                <Link to="/applications">
                  View all <ArrowRight className="ml-1 h-3 w-3" />
                </Link>
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">The latest submissions needing review.</p>
          </div>
          <div className="p-0 flex-1">
            {isLoading ? (
              <div className="space-y-4 px-6 pb-6">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded animate-pulse" />
                      <div className="h-3 w-20 bg-muted rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-20 bg-muted rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : stats?.recentApplications && stats.recentApplications.length > 0 ? (
              <div className="flex flex-col">
                {stats.recentApplications.map((app, i) => (
                  <Link 
                    key={app.id} 
                    to={`/applications/${app.id}`}
                    className={`flex items-center justify-between px-6 py-3.5 hover:bg-muted/50 transition-colors ${i !== stats.recentApplications.length - 1 ? 'border-b border-border/50' : ''}`}
                  >
                    <div className="space-y-1">
                      <p className="text-sm font-medium leading-none">{app.applicationNumber}</p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(app.submittedDate), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                    <StatusBadge status={app.status} />
                  </Link>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-6 text-center h-full min-h-[200px]">
                <FileText className="h-8 w-8 text-muted-foreground mb-3 opacity-20" />
                <p className="text-sm text-muted-foreground">No recent applications found</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
