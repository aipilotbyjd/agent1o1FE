import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'react-toastify';
import { getAccessToken, getRefreshToken, isRememberMe, setToken, clearTokens } from '../utils/token.manager';

const BASE_URL = import.meta.env.VITE_API_URL || 'https://agent1o1.test/api/v1';

const axiosClient = axios.create({
	baseURL: BASE_URL,
	timeout: 30000,
	headers: {
		'Content-Type': 'application/json',
		Accept: 'application/json',
	},
});

// Flag to prevent multiple refresh attempts
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

// Request interceptor — Auto-attach Bearer token
axiosClient.interceptors.request.use(
	(config: InternalAxiosRequestConfig) => {
		// Skip auth for public endpoints
		const publicEndpoints = [
			'/auth/login',
			'/auth/register',
			'/auth/forgot-password',
			'/auth/reset-password',
			'/auth/refresh',
		];
		const isPublicEndpoint = publicEndpoints.some((endpoint) => config.url?.includes(endpoint));

		if (!isPublicEndpoint) {
			const token = getAccessToken();
			if (token && config.headers) {
				config.headers.Authorization = `Bearer ${token}`;
			}
		}

		return config;
	},
	(error) => Promise.reject(error),
);

// Response interceptor — Handle 401 refresh and global error toasts
axiosClient.interceptors.response.use(
	(response) => response,
	async (error: AxiosError<{ message?: string; errors?: Record<string, string[]> }>) => {
		const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

		// Handle 401 — try to refresh token
		if (error.response?.status === 401 && !originalRequest._retry) {
			const currentToken = getAccessToken();

			// No token at all, redirect to login
			if (!currentToken) {
				clearTokens();
				window.location.href = '/login';
				return Promise.reject(error);
			}

			// If already refreshing, queue this request
			if (isRefreshing) {
				return new Promise((resolve, reject) => {
					failedQueue.push({ resolve, reject });
				})
					.then((token) => {
						if (originalRequest.headers) {
							originalRequest.headers.Authorization = `Bearer ${token}`;
						}
						return axiosClient(originalRequest);
					})
					.catch((err) => Promise.reject(err));
			}

			originalRequest._retry = true;
			isRefreshing = true;

			try {
				// Backend refresh requires refresh_token in body + Bearer header
				const refreshToken = getRefreshToken();
				if (!refreshToken) {
					throw new Error('No refresh token available');
				}

				const response = await axiosClient.post(
					'/auth/refresh',
					{ refresh_token: refreshToken },
					{
						headers: {
							Authorization: `Bearer ${currentToken}`,
						},
					},
				);

				const { access_token, expires_in, refresh_token: newRefreshToken } = response.data.data;

				// Check if remember me was set
				const rememberMe = isRememberMe();

				setToken(access_token, expires_in, rememberMe, newRefreshToken);

				processQueue(null, access_token);

				if (originalRequest.headers) {
					originalRequest.headers.Authorization = `Bearer ${access_token}`;
				}

				return axiosClient(originalRequest);
			} catch (refreshError) {
				processQueue(refreshError as Error, null);
				clearTokens();
				window.location.href = '/login';
				return Promise.reject(refreshError);
			} finally {
				isRefreshing = false;
			}
		}

		// Extract error message
		const message =
			error.response?.data?.message || error.message || 'Something went wrong';
		const status = error.response?.status;

		// Handle other status codes
		switch (status) {
			case 403:
				toast.error('Permission denied');
				break;
			case 404:
				toast.error('Resource not found');
				break;
			case 422:
				toast.error(message || 'Validation error');
				break;
			case 429:
				toast.error('Too many requests. Please slow down.');
				break;
			default:
				if (status && status >= 500) {
					toast.error('Server error. Please try again later.');
				} else if (!status) {
					toast.error('Network error. Check your connection.');
				} else if (status !== 401) {
					toast.error(message);
				}
		}

		return Promise.reject({
			status,
			message,
			errors: error.response?.data?.errors,
		});
	},
);

export default axiosClient;
