import React, { useState, useEffect, useMemo } from 'react';
import { getAllLessons, getUsers } from '../../services/api';
import { Lesson, User, Role, AttendanceStatus } from '../../types';
import { PrintIcon } from '../../components/icons';

const LessonLog: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    studentId: 'all',
    teacherId: 'all',
    startDate: '',
    endDate: '',
  });

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [lessonsData, usersData] = await Promise.all([getAllLessons(), getUsers()]);
        setLessons(lessonsData);
        setUsers(usersData);
      } catch (error) {
        console.error("Failed to fetch lesson log data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);
  
  const students = useMemo(() => users.filter(u => u.role === Role.Student), [users]);
  const teachers = useMemo(() => users.filter(u => u.role === Role.Teacher), [users]);
  
  const lessonsWithNames = useMemo(() => {
    if (!users.length) return [];
    const userMap = new Map(users.map(u => [u.id, u.name]));
    return lessons.map(lesson => ({
      ...lesson,
      studentName: userMap.get(lesson.studentId) || 'غير معروف',
      teacherName: userMap.get(lesson.teacherId) || 'غير معروف',
    }));
  }, [lessons, users]);

  const filteredLessons = useMemo(() => {
    return lessonsWithNames
      .filter(lesson => {
        const lessonDate = new Date(lesson.date);
        const startDate = filters.startDate ? new Date(filters.startDate) : null;
        const endDate = filters.endDate ? new Date(filters.endDate) : null;
        
        if (startDate) startDate.setHours(0, 0, 0, 0);
        if (endDate) endDate.setHours(23, 59, 59, 999);

        const studentMatch = filters.studentId === 'all' || lesson.studentId === filters.studentId;
        const teacherMatch = filters.teacherId === 'all' || lesson.teacherId === filters.teacherId;
        const startDateMatch = !startDate || lessonDate >= startDate;
        const endDateMatch = !endDate || lessonDate <= endDate;
        
        return studentMatch && teacherMatch && startDateMatch && endDateMatch;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [lessonsWithNames, filters]);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return <div className="text-center p-8">...جارٍ تحميل سجل الدروس</div>;
  }
  
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      <div className="print:hidden">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">فلترة سجل الدروس</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label htmlFor="studentId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">الطالب</label>
            <select id="studentId" name="studentId" value={filters.studentId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="all">كل الطلاب</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="teacherId" className="block text-sm font-medium text-gray-700 dark:text-gray-300">المعلم</label>
            <select id="teacherId" name="teacherId" value={filters.teacherId} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
              <option value="all">كل المعلمين</option>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">من تاريخ</label>
            <input type="date" id="startDate" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">إلى تاريخ</label>
            <input type="date" id="endDate" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
          </div>
        </div>
        <div className="flex justify-end mb-4">
            <button
                onClick={handlePrint}
                className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
                aria-label="Print or Export to PDF"
            >
                <PrintIcon className="w-5 h-5 ml-2" />
                طباعة / تصدير PDF
            </button>
        </div>
      </div>
      <div id="printable-report">
        <h2 className="text-2xl font-bold text-center mb-4 hidden print:block">تقرير سجل الدروس</h2>
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 print:divide-none">
            <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الطالب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">المعلم</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">المادة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">التاريخ والوقت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الحضور</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">سعر الحصة</th>
                </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLessons.length > 0 ? filteredLessons.map(lesson => (
                <tr key={lesson.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{lesson.studentName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{lesson.teacherName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{lesson.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(lesson.date).toLocaleDateString('ar-EG')} at {lesson.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lesson.status === AttendanceStatus.Present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                        {lesson.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{lesson.sessionPrice}</td>
                </tr>
                )) : (
                    <tr><td colSpan={6} className="text-center py-4 text-gray-500">لم يتم العثور على دروس تطابق الفلاتر المحددة.</td></tr>
                )}
            </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default LessonLog;