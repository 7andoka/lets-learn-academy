
import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { getStudentData } from '../../services/api.tsx';
import { User, Lesson, AttendanceStatus } from '../../types';

interface StudentData {
  teachers: User[];
  lessons: Lesson[];
}

const StudentDashboard: React.FC = () => {
  const { user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const data = await getStudentData(user.id);
      setStudentData(data);
    } catch (error) {
      console.error("Failed to fetch student data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const lessonsThisMonth = studentData?.lessons.filter(lesson => {
    const lessonDate = new Date(lesson.date);
    const today = new Date();
    return lessonDate.getFullYear() === today.getFullYear() && lessonDate.getMonth() === today.getMonth();
  }).length || 0;

  if (isLoading) {
    return <Layout title="لوحة تحكم الطالب"><div className="text-center p-8">...جارٍ تحميل لوحة التحكم</div></Layout>;
  }

  if (!studentData) {
    return <Layout title="لوحة تحكم الطالب"><div className="text-center p-8">تعذر تحميل بياناتك.</div></Layout>;
  }
  
  const sortedLessons = [...studentData.lessons].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const teacherNames = studentData.teachers.map(t => t.name).join(', ');

  return (
    <Layout title="لوحة تحكم الطالب">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <InfoCard title="معلموك" value={teacherNames || 'غير معين'} />
        <InfoCard title="دروس هذا الشهر" value={lessonsThisMonth.toString()} />
      </div>
      
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">سجل الحضور</h3>
         <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">المادة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">التاريخ</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الحالة</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedLessons.length > 0 ? sortedLessons.map(lesson => (
                  <tr key={lesson.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{lesson.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(lesson.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lesson.status === AttendanceStatus.Present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {lesson.status}
                        </span>
                    </td>
                  </tr>
                )) : (
                     <tr><td colSpan={3} className="text-center py-4 text-gray-500">لم يتم تسجيل أي دروس بعد.</td></tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </Layout>
  );
};


interface InfoCardProps {
    title: string;
    value: string;
}
const InfoCard: React.FC<InfoCardProps> = ({ title, value }) => (
    <div className="bg-white dark:bg-gray-800 overflow-hidden shadow rounded-lg">
        <div className="p-5">
            <div className="flex items-center">
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
                    <p className="mt-1 text-2xl font-semibold text-gray-900 dark:text-white truncate">{value}</p>
                </div>
            </div>
        </div>
    </div>
);


export default StudentDashboard;