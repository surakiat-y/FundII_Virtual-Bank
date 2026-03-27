import React from 'react';

const Login = ({ onBack }) => {
    return (
        <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-right-10 duration-700">
            <div className="mb-10">
                <button 
                    onClick={onBack}
                    className="group mb-8 flex items-center gap-2 text-slate-400 hover:text-emerald-700 transition-colors font-bold text-[10px] uppercase tracking-widest"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                    </svg>
                    Back to Welcome
                </button>

                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                    Welcome <span className="text-emerald-700">Back</span>
                </h2>
                <p className="text-slate-500 text-lg leading-relaxed">
                    Please enter your details to access your secure banking portal.
                </p>
            </div>

            <form className="flex flex-col gap-5">
                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Username</label>
                    <input 
                        type="text" 
                        placeholder="Enter your username"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                    />
                </div>

                <div className="flex flex-col gap-2">
                    <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Password</label>
                    <input 
                        type="password" 
                        placeholder="••••••••"
                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                    />
                </div>

                <div className="flex justify-end mt-1">
                    <a href="#" className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-wider transition-colors">
                        Forgot Password?
                    </a>
                </div>

                <button 
                    type="submit"
                    className="w-full bg-[#065f46] hover:bg-[#054634] active:scale-[0.98] text-white py-5 px-10 text-lg font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(6,95,70,0.3)] transition-all duration-300 transform hover:-translate-y-1 mt-4"
                >
                    Sign In to Portal
                </button>
            </form>

            <div className="mt-10 text-center">
                <p className="text-slate-400 text-sm font-medium">
                    Don't have an account? {' '}
                    <a href="#" className="text-emerald-700 font-bold hover:underline underline-offset-4">Create one now</a>
                </p>
            </div>
        </div>
    );
};

export default Login;
