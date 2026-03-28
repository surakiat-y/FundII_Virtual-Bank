import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BackButton from '../components/BackButton';
import BrandingBadge from '../components/BrandingBadge';
import { api } from '../services/api';
import { formatDateInput } from '../utils/formatters';
import { validation } from '../utils/validation';

const CreateAccount = () => {
    const navigate = useNavigate();

    // Form States
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        birthdate: '',
        phone: '',
        username: '',
        password: '',
        confirmPassword: '',
        acceptedTerms: false
    });

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState('');

    // Date Masking & Validation: 16072005 -> 16/07/2005
    const handleBirthdateChange = (e) => {
        const formattedValue = formatDateInput(e.target.value);
        setFormData({ ...formData, birthdate: formattedValue });
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Validation
    const isPasswordMatching = validation.isPasswordMatching(formData.password, formData.confirmPassword);
    const isFormComplete =
        formData.firstName &&
        formData.lastName &&
        validation.isDateComplete(formData.birthdate) &&
        formData.phone &&
        formData.username &&
        isPasswordMatching &&
        formData.acceptedTerms;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isFormComplete) return;

        setIsCreating(true);
        setError('');
        
        try {
            const result = await api.createAccount({
                firstName: formData.firstName,
                lastName: formData.lastName,
                birthdate: formData.birthdate,
                phone: formData.phone,
                username: formData.username,
                password: formData.password
            });

            if (result.success) {
                setIsSuccess(true);
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#f0fdf4] flex flex-col items-center justify-center p-6 sm:p-12 font-sans relative overflow-x-hidden">
            {/* Soft Background Decorative Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-3xl opacity-60 pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-200/30 rounded-full blur-3xl opacity-60 pointer-events-none"></div>

            {/* Top Navigation */}
            <nav className="absolute top-0 left-0 right-0 p-8 flex justify-between items-center max-w-7xl mx-auto w-full z-20">
                <BackButton to="/" />
                <BrandingBadge />
            </nav>

            {/* Main Content Card */}
            <div className="w-full max-w-[800px] bg-white rounded-[40px] shadow-[0_48px_80px_-24px_rgba(0,0,0,0.08)] border border-slate-100 p-10 md:p-16 z-10 animate-in fade-in zoom-in-95 duration-700 my-10">
                <div className="mb-10 text-center">
                    <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        Create Your Account
                    </h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        It's time you managed your financial assets with our secure platform.
                    </p>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    {/* First & Last Name Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">First Name</label>
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Last Name</label>
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* DOB & Phone Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Date of Birth</label>
                            <input
                                type="text"
                                name="birthdate"
                                value={formData.birthdate}
                                onChange={handleBirthdateChange}
                                placeholder="DD/MM/YYYY"
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                                required
                            />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Phone Number</label>
                            <input
                                type="tel"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                                required
                            />
                        </div>
                    </div>

                    {/* Username Row */}
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                            required
                        />
                    </div>

                    {/* Password Field */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Password</label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 pr-14 focus:outline-none transition-all duration-300 text-slate-700 font-medium ${formData.confirmPassword && !isPasswordMatching ? 'border-red-100 focus:border-red-300' : 'border-slate-100 focus:border-emerald-500/30'
                                    }`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                            >
                                {showPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 8.049 7.21 5 12 5c4.789 0 8.601 3.049 9.964 6.678.045.122.045.28 0 .402-1.364 3.629-5.175 6.678-9.964 6.678-4.79 0-8.368-3.049-9.964-6.678z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div className="flex flex-col gap-2 relative">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Confirm Password</label>
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                value={formData.confirmPassword}
                                onChange={handleInputChange}
                                className={`w-full bg-slate-50 border-2 rounded-2xl px-6 py-4 pr-14 focus:outline-none transition-all duration-300 text-slate-700 font-medium ${formData.confirmPassword && !isPasswordMatching ? 'border-red-100 focus:border-red-300' : 'border-slate-100 focus:border-emerald-500/30'
                                    }`}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-emerald-600 transition-colors"
                            >
                                {showConfirmPassword ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                                    </svg>
                                ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.644C3.399 8.049 7.21 5 12 5c4.789 0 8.601 3.049 9.964 6.678.045.122.045.28 0 .402-1.364 3.629-5.175 6.678-9.964 6.678-4.79 0-8.368-3.049-9.964-6.678z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                )}
                            </button>
                        </div>
                    </div>
                    {formData.confirmPassword && !isPasswordMatching && (
                        <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider ml-1 -mt-2 animate-in fade-in slide-in-from-top-1">Passwords do not match</p>
                    )}

                    {/* Terms Checklist */}
                    <div className="flex items-center gap-3 mt-1 px-1">
                        <input
                            type="checkbox"
                            id="terms"
                            name="acceptedTerms"
                            checked={formData.acceptedTerms}
                            onChange={handleInputChange}
                            className="w-5 h-5 rounded-lg border-2 border-slate-200 text-emerald-600 focus:ring-emerald-500 transition-all cursor-pointer"
                            required
                        />
                        <label htmlFor="terms" className="text-xs font-bold text-slate-500 select-none cursor-pointer hover:text-slate-700 transition-colors uppercase tracking-wider">
                            I accept the <span className="text-emerald-700 hover:underline">Terms and Conditions</span>
                        </label>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isCreating || !isFormComplete}
                        className={`w-full py-5 px-10 text-lg font-bold rounded-2xl transition-all duration-300 transform mt-4 ${isFormComplete
                            ? 'bg-[#065f46] hover:bg-[#054634] text-white shadow-[0_20px_40px_-15px_rgba(6,95,70,0.3)] hover:-translate-y-1 active:scale-[0.98]'
                            : 'bg-slate-100 text-slate-300 cursor-not-allowed'
                            }`}
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

            {/* Creating Account Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="bg-white rounded-[32px] p-10 shadow-2xl flex flex-col items-center gap-6 max-w-sm w-full mx-4 animate-in zoom-in-95 duration-300">
                        <div className="relative h-16 w-16">
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-100"></div>
                            <div className="absolute inset-0 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin"></div>
                        </div>
                        <div className="text-center">
                            <h3 className="text-2xl font-black text-slate-900 mb-2">Creating Account</h3>
                            <p className="text-slate-500 font-medium">Please wait while we set up your secure banking portal...</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Success Modal */}
            {isSuccess && (
                <div className="fixed inset-0 z-[101] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-500">
                    <div className="bg-white rounded-[40px] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] flex flex-col items-center gap-8 max-w-md w-full mx-4 animate-in scale-in-90 duration-500">
                        <div className="h-24 w-24 bg-emerald-50 rounded-full flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <div className="text-center">
                            <h3 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">Account Created!</h3>
                            <p className="text-slate-500 text-lg leading-relaxed font-medium px-4">Your virtual bank account is ready. Welcome to the future of banking.</p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="w-full bg-[#065f46] hover:bg-[#054634] text-white py-5 px-10 text-xl font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(6,95,70,0.4)] transition-all duration-300 active:scale-[0.98]"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            )}

            {/* Simple Footer */}
            <footer className="relative z-10 py-12 text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center mt-auto">
                <span>© 2026 NEXT-GEN PROJECT. ALL RIGHTS RESERVED.</span>
            </footer>
        </div>
    );
};

export default CreateAccount;
