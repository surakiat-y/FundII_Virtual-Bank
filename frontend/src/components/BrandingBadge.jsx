import React from 'react';

const BrandingBadge = ({ className = "" }) => {
    return (
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm shadow-emerald-900/5 ${className}`}>
            <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-700 font-black text-[10px] uppercase tracking-widest">
                Next-Gen Virtual Banking
            </span>
        </div>
    );
};

export default BrandingBadge;
