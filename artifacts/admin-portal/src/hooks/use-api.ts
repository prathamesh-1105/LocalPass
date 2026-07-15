import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/mock-api';
import { ApplicationStatus } from '../types';
import { useAuthStore } from '../store';

// Auth
export const useLogin = () => {
  const loginStore = useAuthStore(state => state.login);
  return useMutation({
    mutationFn: ({ username, password }: any) => api.login(username, password),
    onSuccess: (data) => {
      loginStore(data.user, data.token);
    },
  });
};

// Dashboard
export const useDashboardStats = () => {
  return useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => api.getDashboardStats(),
  });
};

// Applications
export const useApplications = (filters?: { status?: string; search?: string }) => {
  return useQuery({
    queryKey: ['applications', filters],
    queryFn: () => api.getApplications(filters),
  });
};

export const useApplication = (id: string) => {
  return useQuery({
    queryKey: ['application', id],
    queryFn: () => api.getApplication(id),
    enabled: !!id,
  });
};

export const useUpdateApplicationStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, remarks }: { id: string; status: ApplicationStatus; remarks?: string }) => 
      api.updateApplicationStatus(id, status, remarks),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['applications'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      queryClient.setQueryData(['application', variables.id], data);
    },
  });
};

export const useAddRemarks = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, remarks }: { id: string; remarks: string }) => 
      api.addApplicationRemarks(id, remarks),
    onSuccess: (data, variables) => {
      queryClient.setQueryData(['application', variables.id], data);
    },
  });
};

// Students
export const useStudents = (search?: string) => {
  return useQuery({
    queryKey: ['students', search],
    queryFn: () => api.getStudents(search),
  });
};

export const useStudent = (id: string) => {
  return useQuery({
    queryKey: ['student', id],
    queryFn: () => api.getStudent(id),
    enabled: !!id,
  });
};

// Notifications
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: () => api.getNotifications(),
  });
};

export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.markNotificationRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};

export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => api.markAllNotificationsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
  });
};
