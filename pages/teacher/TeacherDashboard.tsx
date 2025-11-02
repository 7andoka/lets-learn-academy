import React, { useState, useEffect, useCallback } from 'react';
import Layout from '../../components/Layout';
import { useAuth } from '../../hooks/useAuth';
import { getAssignedStudents, getTeacherLessons, addLesson, getSubjects } from '../../services/api.tsx';
import { User, Lesson, AttendanceStatus, Subject } from '../../types';
import Modal from '../../components/Modal';
import { PlusIcon, StudentsIcon, BookIcon } from '../../components/icons';

const TeacherDashboard: React.FC = () => {
  const { user } = useAuth();
  const [students, setStudents] = useState<User[]>([]);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<string>('all');
  const [selectedMonth, setSelectedMonth] = useState<string>(new Date().toISOString().slice(0, 7));

  const fetchData = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);
    try {
      const [assignedStudents, teacherLessons, subjectsData] = await Promise.all([
        getAssignedStudents(user.id),
        getTeacherLessons(user.id),
        getSubjects(),
      ]);
      setStudents(assignedStudents);
      setLessons(teacherLessons);
      setSubjects(subjectsData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddLesson = async (lesson: Omit<Lesson, 'id' | 'teacherId' | 'sessionPrice'>) => {
    if (!user) return;
    try {
      await addLesson({ ...lesson, teacherId: user.id });
      fetchData();
      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to add lesson:", error);
      alert('فشل في إضافة الدرس.');
    }
  };

  const getStudentName = (studentId: string) => {
    return students.find(s => s.id === studentId)?.name || 'طالب غير معروف';
  };
  
  const filteredLessons = lessons.filter(lesson => {
      const lessonMonth = lesson.date.slice(0, 7);
      const studentMatch = selectedStudent === 'all' || lesson.studentId === selectedStudent;
      const monthMatch = lessonMonth === selectedMonth;
      return studentMatch && monthMatch;
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  if (isLoading) {
    return <Layout title="لوحة تحكم المعلم"><div className="text-center p-8">...جارٍ تحميل لوحة التحكم</div></Layout>;
  }

  return (
    <Layout title="لوحة تحكم المعلم">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Assigned Students */}
        <div className="md:col-span-1 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <h3 className="flex items-center text-xl font-semibold text-gray-800 dark:text-white mb-4">
            <StudentsIcon className="w-6 h-6 ml-3 text-primary-600" />
            الطلاب المعينون
          </h3>
          <ul className="space-y-2">
            {students.length > 0 ? students.map(student => (
              <li key={student.id} className="text-gray-600 dark:text-gray-300">{student.name}</li>
            )) : (
              <li className="text-gray-500 italic">لم يتم تعيين طلاب.</li>
            )}
          </ul>
        </div>

        {/* Lesson Management */}
        <div className="md:col-span-2 bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
          <div className="flex flex-wrap justify-between items-center mb-4 gap-4">
            <h3 className="flex items-center text-xl font-semibold text-gray-800 dark:text-white">
                <BookIcon className="w-6 h-6 ml-3 text-primary-600"/>
                ملخص الدرس
            </h3>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
            >
              <PlusIcon className="w-5 h-5 ml-2" />
              إضافة درس
            </button>
          </div>
          
          <div className="flex flex-wrap gap-4 mb-4">
            <div>
                <label htmlFor="studentFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">الطالب</label>
                <select id="studentFilter" value={selectedStudent} onChange={e => setSelectedStudent(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <option value="all">كل الطلاب</option>
                    {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                </select>
            </div>
             <div>
                <label htmlFor="monthFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300">الشهر</label>
                <input type="month" id="monthFilter" value={selectedMonth} onChange={e => setSelectedMonth(e.target.value)} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الطالب</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">المادة</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">التاريخ والوقت</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">الحضور</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredLessons.length > 0 ? filteredLessons.map(lesson => (
                  <tr key={lesson.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{getStudentName(lesson.studentId)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{lesson.subject}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(lesson.date).toLocaleDateString()} at {lesson.time}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${lesson.status === AttendanceStatus.Present ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {lesson.status}
                        </span>
                    </td>
                  </tr>
                )) : (
                    <tr><td colSpan={4} className="text-center py-4 text-gray-500">لم يتم العثور على دروس لهذا الفلتر.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <LessonFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddLesson}
        students={students}
        subjects={subjects}
      />
    </Layout>
  );
};

interface LessonFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (lesson: Omit<Lesson, 'id' | 'teacherId' | 'sessionPrice'>) => void;
    students: User[];
    subjects: Subject[];
}

const LessonFormModal: React.FC<LessonFormModalProps> = ({isOpen, onClose, onSubmit, students, subjects}) => {
    const [formData, setFormData] = useState({
        studentId: '',
        subject: subjects.length > 0 ? subjects[0].name : '',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        status: AttendanceStatus.Present
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.studentId) {
            alert('الرجاء اختيار طالب.');
            return;
        }
        onSubmit(formData);
    }
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="إضافة درس جديد">
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الطالب</label>
                    <select name="studentId" value={formData.studentId} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        <option value="">اختر طالبًا</option>
                        {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">المادة</label>
                    <select name="subject" value={formData.subject} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        {subjects.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                    </select>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">التاريخ</label>
                        <input type="date" name="date" value={formData.date} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الوقت</label>
                        <input type="time" name="time" value={formData.time} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الحاضر</label>
                    <div className="mt-2 flex gap-4">
                        <label className="flex items-center">
                           <input type="radio" name="status" value={AttendanceStatus.Present} checked={formData.status === AttendanceStatus.Present} onChange={handleChange} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"/>
                           <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">حاضر</span>
                        </label>
                        <label className="flex items-center">
                           <input type="radio" name="status" value={AttendanceStatus.Absent} checked={formData.status === AttendanceStatus.Absent} onChange={handleChange} className="focus:ring-primary-500 h-4 w-4 text-primary-600 border-gray-300"/>
                           <span className="mr-2 text-sm text-gray-700 dark:text-gray-300">غائب</span>
                        </label>
                    </div>
                </div>
                 <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">إلغاء</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">إضافة درس</button>
                </div>
            </form>
        </Modal>
    )
}

export default TeacherDashboard;