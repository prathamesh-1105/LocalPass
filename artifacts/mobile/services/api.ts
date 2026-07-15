import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/authStore';
import { sleep } from '@/utils';
import { User, Application, Document, Notification } from '@/types';
import { supabase } from '../utils/supabaseClient';

// Mock Data
const MOCK_USER: User = {
  id: 'u1',
  name: 'Alex Johnson',
  email: 'alex@example.com',
  mobile: '9876543210',
  collegeEmail: 'alex.j@vjti.ac.in',
  collegeEmailVerified: true,
  avatarUrl: null,
  dob: '2004-05-14',
  gender: 'Male',
  address: '123 Campus Drive, City',
  college: 'Veermata Jijabai Technological Institute (VJTI)',
  department: 'Computer Science',
  year: '3rd Year',
  semester: '6th Sem',
  studentId: 'CS2021001',
  rollNumber: '42',
  emergencyContactName: 'Sarah Johnson',
  emergencyContactPhone: '9876500000',
};

let MOCK_APPLICATIONS: Application[] = [
  {
    id: 'app1',
    userId: 'u1',
    status: 'Approved',
    sourceStation: 'Ghatkopar',
    destinationStation: 'Dadar',
    travelType: 'Second Class - Quarterly',
    submittedAt: '2026-07-01T10:00:00Z',
    updatedAt: '2026-07-05T14:30:00Z',
    certificateId: 'cert1',
    timeline: [
      { status: 'Submitted', timestamp: '2026-07-01T10:00:00Z' },
      { status: 'Under Review', timestamp: '2026-07-02T09:15:00Z' },
      { status: 'College Verification', timestamp: '2026-07-03T11:20:00Z' },
      { status: 'Approved', timestamp: '2026-07-05T14:30:00Z', note: 'All details verified.' },
    ],
  },
  {
    id: 'app2',
    userId: 'u1',
    status: 'Rejected',
    sourceStation: 'Kalyan',
    destinationStation: 'Kurla',
    travelType: 'First Class - Monthly',
    submittedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    rejectionReason: 'The uploaded Bonafide Certificate does not contain a signature from the Principal. Please upload a signed copy.',
    timeline: [
      { status: 'Submitted', timestamp: new Date(Date.now() - 86400000 * 2).toISOString() },
      { status: 'Under Review', timestamp: new Date(Date.now() - 86400000 * 1.5).toISOString() },
      { status: 'Rejected', timestamp: new Date(Date.now() - 86400000).toISOString(), note: 'Bonafide Certificate signature is missing.' }
    ],
  }
];

let MOCK_NOTIFICATIONS: Notification[] = [
  {
    id: 'n1',
    userId: 'u1',
    title: 'Application Rejected',
    message: 'Your concession application #app2 was rejected by the college. Reason: Bonafide Certificate signature is missing.',
    category: 'Application',
    isRead: false,
    createdAt: new Date().toISOString(),
    actionUrl: '/application/app2',
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
    uploadedAt: '2026-07-01T09:50:00Z',
  },
  {
    id: 'doc2',
    userId: 'u1',
    type: 'Bonafide',
    name: 'bonafide_cert_2026.pdf',
    url: 'https://example.com/mock-doc2',
    uploadedAt: '2026-07-01T09:52:00Z',
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
  const { user } = useAuthStore();
  return useQuery({
    queryKey: ['applications'],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('user_id', user.id)
        .order('submitted_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch applications from Supabase', error);
        throw error;
      }
      
      return (data || []).map(app => ({
        id: app.id,
        userId: app.user_id,
        status: app.status,
        sourceStation: app.source_station,
        destinationStation: app.destination_station,
        travelType: app.travel_type,
        submittedAt: app.submitted_at,
        updatedAt: app.updated_at,
        rejectionReason: app.rejection_reason,
        timeline: app.timeline || []
      })) as Application[];
    },
    enabled: !!user,
  });
};

export const useApplication = (id: string) => {
  return useQuery({
    queryKey: ['applications', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('applications')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Failed to fetch application ${id}`, error);
        throw error;
      }

      return {
        id: data.id,
        userId: data.user_id,
        status: data.status,
        sourceStation: data.source_station,
        destinationStation: data.destination_station,
        travelType: data.travel_type,
        submittedAt: data.submitted_at,
        updatedAt: data.updated_at,
        rejectionReason: data.rejection_reason,
        timeline: data.timeline || []
      } as Application;
    },
    enabled: !!id,
  });
};

export const useSubmitApplication = () => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  
  return useMutation({
    mutationFn: async (data: any) => {
      if (!user) throw new Error('Not logged in');
      
      const newApp = {
        id: `app${Date.now()}`,
        user_id: user.id,
        status: 'Submitted',
        source_station: data.sourceStation,
        destination_station: data.destinationStation,
        travel_type: data.travelType,
        submitted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        timeline: [
          { status: 'Submitted', timestamp: new Date().toISOString() }
        ]
      };

      const { data: inserted, error } = await supabase
        .from('applications')
        .insert(newApp)
        .select()
        .single();

      if (error) {
        console.error('Failed to submit application to Supabase', error);
        throw error;
      }

      return {
        id: inserted.id,
        userId: inserted.user_id,
        status: inserted.status,
        sourceStation: inserted.source_station,
        destinationStation: inserted.destination_station,
        travelType: inserted.travel_type,
        submittedAt: inserted.submitted_at,
        updatedAt: inserted.updated_at,
        timeline: inserted.timeline || []
      } as Application;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
    }
  });
};

export const useResubmitApplication = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: any) => {
      const { data: currentApp, error: fetchError } = await supabase
        .from('applications')
        .select('*')
        .eq('id', data.id)
        .single();

      if (fetchError) throw fetchError;

      const updatedTimeline = [
        ...(currentApp.timeline || []),
        { status: 'Submitted', timestamp: new Date().toISOString(), note: 'Resubmitted with corrections.' }
      ];

      const { data: updated, error } = await supabase
        .from('applications')
        .update({
          status: 'Submitted',
          source_station: data.sourceStation,
          destination_station: data.destinationStation,
          travel_type: data.travelType,
          updated_at: new Date().toISOString(),
          timeline: updatedTimeline
        })
        .eq('id', data.id)
        .select()
        .single();

      if (error) {
        console.error('Failed to resubmit application to Supabase', error);
        throw error;
      }

      return {
        id: updated.id,
        userId: updated.user_id,
        status: updated.status,
        sourceStation: updated.source_station,
        destinationStation: updated.destination_station,
        travelType: updated.travel_type,
        submittedAt: updated.submitted_at,
        updatedAt: updated.updated_at,
        timeline: updated.timeline || []
      } as Application;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['applications', data.id] });
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
