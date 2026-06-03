import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { AuthService } from '@/services/auth.service';
import { getAccessToken } from '@/services/axiosInstance';
import { User, LoginDto, RegisterDto } from '@/types/auth.types';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
  login: (dto: LoginDto) => Promise<void>;
  register: (dto: RegisterDto) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Kiểm tra trạng thái đăng nhập khi ứng dụng khởi chạy
  const checkAuth = async () => {
    try {
      const token = await getAccessToken();
      if (token) {
        const userData = await AuthService.getProfile();
        setUser(userData);
      }
    } catch (err: any) {
      console.log('Chưa đăng nhập hoặc token hết hạn', err.message);
      setUser(null);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (dto: LoginDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.login(dto);
      setUser(response.data.user);
    } catch (err: any) {
      const errMsg = err.message || 'Đăng nhập thất bại';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (dto: RegisterDto) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await AuthService.register(dto);
      setUser(response.data.user);
    } catch (err: any) {
      const errMsg = err.message || 'Đăng ký thất bại';
      setError(errMsg);
      throw new Error(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await AuthService.logout();
      setUser(null);
    } catch (err: any) {
      console.error('Lỗi khi đăng xuất', err);
      // Vẫn xóa user ở local
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isInitialLoading,
        error,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth phải được sử dụng bên trong AuthProvider');
  }
  return context;
}
