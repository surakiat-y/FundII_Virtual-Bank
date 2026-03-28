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
        
        // ดึงบัญชีทั้งหมดของผู้ใช้
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
                // เรียงจากใหม่ไปเก่า
                const sorted = data.sort((a, b) => new Date(b.transactionDate) - new Date(a.transactionDate));
                setTransactions(sorted);
            });
    };

    const handleAccountChange = (e) => {
        const id = e.target.value;
        setSelectedAccountId(id);
        fetchTransactions(id);
    };

    // ─── ฟังก์ชัน "กางสลิป" เมื่อกดที่รายการ ───
    const handleRowClick = (tx) => {
        if (tx.transactionType !== 'TRANSFER') return; // ถ้าไม่ใช่โอน ไม่ต้องโชว์สลิปแบบโอน

        // จัด Format ข้อมูลให้เข้ากับ UI Slip
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
        <div className="min-h-screen bg-slate-50 font-sans pb-20">
            {/* Header */}
            <header className="p-6 flex justify-between items-center max-w-4xl mx-auto">
                <button onClick={() => navigate('/dashboard')} className="text-emerald-600 font-black text-xs uppercase tracking-widest flex items-center gap-2">
                    ← Back to Dashboard
                </button>
                <h1 className="text-xl font-black text-slate-800">E-Statement</h1>
                <div className="w-20"></div>
            </header>

            <main className="max-w-4xl mx-auto p-6">
                <div className="flex justify-between items-end mb-10">
                    <div>
                        <h2 className="text-4xl font-black text-slate-800 mb-2">Transaction History</h2>
                        <p className="text-slate-400 text-sm">Review your latest financial activities</p>
                    </div>
                    <div className="text-right">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Select Account</label>
                        <select 
                            value={selectedAccountId} 
                            onChange={handleAccountChange}
                            className="bg-white border-2 border-slate-100 rounded-2xl px-6 py-3 font-bold text-slate-700 outline-none shadow-sm"
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
                        <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-300 font-bold">
                            No transactions yet.
                        </div>
                    ) : (
                        transactions.map(tx => (
                            <div 
                                key={tx.id} 
                                onClick={() => handleRowClick(tx)}
                                className={`bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between transition-all active:scale-[0.98] ${tx.transactionType === 'TRANSFER' ? 'cursor-pointer hover:border-emerald-200 hover:shadow-md' : ''}`}
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl ${
                                        tx.transactionType === 'TRANSFER' ? 'bg-rose-50 text-rose-500' :
                                        tx.transactionType === 'DEPOSIT' ? 'bg-emerald-50 text-emerald-500' : 'bg-slate-50 text-slate-500'
                                    }`}>
                                        {tx.transactionType === 'TRANSFER' ? '⇄' : tx.transactionType === 'DEPOSIT' ? '↓' : '↑'}
                                    </div>
                                    <div>
                                        <p className="font-black text-slate-800">
                                            {tx.transactionType === 'TRANSFER' 
                                                ? `Transferred to ${tx.destinationAccount.user.firstName}` 
                                                : tx.transactionType}
                                        </p>
                                        <p className="text-slate-400 text-xs font-bold mt-1">
                                            {new Date(tx.transactionDate).toLocaleString('th-TH')}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-xl font-black ${tx.transactionType === 'DEPOSIT' ? 'text-emerald-500' : 'text-slate-800'}`}>
                                        {tx.transactionType === 'DEPOSIT' ? '+' : '-'} ฿{tx.amount.toLocaleString(undefined, {minimumFractionDigits: 2})}
                                    </p>
                                    <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-1">Successful</p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>

            {/* ─── Digital Slip Modal (ตัวเดียวกับ Dashboard) ─── */}
            {showSlipModal && slipData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-emerald-500 p-8 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-white font-black text-xl uppercase tracking-widest">Transaction Receipt</h3>
                            <p className="text-emerald-100 text-[10px] mt-1 font-mono">
                                {new Date(slipData.date).toLocaleString('th-TH')}
                            </p>
                        </div>

                        <div className="p-8 space-y-6 relative">
                            <div className="text-center pb-6 border-b border-slate-100">
                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Amount</p>
                                <h2 className="text-4xl font-black text-slate-800">฿{Number(slipData.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</h2>
                            </div>

                            <div className="space-y-6 relative">
                                <div className="absolute left-[11px] top-3 bottom-3 border-l-2 border-dashed border-slate-100"></div>
                                <div className="flex gap-4 relative">
                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex-shrink-0 z-10 border-4 border-white"></div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">From</p>
                                        <p className="text-sm font-bold text-slate-800">{slipData.fromName}</p>
                                        <p className="text-xs text-slate-400 font-mono">****{slipData.fromAccount.slice(-4)}</p>
                                    </div>
                                </div>

                                <div className="flex gap-4 relative">
                                    <div className="w-6 h-6 rounded-full bg-emerald-500 flex-shrink-0 z-10 border-4 border-white"></div>
                                    <div>
                                        <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">To</p>
                                        <p className="text-sm font-bold text-slate-800">{slipData.toName}</p>
                                        <p className="text-xs text-slate-400 font-mono">****{slipData.toAccount.slice(-4)} ({slipData.toPocket})</p>
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-100 flex justify-between items-center">
                                <div>
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Ref No.</p>
                                    <p className="text-[10px] font-mono text-slate-400">#VB-{slipData.transactionId.toString().padStart(6, '0')}</p>
                                </div>
                                <button 
                                    onClick={() => setShowSlipModal(false)}
                                    className="px-6 py-2 bg-slate-100 text-slate-800 rounded-xl font-black text-[10px] uppercase hover:bg-slate-200 transition-all"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
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