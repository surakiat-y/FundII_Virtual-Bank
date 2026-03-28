import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BankingLayout from '../components/BankingLayout';

const SignUp = () => {
    const navigate = useNavigate();
    
    // Form States
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        confirmPassword: '',
        firstName: '',
        lastName: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        // Basic Validation
        if (formData.password !== formData.confirmPassword) {
            setErrorMsg('พาสเวิร์ดไม่ตรงกัน กรุณาตรวจสอบอีกครั้ง');
            return;
        }

        setIsSubmitting(true);
        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    username: formData.username,
                    password: formData.password,
                    firstName: formData.firstName,
                    lastName: formData.lastName
                })
            });

            const data = await response.json();

            if (response.ok) {
                alert(data.message || 'สมัครสมาชิกสำเร็จ!');
                navigate('/login');
            } else {
                setErrorMsg(data.error || 'การสมัครสมาชิกล้มเหลว');
            }
        } catch (error) {
            setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <BankingLayout>
            <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="mb-8">
                    <button
                        onClick={() => navigate('/')}
                        className="group mb-6 flex items-center gap-2 text-slate-400 hover:text-emerald-700 transition-colors font-bold text-[10px] uppercase tracking-widest"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    <h2 className="text-4xl font-black text-slate-900 mb-3 tracking-tight">
                        Create Account
                    </h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Join our digital banking platform in just a few simple steps.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium animate-in fade-in zoom-in-95 duration-300">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-4" autoComplete="off">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full bg-[#065f46] hover:bg-[#054634] disabled:bg-slate-300 active:scale-[0.98] text-white py-5 px-10 text-lg font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(6,95,70,0.3)] transition-all duration-300 transform hover:-translate-y-1 mt-4 flex justify-center items-center"
                    >
                        {isSubmitting ? (
                            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                        ) : 'Create Account'}
                    </button>
                </form>

                <div className="mt-8 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        Already have an account? {' '}
                        <span onClick={() => navigate('/login')} className="text-emerald-700 font-bold hover:underline underline-offset-4 cursor-pointer transition-all">Sign In</span>
                    </p>
                </div>
            </div>
        </BankingLayout>
    );
};

export default SignUp;
