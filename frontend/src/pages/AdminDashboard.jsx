import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [admin, setAdmin] = useState(null);
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [userAccounts, setUserAccounts] = useState([]);
    const [amount, setAmount] = useState('');
    const [isMinting, setIsMinting] = useState(false);

    const fetchAllUsers = () => {
        fetch('http://localhost:8080/api/admin/users')
            .then(res => res.json())
            .then(data => setUsers(data.filter(u => u.role === 'USER')))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        const loggedInUser = localStorage.getItem('user');
        if (!loggedInUser) { navigate('/login'); return; }
        const userData = JSON.parse(loggedInUser);
        if (userData.role !== 'ADMIN') { navigate('/dashboard'); return; }
        setAdmin(userData);
        fetchAllUsers();
    }, [navigate]);

    // 🔥 ฟังก์ชันอัปเดตสถานะ (Active / Suspend / Ban)
    const handleUpdateStatus = async (userId, newStatus) => {
        if (!window.confirm(`ยืนยันการเปลี่ยนสถานะเป็น ${newStatus}?`)) return;
        try {
            await fetch(`http://localhost:8080/api/admin/user/${userId}/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus })
            });
            fetchAllUsers();
        } catch (error) { console.error(error); }
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
        try {
            const response = await fetch('http://localhost:8080/api/admin/mint-money', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ accountId: accountId, amount: Number(amount) })
            });
            if (response.ok) {
                alert("เติมเงินสำเร็จ!");
                setAmount('');
                handleManageUser(selectedUser);
            }
        } catch (error) { console.error(error); } finally { setIsMinting(false); }
    };

    if (!admin) return null;

    return (
        <div className="min-h-screen bg-slate-900 text-white font-sans selection:bg-emerald-500/30">
            <nav className="bg-slate-900/80 backdrop-blur-md border-b border-slate-800 px-8 py-4 flex justify-between items-center sticky top-0 z-40">
                <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-emerald-500 flex items-center justify-center font-black">A</div>
                    <span className="font-bold">Admin Portal</span>
                </div>
                <button onClick={() => { localStorage.removeItem('user'); navigate('/login'); }} className="text-xs font-bold text-slate-400">Log Out</button>
            </nav>

            <main className="max-w-6xl mx-auto p-8">
                <h1 className="text-3xl font-black mb-8 tracking-tight">User Management</h1>
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-slate-800/80 text-[10px] uppercase tracking-widest text-slate-400 border-b border-slate-700/50">
                                <th className="p-6">User ID</th>
                                <th className="p-6">Name</th>
                                <th className="p-6">Status</th>
                                <th className="p-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="text-sm">
                            {users.map(user => (
                                <tr key={user.id} className="border-b border-slate-700/20 hover:bg-slate-700/20 transition-colors">
                                    <td className="p-6 font-mono text-slate-500 text-xs">#{user.id}</td>
                                    <td className="p-6 font-bold">{user.firstName} {user.lastName} <span className="block text-slate-500 font-normal text-xs">@{user.username}</span></td>
                                    <td className="p-6">
                                        <span className={`text-[9px] font-black uppercase px-3 py-1.5 rounded-full border ${
                                            user.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                            user.status === 'SUSPENDED' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                                            'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        }`}>
                                            {user.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right flex gap-2 justify-end">
                                        <button onClick={() => handleManageUser(user)} className="bg-emerald-500 text-slate-900 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase">Manage</button>
                                        <button onClick={() => handleUpdateStatus(user.id, 'ACTIVE')} className="bg-slate-700 text-white text-[10px] font-black px-3 py-1.5 rounded-lg uppercase border border-slate-600">Active</button>
                                        <button onClick={() => handleUpdateStatus(user.id, 'SUSPENDED')} className="bg-amber-500/20 text-amber-500 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase border border-amber-500/20">Suspend</button>
                                        <button onClick={() => handleUpdateStatus(user.id, 'BANNED')} className="bg-rose-500/20 text-rose-500 text-[10px] font-black px-3 py-1.5 rounded-lg uppercase border border-rose-500/20">Ban</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </main>

            {/* Modal Manage Funds (คงเดิม) */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-slate-800 border border-slate-700 rounded-3xl p-8 w-full max-w-2xl shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <h3 className="text-2xl font-black">Mint Money</h3>
                            <button onClick={() => setSelectedUser(null)} className="text-slate-500">✕</button>
                        </div>
                        <div className="space-y-4 mb-8 max-h-[40vh] overflow-y-auto">
                            {userAccounts.map(account => (
                                <div key={account.id} className="bg-slate-900/50 border border-slate-700/50 rounded-2xl p-5 flex justify-between items-center">
                                    <div>
                                        <p className="text-white font-bold text-sm">{account.accountName}</p>
                                        <p className="text-emerald-400 font-bold text-xl">฿{account.balance.toLocaleString()}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <input type="number" placeholder="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-24 bg-slate-800 border border-slate-600 rounded-xl px-3 py-2 text-white text-sm" />
                                        <button onClick={() => mintMoney(account.id)} disabled={isMinting} className="bg-emerald-500 text-slate-900 font-bold px-4 py-2 rounded-xl text-xs uppercase">Top Up</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button onClick={() => setSelectedUser(null)} className="w-full py-4 rounded-xl font-bold bg-slate-700 text-slate-300">Close</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;