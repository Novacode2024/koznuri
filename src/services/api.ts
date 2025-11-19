import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type AxiosError,
  type InternalAxiosRequestConfig,
} from "axios";
import config from "../config/env";

// Extended config interface to support skipAuth flag
export interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  skipAuth?: boolean;
}

// Extended InternalAxiosRequestConfig to support skipAuth flag
interface CustomInternalAxiosRequestConfig extends InternalAxiosRequestConfig {
  skipAuth?: boolean;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  data: T;
  message: string;
  success: boolean;
  status: number;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  details?: unknown;
}

// Request interceptor for adding auth headers
const addAuthHeaders = (
  config: InternalAxiosRequestConfig
): InternalAxiosRequestConfig => {
  const token = localStorage.getItem("auth_token");
  const apiKey = import.meta.env.VITE_API_KEY;

  // Check if skipAuth flag is set in metadata (custom property)
  const customConfig = config as CustomInternalAxiosRequestConfig;
  const skipAuth = customConfig.skipAuth === true;

  // Only add Authorization header if skipAuth is not set
  if (token && !skipAuth) {
    config.headers.set("Authorization", `Bearer ${token}`);
  } else if (skipAuth) {
    // Explicitly remove Authorization header if skipAuth is true
    config.headers.delete("Authorization");
  }

  if (apiKey) {
    config.headers.set("X-API-Key", apiKey);
  }

  // If FormData is being sent, let axios set Content-Type automatically
  // This ensures proper multipart/form-data with boundary
  if (config.data instanceof FormData) {
    config.headers.delete("Content-Type");
  }

  return config;
};

// Token refresh function
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (error?: unknown) => void;
}> = [];

