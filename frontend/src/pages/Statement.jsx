import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Statement = () => {
    const navigate = useNavigate();
    const [accounts, setAccounts] = useState([]);
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [transactions, setTransactions] = useState([]);
    
    // ─── States สำหรับการดูสลิป ───
    const [showSlipModal, setShowSlipModal] = useState(false);
    const [slipData, setSlipData] = useState(null);

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) { navigate('/login'); return; }
        const user = JSON.parse(loggedInUser);
        
        fetch(`http://localhost:8080/api/accounts/user/${user.id}`)
            .then(res => res.json())
            .then(data => {
                setAccounts(data);
                if (data.length > 0) {
                    setSelectedAccountId(data[0].id);
                    fetchTransactions(data[0].id);
                }
            });
    }, [navigate]);

    const fetchTransactions = (accountId) => {
        fetch(`http://localhost:8080/api/transactions/account/${accountId}`)
            .then(res => res.json())
            .then(data => {
                const sorted = data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
                setTransactions(sorted);
            });
    };

    const handleAccountChange = (e) => {
        const id = e.target.value;
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

    return (
        <div className="min-h-screen bg-slate-50 font-sans pb-20 text-slate-800">
            {/* Header */}
            <header className="p-6 flex justify-between items-center max-w-4xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="text-emerald-600 font-black text-[10px] uppercase tracking-[0.2em] flex items-center gap-2 hover:bg-emerald-50 px-4 py-2 rounded-full transition-all">
                    ← Back
                </button>
                <h1 className="text-lg font-black text-slate-800 uppercase tracking-widest">E-Statement</h1>
                <div className="w-16"></div>
            </header>

            <main className="max-w-4xl mx-auto p-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                    <div>
                        <h2 className="text-5xl font-black text-slate-900 mb-3 tracking-tighter">History</h2>
                        <p className="text-slate-400 text-sm font-medium">Review your latest financial activities</p>
                    </div>
                    <div className="w-full md:w-auto">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Filter by Account</label>
                        <select 
                            value={selectedAccountId} 
                            onChange={handleAccountChange}
                            className="w-full md:w-64 bg-white border-2 border-slate-100 rounded-[1.25rem] px-6 py-4 font-bold text-slate-700 outline-none shadow-sm focus:border-emerald-500/20 transition-all cursor-pointer"
                        >
                            {accounts.map(acc => (
                                <option key={acc.id} value={acc.id}>{acc.accountName} (****{acc.accountNumber.slice(-4)})</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* List Items */}
                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-[2.5rem] border-2 border-dashed border-slate-100 text-slate-300 font-bold uppercase tracking-widest text-xs">
                            No movements in this pocket.
                        </div>
                    ) : (
                        transactions.map(tx => {
                            // 🔥 Logic แยกสีเงินเข้า-เงินออก
                            // ถ้าเป็นบัญชีเราเป็นผู้ส่ง (source) หรือเป็นประเภท WITHDRAW = สีแดง (เงินออก)
                            const isExpense = tx.sourceAccount?.id === Number(selectedAccountId) || tx.transactionType === 'WITHDRAW' || tx.transactionType === 'MOVE_MONEY_OUT';
                            const isIncome = tx.destinationAccount?.id === Number(selectedAccountId) || tx.transactionType === 'DEPOSIT';

                            return (
                                <div 
                                    key={tx.id} 
                                    onClick={() => handleRowClick(tx)}
                                    className={`bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all active:scale-[0.97] hover:shadow-md ${tx.transactionType === 'TRANSFER' ? 'cursor-pointer hover:border-emerald-100' : ''}`}
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-lg font-black ${
                                            isExpense ? 'bg-rose-50 text-rose-500' : 'bg-emerald-50 text-emerald-500'
                                        }`}>
                                            {tx.transactionType === 'TRANSFER' ? 'T' : tx.transactionType === 'DEPOSIT' ? 'D' : 'W'}
                                        </div>
                                        <div>
                                            <p className="font-black text-slate-800 text-sm uppercase tracking-tight">
                                                {tx.transactionType === 'TRANSFER' 
                                                    ? (isExpense ? `To ${tx.destinationAccount.user.firstName}` : `From ${tx.sourceAccount.user.firstName}`) 
                                                    : tx.transactionType.replace(/_/g, ' ')}
                                            </p>
                                            <p className="text-slate-400 text-[10px] font-bold mt-0.5">
                                                {new Date(tx.transactionDate).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-xl font-black tracking-tight ${isExpense ? 'text-rose-500' : 'text-emerald-500'}`}>
                                            {isExpense ? '-' : '+'} ฿{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                        </p>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mt-1">SUCCESS</p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </main>

            {/* ─── Digital Slip Modal ─── */}
            {showSlipModal && slipData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-emerald-500 p-10 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-full bg-black/5 pointer-events-none"></div>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/20">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-white font-black text-xl uppercase tracking-[0.1em]">Transaction Receipt</h3>
                            <p className="text-emerald-100 text-[10px] mt-2 font-mono opacity-80">
                                {new Date(slipData.date).toLocaleString('th-TH')}
                            </p>
                        </div>

                        <div className="p-8 space-y-8 relative bg-white">
                            <div className="text-center pb-8 border-b border-slate-50">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2">Amount Transferred</p>
                                <h2 className="text-5xl font-black text-slate-900 tracking-tighter">฿{Number(slipData.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                            </div>

                            <div className="space-y-7 relative">
                                <div className="absolute left-[11px] top-3 bottom-3 border-l-2 border-dashed border-slate-100"></div>
                                <div className="flex gap-5 relative">
                                    <div className="w-6 h-6 rounded-full bg-slate-900 flex-shrink-0 z-10 border-4 border-white shadow-sm"></div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">From</p>
                                        <p className="text-sm font-black text-slate-800 tracking-tight">{slipData.fromName}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">****{slipData.fromAccount.slice(-4)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-5 relative">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0 z-10 border-4 border-white shadow-sm"></div>
                                    <div>
                                        <p className="text-[9px] font-black text-emerald-300 uppercase tracking-widest mb-1">To</p>
                                        <p className="text-sm font-black text-slate-800 tracking-tight">{slipData.toName}</p>
                                        <p className="text-[10px] text-slate-400 font-mono">****{slipData.toAccount.slice(-4)} ({slipData.toPocket})</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 flex justify-between items-center border-t border-slate-50">
                                <div>
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest mb-1">Reference ID</p>
                                    <p className="text-[10px] font-mono text-slate-400 font-bold">#VB-{slipData.transactionId.toString().padStart(6, '0')}</p>
                                </div>
                                <button 
                                    onClick={() => setShowSlipModal(false)}
                                    className="px-8 py-3 bg-slate-900 text-white rounded-[1.2rem] font-black text-[10px] uppercase tracking-widest shadow-lg active:scale-95 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                        {/* Zigzag Bottom Decor */}
                        <div className="flex justify-between px-2 -mb-2">
                            {[...Array(15)].map((_, i) => (<div key={i} className="w-4 h-4 bg-slate-50 rounded-full"></div>))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Statement;