import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import WelcomeLayout from '../components/WelcomeLayout';
import api from '../utils/axios';

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
    const [isPasswordFocused, setIsPasswordFocused] = useState(false);

    // Success Modal States
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [generatedAccount, setGeneratedAccount] = useState('');
    const [isAccountVisible, setIsAccountVisible] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        let cleanValue = value;

        if (name === 'firstName' || name === 'lastName') {
            // 🔥 ชื่อ-นามสกุล เฉพาะภาษาอังกฤษและ - เท่านั้น
            cleanValue = value.replace(/[^a-zA-Z-]/g, "");
        } else {
            // 🔥 ช่องอื่นๆ เป็นภาษาอังกฤษ/ตัวเลข/อักขระพิเศษ (ASCII)
            cleanValue = value.replace(/[^\x00-\x7F]/g, "");
        }

        setFormData(prev => ({ ...prev, [name]: cleanValue }));

        if (name === 'password') {
            validatePassword(cleanValue);
        }
    };

    const [passwordRequirements, setPasswordRequirements] = useState({
        length: false
    });

    const validatePassword = (pass) => {
        setPasswordRequirements({
            length: pass.length >= 8
        });
    };

    const isPasswordValid = Object.values(passwordRequirements).every(req => req);
    const passwordsMatch = formData.password === formData.confirmPassword && formData.confirmPassword !== '';
    const isFormValid = isPasswordValid && passwordsMatch;


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
            const response = await api.post('/auth/register', {
                username: formData.username,
                password: formData.password,
                firstName: formData.firstName,
                lastName: formData.lastName
            });

            const data = response.data;
            console.log("Registration Success Response:", data);
            setGeneratedAccount(data.accountNumber || '');
            setShowSuccessModal(true);
        } catch (error) {
            const data = error.response?.data || {};
            setErrorMsg(data.error || 'การสมัครสมาชิกล้มเหลว');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <WelcomeLayout>
            <div className="w-full max-w-[480px]">
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
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm font-medium">
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
                            onFocus={() => setIsPasswordFocused(true)}
                            onBlur={() => setIsPasswordFocused(false)}
                            required
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                        />

                        {/* 🔒 Password Length Hint - Conditional Visibility */}
                        {isPasswordFocused && !passwordRequirements.length && (
                            <div className="mt-2 px-2 animate-in fade-in slide-in-from-top-1">
                                <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-rose-500">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div>
                                    Min 8 Characters
                                </div>
                            </div>
                        )}
                    </div>



                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                            className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 focus:outline-none transition-all duration-300 text-slate-700 font-medium ${formData.confirmPassword && !passwordsMatch ? 'border-rose-200 bg-rose-50/30' : 'border-slate-100 focus:border-emerald-500/30 focus:bg-white'
                                }`}
                        />
                        {formData.confirmPassword && !passwordsMatch && (
                            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-wider ml-2 animate-in fade-in slide-in-from-top-1">
                                Passwords do not match
                            </p>
                        )}
                    </div>


                    <button
                        type="submit"
                        disabled={isSubmitting || !isFormValid}
                        className="w-full bg-[#065f46] hover:bg-[#054634] disabled:bg-slate-300 disabled:shadow-none active:scale-[0.98] text-white py-5 px-10 text-lg font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(6,95,70,0.3)] transition-all duration-300 transform hover:-translate-y-1 mt-4 flex justify-center items-center"
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

            {/* 🎉 Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
                    <div className="bg-white rounded-[3rem] p-10 max-w-md w-full relative z-[101] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] text-center font-sans">
                        {/* Status Icon */}
                        <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-8 ring-8 ring-emerald-50/50">
                            <svg className="w-12 h-12 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>

                        <h3 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Registration Success!</h3>
                        <p className="text-slate-500 mb-8 leading-relaxed font-medium">
                            Welcome to the Virtual Bank community. Your account has been created successfully.
                        </p>

                        {/* Account Info Box */}
                        <div className="bg-slate-50 rounded-[2rem] p-8 mb-10 border-2 border-slate-100 relative group overflow-hidden">
                            {/* Decorative Background */}
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] scale-150 rotate-12 pointer-events-none">
                                <svg className="w-24 h-24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" /></svg>
                            </div>

                            <div className="mb-6 relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Username</p>
                                <p className="text-xl font-black text-slate-800 tracking-tight">{formData.username}</p>
                            </div>

                            <div className="h-px bg-slate-200/50 mb-6 mx-4"></div>

                            <div className="relative z-10">
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Main Account Number</p>
                                <div className="flex items-center justify-center gap-3">
                                    <p className="text-2xl font-black text-emerald-600 tracking-tighter font-mono">
                                        {isAccountVisible
                                            ? generatedAccount
                                            : `*******${String(generatedAccount || '').slice(-3)}`
                                        }
                                    </p>
                                    <button
                                        onClick={() => setIsAccountVisible(!isAccountVisible)}
                                        className="text-slate-300 hover:text-emerald-600 transition-colors p-1.5 bg-white rounded-xl shadow-sm border border-slate-100 active:scale-90"
                                    >
                                        {isAccountVisible ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.542 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => navigate('/login')}
                            className="w-full py-5 bg-[#065f46] text-white rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-emerald-900/10 hover:brightness-110 transition-all active:scale-[0.98]"
                        >
                            Proceed to Login
                        </button>
                    </div>
                </div>
            )}
        </WelcomeLayout>

    );
};

export default SignUp;
