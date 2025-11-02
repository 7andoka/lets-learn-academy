
import React, { useState, useEffect, useCallback } from 'react';
import { getStudents, getTeachers, getStudentLessonReport, getTeacherLessonReport } from '../../services/api.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { User } from '../../types';

interface ReportData {
  name: string;
  lessons: number;
}

const Reports: React.FC = () => {
  const [students, setStudents] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [selectedTeacher, setSelectedTeacher] = useState<string>('');
  const [studentReportData, setStudentReportData] = useState<ReportData[]>([]);
  const [teacherReportData, setTeacherReportData] = useState<ReportData[]>([]);
  const [isLoading, setIsLoading] = useState({ lists: true, studentReport: false, teacherReport: false });

  const fetchLists = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, lists: true }));
    try {
      const [studentsData, teachersData] = await Promise.all([getStudents(), getTeachers()]);
      setStudents(studentsData);
      setTeachers(teachersData);
    } catch (error) {
      console.error("Failed to fetch lists:", error);
    } finally {
      setIsLoading(prev => ({ ...prev, lists: false }));
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  useEffect(() => {
    if (selectedStudent) {
      setIsLoading(prev => ({ ...prev, studentReport: true }));
      getStudentLessonReport(selectedStudent)
        .then(setStudentReportData)
        .finally(() => setIsLoading(prev => ({ ...prev, studentReport: false })));
    } else {
        setStudentReportData([]);
    }
  }, [selectedStudent]);
  
  useEffect(() => {
    if (selectedTeacher) {
      setIsLoading(prev => ({ ...prev, teacherReport: true }));
      getTeacherLessonReport(selectedTeacher)
        .then(setTeacherReportData)
        .finally(() => setIsLoading(prev => ({ ...prev, teacherReport: false })));
    } else {
        setTeacherReportData([]);
    }
  }, [selectedTeacher]);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">تقرير دروس الطالب لكل معلم</h3>
        <div className="mb-4">
            <label htmlFor="student-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">اختر طالبًا</label>
            <select
                id="student-select"
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="mt-1 block w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading.lists}
            >
                <option value="">-- اختر طالبًا --</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
        </div>
        {isLoading.studentReport ? <div className="text-center p-8 h-[300px]">...جارٍ تحميل التقرير</div> : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={studentReportData} margin={{ top: 5, left: 20, right: -10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="lessons" name="دروس مع المعلم" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">تقرير دروس المعلم لكل طالب</h3>
         <div className="mb-4">
            <label htmlFor="teacher-select" className="block text-sm font-medium text-gray-700 dark:text-gray-300">اختر معلمًا</label>
            <select
                id="teacher-select"
                value={selectedTeacher}
                onChange={(e) => setSelectedTeacher(e.target.value)}
                className="mt-1 block w-full md:w-1/3 rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                disabled={isLoading.lists}
            >
                <option value="">-- اختر معلمًا --</option>
                {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
        </div>
         {isLoading.teacherReport ? <div className="text-center p-8 h-[300px]">...جارٍ تحميل التقرير</div> : (
            <ResponsiveContainer width="100%" height={300}>
            <BarChart data={teacherReportData} margin={{ top: 5, left: 20, right: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="lessons" name="دروس للطالب" fill="#10b981" />
            </BarChart>
            </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default Reports;