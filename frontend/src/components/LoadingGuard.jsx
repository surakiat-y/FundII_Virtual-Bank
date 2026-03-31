import React from 'react';
import StatusNotification from './StatusNotification';

const LoadingGuard = ({ 
    isLoading, 
    user, 
    isStatusModalOpen, 
    onCloseModal, 
    message = "Verifying Account Security...",
    theme = "light",
    children 
}) => {
    const isBanned = user?.status === 'BANNED' || user?.status === 'BAN';
    const isSuspended = user?.status === 'SUSPENDED';

    // 1. Initial Loading (No user data yet)
    if (isLoading && !user) {
        return (
            <div className={`fixed inset-0 z-[999] ${theme === 'dark' ? 'bg-slate-900' : 'bg-slate-50'} flex items-center justify-center`}>
                <div className="flex flex-col items-center gap-6">
                    <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin shadow-sm shadow-emerald-500/10"></div>
                    <p className={`text-[10px] font-black uppercase tracking-[0.3em] ${theme === 'dark' ? 'text-emerald-100/40' : 'text-slate-400'}`}>
                        {message}
                    </p>
                </div>
            </div>
        );
    }

    // 2. BANNED Security Block (Total Block - No Children)
    if (isBanned && !isLoading) {
        return (
            <StatusNotification 
                isOpen={true} 
                onClose={onCloseModal} 
                status={user?.status} 
            />
        );
    }

    // 3. Normal / Suspended Flow (Allow Shell, show overlay if requested)
    // 🔥 Fix: Only show the overlay modal if we are NOT in the BANNED state to prevent double-up
    return (
        <>
            {children}
            {(isStatusModalOpen && !isBanned) && (
                <StatusNotification 
                    isOpen={true} 
                    onClose={onCloseModal} 
                    status={user?.status} 
                />
            )}
        </>
    );
};

export default LoadingGuard;
