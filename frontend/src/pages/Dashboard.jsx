import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import html2canvas from 'html2canvas';

const Dashboard = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [accounts, setAccounts] = useState([]);
    const [funds, setFunds] = useState([]);
    const [portfolio, setPortfolio] = useState([]);

    // ─── Investment Sell States ───
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [sellUnits, setSellUnits] = useState('');
    const [sellDestId, setSellDestId] = useState('');

    // ─── Super App States ───
    const [favorites, setFavorites] = useState([]);
    const [showSlipModal, setShowSlipModal] = useState(false);
    const [slipData, setSlipData] = useState(null);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrValue, setQRValue] = useState('');
    const [selectedAccForQR, setSelectedAccForQR] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newAccountName, setNewAccountName] = useState('');
    const [newAccountGoal, setNewAccountGoal] = useState('');
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [sourceId, setSourceId] = useState('');
    const [destAccountNumber, setDestAccountNumber] = useState('');
    const [destAccountName, setDestAccountName] = useState('');
    const [destId, setDestId] = useState(null);
    const [transferAmount, setTransferAmount] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAccountId, setWithdrawAccountId] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [moveSourceAcc, setMoveSourceAcc] = useState(null);
    const [moveDestId, setMoveDestId] = useState('');
    const [moveAmount, setMoveAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const fetchAccounts = (userId) => {
        fetch(`http://localhost:8080/api/accounts/user/${userId}`)
            .then(res => res.json())
            .then(data => setAccounts(data));
    };

    const fetchFunds = () => {
        fetch('http://localhost:8080/api/funds')
            .then(res => res.json())
            .then(data => setFunds(data));
    };

    const fetchPortfolio = (userId) => {
        fetch(`http://localhost:8080/api/transactions/portfolio/${userId}`)
            .then(res => res.json())
            .then(data => setPortfolio(data));
    };

    const fetchFavorites = (userId) => {
        fetch(`http://localhost:8080/api/favorites/user/${userId}`)
            .then(res => res.json())
            .then(data => setFavorites(data));
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) { navigate('/login'); return; }
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
        fetchAccounts(userData.id);
        fetchFavorites(userData.id);
        fetchFunds();
        fetchPortfolio(userData.id);

        const interval = setInterval(() => {
            fetchFunds();
            fetchPortfolio(userData.id);
        }, 30000); 
        return () => clearInterval(interval);
    }, [navigate]);

    // 🔥 ฟังก์ชันยืนยันการขายแบบระบุหน่วย
    const handleConfirmSell = async () => {
        if (!sellDestId || !sellUnits || sellUnits <= 0) {
            alert("กรุณาเลือกกระเป๋าและใส่จำนวนหน่วยที่ถูกต้องโบร!");
            return;
        }
        if (parseFloat(sellUnits) > selectedAsset.units) {
            alert("โบรมีหน่วยลงทุนไม่พอนะ!");
            return;
        }

        try {
            const response = await fetch('http://localhost:8080/api/transactions/sell', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: sellDestId,
                    fundId: selectedAsset.fundId,
                    units: parseFloat(sellUnits)
                })
            });

            const data = await response.json();
            if (response.ok) {
                alert(`💰 ขายสำเร็จ!\nเงินเข้าบัญชี: ฿${data.received.toLocaleString()}`);
                fetchAccounts(user.id);
                fetchPortfolio(user.id);
                setShowSellModal(false);
                setSellUnits('');
            } else {
                alert(`❌ ขายไม่สำเร็จ: ${data.error}`);
            }
        } catch (error) {
            alert("❌ ระบบขัดข้องโบร!");
        }
    };

    // (Code setDestAccountName, logout, saveSlip เหมือนเดิม)
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
    const handleSaveSlip = () => {
        const originalSlip = document.getElementById('digital-slip');
        if (!originalSlip) return;
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute'; tempContainer.style.left = '-9999px'; tempContainer.style.top = '-9999px';
        document.body.appendChild(tempContainer);
        const clonedSlip = originalSlip.cloneNode(true);
        clonedSlip.style.width = '350px'; clonedSlip.style.display = 'block';
        tempContainer.appendChild(clonedSlip);
        html2canvas(clonedSlip, { backgroundColor: "#ffffff", scale: 2, useCORS: true, logging: false }).then((canvas) => {
            const link = document.createElement('a'); link.download = `slip-VB-${Date.now()}.png`; link.href = canvas.toDataURL('image/png'); link.click();
            document.body.removeChild(tempContainer);
        }).catch(err => { console.error("Save error:", err); document.body.removeChild(tempContainer); });
    };

    const handleShowQR = (account) => { setQRValue(account.accountNumber); setSelectedAccForQR(account); setShowQRModal(true); };
    const handleDeleteAccount = async (accountId, balance) => {
        if (Number(balance) > 0) { alert("ย้ายเงินออกให้หมดก่อนลบนะโบร!"); return; }
        if (window.confirm("คุณแน่ใจใช่ไหมที่จะลบกระเป๋านี้?")) {
            const res = await fetch(`http://localhost:8080/api/accounts/${accountId}`, { method: 'DELETE' });
            if (res.ok) { alert("ลบสำเร็จ!"); fetchAccounts(user.id); }
        }
    };

    const submitCreateAccount = async () => {
        if (!newAccountName.trim()) return;
        const res = await fetch(`http://localhost:8080/api/accounts/user/${user.id}/create`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountName: newAccountName, savingsGoal: parseFloat(newAccountGoal) || 0 })
        });
        if (res.ok) { fetchAccounts(user.id); setShowCreateModal(false); setNewAccountName(''); setNewAccountGoal(''); }
    };

    const handleTransfer = async () => {
        if (!sourceId || !destId || !transferAmount) return;
        setIsProcessing(true);
        const res = await fetch('http://localhost:8080/api/transactions/transfer', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceAccountId: sourceId, destinationAccountId: destId, amount: transferAmount })
        });
        const data = await res.json();
        if (res.ok) { setSlipData({ ...data, date: new Date().toLocaleString('th-TH') }); setShowSlipModal(true); fetchAccounts(user.id); setShowTransferModal(false); }
        setIsProcessing(false);
    };

    const handleWithdraw = async () => {
        if (!withdrawAccountId || !withdrawAmount) return;
        setIsProcessing(true);
        const res = await fetch('http://localhost:8080/api/transactions/withdraw', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId: withdrawAccountId, amount: Number(withdrawAmount) })
        });
        if (res.ok) { alert("ถอนเงินสำเร็จ!"); fetchAccounts(user.id); setShowWithdrawModal(false); }
        setIsProcessing(false);
    };

    const handleMoveMoney = async () => {
        if (!moveSourceAcc || !moveDestId || !moveAmount) return;
        const res = await fetch('http://localhost:8080/api/transactions/move-money', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sourceAccountId: moveSourceAcc.id, destinationAccountId: moveDestId, amount: moveAmount })
        });
        if (res.ok) { alert("ย้ายเงินสำเร็จ!"); fetchAccounts(user.id); setShowMoveModal(false); }
    };

    if (!user) return null;
    const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
            <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">{user.firstName?.charAt(0)}</div>
                    <div className="font-bold">{user.firstName} {user.lastName}</div>
                </div>
                <button onClick={handleLogout} className="text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-rose-500 transition-colors">Log Out</button>
            </nav>

            <main className="max-w-5xl mx-auto p-8">
                <div className="bg-gradient-to-br from-[#065f46] to-[#042f2e] rounded-[2.5rem] p-10 text-white shadow-2xl mb-10 relative overflow-hidden">
                    <p className="text-emerald-200/60 text-sm font-bold uppercase tracking-widest mb-2">Total Balance</p>
                    <h1 className="text-6xl font-black mb-10">฿{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</h1>
                    <div className="flex flex-wrap gap-4">
                        <button onClick={() => setShowTransferModal(true)} className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all">Transfer</button>
                        <button onClick={() => setShowWithdrawModal(true)} className="bg-emerald-800/40 text-white border border-emerald-700 px-8 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all">Withdraw</button>
                        <button onClick={() => navigate('/statement')} className="bg-emerald-800/40 text-white border border-emerald-700 px-8 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all">Statement</button>
                        <button onClick={() => navigate('/investment')} className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-8 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all hover:bg-amber-500/30">Investment</button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-end mb-6 px-2">
                            <h2 className="text-2xl font-black text-slate-800">My Pockets</h2>
                            <button onClick={() => setShowCreateModal(true)} className="text-emerald-600 font-bold uppercase text-[11px] tracking-widest hover:text-emerald-700">+ Add Pocket</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
                            {accounts.map((account, index) => {
                                const goal = Number(account.savingsGoal || account.savings_goal) || 0;
                                const balance = Number(account.balance) || 0;
                                const percentage = goal > 0 ? Math.min((balance / goal) * 100, 100) : 0;
                                return (
                                    <div key={account.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm group hover:shadow-md transition-all">
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex flex-col gap-1">
                                                <p className="text-slate-400 text-[10px] font-black uppercase">{account.accountName}</p>
                                                <p className="text-slate-500 font-mono text-[10px]">#{account.accountNumber}</p>
                                            </div>
                                            <div className="flex gap-2">
                                                <button onClick={() => handleShowQR(account)} className="bg-slate-50 text-slate-400 p-2 rounded-xl hover:bg-emerald-50 hover:text-emerald-600 shadow-sm transition-all"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg></button>
                                                <button onClick={() => { setMoveSourceAcc(account); setShowMoveModal(true); }} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-100 shadow-sm transition-colors">Move Money</button>
                                            </div>
                                        </div>
                                        <h3 className="text-3xl font-black">฿{balance.toLocaleString()}</h3>
                                        <div className="mt-6 space-y-2">
                                            <div className="flex justify-between items-end"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savings Goal</p><p className="text-[10px] font-black text-emerald-600 uppercase">{goal > 0 ? `${percentage.toFixed(0)}%` : '0%'}</p></div>
                                            <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div></div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        {/* 🔥 ส่วน My Assets พร้อมระบบ Sell แบบเลือกหน่วย */}
                        <div className="px-2">
                            <h2 className="text-2xl font-black text-slate-800 mb-6">My Assets 📈</h2>
                            <div className="grid grid-cols-1 gap-4">
                                {portfolio.length > 0 ? portfolio.map(item => {
                                    const fundInfo = funds.find(f => f.id === item.fundId);
                                    const currentNav = fundInfo ? fundInfo.nav : item.avgPrice;
                                    const profit = (currentNav - item.avgPrice) * item.units;
                                    const profitPercent = ((currentNav - item.avgPrice) / item.avgPrice) * 100;
                                    return (
                                        <div key={item.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 flex justify-between items-center shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600">{fundInfo?.fundCode.slice(-2) || '??'}</div>
                                                <div>
                                                    <p className="text-[10px] font-black text-slate-400 uppercase">{fundInfo?.fundName || 'Loading...'}</p>
                                                    <p className="text-xl font-black">{item.units.toFixed(4)} Units</p>
                                                    <button 
                                                        onClick={() => { setSelectedAsset(item); setSellUnits(item.units); setSellDestId(accounts[0]?.id); setShowSellModal(true); }}
                                                        className="mt-2 text-[10px] font-black text-rose-500 border border-rose-500/30 px-4 py-1.5 rounded-xl hover:bg-rose-500 hover:text-white transition-all uppercase tracking-widest active:scale-95"
                                                    >
                                                        Sell
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className={`text-sm font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>{profit >= 0 ? '+' : ''}{profit.toFixed(2)} THB ({profitPercent.toFixed(2)}%)</p>
                                                <p className="text-[10px] font-bold text-slate-400 uppercase">Market Value: ฿{(item.units * currentNav).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center"><p className="text-slate-400 text-sm font-bold italic">ไม่มีสินทรัพย์... ไปที่ Marketplace เลยโบร!</p></div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* 📈 Market Panel */}
                    <div>
                        <div className="flex justify-between items-end mb-6 px-2"><h2 className="text-2xl font-black text-slate-800">Market</h2><span className="text-[10px] text-slate-400 font-bold uppercase animate-pulse">Live</span></div>
                        <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
                            {funds.map(fund => (
                                <div key={fund.id} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">{fund.fundCode.slice(-2)}</div><div><p className="text-[11px] font-black text-slate-800 uppercase">{fund.fundCode}</p><p className="text-[9px] text-slate-400 font-medium">{fund.fundName}</p></div></div>
                                    <div className="text-right"><p className="text-xs font-black text-slate-800 font-mono">{fund.nav.toFixed(4)}</p><p className="text-[9px] font-bold text-emerald-500">NAV</p></div>
                                </div>
                            ))}
                            <button onClick={() => navigate('/investment')} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 shadow-sm active:scale-95">Marketplace</button>
                        </div>
                    </div>
                </div>
            </main>

            {/* 💰 Modal สำหรับขายกองทุน (ระบุหน่วย) */}
            {showSellModal && selectedAsset && (
                <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md text-slate-800">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-black mb-1 tracking-tight text-rose-600">Sell Asset</h3>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">Available: {selectedAsset.units.toFixed(4)} Units</p>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block font-mono">Receive to Pocket</label>
                                <select value={sellDestId} onChange={(e) => setSellDestId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none">
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountName} (฿{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-black uppercase text-slate-400 mb-2 block font-mono">Units to Sell</label>
                                <input type="number" max={selectedAsset.units} value={sellUnits} onChange={(e) => setSellUnits(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-2xl outline-none" placeholder="0.0000" />
                                <p className="mt-2 text-[10px] text-slate-400 font-bold italic">≈ Estimated Money: ฿{(parseFloat(sellUnits || 0) * (funds.find(f => f.id === selectedAsset.fundId)?.nav || 0)).toLocaleString()}</p>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowSellModal(false)} className="flex-1 py-4 font-bold text-slate-400 bg-slate-50 rounded-2xl transition-all">Cancel</button>
                                <button onClick={handleConfirmSell} className="flex-1 py-4 font-bold text-white bg-rose-500 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95">Confirm Sell</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Other Modals (Transfer, Slip, Withdraw, Move, Create, QR) - คงเดิม */}
            {/* ... โค้ดส่วน Modals ทั้งหมดที่ผมเคยให้ไปก่อนหน้านี้ ... */}
            {showSlipModal && slipData && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
                    <div className="w-full max-w-sm">
                        <div id="digital-slip" style={{ backgroundColor: '#ffffff', borderRadius: '40px', overflow: 'hidden', display: 'block', width: '100%', fontFamily: 'Arial, sans-serif' }}>
                            <div style={{ backgroundColor: '#10b981', padding: '40px 20px', textAlign: 'center' }}>
                                <div style={{ width: '64px', height: '64px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', border: '4px solid rgba(255,255,255,0.3)' }}>
                                    <span style={{ fontSize: '30px', fontWeight: 'bold', color: '#ffffff' }}>✓</span>
                                </div>
                                <h3 style={{ margin: 0, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '2px', fontSize: '18px', color: '#ffffff' }}>Transfer Success</h3>
                                <p style={{ margin: '8px 0 0', fontSize: '10px', opacity: 0.8, fontFamily: 'monospace', color: '#ffffff' }}>{slipData.date}</p>
                            </div>
                            <div style={{ padding: '32px', backgroundColor: '#ffffff' }}>
                                <div style={{ textAlign: 'center', paddingBottom: '24px', borderBottom: '1px solid #f1f5f9', marginBottom: '24px' }}>
                                    <p style={{ margin: 0, color: '#94a3b8', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>Amount</p>
                                    <p style={{ margin: '8px 0 0', fontSize: '36px', fontWeight: 900, color: '#0f172a' }}>฿{Number(slipData.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                </div>
                                <div style={{ textAlign: 'left' }}>
                                    <div style={{ marginBottom: '16px' }}>
                                        <p style={{ margin: 0, color: '#cbd5e1', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>From</p>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#1e293b' }}>{slipData.fromName || user.firstName + " " + user.lastName}</p>
                                    </div>
                                    <div style={{ marginBottom: '16px' }}>
                                        <p style={{ margin: 0, color: '#cbd5e1', fontSize: '10px', fontWeight: 900, textTransform: 'uppercase' }}>To</p>
                                        <p style={{ margin: 0, fontSize: '14px', fontWeight: 900, color: '#1e293b' }}>{slipData.toName}</p>
                                    </div>
                                </div>
                                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #f1f5f9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <span style={{ fontSize: '8px', color: '#94a3b8', fontFamily: 'monospace' }}>Ref ID: #VB-{slipData.transactionId}</span>
                                    <span style={{ fontSize: '10px', color: '#10b981', fontWeight: 900 }}>VIRTUAL BANK</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 space-y-3">
                            <button onClick={handleSaveSlip} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 active:scale-95">💾 Save to Gallery</button>
                            <div className="flex gap-2">
                                <button onClick={() => setShowSlipModal(false)} className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all">Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {showQRModal && selectedAccForQR && (
                <div className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl text-center">
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">My QR Code</span>
                            <button onClick={() => setShowQRModal(false)} className="text-slate-300 hover:text-slate-500">✕</button>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-[2rem] inline-block mb-6 border-4 border-white shadow-inner">
                            <QRCodeCanvas value={qrValue} size={200} level={"H"} fgColor="#0f172a" includeMargin={true} />
                        </div>
                        <div className="mb-8">
                            <h3 className="text-xl font-black text-slate-800">{user.firstName} {user.lastName}</h3>
                            <p className="text-slate-400 font-mono text-sm mt-1">{selectedAccForQR.accountName}</p>
                            <p className="bg-emerald-50 text-emerald-600 font-mono font-bold py-2 px-4 rounded-xl inline-block mt-4 tracking-tighter">{selectedAccForQR.accountNumber}</p>
                        </div>
                        <button onClick={() => setShowQRModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Done</button>
                    </div>
                </div>
            )}
            {showTransferModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md text-slate-800">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-lg shadow-2xl">
                        <div className="flex justify-between items-start mb-8 font-black">
                            <h3 className="text-3xl">Transfer</h3>
                            <button onClick={() => setShowTransferModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
                        </div>
                        <div className="space-y-6">
                            <select value={sourceId} onChange={(e) => setSourceId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none">
                                <option value="">Select source pocket</option>
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountName} (฿{acc.balance.toLocaleString()})</option>)}
                            </select>
                            <input type="text" placeholder="Account Number" maxLength="10" value={destAccountNumber} onChange={(e) => setDestAccountNumber(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none" />
                            {destAccountName && <p className="text-xs font-bold text-emerald-600 px-2 italic">{destAccountName}</p>}
                            <input type="number" placeholder="Amount" value={transferAmount} onChange={(e) => setTransferAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-2xl outline-none" />
                            <button onClick={handleTransfer} disabled={isProcessing || !destId} className="w-full py-5 rounded-2xl font-black text-white bg-[#065f46] shadow-xl active:scale-95 transition-all">Confirm Transfer</button>
                        </div>
                    </div>
                </div>
            )}
            {showWithdrawModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md text-slate-800">
                    <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-3xl font-black mb-8 tracking-tight">Withdraw</h3>
                        <div className="space-y-6">
                            <select value={withdrawAccountId} onChange={(e) => setWithdrawAccountId(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none">
                                <option value="">Select pocket</option>
                                {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountName} (฿{acc.balance.toLocaleString()})</option>)}
                            </select>
                            <input type="number" placeholder="Amount" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-black text-2xl outline-none" />
                            <button onClick={handleWithdraw} disabled={isProcessing} className="w-full py-5 rounded-2xl font-black text-white bg-[#065f46] shadow-xl active:scale-95 transition-all">Confirm Withdrawal</button>
                            <button onClick={() => setShowWithdrawModal(false)} className="w-full text-slate-400 font-bold uppercase text-[10px] tracking-widest mt-2 hover:text-slate-600 transition-colors">Cancel</button>
                        </div>
                    </div>
                </div>
            )}
            {showMoveModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md text-slate-800">
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
            {showCreateModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-slate-800">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl">
                        <h3 className="text-2xl font-black mb-6 tracking-tight">New Pocket</h3>
                        <div className="space-y-4">
                            <input type="text" placeholder="Pocket Name" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none" />
                            <input type="number" placeholder="Savings Goal" value={newAccountGoal} onChange={(e) => setNewAccountGoal(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 font-bold outline-none" />
                        </div>
                        <div className="flex gap-3 mt-8">
                            <button onClick={() => setShowCreateModal(false)} className="flex-1 py-4 font-bold text-slate-400 bg-slate-50 rounded-2xl transition-all">Cancel</button>
                            <button onClick={submitCreateAccount} className="flex-1 py-4 font-bold text-white bg-[#065f46] rounded-2xl shadow-lg active:scale-95 transition-all">Create</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;