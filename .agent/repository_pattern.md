# Tiêu chuẩn Repository Pattern trong React Native

Tiêu chuẩn này định nghĩa cách phân tách mã nguồn giữa giao diện người dùng (UI) và logic truy vấn dữ liệu/gọi API (Data Fetching) trong dự án React Native.

---

## 📐 Kiến trúc phân lớp
Ứng dụng sử dụng 3 lớp chính khi làm việc với dữ liệu:
1. **Lớp Giao diện (UI Components/Screens)**: Chỉ đảm nhận hiển thị và bắt sự kiện từ người dùng.
2. **Lớp Hooks (React Hooks/Queries)**: Quản lý trạng thái (state), vòng đời dữ liệu (loading, error, cache) sử dụng TanStack Query (React Query) hoặc custom hooks.
3. **Lớp Repository/Service (API Calls)**: Thực hiện các cuộc gọi HTTP thực tế tới backend.

```
[UI Component/Screen] ➔ [React Hook / Query] ➔ [Repository/Service] ➔ [Axios Instance]
```

---

## 🛠️ Quy chuẩn triển khai

### 1. Lớp Repository/Service (`src/services/` hoặc `src/repositories/`)
- Không chứa React hooks hoặc UI state.
- Chỉ chứa các hàm bất đồng bộ thực hiện cuộc gọi API và trả về kiểu dữ liệu xác định.

*Ví dụ: `src/services/auth.service.ts`*
```typescript
import { axiosInstance } from './axiosInstance';
import { LoginDto, AuthResponse } from '@/types/auth.types';

export const AuthRepository = {
  async login(dto: LoginDto): Promise<AuthResponse> {
    const response = await axiosInstance.post<AuthResponse>('/auth/login', dto);
    return response.data;
  },

  async getProfile(): Promise<User> {
    const response = await axiosInstance.get<User>('/auth/profile');
    return response.data;
  }
};
```

### 2. Lớp Custom Hooks (`src/hooks/`)
- Sử dụng Repository để lấy dữ liệu.
- Quản lý trạng thái tải (loading), lỗi (error) và cập nhật dữ liệu.

*Ví dụ: `src/hooks/useAuth.ts`*
```typescript
import { useMutation, useQuery } from '@tanstack/react-query';
import { AuthRepository } from '@/services/auth.service';

export function useLogin() {
  return useMutation({
    mutationFn: AuthRepository.login,
    onSuccess: (data) => {
      // Xử lý lưu Token / chuyển trang
    }
  });
}

export function useProfile() {
  return useQuery({
    queryKey: ['profile'],
    queryFn: AuthRepository.getProfile,
  });
}
```

### 3. Lớp Giao diện (UI Components/Screens)
- Chỉ gọi custom hooks và render giao diện dựa trên dữ liệu/trạng thái trả về.

*Ví dụ: `src/app/login.tsx`*
```tsx
import { useLogin } from '@/hooks/useAuth';
import { ThemedView } from '@/components/themed-view';
import { Button } from 'react-native';

export default function LoginScreen() {
  const { mutate: login, isPending } = useLogin();

  const handleLogin = () => {
    login({ username: 'user', password: 'password' });
  };

  return (
    <ThemedView>
      <Button title={isPending ? "Đang xử lý..." : "Đăng nhập"} onPress={handleLogin} />
    </ThemedView>
  );
}
```
