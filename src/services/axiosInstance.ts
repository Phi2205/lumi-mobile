import { secureStorage } from '@/services/secureStore';
import axios from 'axios';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://api.lumi.vn'; // Cấu hình URL mặc định hoặc từ env

console.log("======================================");
console.log("API URL configured in client:", API_URL);
console.log("======================================");

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

const processQueue = (error: any) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve();
  });
  failedQueue = [];
};


axiosInstance.interceptors.response.use(
  async (response) => {
    const url = response.config.url || '';
    if (url.includes('/auth/login') || url.includes('/auth/verify-otp')) {
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
        let accessToken = '';
        let refreshToken = '';

        cookies.forEach(cookie => {
          const accessMatch = cookie.match(/accessToken=([^;]+)/);
          if (accessMatch) accessToken = accessMatch[1];

          const refreshMatch = cookie.match(/refreshToken=([^;]+)/);
          if (refreshMatch) refreshToken = refreshMatch[1];
        });

        if (accessToken && refreshToken) {
          await saveTokens(accessToken, refreshToken);
        }
      }
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
    const statusCode = error.response?.status;
    // Lỗi 401 Unauthorized và chưa retry
    if (statusCode === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      // Đẩy cả request đầu tiên này vào queue
      const retryPromise = new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => axiosInstance(originalRequest))
        .catch((err) => Promise.reject(err));

      if (!isRefreshing) {
        isRefreshing = true;

        // Khởi chạy tiến trình refresh không đồng bộ
        (async () => {
          try {
            const refreshToken = await getRefreshToken();
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await axios.post(
              `${API_URL}/auth/refresh`,
              {},
              {
                headers: {
                  'Content-Type': 'application/json',
                  'Authorization': `Bearer ${refreshToken}`,
                },
              }
            );

            const setCookieHeader = response.headers['set-cookie'];
            if (setCookieHeader) {
              const cookies = Array.isArray(setCookieHeader) ? setCookieHeader : [setCookieHeader];
              let newAccessToken = '';
              let newRefreshToken = '';

              cookies.forEach(cookie => {
                const accessMatch = cookie.match(/accessToken=([^;]+)/);
                if (accessMatch) newAccessToken = accessMatch[1];

                const refreshMatch = cookie.match(/refreshToken=([^;]+)/);
                if (refreshMatch) newRefreshToken = refreshMatch[1];
              });

              if (newAccessToken && newRefreshToken) {
                await saveTokens(newAccessToken, newRefreshToken);
              }
            }

            processQueue(null);
            isRefreshing = false;
          } catch (refreshError) {
            processQueue(refreshError);
            isRefreshing = false;
            await clearTokens(); // Xóa token cũ
          }
        })();
      }

      return retryPromise;
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
