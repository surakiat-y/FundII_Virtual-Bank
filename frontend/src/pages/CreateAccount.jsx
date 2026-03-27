import React from 'react';
import { useNavigate } from 'react-router-dom';

const CreateAccount = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen w-full bg-gradient-to-tr from-emerald-100/40 via-white to-emerald-100/40 flex flex-col items-center justify-center p-6 sm:p-12 font-sans relative overflow-x-hidden">
            {/* Soft Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            {/* Top Navigation */}
            <nav className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center max-w-7xl mx-auto w-full z-20">
                <button 
                    onClick={() => navigate('/')}
                    className="group flex items-center gap-2 text-slate-400 hover:text-emerald-700 transition-all font-bold text-[10px] uppercase tracking-widest bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full border border-slate-100 hover:border-emerald-100 shadow-sm"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Welcome
                </button>
                <div className="flex items-center gap-3 px-6 py-3 rounded-full bg-white/80 backdrop-blur-sm border border-emerald-50 shadow-sm">
                    <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    <span className="text-emerald-700 font-black text-[11px] uppercase tracking-widest">Next-Gen Virtual Banking</span>
                </div>
            </nav>

            {/* Main Content Card */}
            <div className="w-full max-w-[800px] bg-white rounded-[40px] shadow-[0_48px_80px_-24px_rgba(0,0,0,0.08)] border border-slate-100 p-10 md:p-16 z-10 animate-in fade-in zoom-in-95 duration-700 my-10">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        Create Your <span className="text-emerald-700">Account</span>
                    </h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        It's time you managed your financial assets with our secure platform.
                    </p>
                </div>

                <form className="flex flex-col gap-5">
                    {/* First & Last Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">First Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Last Name</label>
                            <input 
                                type="text" 
                                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                            />
                        </div>
                    </div>

                    {/* DOB & Phone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Date of Birth</label>
                            <input 
                                type="date" 
                                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Phone Number</label>
                            <input 
                                type="tel" 
                                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                            />
                        </div>
                    </div>

                    {/* Username Row */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Username</label>
                        <input 
                            type="text" 
                            className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                        />
                    </div>

                    {/* Password Row */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Password</label>
                        <input 
                            type="password" 
                            className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                        />
                    </div>

                    {/* Terms Checklist */}
                    <div className="flex items-center gap-3 mt-1 px-1">
                        <input 
                            type="checkbox" 
                            id="terms"
                            className="w-5 h-5 rounded-lg border-2 border-slate-200 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                        />
                        <label htmlFor="terms" className="text-xs font-bold text-slate-500 select-none cursor-pointer hover:text-slate-700 transition-colors uppercase tracking-wider">
                            I accept the <span className="text-emerald-700 hover:underline">Terms and Conditions</span>
                        </label>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        className="w-full bg-[#065f46] hover:bg-[#054634] active:scale-[0.98] text-white py-5 px-10 text-lg font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(6,95,70,0.3)] transition-all duration-300 transform hover:-translate-y-1 mt-4"
                    >
                        Create Account
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        Already have an account? {' '}
                        <button 
                            onClick={() => navigate('/login')}
                            className="text-emerald-700 font-bold hover:underline underline-offset-4 transition-all"
                        >
                            Sign In
                        </button>
                    </p>
                </div>
            </div>

            {/* Simple Footer */}
            <footer className="mt-auto py-8 text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">
                <span>© 2026 NEXT-GEN PROJECT. ALL RIGHTS RESERVED.</span>
            </footer>
        </div>
    );
};

export default CreateAccount;
