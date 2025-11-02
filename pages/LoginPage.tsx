
import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { AcademyLogoIcon } from '../components/icons';

const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const user = await login(username, password);
      if (!user) {
        setError('اسم المستخدم أو كلمة المرور غير صالحة.');
      }
    } catch (err) {
      setError('حدث خطأ. يرجى المحاولة مرة أخرى.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col justify-center items-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
            <AcademyLogoIcon className="mx-auto h-16 w-16 text-primary-600" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                أكاديمية هيا نتعلم
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">تسجيل الدخول إلى حسابك</p>
        </div>
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-2xl rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                اسم المستخدم
              </label>
              <div className="mt-1">
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password"
                     className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                كلمة المرور
              </label>
              <div className="mt-1">
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center">{error}</div>
            )}

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:bg-primary-300 transition"
              >
                {loading ? '...جاري تسجيل الدخول' : 'تسجيل الدخول'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;