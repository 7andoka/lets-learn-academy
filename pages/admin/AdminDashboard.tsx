import React, { useState } from 'react';
import Layout from '../../components/Layout';
import UserManagement from './UserManagement';
import Reports from './Reports';
import LessonLog from './LessonLog';
import SubjectManagement from './SubjectManagement';
import Accounts from './Accounts';
import { UsersIcon, ChartIcon, FileTextIcon, BookIcon, DollarSignIcon } from '../../components/icons';

type Tab = 'users' | 'reports' | 'lessonLog' | 'subjects' | 'accounts';

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('users');

  const tabs = [
    { id: 'users', name: 'إدارة المستخدمين', icon: UsersIcon },
    { id: 'subjects', name: 'المواد الدراسية', icon: BookIcon },
    { id: 'lessonLog', name: 'سجل الدروس', icon: FileTextIcon },
    { id: 'reports', name: 'التقارير', icon: ChartIcon },
    { id: 'accounts', name: 'الحسابات', icon: DollarSignIcon },
  ];

  return (
    <Layout title="لوحة تحكم المسؤول">
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as Tab)}
              className={`${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
              } flex items-center whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition`}
            >
              <tab.icon className="w-5 h-5 ml-2" />
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      <div className="mt-8">
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'reports' && <Reports />}
        {activeTab === 'lessonLog' && <LessonLog />}
        {activeTab === 'subjects' && <SubjectManagement />}
        {activeTab === 'accounts' && <Accounts />}
      </div>
    </Layout>
  );
};

export default AdminDashboard;