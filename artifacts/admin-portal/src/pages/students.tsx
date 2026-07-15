import React, { useState } from 'react';
import { useStudents } from '../hooks/use-api';
import { PageHeader } from '../components/shared/page-header';
import { EmptyState } from '../components/shared/empty-state';
import { ErrorState } from '../components/shared/error-state';
import { Link } from 'react-router-dom';
import { Search, Users as UsersIcon, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '../components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';

export default function Students() {
  const [searchQuery, setSearchQuery] = useState('');
  // Use debounced search in a real app, but direct is fine for mock
  const { data: students, isLoading, isError, refetch } = useStudents(searchQuery || undefined);

  return (
    <div className="space-y-6 h-full flex flex-col animate-in fade-in duration-500">
      <PageHeader 
        title="Students Directory" 
        description="Browse and manage student profiles and their application history."
      />

      <div className="bg-card p-4 rounded-xl border shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search students by name or ID..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
      </div>

      <div className="flex-1">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="h-[280px] bg-muted rounded-xl animate-pulse" />
            ))}
          </div>
        ) : isError ? (
          <div className="h-[400px] flex items-center justify-center border rounded-xl bg-card">
            <ErrorState onRetry={() => refetch()} />
          </div>
        ) : students?.length === 0 ? (
          <div className="h-[400px] flex items-center justify-center border rounded-xl bg-card">
            <EmptyState 
              icon={UsersIcon}
              title="No students found"
              description={searchQuery ? `No results for "${searchQuery}"` : "The student directory is empty."}
              action={searchQuery ? <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button> : null}
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {students?.map((student) => (
              <Link key={student.id} to={`/students/${student.id}`} className="block group">
                <Card className="h-full overflow-hidden transition-all duration-200 hover:shadow-md hover:border-primary/50 group-hover:-translate-y-1">
                  <div className="h-20 bg-gradient-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-900/40 dark:to-purple-900/40" />
                  <CardContent className="p-5 pt-0 relative">
                    <Avatar className="h-16 w-16 border-4 border-card -mt-8 mb-3 bg-muted shadow-sm">
                      <AvatarImage src={student.avatar} />
                      <AvatarFallback className="text-lg font-medium text-primary bg-primary/10">
                        {student.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1 mb-4">
                      <h3 className="font-semibold text-lg leading-tight group-hover:text-primary transition-colors">{student.name}</h3>
                      <p className="text-xs text-muted-foreground font-medium">{student.studentId} • {student.department}</p>
                    </div>
                    
                    <div className="space-y-2.5 text-sm">
                      <div className="flex items-center text-muted-foreground">
                        <Mail className="h-3.5 w-3.5 mr-2 shrink-0" />
                        <span className="truncate">{student.email}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <Phone className="h-3.5 w-3.5 mr-2 shrink-0" />
                        <span className="truncate">{student.contact}</span>
                      </div>
                      <div className="flex items-center text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 mr-2 shrink-0" />
                        <span className="truncate text-xs">{student.address.split(',')[0]}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
