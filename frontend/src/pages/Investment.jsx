import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LoadingGuard from '../components/LoadingGuard';
import PinModal from '../components/PinModal';
import api from '../utils/axios';

const Investment = () => {
    const navigate = useNavigate();
    const { user, setUser, handleLogout } = useOutletContext();
    const [funds, setFunds] = useState([]);
    const [accounts, setAccounts] = useState([]);
    
    // States สำหรับ Modal ซื้อ
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedFund, setSelectedFund] = useState(null);
    const [buyAmount, setBuyAmount] = useState('');
    const [sourceId, setSourceId] = useState('');
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    // ─── Security States ───
    const [isPinModalOpen, setIsPinModalOpen] = useState(false);
    const [pinMode, setPinMode] = useState('VERIFY'); // 'VERIFY' or 'SETUP'
    const [pendingAction, setPendingAction] = useState(null);

    // แยกฟังก์ชันดึงข้อมูลบัญชีออกมาเพื่อให้เรียกซ้ำได้หลังจากซื้อสำเร็จ
    const fetchAccounts = (userId) => {
        api.get(`/accounts/user/${userId}`)
            .then(res => setAccounts(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) return;
        const userData = JSON.parse(loggedInUser);
        setUser(userData);

        fetchAccounts(userData.id);

        const fetchFunds = () => {
            api.get('/funds')
                .then(res => setFunds(res.data))
                .catch(err => console.error(err));
        };

        fetchFunds();
        const interval = setInterval(fetchFunds, 10000); 
        return () => clearInterval(interval);
    }, [navigate]);

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

    // 🔥 PIN Verification Wrapper
    const requestPin = (action) => {
        if (user.role === 'ADMIN') {
            action();
            return;
        }

        setPendingAction(() => action);
        if (!user.hasPin) {
            setPinMode('SETUP');
        } else {
            setPinMode('VERIFY');
        }
        setIsPinModalOpen(true);
    };

    const handlePinSuccess = () => {
        if (pinMode === 'SETUP') {
            const updatedUser = { ...user, hasPin: true };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
            alert("Security PIN setup successful! Now press Confirm again to buy.");
        } else {
            if (pendingAction) pendingAction();
        }
    };

    // 🔥 ฟังก์ชันยืนยันการซื้อแบบส่งไปหลังบ้านจริง
    const handleConfirmBuy = async () => {
        if (!sourceId || !buyAmount) { 
            alert("เลือกกระเป๋าและใส่จำนวนเงินด้วยนะโบร!"); 
            return; 
        }
        
        try {
            const response = await api.post('/transactions/invest', {
                accountId: sourceId,
                fundId: selectedFund.id,
                amount: parseFloat(buyAmount)
            });

            const data = response.data;
            const units = (parseFloat(buyAmount) / selectedFund.nav).toFixed(4);
            alert(`🎉 ${data.message}\nใช้เงิน: ฿${buyAmount}\nได้รับหน่วยลงทุน: ${units} Units`);
            
            // ✅ สำคัญ: รีเฟรชยอดเงินในหน้าจอทันที
            fetchAccounts(user.id);
            
            setShowBuyModal(false);
            setBuyAmount('');
            setSourceId('');
        } catch (error) {
            const data = error.response?.data || {};
            alert(`❌ เกิดข้อผิดพลาด: ${data.error || 'ระบบขัดข้อง ติดต่อแอดมินด่วน'}`);
        }
    };

    // Instant Access - No background status check here

    return (
        <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
            <div className="animate-slideInRight">
                <header className="max-w-4xl mx-auto mb-10 pt-10 px-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter">Marketplace</h1>
                        <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-3 py-1 rounded-full border border-slate-200/50">{funds.length} Total</span>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto space-y-6">
                    {funds.map((fund) => (
                        <div key={fund.id} className="bg-white border-2 border-slate-50 p-10 rounded-[3rem] flex justify-between items-center hover:shadow-xl hover:shadow-emerald-900/5 transition-all group active:scale-[0.99] cursor-pointer">
                            <div className="flex gap-8 items-center">
                                <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center text-4xl font-black text-emerald-500 group-hover:scale-110 transition-transform shadow-inner">
                                    {fund.fundCode.charAt(3)}
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold">{fund.fundName}</h3>
                                    <p className="text-xs text-slate-500 font-mono">{fund.fundCode} • <span className="text-rose-400">{fund.type}</span></p>
                                </div>
                            </div>
                            <div className="flex items-center gap-10">
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-500 font-black uppercase mb-1">Market Price (NAV)</p>
                                    <p className="text-3xl font-mono font-black text-emerald-400 tracking-tighter">{fund.nav.toFixed(4)}</p>
                                </div>
                                <button 
                                    onClick={() => checkSuspension() ? null : (setSelectedFund(fund), setShowBuyModal(true))}
                                    className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95"
                                >
                                    Invest
                                </button>
                            </div>
                        </div>
                    ))}
                </main>
            </div>

            {showBuyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
                        <h2 className="text-3xl font-black mb-1 text-slate-900 tracking-tighter uppercase">Invest Now</h2>
                        <p className="text-emerald-600 text-xs font-black uppercase tracking-widest mb-10">Fund: {selectedFund?.fundCode}</p>
                        
                        <div className="space-y-6 text-slate-800">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-[0.2em]">Source Pocket</label>
                                <select 
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[1.5rem] outline-none focus:border-emerald-500/20 font-bold transition-all"
                                    value={sourceId}
                                    onChange={(e) => setSourceId(e.target.value)}
                                >
                                    <option value="">เลือกกระเป๋าเงิน...</option>
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.accountName} (฿{acc.balance.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase ml-2 mb-2 block tracking-[0.2em]">Investment Amount (THB)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-50 border-2 border-slate-100 p-5 rounded-[1.5rem] outline-none focus:border-emerald-500/20 text-3xl font-black text-emerald-600 transition-all placeholder:text-slate-200"
                                    placeholder="0.00"
                                    value={buyAmount}
                                    onChange={(e) => setBuyAmount(e.target.value)}
                                />
                                {buyAmount && selectedFund && (
                                    <p className="mt-4 text-[11px] text-emerald-500 font-bold ml-2 italic">
                                        Expected Units ≈ {(parseFloat(buyAmount) / selectedFund.nav).toFixed(4)}
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-6">
                                <button onClick={() => setShowBuyModal(false)} className="flex-1 py-4 font-black text-slate-400 uppercase tracking-widest text-[11px] hover:text-slate-600 transition-all">Cancel</button>
                                <button onClick={() => requestPin(handleConfirmBuy)} className="flex-1 py-4 bg-slate-900 text-white font-black rounded-2xl shadow-xl shadow-slate-900/10 uppercase tracking-[0.2em] text-[11px] active:scale-95 transition-all">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            <PinModal 
                isOpen={isPinModalOpen}
                onClose={() => setIsPinModalOpen(false)}
                onSuccess={handlePinSuccess}
                mode={pinMode}
                userId={user?.id}
            />
        </div>
    );
};

export default Investment;