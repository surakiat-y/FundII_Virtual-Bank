import React from 'react';
import BrandingBadge from './BrandingBadge';

const BankingLayout = ({ children }) => {
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
            <div className="w-full lg:w-1/2 h-full flex flex-col relative">
                {/* Top Navigation / Branding */}
                <nav className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center z-20">
                    <div className="flex items-center gap-3">
                        <BrandingBadge />
                    </div>
                </nav>

                {/* Center Content Section */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-20 lg:px-24 pt-24 md:pt-32">
                    {children}
                </div>

                {/* Footer Navigation */}
                <footer className="p-8 mt-auto flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <span>© 2026 NEXT-GEN PROJECT. ALL RIGHTS RESERVED.</span>
                    <div className="flex gap-6">
                        <span className="hover:text-emerald-700 transition-colors cursor-pointer">Support</span>
                        <span className="hover:text-emerald-700 transition-colors cursor-pointer">Privacy</span>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default BankingLayout;
