import { User, Role, Lesson, AttendanceStatus, Subject, Payment, AccountDetails } from '../types';

// Mock Database using localStorage
const DB = {
  users: 'academy_users',
  lessons: 'academy_lessons',
  subjects: 'academy_subjects',
  payments: 'academy_payments', // Added for financial transactions
  loggedInUser: 'academy_logged_in_user',
};

const defaultSubjects = ["الرياضيات", "العلوم", "التاريخ", "اللغة الإنجليزية", "الفنون", "التربية البدنية"];

const initializeDB = () => {
  if (!localStorage.getItem(DB.users)) {
    const users: User[] = [
      { id: 'admin1', username: 'admin', password: 'password', name: 'Admin User', role: Role.Admin },
      { id: 'teacher1', username: 'teacher1', password: 'password', name: 'John Doe', role: Role.Teacher, defaultSessionPrice: 100 },
      { id: 'teacher2', username: 'teacher2', password: 'password', name: 'Jane Smith', role: Role.Teacher, defaultSessionPrice: 120 },
      { id: 'student1', username: 'student1', password: 'password', name: 'Alice', role: Role.Student, teacherLinks: [{ teacherId: 'teacher1', sessionPrice: 100 }] },
      { id: 'student2', username: 'student2', password: 'password', name: 'Bob', role: Role.Student, teacherLinks: [{ teacherId: 'teacher1', sessionPrice: 110 }, { teacherId: 'teacher2', sessionPrice: 120 }] },
      { id: 'student3', username: 'student3', password: 'password', name: 'Charlie', role: Role.Student, teacherLinks: [{ teacherId: 'teacher2', sessionPrice: 125 }] },
    ];
    localStorage.setItem(DB.users, JSON.stringify(users));
  }
  if (!localStorage.getItem(DB.subjects)) {
      const subjects: Subject[] = defaultSubjects.map((name, index) => ({ id: `sub_${index + 1}`, name }));
      localStorage.setItem(DB.subjects, JSON.stringify(subjects));
  }
  if (!localStorage.getItem(DB.lessons)) {
     const today = new Date();
     const currentMonth = today.toISOString().slice(0, 7);
     const lessons: Lesson[] = [
        { id: 'l1', teacherId: 'teacher1', studentId: 'student1', subject: 'الرياضيات', date: `${currentMonth}-10`, time: '10:00', status: AttendanceStatus.Present, sessionPrice: 100 },
        { id: 'l2', teacherId: 'teacher1', studentId: 'student2', subject: 'العلوم', date: `${currentMonth}-11`, time: '11:00', status: AttendanceStatus.Present, sessionPrice: 110 },
        { id: 'l3', teacherId: 'teacher1', studentId: 'student1', subject: 'الرياضيات', date: `${currentMonth}-17`, time: '10:00', status: AttendanceStatus.Absent, sessionPrice: 100 },
        { id: 'l4', teacherId: 'teacher2', studentId: 'student3', subject: 'التاريخ', date: `${currentMonth}-12`, time: '09:00', status: AttendanceStatus.Present, sessionPrice: 125 },
        { id: 'l5', teacherId: 'teacher2', studentId: 'student2', subject: 'الفنون', date: `${currentMonth}-15`, time: '14:00', status: AttendanceStatus.Present, sessionPrice: 120 },
     ];
    localStorage.setItem(DB.lessons, JSON.stringify(lessons));
  }
  if (!localStorage.getItem(DB.payments)) {
    localStorage.setItem(DB.payments, JSON.stringify([]));
  }
};

initializeDB();

const getUsersFromDB = (): User[] => JSON.parse(localStorage.getItem(DB.users) || '[]');
const getLessonsFromDB = (): Lesson[] => JSON.parse(localStorage.getItem(DB.lessons) || '[]');
const getSubjectsFromDB = (): Subject[] => JSON.parse(localStorage.getItem(DB.subjects) || '[]');
const getPaymentsFromDB = (): Payment[] => JSON.parse(localStorage.getItem(DB.payments) || '[]');

const saveUsersToDB = (users: User[]) => localStorage.setItem(DB.users, JSON.stringify(users));
const saveLessonsToDB = (lessons: Lesson[]) => localStorage.setItem(DB.lessons, JSON.stringify(lessons));
const saveSubjectsToDB = (subjects: Subject[]) => localStorage.setItem(DB.subjects, JSON.stringify(subjects));
const savePaymentsToDB = (payments: Payment[]) => localStorage.setItem(DB.payments, JSON.stringify(payments));


// Simulate network delay
const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// --- Auth Functions ---
export const apiLogin = async (username: string, password: string): Promise<User | null> => {
    await delay(500);
    const users = getUsersFromDB();
    const user = users.find(u => u.username === username && u.password === password);
    if (user) {
        const userToStore = { ...user };
        delete userToStore.password;
        localStorage.setItem(DB.loggedInUser, JSON.stringify(userToStore));
        return userToStore;
    }
    return null;
};

export const apiLogout = async (): Promise<void> => {
    await delay(200);
    localStorage.removeItem(DB.loggedInUser);
};

