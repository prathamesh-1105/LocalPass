import React, { useState } from 'react';
import { useApplications } from '../hooks/use-api';
import { PageHeader } from '../components/shared/page-header';
import { StatusBadge } from '../components/shared/status-badge';
import { EmptyState } from '../components/shared/empty-state';
import { ErrorState } from '../components/shared/error-state';
import { Link, useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { Search, Filter, SlidersHorizontal, ChevronRight, FileX } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";

export default function Applications() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  const statusFilter = searchParams.get('status') || 'All';
  const searchQuery = searchParams.get('search') || '';

  const { data: applications, isLoading, isError, refetch } = useApplications({ 
    status: statusFilter !== 'All' ? statusFilter : undefined,
    search: searchQuery || undefined
  });

  const handleStatusChange = (value: string) => {
    if (value === 'All') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', value);
    }
    setSearchParams(searchParams);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      searchParams.set('search', value);
    } else {
      searchParams.delete('search');
    }
    setSearchParams(searchParams, { replace: true });
  };

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <PageHeader 
        title="Applications" 
        description="Manage and review all railway concession applications."
        action={
          <Button variant="outline" className="hidden sm:flex">
            <SlidersHorizontal className="mr-2 h-4 w-4" />
            Advanced Filters
          </Button>
        }
      />

      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border shadow-sm">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search by ID or student name..." 
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-9 h-10 w-full"
          />
        </div>
        
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="h-4 w-4 text-muted-foreground hidden sm:block" />
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-10">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="Pending">Pending Review</SelectItem>
              <SelectItem value="Under Review">Under Review</SelectItem>
              <SelectItem value="College Verification">College Verification</SelectItem>
              <SelectItem value="Approved">Approved</SelectItem>
              <SelectItem value="Rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm flex-1 flex flex-col overflow-hidden">
        {isLoading ? (
          <div className="p-8 space-y-4">
            <div className="h-10 bg-muted rounded-md w-full animate-pulse" />
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded-md w-full animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : applications?.length === 0 ? (
          <div className="flex-1 flex items-center justify-center min-h-[400px]">
            <EmptyState 
              icon={FileX}
              title="No applications found"
              description={searchQuery || statusFilter !== 'All' 
                ? "Try adjusting your filters or search query." 
                : "There are no applications submitted yet."}
              action={
                (searchQuery || statusFilter !== 'All') ? (
                  <Button variant="outline" onClick={() => setSearchParams({})}>
                    Clear Filters
                  </Button>
                ) : null
              }
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-[140px] font-semibold">App ID</TableHead>
                  <TableHead className="font-semibold">Submitted</TableHead>
                  <TableHead className="font-semibold">Route</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {applications?.map((app) => (
                  <TableRow key={app.id} className="group cursor-pointer hover:bg-muted/50 transition-colors">
                    <TableCell className="font-medium">
                      <Link to={`/applications/${app.id}`} className="block">
                        {app.applicationNumber}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/applications/${app.id}`} className="block text-muted-foreground">
                        {format(new Date(app.submittedDate), 'MMM d, yyyy')}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/applications/${app.id}`} className="block">
                        <div className="flex items-center gap-1.5 text-sm">
                          <span className="truncate max-w-[100px]">{app.sourceStation}</span>
                          <span className="text-muted-foreground text-xs">→</span>
                          <span className="truncate max-w-[100px]">{app.destinationStation}</span>
                        </div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/applications/${app.id}`} className="block">
                        <div className="text-sm">{app.travelType}</div>
                        <div className="text-xs text-muted-foreground">{app.validity}</div>
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Link to={`/applications/${app.id}`} className="block">
                        <StatusBadge status={app.status} />
                      </Link>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="icon" asChild className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/applications/${app.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
        
        {applications && applications.length > 0 && (
          <div className="border-t p-4 flex items-center justify-between text-sm text-muted-foreground">
            <div>Showing <span className="font-medium text-foreground">{applications.length}</span> results</div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" disabled>Previous</Button>
              <Button variant="outline" size="sm" disabled>Next</Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
