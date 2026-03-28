import { mockApi } from '../mocks/mockApi';
// import apiClient from '../utils/axios'; // Uncomment this when connecting to real backend

/**
 * Main API service abstraction.
 * Currently delegates to mockApi.
 */
export const api = {
    // --- Mock Implementation ---
    login: mockApi.login,
    createAccount: mockApi.createAccount,
    logout: mockApi.logout,
    getCurrentUser: mockApi.getCurrentUser,
    getFreshUser: mockApi.getFreshUser,
    getAccounts: mockApi.getAccounts,
    getTransactions: mockApi.getTransactions,

    /* 
    // --- Real Backend Example using Axios ---
    login: async (username, password) => {
        return await apiClient.post('/auth/login', { username, password });
    },
    createAccount: async (userData) => {
        return await apiClient.post('/auth/register', userData);
    },
    getAccounts: async () => {
        return await apiClient.get('/accounts');
    }
    */
};
