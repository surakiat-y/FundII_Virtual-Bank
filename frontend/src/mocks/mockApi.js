import { USERS as INITIAL_USERS, ACCOUNTS as INITIAL_ACCOUNTS, TRANSACTIONS as INITIAL_TRANSACTIONS } from './mockData';
import { storage } from '../utils/storage';

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
    login: async (username, password) => {
        await delay(1200);
        let users = storage.get('vb_users', INITIAL_USERS);
        
        // Data Migration: Ensure all storage users have an accountNumber from INITIAL_USERS
        let migrationDone = false;
        users = users.map(u => {
            if (!u.accountNumber) {
                const initial = INITIAL_USERS.find(iu => iu.id === u.id);
                if (initial && initial.accountNumber) {
                    migrationDone = true;
                    return { ...u, accountNumber: initial.accountNumber };
                }
            }
            return u;
        });
        
        if (migrationDone) storage.set('vb_users', users);

        const user = users.find(u => u.username === username && u.password === password);
        
        if (user) {
            // Store current user session
            storage.set('vb_current_user', { ...user, password: undefined });
            return { success: true, user: { ...user, password: undefined } };
        }
        return { success: false, message: 'Invalid username or password' };
    },

    createAccount: async (userData) => {
        await delay(2000);
        const users = storage.get('vb_users', INITIAL_USERS);
        
        // Check if username exists
        if (users.some(u => u.username === userData.username)) {
            return { success: false, message: 'Username already exists' };
        }

        const newUser = {
            id: `user-${Date.now()}`,
            ...userData,
            role: 'USER',
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData.username}`
        };

        users.push(newUser);
        storage.set('vb_users', users);
        
        return { success: true, message: 'Account created successfully' };
    },

    logout: async () => {
        storage.remove('vb_current_user');
        return { success: true };
    },

    getCurrentUser: () => {
        return storage.get('vb_current_user', null);
    },

    getFreshUser: async (userId) => {
        await delay(500);
        let users = storage.get('vb_users', INITIAL_USERS);
        let user = users.find(u => u.id === userId);
        
        // Data Migration: If user is found but missing accountNumber, try to get it from INITIAL_USERS
        if (user && !user.accountNumber) {
            const initialUser = INITIAL_USERS.find(iu => iu.id === userId);
            if (initialUser && initialUser.accountNumber) {
                user.accountNumber = initialUser.accountNumber;
                // Update the users list and save back to storage
                storage.set('vb_users', users);
            }
        }

        if (user) {
            const cleanUser = { ...user, password: undefined };
            storage.set('vb_current_user', cleanUser);
            return cleanUser;
        }
        return null;
    },

    getAccounts: async (userId) => {
        await delay(800);
        const accounts = storage.get('vb_accounts', INITIAL_ACCOUNTS);
        return accounts.filter(acc => acc.userId === userId);
    },

    getTransactions: async (accountId) => {
        await delay(1000);
        const transactions = storage.get('vb_transactions', INITIAL_TRANSACTIONS);
        return transactions.filter(tx => tx.accountId === accountId);
    }
};