export const getLoggedInUser = async (): Promise<User | null> => {
    await delay(100);
    const userJson = localStorage.getItem(DB.loggedInUser);
    return userJson ? JSON.parse(userJson) : null;
};

// --- Admin - User Functions ---
export const getUsers = async (): Promise<User[]> => {
    await delay(300);
    return getUsersFromDB().map(({ password, ...user }) => user);
};

export const getTeachers = async (): Promise<User[]> => {
    await delay(300);
    return getUsersFromDB().filter(u => u.role === Role.Teacher).map(({ password, ...user }) => user);
};

export const getStudents = async (): Promise<User[]> => {
    await delay(300);
    return getUsersFromDB().filter(u => u.role === Role.Student).map(({ password, ...user }) => user);
}

export const addUser = async (newUser: User): Promise<User> => {
    await delay(400);
    const users = getUsersFromDB();
    if (users.some(u => u.username === newUser.username)) {
        throw new Error("Username already exists");
    }
    const userWithId = { ...newUser, id: `user_${Date.now()}` };
    if (userWithId.role !== Role.Student) {
        delete userWithId.teacherLinks;
    }
    if (userWithId.role !== Role.Teacher) {
        delete userWithId.defaultSessionPrice;
    }
    users.push(userWithId);
    saveUsersToDB(users);
    const { password, ...userToReturn } = userWithId;
    return userToReturn;
};

export const updateUser = async (updatedUser: User): Promise<User> => {
    await delay(400);
    let users = getUsersFromDB();
    const userIndex = users.findIndex(u => u.id === updatedUser.id);
    if (userIndex === -1) throw new Error("User not found");
    
    const existingUser = users[userIndex];
    const userToSave = { ...existingUser, ...updatedUser };

    if (!updatedUser.password) {
        userToSave.password = existingUser.password;
    }
    
    if (userToSave.role !== Role.Student) {
        delete userToSave.teacherLinks;
    } else {
        userToSave.teacherLinks = updatedUser.teacherLinks || [];
    }

    if (userToSave.role !== Role.Teacher) {
        delete userToSave.defaultSessionPrice;
    } else {
        userToSave.defaultSessionPrice = updatedUser.defaultSessionPrice || 0;
    }
    
    users[userIndex] = userToSave;
    saveUsersToDB(users);
    
    const { password, ...userToReturn } = userToSave;
    return userToReturn;
};

export const deleteUser = async (userId: string): Promise<void> => {
    await delay(500);
    let users = getUsersFromDB();
    const lessons = getLessonsFromDB();

    const userToDelete = users.find(u => u.id === userId);
    if(!userToDelete) return;

    if (userToDelete.role === Role.Teacher) {
        if (lessons.some(l => l.teacherId === userId)) {
            throw new Error("Cannot delete teacher with assigned lessons.");
        }
        users.forEach(u => {
            if(u.role === Role.Student && u.teacherLinks) {
                u.teacherLinks = u.teacherLinks.filter(link => link.teacherId !== userId);
            }
        });

    }
    if (userToDelete.role === Role.Student) {
        if (lessons.some(l => l.studentId === userId)) {
             throw new Error("Cannot delete student with assigned lessons.");
        }
    }
    
    users = users.filter(u => u.id !== userId);
    saveUsersToDB(users);
};

// --- Admin - Subject Functions ---
export const getSubjects = async(): Promise<Subject[]> => {
    await delay(200);
    return getSubjectsFromDB();
};

export const addSubject = async (name: string): Promise<Subject> => {
    await delay(300);
    const subjects = getSubjectsFromDB();
    if (subjects.some(s => s.name.toLowerCase() === name.toLowerCase())) {
        throw new Error("Subject already exists");
    }
    const newSubject: Subject = { id: `sub_${Date.now()}`, name };
    subjects.push(newSubject);
    saveSubjectsToDB(subjects);
    return newSubject;
};

export const updateSubject = async (id: string, name: string): Promise<Subject> => {
    await delay(300);
    const subjects = getSubjectsFromDB();
    const subjectIndex = subjects.findIndex(s => s.id === id);
    if (subjectIndex === -1) throw new Error("Subject not found");
    subjects[subjectIndex].name = name;
    saveSubjectsToDB(subjects);
    return subjects[subjectIndex];
};

export const deleteSubject = async (id: string): Promise<void> => {
    await delay(400);
    const subjects = getSubjectsFromDB();
    const lessons = getLessonsFromDB();
    const subjectToDelete = subjects.find(s => s.id === id);
    if (!subjectToDelete) return;

    if(lessons.some(l => l.subject === subjectToDelete.name)) {
        throw new Error("Cannot delete subject that is used in lessons.");
    }
    
    const updatedSubjects = subjects.filter(s => s.id !== id);
    saveSubjectsToDB(updatedSubjects);
};


