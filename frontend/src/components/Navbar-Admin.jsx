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

            <div className="flex items-center gap-6">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest hidden md:block">Welcome, {admin.firstName}</span>

                <div className="relative">
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`p-2.5 rounded-xl transition-all duration-300 border ${isOpen
                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                                : 'bg-transparent border-white/5 text-slate-400 hover:bg-white/5 hover:text-white hover:border-white/10'
                            }`}
                        aria-label="Admin Settings"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-500 ${isOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                    </button>

                    {isOpen && (
                        <>
                            {/* Backdrop to close click outside */}
                            <div className="fixed inset-0 z-40 bg-transparent" onClick={() => setIsOpen(false)}></div>

                            <div className="absolute right-0 mt-3 w-56 bg-slate-900 border border-white/10 rounded-[1.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-5 py-2 border-b border-white/5 mb-2">
                                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Admin Actions</p>
                                </div>

                                <button
                                    onClick={() => { setIsOpen(false); onLogout(); }}
                                    className="w-full px-5 py-3 flex items-center gap-3 text-rose-500 hover:bg-rose-500/10 transition-colors font-black text-[11px] uppercase tracking-[0.1em] text-left"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default NavbarAdmin;
