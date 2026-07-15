import { Application, ApplicationStatus, Notification, Student, User } from '../../types';
import { mockApplications, mockNotifications, mockStudents } from './data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory persistence for the session
let applications = [...mockApplications];
let students = [...mockStudents];
let notifications = [...mockNotifications];

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    await delay(800);
    if (username === 'admin' && password === 'admin123') {
      return {
        user: {
          id: 'u-1',
          username: 'admin',
          name: 'Admin User',
          email: 'admin@localone.edu',
          role: 'Administrator'
        },
        token: 'mock-jwt-token-123'
      };
    }
    throw new Error('Invalid credentials');
  },

  // Dashboard Stats
  async getDashboardStats() {
    await delay(600);
    const pending = applications.filter(a => ['Pending', 'Under Review', 'College Verification'].includes(a.status)).length;
    const approved = applications.filter(a => a.status === 'Approved').length;
    const rejected = applications.filter(a => a.status === 'Rejected').length;
    
    return {
      pending,
      approved,
      rejected,
      totalStudents: students.length,
      recentApplications: applications.slice(0, 5)
    };
  },

  // Applications
  async getApplications(filters?: { status?: string; search?: string }): Promise<Application[]> {
    await delay(800);
    let result = [...applications];
    
    if (filters?.status && filters.status !== 'All') {
      if (filters.status === 'Pending') {
        result = result.filter(a => ['Pending', 'Under Review', 'College Verification'].includes(a.status));
      } else {
        result = result.filter(a => a.status === filters.status);
      }
    }
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      result = result.filter(a => 
        a.applicationNumber.toLowerCase().includes(search) || 
        students.find(s => s.id === a.studentId)?.name.toLowerCase().includes(search)
      );
    }
    
    return result;
  },

  async getApplication(id: string): Promise<Application> {
    await delay(500);
    const app = applications.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    return app;
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus, remarks?: string): Promise<Application> {
    await delay(800);
    const index = applications.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Application not found');
    
    const app = { ...applications[index], status, remarks: remarks || applications[index].remarks };
    app.history = [
      ...app.history, 
      { 
        id: `h-${Date.now()}`, 
        status, 
        date: new Date().toISOString(), 
        remarks 
      }
    ];
    
    applications[index] = app;
    return app;
  },

  async addApplicationRemarks(id: string, remarks: string): Promise<Application> {
    await delay(500);
    const index = applications.findIndex(a => a.id === id);
    if (index === -1) throw new Error('Application not found');
    
    const app = { ...applications[index] };
    app.history = [
      ...app.history,
      {
        id: `h-${Date.now()}`,
        status: app.status,
        date: new Date().toISOString(),
        remarks
      }
    ];
    
    applications[index] = app;
    return app;
  },

  // Students
  async getStudents(search?: string): Promise<Student[]> {
    await delay(700);
    if (search) {
      return students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.studentId.toLowerCase().includes(search.toLowerCase()));
    }
    return students;
  },

  async getStudent(id: string): Promise<{ student: Student; applications: Application[] }> {
    await delay(500);
    const student = students.find(s => s.id === id);
    if (!student) throw new Error('Student not found');
    
    const studentApps = applications.filter(a => a.studentId === id);
    return { student, applications: studentApps };
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    await delay(400);
    return notifications;
  },

  async markNotificationRead(id: string): Promise<void> {
    await delay(200);
    const index = notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      notifications[index] = { ...notifications[index], read: true };
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    await delay(400);
    notifications = notifications.map(n => ({ ...n, read: true }));
  }
};
