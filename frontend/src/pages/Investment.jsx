import React, { useEffect, useState } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import LoadingGuard from '../components/LoadingGuard';
import api from '../utils/axios';

const Investment = () => {
    const navigate = useNavigate();
    const { user, setUser, handleLogout } = useOutletContext();
    const [funds, setFunds] = useState([]);
    const [accounts, setAccounts] = useState([]);
    const [portfolio, setPortfolio] = useState([]);

    // Tab State
    const [activeTab, setActiveTab] = useState('market'); // 'market' or 'portfolio'

    // States สำหรับ Modal ซื้อ
    const [showBuyModal, setShowBuyModal] = useState(false);
    const [selectedFund, setSelectedFund] = useState(null);
    const [buyAmount, setBuyAmount] = useState('');
    const [sourceId, setSourceId] = useState('');

    // States สำหรับ Modal ขาย
    const [showSellModal, setShowSellModal] = useState(false);
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [sellUnits, setSellUnits] = useState('');
    const [sellDestId, setSellDestId] = useState('');

    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

    const fetchAccounts = (userId) => {
        if (!userId) return;
        api.get(`/accounts/user/${userId}`)
            .then(res => {
                setAccounts(res.data);
                if (res.data.length > 0 && !sourceId) setSourceId(res.data[0].id);
                if (res.data.length > 0 && !sellDestId) setSellDestId(res.data[0].id);
            })
            .catch(err => console.error(err));
    };

    const fetchPortfolio = (userId) => {
        if (!userId) return;
        api.get(`/transactions/portfolio/${userId}`)
            .then(res => setPortfolio(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) return;
        const userData = JSON.parse(loggedInUser);
        setUser(userData);

        fetchAccounts(userData.id);
        fetchPortfolio(userData.id);

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


    const handleConfirmBuy = async () => {
        if (checkSuspension()) return;
        if (!sourceId || !buyAmount) {
            alert("Please select a pocket and enter an amount!");
            return;
        }

        try {
            await api.post('/transactions/invest', {
                accountId: sourceId,
                fundId: selectedFund.id,
                amount: parseFloat(buyAmount)
            });

            alert(`🎉 Success! Investment confirmed.`);
            fetchAccounts(user?.id);
            fetchPortfolio(user?.id);
            setShowBuyModal(false);
            setBuyAmount('');
        } catch (error) {
            alert(`❌ Error: ${error.response?.data?.error || 'System error.'}`);
        }
    };

    const handleConfirmSell = async () => {
        if (checkSuspension()) return;
        if (!sellDestId || !sellUnits) { alert("Invalid inputs!"); return; }
        try {
            await api.post('/transactions/sell', {
                accountId: sellDestId,
                fundId: selectedAsset.fundId,
                units: parseFloat(sellUnits)
            });
            alert("🎉 Sell successful!");
            fetchAccounts(user?.id);
            fetchPortfolio(user?.id);
            setShowSellModal(false);
            setSellUnits('');
        } catch (error) {
            alert(`❌ Error: ${error.response?.data?.error || 'System error.'}`);
        }
    };

    return (
        <LoadingGuard 
            user={user} 
            isStatusModalOpen={isStatusModalOpen} 
            onCloseModal={() => {
                setIsStatusModalOpen(false);
                if (user?.status === 'BANNED') handleLogout();
            }}
        >
            <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
            <div className="max-w-5xl mx-auto px-6">
                <header className="pt-6 mb-12 flex flex-col items-center">
                    <div className="bg-white p-1.5 rounded-2xl flex gap-1.5 w-full shadow-sm border border-slate-100/50">
                        <button
                            onClick={() => setActiveTab('market')}
                            className={`flex-1 py-3 px-8 rounded-xl font-bold text-xs transition-all ${activeTab === 'market'
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            Investment Market
                        </button>
                        <button
                            onClick={() => setActiveTab('portfolio')}
                            className={`flex-1 py-3 px-8 rounded-xl font-bold text-xs transition-all relative ${activeTab === 'portfolio'
                                    ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/10'
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'
                                }`}
                        >
                            My Assets
                            {portfolio.length > 0 && activeTab !== 'portfolio' && (
                                <span className="absolute top-3 right-8 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                            )}
                        </button>
                    </div>
                </header>

                <main>
                    {activeTab === 'market' ? (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {funds.map((fund) => {
                                const isHighRisk = fund.type === 'High Risk';
                                const isMedRisk = fund.type === 'Medium Risk';
                                const themeColor = isHighRisk ? 'rose' : isMedRisk ? 'amber' : 'emerald';

                                return (
                                    <div key={fund.id} className="bg-white border border-slate-100 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all group flex justify-between items-center">
                                        <div className="flex items-center gap-6">
                                            <div className={`w-14 h-14 rounded-2xl bg-${themeColor}-50 flex items-center justify-center text-lg font-black text-${themeColor}-500 shadow-inner group-hover:scale-105 transition-transform uppercase`}>
                                                {(fund.fundCode || "??").slice(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight mb-1">{fund.fundCode}</p>
                                                <h3 className="text-lg font-bold text-slate-900 leading-none">{fund.fundName}</h3>
                                                <div className="flex gap-2 mt-2">
                                                    <span className={`px-2 py-0.5 rounded-md border text-[9px] font-bold uppercase tracking-tight ${isHighRisk ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                            isMedRisk ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                                                'bg-emerald-50 text-emerald-500 border-emerald-100'
                                                        }`}>
                                                        {fund.type}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-12">
                                            <div className="text-right">
                                                <p className="text-[10px] font-bold text-slate-300 uppercase mb-1">Market Nav</p>
                                                <div className="flex items-baseline gap-1 justify-end">
                                                    <span className="text-sm font-bold text-emerald-500">฿</span>
                                                    <span className="text-2xl font-black text-slate-900 tracking-tight tabular-nums">{(fund.nav || 0).toFixed(4)}</span>
                                                </div>
                                            </div>
                                            <button
                                                disabled={fund.marketStatus === 'PAUSED'}
                                                onClick={() => checkSuspension() ? null : (setSelectedFund(fund), setShowBuyModal(true))}
                                                className={`px-8 py-3.5 rounded-xl font-bold text-xs uppercase transition-all shadow-lg ${
                                                    fund.marketStatus === 'PAUSED' 
                                                    ? "bg-slate-200 text-slate-400 cursor-not-allowed shadow-none" 
                                                    : "bg-[#065f46] text-white hover:bg-emerald-700 active:scale-95 shadow-emerald-900/10"
                                                }`}
                                            >
                                                {fund.marketStatus === 'PAUSED' ? 'Closing' : 'Invest'}
                                            </button>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                            {portfolio.length === 0 ? (
                                <div className="text-center py-32 bg-white rounded-[2rem] border border-slate-100">
                                    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-200">
                                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                    </div>
                                    <p className="text-xs font-bold text-slate-300 uppercase">No assets found... Go to Marketplace now!</p>
                                    <button onClick={() => setActiveTab('market')} className="mt-6 text-emerald-600 font-bold text-xs underline underline-offset-4 hover:text-emerald-700">Go to Market</button>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {portfolio.map(item => {
                                        const fundInfo = funds.find(f => f.id === item.fundId);
                                        const currentNav = fundInfo?.nav ?? item.avgPrice ?? 0;
                                        const profit = (currentNav - item.avgPrice) * item.units;
                                        const profitPercent = item.avgPrice > 0 ? ((currentNav - item.avgPrice) / item.avgPrice) * 100 : 0;

                                        return (
                                            <div key={item.id} className="bg-white border border-slate-100 rounded-[2rem] p-6 flex justify-between items-center shadow-sm group hover:shadow-md transition-all">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 text-lg uppercase transition-transform group-hover:scale-105">
                                                        {fundInfo?.fundCode.slice(0, 2) || '??'}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight">{fundInfo?.fundName || 'Loading...'}</p>
                                                            {fundInfo && (
                                                                <span className={`px-2 py-0.5 rounded-md border text-[8px] font-bold uppercase tracking-tight ${fundInfo.type === 'High Risk' ? 'bg-rose-50 text-rose-500 border-rose-100' :
                                                                        fundInfo.type === 'Medium Risk' ? 'bg-amber-50 text-amber-500 border-amber-100' :
                                                                            'bg-emerald-50 text-emerald-500 border-emerald-100'
                                                                    }`}>
                                                                    {fundInfo.type}
                                                                </span>
                                                            )}
                                                            {fundInfo?.marketStatus === 'PAUSED' && (
                                                                <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-500 border border-amber-100 text-[8px] font-bold uppercase tracking-tight animate-pulse">
                                                                    Closing
                                                                </span>
                                                            )}
                                                        </div>
                                                        <h4 className="text-2xl font-black text-slate-900 tracking-tight">{item.units.toFixed(4)} <span className="text-[10px] font-normal text-slate-400">Units</span></h4>
                                                    </div>
                                                </div>

                                                <div className="flex flex-row items-center gap-16 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <p className={`text-sm font-black ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                            {profit >= 0 ? '+' : ''}{profit.toFixed(2)} THB ({profitPercent.toFixed(2)}%)
                                                        </p>
                                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                                            Market Value: ฿{(item.units * currentNav).toLocaleString()}
                                                        </p>
                                                    </div>
                                                    <button 
                                                        onClick={() => checkSuspension() ? null : (setSelectedAsset(item), setShowSellModal(true))}
                                                        className="bg-rose-500 text-white px-10 py-3.5 rounded-xl font-bold text-xs uppercase hover:bg-rose-600 transition-all active:scale-95 shadow-lg shadow-rose-900/10"
                                                    >
                                                        Sell
                                                    </button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </main>
            </div>

            {/* Modals with Uniform Flat design */}
            {showBuyModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Invest</h2>
                                <p className="text-emerald-600 font-bold text-[10px] uppercase">{selectedFund?.fundCode}</p>
                            </div>
                            <button onClick={() => setShowBuyModal(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {(() => {
                            const asset = portfolio.find(item => item.fundId === selectedFund?.id);
                            if (!asset) return null;
                            const fundInfo = funds.find(f => f.id === asset.fundId);
                            const currentNav = fundInfo ? fundInfo.nav : asset.avgPrice;
                            const profit = (currentNav - asset.avgPrice) * asset.units;
                            const profitPercent = ((currentNav - asset.avgPrice) / asset.avgPrice) * 100;

                            return (
                                <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Holding</p>
                                            <p className="text-lg font-black text-slate-900">{asset.units.toFixed(4)} <span className="text-[10px] font-normal text-slate-400">Units</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {profit >= 0 ? '+' : ''}{profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Current ROI</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-200/60">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Market Value</p>
                                        <p className="text-sm font-black text-slate-900">฿{(asset.units * selectedFund.nav).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Source Pocket</label>
                                <select
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl outline-none focus:border-emerald-500/20 font-bold appearance-none cursor-pointer"
                                    value={sourceId}
                                    onChange={(e) => setSourceId(e.target.value)}
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.accountName} (฿{acc.balance.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Amount to Invest (THB)</label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-emerald-500/20 text-3xl font-black text-slate-900"
                                        placeholder="0.00"
                                        value={buyAmount}
                                        onChange={(e) => setBuyAmount(e.target.value)}
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-300">THB</span>
                                </div>
                                {buyAmount && selectedFund && (
                                    <p className="mt-2 text-[9px] text-emerald-600 font-bold uppercase ml-1">
                                        + {(parseFloat(buyAmount) / selectedFund.nav).toFixed(4)} New Units estimated
                                    </p>
                                )}
                            </div>
                            <div className="pt-2 flex flex-col gap-2">
                                <button onClick={handleConfirmBuy} className="w-full py-4 bg-[#065f46] text-white font-bold rounded-xl shadow-lg shadow-emerald-900/10 uppercase text-[11px] hover:bg-emerald-700 active:scale-95 transition-all">Confirm Investment</button>
                                <button onClick={() => setShowBuyModal(false)} className="w-full py-2 font-bold text-slate-400 text-[10px] text-center hover:text-slate-900 transition-all">Go Back</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {showSellModal && selectedAsset && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white p-8 rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Sell Asset</h2>
                                <p className="text-rose-500 font-bold text-[10px] uppercase">
                                    {funds.find(f => f.id === selectedAsset.fundId)?.fundName}
                                </p>
                            </div>
                            <button onClick={() => setShowSellModal(false)} className="w-8 h-8 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-900">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        {(() => {
                            const fundInfo = funds.find(f => f.id === selectedAsset.fundId);
                            const currentNav = fundInfo ? fundInfo.nav : selectedAsset.avgPrice;
                            const profit = (currentNav - selectedAsset.avgPrice) * selectedAsset.units;
                            const profitPercent = ((currentNav - selectedAsset.avgPrice) / selectedAsset.avgPrice) * 100;

                            return (
                                <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Holding</p>
                                            <p className="text-lg font-black text-slate-900">{selectedAsset.units.toFixed(4)} <span className="text-[10px] font-normal text-slate-400">Units</span></p>
                                        </div>
                                        <div className="text-right">
                                            <p className={`text-xs font-bold ${profit >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                                {profit >= 0 ? '+' : ''}{profit.toFixed(2)} ({profitPercent.toFixed(2)}%)
                                            </p>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Current ROI</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center pt-3 border-t border-slate-200/60">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Total Value</p>
                                        <p className="text-sm font-black text-slate-900">฿{(selectedAsset.units * currentNav).toLocaleString()}</p>
                                    </div>
                                </div>
                            );
                        })()}

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Destination Pocket</label>
                                <select 
                                    className="w-full bg-slate-50 border-2 border-slate-50 p-4 rounded-xl outline-none focus:border-slate-500/20 font-bold appearance-none cursor-pointer"
                                    value={sellDestId}
                                    onChange={(e) => setSellDestId(e.target.value)}
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.accountName.toUpperCase()} (฿{acc.balance.toLocaleString()})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="text-[10px] font-bold text-slate-400 uppercase ml-1 mb-2 block tracking-tight">Units to Liquefy</label>
                                <div className="relative">
                                    <input 
                                        type="number" 
                                        step="0.0001"
                                        className="w-full bg-slate-50 border-2 border-slate-50 p-5 rounded-xl outline-none focus:border-slate-500/20 text-3xl font-black text-slate-900"
                                        value={sellUnits}
                                        onChange={(e) => setSellUnits(e.target.value)}
                                    />
                                    <button onClick={() => setSellUnits(selectedAsset.units)} className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-bold bg-rose-50 text-rose-500 px-2 py-1 rounded-lg border border-rose-100/50">MAX</button>
                                </div>
                                {sellUnits && (
                                    <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100 flex justify-between items-center">
                                        <p className="text-[9px] font-bold text-slate-400 uppercase">Estimated Recovery</p>
                                        <p className="text-lg font-black text-slate-900">
                                            ฿{(parseFloat(sellUnits) * (funds.find(f => f.id === selectedAsset.fundId)?.nav || selectedAsset.avgPrice)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                        </p>
                                    </div>
                                )}
                            </div>
                            <div className="pt-2 flex flex-col gap-2">
                                <button onClick={handleConfirmSell} className="w-full py-4 bg-rose-500 text-white font-bold rounded-xl shadow-lg shadow-rose-900/10 uppercase text-[11px] hover:bg-rose-600 active:scale-95 transition-all">Confirm Sell</button>
                                <button onClick={() => setShowSellModal(false)} className="w-full py-2 font-bold text-slate-400 text-[10px] text-center hover:text-slate-900 transition-all">Go Back</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            </div>
        </LoadingGuard>
    );
};

export default Investment;