// --- Report Functions ---
export const getTeacherLessonReport = async (teacherId: string): Promise<{ name: string; lessons: number }[]> => {
    await delay(600);
    const users = getUsersFromDB();
    const lessons = getLessonsFromDB().filter(l => l.teacherId === teacherId);
    
    const report: { [studentId: string]: { name: string; lessons: number } } = {};

    lessons.forEach(lesson => {
        if (!report[lesson.studentId]) {
            const student = users.find(u => u.id === lesson.studentId);
            report[lesson.studentId] = { name: student?.name || 'Unknown', lessons: 0 };
        }
        report[lesson.studentId].lessons++;
    });

    return Object.values(report);
};

export const getStudentLessonReport = async (studentId: string): Promise<{ name: string; lessons: number }[]> => {
    await delay(600);
    const users = getUsersFromDB();
    const lessons = getLessonsFromDB().filter(l => l.studentId === studentId);
    
    const report: { [teacherId: string]: { name: string; lessons: number } } = {};

    lessons.forEach(lesson => {
        if (!report[lesson.teacherId]) {
            const teacher = users.find(u => u.id === lesson.teacherId);
            report[lesson.teacherId] = { name: teacher?.name || 'Unknown', lessons: 0 };
        }
        report[lesson.teacherId].lessons++;
    });

    return Object.values(report);
};

export const getAllLessons = async (): Promise<Lesson[]> => {
    await delay(300);
    return getLessonsFromDB();
};

// --- Teacher Functions ---
export const getAssignedStudents = async (teacherId: string): Promise<User[]> => {
    await delay(300);
    return getUsersFromDB()
        .filter(u => u.role === Role.Student && u.teacherLinks?.some(link => link.teacherId === teacherId))
        .map(({ password, ...user }) => user);
};

export const getTeacherLessons = async (teacherId: string): Promise<Lesson[]> => {
    await delay(300);
    return getLessonsFromDB().filter(l => l.teacherId === teacherId);
};

export const addLesson = async (newLesson: Omit<Lesson, 'id' | 'sessionPrice'>): Promise<Lesson> => {
    await delay(400);
    const lessons = getLessonsFromDB();
    const users = getUsersFromDB();
    
    const student = users.find(u => u.id === newLesson.studentId);
    const teacher = users.find(u => u.id === newLesson.teacherId);

    let price = teacher?.defaultSessionPrice || 0;
    if (student && student.teacherLinks) {
        const link = student.teacherLinks.find(l => l.teacherId === newLesson.teacherId);
        if (link) {
            price = link.sessionPrice;
        }
    }

    const lessonWithId: Lesson = { ...newLesson, id: `lesson_${Date.now()}`, sessionPrice: price };
    lessons.push(lessonWithId);
    saveLessonsToDB(lessons);
    return lessonWithId;
};

// --- Student Functions ---
export const getStudentData = async (studentId: string): Promise<{ teachers: User[]; lessons: Lesson[] }> => {
    await delay(500);
    const users = getUsersFromDB();
    const lessons = getLessonsFromDB();

    const student = users.find(u => u.id === studentId);
    if (!student) throw new Error("Student not found");
    
    const teacherIds = student.teacherLinks?.map(l => l.teacherId) || [];

    const teachers = users
        .filter(u => teacherIds.includes(u.id))
        .map(({ password, ...user }) => user);
    
    const studentLessons = lessons.filter(l => l.studentId === studentId);
    return { teachers, lessons: studentLessons };
};

// --- Accounting Functions ---
export const addPayment = async (paymentData: Omit<Payment, 'id'>): Promise<Payment> => {
    await delay(400);
    const payments = getPaymentsFromDB();
    const newPayment: Payment = { ...paymentData, id: `pay_${Date.now()}` };
    payments.push(newPayment);
    savePaymentsToDB(payments);
    return newPayment;
};

export const getAccountDetails = async (userId: string, role: Role, startDate?: string, endDate?: string): Promise<AccountDetails> => {
    await delay(600);
    const allLessons = getLessonsFromDB();
    const allPayments = getPaymentsFromDB();

    const filterByDate = (itemDate: string) => {
        const iDate = new Date(itemDate);
        const sDate = startDate ? new Date(startDate) : null;
        const eDate = endDate ? new Date(endDate) : null;
        if (sDate) sDate.setHours(0,0,0,0);
        if (eDate) eDate.setHours(23,59,59,999);

        if (sDate && iDate < sDate) return false;
        if (eDate && iDate > eDate) return false;
        return true;
    };

    const relevantLessons = allLessons.filter(l => {
        const userMatch = role === Role.Teacher ? l.teacherId === userId : l.studentId === userId;
        return userMatch && l.status === AttendanceStatus.Present && filterByDate(l.date);
    });

    const relevantPayments = allPayments.filter(p => p.userId === userId && filterByDate(p.date));

    const totalDue = relevantLessons.reduce((sum, lesson) => sum + lesson.sessionPrice, 0);
    const totalPaid = relevantPayments.reduce((sum, payment) => sum + payment.amount, 0);

    // For teachers, balance is what we owe them (Due - Paid)
    // For students, balance is what they owe us (Due - Paid)
    const balance = totalDue - totalPaid;

    return {
        lessons: relevantLessons,
        payments: relevantPayments,
        totalDue,
        totalPaid,
        balance,
    };
};
