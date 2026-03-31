import React, { useState } from 'react';

const CreateFunction = ({ isOpen, onClose, name, accountNumber }) => {
    const [isAccountVisible, setIsAccountVisible] = useState(false);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
            <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-[201] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] animate-in zoom-in-95 fade-in duration-300 text-center font-sans">
                {/* Status Icon */}
                <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50">
                    <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                    </svg>
                </div>

                <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Pocket Created!</h3>
                <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                    Your new sub-pocket has been set up and is ready for your savings goals!
                </p>

                {/* Account Info Box */}
                <div className="bg-slate-50 rounded-[2rem] p-8 mb-10 border-2 border-slate-100 relative group overflow-hidden">
                    {/* Decorative Background */}
                    <div className="absolute top-0 right-0 p-4 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
                        <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                    </div>

                    <div className="mb-6 relative z-10 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pocket Name</p>
                        <p className="text-xl font-black text-slate-800 tracking-tight">{name}</p>
                    </div>

                    <div className="h-px bg-slate-200/50 mb-6 mx-4"></div>

                    <div className="relative z-10 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Pocket Account Number</p>
                        <div className="flex items-center justify-center gap-3">
                            <p className="text-2xl font-black text-emerald-600 tracking-tighter font-mono">
                                {isAccountVisible
                                    ? accountNumber
                                    : `*******${String(accountNumber || '').slice(-3)}`
                                }
                            </p>
                            <button
                                onClick={() => setIsAccountVisible(!isAccountVisible)}
                                className="text-slate-300 hover:text-emerald-600 transition-colors p-1.5 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90"
                            >
                                {isAccountVisible ? (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                ) : (
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                )}
                            </button>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className="w-full py-5 bg-[#065f46] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:brightness-110 transition-all active:scale-[0.98]"
                >
                    Great!
                </button>
            </div>
        </div>
    );
};

export default CreateFunction;
