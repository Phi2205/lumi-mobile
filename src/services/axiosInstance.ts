import axios from 'axios';
import { secureStorage } from '@/services/secureStore';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.lumi.vn'; // Cấu hình URL mặc định hoặc từ env


console.log('API_URL', API_URL)
export const axiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Hàm lấy token bảo mật
export async function getAccessToken(): Promise<string | null> {
  return await secureStorage.getItemAsync('accessToken');
}

export async function getRefreshToken(): Promise<string | null> {
  return await secureStorage.getItemAsync('refreshToken');
}

export async function saveTokens(accessToken: string, refreshToken: string): Promise<void> {
  await secureStorage.setItemAsync('accessToken', accessToken);
  await secureStorage.setItemAsync('refreshToken', refreshToken);
}

export async function clearTokens(): Promise<void> {
  await secureStorage.deleteItemAsync('accessToken');
  await secureStorage.deleteItemAsync('refreshToken');
}

// Request Interceptor: Tự động đính kèm accessToken vào Header
axiosInstance.interceptors.request.use(
  async (config) => {
    const token = await getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Tự động refresh token khi gặp lỗi 401
let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status;

    // Lỗi 401 Unauthorized và chưa retry
    if (statusCode === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return axiosInstance(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await getRefreshToken();
        if (!refreshToken) {
          throw new Error('No refresh token available');
        }

        // Gọi API refresh token
        const response = await axios.post(`${API_URL}/auth/refresh`, {
          refreshToken,
        });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data.data;
        await saveTokens(newAccessToken, newRefreshToken);

        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

        processQueue(null, newAccessToken);
        isRefreshing = false;

        return axiosInstance(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError, null);
        isRefreshing = false;
        await clearTokens(); // Xóa token cũ
        return Promise.reject(refreshError);
      }
    }

    // Định dạng lại lỗi nhất quán trước khi trả về UI
    const apiError = error.response?.data;
    return Promise.reject({
      statusCode,
      message: apiError?.message || 'Kết nối mạng không ổn định hoặc có lỗi xảy ra.',
      errors: apiError?.errors || [],
    });
  }
);
