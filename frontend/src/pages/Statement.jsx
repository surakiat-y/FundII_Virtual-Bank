import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LoadingGuard from '../components/LoadingGuard';
import NavbarUser from '../components/Navbar-User';
import api from '../utils/axios';

const Statement = () => {
    const navigate = useNavigate();
    const { user, setUser, handleLogout } = useOutletContext();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [transactions, setTransactions] = useState([]);
    
    const [showSlipModal, setShowSlipModal] = useState(false);
    const [slipData, setSlipData] = useState(null);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) { navigate('/login'); return; }
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
        
        api.get(`/accounts/user/${userData.id}`)
            .then(res => {
                const data = res.data;
                setAccounts(data);
                if (data.length > 0) {
                    setSelectedAccountId(data[0].id);
                    fetchTransactions(data[0].id);
                }
            })
            .catch(err => console.error(err));

        // Security check
        api.get(`/auth/status/${userData.id}`)
            .then(res => {
                const { status } = res.data;
                if (status === 'BANNED' || status === 'SUSPENDED') {
                    setIsStatusModalOpen(true);
                }
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [navigate]);

    const fetchTransactions = (accountId) => {
        api.get(`/transactions/account/${accountId}`)
            .then(res => {
                const data = res.data;
                const sorted = data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
                setTransactions(sorted);
            })
            .catch(err => console.error(err));
    };

    const handleAccountSelect = (id) => {
        setSelectedAccountId(id);
        fetchTransactions(id);
    };

    const handleRowClick = (tx) => {
        if (tx.transactionType !== 'TRANSFER') return; 

        const dataForSlip = {
            transactionId: tx.id,
            amount: tx.amount,
            date: tx.transactionDate,
            fromName: tx.sourceAccount.user.firstName + " " + tx.sourceAccount.user.lastName,
            fromAccount: tx.sourceAccount.accountNumber,
            toName: tx.destinationAccount.user.firstName + " " + tx.destinationAccount.user.lastName,
            toAccount: tx.destinationAccount.accountNumber,
            toPocket: tx.destinationAccount.accountName
        };
        
        setSlipData(dataForSlip);
        setShowSlipModal(true);
    };

    // Helper to group transactions by date
    const groupTransactions = (txs) => {
        const groups = {};
        txs.forEach(tx => {
            const date = new Date(tx.transactionDate).toLocaleDateString('en-US', { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
            });
            if (!groups[date]) groups[date] = [];
            groups[date].push(tx);
        });
        return groups;
    };

    const groupedTransactions = groupTransactions(transactions);

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-24 text-slate-800">
            <div className="max-w-5xl mx-auto px-6">
                <header className="pt-16 mb-12 px-2">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Statement</h1>
                </header>

                {/* Account Selection Grid/Carousel */}
                <div className="mb-12">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-4 block">Select Account</label>
                    <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
                        {accounts.map(acc => {
                            const isSelected = Number(selectedAccountId) === acc.id;
                            return (
                                <button 
                                    key={acc.id}
                                    onClick={() => handleAccountSelect(acc.id)}
                                    className={`flex-shrink-0 w-56 p-6 rounded-[2rem] border-2 transition-all text-left ${
                                        isSelected 
                                        ? 'bg-emerald-600 border-emerald-600 shadow-lg shadow-emerald-900/10 text-white' 
                                        : 'bg-white border-slate-100 hover:border-slate-200 text-slate-900'
                                    }`}
                                >
                                    <p className={`text-[9px] font-black uppercase tracking-widest mb-1 ${isSelected ? 'text-emerald-100/60' : 'text-slate-300'}`}>
                                        ****{acc.accountNumber.slice(-4)}
                                    </p>
                                    <h3 className="text-sm font-black tracking-tight truncate leading-tight mb-3">
                                        {acc.accountName}
                                    </h3>
                                    <p className={`font-black text-lg ${isSelected ? 'text-white' : 'text-emerald-600'}`}>
                                        ฿{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                    </p>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Grouped Transaction List */}
                <div className="space-y-12">
                    {Object.keys(groupedTransactions).length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100">
                            <p className="text-slate-300 text-xs font-black uppercase tracking-widest italic">No activity yet.</p>
                        </div>
                    ) : (
                        Object.keys(groupedTransactions).map(date => (
                            <div key={date}>
                                <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] ml-2 mb-4 pr-10 border-b border-slate-100 inline-block pb-1">{date}</h3>
                                <div className="space-y-3">
                                    {groupedTransactions[date].map(tx => {
                                        const accountId = Number(selectedAccountId);
                                        const isSource = tx.sourceAccount?.id === accountId;
                                        const isDest = tx.destinationAccount?.id === accountId;
                                        
                                        // Improved income/expense logic
                                        const isIncome = tx.transactionType === 'DEPOSIT' || tx.transactionType === 'SELL_FUND' || (tx.transactionType === 'TRANSFER' && isDest) || tx.transactionType === 'MOVE_MONEY_IN';
                                        const isExpense = tx.transactionType === 'WITHDRAW' || tx.transactionType.includes('INVEST') || (tx.transactionType === 'TRANSFER' && isSource) || tx.transactionType === 'MOVE_MONEY_OUT';
                                        
                                        // Final determination (default to destination logic for transfers, otherwise type-based)
                                        const expense = isExpense && !isIncome;
                                        
                                        // Transaction Icon Map
                                        let Icon = 'TX';
                                        let bgClass = isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500';
                                        
                                        if (tx.transactionType === 'DEPOSIT') Icon = 'DP';
                                        if (tx.transactionType === 'WITHDRAW') Icon = 'WD';
                                        if (tx.transactionType === 'TRANSFER') Icon = isExpense ? 'OUT' : 'IN';
                                        if (tx.transactionType.includes('INVEST')) {
                                            Icon = 'IV';
                                            bgClass = 'bg-slate-900 text-white';
                                        }

                                        return (
                                            <div 
                                                key={tx.id} 
                                                onClick={() => handleRowClick(tx)}
                                                className={`bg-white p-6 rounded-[2rem] border border-slate-100 flex items-center justify-between transition-all active:scale-[0.98] ${tx.transactionType === 'TRANSFER' ? 'cursor-pointer hover:shadow-md' : ''}`}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-inner ${bgClass}`}>
                                                        {Icon}
                                                    </div>
                                                    <div>
                                                        <p className="font-black text-slate-900 text-sm uppercase tracking-tight leading-none mb-1.5">
                                                            {tx.transactionType === 'TRANSFER' 
                                                                ? (isExpense ? `To ${tx.destinationAccount.user.firstName}` : `From ${tx.sourceAccount.user.firstName}`) 
                                                                : tx.transactionType.replace(/_/g, ' ')}
                                                        </p>
                                                        <p className="text-slate-400 text-[10px] font-bold">
                                                            {new Date(tx.transactionDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className={`text-xl font-black tracking-tight tabular-nums ${expense ? 'text-rose-500' : 'text-emerald-500'}`}>
                                                        {expense ? '−' : '+'} ฿{tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                    </p>
                                                    <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-0.5">Success</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* ─── Digital Slip Modal ─── */}
            {showSlipModal && slipData && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl border border-slate-100">
                        <div className="bg-emerald-600 p-10 text-center text-white relative">
                            <h3 className="font-black text-lg uppercase tracking-widest leading-none mb-2">E-Receipt</h3>
                            <p className="text-emerald-100/50 text-[10px] uppercase font-black tracking-[0.2em]">{new Date(slipData.date).toLocaleString('en-US')}</p>
                        </div>

                        <div className="p-8 space-y-8 bg-white relative">
                            <div className="text-center pb-8 border-b border-slate-50">
                                <p className="text-slate-300 text-[9px] font-black uppercase tracking-widest mb-2">Transaction Amount</p>
                                <h2 className="text-4xl font-black text-slate-900 tracking-tighter">฿{Number(slipData.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}</h2>
                            </div>

                            <div className="space-y-6 relative px-2">
                                <div className="absolute left-[13px] top-4 bottom-4 border-l-2 border-dashed border-slate-100"></div>
                                <div className="flex gap-4 relative">
                                    <div className="w-7 h-7 rounded-lg bg-slate-900 flex-shrink-0 z-10 border-4 border-white shadow-sm"></div>
                                    <div>
                                        <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1">Sender</p>
                                        <p className="text-xs font-black text-slate-900">{slipData.fromName}</p>
                                        <p className="text-[9px] text-slate-400 font-mono">****{slipData.fromAccount.slice(-4)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative">
                                    <div className="w-7 h-7 rounded-lg bg-emerald-500 flex-shrink-0 z-10 border-4 border-white shadow-sm"></div>
                                    <div>
                                        <p className="text-[8px] font-black text-emerald-400 uppercase tracking-widest leading-none mb-1">Receiver</p>
                                        <p className="text-xs font-black text-slate-900">{slipData.toName}</p>
                                        <p className="text-[9px] text-slate-400 font-mono">****{slipData.toAccount.slice(-4)}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between items-end border-t border-slate-50">
                                <div>
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">TX Ref ID</p>
                                    <p className="text-[9px] font-mono text-slate-400 font-bold">#VB-{slipData.transactionId.toString().padStart(6, '0')}</p>
                                </div>
                                <button 
                                    onClick={() => setShowSlipModal(false)}
                                    className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95"
                                >
                                    Close
                                </button>
                            </div>
                        </div>

                        {/* Traditional Zigzag */}
                        <div className="flex justify-between px-2 -mb-2 overflow-hidden">
                            {[...Array(15)].map((_, i) => (
                                <div key={i} className="w-4 h-4 bg-slate-50 rounded-full flex-shrink-0"></div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Statement;