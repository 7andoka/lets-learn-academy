export enum Role {
  Admin = 'Admin',
  Teacher = 'Teacher',
  Student = 'Student',
}

export enum AttendanceStatus {
  Present = 'Present',
  Absent = 'Absent',
}

export interface TeacherLink {
  teacherId: string;
  sessionPrice: number;
}

export interface User {
  id: string;
  username: string;
  password?: string;
  name: string;
  role: Role;
  teacherLinks?: TeacherLink[];
  defaultSessionPrice?: number;
}

export interface Lesson {
  id: string;
  teacherId: string;
  studentId: string;
  subject: string;
  date: string;
  time: string;
  status: AttendanceStatus;
  sessionPrice: number;
}

export interface Subject {
  id:string;
  name: string;
}

export interface Payment {
  id: string;
  userId: string;
  amount: number;
  date: string;
  type: 'paid_to_teacher' | 'received_from_student';
}

export interface AccountDetails {
  lessons: Lesson[];
  payments: Payment[];
  totalDue: number;
  totalPaid: number;
  balance: number;
}
