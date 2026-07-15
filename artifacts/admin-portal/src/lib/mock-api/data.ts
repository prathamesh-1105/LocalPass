import { Student, Application, Notification } from '../../types';

export const mockStudents: Student[] = [
  {
    id: 's-1',
    name: 'Aarav Patel',
    email: 'aarav.p@college.edu',
    dob: '2003-05-14',
    gender: 'Male',
    contact: '+91 9876543210',
    address: '12, Sunrise Apartments, Andheri West, Mumbai',
    college: 'LocalOne Engineering College',
    department: 'Computer Science',
    year: 'Third Year',
    semester: 'Semester 6',
    rollNumber: 'CS2021045',
    studentId: 'STU-2021-045',
  },
  {
    id: 's-2',
    name: 'Priya Sharma',
    email: 'priya.s@college.edu',
    dob: '2004-02-28',
    gender: 'Female',
    contact: '+91 9876543211',
    address: '45, Blue Bell Society, Borivali East, Mumbai',
    college: 'LocalOne Engineering College',
    department: 'Information Technology',
    year: 'Second Year',
    semester: 'Semester 4',
    rollNumber: 'IT2022012',
    studentId: 'STU-2022-012',
  },
  {
    id: 's-3',
    name: 'Rohan Desai',
    email: 'rohan.d@college.edu',
    dob: '2002-11-09',
    gender: 'Male',
    contact: '+91 9876543212',
    address: 'A-102, Green Park, Dadar, Mumbai',
    college: 'LocalOne Engineering College',
    department: 'Mechanical Engineering',
    year: 'Fourth Year',
    semester: 'Semester 8',
    rollNumber: 'ME2020088',
    studentId: 'STU-2020-088',
  },
  {
    id: 's-4',
    name: 'Ananya Iyer',
    email: 'ananya.i@college.edu',
    dob: '2003-08-21',
    gender: 'Female',
    contact: '+91 9876543213',
    address: 'B-4, Seaview Flats, Bandra West, Mumbai',
    college: 'LocalOne Arts & Science',
    department: 'Data Science',
    year: 'Third Year',
    semester: 'Semester 5',
    rollNumber: 'DS2021023',
    studentId: 'STU-2021-023',
  },
  {
    id: 's-5',
    name: 'Karan Singh',
    email: 'karan.s@college.edu',
    dob: '2004-01-15',
    gender: 'Male',
    contact: '+91 9876543214',
    address: '78, Hill Road, Malad West, Mumbai',
    college: 'LocalOne Commerce College',
    department: 'B.Com',
    year: 'First Year',
    semester: 'Semester 2',
    rollNumber: 'BC2023056',
    studentId: 'STU-2023-056',
  },
  {
    id: 's-6',
    name: 'Sneha Gupta',
    email: 'sneha.g@college.edu',
    dob: '2003-12-05',
    gender: 'Female',
    contact: '+91 9876543215',
    address: 'Flat 201, Crystal Towers, Thane West, Mumbai',
    college: 'LocalOne Engineering College',
    department: 'Electronics',
    year: 'Third Year',
    semester: 'Semester 6',
    rollNumber: 'EX2021099',
    studentId: 'STU-2021-099',
  },
  {
    id: 's-7',
    name: 'Vikram Joshi',
    email: 'vikram.j@college.edu',
    dob: '2002-07-30',
    gender: 'Male',
    contact: '+91 9876543216',
    address: '9, Lotus Building, Vile Parle East, Mumbai',
    college: 'LocalOne Engineering College',
    department: 'Computer Science',
    year: 'Fourth Year',
    semester: 'Semester 8',
    rollNumber: 'CS2020112',
    studentId: 'STU-2020-112',
  },
  {
    id: 's-8',
    name: 'Meera Reddy',
    email: 'meera.r@college.edu',
    dob: '2004-09-18',
    gender: 'Female',
    contact: '+91 9876543217',
    address: 'C-33, Gokuldham, Goregaon East, Mumbai',
    college: 'LocalOne Arts & Science',
    department: 'Physics',
    year: 'Second Year',
    semester: 'Semester 3',
    rollNumber: 'PH2022041',
    studentId: 'STU-2022-041',
  },
];