const processQueue = (error: unknown | null, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

const refreshToken = async (): Promise<string | null> => {
  try {
    const authData = localStorage.getItem("auth");
    if (!authData) {
      return null;
    }

    const auth = JSON.parse(authData);
    const refreshTokenValue = auth.refresh || auth.refresh_token;

    if (!refreshTokenValue) {
      return null;
    }

    // Create a temporary axios instance without auth interceptor for refresh
    const refreshClient = axios.create({
      baseURL: config.API_BASE_URL,
      timeout: config.API_TIMEOUT,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    const response = await refreshClient.post("/token/refresh/", {
      refresh: refreshTokenValue,
    });

    const newAccessToken =
      response.data?.access ||
      response.data?.token ||
      response.data?.data?.access ||
      response.data?.data?.token;

    if (newAccessToken) {
      // Update tokens in localStorage
      localStorage.setItem("auth_token", newAccessToken);
      const updatedAuth = {
        ...auth,
        access: newAccessToken,
        refresh: response.data?.refresh || auth.refresh,
      };
      localStorage.setItem("auth", JSON.stringify(updatedAuth));
      return newAccessToken;
    }

    return null;
  } catch (error) {
    // Refresh token failed - logout user
    logout();
    return null;
  }
};

// Logout function
export const logout = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth");
  localStorage.removeItem("refresh_token");
  // Clear any other auth-related items
  localStorage.removeItem("chat_session_id");
  localStorage.removeItem("currentAppointmentUuid");
  localStorage.removeItem("currentAppointmentPrice");
  localStorage.removeItem("selectedBranchUuid");
  localStorage.removeItem("selectedDoctorUuid");
  window.location.href = "/login";
};

// Response interceptor for error handling
const handleResponseError = async (error: AxiosError): Promise<never> => {
  const status = error.response?.status || 500;
  const originalRequest = error.config as InternalAxiosRequestConfig & {
    _retry?: boolean;
  };

  // Silently handle 404 errors for optional endpoints (like work-times)
  // These endpoints are optional and should not show errors
  if (status === 404) {
    // Return a silent error that won't trigger notifications
    const silentError: ApiError = {
      message: "Resource not found",
      status: 404,
      code: error.code,
      details: error.response?.data,
    };
    return Promise.reject(silentError);
  }

  const apiError: ApiError = {
    message: "An error occurred",
    status,
    code: error.code,
    details: error.response?.data,
  };

  if (error.response) {
    // Server responded with error status
    const responseData = error.response.data as
      | { message?: string }
      | undefined;
    apiError.message = responseData?.message || error.message;
    apiError.status = error.response.status;
  } else if (error.request) {
    // Request was made but no response received
    apiError.message = "Network error - please check your connection";
    apiError.status = 0;
  }

  // Handle 401 Unauthorized - try to refresh token
  if (status === 401 && originalRequest && !originalRequest._retry) {
    if (isRefreshing) {
      // If already refreshing, queue this request
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          if (token && originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`;
          }
          return apiClient(originalRequest);
        })
        .catch((err) => {
          return Promise.reject(err);
        }) as Promise<never>;
    }

    originalRequest._retry = true;
    isRefreshing = true;

    try {
      const newToken = await refreshToken();
      if (newToken) {
        processQueue(null, newToken);
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        isRefreshing = false;
        return apiClient(originalRequest);
      } else {
        processQueue(new Error("Failed to refresh token"), null);
        isRefreshing = false;
        logout();
        return Promise.reject(apiError);
      }
    } catch (refreshError) {
      processQueue(refreshError, null);
      isRefreshing = false;
      logout();
      return Promise.reject(apiError);
    }
  }

  // If refresh token also failed or other error, logout
  if (status === 401) {
    logout();
  }

  return Promise.reject(apiError);
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: config.API_BASE_URL,
  timeout: config.API_TIMEOUT,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Check if token is expired before making request
    const token = localStorage.getItem("auth_token");
    if (token) {
      try {
        // Decode JWT token to check expiration
        // JWT tokens have 3 parts separated by dots: header.payload.signature
        const parts = token.split(".");
        if (parts.length === 3) {
          const payload = JSON.parse(atob(parts[1]));
          const exp = payload.exp;
          
          if (exp) {
            // exp is in seconds, convert to milliseconds
            const expTime = exp * 1000;
            const now = Date.now();
            
            // If token expires in less than 5 minutes, refresh it in background
            if (expTime - now < 5 * 60 * 1000 && expTime > now) {
              // Token is about to expire, refresh it in background
              // Don't await to avoid blocking the request
              refreshToken().catch(() => {
                // Silently fail if refresh fails - will be handled on next 401
              });
            }
          }
        }
      } catch (error) {
        // If token parsing fails, continue with request
        // Token might not be a JWT or might be malformed
        if (import.meta.env.DEV) {
        console.warn("Failed to parse token for expiration check:", error);
        }
      }
    }
    return addAuthHeaders(config);
  },
  (error) => Promise.reject(error)
);

// Response interceptor
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  handleResponseError
);

// Retry function for failed requests
const retryRequest = async <T>(
  requestFn: () => Promise<AxiosResponse<T>>,
  retries: number = config.API_RETRY_ATTEMPTS
): Promise<AxiosResponse<T>> => {
  try {
    return await requestFn();
  } catch (error) {
    const apiError = error as ApiError;
    // Don't retry on 404 (resource not found) or 401 (unauthorized)
    if (apiError.status === 404 || apiError.status === 401) {
      throw error;
    }
    // Retry on server errors (5xx) only
    if (retries > 0 && apiError.status >= 500) {
      // Retry on server errors
      await new Promise((resolve) => setTimeout(resolve, 1000));
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
};

// Generic API methods
export const api = {
  // GET request
  get: async <T>(url: string, config?: CustomAxiosRequestConfig): Promise<T> => {
    // Pass skipAuth flag to the request config
    const requestConfig: CustomAxiosRequestConfig = config ? { ...config } : {};
    const response = await retryRequest(() => {
      return apiClient.get(url, requestConfig);
    });
    return response.data;
  },

  // POST request
  post: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await retryRequest(() =>
      apiClient.post(url, data, config)
    );
    return response.data;
  },

  // PUT request
  put: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await retryRequest(() => apiClient.put(url, data, config));
    return response.data;
  },

  // PATCH request
  patch: async <T>(
    url: string,
    data?: unknown,
    config?: AxiosRequestConfig
  ): Promise<T> => {
    const response = await retryRequest(() =>
      apiClient.patch(url, data, config)
    );
    return response.data;
  },

  // DELETE request
  delete: async <T>(url: string, config?: AxiosRequestConfig): Promise<T> => {
    const response = await retryRequest(() => apiClient.delete(url, config));
    return response.data;
  },

  // Logout function
  logout,

  // Upload file
  upload: async <T>(
    url: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<T> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await apiClient.post(url, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onProgress(progress);
        }
      },
    });

    return response.data;
  },
};

export default api;
