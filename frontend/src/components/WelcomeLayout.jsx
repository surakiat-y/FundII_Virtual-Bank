import React from 'react';
import { Link } from 'react-router-dom';

const WelcomeLayout = ({ children }) => {
    return (
        <div className="h-screen w-full flex overflow-hidden font-sans bg-white">
            {/* ─── Left Half: Hero Image ─── */}
            <div className="hidden lg:flex lg:w-1/2 relative h-full overflow-hidden">
                <img
                    src="/src/assets/360_F_726353843_TvCgHjg5p2wJG5gR3B5kZzVp6ZO6m8he.jpg"
                    alt="Financial Management"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#064e3b]/40 to-transparent"></div>
                <div className="absolute bottom-12 left-12 z-10 animate-in fade-in slide-in-from-bottom-10 duration-1000">
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 p-6 rounded-2xl max-w-xs">
                        <p className="text-white/90 text-sm font-medium leading-relaxed">
                            "The best way to predict your future is to create it, one transaction at a time."
                        </p>
                    </div>
                </div>
            </div>

            {/* ─── Right Half: Main Content ─── */}
            <div className="w-full lg:w-1/2 h-full flex flex-col relative overflow-y-auto scroll-smooth">
                {/* Top Navigation / Branding */}
                <nav className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
                    <div className="flex items-center gap-3">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm shadow-emerald-900/5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-emerald-700 font-black text-[11px] uppercase tracking-[0.2em] font-display">
                                Next-Gen Virtual Banking
                            </span>
                        </div>
                    </div>
                </nav>

                {/* Center Content Section */}
                <div className="flex-1 flex flex-col items-center w-full px-8 md:px-20 lg:px-24 py-16 md:py-24">
                    <div className="w-full flex flex-col items-center justify-center min-h-full">
                        {children}
                    </div>
                </div>


            </div>
        </div>
    );
};

export default WelcomeLayout;
