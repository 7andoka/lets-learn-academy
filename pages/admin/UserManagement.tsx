import React, { useState, useEffect, useCallback } from 'react';
import { User, Role } from '../../types';
import { getUsers, getTeachers, addUser, updateUser, deleteUser } from '../../services/api.tsx';
import Modal from '../../components/Modal';
import { PlusIcon, EditIcon, DeleteIcon } from '../../components/icons';
import { ROLES } from '../../constants';

const Notification: React.FC<{ message: string; type: 'success' | 'error'; onClose: () => void }> = ({ message, type, onClose }) => (
    <div className={`p-4 mb-4 text-sm rounded-lg flex justify-between items-center ${type === 'success' ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200' : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'}`} role="alert">
      <span>{message}</span>
      <button onClick={onClose} aria-label="إغلاق" className="text-lg font-semibold hover:opacity-75 transition-opacity">&times;</button>
    </div>
  );

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [teachers, setTeachers] = useState<User[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => {
        setNotification(null);
    }, 5000);
  };

  const fetchUsers = useCallback(async () => {
    try {
        const [allUsers, allTeachers] = await Promise.all([getUsers(), getTeachers()]);
        setUsers(allUsers);
        setTeachers(allTeachers);
    } catch (error) {
        console.error("Failed to fetch users:", error);
        showNotification("فشل في جلب بيانات المستخدم.", "error");
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };
  
  const handleDeleteUser = async (userId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المستخدم؟ لا يمكن التراجع عن هذا الإجراء.')) {
        try {
            await deleteUser(userId);
            showNotification("تم حذف المستخدم بنجاح.", "success");
            fetchUsers();
        } catch (error) {
            console.error("Failed to delete user:", error);
            const errorMessage = (error as Error).message || "فشل حذف المستخدم. قد يكونون مرتبطين بدروس حالية.";
            showNotification(errorMessage, "error");
        }
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingUser(null);
  };

  const handleFormSubmit = async (user: User) => {
    try {
      if (editingUser) {
        await updateUser(user);
        showNotification("تم تحديث المستخدم بنجاح.", "success");
      } else {
        await addUser(user);
        showNotification("تمت إضافة المستخدم بنجاح.", "success");
      }
      fetchUsers();
      handleModalClose();
    } catch (error) {
      console.error("Failed to save user:", error);
      showNotification("فشل حفظ المستخدم. قد يكون اسم المستخدم موجودًا بالفعل.", "error");
    }
  };
  
  const getTeacherLinksInfo = (teacherLinks?: { teacherId: string; sessionPrice: number }[]) => {
    if (!teacherLinks || teacherLinks.length === 0) return 'لا ينطبق';
    return teacherLinks.map(link => {
        const teacherName = teachers.find(t => t.id === link.teacherId)?.name || 'غير معروف';
        return `${teacherName} (${link.sessionPrice})`;
    }).join(', ');
  }

  if (isLoading) {
    return <div className="text-center p-8">...جارٍ تحميل المستخدمين</div>;
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
        <h3 className="text-xl font-semibold text-gray-800 dark:text-white">قائمة المستخدمين</h3>
        <button
          onClick={handleAddUser}
          className="flex items-center bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition"
        >
          <PlusIcon className="w-5 h-5 ml-2" />
          إضافة مستخدم
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الاسم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">اسم المستخدم</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الدور</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">تفاصيل الدور</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">الإجراءات</th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.username}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">
                  {user.role === Role.Student ? getTeacherLinksInfo(user.teacherLinks) : 
                   user.role === Role.Teacher ? `السعر الافتراضي: ${user.defaultSessionPrice}` : 'لا ينطبق'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-left text-sm font-medium">
                  <button onClick={() => handleEditUser(user)} className="text-primary-600 hover:text-primary-900 ml-4"><EditIcon className="w-5 h-5"/></button>
                  <button onClick={() => handleDeleteUser(user.id)} className="text-red-600 hover:text-red-900"><DeleteIcon className="w-5 h-5"/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {isModalOpen && (
        <UserFormModal 
            isOpen={isModalOpen} 
            onClose={handleModalClose} 
            onSubmit={handleFormSubmit} 
            user={editingUser} 
            teachers={teachers} 
        />
      )}
    </div>
  );
};

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (user: User) => void;
    user: User | null;
    teachers: User[];
}

const UserFormModal: React.FC<UserFormModalProps> = ({ isOpen, onClose, onSubmit, user, teachers }) => {
    const [formData, setFormData] = useState<Omit<User, 'id'> & {id?: string}>({
        id: user?.id || undefined,
        name: user?.name || '',
        username: user?.username || '',
        password: '',
        role: user?.role || Role.Student,
        teacherLinks: user?.teacherLinks || [],
        defaultSessionPrice: user?.defaultSessionPrice || 100,
    });
    const [formError, setFormError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        if(formError) setFormError('');
        const { name, value, type } = e.target;
        const isNumber = type === 'number';
        setFormData(prev => ({ ...prev, [name]: isNumber ? parseFloat(value) : value }));
    };

    const handleTeacherLinkChange = (teacherId: string, isChecked: boolean, price?: number) => {
        if(formError) setFormError('');
        setFormData(prev => {
            let newLinks = [...(prev.teacherLinks || [])];
            if (isChecked) {
                const teacher = teachers.find(t => t.id === teacherId);
                newLinks.push({ teacherId, sessionPrice: price ?? teacher?.defaultSessionPrice ?? 0 });
            } else {
                newLinks = newLinks.filter(link => link.teacherId !== teacherId);
            }
            return { ...prev, teacherLinks: newLinks };
        });
    };
    
    const handleTeacherPriceChange = (teacherId: string, price: number) => {
        setFormData(prev => {
            const newLinks = (prev.teacherLinks || []).map(link => 
                link.teacherId === teacherId ? { ...link, sessionPrice: price } : link
            );
            return { ...prev, teacherLinks: newLinks };
        });
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        let userToSubmit: any = {...formData};

        if (!user && !formData.password) {
            setFormError('كلمة المرور مطلوبة للمستخدمين الجدد.');
            return;
        }
        if (!formData.password) {
            delete userToSubmit.password;
        }

        if(formData.role !== Role.Student) delete userToSubmit.teacherLinks;
        if(formData.role !== Role.Teacher) delete userToSubmit.defaultSessionPrice;
        
        onSubmit(userToSubmit as User);
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={user ? 'تعديل مستخدم' : 'إضافة مستخدم'}>
            <form onSubmit={handleSubmit} className="space-y-4">
                 <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الاسم</label>
                    <input type="text" name="name" value={formData.name} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">اسم المستخدم</label>
                    <input type="text" name="username" value={formData.username} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">كلمة المرور</label>
                    <input type="password" name="password" value={formData.password} onChange={handleChange} placeholder={user ? "اتركه فارغًا للحفاظ على كلمة المرور" : ""} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">الدور</label>
                    <select name="role" value={formData.role} onChange={handleChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                        {ROLES.map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                </div>
                
                {formData.role === Role.Teacher && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">سعر الحصة الافتراضي</label>
                        <input type="number" name="defaultSessionPrice" value={formData.defaultSessionPrice} onChange={handleChange} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                )}
                
                {formData.role === Role.Student && (
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">تعيين معلمين وأسعار</label>
                        <div className="mt-2 space-y-3 max-h-48 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-3">
                           {teachers.map(t => {
                                const link = formData.teacherLinks?.find(l => l.teacherId === t.id);
                                const isChecked = !!link;
                                return (
                                <div key={t.id} className="flex items-center justify-between gap-3 p-2 bg-gray-50 dark:bg-gray-700 rounded-md">
                                    <label className="flex items-center flex-grow">
                                        <input 
                                            type="checkbox" 
                                            checked={isChecked} 
                                            onChange={(e) => handleTeacherLinkChange(t.id, e.target.checked)} 
                                            className="h-4 w-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                                        />
                                        <span className="mr-3 text-sm text-gray-800 dark:text-gray-200">{t.name}</span>
                                    </label>
                                    <div className="flex items-center">
                                         <label className="text-sm text-gray-500 dark:text-gray-400 ml-2">السعر:</label>
                                         <input
                                            type="number"
                                            value={isChecked ? link.sessionPrice : (t.defaultSessionPrice || '')}
                                            onChange={(e) => handleTeacherPriceChange(t.id, parseFloat(e.target.value))}
                                            disabled={!isChecked}
                                            className="w-24 rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-600 dark:border-gray-500 dark:text-white disabled:bg-gray-200 dark:disabled:bg-gray-800"
                                         />
                                    </div>
                                </div>
                            )})}
                        </div>
                    </div>
                )}
                {formError && <p className="text-red-500 text-sm text-center pt-2">{formError}</p>}
                <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">إلغاء</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">حفظ</button>
                </div>
            </form>
        </Modal>
    );
};


export default UserManagement;