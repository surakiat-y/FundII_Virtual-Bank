import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the user ID or other auth tokens if needed
api.interceptors.request.use(
    (config) => {
        const user = localStorage.getItem('user');
        if (user) {
            const userData = JSON.parse(user);
            // You can add custom headers here, e.g., config.headers['Authorization'] = `Bearer ${userData.token}`;
            // If the backend expects a specific user header, add it here.
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;
