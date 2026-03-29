import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StatusNotification from './StatusNotification';

const NavbarUser = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const location = useLocation();
    
    if (!user) return null;

    const status = user.status?.toUpperCase() || 'ACTIVE';

    const renderStatusBadge = () => {
        if (status === 'SUSPENDED') {
            return (
                <button 
                    onClick={() => setIsStatusModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 font-black text-[9px] uppercase tracking-wider mt-0.5 animate-in fade-in zoom-in-95 duration-300 hover:bg-orange-100 transition-colors group cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    suspended
                </button>
            );
        }
        if (status === 'BANNED' || status === 'BAN') {
            return (
                <button 
                    onClick={() => setIsStatusModalOpen(true)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 font-black text-[9px] uppercase tracking-wider mt-0.5 animate-in fade-in zoom-in-95 duration-300 hover:bg-rose-100 transition-colors group cursor-pointer"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    banned
                </button>
            );
        }
        return null;
    };
    
    const handleCloseModal = () => {
        setIsStatusModalOpen(false);
        if (status === 'BANNED' || status === 'BAN') {
            onLogout();
        }
    };

    const navItems = [
        { label: 'Portal', path: '/portal', icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
        )},
        { label: 'Pockets', path: '/your-pocket', icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
        )},
        { label: 'Investment', path: '/investment', icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
        )},
        { label: 'Statement', path: '/statement', icon: (
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 17v-2m3 2v-4m3 2v-6m-8-5h11a2 2 0 012 2v11a2 2 0 01-2 2H7a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
        )},
    ];

    return (
        <nav className="bg-white border-b border-slate-100 px-8 py-4 flex justify-between items-center sticky top-0 z-40 shadow-sm transition-all duration-300 font-sans">
            <div className="flex items-center gap-4">
                <div className="relative">
                    <div className="w-11 h-11 rounded-full bg-emerald-500 text-white flex items-center justify-center font-black shadow-lg shadow-emerald-500/20 text-lg ring-2 ring-white ring-offset-2 transition-transform hover:scale-105">
                        {user.firstName?.charAt(0)}
                    </div>
                    {status === 'ACTIVE' && (
                        <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full"></span>
                    )}
                </div>
                <div className="flex flex-col justify-center min-h-[44px]">
                    <div className="text-slate-900 font-black tracking-tight leading-none text-base font-display">{user.firstName} {user.lastName}</div>
                    {renderStatusBadge()}
                </div>
            </div>

            <div className="flex items-center gap-6">
                {/* Repositioned Right-Aligned Navigation */}
                <div className="hidden lg:flex items-center gap-1 bg-slate-50/50 p-1 rounded-2xl border border-slate-100/50">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${
                                    isActive 
                                    ? 'bg-white text-[#065f46] shadow-sm border border-slate-100 scale-[1.02]' 
                                    : 'text-slate-400 hover:text-slate-600 hover:bg-white/40'
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
                
                <div className="flex items-center gap-3 border-l border-slate-100 pl-6 ml-2">
                    <div className="relative group">
                        <button 
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className={`p-2.5 rounded-xl transition-all duration-300 border ${
                                isMenuOpen 
                                ? 'bg-[#065f46] border-emerald-800 text-white shadow-lg shadow-emerald-900/20 scale-105' 
                                : 'bg-white border-transparent text-slate-400 hover:bg-slate-50 hover:text-slate-600 hover:border-slate-100'
                            }`}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transform transition-transform duration-500 ${isMenuOpen ? 'rotate-90' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </button>

                        {isMenuOpen && (
                            <>
                                <div 
                                    className="fixed inset-0 z-40 bg-transparent" 
                                    onClick={() => setIsMenuOpen(false)}
                                ></div>
                                <div className="absolute right-0 mt-3 w-56 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_20px_50px_-15px_rgba(0,0,0,0.1)] py-3 z-50 animate-in fade-in zoom-in-95 duration-200">
                                    <div className="px-5 py-2 border-b border-slate-50 mb-2">
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Account Settings</p>
                                    </div>
                                    
                                    <button className="w-full px-5 py-3 flex items-center gap-3 text-slate-500 hover:bg-slate-50 transition-colors font-black text-[10px] uppercase tracking-widest text-left">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                        </svg>
                                        My Profile
                                    </button>

                                    <button className="w-full px-5 py-3 flex items-center gap-3 text-slate-500 hover:bg-slate-50 transition-colors font-black text-[10px] uppercase tracking-widest text-left">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                        Security
                                    </button>

                                    <div className="h-px bg-slate-50 my-2"></div>

                                    <button 
                                        onClick={() => { setIsMenuOpen(false); onLogout(); }}
                                        className="w-full px-5 py-3 flex items-center gap-3 text-rose-500 hover:bg-rose-50 transition-colors font-black text-[10px] uppercase tracking-[0.1em] text-left"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Log Out
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>

            <StatusNotification 
                isOpen={isStatusModalOpen} 
                onClose={handleCloseModal} 
                status={status} 
            />
        </nav>
    );
};

export default NavbarUser;
