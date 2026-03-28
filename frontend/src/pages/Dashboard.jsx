import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [accounts, setAccounts] = useState([]);
    
    // ─── Super App States ───
    const [favorites, setFavorites] = useState([]);
    const [showSlipModal, setShowSlipModal] = useState(false);
    const [slipData, setSlipData] = useState(null);

    // ─── Pocket States ───
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountGoal, setNewAccountGoal] = useState('');

    // ─── Transfer States ───
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [sourceId, setSourceId] = useState('');
    const [destAccountNumber, setDestAccountNumber] = useState('');
    const [destAccountName, setDestAccountName] = useState('');
    const [destId, setDestId] = useState(null);
    const [transferAmount, setTransferAmount] = useState('');

    // ─── Withdraw States ───
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAccountId, setWithdrawAccountId] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');

    // ─── Move Money States ───
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [moveSourceAcc, setMoveSourceAcc] = useState(null);
    const [moveDestId, setMoveDestId] = useState('');
    const [moveAmount, setMoveAmount] = useState('');
    
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchAccounts = (userId) => {
        fetch(`http://localhost:8080/api/accounts/user/${userId}`)
            .then(res => res.json())
            .then(data => {
                console.log("Raw Accounts Data:", data);
                setAccounts(data);
            })
            .catch(err => console.error("Error:", err));
    };

    const fetchFavorites = (userId) => {
        fetch(`http://localhost:8080/api/favorites/user/${userId}`)
            .then(res => res.json())
            .then(data => setFavorites(data))
            .catch(err => console.error("Error Favorites:", err));
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) { navigate('/login'); return; }
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
        fetchAccounts(userData.id);
        fetchFavorites(userData.id);
    }, [navigate]);

    useEffect(() => {
        if (destAccountNumber.length === 10) {
            fetch(`http://localhost:8080/api/accounts/search?accountNumber=${destAccountNumber}`)
                .then(res => res.json())
                .then(data => {
                    setDestAccountName(`${data.user.firstName} ${data.user.lastName} (${data.accountName})`);
                    setDestId(data.id);
                })
                .catch(() => {
                    setDestAccountName('ไม่พบข้อมูลบัญชีปลายทาง');
                    setDestId(null);
                });
        } else { setDestAccountName(''); setDestId(null); }
    }, [destAccountNumber]);

    const handleLogout = () => { localStorage.removeItem('user'); navigate('/login'); };

    // 🔥 ฟังก์ชันลบบัญชี
    const handleDeleteAccount = async (accountId, balance) => {
        if (Number(balance) > 0) {
            alert("ไม่สามารถลบได้: กรุณาย้ายเงินออกให้หมดก่อน (ยอดคงเหลือต้องเป็น ฿0.00)");
            return;
        }

        if (window.confirm("คุณแน่ใจใช่ไหมที่จะลบกระเป๋านี้? ประวัติการโอนในกระเป๋านี้จะหายไปด้วยนะโบร!")) {
            try {
                const response = await fetch(`http://localhost:8080/api/accounts/${accountId}`, {
                    method: 'DELETE'
                });
                if (response.ok) {
                    alert("ลบกระเป๋าเงินเรียบร้อย!");
                    fetchAccounts(user.id);
                } else {
                    const error = await response.text();
                    alert("ลบไม่สำเร็จ: " + error);
                }
            } catch (err) {
                alert("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
            }
        }
    };

    const submitCreateAccount = async () => {
        if (!newAccountName.trim()) return;
        try {
            const goalValue = parseFloat(newAccountGoal) || 0;
            const response = await fetch(`http://localhost:8080/api/accounts/user/${user.id}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    accountName: newAccountName,
                    savingsGoal: goalValue 
                })
            });
            if (response.ok) { 
                fetchAccounts(user.id); 
                setShowCreateModal(false); 
                setNewAccountName(''); 
                setNewAccountGoal('');
            }
        } catch (error) { console.error("Fetch Error:", error); }
    };

    const handleAddFavorite = async () => {
        const nickname = prompt("ตั้งชื่อเล่นสำหรับบัญชีนี้:");
        if (!nickname) return;
        try {
            const response = await fetch('http://localhost:8080/api/favorites/add', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: user.id,
                    nickname: nickname,
                    accountNumber: slipData.toAccount,
                    ownerName: slipData.toName
                })
            });
            if (response.ok) {
                alert("บันทึกบัญชีโปรดสำเร็จ!");
                fetchFavorites(user.id);
            }
        } catch (error) { alert("บันทึกไม่สำเร็จ"); }
    };

    const handleTransfer = async () => {
        if (!sourceId || !destId || !transferAmount) return;
        setIsProcessing(true);
        try {
            const response = await fetch('http://localhost:8080/api/transactions/transfer', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sourceAccountId: sourceId, destinationAccountId: destId, amount: transferAmount })
            });
            const data = await response.json();
            if (response.ok) {
                setSlipData(data);
                setShowSlipModal(true);
                fetchAccounts(user.id);
                setShowTransferModal(false);
                setSourceId(''); setDestAccountNumber(''); setTransferAmount('');
            } else { alert("โอนไม่สำเร็จ: " + (data.error || "เกิดข้อผิดพลาด")); }
        } catch (error) { alert("เกิดข้อผิดพลาด"); } finally { setIsProcessing(false); }
    };

    const handleWithdraw = async () => {
        if (!withdrawAccountId || !withdrawAmount) return;
        setIsProcessing(true);
        try {
            const response = await fetch('http://localhost:8080/api/transactions/withdraw', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: withdrawAccountId, amount: Number(withdrawAmount) })
            });
            if (response.ok) {
                alert("ถอนเงินสำเร็จ!");
                fetchAccounts(user.id);
                setShowWithdrawModal(false);
                setWithdrawAccountId(''); setWithdrawAmount('');
            } else { 
                const data = await response.json();
                alert("ถอนเงินไม่สำเร็จ: " + (data.error || "ยอดเงินไม่พอ")); 
            }
        } catch (error) { alert("เกิดข้อผิดพลาด"); } finally { setIsProcessing(false); }
    };

    const handleMoveMoney = async () => {
        if (!moveSourceAcc || !moveDestId || !moveAmount) return;
        setIsProcessing(true);
        try {
            const response = await fetch('http://localhost:8080/api/transactions/move-money', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sourceAccountId: moveSourceAcc.id,
                    destinationAccountId: moveDestId,
                    amount: moveAmount
                })
            });
            if (response.ok) {
                alert("ย้ายเงินสำเร็จ!");
                fetchAccounts(user.id);
                setShowMoveModal(false);
                setMoveDestId(''); setMoveAmount('');
            } else { alert("ย้ายเงินไม่สำเร็จ"); }
        } catch (error) { alert("เกิดข้อผิดพลาด"); } finally { setIsProcessing(false); }
    };

    if (!user) return null;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm text-slate-800">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center font-bold">{user.firstName?.charAt(0)}</div>
                    <div className="font-bold">{user.firstName} {user.lastName}</div>
                </div>
                <button onClick={handleLogout} className="text-xs font-bold text-slate-400 uppercase tracking-widest">Log Out</button>
            </nav>

            <main className="max-w-5xl mx-auto p-8 text-slate-800">
                <div className="bg-gradient-to-br from-[#065f46] to-[#042f2e] rounded-[2.5rem] p-10 text-white shadow-2xl mb-10 relative overflow-hidden">
                    <p className="text-emerald-200/60 text-sm font-bold uppercase tracking-widest mb-2">Total Balance</p>
                    <h1 className="text-6xl font-black mb-10">฿{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
                    <div className="flex gap-4">
                        <button onClick={() => setShowTransferModal(true)} className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-bold text-sm transition-transform active:scale-95 shadow-lg">Transfer</button>
                        <button onClick={() => setShowWithdrawModal(true)} className="bg-emerald-800/40 text-white border border-emerald-700 px-8 py-4 rounded-2xl font-bold text-sm transition-transform active:scale-95">Withdraw</button>
                        <button onClick={() => navigate('/statement')} className="bg-emerald-800/40 text-white border border-emerald-700 px-8 py-4 rounded-2xl font-bold text-sm transition-transform active:scale-95">Statement</button>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-6 px-2">
                    <h2 className="text-2xl font-black text-slate-800">My Pockets</h2>
                    <button onClick={() => setShowCreateModal(true)} className="text-emerald-600 font-bold uppercase text-[11px] tracking-widest">+ Add Pocket</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accounts.map((account, index) => {
                        const goal = Number(account.savingsGoal || account.savings_goal || account.savingsgoal) || 0;
                        const balance = Number(account.balance) || 0;
                        const percentage = goal > 0 ? Math.min((balance / goal) * 100, 100) : 0;

                        return (
                            <div key={account.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm group relative overflow-hidden transition-all hover:shadow-md text-slate-800">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <p className="text-slate-400 text-[10px] font-black uppercase">{account.accountName}</p>
                                            {/* 🔥 ปุ่มกากบาทลบบัญชี (จะซ่อนถ้าเป็นบัญชีแรก index 0) */}
                                            {index !== 0 && (
                                                <button 
                                                    onClick={() => handleDeleteAccount(account.id, account.balance)}
                                                    className="w-5 h-5 flex items-center justify-center rounded-full text-slate-300 hover:bg-rose-50 hover:text-rose-500 transition-all text-[10px]"
                                                    title="Delete Pocket"
                                                >
                                                    ✕
                                                </button>
                                            )}
                                        </div>
                                        <p className="text-slate-500 font-mono text-[10px]">#{account.accountNumber}</p>
                                    </div>
                                    <button onClick={() => { setMoveSourceAcc(account); setShowMoveModal(true); }} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-100 transition-colors shadow-sm">Move Money</button>
                                </div>
                                <h3 className="text-3xl font-black">฿{balance.toLocaleString()}</h3>
                                
                                <div className="mt-6 space-y-2">
                                    <div className="flex justify-between items-end">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savings Goal</p>
                                        <p className="text-[10px] font-black text-emerald-600 uppercase">
                                            {goal > 0 ? `${percentage.toFixed(0)}%` : '0%'}
                                        </p>
                                    </div>
                                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div>
                                    </div>
                                    {goal > 0 && (
                                        <p className="text-[9px] text-slate-400 font-bold italic text-right">Target: ฿{goal.toLocaleString()}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Modal Transfer */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl text-slate-800 animate-in zoom-in-95">
                        <div className="flex justify-between items-start mb-8 font-black">
                            <h3 className="text-3xl tracking-tight">Transfer</h3>
                            <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="mb-6 overflow-x-auto no-scrollbar">
                            <label className="text-[10px] font-black uppercase text-slate-400 block mb-3 font-mono">Quick Favorites</label>
                            <div className="flex gap-4 pb-2">
                                {favorites.length === 0 && <p className="text-[10px] text-slate-300 italic font-bold">No favorites added.</p>}
                                {favorites.map(fav => (
                                    <button key={fav.id} onClick={() => setDestAccountNumber(fav.accountNumber)} className="flex-shrink-0 flex flex-col items-center gap-2 group">
                                        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 font-black group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all border border-transparent group-hover:border-emerald-100">{fav.nickname.charAt(0)}</div>
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">{fav.nickname}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-6">
                            <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500/20">
                                <option value="">Select source pocket</option>
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountName} (฿{acc.balance.toLocaleString()})</option>)}
                            </select>
                            <input type="text" placeholder="To Account Number" maxLength="10" value={destAccountNumber} onChange={(e) => setDestAccountNumber(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500/20" />
                            {destAccountName && <p className="text-xs font-bold text-emerald-600 px-2 italic">{destAccountName}</p>}
                            <input type="number" placeholder="Amount (THB)" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-2xl outline-none focus:border-emerald-500/20" />
                            <button onClick={handleTransfer} disabled={isProcessing || !destId} className="w-full py-5 rounded-2xl font-black text-white bg-[#065f46] shadow-xl active:scale-95 transition-all disabled:bg-slate-200">Confirm Transfer</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Withdraw */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl text-slate-800 animate-in zoom-in-95">
                        <h3 className="text-3xl font-black mb-8 tracking-tight">Withdraw</h3>
                        <div className="space-y-6">
                            <select value={withdrawAccountId} onChange={(e) => setWithdrawAccountId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500/20">
                                <option value="">Select pocket</option>
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountName} (฿{acc.balance.toLocaleString()})</option>)}
                            </select>
                            <input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-2xl outline-none focus:border-emerald-500/20" />
                            <button onClick={handleWithdraw} className="w-full py-5 rounded-2xl font-black text-white bg-[#065f46] shadow-xl active:scale-95 transition-all">Confirm Withdrawal</button>
                            <button onClick={() => setShowWithdrawModal(false)} className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 hover:text-slate-600 transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Move Money */}
            {showMoveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 text-slate-800">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-2xl font-black mb-1 tracking-tight">Move Money</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">From: {moveSourceAcc?.accountName}</p>
                        <div className="space-y-6">
                            <select value={moveDestId} onChange={(e) => setMoveDestId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none">
                                <option value="">To pocket</option>
                                {accounts.filter(a => a.id !== moveSourceAcc?.id).map(a => <option key={a.id} value={a.id}>{a.accountName} (฿{a.balance.toLocaleString()})</option>)}
                            </select>
                            <input type="number" placeholder="Amount (THB)" value={moveAmount} onChange={(e) => setMoveAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-2xl outline-none" />
                            <button onClick={handleMoveMoney} className="w-full py-5 rounded-2xl font-black text-white bg-[#065f46] shadow-xl active:scale-95 transition-all">Confirm Move</button>
                            <button onClick={() => setShowMoveModal(false)} className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Slip */}
            {showSlipModal && slipData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95">
                        <div className="bg-emerald-500 p-8 text-center text-white">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold border-4 border-white/30">✓</div>
                            <h3 className="font-black uppercase tracking-widest text-lg">Transfer Success</h3>
                            <p className="text-emerald-100 text-[10px] mt-1 font-mono">{new Date(slipData.date).toLocaleString('th-TH')}</p>
                        </div>
                        <div className="p-8 space-y-6 text-slate-800">
                            <div className="text-center border-b pb-6 border-slate-100">
                                <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Amount</p>
                                <p className="text-4xl font-black">฿{Number(slipData.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                            </div>
                            <div className="space-y-3 pt-2">
                                <button onClick={handleAddFavorite} className="w-full py-3 border-2 border-dashed border-emerald-200 text-emerald-600 rounded-2xl font-black text-xs uppercase hover:bg-emerald-50 transition-all tracking-widest">+ Add to Favorites</button>
                                <button onClick={() => setShowSlipModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Create Account */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-slate-800 animate-in fade-in">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <h3 className="text-2xl font-black mb-6 tracking-tight">New Pocket</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block font-mono">Pocket Name</label>
                                <input type="text" placeholder="e.g. Travel" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500/20" />
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block font-mono">Savings Goal (Optional)</label>
                                <input type="number" placeholder="฿ 10,000" value={newAccountGoal} onChange={(e) => setNewAccountGoal(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500/20" />
                            </div>
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-bold text-slate-400 bg-slate-50 rounded-2xl hover:bg-slate-100 transition-all">Cancel</button>
                            <button onClick={submitCreateAccount} className="flex-1 py-4 font-bold text-white bg-[#065f46] rounded-2xl shadow-lg transition-all active:scale-95">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;