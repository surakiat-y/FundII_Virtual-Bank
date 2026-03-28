import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Investment = () => {
    const navigate = useNavigate();
    const [funds, setFunds] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [user, setUser] = useState(null);
    
    // States สำหรับ Modal ซื้อ
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedFund, setSelectedFund] = useState(null);
    const [buyAmount, setBuyAmount] = useState('');
    const [sourceId, setSourceId] = useState('');

    // แยกฟังก์ชันดึงข้อมูลบัญชีออกมาเพื่อให้เรียกซ้ำได้หลังจากซื้อสำเร็จ
    const fetchAccounts = (userId) => {
        fetch(`http://localhost:8080/api/accounts/user/${userId}`)
            .then(res => res.json())
            .then(data => setAccounts(data));
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) return;
        const userData = JSON.parse(loggedInUser);
        setUser(userData);
        
        fetchAccounts(userData.id);

        const fetchFunds = () => {
            fetch('http://localhost:8080/api/funds')
                .then(res => res.json())
                .then(data => setFunds(data));
        };

        fetchFunds();
        const interval = setInterval(fetchFunds, 10000); 
        return () => clearInterval(interval);
    }, []);

    // 🔥 ฟังก์ชันยืนยันการซื้อแบบส่งไปหลังบ้านจริง
    const handleConfirmBuy = async () => {
        if (!sourceId || !buyAmount) { 
            alert("เลือกกระเป๋าและใส่จำนวนเงินด้วยนะโบร!"); 
            return; 
        }
        
        try {
            const response = await fetch('http://localhost:8080/api/transactions/invest', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    accountId: sourceId,
                    fundId: selectedFund.id,
                    amount: parseFloat(buyAmount)
                })
            });

            const data = await response.json();

            if (response.ok) {
                const units = (parseFloat(buyAmount) / selectedFund.nav).toFixed(4);
                alert(`🎉 ${data.message}\nใช้เงิน: ฿${buyAmount}\nได้รับหน่วยลงทุน: ${units} Units`);
                
                // ✅ สำคัญ: รีเฟรชยอดเงินในหน้าจอทันที
                fetchAccounts(user.id);
                
                setShowBuyModal(false);
                setBuyAmount('');
                setSourceId('');
            } else {
                // แสดง Error จากหลังบ้าน (เช่น เงินไม่พอ)
                alert(`❌ เกิดข้อผิดพลาด: ${data.error}`);
            }
        } catch (error) {
            console.error("Investment error:", error);
            alert("❌ ระบบขัดข้อง ติดต่อแอดมินด่วน");
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white font-sans p-8">
            <header className="max-w-4xl mx-auto flex justify-between items-center mb-10">
                <div>
                    <h1 className="text-3xl font-black tracking-tight">Marketplace</h1>
                    <p className="text-slate-400 text-sm">เลือกลงทุนในกองทุนรวมที่คุณเชื่อใจ</p>
                </div>
                <button onClick={() => navigate('/dashboard')} className="bg-slate-800 px-5 py-2 rounded-xl text-xs font-bold hover:bg-slate-700 transition-all">← Back</button>
            </header>

            <main className="max-w-4xl mx-auto space-y-4">
                {funds.map((fund) => (
                    <div key={fund.id} className="bg-slate-900/50 border border-white/5 p-8 rounded-[2.5rem] flex justify-between items-center hover:border-emerald-500/30 transition-all">
                        <div className="flex gap-6 items-center">
                            <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-2xl font-black text-emerald-500">
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
                                onClick={() => { setSelectedFund(fund); setShowBuyModal(true); }}
                                className="bg-white text-slate-900 px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95"
                            >
                                Invest
                            </button>
                        </div>
                    </div>
                ))}
            </main>

            {showBuyModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-slate-900 border border-white/10 p-10 rounded-[3rem] w-full max-w-md shadow-2xl">
                        <h2 className="text-2xl font-black mb-2">Confirm Investment</h2>
                        <p className="text-slate-400 text-sm mb-8 uppercase tracking-widest font-bold">Fund: {selectedFund?.fundCode}</p>
                        
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-2 block">Select Source Pocket</label>
                                <select 
                                    className="w-full bg-slate-800 border border-white/5 p-4 rounded-2xl outline-none focus:border-emerald-500 font-bold"
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
                                <label className="text-[10px] font-black text-slate-500 uppercase ml-2 mb-2 block">Amount (THB)</label>
                                <input 
                                    type="number" 
                                    className="w-full bg-slate-800 border border-white/5 p-4 rounded-2xl outline-none focus:border-emerald-500 text-2xl font-black"
                                    placeholder="0.00"
                                    value={buyAmount}
                                    onChange={(e) => setBuyAmount(e.target.value)}
                                />
                                {buyAmount && selectedFund && (
                                    <p className="mt-3 text-xs text-emerald-400 font-bold ml-2">
                                        You will get ≈ {(parseFloat(buyAmount) / selectedFund.nav).toFixed(4)} Units
                                    </p>
                                )}
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setShowBuyModal(false)} className="flex-1 py-4 font-bold text-slate-400">Cancel</button>
                                <button onClick={handleConfirmBuy} className="flex-1 py-4 bg-emerald-500 text-slate-950 font-black rounded-2xl shadow-lg shadow-emerald-500/20">Confirm</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Investment;