import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import StatusNotification from './StatusNotification';

const NavbarUser = ({ user, onLogout }) => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const location = useLocation();

    const handleLogout = () => {
        setIsLoggingOut(true);
        setTimeout(() => {
            onLogout();
        }, 800);
    };

    if (!user) return null;

    const status = user.status?.toUpperCase() || 'ACTIVE';

    const renderStatusBadge = () => {
        if (status === 'SUSPENDED') {
            return (
                <button
                    onClick={() => setIsStatusModalOpen(true)}
                    className="w-fit flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-50 border border-orange-100 text-orange-600 font-black text-[9px] uppercase tracking-wider mt-0.5 animate-in fade-in zoom-in-95 duration-300 hover:bg-orange-100 transition-colors group cursor-pointer"
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
                    className="w-fit flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-100 text-rose-500 font-black text-[9px] uppercase tracking-wider mt-0.5 animate-in fade-in zoom-in-95 duration-300 hover:bg-rose-100 transition-colors group cursor-pointer"
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
        {
            label: 'Portal', path: '/portal', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
            )
        },
        {
            label: 'Pockets', path: '/your-pocket', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
            )
        },
        {
            label: 'Investment', path: '/investment', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
            )
        },
        {
            label: 'Statement', path: '/statement', icon: (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
            )
        },
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
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[9.5px] font-black uppercase tracking-[0.15em] transition-all duration-300 ${isActive
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
                    <button 
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                        className={`p-2.5 rounded-xl bg-rose-50 text-rose-500 border border-rose-100 hover:bg-rose-100 hover:text-rose-600 transition-all duration-300 active:scale-90 shadow-sm group ${isLoggingOut ? 'opacity-50 cursor-wait' : ''}`}
                        title="Log Out"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                    </button>
                </div>

                {isLoggingOut && (
                    <div className="fixed inset-0 z-[999] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
                        <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin shadow-xl shadow-emerald-500/20"></div>
                    </div>
                )}
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
