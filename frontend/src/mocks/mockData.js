export const USERS = [
    {
        id: 'user-1',
        username: 'admin',
        password: '123456',
        firstName: 'Admin',
        lastName: 'System',
        email: 'admin@virtualbank.com',
        role: 'ADMIN',
        accountNumber: '000-000-001',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'
    },
    {
        id: 'user-2',
        username: 'user',
        password: '123456',
        firstName: 'Regular',
        lastName: 'User',
        email: 'user@example.com',
        role: 'USER',
        accountNumber: '123-456-789',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=User'
    }
];

export const ACCOUNTS = [
    // Admin Pockets
    {
        id: 'acc-1',
        userId: 'user-1',
        balance: 25450.75,
        type: 'Main Wallet',
        currency: 'USD'
    },
    // User Pockets
    {
        id: 'acc-2',
        userId: 'user-2',
        balance: 50000.00,
        type: 'Savings',
        currency: 'USD'
    },
    {
        id: 'acc-3',
        userId: 'user-2',
        balance: 12500.50,
        type: 'Daily Spending',
        currency: 'USD'
    },
    {
        id: 'acc-4',
        userId: 'user-2',
        balance: 8900.00,
        type: 'Travel Fund',
        currency: 'USD'
    }
];

export const TRANSACTIONS = [
    {
        id: 'tx-1',
        accountId: 'acc-2',
        type: 'DEBIT',
        amount: 150.00,
        description: 'Grocery Store',
        date: '2026-03-25T10:30:00Z',
        category: 'Food'
    },
    {
        id: 'tx-2',
        accountId: 'acc-2',
        type: 'CREDIT',
        amount: 2500.00,
        description: 'Salary Deposit',
        date: '2026-03-01T08:00:00Z',
        category: 'Income'
    },
    {
        id: 'tx-3',
        accountId: 'acc-3',
        type: 'DEBIT',
        amount: 45.00,
        description: 'Morning Coffee',
        date: '2026-03-28T07:15:00Z',
        category: 'Food'
    }
];
