import { Application, ApplicationStatus, Notification, Student, User } from '../../types';
import { supabase } from '../supabase';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const mapDbToAdminApp = (dbApp: any): any => {
  const parts = dbApp.travel_type ? dbApp.travel_type.split(' - ') : ['Second Class', 'Monthly'];
  const validity = parts[0] || 'Second Class';
  const travelType = parts[1] || 'Monthly';
  
  return {
    id: dbApp.id,
    studentId: dbApp.user_id,
    applicationNumber: `APP-${new Date(dbApp.submitted_at).getFullYear()}-${dbApp.id.slice(-4).toUpperCase()}`,
    submittedDate: dbApp.submitted_at,
    status: dbApp.status === 'Submitted' ? 'Pending' : 
            dbApp.status === 'Completed' ? 'Approved' : dbApp.status,
    sourceStation: dbApp.source_station,
    destinationStation: dbApp.destination_station,
    travelType: travelType.includes('Monthly') ? 'Monthly' : 'Quarterly',
    validity: validity.includes('First') ? 'First Class' : 'Second Class',
    remarks: dbApp.rejection_reason,
    documents: [
      { id: 'd1', name: 'college_id.jpg', type: 'ID', status: 'Verified' },
      { id: 'd2', name: 'bonafide.pdf', type: 'Bonafide', status: 'Pending' },
      { id: 'd3', name: 'photo.jpg', type: 'Photo', status: 'Verified' }
    ],
    history: dbApp.timeline ? dbApp.timeline.map((t: any, idx: number) => ({
      id: `h-${idx}-${t.timestamp}`,
      status: t.status === 'Submitted' ? 'Pending' : t.status,
      date: t.timestamp,
      remarks: t.note
    })) : []
  };
};

const mapDbToAdminStudent = (dbStudent: any): Student => {
  return {
    id: dbStudent.id,
    name: dbStudent.name,
    email: dbStudent.email || '',
    dob: dbStudent.dob || '',
    gender: dbStudent.gender || '',
    contact: dbStudent.mobile || '',
    address: dbStudent.address || '',
    college: dbStudent.college,
    department: dbStudent.department || '',
    year: dbStudent.year || '',
    semester: dbStudent.semester || '',
    rollNumber: dbStudent.roll_number || 'N/A',
    studentId: dbStudent.student_id || 'N/A',
  };
};

// Static mock notifications for the admin UI
let mockNotificationsList: Notification[] = [
  { id: 'n1', title: 'New Application', message: 'Rohan Mehta submitted a new pass request.', date: new Date().toISOString(), read: false },
  { id: 'n2', title: 'Document Re-upload', message: 'Anjali Sharma updated her Aadhaar card.', date: new Date().toISOString(), read: true }
];