export const mockApplications: Application[] = [
  {
    id: 'a-1',
    studentId: 's-1',
    applicationNumber: 'APP-2024-001',
    submittedDate: '2024-05-01T10:30:00Z',
    status: 'Pending',
    sourceStation: 'Andheri',
    destinationStation: 'Churchgate',
    travelType: 'Quarterly',
    validity: 'First Class',
    documents: [
      { id: 'd-1', name: 'ID Card.pdf', type: 'ID', status: 'Pending' },
      { id: 'd-2', name: 'Fee Receipt.pdf', type: 'Bonafide', status: 'Pending' },
    ],
    history: [
      { id: 'h-1', status: 'Pending', date: '2024-05-01T10:30:00Z' }
    ]
  },
  {
    id: 'a-2',
    studentId: 's-2',
    applicationNumber: 'APP-2024-002',
    submittedDate: '2024-05-02T14:15:00Z',
    status: 'Under Review',
    sourceStation: 'Borivali',
    destinationStation: 'Bandra',
    travelType: 'Monthly',
    validity: 'Second Class',
    documents: [
      { id: 'd-3', name: 'ID Card.pdf', type: 'ID', status: 'Verified' },
      { id: 'd-4', name: 'Address Proof.pdf', type: 'AddressProof', status: 'Pending' },
    ],
    history: [
      { id: 'h-2', status: 'Pending', date: '2024-05-02T14:15:00Z' },
      { id: 'h-3', status: 'Under Review', date: '2024-05-03T09:00:00Z' }
    ]
  },
  {
    id: 'a-3',
    studentId: 's-3',
    applicationNumber: 'APP-2024-003',
    submittedDate: '2024-04-28T11:20:00Z',
    status: 'Approved',
    sourceStation: 'Dadar',
    destinationStation: 'Andheri',
    travelType: 'Quarterly',
    validity: 'First Class',
    remarks: 'Verified all documents correctly.',
    documents: [
      { id: 'd-5', name: 'ID Card.pdf', type: 'ID', status: 'Verified' },
      { id: 'd-6', name: 'Bonafide.pdf', type: 'Bonafide', status: 'Verified' },
    ],
    history: [
      { id: 'h-4', status: 'Pending', date: '2024-04-28T11:20:00Z' },
      { id: 'h-5', status: 'Under Review', date: '2024-04-29T10:00:00Z' },
      { id: 'h-6', status: 'College Verification', date: '2024-04-29T15:00:00Z' },
      { id: 'h-7', status: 'Approved', date: '2024-04-30T16:30:00Z', remarks: 'Verified all documents correctly.' }
    ]
  },
  {
    id: 'a-4',
    studentId: 's-4',
    applicationNumber: 'APP-2024-004',
    submittedDate: '2024-05-04T09:45:00Z',
    status: 'Rejected',
    sourceStation: 'Bandra',
    destinationStation: 'Churchgate',
    travelType: 'Monthly',
    validity: 'Second Class',
    remarks: 'Invalid fee receipt uploaded. Please upload the receipt for the current academic year.',
    documents: [
      { id: 'd-7', name: 'ID Card.pdf', type: 'ID', status: 'Verified' },
      { id: 'd-8', name: 'Old_Fee_Receipt.pdf', type: 'Bonafide', status: 'Rejected' },
    ],
    history: [
      { id: 'h-8', status: 'Pending', date: '2024-05-04T09:45:00Z' },
      { id: 'h-9', status: 'Under Review', date: '2024-05-05T11:00:00Z' },
      { id: 'h-10', status: 'Rejected', date: '2024-05-05T14:20:00Z', remarks: 'Invalid fee receipt uploaded. Please upload the receipt for the current academic year.' }
    ]
  },
  {
    id: 'a-5',
    studentId: 's-5',
    applicationNumber: 'APP-2024-005',
    submittedDate: '2024-05-05T16:00:00Z',
    status: 'Pending',
    sourceStation: 'Malad',
    destinationStation: 'Vile Parle',
    travelType: 'Quarterly',
    validity: 'First Class',
    documents: [
      { id: 'd-9', name: 'ID Card.pdf', type: 'ID', status: 'Pending' },
    ],
    history: [
      { id: 'h-11', status: 'Pending', date: '2024-05-05T16:00:00Z' }
    ]
  },
  {
    id: 'a-6',
    studentId: 's-6',
    applicationNumber: 'APP-2024-006',
    submittedDate: '2024-04-20T08:15:00Z',
    status: 'Approved',
    sourceStation: 'Thane',
    destinationStation: 'Dadar',
    travelType: 'Monthly',
    validity: 'Second Class',
    documents: [
      { id: 'd-10', name: 'ID.pdf', type: 'ID', status: 'Verified' },
    ],
    history: [
      { id: 'h-12', status: 'Pending', date: '2024-04-20T08:15:00Z' },
      { id: 'h-13', status: 'Approved', date: '2024-04-22T10:00:00Z' }
    ]
  },
  {
    id: 'a-7',
    studentId: 's-7',
    applicationNumber: 'APP-2024-007',
    submittedDate: '2024-05-06T10:00:00Z',
    status: 'College Verification',
    sourceStation: 'Vile Parle',
    destinationStation: 'Churchgate',
    travelType: 'Quarterly',
    validity: 'First Class',
    documents: [
      { id: 'd-11', name: 'ID.pdf', type: 'ID', status: 'Verified' },
    ],
    history: [
      { id: 'h-14', status: 'Pending', date: '2024-05-06T10:00:00Z' },
      { id: 'h-15', status: 'Under Review', date: '2024-05-06T14:00:00Z' },
      { id: 'h-16', status: 'College Verification', date: '2024-05-07T09:30:00Z' }
    ]
  },
];

export const mockNotifications: Notification[] = [
  {
    id: 'n-1',
    title: 'New Application Submitted',
    message: 'Aarav Patel has submitted a new railway concession application.',
    date: '2024-05-01T10:30:00Z',
    read: false,
    type: 'application',
    link: '/applications/a-1'
  },
  {
    id: 'n-2',
    title: 'Document Uploaded',
    message: 'Priya Sharma has uploaded a new document for her application.',
    date: '2024-05-02T15:20:00Z',
    read: false,
    type: 'application',
    link: '/applications/a-2'
  },
  {
    id: 'n-3',
    title: 'System Maintenance',
    message: 'The portal will be down for maintenance this Sunday from 2 AM to 4 AM.',
    date: '2024-04-25T08:00:00Z',
    read: true,
    type: 'system'
  }
];
