import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LoadingGuard from '../components/LoadingGuard';
import { QRCodeCanvas } from 'qrcode.react';
import api from '../utils/axios';
import CreateFunction from '../components/CreateFunction';

const YourPocket = () => {
    const navigate = useNavigate();
    const { user, setUser, handleLogout } = useOutletContext();
    const [accounts, setAccounts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountGoal, setNewAccountGoal] = useState('');
    const [visibleAccountIds, setVisibleAccountIds] = useState([]);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrValue, setQRValue] = useState('');
    const [selectedAccForQR, setSelectedAccForQR] = useState(null);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [moveSourceAcc, setMoveSourceAcc] = useState(null);
    const [moveDestId, setMoveDestId] = useState('');
    const [moveAmount, setMoveAmount] = useState('');

    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [successAccount, setSuccessAccount] = useState(null);

    const fetchAccounts = (userId) => {
        api.get(`/accounts/user/${userId}`)
            .then(res => setAccounts(res.data))
            .catch(err => console.error(err));
    };


    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) { navigate('/login'); return; }
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
        setIsLoading(false);
        fetchAccounts(userData.id);
    }, [navigate]);

    const submitCreateAccount = async () => {
        if (!newAccountName.trim()) return;
        try {
            const res = await api.post(`/accounts/user/${user.id}/create`, {
                accountName: newAccountName,
                savingsGoal: parseFloat(newAccountGoal) || 0
            });
            const newAcc = res.data;
            fetchAccounts(user.id);
            setShowCreateModal(false);
            setNewAccountName('');
            setNewAccountGoal('');
            
            setSuccessAccount(newAcc);
            setShowSuccessModal(true);
        } catch (error) {
            console.error(error);
            alert("สร้างไม่สำเร็จ: " + (error.response?.data?.message || error.message));
        }
    };

    const handleShowQR = (account) => { 
        setQRValue(account.accountNumber); 
        setSelectedAccForQR(account); 
        setShowQRModal(true); 
    };

    const handleMoveMoney = async () => {
        if (!moveSourceAcc || !moveDestId || !moveAmount) return;
        try {
            await api.post('/transactions/transfer', {
                sourceAccountId: moveSourceAcc.id,
                destinationAccountId: moveDestId,
                amount: moveAmount
            });
            alert("ย้ายเงินสำเร็จ!");
            fetchAccounts(user.id);
            setShowMoveModal(false);
            setMoveAmount('');
            setMoveDestId('');
        } catch (error) {
            console.error(error);
            alert("ย้ายเงินไม่สำเร็จ: " + (error.response?.data?.error || error.message));
        }
    };

    const toggleVisibility = (accId) => {
        setVisibleAccountIds(prev => 
            prev.includes(accId) ? prev.filter(id => id !== accId) : [...prev, accId]
        );
    };

    const maskNumber = (num) => `*******${num.slice(-3)}`;

    const handleDeleteAccount = async (accountId, balance) => {
        if (Number(balance) > 0) { alert("ย้ายเงินออกให้หมดก่อนลบนะโบร!"); return; }
        if (window.confirm("คุณแน่ใจใช่ไหมที่จะลบกระเป๋านี้?")) {
            try {
                await api.delete(`/accounts/${accountId}`);
                alert("ลบสำเร็จ!");
                fetchAccounts(user.id);
            } catch (error) {
                console.error(error);
            }
        }
    };

    return (
        <LoadingGuard isLoading={isLoading} user={user} isStatusModalOpen={isStatusModalOpen} onCloseModal={() => setIsStatusModalOpen(false)}>
            <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
                
                <div className="animate-slideInRight">
                    <main className="max-w-6xl mx-auto p-10">
                        
                        {accounts.filter(acc => acc.accountName === 'Main Account' || acc.accountName === 'MAIN ACCOUNT').map(acc => (
                            <div key={acc.id} className="bg-gradient-to-br from-[#065f46] to-[#042f2e] text-white rounded-[2.5rem] p-4 shadow-2xl shadow-emerald-900/20 mb-12 relative overflow-hidden group transition-all border border-white/10">
                                <div className="flex flex-col md:flex-row justify-between items-center gap-8 relative z-10 px-6 py-0.5">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/10">
                                            <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black tracking-tight text-white">Main Account</h2>
                                            <div className="flex items-center gap-3">
                                                <p className="text-emerald-100/60 font-bold text-[11px] tracking-widest">
                                                    Bank Account: {visibleAccountIds.includes(acc.id) ? acc.accountNumber : maskNumber(acc.accountNumber)}
                                                </p>
                                                <button 
                                                    onClick={() => toggleVisibility(acc.id)}
                                                    className="text-white/40 hover:text-white transition-colors"
                                                >
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        {visibleAccountIds.includes(acc.id) ? (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                        ) : (
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                        )}
                                                    </svg>
                                                </button>
                                                <button onClick={() => handleShowQR(acc)} className="bg-white/10 text-white p-2 rounded-xl hover:bg-white/20 transition-all border border-white/10 ml-2">
                                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="text-center md:text-right">
                                        <p className="text-emerald-100/60 text-[10px] font-black uppercase tracking-[0.3em] mb-1">Available Balance</p>
                                        <h2 className="text-5xl font-black tracking-tighter text-white flex items-end justify-center md:justify-end gap-2">
                                            <span className="text-2xl text-emerald-400">฿</span>
                                            {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                        </h2>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <div className="flex justify-between items-center mb-10 mt-12">
                            <div className="flex items-center gap-4">
                                <h1 className="text-4xl font-black tracking-tighter text-slate-900">Your Pockets</h1>
                                <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full border border-slate-200/50">
                                    {accounts.filter(acc => acc.accountName !== 'Main Account' && acc.accountName !== 'MAIN ACCOUNT').length} Total
                                </span>
                            </div>
                            <button 
                                onClick={() => setShowCreateModal(true)}
                                className="bg-[#065f46] text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-emerald-900/10 active:scale-95 transition-all flex items-center gap-3"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
                                </svg>
                                New Pocket
                            </button>
                        </div>

                        {accounts.filter(acc => acc.accountName !== 'Main Account' && acc.accountName !== 'MAIN ACCOUNT').length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-10">
                                {accounts.filter(acc => acc.accountName !== 'Main Account' && acc.accountName !== 'MAIN ACCOUNT').map(acc => {
                                    const goal = Number(acc.savingsGoal || acc.savings_goal) || 0;
                                    const balance = Number(acc.balance) || 0;
                                    const percentage = goal > 0 ? Math.min((balance / goal) * 100, 100) : 0;
                                    return (
                                        <div key={acc.id} className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm group hover:shadow-xl hover:shadow-emerald-900/5 transition-all text-slate-900 flex flex-col justify-between">
                                            <div>
                                                <div className="flex justify-between items-start mb-6">
                                                    <div className="flex flex-col gap-1">
                                                        <h3 className="text-2xl font-black tracking-tight text-slate-800">{acc.accountName}</h3>
                                                        <p className="text-slate-400 font-bold text-[10px] tracking-widest uppercase">
                                                            Bank Account: {visibleAccountIds.includes(acc.id) ? acc.accountNumber : maskNumber(acc.accountNumber)}
                                                        </p>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleShowQR(acc)} className="bg-slate-50 text-slate-400 p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 shadow-sm transition-all border border-slate-100">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                                                            </svg>
                                                        </button>
                                                        <button 
                                                            onClick={() => toggleVisibility(acc.id)}
                                                            className="bg-slate-50 text-slate-400 p-2.5 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 shadow-sm transition-all border border-slate-100"
                                                        >
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                {visibleAccountIds.includes(acc.id) ? (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                                                ) : (
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                                                )}
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </div>
                                                
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1 font-display">Pocket Balance</p>
                                                <h3 className="text-4xl font-black text-slate-800 mb-8 tracking-tighter">฿{balance.toLocaleString()}</h3>
                                            </div>
                                            
                                            <div className="pt-6 border-t border-slate-50 space-y-4">
                                                <div className="flex justify-between items-end">
                                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-display">Savings Goal</p>
                                                    <p className="text-[10px] font-black text-emerald-600 uppercase font-display">{goal > 0 ? `${percentage.toFixed(0)}%` : '0%'}</p>
                                                </div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-emerald-500 rounded-full transition-all duration-1000" 
                                                        style={{ width: `${percentage}%` }}
                                                    ></div>
                                                </div>
                                                
                                                <div className="flex justify-between items-center pt-2 gap-3">
                                                    <button onClick={() => { setMoveSourceAcc(acc); setShowMoveModal(true); }} className="flex-1 bg-emerald-50 text-emerald-600 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100/50 active:scale-95 shadow-sm">Move Money</button>
                                                    <button onClick={() => handleDeleteAccount(acc.id, acc.balance)} className="bg-rose-50 text-rose-500 p-4 rounded-2xl hover:bg-rose-100 transition-all border border-rose-100/50 active:scale-95 shadow-sm">
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        ) : (
                            <div 
                                onClick={() => setShowCreateModal(true)}
                                className="w-full py-20 border-2 border-dashed border-slate-200 rounded-[3rem] flex flex-col items-center justify-center gap-6 hover:border-emerald-500/50 hover:bg-emerald-50/50 transition-all cursor-pointer group mb-10"
                            >
                                <div className="w-20 h-20 bg-white rounded-full shadow-lg flex items-center justify-center text-emerald-500 group-hover:scale-110 transition-transform">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                                    </svg>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">No pockets yet? 🚀</h3>
                                    <p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Tap here to create your first sub-pocket to manage your goals!</p>
                                </div>
                            </div>
                        )}
                    </main>
                </div>

                {showCreateModal && (
                    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-slate-800">
                        <div className="bg-white rounded-[3rem] p-10 w-full max-w-md shadow-2xl">
                            <h3 className="text-3xl font-black mb-1 tracking-tighter text-slate-900">Create Pocket</h3>
                            <p className="text-slate-400 font-bold text-[11px] tracking-widest mb-10">Define your savings target</p>
                            <div className="space-y-4">
                                <input type="text" placeholder="Pocket Name" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 font-bold outline-none focus:border-emerald-500/20 transition-all" />
                                <input type="number" placeholder="Savings Goal" value={newAccountGoal} onChange={(e) => setNewAccountGoal(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-3xl px-8 py-5 font-bold outline-none focus:border-emerald-500/20 transition-all" />
                            </div>
                            <div className="grid grid-cols-2 gap-4 mt-10">
                                <button onClick={() => setShowCreateModal(false)} className="py-5 font-black text-slate-400 uppercase tracking-widest text-[11px] bg-slate-50 rounded-2xl border-2 border-transparent transition-all hover:bg-slate-100">Cancel</button>
                                <button onClick={submitCreateAccount} className="py-5 font-black text-white bg-[#065f46] rounded-2xl shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest">Create Now</button>
                            </div>
                        </div>
                    </div>
                )}

                {showQRModal && selectedAccForQR && (
                    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                        <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center">
                            <div className="flex justify-between items-center mb-8"><span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My QR Code</span><button onClick={() => setShowQRModal(false)} className="text-slate-300 hover:text-slate-500">✕</button></div>
                            <div className="bg-slate-50 p-6 rounded-[2rem] inline-block mb-6 border-4 border-white shadow-inner"><QRCodeCanvas value={qrValue} size={200} level={"H"} fgColor="#0f172a" includeMargin={true} /></div>
                            <div className="mb-8"><h3 className="text-xl font-black text-slate-800 tracking-tight">{user.firstName} {user.lastName}</h3><p className="text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-1">{selectedAccForQR.accountName}</p><p className="bg-emerald-50 text-emerald-600 font-mono font-bold py-2 px-4 rounded-xl inline-block mt-4 tracking-tighter">{selectedAccForQR.accountNumber}</p></div>
                            <button onClick={() => setShowQRModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Done</button>
                        </div>
                    </div>
                )}

                {showMoveModal && (
                    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md text-slate-800">
                        <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
                            <h3 className="text-2xl font-black mb-1 tracking-tight">Move Money</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">From: {moveSourceAcc?.accountName}</p>
                            <div className="space-y-6">
                                <select value={moveDestId} onChange={(e) => setMoveDestId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none">
                                    <option value="">To pocket</option>
                                    {accounts.filter(a => a.id !== moveSourceAcc?.id).map(a => <option key={a.id} value={a.id}>{a.accountName} (฿{a.balance.toLocaleString()})</option>)}
                                </select>
                                <input type="number" placeholder="Amount" value={moveAmount} onChange={(e) => setMoveAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-2xl outline-none" />
                                <button onClick={handleMoveMoney} className="w-full py-5 rounded-2xl font-black text-white bg-[#065f46] shadow-xl active:scale-95 transition-all">Confirm Move</button>
                                <button onClick={() => setShowMoveModal(false)} className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Cancel</button>
                            </div>
                        </div>
                    </div>
                )}

                <CreateFunction 
                    isOpen={showSuccessModal} 
                    onClose={() => setShowSuccessModal(false)} 
                    name={successAccount?.accountName} 
                    accountNumber={successAccount?.accountNumber} 
                />
            </div>
        </LoadingGuard>
    );
};

export default YourPocket;
