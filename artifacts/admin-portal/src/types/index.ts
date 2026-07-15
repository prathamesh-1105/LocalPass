export type ApplicationStatus = 'Pending' | 'Under Review' | 'College Verification' | 'Approved' | 'Rejected';

export interface Student {
  id: string;
  name: string;
  email: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  contact: string;
  address: string;
  college: string;
  department: string;
  year: string;
  semester: string;
  rollNumber: string;
  studentId: string;
  avatar?: string;
}

export interface Document {
  id: string;
  name: string;
  type: 'ID' | 'Bonafide' | 'Photo' | 'AddressProof';
  status: 'Pending' | 'Verified' | 'Rejected';
}

export interface ApplicationHistory {
  id: string;
  status: ApplicationStatus;
  date: string;
  remarks?: string;
}

export interface Application {
  id: string;
  studentId: string;
  applicationNumber: string;
  submittedDate: string;
  status: ApplicationStatus;
  sourceStation: string;
  destinationStation: string;
  travelType: 'Monthly' | 'Quarterly';
  validity: 'First Class' | 'Second Class';
  remarks?: string;
  documents: Document[];
  history: ApplicationHistory[];
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string;
  read: boolean;
  type: 'application' | 'system';
  link?: string;
}

export interface User {
  id: string;
  username: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}
