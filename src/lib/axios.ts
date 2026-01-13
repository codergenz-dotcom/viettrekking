import axios, {
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import type { ApiError, RequestConfig } from '@/types/api';

const ERROR_MESSAGES: Record<number, string> = {
  400: 'Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.',
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  408: 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.',
  409: 'Dữ liệu bị xung đột. Vui lòng tải lại trang.',
  422: 'Dữ liệu không hợp lệ. Vui lòng kiểm tra lại.',
  429: 'Quá nhiều yêu cầu. Vui lòng thử lại sau.',
  500: 'Lỗi máy chủ. Vui lòng thử lại sau.',
  502: 'Máy chủ tạm thời không khả dụng.',
  503: 'Dịch vụ đang bảo trì. Vui lòng thử lại sau.',
  504: 'Máy chủ không phản hồi. Vui lòng thử lại.',
};

const NETWORK_ERROR_MESSAGE = 'Không có kết nối mạng. Vui lòng kiểm tra internet của bạn.';
const TIMEOUT_ERROR_MESSAGE = 'Yêu cầu đã hết thời gian chờ. Vui lòng thử lại.';
const UNKNOWN_ERROR_MESSAGE = 'Đã xảy ra lỗi không xác định. Vui lòng thử lại.';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'Accept-Language': 'vi',
  },
});

function getAccessToken(): string | null {
  return localStorage.getItem('access_token');
}
function getRefreshToken(): string | null {
  return localStorage.getItem('refresh_token');
}

function handleSessionExpired(shouldRedirect = true) {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  localStorage.removeItem('user');
  localStorage.removeItem('firebase_uid');

  window.dispatchEvent(new CustomEvent('auth:session-expired', {
    detail: { shouldRedirect }
  }));
}
function getErrorMessage(error: AxiosError<ApiError>): string {
  if (!error.response) {
    if (error.code === 'ECONNABORTED') {
      return TIMEOUT_ERROR_MESSAGE;
    }
    if (error.message === 'Network Error') {
      return NETWORK_ERROR_MESSAGE;
    }
    return UNKNOWN_ERROR_MESSAGE;
  }

  const statusCode = error.response.status;
  const serverMessage = error.response.data?.message;

  if (serverMessage && serverMessage.length > 0) {
    return serverMessage;
  }
  return ERROR_MESSAGES[statusCode] || UNKNOWN_ERROR_MESSAGE;
}

function handleApiError(
  error: AxiosError<ApiError>,
  options: { skipToast?: boolean; customMessage?: string } = {}
): ApiError {
  const { skipToast = false, customMessage } = options;
  const message = customMessage || getErrorMessage(error);
  const statusCode = error.response?.status || 0;

  if (!skipToast) {
    toast.error(message);
  }

  return {
    message,
    statusCode,
    code: error.code,
    errors: error.response?.data?.errors,
  };
}

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (token: string) => void;
  reject: (error: Error) => void;
}> = [];

const processQueue = (error: Error | null, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else if (token) {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};
type ExtendedAxiosRequestConfig = InternalAxiosRequestConfig & RequestConfig & {
  _retry?: boolean;
  skipAuthRedirect?: boolean;
};
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();

    console.log('📤 Request:', config.method?.toUpperCase(), config.url);
    console.log('🔑 Token exists:', !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('📎 Authorization header set');
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError<ApiError>) => {
    const originalRequest = error.config as ExtendedAxiosRequestConfig;
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({
            resolve: (token: string) => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              resolve(api(originalRequest));
            },
            reject: (err: Error) => {
              reject(err);
            },
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();

      if (!refreshToken) {
        isRefreshing = false;
        handleSessionExpired(!originalRequest.skipAuthRedirect);
        return Promise.reject(error);
      }

      try {
        console.log('🔄 Refreshing token...');

        const response = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL}/api/v1/auth/refresh`,
          { refresh_token: refreshToken },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        const { access_token, refresh_token: newRefreshToken } = response.data.data;

        console.log('✅ Token refreshed successfully');

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('refresh_token', newRefreshToken);

        localStorage.setItem('user', JSON.stringify(response.data.data));
        processQueue(null, access_token);

        originalRequest.headers.Authorization = `Bearer ${access_token}`;
        return api(originalRequest);
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError);
        processQueue(new Error('Token refresh failed'), null);
        handleSessionExpired(!originalRequest.skipAuthRedirect);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    handleApiError(error, {
      skipToast: originalRequest?.skipErrorToast,
      customMessage: originalRequest?.customErrorMessage,
    });

    return Promise.reject(error);
  }
);

export { getErrorMessage, handleApiError };
export type { ApiError, ApiResponse, PaginatedResponse, RequestConfig } from '@/types/api';
