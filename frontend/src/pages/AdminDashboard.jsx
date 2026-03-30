import React, { useState, useEffect } from 'react';
import api from '../utils/axios';
import { useNavigate } from 'react-router-dom';
import NavbarAdmin from '../components/Navbar-Admin';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('users');
    const [users, setUsers] = useState([]);
    const [funds, setFunds] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userAccounts, setUserAccounts] = useState([]);
    const [amounts, setAmounts] = useState({}); // Fix: Individual amounts per accountId
    const [isMinting, setIsMinting] = useState(false);
    const [fundData, setFundData] = useState({ fundCode: '', fundName: '', nav: '', type: 'Low Risk' });
    const navigate = useNavigate();
    
    // Check for admin user in localStorage
    const admin = JSON.parse(localStorage.getItem('user'));

    useEffect(() => {
        if (!admin || admin.role !== 'ADMIN') {
            navigate('/login');
            return;
        }
        fetchData();
    }, [admin, navigate]);

    const fetchData = async () => {
        try {
            const [usersRes, fundsRes] = await Promise.all([
                api.get('/admin/users'),
                api.get('/funds')
            ]);
            setUsers(usersRes.data);
            setFunds(fundsRes.data);
        } catch (error) {
            console.error('Error fetching admin data:', error);
        }
    };

    const handleUpdateStatus = async (userId, status) => {
        try {
            await api.post(`/admin/user/${userId}/status`, { status });
            fetchData();
        } catch (error) {
            console.error('Error updating status:', error);
            alert("Error updating status: " + (error.response?.data || error.message));
        }
    };

    const handleManageUser = async (user) => {
        try {
            const accountsRes = await api.get(`/accounts/user/${user.id}`);
            setUserAccounts(accountsRes.data);
            setSelectedUser(user);
            setAmounts({}); // Reset inputs when opening modal
        } catch (error) {
            console.error('Error fetching user accounts:', error);
            alert("Error fetching accounts: " + (error.response?.data || error.message));
        }
    };

    const mintMoney = async (accountId) => {
        const amountToMint = amounts[accountId];
        if (!amountToMint || isNaN(amountToMint) || amountToMint <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        setIsMinting(true);
        try {
            await api.post(`/admin/mint-money`, {
                accountId,
                amount: parseFloat(amountToMint)
            });
            // Refresh user data to show new balance
            handleManageUser(selectedUser);
            setAmounts(prev => ({ ...prev, [accountId]: '' }));
        } catch (error) {
            console.error('Error minting money:', error);
            alert("Error issuing money: " + (error.response?.data || error.message));
        } finally {
            setIsMinting(false);
        }
    };

    const handleAddFund = async (e) => {
        e.preventDefault();
        try {
            await api.post('/funds/add', fundData);
            setFundData({ fundCode: '', fundName: '', nav: '', type: 'Low Risk' });
            fetchData();
            alert("Fund added successfully!");
        } catch (error) {
            console.error('Error adding fund:', error);
            alert("Error adding fund: " + (error.response?.data || error.message));
        }
    };

    const handleToggleFundStatus = async (fundId) => {
        try {
            await api.put(`/funds/${fundId}/status`);
            fetchData();
        } catch (error) {
            console.error('Error toggling fund status:', error);
        }
    };

    const handleDeleteFund = async (fundId) => {
        if (!window.confirm("คุณแน่ใจนะโบร? ลบแล้วกู้คืนไม่ได้นะ!")) return;
        try {
            await api.delete(`/funds/${fundId}`);
            fetchData();
        } catch (error) {
            console.error('Error deleting fund:', error);
            const msg = error.response?.data?.error || error.message;
            alert("❌ " + msg);
        }
    };

    if (!admin) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
            {/* --- Navbar --- */}
            <NavbarAdmin 
                admin={admin} 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                onLogout={() => { localStorage.removeItem('user'); navigate('/login'); }} 
            />

            <main className="max-w-7xl mx-auto p-8">
                {activeTab === 'users' ? (
                    <div>
                        <div className="flex justify-between items-end mb-8">
                            <h1 className="text-4xl font-black tracking-tighter flex items-center gap-4">
                                User Registry
                            </h1>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-500/50 bg-emerald-500/5 px-4 py-2 rounded-full border border-emerald-500/10">
                                {users.filter(u => u.role !== 'ADMIN').length} Active Records
                            </span>
                        </div>
                        <div className="bg-slate-900 border border-white/10 rounded-[2.5rem] overflow-hidden shadow-2xl">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-emerald-500 font-black border-b border-white/10">
                                        <th className="p-8">Identification</th>
                                        <th className="p-8">Account Details</th>
                                        <th className="p-8 text-center">Security Status</th>
                                        <th className="p-8 text-right">Administrative Controls</th>
                                    </tr>
                                </thead>
                                <tbody className="text-sm divide-y divide-white/5">
                                    {users.filter(u => u.role !== 'ADMIN').map(user => (
                                        <tr key={user.id} className="hover:bg-white/[0.01] transition-colors group">
                                            <td className="p-8 font-mono text-slate-500 text-xs tracking-tighter group-hover:text-slate-300">#{user.id}</td>
                                            <td className="p-8">
                                                <div className="font-black text-white text-lg tracking-tight">{user.firstName} {user.lastName}</div>
                                                <div className="text-slate-500 font-bold text-xs mt-0.5 group-hover:text-emerald-500/50 transition-colors">@{user.username}</div>
                                            </td>
                                            <td className="p-8 text-center">
                                                <span className={`text-[10px] font-black uppercase px-4 py-1.5 rounded-full border ${
                                                    user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    user.status === 'SUSPENDED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                                    'bg-rose-500/10 text-rose-500 border-rose-500/20'
                                                }`}> {user.status} </span>
                                            </td>
                                            <td className="p-8">
                                                <div className="flex gap-4 items-center justify-end">
                                                    <button onClick={() => handleManageUser(user)} className="bg-white text-slate-950 text-[10px] font-black px-5 py-2.5 rounded-xl uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-white/5 mr-4">Manage</button>
                                                    
                                                    {/* Status Toggle Group */}
                                                    <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5">
                                                        <button 
                                                            onClick={() => handleUpdateStatus(user.id, 'ACTIVE')}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${user.status === 'ACTIVE' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-500 hover:text-white'}`}
                                                        >
                                                            Active
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(user.id, 'SUSPENDED')}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${user.status === 'SUSPENDED' ? 'bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/20' : 'text-slate-500 hover:text-white'}`}
                                                        >
                                                            Suspend
                                                        </button>
                                                        <button 
                                                            onClick={() => handleUpdateStatus(user.id, 'BANNED')}
                                                            className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase transition-all ${user.status === 'BANNED' ? 'bg-rose-500 text-slate-950 shadow-lg shadow-rose-500/20' : 'text-slate-500 hover:text-white'}`}
                                                        >
                                                            Ban
                                                        </button>
                                                    </div>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="lg:col-span-1">
                            <h2 className="text-3xl font-black mb-6 tracking-tight flex items-center gap-3 text-white">
                                <span className="w-2 h-8 bg-emerald-500 rounded-full"></span>
                                Launch Fund
                            </h2>
                            <form onSubmit={handleAddFund} className="bg-slate-900 border border-white/10 p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-emerald-400 uppercase ml-2 mb-2 block tracking-[0.2em]">Fund Code</label>
                                    <input type="text" placeholder="e.g. VB-TECH" required className="w-full p-4 bg-slate-800 border border-white/10 rounded-2xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-bold text-white placeholder:text-slate-600 transition-all" value={fundData.fundCode} onChange={e => setFundData({...fundData, fundCode: e.target.value.toUpperCase()})} />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[11px] font-black text-emerald-400 uppercase ml-2 mb-2 block tracking-[0.2em]">Fund Name</label>
                                    <input type="text" placeholder="e.g. Global Technology" required className="w-full p-4 bg-slate-800 border border-white/10 rounded-2xl focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none font-bold text-white placeholder:text-slate-600 transition-all" value={fundData.fundName} onChange={e => setFundData({...fundData, fundName: e.target.value})} />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-emerald-400 uppercase ml-2 mb-2 block tracking-[0.2em]">Initial NAV</label>
                                        <input type="number" step="0.0001" placeholder="10.0000" required className="w-full p-4 bg-slate-800 border border-white/10 rounded-2xl focus:border-emerald-500 outline-none font-black font-mono text-white" value={fundData.nav} onChange={e => setFundData({...fundData, nav: e.target.value})} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[11px] font-black text-emerald-400 uppercase ml-2 mb-2 block tracking-[0.2em]">Risk Level</label>
                                        <select className="w-full p-4 bg-slate-800 border border-white/10 rounded-2xl focus:border-emerald-500 outline-none font-bold text-white cursor-pointer appearance-none" value={fundData.type} onChange={e => setFundData({...fundData, type: e.target.value})}>
                                            <option value="Low Risk">Low Risk</option>
                                            <option value="Medium Risk">Medium Risk</option>
                                            <option value="High Risk">High Risk</option>
                                        </select>
                                    </div>
                                </div>
                                <button type="submit" className="w-full py-5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all mt-4">Create Fund</button>
                            </form>
                        </div>
                        <div className="lg:col-span-2">
                            <h2 className="text-3xl font-black mb-6 tracking-tight flex items-center gap-3">
                                <span className="w-2 h-8 bg-slate-800 rounded-full"></span>
                                Active Market
                            </h2>
                            <div className="bg-slate-900 border border-white/5 rounded-[2.5rem] overflow-hidden shadow-xl">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-white/[0.03] text-[10px] uppercase tracking-[0.2em] text-slate-500 border-b border-white/5">
                                            <th className="p-8">Asset Description</th>
                                            <th className="p-8 text-center">Status</th>
                                            <th className="p-8 text-right">Market NAV (Live)</th>
                                            <th className="p-8 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {funds.map(fund => (
                                            <tr key={fund.id} className="hover:bg-white/[0.01] transition-colors group">
                                                <td className="p-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-emerald-400 border border-white/5 group-hover:border-emerald-500/30 transition-all uppercase">{(fund.fundCode || "??").slice(0, 2)}</div>
                                                        <div>
                                                            <div className="font-black text-white text-lg tracking-tight uppercase">{fund.fundCode}</div>
                                                            <div className="text-slate-400 font-bold text-xs uppercase tracking-tight">{fund.fundName}</div>
                                                            <div className={`text-[9px] mt-1.5 inline-block px-2.5 py-0.5 rounded-md font-black uppercase tracking-tighter ${fund.type === 'High Risk' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : fund.type === 'Medium Risk' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}> {fund.type} </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8 text-center">
                                                    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full border ${(fund.marketStatus === 'ACTIVE' || !fund.marketStatus) ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-500 border-amber-500/20'}`}>
                                                        {fund.marketStatus || 'ACTIVE'}
                                                    </span>
                                                </td>
                                                <td className="p-8 text-right font-mono">
                                                    <div className="text-3xl font-black text-white tracking-tighter tabular-nums group-hover:text-emerald-400 transition-colors">{(fund.nav || 0).toFixed(4)}</div>
                                                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">THB / Unit</div>
                                                </td>
                                                <td className="p-8 text-right">
                                                    <div className="flex gap-2 justify-end">
                                                        <button 
                                                            onClick={() => handleToggleFundStatus(fund.id)}
                                                            className={`p-3 rounded-xl border transition-all ${(fund.marketStatus === 'ACTIVE' || !fund.marketStatus) ? 'bg-amber-400/5 text-amber-400 border-amber-400/20 hover:bg-amber-400/20' : 'bg-emerald-400/5 text-emerald-400 border-emerald-400/20 hover:bg-emerald-400/20'}`}
                                                            title={(fund.marketStatus === 'ACTIVE' || !fund.marketStatus) ? 'Pause Fund' : 'Resume Fund'}
                                                        >
                                                            {(fund.marketStatus === 'ACTIVE' || !fund.marketStatus) ? (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                                                            ) : (
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                                            )}
                                                        </button>
                                                        <button 
                                                            onClick={() => handleDeleteFund(fund.id)}
                                                            className="p-3 rounded-xl border bg-rose-500/5 text-rose-500 border-rose-500/20 hover:bg-rose-500/20 transition-all"
                                                            title="Delete Fund"
                                                        >
                                                            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* --- Mint Money Modal --- */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl">
                    <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight text-white">Manage User Wallets</h3>
                                <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Adding to wallets for {selectedUser.firstName} {selectedUser.lastName}</p>
                            </div>
                            <button onClick={() => setSelectedUser(null)} className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-all hover:rotate-90">✕</button>
                        </div>
                        <div className="space-y-4 mb-10 max-h-[40vh] overflow-y-auto pr-2 custom-scrollbar">
                            {userAccounts.map(account => (
                                <div key={account.id} className="bg-white/[0.03] border border-white/5 rounded-3xl p-6 flex justify-between items-center group hover:border-emerald-500/30 transition-all">
                                    <div>
                                        <p className="text-slate-500 font-black text-[10px] uppercase tracking-widest mb-1">{account.accountName}</p>
                                        <p className="text-emerald-400 font-black text-3xl font-mono tracking-tighter">฿{account.balance.toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-3">
                                        <input 
                                            type="number" 
                                            placeholder="Amount" 
                                            value={amounts[account.id] || ''} 
                                            onChange={(e) => setAmounts({ ...amounts, [account.id]: e.target.value })} 
                                            className="w-48 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-white font-black text-lg outline-none focus:border-emerald-500 transition-all text-right" 
                                        />
                                        <button onClick={() => mintMoney(account.id)} disabled={isMinting} className="bg-emerald-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-xl hover:bg-emerald-400 active:scale-95 transition-all shadow-lg shadow-emerald-500/20">+</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="w-full py-5 rounded-2xl font-black bg-slate-800 text-slate-400 uppercase tracking-widest hover:bg-slate-700 transition-all">Return to Registry</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;