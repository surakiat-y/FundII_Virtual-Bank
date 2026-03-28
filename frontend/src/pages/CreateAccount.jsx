import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateAccount = () => {
    const navigate = useNavigate();

    // 1. สร้าง State เก็บข้อมูล
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        username: '',
        password: ''
    });
    const [errorMsg, setErrorMsg] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 2. ฟังก์ชันอัปเดตค่าเมื่อพิมพ์
    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    // 3. ฟังก์ชันตอนกด Submit
    const handleRegister = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        setIsSubmitting(true);

        try {
            const response = await fetch('http://localhost:8080/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                // เราส่งแค่ firstName, lastName, username, password ไปตามที่ Backend ต้องการ
                body: JSON.stringify(formData)
            });

            const data = await response.json();

            if (response.ok) {
                alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
                navigate('/login'); // เด้งไปหน้า Login
            } else {
                setErrorMsg(data.error || 'ไม่สามารถสมัครสมาชิกได้');
            }
        } catch (error) {
            setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-gradient-to-tr from-emerald-100/40 via-white to-emerald-100/40 flex flex-col items-center justify-center p-6 sm:p-12 font-sans relative overflow-x-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-100/50 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

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
            </nav>

            <div className="w-full max-w-[800px] bg-white rounded-[40px] shadow-[0_48px_80px_-24px_rgba(0,0,0,0.08)] border border-slate-100 p-10 md:p-16 z-10 animate-in fade-in zoom-in-95 duration-700 my-10">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        Create Your <span className="text-emerald-700">Account</span>
                    </h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        It's time you managed your financial assets with our secure platform.
                    </p>
                </div>

                {errorMsg && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold text-center">
                        {errorMsg}
                    </div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">First Name</label>
                            <input 
                                type="text" 
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleChange}
                                required
                                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
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
                                className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
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
                            className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
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
                            className="w-full bg-slate-50/50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                        />
                    </div>

                    <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full bg-[#065f46] hover:bg-[#054634] active:scale-[0.98] text-white py-5 px-10 text-lg font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(6,95,70,0.3)] transition-all duration-300 transform hover:-translate-y-1 mt-4 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                    >
                        {isSubmitting ? 'Creating...' : 'Create Account'}
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
        </div>
    );
};

export default CreateAccount;