import React from 'react';

const StatusNotification = ({ isOpen, onClose, status }) => {
    if (!isOpen) return null;

    const isSuspended = status === 'SUSPENDED';
    const isBanned = status === 'BANNED' || status === 'BAN';

    // Settings for SUSPENDED
    const suspendedConfig = {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        ),
        iconBg: "bg-orange-50 ring-orange-50/50",
        title: "Account Suspended",
        subtitle: "Your account has been temporarily suspended.",
        reason: "Unusual financial activity has been detected. Please contact support to verify your identity and unlock your account.",
        restrictions: [
            "Cannot transfer money to other accounts.",
            "Cannot withdraw cash from pockets.",
            "Cannot perform investment or trading activities."
        ],
        buttonText: "I Understand",
        buttonColor: "bg-slate-900"
    };

    // Settings for BANNED
    const bannedConfig = {
        icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
            </svg>
        ),
        iconBg: "bg-rose-50 ring-rose-50/50",
        title: "Account Banned",
        subtitle: "Your access has been permanently revoked.",
        reason: "A serious violation of our terms and conditions has been detected. This decision is final and non-reversible.",
        restrictions: [
            "All banking services are permanently disabled.",
            "All funds and assets are frozen pending legal review.",
            "Access to this portal will be restricted upon logout."
        ],
        buttonText: "Close",
        buttonColor: "bg-rose-600"
    };

    const config = isSuspended ? suspendedConfig : (isBanned ? bannedConfig : null);
    if (!config) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300"
                onClick={onClose}
            ></div>

            <div className="bg-white rounded-[3rem] p-10 max-w-lg w-full relative z-[101] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] animate-in zoom-in-95 fade-in duration-300 text-center font-sans">
                {/* Big Status Icon */}
                <div className={`w-24 h-24 ${config.iconBg} rounded-full flex items-center justify-center mx-auto mb-8 ring-8`}>
                    {config.icon}
                </div>

                <h2 className="text-3xl font-black text-slate-900 mb-2 font-display">{config.title}</h2>
                <p className="text-slate-500 font-bold mb-8">{config.subtitle}</p>

                <div className="bg-slate-50 rounded-2xl p-6 text-left mb-8 space-y-4 border border-slate-100">
                    <div className="flex gap-3">
                        <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-[10px] font-black shrink-0">?</div>
                        <div>
                            <p className="font-black text-[11px] uppercase tracking-widest text-slate-400 mb-1">Reason</p>
                            <p className="text-slate-600 text-sm leading-relaxed">{config.reason}</p>
                        </div>
                    </div>

                    <div className="h-px bg-slate-200/50"></div>

                    <div className="flex gap-3">
                        <div className={`w-6 h-6 rounded-full ${isSuspended ? 'bg-orange-100 text-orange-500' : 'bg-rose-100 text-rose-500'} flex items-center justify-center text-[10px] font-black shrink-0`}>!</div>
                        <div>
                            <p className={`font-black text-[11px] uppercase tracking-widest ${isSuspended ? 'text-orange-400' : 'text-rose-400'} mb-2`}>Account Restrictions</p>
                            <ul className="space-y-2 text-sm text-slate-600 font-bold">
                                {config.restrictions.map((text, i) => (
                                    <li key={i} className="flex items-center gap-2">
                                        <span className={`w-1.5 h-1.5 ${isSuspended ? 'bg-orange-500' : 'bg-rose-500'} rounded-full`}></span>
                                        {text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </div>

                <button
                    onClick={onClose}
                    className={`w-full py-4 ${config.buttonColor} text-white rounded-2xl font-black uppercase tracking-widest hover:brightness-110 transition-all active:scale-[0.98] shadow-xl shadow-slate-900/10`}
                >
                    {config.buttonText}
                </button>
            </div>
        </div>
    );
};

export default StatusNotification;
