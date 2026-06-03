import { axiosInstance, clearTokens } from './axiosInstance';
import { AuthResponse, LoginDto, RegisterDto, User } from '@/types/auth.types';

export const AuthService = {
  /**
   * Đăng nhập người dùng bằng Email và Mật khẩu / OTP
   */
  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', dto);
    return response.data;
  },

  /**
   * Đăng ký tài khoản mới
   */
  async register(dto: RegisterDto): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/register', dto);
    return response.data;
  },

  /**
   * Lấy thông tin cá nhân của người dùng hiện tại
   */
  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<{ success: boolean; data: User }>('/auth/profile');
    return response.data.data;
  },

  /**
   * Đăng xuất khỏi hệ thống
   */
  async logout(): Promise<void> {
    try {
      await axiosInstance.post('/auth/logout');
    } finally {
      // Đảm bảo token luôn được xóa ở phía client
      await clearTokens();
    }
  }
};
