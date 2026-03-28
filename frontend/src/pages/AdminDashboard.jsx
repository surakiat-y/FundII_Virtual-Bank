import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [users, setUsers] = useState([]);
    const [activeTab, setActiveTab] = useState('users'); // 'users' หรือ 'funds'

    // User States
    const [selectedUser, setSelectedUser] = useState(null);
    const [userAccounts, setUserAccounts] = useState([]);
    const [amount, setAmount] = useState('');
    const [isMinting, setIsMinting] = useState(false);

    // Fund States
    const [funds, setFunds] = useState([]);
    const [fundData, setFundData] = useState({ fundCode: '', fundName: '', nav: '', type: 'Low Risk' });

    const fetchAllUsers = () => {
        fetch('http://localhost:8080/api/admin/users')
            .then(res => res.json())
            .then(data => setUsers(data.filter(u => u.role === 'USER')))
            .catch(err => console.error(err));
    };

    const fetchAllFunds = () => {
        fetch('http://localhost:8080/api/funds')
            .then(res => res.json())
            .then(data => setFunds(data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) { navigate('/login'); return; }
        const userData = JSON.parse(loggedInUser);
        if (userData.role !== 'ADMIN') { navigate('/dashboard'); return; }
        setAdmin(userData);
        fetchAllUsers();
        fetchAllFunds();

        const interval = setInterval(fetchAllFunds, 30000);
        return () => clearInterval(interval);
    }, [navigate]);

    const handleUpdateStatus = async (userId, newStatus) => {
        if (!window.confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${newStatus}?`)) return;
        await fetch(`http://localhost:8080/api/admin/user/${userId}/status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });
        fetchAllUsers();
    };

    const handleManageUser = (user) => {
        setSelectedUser(user);
        fetch(`http://localhost:8080/api/accounts/user/${user.id}`)
            .then(res => res.json())
            .then(data => setUserAccounts(data));
    };

    const mintMoney = async (accountId) => {
        if (!amount || Number(amount) <= 0) return;
        setIsMinting(true);
        const response = await fetch('http://localhost:8080/api/admin/mint-money', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ accountId: accountId, amount: Number(amount) })
        });
        if (response.ok) { alert("เติมเงินสำเร็จ!"); setAmount(''); handleManageUser(selectedUser); }
        setIsMinting(false);
    };

    const handleAddFund = async (e) => {
        e.preventDefault();
        const res = await fetch('http://localhost:8080/api/funds/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...fundData, nav: parseFloat(fundData.nav) })
        });
        if (res.ok) {
            alert("Launch Fund สำเร็จ!");
            setFundData({ fundCode: '', fundName: '', nav: '', type: 'Low Risk' });
            fetchAllFunds();
        }
    };

    if (!admin) return null;

    return (
        <div className="min-h-screen bg-slate-950 text-white font-sans selection:bg-emerald-500/30">
            {/* --- Navbar --- */}
            <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-slate-900 shadow-lg shadow-emerald-500/20">A</div>
                        <span className="font-bold tracking-tight">Admin Portal</span>
                    </div>
                    <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5 ml-4 shadow-inner">
                        <button onClick={() => setActiveTab('users')} className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>User Management</button>
                        <button onClick={() => setActiveTab('funds')} className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'funds' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}>Fund Management</button>
                    </div>
                </div>
                <div className="flex items-center gap-6">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Welcome, {admin.firstName}</span>
                    <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} className="text-xs font-black text-rose-500 hover:text-rose-400 transition-colors uppercase tracking-widest border border-rose-500/20 px-4 py-2 rounded-xl hover:bg-rose-500/5">Log Out</button>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto p-8">
                {activeTab === 'users' ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h1 className="text-4xl font-black mb-8 tracking-tighter flex items-center gap-4">
                            User Registry
                            <span className="text-xs font-bold bg-white/5 text-slate-500 px-3 py-1 rounded-full border border-white/5">{users.length} Total</span>
                        </h1>
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
                                    {users.map(user => (
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
                                                <div className="flex gap-2 justify-end">
                                                    <button onClick={() => handleManageUser(user)} className="bg-white text-slate-950 text-[10px] font-black px-5 py-2.5 rounded-xl uppercase tracking-widest hover:bg-emerald-400 transition-all active:scale-95 shadow-lg shadow-white/5">Manage</button>
                                                    <button onClick={() => handleUpdateStatus(user.id, 'ACTIVE')} className="bg-slate-800 text-white text-[10px] font-black px-4 py-2.5 rounded-xl uppercase border border-white/10 hover:bg-slate-700 transition-all">Active</button>
                                                    <button onClick={() => handleUpdateStatus(user.id, 'SUSPENDED')} className="bg-amber-500/5 text-amber-500 text-[10px] font-black px-4 py-2.5 rounded-xl uppercase border border-amber-500/20 hover:bg-amber-500/20">Suspend</button>
                                                    <button onClick={() => handleUpdateStatus(user.id, 'BANNED')} className="bg-rose-500/5 text-rose-500 text-[10px] font-black px-4 py-2.5 rounded-xl uppercase border border-rose-500/20 hover:bg-rose-500/20">Ban</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                ) : (
                    // --- Fund Management UI (High Contrast) ---
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 animate-in fade-in duration-700">
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
                                            <th className="p-8 text-right">Market NAV (Live)</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {funds.map(fund => (
                                            <tr key={fund.id} className="hover:bg-white/[0.01] transition-colors group">
                                                <td className="p-8">
                                                    <div className="flex items-center gap-5">
                                                        <div className="w-12 h-12 bg-slate-800 rounded-2xl flex items-center justify-center font-black text-emerald-400 border border-white/5 group-hover:border-emerald-500/30 transition-all uppercase">{fund.fundCode.slice(0, 2)}</div>
                                                        <div>
                                                            <div className="font-black text-white text-lg tracking-tight uppercase">{fund.fundCode}</div>
                                                            <div className="text-slate-400 font-bold text-xs uppercase tracking-tight">{fund.fundName}</div>
                                                            <div className={`text-[9px] mt-1.5 inline-block px-2.5 py-0.5 rounded-md font-black uppercase tracking-tighter ${fund.type === 'High Risk' ? 'bg-rose-500/10 text-rose-500 border border-rose-500/20' : fund.type === 'Medium Risk' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}> {fund.type} </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-8 text-right font-mono">
                                                    <div className="text-3xl font-black text-white tracking-tighter tabular-nums group-hover:text-emerald-400 transition-colors">{fund.nav.toFixed(4)}</div>
                                                    <div className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mt-1">THB / Unit</div>
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
                    <div className="bg-slate-900 border border-white/10 rounded-[3rem] p-10 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="text-3xl font-black tracking-tight text-white">Central Minting</h3>
                                <p className="text-slate-500 font-bold text-sm mt-1 uppercase tracking-widest">Issuing currency for {selectedUser.firstName}</p>
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
                                        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-28 bg-slate-800 border border-white/10 rounded-2xl px-4 py-3 text-white font-bold text-sm outline-none focus:border-emerald-500 transition-all" />
                                        <button onClick={() => mintMoney(account.id)} disabled={isMinting} className="bg-emerald-500 text-slate-950 font-black px-6 py-3 rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">Issue</button>
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