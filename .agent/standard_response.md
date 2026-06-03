# Quy chuẩn Phản hồi API & Xử lý Lỗi (Standard Response & Error Handling)

Tài liệu này quy định cách xử lý kết quả phản hồi (Response) và lỗi (Error) từ máy chủ để hiển thị giao diện nhất quán cho người dùng.

---

## 📭 Định dạng phản hồi chuẩn (Standard Response Format)
Chúng ta giả định Backend luôn trả về kết quả theo cấu trúc JSON chuẩn:

### 1. Phản hồi thành công (Success Response)
```json
{
  "success": true,
  "message": "Thao tác thành công",
  "data": {
    // Dữ liệu thực tế trả về
  }
}
```

### 2. Phản hồi thất bại (Error Response)
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Dữ liệu đầu vào không hợp lệ",
  "errors": [
    {
      "field": "email",
      "reason": "Email đã tồn tại trên hệ thống"
    }
  ]
}
```

---

## 🛡️ Triển khai Interceptor trong Axios (`src/services/axiosInstance.ts`)
Tất cả các lỗi hệ thống hoặc token hết hạn sẽ được bắt tự động ở tầng mạng trước khi đưa ra UI.

```typescript
import axios from 'axios';
import { Alert } from 'react-native';

export const axiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Tự động đính kèm Token
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getSecureToken(); // Lấy từ SecureStore
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý lỗi toàn cục
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status;

    // 1. Lỗi Hết hạn Token (Unauthorized)
    if (statusCode === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        // Gọi API refresh token
        const newToken = await refreshAuthToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        // Refresh token thất bại -> Buộc đăng xuất
        await handleLogout();
        Alert.alert('Phiên đăng nhập hết hạn', 'Vui lòng đăng nhập lại.');
        return Promise.reject(refreshError);
      }
    }

    // 2. Lỗi Hệ thống / Không kết nối được Internet
    if (!error.response) {
      Alert.alert('Lỗi kết nối', 'Không thể kết nối đến máy chủ. Vui lòng kiểm tra lại mạng internet.');
      return Promise.reject(error);
    }

    // 3. Lỗi Nghiệp vụ thông thường (Bad Request, Forbidden, Server Error)
    const apiError = error.response.data;
    const errorMessage = apiError?.message || 'Có lỗi xảy ra, vui lòng thử lại sau.';
    
    // Ném lỗi về phía UI tự xử lý nếu cần hiển thị chi tiết tại form
    return Promise.reject({
      statusCode,
      message: errorMessage,
      errors: apiError?.errors || []
    });
  }
);
```

---

## 🎨 Hiển thị lỗi trên giao diện (UI Layer)
- **Lỗi Form (Validation Error)**: Hiển thị text báo đỏ ngay dưới trường nhập liệu bị lỗi.
- **Lỗi Thao tác (Action Error)**: Sử dụng Alert hoặc Toast để hiển thị thông báo nhanh gọn không làm gián đoạn trải nghiệm người dùng.
