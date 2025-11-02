
import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AcademyLogoIcon, LogoutIcon } from './icons';

interface LayoutProps {
  children: ReactNode;
  title: string;
}

const Layout: React.FC<LayoutProps> = ({ children, title }) => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <header className="bg-white dark:bg-gray-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <AcademyLogoIcon className="h-8 w-8 text-primary-600" />
              <h1 className="mr-3 text-xl font-bold text-gray-800 dark:text-white">أكاديمية هيا نتعلم</h1>
            </div>
            <div className="flex items-center">
              {user && (
                <div className="flex items-center">
                   <span className="text-gray-600 dark:text-gray-300 ml-4">
                    مرحبًا، <span className="font-semibold">{user.name}</span> ({user.role})
                  </span>
                  <button
                    onClick={logout}
                    className="flex items-center p-2 text-sm text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 focus:outline-none transition"
                    aria-label="تسجيل الخروج"
                  >
                    <LogoutIcon className="w-5 h-5" />
                    <span className="mr-2 hidden sm:inline">تسجيل الخروج</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate mb-6 px-4 sm:px-0">{title}</h2>
            <div className="px-4 py-6 sm:px-0">
                {children}
            </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;