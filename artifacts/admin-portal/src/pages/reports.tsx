import React, { useState } from 'react';
import { PageHeader } from '../components/shared/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { useToast } from '../hooks/use-toast';
import { Download, FileDown, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';

export default function Reports() {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState<string | null>(null);

  const handleExport = (type: string) => {
    setIsExporting(type);
    toast({
      title: `Export Started`,
      description: `Preparing your ${type.toUpperCase()} report download...`,
    });
    
    // Mock export delay
    setTimeout(() => {
      setIsExporting(null);
      toast({
        title: `Export Complete`,
        description: `Your ${type.toUpperCase()} report is ready.`,
      });
    }, 2000);
  };

  const monthlyData = [
    { name: 'Jan', approved: 400, rejected: 240, pending: 120 },
    { name: 'Feb', approved: 300, rejected: 139, pending: 221 },
    { name: 'Mar', approved: 200, rejected: 980, pending: 229 },
    { name: 'Apr', approved: 278, rejected: 390, pending: 200 },
    { name: 'May', approved: 189, rejected: 480, pending: 218 },
    { name: 'Jun', approved: 239, rejected: 380, pending: 250 },
  ];

  const statusData = [
    { name: 'Approved', value: 1606, color: 'hsl(var(--primary))' },
    { name: 'Rejected', value: 2609, color: 'hsl(var(--destructive))' },
    { name: 'Pending Review', value: 1238, color: 'hsl(var(--muted-foreground))' },
  ];

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <PageHeader 
        title="Reports & Analytics" 
        description="View application statistics and export data."
        action={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => handleExport('excel')} disabled={!!isExporting}>
              <FileDown className="mr-2 h-4 w-4" />
              Export Excel
            </Button>
            <Button onClick={() => handleExport('pdf')} disabled={!!isExporting}>
              <Download className="mr-2 h-4 w-4" />
              Export PDF
            </Button>
          </div>
        }
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 lg:col-span-2 shadow-sm border">
          <CardHeader>
            <CardTitle>Application Volume</CardTitle>
            <CardDescription>Monthly breakdown of application statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlyData} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} dy={10} fontSize={12} />
                  <YAxis axisLine={false} tickLine={false} fontSize={12} />
                  <RechartsTooltip 
                    cursor={{fill: 'hsl(var(--muted)/0.3)'}}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                  <Bar dataKey="approved" name="Approved" stackId="a" fill="hsl(var(--primary))" radius={[0, 0, 4, 4]} />
                  <Bar dataKey="pending" name="Pending" stackId="a" fill="hsl(var(--muted-foreground)/0.5)" />
                  <Bar dataKey="rejected" name="Rejected" stackId="a" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1 shadow-sm border flex flex-col">
          <CardHeader>
            <CardTitle>Overall Status</CardTitle>
            <CardDescription>Distribution of all-time applications</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
            <div className="h-[250px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="value"
                    stroke="none"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                    itemStyle={{ color: 'hsl(var(--foreground))' }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-3xl font-bold tracking-tight">5.4k</span>
                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Total</span>
              </div>
            </div>
            
            <div className="w-full space-y-2 mt-4">
              {statusData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-muted-foreground">{item.name}</span>
                  </div>
                  <span className="font-medium">{item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
