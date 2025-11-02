// FIX: Add useMemo to react imports
import React, { useState, useEffect, useCallback, useMemo } from 'react';
// FIX: Import AccountDetails from types.ts instead of services/api.tsx
import { User, Role, Lesson, Payment, AccountDetails } from '../../types';
// FIX: Remove AccountDetails from services/api.tsx import
import { getTeachers, getStudents, addPayment, getAccountDetails } from '../../services/api';
import Modal from '../../components/Modal';

type View = 'teachers' | 'students';

const Accounts: React.FC = () => {
  const [view, setView] = useState<View>('teachers');
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [filters, setFilters] = useState({ startDate: '', endDate: '' });
  const [accountDetails, setAccountDetails] = useState<AccountDetails | null>(null);
  const [isLoading, setIsLoading] = useState({ users: true, details: false });
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    setIsLoading(prev => ({ ...prev, users: true }));
    try {
      const usersData = view === 'teachers' ? await getTeachers() : await getStudents();
      setUsers(usersData);
    } catch (error) {
      console.error(`Failed to fetch ${view}:`, error);
    } finally {
      setIsLoading(prev => ({ ...prev, users: false }));
    }
  }, [view]);

  useEffect(() => {
    fetchUsers();
    setSelectedUser(null);
    setAccountDetails(null);
  }, [view, fetchUsers]);
  
  const fetchAccountDetails = useCallback(async () => {
      if(!selectedUser) return;
      setIsLoading(prev => ({...prev, details: true}));
      try {
          const details = await getAccountDetails(selectedUser.id, selectedUser.role, filters.startDate, filters.endDate);
          setAccountDetails(details);
      } catch(error){
           console.error(`Failed to fetch account details for ${selectedUser.name}:`, error);
           setAccountDetails(null);
      } finally {
          setIsLoading(prev => ({...prev, details: false}));
      }
  }, [selectedUser, filters.startDate, filters.endDate]);

  useEffect(() => {
    fetchAccountDetails();
  }, [fetchAccountDetails]);


  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };
  
  const handleAddPayment = async (amount: number, date: string) => {
      if(!selectedUser || !amount || !date) return;
      try {
          await addPayment({
             userId: selectedUser.id,
             amount,
             date,
             type: view === 'teachers' ? 'paid_to_teacher' : 'received_from_student',
          });
          setIsPaymentModalOpen(false);
          fetchAccountDetails(); // Refresh details after adding payment
      } catch(error) {
          console.error("Failed to add payment:", error);
          alert("فشل في إضافة الدفعة.");
      }
  }
  
  const allTransactions = useMemo(() => {
    if (!accountDetails) return [];
    
    const lessonTransactions = accountDetails.lessons.map(l => ({
        date: l.date,
        description: `درس: ${l.subject}`,
        debit: l.sessionPrice,
        credit: 0,
    }));
    
    const paymentTransactions = accountDetails.payments.map(p => ({
        date: p.date,
        description: view === 'teachers' ? 'دفعة مدفوعة' : 'دفعة مستلمة',
        debit: 0,
        credit: p.amount,
    }));

    return [...lessonTransactions, ...paymentTransactions].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  }, [accountDetails, view]);

  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex border border-gray-300 dark:border-gray-600 rounded-lg p-1">
          <button onClick={() => setView('teachers')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${view === 'teachers' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}>حسابات المعلمين</button>
          <button onClick={() => setView('students')} className={`px-4 py-2 text-sm font-medium rounded-md transition ${view === 'students' ? 'bg-primary-600 text-white' : 'text-gray-600 dark:text-gray-300'}`}>حسابات الطلاب</button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* User List */}
        <div className="md:col-span-1 border-l border-gray-200 dark:border-gray-700 pl-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 dark:text-white">اختر {view === 'teachers' ? 'معلمًا' : 'طالبًا'}</h3>
            {isLoading.users ? <p>...جار التحميل</p> : (
                <ul className="space-y-2 max-h-96 overflow-y-auto">
                    {users.map(user => (
                        <li key={user.id}>
                           <button onClick={() => setSelectedUser(user)} className={`w-full text-right p-2 rounded-md transition ${selectedUser?.id === user.id ? 'bg-primary-100 dark:bg-primary-900 text-primary-700 dark:text-primary-200' : 'hover:bg-gray-100 dark:hover:bg-gray-700'}`}>
                                {user.name}
                           </button>
                        </li>
                    ))}
                </ul>
            )}
        </div>
        
        {/* Account Details */}
        <div className="md:col-span-3">
           {!selectedUser ? (
             <div className="flex items-center justify-center h-full text-gray-500">
               <p>الرجاء تحديد {view === 'teachers' ? 'معلم' : 'طالب'} لعرض كشف الحساب.</p>
             </div>
           ) : (
             <div>
                <div className="flex flex-wrap gap-4 items-end mb-4 border-b pb-4 dark:border-gray-700">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex-grow">كشف حساب: {selectedUser.name}</h2>
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">من</label>
                        <input type="date" name="startDate" value={filters.startDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                    <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">إلى</label>
                        <input type="date" name="endDate" value={filters.endDate} onChange={handleFilterChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                    </div>
                </div>
                
                {isLoading.details ? <p className="text-center p-8">...جار تحميل التفاصيل</p> : !accountDetails ? <p>تعذر تحميل التفاصيل.</p> : (
                    <div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6 text-center">
                            <StatCard title="إجمالي المستحق" value={accountDetails.totalDue.toFixed(2)} color="blue"/>
                            <StatCard title="إجمالي المدفوع" value={accountDetails.totalPaid.toFixed(2)} color="green"/>
                            <StatCard title="الرصيد الحالي" value={accountDetails.balance.toFixed(2)} color={accountDetails.balance >= 0 ? 'red' : 'green'}/>
                        </div>

                         <div className="flex justify-end mb-4">
                            <button onClick={() => setIsPaymentModalOpen(true)} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition">
                                إضافة دفعة
                            </button>
                        </div>
                        
                        <div className="overflow-x-auto">
                           <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                                <thead className="bg-gray-50 dark:bg-gray-700">
                                    <tr>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">التاريخ</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">البيان</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">مستحق</th>
                                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">مدفوع</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                                    {allTransactions.map((tx, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{new Date(tx.date).toLocaleDateString('ar-EG')}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">{tx.description}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-red-600">{tx.debit > 0 ? tx.debit.toFixed(2) : '-'}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-sm text-green-600">{tx.credit > 0 ? tx.credit.toFixed(2) : '-'}</td>
                                        </tr>
                                    ))}
                                    {allTransactions.length === 0 && (
                                        <tr><td colSpan={4} className="text-center py-4 text-gray-500">لا توجد معاملات في هذه الفترة.</td></tr>
                                    )}
                                </tbody>
                           </table>
                        </div>
                    </div>
                )}
             </div>
           )}
        </div>
      </div>
      {selectedUser && 
        <PaymentModal 
          isOpen={isPaymentModalOpen}
          onClose={() => setIsPaymentModalOpen(false)}
          onSubmit={handleAddPayment}
          userName={selectedUser.name}
          type={view}
        />
      }
    </div>
  );
};


