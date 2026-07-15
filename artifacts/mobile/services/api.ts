import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { sleep } from '@/utils';
import { User, Application, Document, Notification } from '@/types';

// Mock Data
const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  mobile: '+1234567890',
  collegeEmail: 'alex.j@university.edu',
  collegeEmailVerified: true,
  avatarUrl: null,
  dob: '2001-05-14',
  gender: 'Male',
  address: '123 Campus Drive, City',
  college: 'State University',
  department: 'Computer Science',
  year: '3rd Year',
  semester: '6th Sem',
  studentId: 'CS2021001',
  rollNumber: '42',
  emergencyContactName: 'Sarah Johnson',
  emergencyContactPhone: '+1987654321',
};

let MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app1',
    userId: 'u1',
    status: 'Approved',
    sourceStation: 'City Center',
    destinationStation: 'University Station',
    travelType: 'Quarterly',
    submittedAt: '2023-08-01T10:00:00Z',
    updatedAt: '2023-08-05T14:30:00Z',
    certificateId: 'cert1',
    timeline: [
      { status: 'Submitted', timestamp: '2023-08-01T10:00:00Z' },
      { status: 'Under Review', timestamp: '2023-08-02T09:15:00Z' },
      { status: 'College Verification', timestamp: '2023-08-03T11:20:00Z' },
      { status: 'Approved', timestamp: '2023-08-05T14:30:00Z', note: 'All details verified.' },
    ],
  },
  {
    id: 'app2',
    userId: 'u1',
    status: 'Under Review',
    sourceStation: 'City Center',
    destinationStation: 'University Station',
    travelType: 'Half-Yearly',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    timeline: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 86400000).toISOString() },
      { status: 'Under Review', timestamp: new Date().toISOString() },
    ],
  }
];

let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Application Approved',
    message: 'Your concession application #app1 has been approved. You can now download your digital certificate.',
    category: 'Application',
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUrl: '/application/app1',
  },
  {
    id: 'n2',
    userId: 'u1',
    title: 'Renewal Reminder',
    message: 'Your current pass expires in 15 days. Apply for renewal soon to avoid interruptions.',
    category: 'Reminder',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  }
];

let MOCK_DOCUMENTS: Document[] = [
  {
    id: 'doc1',
    userId: 'u1',
    type: 'College ID',
    name: 'college_id_front.jpg',
    url: 'https://example.com/mock-doc1',
    uploadedAt: '2023-08-01T09:50:00Z',
  },
  {
    id: 'doc2',
    userId: 'u1',
    type: 'Bonafide',
    name: 'bonafide_cert_2023.pdf',
    url: 'https://example.com/mock-doc2',
    uploadedAt: '2023-08-01T09:52:00Z',
  }
];

// Auth Services
export const useLogin = () => {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (data: any) => {
      await sleep(1500);
      if (data.email === 'error@example.com') throw new Error('Invalid credentials');
      return { token: 'mock-jwt-token', user: MOCK_USER };
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
    },
  });
};

export const useSignup = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      await sleep(1500);
      return { success: true };
    },
  });
};

export const useVerifyOtp = () => {
  const setToken = useAuthStore((s) => s.setToken);
  const setUser = useAuthStore((s) => s.setUser);

  return useMutation({
    mutationFn: async (otp: string) => {
      await sleep(1500);
      if (otp === '000000') throw new Error('Invalid OTP');
      return { token: 'mock-jwt-token', user: MOCK_USER };
    },
    onSuccess: (data) => {
      setToken(data.token);
      setUser(data.user);
    },
  });
};

// Data Services
export const useApplications = () => {
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      await sleep(1000);
      return MOCK_APPLICATIONS;
    },
  });
};

export const useApplication = (id: string) => {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      await sleep(800);
      const app = MOCK_APPLICATIONS.find(a => a.id === id);
      if (!app) throw new Error('Not found');
      return app;
    },
    enabled: !!id,
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      await sleep(2000);
      const newApp: Application = {
        id: `app${Date.now()}`,
        userId: 'u1',
        status: 'Submitted',
        sourceStation: data.sourceStation,
        destinationStation: data.destinationStation,
        travelType: data.travelType,
        submittedAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        timeline: [
          { status: 'Submitted', timestamp: new Date().toISOString() }
        ]
      };
      MOCK_APPLICATIONS = [newApp, ...MOCK_APPLICATIONS];
      return newApp;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      await sleep(1000);
      return MOCK_NOTIFICATIONS;
    },
  });
};

export const useDocuments = () => {
  return useQuery({
    queryKey: ['documents'],
    queryFn: async () => {
      await sleep(800);
      return MOCK_DOCUMENTS;
    },
  });
};
