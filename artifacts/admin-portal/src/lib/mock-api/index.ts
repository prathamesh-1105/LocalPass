import { Application, ApplicationStatus, Notification, Student, User } from '../../types';
import { mockApplications, mockNotifications, mockStudents } from './data';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Simple in-memory persistence for the session
let applications = [...mockApplications];
let students = [...mockStudents];
let notifications = [...mockNotifications];

const getStoredApplications = (): any[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('localone_applications');
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return [];
};

const getStoredStudents = (): any[] => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('localone_students');
    if (stored) {
      return JSON.parse(stored);
    }
  }
  return [];
};

const mapMobileToAdminApp = (app: any): any => {
  const parts = app.travelType.split(' - ');
  const validity = parts[0] || 'Second Class';
  const travelType = parts[1] || 'Monthly';
  
  return {
    id: app.id,
    studentId: app.userId,
    applicationNumber: `APP-${new Date(app.submittedAt).getFullYear()}-${app.id.slice(-4).toUpperCase()}`,
    submittedDate: app.submittedAt,
    status: app.status === 'Submitted' ? 'Pending' : 
            app.status === 'Completed' ? 'Approved' : app.status,
    sourceStation: app.sourceStation,
    destinationStation: app.destinationStation,
    travelType: travelType.includes('Monthly') ? 'Monthly' : 'Quarterly',
    validity: validity.includes('First') ? 'First Class' : 'Second Class',
    remarks: app.rejectionReason,
    documents: [
      { id: 'd1', name: 'college_id.jpg', type: 'ID', status: 'Verified' },
      { id: 'd2', name: 'bonafide.pdf', type: 'Bonafide', status: 'Pending' },
      { id: 'd3', name: 'photo.jpg', type: 'Photo', status: 'Verified' }
    ],
    history: app.timeline ? app.timeline.map((t: any, idx: number) => ({
      id: `h-${idx}-${t.timestamp}`,
      status: t.status === 'Submitted' ? 'Pending' : t.status,
      date: t.timestamp,
      remarks: t.note
    })) : []
  };
};

const getApplicationsList = (): any[] => {
  const custom = getStoredApplications().map(mapMobileToAdminApp);
  const filteredStatic = mockApplications.filter(staticApp => !custom.some(c => c.id === staticApp.id));
  return [...custom, ...filteredStatic];
};

const getStudentsList = (): any[] => {
  const custom = getStoredStudents();
  const filteredStatic = mockStudents.filter(staticStudent => !custom.some(c => c.id === staticStudent.id));
  return [...custom, ...filteredStatic];
};

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
    const list = getApplicationsList();
    const stList = getStudentsList();
    const pending = list.filter(a => ['Pending', 'Under Review', 'College Verification'].includes(a.status)).length;
    const approved = list.filter(a => a.status === 'Approved').length;
    const rejected = list.filter(a => a.status === 'Rejected').length;
    
    return {
      pending,
      approved,
      rejected,
      totalStudents: stList.length,
      recentApplications: list.slice(0, 5)
    };
  },

  // Applications
  async getApplications(filters?: { status?: string; search?: string }): Promise<Application[]> {
    await delay(800);
    let result = getApplicationsList();
    const stList = getStudentsList();
    
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
        stList.find(s => s.id === a.studentId)?.name.toLowerCase().includes(search)
      );
    }
    
    return result;
  },

  async getApplication(id: string): Promise<Application> {
    await delay(500);
    const list = getApplicationsList();
    const app = list.find(a => a.id === id);
    if (!app) throw new Error('Application not found');
    return app;
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus, remarks?: string): Promise<Application> {
    await delay(800);
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('localone_applications');
      if (stored) {
        const list = JSON.parse(stored) as any[];
        const index = list.findIndex(a => a.id === id);
        if (index !== -1) {
          const mobileStatus = status === 'Pending' ? 'Submitted' : status;
          list[index] = {
            ...list[index],
            status: mobileStatus,
            rejectionReason: status === 'Rejected' ? remarks : list[index].rejectionReason,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...list[index].timeline,
              { status: mobileStatus, timestamp: new Date().toISOString(), note: remarks }
            ]
          };
          localStorage.setItem('localone_applications', JSON.stringify(list));
          return mapMobileToAdminApp(list[index]);
        }
      }
    }

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
    
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('localone_applications');
      if (stored) {
        const list = JSON.parse(stored) as any[];
        const index = list.findIndex(a => a.id === id);
        if (index !== -1) {
          list[index] = {
            ...list[index],
            rejectionReason: remarks,
            updatedAt: new Date().toISOString(),
            timeline: [
              ...list[index].timeline,
              { status: list[index].status, timestamp: new Date().toISOString(), note: remarks }
            ]
          };
          localStorage.setItem('localone_applications', JSON.stringify(list));
          return mapMobileToAdminApp(list[index]);
        }
      }
    }

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
    const stList = getStudentsList();
    if (search) {
      return stList.filter(s => s.name.toLowerCase().includes(search.toLowerCase()) || s.studentId.toLowerCase().includes(search.toLowerCase()));
    }
    return stList;
  },

  async getStudent(id: string): Promise<{ student: Student; applications: Application[] }> {
    await delay(500);
    const stList = getStudentsList();
    const student = stList.find(s => s.id === id);
    if (!student) throw new Error('Student not found');
    
    const list = getApplicationsList();
    const studentApps = list.filter(a => a.studentId === id);
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
