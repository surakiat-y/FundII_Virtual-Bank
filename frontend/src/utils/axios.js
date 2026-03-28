import axios from 'axios';
import { storage } from './storage';

/**
 * Custom Axios instance with base configuration.
 */
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api', // Adjust your backend URL here
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 seconds
});

/**
 * Request Interceptor: Automatically add JWT token to headers if available.
 */
apiClient.interceptors.request.use(
    (config) => {
        const user = storage.get('vb_current_user', null);
        if (user && user.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

/**
 * Response Interceptor: Handle common errors (e.g. 401 Unauthorized).
 */
apiClient.interceptors.response.use(
    (response) => response.data,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Handle auto-logout or redirect to login here
            storage.remove('vb_current_user');
            window.location.href = '/login';
        }
        return Promise.reject(error.response?.data || error.message);
    }
);

export default apiClient;
