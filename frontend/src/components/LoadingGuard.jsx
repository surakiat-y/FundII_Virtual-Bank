import React from 'react';
import StatusNotification from './StatusNotification';

const LoadingGuard = ({ 
    isLoading, 
    user, 
    isStatusModalOpen, 
    onCloseModal, 
    message = "Verifying Account Security...",
    theme = "dark",
    children 
}) => {
    const isBanned = user?.status === 'BANNED' || user?.status === 'BAN';
    const showGuard = isLoading || !user || isBanned;

    if (showGuard) {
        if (isBanned && !isLoading) {
            return (
                <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <StatusNotification 
                        isOpen={isStatusModalOpen} 
                        onClose={onCloseModal} 
                        status={user?.status} 
                    />
                </div>
            );
        }

        return (
            <div className="fixed inset-0 z-[999] bg-slate-50 flex items-center justify-center">
                <div className="w-12 h-12 border-4 border-emerald-400 border-t-transparent rounded-full animate-spin shadow-sm shadow-emerald-500/10"></div>
                
                <StatusNotification 
                    isOpen={isStatusModalOpen} 
                    onClose={onCloseModal} 
                    status={user?.status} 
                />
            </div>
        );
    }

    return children;
};

export default LoadingGuard;
