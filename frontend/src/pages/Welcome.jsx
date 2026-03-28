import React from 'react';
import { useNavigate } from 'react-router-dom';
import BankingLayout from '../components/BankingLayout';

const Welcome = () => {
    const navigate = useNavigate();
    return (
        <BankingLayout>
            <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="mb-12">
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
                    <button 
                        onClick={() => navigate('/create-account')}
                        className="w-full bg-[#065f46] hover:bg-[#054634] active:scale-[0.98] text-white py-5 px-10 text-lg font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(6,95,70,0.3)] transition-all duration-300 transform hover:-translate-y-1"
                    >
                        Create New Account
                    </button>

                    <button 
                        onClick={() => navigate('/login')}
                        className="w-full bg-transparent hover:bg-slate-50 active:scale-[0.98] text-slate-700 py-5 px-10 text-lg font-bold rounded-2xl border-2 border-slate-100 hover:border-slate-200 transition-all duration-300"
                    >
                        Log In to Your Portal
                    </button>
                </div>
            </div>
        </BankingLayout>
    );
};

export default Welcome;