const StatCard: React.FC<{title: string; value: string; color: 'blue' | 'green' | 'red'}> = ({ title, value, color }) => {
    const colors = {
        blue: 'border-blue-500',
        green: 'border-green-500',
        red: 'border-red-500'
    };
    return (
        <div className={`bg-gray-50 dark:bg-gray-700 p-4 rounded-lg border-r-4 ${colors[color]}`}>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        </div>
    );
};

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (amount: number, date: string) => void;
    userName: string;
    type: 'teachers' | 'students';
}

const PaymentModal: React.FC<PaymentModalProps> = ({isOpen, onClose, onSubmit, userName, type}) => {
    const [amount, setAmount] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numAmount = parseFloat(amount);
        if(numAmount > 0) {
            onSubmit(numAmount, date);
            setAmount('');
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title={`إضافة دفعة ${type === 'teachers' ? 'لـ' : 'من'} ${userName}`}>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="paymentAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">المبلغ</label>
                    <input id="paymentAmount" type="number" value={amount} onChange={e => setAmount(e.target.value)} required min="0.01" step="0.01" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                 <div>
                    <label htmlFor="paymentDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300">التاريخ</label>
                    <input id="paymentDate" type="date" value={date} onChange={e => setDate(e.target.value)} required className="mt-1 block w-full rounded-md border-gray-300 shadow-sm sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                </div>
                 <div className="flex justify-end space-x-2 pt-4">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 dark:bg-gray-600 dark:text-gray-200 dark:border-gray-500 dark:hover:bg-gray-500">إلغاء</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-600 border border-transparent rounded-md shadow-sm hover:bg-primary-700">حفظ الدفعة</button>
                </div>
            </form>
        </Modal>
    );
};


export default Accounts;