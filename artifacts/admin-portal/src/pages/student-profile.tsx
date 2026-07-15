import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useStudent } from '../hooks/use-api';
import { StatusBadge } from '../components/shared/status-badge';
import { ErrorState } from '../components/shared/error-state';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { ArrowLeft, MapPin, Mail, Phone, Calendar, School, ExternalLink, FileText } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';

export default function StudentProfile() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const { data, isLoading, isError, refetch } = useStudent(id || '');

  if (isError) {
    return (
      <div className="h-full flex items-center justify-center">
        <ErrorState onRetry={() => refetch()} />
      </div>
    );
  }

  const student = data?.student;
  const applications = data?.applications || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 shrink-0 rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold tracking-tight">Student Profile</h1>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="h-[250px] rounded-xl bg-muted animate-pulse" />
          <div className="h-[400px] rounded-xl bg-muted animate-pulse" />
        </div>
      ) : student ? (
        <div className="space-y-6">
          {/* Profile Header Card */}
          <div className="bg-card border rounded-xl shadow-sm overflow-hidden relative">
            <div className="h-32 bg-gradient-to-r from-primary/80 to-purple-600/80" />
            <div className="px-6 sm:px-10 pb-8 relative">
              <div className="flex flex-col sm:flex-row gap-6 sm:items-end -mt-16 mb-6">
                <Avatar className="h-32 w-32 border-4 border-card shadow-lg bg-muted">
                  <AvatarImage src={student.avatar} />
                  <AvatarFallback className="text-4xl font-medium text-primary">
                    {student.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-1 mb-2 sm:mb-0">
                  <h2 className="text-3xl font-bold">{student.name}</h2>
                  <div className="flex items-center gap-2 text-muted-foreground font-medium">
                    <span>{student.studentId}</span>
                    <span>•</span>
                    <span>{student.college}</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 pt-6 border-t">
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Email Address</p>
                    <p className="text-sm mt-0.5">{student.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Contact Number</p>
                    <p className="text-sm mt-0.5">{student.contact}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Date of Birth</p>
                    <p className="text-sm mt-0.5">{format(new Date(student.dob), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-xs text-muted-foreground font-medium">Residential Address</p>
                    <p className="text-sm mt-0.5 line-clamp-2">{student.address}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {/* Academic Info */}
            <Card className="md:col-span-1 shadow-sm">
              <CardHeader className="pb-4 border-b bg-muted/20">
                <CardTitle className="text-lg flex items-center gap-2">
                  <School className="h-5 w-5 text-primary" />
                  Academic Profile
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-6 space-y-5">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Department</p>
                  <p className="font-medium">{student.department}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Academic Year</p>
                  <p className="font-medium">{student.year} ({student.semester})</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold mb-1">Roll Number</p>
                  <p className="font-medium">{student.rollNumber}</p>
                </div>
              </CardContent>
            </Card>

            {/* Application History */}
            <Card className="md:col-span-2 shadow-sm flex flex-col h-full min-h-[300px]">
              <CardHeader className="pb-4 border-b bg-muted/20 flex flex-row items-center justify-between space-y-0">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Application History
                </CardTitle>
                <div className="text-sm text-muted-foreground font-medium">
                  {applications.length} total
                </div>
              </CardHeader>
              <CardContent className="p-0 flex-1 flex flex-col">
                {applications.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
                    <FileText className="h-10 w-10 mb-4 opacity-20" />
                    <p>No applications found for this student.</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {applications.map((app) => (
                      <div key={app.id} className="p-4 sm:px-6 hover:bg-muted/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center gap-3 mb-1">
                            <Link to={`/applications/${app.id}`} className="font-medium hover:text-primary transition-colors flex items-center gap-1.5">
                              {app.applicationNumber}
                              <ExternalLink className="h-3 w-3 opacity-50" />
                            </Link>
                            <StatusBadge status={app.status} className="scale-90 origin-left" />
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Submitted on {format(new Date(app.submittedDate), 'MMM d, yyyy')}
                          </p>
                          <div className="text-sm font-medium mt-2 flex items-center gap-2">
                            <span>{app.sourceStation}</span>
                            <span className="text-muted-foreground text-xs">→</span>
                            <span>{app.destinationStation}</span>
                          </div>
                        </div>
                        <Button variant="secondary" size="sm" asChild className="shrink-0 self-start sm:self-center">
                          <Link to={`/applications/${app.id}`}>Review</Link>
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      ) : null}
    </div>
  );
}