export const api = {
  // Auth
  async login(username: string, password: string): Promise<{ user: User; token: string }> {
    await delay(300);
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
    await delay(200);
    
    // Fetch all applications
    const { data: dbApps, error: appsError } = await supabase
      .from('applications')
      .select('status');
      
    if (appsError) throw appsError;
    
    // Fetch count of students
    const { count: studentCount, error: studentError } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true });
      
    if (studentError) throw studentError;

    // Fetch 5 recent applications
    const { data: recentDbApps, error: recentError } = await supabase
      .from('applications')
      .select('*')
      .order('submitted_at', { ascending: false })
      .limit(5);

    if (recentError) throw recentError;

    const list = dbApps || [];
    const pending = list.filter(a => ['Submitted', 'Pending', 'Under Review', 'College Verification'].includes(a.status)).length;
    const approved = list.filter(a => ['Approved', 'Completed'].includes(a.status)).length;
    const rejected = list.filter(a => a.status === 'Rejected').length;
    
    return {
      pending,
      approved,
      rejected,
      totalStudents: studentCount || 0,
      recentApplications: (recentDbApps || []).map(mapDbToAdminApp)
    };
  },

  // Applications
  async getApplications(filters?: { status?: string; search?: string }): Promise<Application[]> {
    await delay(300);
    let query = supabase.from('applications').select('*');
    
    if (filters?.status && filters.status !== 'All') {
      if (filters.status === 'Pending') {
        query = query.in('status', ['Submitted', 'Pending', 'Under Review', 'College Verification']);
      } else {
        query = query.eq('status', filters.status);
      }
    }
    
    const { data, error } = await query.order('submitted_at', { ascending: false });
    if (error) throw error;
    
    let result = (data || []).map(mapDbToAdminApp);
    
    if (filters?.search) {
      const search = filters.search.toLowerCase();
      // Fetch students matching search to filter by name
      const { data: students, error: studentError } = await supabase
        .from('students')
        .select('id, name');
      if (studentError) throw studentError;

      result = result.filter(a => 
        a.applicationNumber.toLowerCase().includes(search) || 
        (students || []).find(s => s.id === a.studentId)?.name.toLowerCase().includes(search)
      );
    }
    
    return result;
  },

  async getApplication(id: string): Promise<Application> {
    await delay(200);
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    return mapDbToAdminApp(data);
  },

  async updateApplicationStatus(id: string, status: ApplicationStatus, remarks?: string): Promise<Application> {
    await delay(300);
    
    // Fetch current app to get timeline
    const { data: current, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;
    
    const mobileStatus = status === 'Pending' ? 'Submitted' : 
                         status === 'Approved' ? 'Completed' : status;

    const newEvent = {
      status: mobileStatus,
      timestamp: new Date().toISOString(),
      note: remarks || `Status updated to ${status}`
    };

    const updatedTimeline = [
      ...(current.timeline || []),
      newEvent
    ];

    const updatePayload: any = {
      status: mobileStatus,
      updated_at: new Date().toISOString(),
      timeline: updatedTimeline
    };

    if (status === 'Rejected' && remarks) {
      updatePayload.rejection_reason = remarks;
    }

    const { data: updated, error } = await supabase
      .from('applications')
      .update(updatePayload)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return mapDbToAdminApp(updated);
  },

  async addApplicationRemarks(id: string, remarks: string): Promise<Application> {
    await delay(200);
    
    const { data: current, error: fetchError } = await supabase
      .from('applications')
      .select('*')
      .eq('id', id)
      .single();
      
    if (fetchError) throw fetchError;

    const newEvent = {
      status: current.status,
      timestamp: new Date().toISOString(),
      note: remarks
    };

    const updatedTimeline = [
      ...(current.timeline || []),
      newEvent
    ];

    const { data: updated, error } = await supabase
      .from('applications')
      .update({
        rejection_reason: remarks,
        updated_at: new Date().toISOString(),
        timeline: updatedTimeline
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    return mapDbToAdminApp(updated);
  },

  // Students
  async getStudents(search?: string): Promise<Student[]> {
    await delay(300);
    let query = supabase.from('students').select('*');
    
    if (search) {
      query = query.or(`name.ilike.%${search}%,student_id.ilike.%${search}%`);
    }
    
    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map(mapDbToAdminStudent);
  },

  async getStudent(id: string): Promise<{ student: Student; applications: Application[] }> {
    await delay(200);
    
    const { data: dbStudent, error: studentError } = await supabase
      .from('students')
      .select('*')
      .eq('id', id)
      .single();
      
    if (studentError) throw studentError;

    const { data: dbApps, error: appsError } = await supabase
      .from('applications')
      .select('*')
      .eq('user_id', id)
      .order('submitted_at', { ascending: false });

    if (appsError) throw appsError;

    return {
      student: mapDbToAdminStudent(dbStudent),
      applications: (dbApps || []).map(mapDbToAdminApp)
    };
  },

  // Notifications
  async getNotifications(): Promise<Notification[]> {
    await delay(200);
    return mockNotificationsList;
  },

  async markNotificationRead(id: string): Promise<void> {
    await delay(100);
    const index = mockNotificationsList.findIndex(n => n.id === id);
    if (index !== -1) {
      mockNotificationsList[index] = { ...mockNotificationsList[index], read: true };
    }
  },

  async markAllNotificationsRead(): Promise<void> {
    await delay(200);
    mockNotificationsList = mockNotificationsList.map(n => ({ ...n, read: true }));
  }
};
