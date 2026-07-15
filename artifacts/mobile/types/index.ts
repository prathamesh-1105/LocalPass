export interface User {
  id: string;
  name: string;
  email: string;
  mobile: string;
  collegeEmail: string | null;
  collegeEmailVerified: boolean;
  avatarUrl: string | null;
  dob: string;
  gender: string;
  address: string;
  college: string;
  department: string;
  year: string;
  semester: string;
  studentId: string;
  rollNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export type ApplicationStatus = 'Draft' | 'Submitted' | 'Under Review' | 'College Verification' | 'Approved' | 'Rejected' | 'Completed';

export interface Application {
  id: string;
  userId: string;
  status: ApplicationStatus;
  sourceStation: string;
  destinationStation: string;
  travelType: string;
  submittedAt: string;
  updatedAt: string;
  rejectionReason?: string;
  certificateId?: string;
  timeline: ApplicationTimelineEvent[];
}

export interface ApplicationTimelineEvent {
  status: ApplicationStatus;
  timestamp: string;
  note?: string;
}

export interface Document {
  id: string;
  userId: string;
  type: string; // e.g., 'College ID', 'Bonafide', 'Profile Photo'
  name: string;
  url: string;
  uploadedAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  category: 'Application' | 'Action Required' | 'Reminder' | 'Announcement';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}
