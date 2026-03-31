import React, { useState } from 'react';

const NavbarAdmin = ({ admin, activeTab, setActiveTab, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);

    if (!admin) return null;

    return (
        <nav className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex justify-between items-center sticky top-0 z-40 transition-all duration-300">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 font-display">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center font-black text-slate-900 shadow-lg shadow-emerald-500/20">A</div>
                    <span className="font-bold tracking-tight text-white">Admin Portal</span>
                </div>
                <div className="flex bg-slate-800/50 p-1 rounded-xl border border-white/5 ml-4 shadow-inner">
                    <button
                        onClick={() => setActiveTab('users')}
                        className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'users' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        User Management
                    </button>
                    <button
                        onClick={() => setActiveTab('funds')}
                        className={`px-5 py-2 rounded-lg text-xs font-black transition-all ${activeTab === 'funds' ? 'bg-emerald-500 text-slate-950 shadow-lg' : 'text-slate-400 hover:text-white'}`}
                    >
                        Fund Management
                    </button>
                </div>
            </div>

            <div className="flex items-center gap-4">
                <button
                    onClick={onLogout}
                    className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800/80 text-rose-400 border border-rose-500/20 hover:bg-rose-500/10 hover:border-rose-500/40 hover:text-rose-500 transition-all duration-300 shadow-lg shadow-rose-900/10 active:scale-95"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-[10px] font-black uppercase tracking-widest">Logout</span>
                </button>
            </div>
        </nav>
    );
};

export default NavbarAdmin;
