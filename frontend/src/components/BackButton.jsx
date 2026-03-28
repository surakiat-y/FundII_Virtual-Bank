import React from 'react';
import { useNavigate } from 'react-router-dom';

const BackButton = ({ to = '/', className = '' }) => {
    const navigate = useNavigate();

    return (
        <button
            onClick={() => navigate(to)}
            className={`group flex items-center gap-2 text-slate-400 hover:text-emerald-700 transition-all font-bold text-[10px] uppercase tracking-widest bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-100 hover:border-emerald-100 shadow-sm ${className}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
            Back
        </button>
    );
};

export default BackButton;
