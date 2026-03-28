import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { formatCurrency, maskAccountNumber } from '../utils/formatters';
import BrandingBadge from '../components/BrandingBadge';

const UserDashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [transactions, setTransactions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [showAccount, setShowAccount] = useState(false);
    const [activeAccountId, setActiveAccountId] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            const currentUser = api.getCurrentUser();
            if (!currentUser) {
                navigate('/login');
                return;
            }

            // Role Check: Only allow 'USER' role to access this dashboard
            if (currentUser.role !== 'USER') {
                console.warn('Access denied: Unauthorized role', currentUser.role);
                alert('Access Denied: You do not have permission to view the User Dashboard.');
                navigate('/login');
                return;
            }

            setUser(currentUser);

            try {
                // Refresh user session to get latest data (e.g. accountNumber)
                const freshUser = await api.getFreshUser(currentUser.id);
                if (freshUser) setUser(freshUser);

                const userAccounts = await api.getAccounts(currentUser.id);
                setAccounts(userAccounts);
                if (userAccounts.length > 0 && !activeAccountId) {
                    setActiveAccountId(userAccounts[0].id);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard data', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [navigate]);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (!activeAccountId) return;
            try {
                const latestTransactions = await api.getTransactions(activeAccountId);
                setTransactions(latestTransactions);
            } catch (error) {
                console.error('Failed to fetch transactions', error);
            }
        };
        fetchTransactions();
    }, [activeAccountId]);

    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    const activeAccount = accounts.find(acc => acc.id === activeAccountId) || accounts[0];

    const handleLogout = async () => {
        await api.logout();
        navigate('/login');
    };

    if (isLoading) {
        return (
            <div className="min-h-screen w-full bg-[#f0fdf4] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
                    <p className="text-emerald-800 font-bold animate-pulse">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen w-full bg-[#f0fdf4] font-sans relative overflow-x-hidden pb-20">
            {/* Soft Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-3xl opacity-60 pointer-events-none z-0"></div>
            <div className="absolute top-[40%] right-[-10%] w-[30%] h-[30%] bg-blue-200/20 rounded-full blur-3xl opacity-50 pointer-events-none z-0"></div>

            {/* Top Navigation */}
            <nav className="p-6 md:p-8 flex justify-between items-center max-w-7xl mx-auto w-full relative z-20">
                <BrandingBadge />

                <div className="flex items-center gap-4">
                    {/* Account Display with Eye Toggle */}
                    {activeAccount && (
                        <div className="flex items-center gap-4 bg-white px-5 py-2.5 rounded-full border border-slate-100 shadow-sm mr-2 transition-all hover:shadow-md">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-300 leading-none mb-1">Personal Account Number</span>
                                <div className="flex items-center gap-3">
                                    <span className="text-base font-black text-slate-800 font-mono tracking-wider">
                                        {user?.accountNumber ? (showAccount ? user.accountNumber : maskAccountNumber(user.accountNumber)) : '---'}
                                    </span>
                                    <button
                                        onClick={() => setShowAccount(!showAccount)}
                                        className="text-slate-400 hover:text-emerald-600 transition-colors p-1 rounded-full hover:bg-slate-50"
                                    >
                                        {showAccount ? (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                        ) : (
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                            <div className="h-8 w-[1px] bg-slate-100 mx-1"></div>
                            <div className="flex flex-col px-2">
                                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest leading-none mb-1 opacity-70">Active Pocket</span>
                                <span className="text-[11px] font-black text-slate-600 uppercase leading-none">{activeAccount.type}</span>
                            </div>
                        </div>
                    )}

                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Account Role</span>
                        <span className="text-xs font-bold text-emerald-700">{user?.role}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="text-[11px] font-black uppercase tracking-[2px] text-slate-400 hover:text-red-500 transition-colors bg-white px-5 py-3 rounded-full shadow-sm border border-slate-100"
                    >
                        Log Out
                    </button>
                </div>
            </nav>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 md:px-8 relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">

                {/* Header Section */}
                <header className="mb-10">
                    <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
                        Welcome back, <span className="text-emerald-700">{user?.firstName}</span>
                    </h1>
                    <p className="text-slate-500 mt-2 text-lg font-medium">Here's your financial overview today.</p>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column (Main Stats & Actions) */}
                    <div className="lg:col-span-2 flex flex-col gap-8">

                        {/* Total Balance Card */}
                        <div className="bg-[#065f46] rounded-[32px] p-8 md:p-10 text-white shadow-[0_20px_40px_-15px_rgba(6,95,70,0.4)] relative overflow-hidden">
                            {/* Card Decoration */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl"></div>

                            <p className="text-emerald-100 text-sm font-bold uppercase tracking-[2px] mb-2 opacity-80">Total Balance</p>
                            <h2 className="text-5xl md:text-6xl font-black tracking-tighter">
                                {formatCurrency(totalBalance)}
                            </h2>

                            {/* Quick Actions Array */}
                            <div className="grid grid-cols-3 gap-4 mt-10">
                                <button onClick={() => navigate('/deposit')} className="bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-2xl p-4 flex flex-col items-center gap-3 backdrop-blur-sm border border-white/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-emerald-300">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Deposit</span>
                                </button>
                                <button onClick={() => navigate('/withdraw')} className="bg-white/10 hover:bg-white/20 active:scale-95 transition-all rounded-2xl p-4 flex flex-col items-center gap-3 backdrop-blur-sm border border-white/10">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6 text-emerald-300">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                                    </svg>
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Withdraw</span>
                                </button>
                                <button onClick={() => navigate('/transfer')} className="bg-emerald-400 hover:bg-emerald-300 active:scale-95 text-[#065f46] transition-all rounded-2xl p-4 flex flex-col items-center gap-3 shadow-lg">
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                                    </svg>
                                    <span className="text-[10px] font-black uppercase tracking-wider">Transfer</span>
                                </button>
                            </div>
                        </div>

                        {/* Sub Accounts Section */}
                        <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="text-xl font-black text-slate-900 tracking-tight">Your Pocket</h3>
                                <button onClick={() => navigate('/create-wallet')} className="text-[11px] font-bold text-emerald-600 uppercase tracking-widest hover:bg-emerald-50 px-4 py-2 rounded-xl transition-colors">
                                    + Add New
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {accounts.map((acc) => (
                                    <div 
                                        key={acc.id} 
                                        onClick={() => setActiveAccountId(acc.id)}
                                        className={`bg-slate-50 rounded-2xl p-5 border-2 transition-all cursor-pointer group ${
                                            activeAccountId === acc.id ? 'border-emerald-500 bg-emerald-50/30 shadow-md' : 'border-slate-100 hover:border-emerald-500/30'
                                        }`}
                                    >
                                        <div className={`w-3 h-3 rounded-full ${acc.type === 'Savings' ? 'bg-emerald-500' : 'bg-blue-500'} mb-4 group-hover:scale-110 transition-transform`}></div>
                                        <p className="text-[10px] font-bold text-slate-400 mb-1 uppercase tracking-widest">{acc.type}</p>
                                        <p className="text-lg font-black text-slate-800">{formatCurrency(acc.balance, acc.currency)}</p>
                                    </div>
                                ))}
                                {accounts.length === 0 && (
                                    <div className="col-span-3 py-10 text-center border-2 border-dashed border-slate-100 rounded-2xl">
                                        <p className="text-slate-400 font-bold">No active wallets found.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column (Transactions) */}
                    <div className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-full">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight">Recent Activity</h3>
                            <button className="text-[11px] font-bold text-slate-400 hover:text-emerald-600 uppercase tracking-widest transition-colors">
                                View All
                            </button>
                        </div>

                        <div className="flex flex-col gap-4">
                            {transactions.map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-colors border-2 border-transparent hover:border-slate-100">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {tx.type === 'CREDIT' ? (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25" />
                                                </svg>
                                            ) : (
                                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
                                                </svg>
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-800 text-sm">{tx.description}</p>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mt-1">{new Date(tx.date).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`font-black ${tx.type === 'CREDIT' ? 'text-emerald-600' : 'text-slate-800'}`}>
                                            {tx.type === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount)}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            {transactions.length === 0 && (
                                <p className="text-center py-10 text-slate-300 font-bold uppercase tracking-widest text-[10px]">No transaction history</p>
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default UserDashboard;