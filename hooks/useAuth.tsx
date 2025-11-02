import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import { User } from '../types';
import { apiLogin, apiLogout, getLoggedInUser } from '../services/api.tsx';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      setLoading(true);
      const loggedInUser = await getLoggedInUser();
      setUser(loggedInUser);
      setLoading(false);
    };
    checkUser();
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<User | null> => {
    setLoading(true);
    const loggedInUser = await apiLogin(username, password);
    setUser(loggedInUser);
    setLoading(false);
    return loggedInUser;
  }, []);

  const logout = useCallback(async () => {
    setLoading(true);
    await apiLogout();
    setUser(null);
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};