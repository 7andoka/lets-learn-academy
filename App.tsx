
import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import TeacherDashboard from './pages/teacher/TeacherDashboard';
import StudentDashboard from './pages/student/StudentDashboard';
import { Role } from './types';
import { AcademyLogoIcon } from './components/icons';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Main />
    </AuthProvider>
  );
};

const Main: React.FC = () => {
  const { user, loading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 1500); // Show splash for 1.5 seconds

    return () => clearTimeout(timer);
  }, []);

  if (showSplash || loading) {
    return <SplashScreen />;
  }

  if (!user) {
    return <LoginPage />;
  }

  switch (user.role) {
    case Role.Admin:
      return <AdminDashboard />;
    case Role.Teacher:
      return <TeacherDashboard />;
    case Role.Student:
      return <StudentDashboard />;
    default:
      return <LoginPage />;
  }
};

const SplashScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
    <div className="animate-pulse">
      <AcademyLogoIcon className="w-24 h-24 text-primary-600" />
    </div>
    <h1 className="mt-4 text-3xl font-bold text-gray-800 dark:text-gray-200">
      أكاديمية هيا نتعلم
    </h1>
  </div>
);

export default App;