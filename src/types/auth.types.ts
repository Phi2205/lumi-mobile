export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  avatar_url?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user: User;
}

export interface LoginDto {
  email: string;
  password?: string;
}

export interface RegisterDto {
  email: string;
  password?: string;
  name?: string;
}
