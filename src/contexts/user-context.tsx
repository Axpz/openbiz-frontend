'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
// import { toast } from 'react-toastify';
import { User } from '@/types/user';
import axios from '@/lib/api/axios';



interface UserContextType {
  user: User | null;
  isLoading: boolean;
  logout: () => void;
  updateUser: (userData: User) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in on mount
    const storedUser = localStorage.getItem('user');
    console.log('Initial stored user:', storedUser);
    
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log('Parsed user data:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data:', error);
        localStorage.removeItem('user');
      }
    }
    setIsLoading(false);
  }, []);

  const updateUser = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('Logging out user:', user);
    axios.get('/api/auth/logout').then(() => {})
    localStorage.removeItem('user');
    setUser(null);
    // toast.success('已成功退出登录');
    router.push('/');
  };

  return (
    <UserContext.Provider value={{ user, isLoading, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 