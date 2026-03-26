import React from 'react';

const Welcome = () => {
    return (
        <div className="h-screen w-full flex overflow-hidden font-sans bg-white">
            {/* ─── Left Half: Hero Image ─── */}
            <div className="hidden lg:flex lg:w-1/2 relative h-full overflow-hidden">
                <img
                    src="/src/assets/360_F_726353843_TvCgHjg5p2wJG5gR3B5kZzVp6ZO6m8he.jpg"
                    alt="Financial Management"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 hover:scale-105"
                />
                {/* Premium Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#064e3b]/40 to-transparent"></div>

                {/* Floating Content on Image (Optional/Subtle) */}
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
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100 shadow-sm shadow-emerald-900/5">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                            </span>
                            <span className="text-emerald-700 font-black text-[11px] uppercase tracking-widest">
                                Next-Gen Virtual Banking
                            </span>
                        </div>
                    </div>
                    <div className="hidden sm:flex gap-6 text-sm font-semibold text-slate-500 uppercase tracking-widest">
                        <a href="#" className="hover:text-emerald-600 transition-colors">About</a>
                        <a href="#" className="hover:text-emerald-600 transition-colors">Security</a>
                    </div>
                </nav>

                {/* Center Content Section */}
                <div className="flex-1 flex flex-col items-center justify-center px-8 md:px-20 lg:px-24">
                    <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-right-10 duration-700">

                        <div className="mb-12">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-100 mb-6">
                                <span className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                                    Secure & Intelligent Platform
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 tracking-tight leading-[1.1]">
                                Elevate Your <br />
                                <span className="text-emerald-700">Financial Assets</span>
                            </h1>

                            <p className="text-slate-500 text-lg leading-relaxed max-w-md">
                                Experience a seamless fusion of security and innovation.
                                Manage your virtual assets with tools designed for the modern era.
                            </p>
                        </div>

                        {/* Action Area */}
                        <div className="flex flex-col gap-4 w-full">
                            <button className="w-full bg-[#065f46] hover:bg-[#054634] active:scale-[0.98] text-white py-5 px-10 text-lg font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(6,95,70,0.3)] transition-all duration-300 transform hover:-translate-y-1">
                                Create New Account
                            </button>

                            <button className="w-full bg-transparent hover:bg-slate-50 active:scale-[0.98] text-slate-700 py-5 px-10 text-lg font-bold rounded-2xl border-2 border-slate-100 hover:border-slate-200 transition-all duration-300">
                                Log In to Your Portal
                            </button>
                        </div>

                        {/* Trust Badges */}
                        <div className="mt-16 flex items-center justify-between opacity-50 grayscale hover:opacity-100 hover:grayscale-0 transition-all duration-500">
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Security Standard</span>
                                <span className="text-xs font-bold text-slate-900">AES-256 BIT ENCRYPTION</span>
                            </div>
                            <div className="h-8 w-px bg-slate-200 mx-4"></div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Available</span>
                                <span className="text-xs font-bold text-slate-900">24/7 CLOUD BANKING</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Navigation */}
                <footer className="p-8 mt-auto flex justify-between items-center text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                    <span>© 2026 NEXT-GEN PROJECT. ALL RIGHTS RESERVED.</span>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-emerald-700 transition-colors">Support</a>
                        <a href="#" className="hover:text-emerald-700 transition-colors">Privacy</a>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default Welcome;