import React, { useState, useEffect, useCallback } from 'react';
import { Subject } from '../../types';
import { getSubjects, addSubject, updateSubject, deleteSubject } from '../../services/api.tsx';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../../components/icons';

const Notification: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => (
    <div className={`p-4 mb-4 text-sm rounded-lg flex justify-between items-center ${type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`} role="alert">
      <span>{message}</span>
      <button onClick={onClose} aria-label="إغلاق" className="text-lg font-semibold hover:opacity-75 transition-opacity">&times;</button>
    </div>
  );

const SubjectManagement: React.FC = () => {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
        setNotification(null);
    }, 5000);
  };

  const fetchSubjects = useCallback(async () => {
    try {
        const allSubjects = await getSubjects();
        setSubjects(allSubjects);
    } catch (error) {
        console.error("Failed to fetch subjects:", error);
        showNotification("فشل في جلب المواد الدراسية.", "error");
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSubjects();
  }, [fetchSubjects]);

  const handleAdd = () => {
    setEditingSubject(null);
    setIsModalOpen(true);
  };

  const handleEdit = (subject: Subject) => {
    setEditingSubject(subject);
    setIsModalOpen(true);
  };
  
  const handleDelete = async (id: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذه المادة؟')) {
        try {
            await deleteSubject(id);
            showNotification("تم حذف المادة بنجاح.", "success");
            fetchSubjects();
        } catch (error) {
            console.error("Failed to delete subject:", error);
            const errorMessage = (error as Error).message || "فشل حذف المادة.";
            showNotification(errorMessage, "error");
        }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingSubject(null);
  };

  const handleFormSubmit = async (subject: { id?: string, name: string }) => {
    try {
      if (subject.id) {
        await updateSubject(subject.id, subject.name);
        showNotification("تم تحديث المادة بنجاح.", "success");
      } else {
        await addSubject(subject.name);
        showNotification("تمت إضافة المادة بنجاح.", "success");
      }
      fetchSubjects();
      handleModalClose();
    } catch (error) {
      console.error("Failed to save subject:", error);
      showNotification("فشل حفظ المادة. قد يكون الاسم موجودًا بالفعل.", "error");
    }
  };
  
  if (isLoading) {
    return <div className="text-center p-8">...جارٍ تحميل المواد الدراسية</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      {notification && (
        <Notification 
          message={notification.message} 
          type={notification.type} 
          onClose={() => setNotification(null)} 
        />
      )}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">قائمة المواد الدراسية</h3>
        <button
          onClick={handleAdd}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          إضافة مادة
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">اسم المادة</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {subjects.map((subject) => (
              <tr key={subject.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{subject.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <button onClick={() => handleEdit(subject)} className="text-primary-600 hover:text-primary-900 ml-4"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => handleDelete(subject.id)} className="text-red-600 hover:text-red-900"><DeleteIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <SubjectFormModal 
            isOpen={isModalOpen} 
            onClose={handleModalClose} 
            onSubmit={handleFormSubmit} 
            subject={editingSubject} 
        />
      )}
    </div>
  );
};

interface SubjectFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (subject: { id?: string, name: string }) => void;
    subject: Subject | null;
}

const SubjectFormModal: React.FC<SubjectFormModalProps> = ({ isOpen, onClose, onSubmit, subject }) => {
    const [name, setName] = useState(subject?.name || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if(!name.trim()) return;
        onSubmit({ id: subject?.id, name });
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={subject ? 'تعديل المادة' : 'إضافة مادة'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم المادة</label>
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">إلغاء</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};

export default SubjectManagement;