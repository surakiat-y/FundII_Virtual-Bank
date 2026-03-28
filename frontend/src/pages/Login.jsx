import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BankingLayout from '../components/BankingLayout';

const Login = () => {
    const navigate = useNavigate();
    
    // 1. สร้าง State เก็บค่า Username, Password และ Error
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');

    // 2. ฟังก์ชันตอนกดปุ่ม Sign In
    const handleLogin = async (e) => {
        e.preventDefault(); // ป้องกันหน้าเว็บ Refresh
        setErrorMsg(''); // ล้าง Error เก่า

        try {
            const response = await fetch('http://localhost:8080/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const data = await response.json();

            if (response.ok) {
                // ถ้า Login ผ่าน ให้เก็บข้อมูลลง LocalStorage เครื่องผู้ใช้
                localStorage.setItem('user', JSON.stringify(data));
                
                // เช็ค Role ว่าเป็น Admin หรือ User ธรรมดา
                if (data.role === 'ADMIN') {
                    alert('ยินดีต้อนรับ Admin!');
                    navigate('/admin-dashboard');
                } else {
                    alert('เข้าสู่ระบบสำเร็จ!');
                    navigate('/dashboard');
                }
            } else {
                // ถ้า Login ไม่ผ่าน โชว์ Error จาก Backend
                setErrorMsg(data.error || 'Login failed');
            }
        } catch (error) {
            setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        }
    };

    return (
        <BankingLayout>
            <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="mb-10">
                    <button
                        onClick={() => navigate('/')}
                        className="group mb-8 flex items-center gap-2 text-slate-400 hover:text-emerald-700 transition-colors font-bold text-[10px] uppercase tracking-widest"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 transform group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
                        </svg>
                        Back
                    </button>

                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Please enter your details to access your secure banking portal.
                    </p>
                </div>

                {/* โชว์ Error สีแดง ถ้า Login ไม่ผ่าน */}
                {errorMsg && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-5" autoComplete="off">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Username</label>
                        <input
                            type="text"
                            value={username}
                             onChange={(e) => setUsername(e.target.value)}
                            required
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Password</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
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
                        <span onClick={() => navigate('/create-account')} className="text-emerald-700 font-bold hover:underline underline-offset-4 cursor-pointer">Create one now</span>
                    </p>
                </div>
            </div>
        </BankingLayout>
    );
};

export default Login;