import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApplication, useStudent, useUpdateApplicationStatus, useAddRemarks } from '../hooks/use-api';
import { StatusBadge } from '../components/shared/status-badge';
import { ErrorState } from '../components/shared/error-state';
import { Button } from '../components/ui/button';
import { format } from 'date-fns';
import { 
  ArrowLeft, CheckCircle2, XCircle, FileText, 
  MapPin, Calendar, CreditCard, School, Search, Clock, Image as ImageIcon,
  MessageSquare
} from 'lucide-react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "../components/ui/dialog";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { useToast } from "../hooks/use-toast";
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { ScrollArea } from '../components/ui/scroll-area';

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { data: application, isLoading: appLoading, isError: appError, refetch: refetchApp } = useApplication(id || '');
  const { data: studentData, isLoading: studentLoading } = useStudent(application?.studentId || '');
  
  const updateStatus = useUpdateApplicationStatus();
  const addRemarks = useAddRemarks();
  
  const [actionModal, setActionModal] = useState<{ isOpen: boolean; type: 'Approve' | 'Reject' | 'Remarks' }>({
    isOpen: false,
    type: 'Remarks'
  });
  const [remarks, setRemarks] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isLoading = appLoading || (studentLoading && !!application?.studentId);
  const student = studentData?.student;

  if (appError) {
    return (
      <div className="h-full flex items-center justify-center">
        <ErrorState onRetry={() => refetchApp()} />
      </div>
    );
  }

  const handleAction = async () => {
    if (actionModal.type === 'Reject' && !remarks.trim()) {
      toast({ title: "Validation Error", description: "Remarks are required when rejecting.", variant: "destructive" });
      return;
    }

    setIsSubmitting(true);
    try {
      if (actionModal.type === 'Remarks') {
        await addRemarks.mutateAsync({ id: id!, remarks });
        toast({ title: "Remarks added", description: "Your note has been saved." });
      } else {
        const newStatus = actionModal.type === 'Approve' ? 'Approved' : 'Rejected';
        await updateStatus.mutateAsync({ id: id!, status: newStatus, remarks: remarks || undefined });
        toast({ title: `Application ${newStatus}`, description: `Application has been successfully ${newStatus.toLowerCase()}.` });
      }
      setActionModal({ ...actionModal, isOpen: false });
      setRemarks('');
    } catch (error) {
      toast({ title: "Error", description: "Failed to perform action.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isPendingReview = application?.status === 'Pending' || application?.status === 'Under Review' || application?.status === 'College Verification';

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 mb-2">
        <Button variant="outline" size="icon" onClick={() => navigate(-1)} className="h-9 w-9 shrink-0 rounded-full">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">Application Details</h1>
            {application && <StatusBadge status={application.status} className="text-sm px-3 py-1" />}
          </div>
          {application && (
            <p className="text-muted-foreground text-sm mt-1">
              {application.applicationNumber} • Submitted on {format(new Date(application.submittedDate), 'MMMM d, yyyy')}
            </p>
          )}
        </div>
        
        {application && isPendingReview && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-900/50 dark:hover:bg-red-900/20"
              onClick={() => setActionModal({ isOpen: true, type: 'Reject' })}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Reject
            </Button>
            <Button 
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => setActionModal({ isOpen: true, type: 'Approve' })}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Approve
            </Button>
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-3">
          <div className="md:col-span-2 space-y-6">
            <div className="h-[250px] rounded-xl bg-muted animate-pulse" />
            <div className="h-[300px] rounded-xl bg-muted animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-[400px] rounded-xl bg-muted animate-pulse" />
          </div>
        </div>
      ) : application && student ? (
        <div className="grid gap-6 md:grid-cols-3 items-start">
          <div className="md:col-span-2 space-y-6">
            {/* Student Info Card */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <UserIcon className="h-5 w-5 text-primary" />
                  Applicant Information
                </h2>
                <Button variant="link" size="sm" asChild className="h-auto p-0">
                  <Link to={`/students/${student.id}`}>View full profile</Link>
                </Button>
              </div>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row gap-6 items-start">
                  <Avatar className="h-20 w-20 border-2 border-border shadow-sm">
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback className="text-xl bg-primary/5 text-primary">
                      {student.name.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 flex-1 w-full">
                    <div>
                      <p className="text-sm text-muted-foreground">Full Name</p>
                      <p className="font-medium">{student.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Contact</p>
                      <p className="font-medium">{student.contact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Email</p>
                      <p className="font-medium">{student.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date of Birth</p>
                      <p className="font-medium">{format(new Date(student.dob), 'MMM d, yyyy')} ({student.gender})</p>
                    </div>
                    <div className="sm:col-span-2">
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="font-medium">{student.address}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Academic & Journey Details */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="border-b bg-muted/30 px-5 py-3">
                  <h2 className="font-semibold flex items-center gap-2 text-sm">
                    <School className="h-4 w-4 text-primary" />
                    Academic Details
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Department & Year</p>
                    <p className="font-medium text-sm">{student.department}, {student.year}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Student ID / Roll No</p>
                    <p className="font-medium text-sm">{student.studentId} / {student.rollNumber}</p>
                  </div>
                </div>
              </div>

              <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
                <div className="border-b bg-muted/30 px-5 py-3">
                  <h2 className="font-semibold flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-primary" />
                    Journey Details
                  </h2>
                </div>
                <div className="p-5 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                      <div className="w-0.5 h-6 bg-border" />
                      <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                    </div>
                    <div className="flex flex-col justify-between h-[42px] text-sm font-medium">
                      <p>{application.sourceStation}</p>
                      <p>{application.destinationStation}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t">
                    <div>
                      <p className="text-xs text-muted-foreground">Pass Type</p>
                      <p className="font-medium text-sm">{application.travelType}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Class</p>
                      <p className="font-medium text-sm">{application.validity}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Documents */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="border-b bg-muted/30 px-6 py-4">
                <h2 className="font-semibold flex items-center gap-2">
                  <FileText className="h-5 w-5 text-primary" />
                  Uploaded Documents
                </h2>
              </div>
              <div className="p-2">
                <div className="grid sm:grid-cols-2 gap-2">
                  {application.documents.map((doc) => (
                    <div key={doc.id} className="flex items-center p-3 rounded-lg hover:bg-muted/50 border border-transparent hover:border-border transition-all">
                      <div className="h-10 w-10 shrink-0 bg-primary/10 text-primary rounded-lg flex items-center justify-center mr-3">
                        <ImageIcon className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.name}</p>
                        <p className="text-xs text-muted-foreground">{doc.type}</p>
                      </div>
                      <Button variant="ghost" size="sm" className="h-8 shrink-0 text-xs">
                        View
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Action Card (Mobile/Desktop) */}
            <div className="bg-card border rounded-xl shadow-sm overflow-hidden">
              <div className="border-b bg-muted/30 px-5 py-4 flex items-center justify-between">
                <h2 className="font-semibold flex items-center gap-2">
                  <Clock className="h-5 w-5 text-primary" />
                  Status Timeline
                </h2>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setActionModal({ isOpen: true, type: 'Remarks' })} title="Add Note">
                  <MessageSquare className="h-4 w-4" />
                </Button>
              </div>
              <ScrollArea className="h-[400px] p-5">
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[15px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {[...application.history].reverse().map((event, index) => {
                    const isLatest = index === 0;
                    return (
                      <div key={event.id} className="relative flex items-start gap-4">
                        <div className={`h-8 w-8 shrink-0 rounded-full flex items-center justify-center shadow-sm z-10 border-2 border-background
                          ${event.status === 'Approved' ? 'bg-emerald-100 text-emerald-600' : 
                            event.status === 'Rejected' ? 'bg-red-100 text-red-600' : 
                            'bg-blue-100 text-blue-600'}`}
                        >
                          {event.status === 'Approved' ? <CheckCircle2 className="h-4 w-4" /> :
                           event.status === 'Rejected' ? <XCircle className="h-4 w-4" /> :
                           <Clock className="h-4 w-4" />}
                        </div>
                        <div className="flex-1 pb-1">
                          <p className={`text-sm font-medium ${isLatest ? 'text-foreground' : 'text-muted-foreground'}`}>
                            {event.status}
                          </p>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {format(new Date(event.date), 'MMM d, h:mm a')}
                          </p>
                          {event.remarks && (
                            <div className="mt-2 p-2.5 bg-muted rounded-md text-sm text-foreground italic border border-border/50">
                              "{event.remarks}"
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      ) : null}

      {/* Action Modal */}
      <Dialog open={actionModal.isOpen} onOpenChange={(open) => !isSubmitting && setActionModal({ ...actionModal, isOpen: open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {actionModal.type === 'Approve' ? 'Approve Application' : 
               actionModal.type === 'Reject' ? 'Reject Application' : 
               'Add Internal Note'}
            </DialogTitle>
            <DialogDescription>
              {actionModal.type === 'Approve' ? 'This application will be marked as Approved. The student will be notified.' : 
               actionModal.type === 'Reject' ? 'Please provide a reason for rejection. This will be visible to the student.' : 
               'Add a note to the timeline. This is only visible to college staff.'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="remarks">
                Remarks {actionModal.type === 'Reject' && <span className="text-red-500">*</span>}
              </Label>
              <Textarea
                id="remarks"
                placeholder={actionModal.type === 'Reject' ? "E.g., Invalid document uploaded..." : "Add your remarks here..."}
                className="min-h-[100px]"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionModal({ ...actionModal, isOpen: false })} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              onClick={handleAction} 
              disabled={isSubmitting || (actionModal.type === 'Reject' && !remarks.trim())}
              className={
                actionModal.type === 'Approve' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 
                actionModal.type === 'Reject' ? 'bg-red-600 hover:bg-red-700 text-white' : ''
              }
            >
              {isSubmitting ? 'Processing...' : `Confirm ${actionModal.type}`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}
