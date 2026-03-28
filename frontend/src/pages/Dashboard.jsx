import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [accounts, setAccounts] = useState([]);
    
    // ─── Slip & Transaction States ───
    const [showSlipModal, setShowSlipModal] = useState(false);
    const [slipData, setSlipData] = useState(null);

    // ─── Pocket States ───
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');

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
            .then(data => setAccounts(data))
            .catch(err => console.error("Error:", err));
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) { navigate('/login'); return; }
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
        fetchAccounts(userData.id);
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

    const submitCreateAccount = async () => {
        if (!newAccountName.trim()) return;
        try {
            const response = await fetch(`http://localhost:8080/api/accounts/user/${user.id}/create`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountName: newAccountName })
            });
            if (response.ok) { fetchAccounts(user.id); setShowCreateModal(false); setNewAccountName(''); }
        } catch (error) { console.error(error); }
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
            } else {
                alert("โอนไม่สำเร็จ: " + (data.error || "เกิดข้อผิดพลาด"));
            }
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
            } else { const error = await response.text(); alert("ถอนเงินไม่สำเร็จ: " + error); }
        } catch (error) { alert("เกิดข้อผิดพลาด"); } finally { setIsProcessing(false); }
    };

    const handleMoveMoney = async () => {
        if (!moveSourceAcc || !moveDestId || !moveAmount) {
            alert("กรุณากรอกข้อมูลให้ครบถ้วน");
            return;
        }
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
            } else {
                const error = await response.text();
                alert("ย้ายเงินไม่สำเร็จ: " + error);
            }
        } catch (error) {
            alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
        } finally {
            setIsProcessing(false);
        }
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
                <button onClick={handleLogout} className="text-xs font-bold text-slate-400">LOG OUT</button>
            </nav>

            <main className="max-w-5xl mx-auto p-8">
                <div className="bg-gradient-to-br from-[#065f46] to-[#042f2e] rounded-[2.5rem] p-10 text-white shadow-2xl mb-10 relative overflow-hidden">
                    <p className="text-emerald-200/60 text-sm font-bold uppercase tracking-widest mb-2">Total Balance</p>
                    <h1 className="text-6xl font-black mb-10">฿{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
                    <div className="flex gap-4">
                        <button onClick={() => setShowTransferModal(true)} className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-bold text-sm transition-transform active:scale-95">Transfer</button>
                        <button onClick={() => setShowWithdrawModal(true)} className="bg-emerald-800/40 text-white border border-emerald-700 px-8 py-4 rounded-2xl font-bold text-sm transition-transform active:scale-95">Withdraw</button>
                        <button onClick={() => navigate('/statement')} className="bg-emerald-800/40 text-white border border-emerald-700 px-8 py-4 rounded-2xl font-bold text-sm transition-transform active:scale-95">Statement</button>
                    </div>
                </div>

                <div className="flex justify-between items-end mb-6 px-2">
                    <h2 className="text-2xl font-black text-slate-800">My Pockets</h2>
                    <button onClick={() => setShowCreateModal(true)} className="text-emerald-600 font-bold">+ Add Pocket</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {accounts.map(account => (
                        <div key={account.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm group relative overflow-hidden transition-all hover:shadow-md">
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <p className="text-slate-400 text-xs font-bold uppercase mb-1">{account.accountName}</p>
                                    <p className="text-slate-500 font-mono text-[10px]">#{account.accountNumber}</p>
                                </div>
                                <button 
                                    onClick={() => { setMoveSourceAcc(account); setShowMoveModal(true); }}
                                    className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-100 transition-colors"
                                >
                                    Move Money
                                </button>
                            </div>
                            <h3 className="text-3xl font-black text-slate-800">฿{account.balance.toLocaleString()}</h3>
                        </div>
                    ))}
                </div>
            </main>

            {/* ─── Digital Slip Modal ─── */}
            {showSlipModal && slipData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] w-full max-w-sm overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="bg-emerald-500 p-8 text-center">
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                            <h3 className="text-white font-black text-xl uppercase tracking-widest">Transfer Successful</h3>
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
                                <div className="text-right">
                                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Bank</p>
                                    <p className="text-[10px] font-bold text-emerald-600 uppercase">Virtual Bank</p>
                                </div>
                            </div>

                            <button onClick={() => setShowSlipModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-sm shadow-xl active:scale-95 transition-all mt-4">Done</button>
                        </div>
                        <div className="flex justify-between px-2 -mb-2">
                            {[...Array(15)].map((_, i) => (<div key={i} className="w-4 h-4 bg-slate-50 rounded-full"></div>))}
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Move Money */}
            {showMoveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <h3 className="text-2xl font-black mb-1 text-slate-800">Move Money</h3>
                        <p className="text-slate-400 text-xs mb-8">From: <span className="text-emerald-600 font-bold">{moveSourceAcc?.accountName}</span></p>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">To Pocket</label>
                                <select value={moveDestId} onChange={(e) => setMoveDestId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500/30">
                                    <option value="">Select destination</option>
                                    {accounts.filter(a => a.id !== moveSourceAcc?.id).map(a => (<option key={a.id} value={a.id}>{a.accountName} (฿{a.balance.toLocaleString()})</option>))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Amount</label>
                                <input type="number" placeholder="0.00" value={moveAmount} onChange={(e) => setMoveAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-2xl outline-none" />
                            </div>
                            <button onClick={handleMoveMoney} disabled={isProcessing} className="w-full py-5 rounded-2xl font-black text-white bg-[#065f46] shadow-xl active:scale-95 transition-all">{isProcessing ? 'Moving...' : 'Confirm Move'}</button>
                            <button onClick={() => setShowMoveModal(false)} className="w-full text-slate-400 font-bold text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Withdraw */}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <h3 className="text-3xl font-black text-slate-900 mb-8">Withdraw</h3>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">From Pocket</label>
                                <select value={withdrawAccountId} onChange={(e) => setWithdrawAccountId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none focus:border-emerald-500/30 text-slate-800">
                                    <option value="">Select pocket</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountName} (฿{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2 text-slate-800">Amount to Withdraw</label>
                                <input type="number" placeholder="0.00" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-2xl outline-none text-slate-800" />
                            </div>
                            <button onClick={handleWithdraw} disabled={isProcessing} className="w-full py-5 rounded-2xl font-black text-white text-lg bg-[#065f46] shadow-xl active:scale-95 transition-all">{isProcessing ? 'Processing...' : 'Confirm Withdrawal'}</button>
                            <button onClick={() => setShowWithdrawModal(false)} className="w-full text-slate-400 font-bold text-sm">Cancel</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Transfer */}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8 text-slate-800">
                            <h3 className="text-3xl font-black tracking-tight">Transfer</h3>
                            <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">From Account</label>
                                <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none focus:border-emerald-500/30">
                                    <option value="">Select your source pocket</option>
                                    {accounts.map(acc => ( <option key={acc.id} value={acc.id}>{acc.accountName} (฿{acc.balance.toLocaleString()})</option> ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">To Account Number</label>
                                <input type="text" placeholder="Enter 10-digit number" maxLength="10" value={destAccountNumber} onChange={(e) => setDestAccountNumber(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold text-slate-700 outline-none" />
                                {destAccountName && <p className={`mt-2 text-xs font-bold px-2 ${destId ? 'text-emerald-600' : 'text-rose-500'}`}>{destAccountName}</p>}
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-2">Amount (THB)</label>
                                <input type="number" placeholder="0.00" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-slate-800 text-2xl" />
                            </div>
                            <button onClick={handleTransfer} disabled={isProcessing || !destId} className={`w-full py-5 rounded-2xl font-black text-white text-lg shadow-xl transition-all active:scale-95 mt-4 ${isProcessing || !destId ? 'bg-slate-300' : 'bg-[#065f46] hover:bg-[#054634]'}`}>
                                {isProcessing ? 'Processing...' : 'Confirm Transfer'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Create Account */}
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 text-slate-800">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-black mb-6 tracking-tight">New Pocket</h3>
                        <input type="text" placeholder="Account Name (e.g. Travel)" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 mb-6 font-bold outline-none" />
                        <div className="flex gap-3">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-bold text-slate-400 bg-slate-50 rounded-2xl transition-all active:scale-95">Cancel</button>
                            <button onClick={submitCreateAccount} className="flex-1 py-4 font-bold text-white bg-[#065f46] rounded-2xl transition-all active:scale-95">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;