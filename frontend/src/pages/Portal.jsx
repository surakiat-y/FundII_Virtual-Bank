import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { QRCodeCanvas } from 'qrcode.react';
import { toPng } from 'html-to-image';
import LoadingGuard from '../components/LoadingGuard';
import api from '../utils/axios';

const Portal = () => {
    const navigate = useNavigate();
    const { user, setUser, handleLogout } = useOutletContext();
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
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
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
    const [isDestSuspended, setIsDestSuspended] = useState(false);
    const [transferAmount, setTransferAmount] = useState('');
    const [showWithdrawModal, setShowWithdrawModal] = useState(false);
    const [withdrawAccountId, setWithdrawAccountId] = useState('');
    const [withdrawAmount, setWithdrawAmount] = useState('');
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [moveSourceAcc, setMoveSourceAcc] = useState(null);
    const [moveDestId, setMoveDestId] = useState('');
    const [moveAmount, setMoveAmount] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinMode, setPinMode] = useState('VERIFY'); // 'VERIFY' or 'SETUP'
    const [pendingAction, setPendingAction] = useState(null);
    const [isVerifyingStatus, setIsVerifyingStatus] = useState(true); // 🔥 Guard State
    const [isAccountsLoading, setIsAccountsLoading] = useState(true); // 🔥 Localized Loading
    const [showAddFavModal, setShowAddFavModal] = useState(false);
    const [newFav, setNewFav] = useState({ nickname: '', accountNumber: '', ownerName: '' });
    const [isAddingFav, setIsAddingFav] = useState(false);

    const fetchAccounts = (userId) => {
        setIsAccountsLoading(true);
        api.get(`/accounts/user/${userId}`)
            .then(res => {
                setAccounts(res.data);
                setIsAccountsLoading(false);
            })
            .catch(err => {
                console.error(err);
                setIsAccountsLoading(false);
            });
    };

    const fetchFunds = () => {
        api.get('/funds')
            .then(res => setFunds(res.data))
            .catch(err => console.error(err));
    };

    const fetchPortfolio = (userId) => {
        api.get(`/transactions/portfolio/${userId}`)
            .then(res => setPortfolio(res.data))
            .catch(err => console.error(err));
    };

    const fetchFavorites = (userId) => {
        api.get(`/favorites/user/${userId}`)
            .then(res => setFavorites(res.data))
            .catch(err => console.error(err));
    };

    const fetchUserStatus = (userId) => {
        api.get(`/auth/status/${userId}`)
            .then(res => {
                const { status, hasPin } = res.data;
                
                if (status === 'BANNED') {
                    localStorage.removeItem('user');
                    navigate('/login');
                    return;
                }

                setUser(prevUser => {
                    if (!prevUser) return prevUser;
                    if (prevUser.status !== status || prevUser.hasPin !== hasPin) {
                        const updated = { ...prevUser, status, hasPin };
                        localStorage.setItem('user', JSON.stringify(updated));
                        return updated;
                    }
                    return prevUser;
                });
            })
            .catch(err => console.error("Refresh status failed", err));
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) { navigate('/login'); return; }
        const userData = JSON.parse(loggedInUser);

        // 🔥 Set user IMMEDIATELY from localStorage for shell rendering
        setUser(userData);
        
        // Parallel Data Fetching
        fetchAccounts(userData.id);
        fetchFavorites(userData.id);
        fetchFunds();
        fetchPortfolio(userData.id);

        console.log("Portal initializing... Checking status for ID:", userData.id);

        // Security check runs in parallel without blocking screen (LoadingGuard will see user is present)
        api.get(`/auth/status/${userData.id}`)
            .then(res => {
                const { status, hasPin } = res.data;
                const freshUser = { ...userData, status, hasPin };
                setUser(freshUser);
                localStorage.setItem('user', JSON.stringify(freshUser));

                if (status === 'BANNED' || status === 'BAN' || status === 'SUSPENDED') {
                    // Logic handled by reactive useEffect below
                }
                setIsVerifyingStatus(false);
            })
            .catch(err => {
                console.error("Status check failed, continuing with local state:", err);
                setIsVerifyingStatus(false);
            });

        const interval = setInterval(() => {
            fetchFunds();
            fetchPortfolio(userData.id);
        }, 10000); 
        return () => clearInterval(interval);
    }, [navigate]);


    const handleConfirmSell = async () => {
        if (checkSuspension()) return;
        if (!sellDestId || !sellUnits || sellUnits <= 0) {
            alert("กรุณาเลือกกระเป๋าและใส่จำนวนหน่วยที่ถูกต้องโบร!");
            return;
        }
        if (parseFloat(sellUnits) > selectedAsset.units) {
            alert("โบรมีหน่วยลงทุนไม่พอนะ!");
            return;
        }

        try {
            const response = await api.post('/transactions/sell', {
                accountId: sellDestId,
                fundId: selectedAsset.fundId,
                units: parseFloat(sellUnits)
            });

            const data = response.data;
            alert(`💰 ขายสำเร็จ!\nเงินเข้าบัญชี: ฿${data.received.toLocaleString()}`);
            fetchAccounts(user.id);
            fetchPortfolio(user.id);
            setShowSellModal(false);
            setSellUnits('');
        } catch (error) {
            const data = error.response?.data || {};
            alert(`❌ ขายไม่สำเร็จ: ${data.error || 'ระบบขัดข้องโบร!'}`);
        }
    };

    useEffect(() => {
        if (destAccountNumber.length === 10) {
            api.get(`/accounts/search?accountNumber=${destAccountNumber}`)
                .then(res => {
                    const data = res.data;
                    if (data) {
                        const status = data.user.status;
                        const restricted = status === 'BANNED' || status === 'BAN' || status === 'SUSPENDED';
                        
                        setIsDestSuspended(restricted);
                        if (restricted) {
                            setDestAccountName(`${data.user.firstName} ${data.user.lastName}`);
                            setDestId(null); // Keep ID null to prevent transfer
                        } else {
                            setDestAccountName(`${data.user.firstName} ${data.user.lastName}`);
                            setDestId(data.id);
                        }
                    }
                })
                .catch(() => {
                    setDestAccountName('ไม่พบข้อมูลบัญชีปลายทาง');
                    setDestId(null);
                    setIsDestSuspended(false);
                });
        } else { setDestAccountName(''); setDestId(null); setIsDestSuspended(false); }
    }, [destAccountNumber]);

    const handleSaveSlip = () => {
        const slip = document.getElementById('digital-slip');
        if (!slip) return;
        
        toPng(slip, { cacheBust: true, pixelRatio: 2, backgroundColor: '#ffffff' })
            .then((dataUrl) => {
                const link = document.createElement('a');
                link.download = `slip-VB-${Date.now()}.png`;
                link.href = dataUrl;
                link.click();
            })
            .catch((err) => {
                console.error('Oops, something went wrong!', err);
                alert("Failed to save image. Please try again.");
            });
    };

    const handleShowQR = (account) => { setQRValue(account.accountNumber); setSelectedAccForQR(account); setShowQRModal(true); };
    const handleDeleteAccount = async (accountId, balance) => {
        if (checkSuspension()) return;
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

    const submitCreateAccount = async () => {
        if (checkSuspension()) return;
        if (!newAccountName.trim()) return;
        try {
            await api.post(`/accounts/user/${user.id}/create`, {
                accountName: newAccountName,
                savingsGoal: parseFloat(newAccountGoal) || 0
            });
            fetchAccounts(user.id);
            setShowCreateModal(false);
            setNewAccountName('');
            setNewAccountGoal('');
        } catch (error) {
            console.error(error);
        }
    };

    const handleTransfer = async () => {
        if (!sourceId || !destId || !transferAmount) return;
        setIsProcessing(true);
        try {
            const res = await api.post('/transactions/transfer', {
                sourceAccountId: sourceId,
                destinationAccountId: destId,
                amount: transferAmount
            });
            const data = res.data;
            setSlipData({ 
                ...data, 
                toName: destAccountName, // ✅ ใส่ชื่อผู้รับ
                date: new Date().toLocaleString('th-TH') 
            }); 
            setShowSlipModal(true); 
            fetchAccounts(user.id); 
            setShowTransferModal(false); 
            setTransferAmount('');
            setDestAccountNumber('');
        } catch (error) {
            const data = error.response?.data || {};
            alert(`❌ โอนไม่สำเร็จ: ${data.error || 'ระบบขัดข้อง'}`);
        } finally {
            setIsProcessing(false);
        }
    };

    const handleWithdraw = async () => {
        if (!withdrawAccountId || !withdrawAmount) return;
        setIsProcessing(true);
        try {
            await api.post('/transactions/withdraw', {
                accountId: withdrawAccountId,
                amount: Number(withdrawAmount)
            });
            alert("ถอนเงินสำเร็จ!");
            fetchAccounts(user.id);
            setShowWithdrawModal(false);
        } catch (error) {
            console.error(error);
        }
        setIsProcessing(false);
    };

    const handleMoveMoney = async () => {
        if (checkSuspension()) return;
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
        } catch (error) {
            console.error(error);
            alert(`ย้ายเงินไม่สำเร็จ: ${error.response?.data?.error || error.message}`);
        }
    };

    const checkSuspension = () => {
        if (user?.status?.toUpperCase() === 'SUSPENDED' || user?.status?.toUpperCase() === 'BANNED' || user?.status?.toUpperCase() === 'BAN') {
            setIsStatusModalOpen(true);
            return true;
        }
        return false;
    };

    // 🔥 Auto-Show Status Modal when status changed in background
    useEffect(() => {
        if (user?.status && (user.status === 'SUSPENDED' || user.status === 'BANNED')) {
            setIsStatusModalOpen(true);
        }
    }, [user?.status]);

    const handleAddFavorite = async () => {
        if (checkSuspension()) return;
        if (!newFav.nickname || !newFav.accountNumber) {
            alert("กรุณากรอกชื่อเล่นและเลขบัญชี");
            return;
        }
        setIsAddingFav(true);
        try {
            await api.post('/favorites/add', {
                userId: user.id,
                nickname: newFav.nickname,
                accountNumber: newFav.accountNumber,
                ownerName: newFav.ownerName || newFav.nickname
            });
            setShowAddFavModal(false);
            setNewFav({ nickname: '', accountNumber: '', ownerName: '' });
            fetchFavorites(user.id);
        } catch (error) {
            console.error("Add favorite failed", error);
            alert("เพิ่มรายชื่อโปรดไม่สำเร็จ: " + (error.response?.data?.message || error.message));
        } finally {
            setIsAddingFav(false);
        }
    };

    const handleDeleteFavorite = async (id) => {
        if (checkSuspension()) return;
        if (!window.confirm("ต้องการลบรายชื่อโปรดนี้ใช่หรือไม่?")) return;
        try {
            await api.delete(`/api/favorites/${id}`);
            fetchFavorites(user.id);
        } catch (error) {
            console.error("Delete favorite failed", error);
        }
    };

    // --- Auto-Detect Account Name for Favorites ---
    useEffect(() => {
        if (showAddFavModal && newFav.accountNumber?.length === 10) {
            const lookupAccount = async () => {
                setNewFav(prev => ({ ...prev, ownerName: 'checking...' }));
                try {
                    const res = await api.get(`/accounts/search?accountNumber=${newFav.accountNumber}`);
                    if (res.data) {
                        const fullName = `${res.data.user.firstName} ${res.data.user.lastName}`;
                        setNewFav(prev => ({ ...prev, ownerName: fullName }));
                    } else {
                        setNewFav(prev => ({ ...prev, ownerName: 'ไม่พบเลขบัญชี' }));
                    }
                } catch (error) {
                    console.error("Account lookup failed", error);
                    setNewFav(prev => ({ ...prev, ownerName: 'ไม่พบเลขบัญชี' }));
                }
            };
            lookupAccount();
        } else if (showAddFavModal && newFav.accountNumber?.length < 10) {
            setNewFav(prev => ({ ...prev, ownerName: '' }));
        }
    }, [newFav.accountNumber, showAddFavModal]);

    return (
        <LoadingGuard
            isLoading={isVerifyingStatus}
            user={user}
            isStatusModalOpen={isStatusModalOpen}
            onCloseModal={() => {
                setIsStatusModalOpen(false);
                if (user?.status?.toUpperCase() === 'BANNED' || user?.status?.toUpperCase() === 'BAN') {
                    handleLogout();
                }
            }}
            message="Verifying Account Security..."
            theme="light"
        >
            {user && (() => {
                const subPockets = accounts.filter(a => a.accountName.toUpperCase() !== 'MAIN ACCOUNT');
                const displayPockets = subPockets.slice(0, 2);
                const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance || 0), 0);
                return (
                    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans overflow-x-hidden">
            
            <div>
                <main className="max-w-5xl mx-auto p-8">
                    {/* ... existing content ... */}
                    <div className="bg-gradient-to-br from-[#065f46] to-[#042f2e] rounded-[3rem] p-12 text-white shadow-2xl shadow-emerald-900/20 mb-12 relative overflow-hidden font-display border border-white/10">
                        <p className="text-emerald-100/60 text-xs font-black uppercase tracking-[0.3em] mb-3">Total Balance</p>
                        <h1 className="text-7xl font-black mb-12 flex items-baseline gap-2">
                            <span className="text-4xl text-emerald-400">฿</span>
                            {isAccountsLoading ? (
                                <div className="h-[72px] w-64 bg-white/20 animate-pulse rounded-3xl mt-2 overflow-hidden relative">
                                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer"></div>
                                </div>
                            ) : (
                                totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })
                            )}
                        </h1>
                        <div className="flex flex-wrap gap-4 mt-8">
                            <button onClick={() => checkSuspension() ? null : setShowTransferModal(true)} className="bg-white text-emerald-900 px-8 py-4 rounded-2xl font-bold text-sm shadow-lg active:scale-95 transition-all">Transfer</button>
                            <button onClick={() => checkSuspension() ? null : setShowWithdrawModal(true)} className="bg-emerald-800/40 text-white border border-emerald-700 px-8 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all">Withdraw</button>
                            <button onClick={() => handleShowQR(accounts.find(a => a.accountName.toUpperCase() === 'MAIN ACCOUNT'))} className="bg-emerald-800/40 text-white border border-emerald-700 px-8 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all flex items-center gap-2">
                                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" /></svg>
                                 My QR
                            </button>
                            <button onClick={() => navigate('/statement')} className="bg-emerald-800/40 text-white border border-emerald-700 px-8 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all">Statement</button>
                            <button onClick={() => checkSuspension() ? null : navigate('/investment')} className="bg-amber-500/20 text-amber-400 border border-amber-500/40 px-8 py-4 rounded-2xl font-bold text-sm active:scale-95 transition-all hover:bg-amber-500/30">Investment</button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-2">
                        <div className="mb-12">
                            <div className="flex justify-between items-end mb-6 px-2">
                                <h2 className="text-2xl font-black text-slate-800">My Pockets</h2>
                                <button onClick={() => navigate('/your-pocket')} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100/50 shadow-sm active:scale-95">Go to pocket</button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {isAccountsLoading ? (
                                    [1, 2].map(i => (
                                        <div key={i} className="bg-white border border-slate-100 rounded-[2rem] p-6 shadow-sm overflow-hidden relative">
                                            <div className="h-4 w-24 bg-slate-100 animate-pulse rounded-full mb-2"></div>
                                            <div className="h-4 w-32 bg-slate-50 animate-pulse rounded-full mb-6"></div>
                                            <div className="h-10 w-48 bg-slate-100 animate-pulse rounded-2xl"></div>
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent -translate-x-full animate-shimmer"></div>
                                        </div>
                                    ))
                                ) : displayPockets.length > 0 ? displayPockets.map((account) => {
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
                                                    <button onClick={() => checkSuspension() ? null : (setMoveSourceAcc(account), setShowMoveModal(true))} className="bg-emerald-50 text-emerald-600 px-3 py-1.5 rounded-xl font-bold text-[10px] uppercase tracking-wider hover:bg-emerald-100 shadow-sm transition-colors">Move Money</button>
                                                </div>
                                            </div>
                                            <h3 className="text-3xl font-black">฿{balance.toLocaleString()}</h3>
                                            <div className="mt-6 space-y-2">
                                                <div className="flex justify-between items-end"><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Savings Goal</p><p className="text-[10px] font-black text-emerald-600 uppercase">{goal > 0 ? `${percentage.toFixed(0)}%` : '0%'}</p></div>
                                                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${percentage}%` }}></div></div>
                                            </div>
                                        </div>
                                    );
                                }) : (
                                    <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center col-span-1 md:col-span-2"><p className="text-slate-400 text-sm font-bold italic">No pockets yet. Go create one!</p></div>
                                )}
                            </div>
                        </div>

                            <div className="mb-12">
                                <div className="flex justify-between items-end mb-6 px-2">
                                    <h2 className="text-2xl font-black text-slate-800">My Assets</h2>
                                    <button onClick={() => navigate('/investment')} className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-100 transition-all border border-emerald-100/50 shadow-sm active:scale-95">Go to Investment</button>
                                </div>
                                <div className="grid grid-cols-1 gap-4">
                                    {portfolio.length > 0 ? portfolio.map(item => {
                                        const fundInfo = funds.find(f => f.id === item.fundId);
                                        const currentNav = fundInfo?.nav ?? item.avgPrice ?? 0;
                                        const profit = (currentNav - item.avgPrice) * item.units;
                                        const profitPercent = item.avgPrice > 0 ? ((currentNav - item.avgPrice) / item.avgPrice) * 100 : 0;
                                        return (
                                            <div key={item.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 flex justify-between items-center shadow-sm hover:shadow-md transition-all group">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center font-black text-indigo-600 text-lg uppercase transition-transform group-hover:scale-105">
                                                        {fundInfo?.fundCode.slice(0, 2) || '??'}
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-1">{fundInfo?.fundName || 'Loading...'}</p>
                                                        <p className="text-xl font-black text-slate-900">{item.units.toFixed(4)} Units</p>
                                                    </div>
                                                </div>

                                                <div className="text-right">
                                                    <p className={`text-sm font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                        {profit >= 0 ? '+' : ''}{profit.toFixed(2)} THB ({profitPercent.toFixed(2)}%)
                                                    </p>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                                        Market Value: ฿{(item.units * currentNav).toLocaleString()}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    }) : (
                                        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center"><p className="text-slate-400 text-sm font-bold italic">No assets found... Go to Marketplace now!</p></div>
                                    )}
                                </div>
                            </div>

                            {/* --- My Favorite Section (Relocated below My Assets) --- */}
                            <div className="mb-12">
                                <div className="flex justify-between items-end mb-6 px-2">
                                    <h2 className="text-2xl font-black text-slate-800 tracking-tight">My Favorite</h2>
                                    <button 
                                        onClick={() => checkSuspension() ? null : setShowAddFavModal(true)}
                                        className="px-4 py-2 bg-white text-emerald-600 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-emerald-600 hover:text-white transition-all border border-emerald-100 shadow-sm active:scale-95 flex items-center gap-2 group/btn"
                                    >
                                        <svg className="w-3.5 h-3.5 group-hover/btn:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                        Add Favorite
                                    </button>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                                    {favorites.length > 0 ? favorites.map(fav => (
                                        <div key={fav.id} className="group relative">
                                            <button 
                                                onClick={() => checkSuspension() ? null : (
                                                    setDestAccountNumber(fav.accountNumber),
                                                    setDestAccountName(fav.ownerName),
                                                    setShowTransferModal(true)
                                                )}
                                                className="w-full bg-white border border-slate-100 rounded-[2rem] p-6 flex flex-col items-center justify-center shadow-sm hover:shadow-md hover:border-emerald-100 transition-all active:scale-95 group overflow-hidden"
                                            >
                                                <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-[1.5rem] flex items-center justify-center mb-3 group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-emerald-200/50 transition-all shadow-sm border border-white/20">
                                                    <span className="text-white font-black text-2xl uppercase drop-shadow-md">{fav.nickname.slice(0, 1)}</span>
                                                </div>
                                                <p className="text-xs font-black text-slate-800 text-center truncate w-full mb-1">{fav.nickname}</p>
                                                <p className="text-[9px] font-bold text-slate-400 font-mono tracking-tighter">#{fav.accountNumber}</p>
                                            </button>
                                            <button 
                                                onClick={(e) => { e.stopPropagation(); if (checkSuspension()) return; handleDeleteFavorite(fav.id); }}
                                                className="absolute -top-2 -right-2 w-7 h-7 bg-white text-rose-500 rounded-full flex items-center justify-center shadow-md border border-slate-100 opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-500 hover:text-white hover:scale-110"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                                            </button>
                                        </div>
                                    )) : (
                                        <div className="col-span-full bg-slate-50/50 border-2 border-dashed border-slate-200 rounded-[2rem] p-10 text-center">
                                            <p className="text-sm font-bold text-slate-400 italic">No favorites yet. Save your frequent recipients here!</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="flex justify-between items-center mb-6 px-2">
                                <h2 className="text-2xl font-black text-slate-800 tracking-tight">Market Pulse</h2>
                                <span className="flex items-center gap-1.5 text-[10px] text-emerald-500 font-black uppercase tracking-widest bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Live
                                </span>
                            </div>
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-6 shadow-sm space-y-6">
                                {funds.map(fund => (
                                    <div key={fund.id} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-3"><div className="w-10 h-10 bg-slate-50 rounded-2xl flex items-center justify-center text-xs font-black text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all">{(fund.fundCode || "??").slice(0, 2)}</div><div><p className="text-[11px] font-black text-slate-800 uppercase">{fund.fundCode}</p><p className="text-[9px] text-slate-400 font-medium">{fund.fundName}</p></div></div>
                                        <div className="text-right"><p className="text-xs font-black text-slate-800 font-mono">{(fund.nav || 0).toFixed(4)}</p><p className="text-[9px] font-bold text-emerald-500">NAV</p></div>
                                    </div>
                                ))}
                                <button onClick={() => navigate('/investment')} className="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-50 hover:text-emerald-600 transition-all border border-transparent hover:border-emerald-100 shadow-sm active:scale-95">Marketplace</button>
                            </div>
                        </div>
                    </div>
                </main>
            </div>

            {/* Modals */}
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
                            </div>
                            <div className="flex gap-3 pt-4">
                                <button onClick={() => setShowSellModal(false)} className="flex-1 py-4 font-bold text-slate-400 bg-slate-50 rounded-2xl transition-all">Cancel</button>
                                <button onClick={handleConfirmSell} className="flex-1 py-4 font-bold text-white bg-rose-500 rounded-2xl shadow-lg shadow-rose-200 transition-all active:scale-95">Confirm Sell</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSlipModal && slipData && (
                <div className="fixed inset-0 z-[160] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm animate-in zoom-in-95 duration-300">
                    <div className="w-full max-w-sm">
                        <div id="digital-slip" className="bg-white rounded-[2rem] overflow-hidden w-full font-sans shadow-2xl">
                            <div className="bg-emerald-500 p-10 text-center">
                                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white/30 text-white font-bold text-3xl">✓</div>
                                <h3 className="text-white font-black uppercase tracking-widest text-lg m-0">Transfer Success</h3>
                                <p className="text-white/80 text-[10px] font-mono mt-2 m-0">{slipData.date}</p>
                            </div>
                            <div className="p-8 bg-white">
                                <div className="text-center pb-6 border-b border-slate-100 mb-6">
                                    <p className="text-slate-400 text-[10px] font-black uppercase m-0">Amount</p>
                                    <p className="text-4xl font-black text-slate-900 mt-2 m-0">฿{Number(slipData.amount).toLocaleString(undefined, {minimumFractionDigits: 2})}</p>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-slate-300 text-[10px] font-black uppercase m-0">From</p>
                                        <p className="text-sm font-black text-slate-700 m-0">{slipData.fromName || user.firstName + " " + user.lastName}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-300 text-[10px] font-black uppercase m-0">To</p>
                                        <p className="text-sm font-black text-slate-700 m-0">{slipData.toName}</p>
                                    </div>
                                </div>
                                <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-slate-400">
                                    <span className="text-[8px] font-mono uppercase tracking-tighter">Ref ID: #VB-{slipData.transactionId}</span>
                                    <span className="text-[10px] font-black text-emerald-500 uppercase">Virtual Bank</span>
                                </div>
                            </div>
                        </div>
                        <div className="mt-6 space-y-3">
                            <button onClick={handleSaveSlip} className="w-full py-4 bg-emerald-500 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all uppercase tracking-widest">Save to Gallery</button>
                            <button onClick={() => setShowSlipModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black shadow-xl active:scale-95 transition-all uppercase text-xs tracking-widest">Done</button>
                        </div>
                    </div>
                </div>
            )}

            {showQRModal && selectedAccForQR && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in zoom-in-95 duration-300">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-sm shadow-2xl text-center">
                        <div className="flex justify-between items-center mb-8">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">My QR Code</span>
                            <button onClick={() => setShowQRModal(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        <div className="bg-slate-50 p-6 rounded-[2.5rem] inline-block mb-6 border-4 border-white shadow-inner"><QRCodeCanvas value={qrValue} size={200} level={"H"} fgColor="#0f172a" includeMargin={true} /></div>
                        <div className="mb-8"><h3 className="text-xl font-black text-slate-800">{user.firstName} {user.lastName}</h3><p className="text-slate-400 font-mono text-sm mt-1">{selectedAccForQR.accountName}</p><p className="bg-emerald-50 text-emerald-600 font-mono font-bold py-2 px-4 rounded-xl inline-block mt-4 tracking-tighter">{selectedAccForQR.accountNumber}</p></div>
                        <button onClick={() => setShowQRModal(false)} className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-widest shadow-xl active:scale-95 transition-all">Done</button>
                    </div>
                </div>
            )}

            {showTransferModal && (
                <div className="fixed inset-0 z-[140] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight">Transfer</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Send funds to another account</p>
                            </div>
                            <button onClick={() => setShowTransferModal(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Source Pocket</label>
                                <select 
                                    value={sourceId} 
                                    onChange={(e) => setSourceId(e.target.value)} 
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-slate-500/20 font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Select source pocket</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountName.toUpperCase()} (฿{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Recipient Account Number</label>
                                <input 
                                    type="text" 
                                    placeholder="Account Number (10 digits)" 
                                    maxLength="10" 
                                    value={destAccountNumber} 
                                    onChange={(e) => setDestAccountNumber(e.target.value)} 
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-slate-500/20 font-black text-xl" 
                                />
                                {destAccountName && <p className="mt-2 text-[9px] font-bold text-emerald-600 uppercase ml-1 italic">{destAccountName}</p>}
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Transfer Amount (THB)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={transferAmount} 
                                        onChange={(e) => setTransferAmount(e.target.value)} 
                                        className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-slate-500/20 font-black text-3xl" 
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-300 uppercase">THB</span>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <button 
                                    onClick={handleTransfer} 
                                    disabled={isProcessing || !destId || isDestSuspended} 
                                    className={`w-full py-4 font-bold rounded-xl shadow-lg uppercase text-[11px] active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed ${isDestSuspended ? 'bg-rose-500 text-white' : 'bg-slate-900 text-white'}`}
                                >
                                    {isDestSuspended ? 'Account Suspended' : 'Confirm Transfer'}
                                </button>
                                <button onClick={() => setShowTransferModal(false)} className="w-full py-2 font-bold text-slate-400 text-[10px] text-center hover:text-slate-900 transition-all uppercase tracking-widest">Go Back</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showWithdrawModal && (
                <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm tracking-tight text-slate-800">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight text-left">Withdraw</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Access your cash instantly</p>
                            </div>
                            <button onClick={() => setShowWithdrawModal(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Withdraw From</label>
                                <select 
                                    value={withdrawAccountId} 
                                    onChange={(e) => setWithdrawAccountId(e.target.value)} 
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-slate-500/20 font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">Select pocket</option>
                                    {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.accountName.toUpperCase()} (฿{acc.balance.toLocaleString()})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Withdrawal Amount (THB)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={withdrawAmount} 
                                        onChange={(e) => setWithdrawAmount(e.target.value)} 
                                        className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-slate-500/20 font-black text-3xl" 
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-300 uppercase">THB</span>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <button 
                                    onClick={handleWithdraw} 
                                    disabled={isProcessing} 
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg uppercase text-[11px] active:scale-95 transition-all"
                                >
                                    Confirm Withdrawal
                                </button>
                                <button onClick={() => setShowWithdrawModal(false)} className="w-full py-2 font-bold text-slate-400 text-[10px] text-center hover:text-slate-900 transition-all uppercase tracking-widest">Go Back</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showMoveModal && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm text-slate-800">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">Move Money</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">From: {moveSourceAcc?.accountName.toUpperCase()}</p>
                            </div>
                            <button onClick={() => setShowMoveModal(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">To Pocket</label>
                                <select 
                                    value={moveDestId} 
                                    onChange={(e) => setMoveDestId(e.target.value)} 
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-slate-500/20 font-bold appearance-none cursor-pointer"
                                >
                                    <option value="">To pocket</option>
                                    {accounts.filter(a => a.id !== moveSourceAcc?.id).map(a => <option key={a.id} value={a.id}>{a.accountName.toUpperCase()} (฿{a.balance.toLocaleString()})</option>)}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Amount to Move (THB)</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        placeholder="0.00" 
                                        value={moveAmount} 
                                        onChange={(e) => setMoveAmount(e.target.value)} 
                                        className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-slate-500/20 font-black text-3xl" 
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-300 uppercase">THB</span>
                                </div>
                            </div>

                            <div className="pt-2 flex flex-col gap-2">
                                <button 
                                    onClick={handleMoveMoney} 
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg uppercase text-[11px] active:scale-95 transition-all"
                                >
                                    Confirm Move
                                </button>
                                <button onClick={() => setShowMoveModal(false)} className="w-full py-2 font-bold text-slate-400 text-[10px] text-center hover:text-slate-900 transition-all uppercase tracking-widest">Go Back</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showCreateModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm text-slate-800">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-slate-900 tracking-tight">New Pocket</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Create a savings sub-pocket</p>
                            </div>
                            <button onClick={() => setShowCreateModal(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Pocket Name</label>
                                <input type="text" placeholder="e.g. Travel Fund" value={newAccountName} onChange={(e) => setNewAccountName(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-slate-500/20 font-black text-xl" />
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Savings Goal (THB)</label>
                                <input type="number" placeholder="0.00" value={newAccountGoal} onChange={(e) => setNewAccountGoal(e.target.value)} className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-slate-500/20 font-black text-xl" />
                            </div>
                            
                            <div className="pt-2 flex flex-col gap-2">
                                <button onClick={submitCreateAccount} className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg uppercase text-[11px] active:scale-95 transition-all">Create Pocket</button>
                                <button onClick={() => setShowCreateModal(false)} className="w-full py-2 font-bold text-slate-400 text-[10px] text-center hover:text-slate-900 transition-all uppercase tracking-widest">Go Back</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showAddFavModal && (
                <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm tracking-tight text-slate-800">
                    <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h3 className="text-3xl font-bold text-slate-900 tracking-tight text-left">Add Favorite</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Quick transfer recipient</p>
                            </div>
                            <button onClick={() => setShowAddFavModal(false)} className="w-8 h-8 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center hover:bg-rose-50 hover:text-rose-500 transition-all shadow-sm">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                        
                        <div className="space-y-5">
                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 mb-1 block tracking-tight">Nickname</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Mom"
                                    autoComplete="off"
                                    spellCheck="false"
                                    value={newFav.nickname} 
                                    onChange={(e) => setNewFav({ ...newFav, nickname: e.target.value })} 
                                    className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:border-emerald-200 focus:bg-white transition-all font-bold text-sm" 
                                />
                            </div>

                            <div>
                                <label className="text-[9px] font-bold text-slate-400 uppercase ml-1 mb-1 block tracking-tight">Account Number (10 digits)</label>
                                <div className="relative">
                                    <input 
                                        type="text" 
                                        maxLength={10}
                                        placeholder="10 digits"
                                        autoComplete="off"
                                        spellCheck="false"
                                        value={newFav.accountNumber} 
                                        onChange={(e) => {
                                            const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                            setNewFav({ ...newFav, accountNumber: val });
                                        }} 
                                        className="w-full bg-slate-50 border border-slate-100 p-4 rounded-xl outline-none focus:border-emerald-200 focus:bg-white transition-all font-bold text-sm tracking-widest" 
                                    />
                                    {newFav.accountNumber.length === 10 && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 scale-75">
                                            {newFav.ownerName && !newFav.ownerName.includes('checking') && !newFav.ownerName.includes('ไม่พบ') ? (
                                                <svg className="w-5 h-5 text-emerald-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                                            ) : newFav.ownerName?.includes('checking') ? (
                                                <div className="w-4 h-4 border-2 border-slate-200 border-t-emerald-500 rounded-full animate-spin"></div>
                                            ) : newFav.ownerName?.includes('ไม่พบ') ? (
                                                <svg className="w-5 h-5 text-rose-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414-1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
                                            ) : null}
                                        </div>
                                    )}
                                </div>
                                {newFav.accountNumber.length === 10 && newFav.ownerName && (
                                    <p className={`mt-2 text-[10px] font-black uppercase ml-1 italic transition-all ${newFav.ownerName.includes('ไม่พบ') ? 'text-rose-500' : 'text-emerald-600'}`}>
                                        {newFav.ownerName}
                                    </p>
                                )}
                            </div>
                            
                            <div className="pt-2 flex flex-col gap-2">
                                <button 
                                    onClick={handleAddFavorite} 
                                    disabled={isAddingFav || !newFav.ownerName || newFav.ownerName.includes('checking') || newFav.ownerName.includes('ไม่พบ')}
                                    className="w-full py-4 bg-slate-900 text-white font-bold rounded-xl shadow-lg uppercase text-[10px] active:scale-95 transition-all hover:bg-slate-800 disabled:opacity-20 disabled:cursor-not-allowed tracking-widest"
                                >
                                    {isAddingFav ? 'Saving...' : 'Confirm & Save'}
                                </button>
                                <button onClick={() => setShowAddFavModal(false)} className="w-full py-1 font-bold text-slate-300 text-[9px] text-center hover:text-slate-900 transition-all uppercase tracking-widest">Done</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
                    </div>
                );
            })()}
        </LoadingGuard>
    );
};


export default Portal;