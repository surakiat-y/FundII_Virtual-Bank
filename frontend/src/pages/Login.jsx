import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BankingLayout from '../components/BankingLayout';
import BackButton from '../components/BackButton';
import { api } from '../services/api';

const Login = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (error) setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await api.login(formData.username, formData.password);
            if (result.success) {
                // For now, just alert or navigate. 
                // In a real app, you'd update an auth context.
                if (result.user.role === 'ADMIN') {
                    alert('Logged in as Admin! (Admin Panel coming soon)');
                    navigate('/'); // Admins go to home for now
                } else {
                    navigate('/dashboard'); // Regular users go to dashboard
                }
            } else {
                setError(result.message);
            }
        } catch (err) {
            setError('An error occurred. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <BankingLayout>
            <div className="w-full max-w-[480px] animate-in fade-in slide-in-from-right-10 duration-700">
                <div className="mb-10">
                    <BackButton to="/" className="mb-8" />

                    <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
                        Welcome Back
                    </h2>
                    <p className="text-slate-500 text-lg leading-relaxed">
                        Please enter your details to access your secure banking portal.
                    </p>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleSubmit}>
                    {error && (
                        <div className="bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm font-bold animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Username</label>
                        <input
                            type="text"
                            name="username"
                            value={formData.username}
                            onChange={handleInputChange}
                            placeholder="Enter your username"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                            required
                        />
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 ml-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={formData.password}
                            onChange={handleInputChange}
                            placeholder="Enter your password"
                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 focus:outline-none focus:border-emerald-500/30 focus:bg-white transition-all duration-300 text-slate-700 font-medium"
                            required
                        />
                    </div>

                    <div className="flex justify-end mt-1">
                        <button type="button" className="text-[11px] font-bold text-emerald-700 hover:text-emerald-800 uppercase tracking-wider transition-colors">
                            Forgot Password?
                        </button>
                    </div>

                    <button
                        type="submit"
                        disabled={isLoading}
                        className={`w-full py-5 px-10 text-lg font-bold rounded-2xl shadow-[0_20px_40px_-15px_rgba(6,95,70,0.3)] transition-all duration-300 transform mt-4 ${
                            isLoading 
                            ? 'bg-emerald-800/50 cursor-not-allowed text-white/50' 
                            : 'bg-[#065f46] hover:bg-[#054634] active:scale-[0.98] text-white hover:-translate-y-1'
                        }`}
                    >
                        {isLoading ? (
                            <div className="flex items-center justify-center gap-3">
                                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                <span>Signing In...</span>
                            </div>
                        ) : 'Sign In to Portal'}
                    </button>
                </form>

                <div className="mt-10 text-center">
                    <p className="text-slate-400 text-sm font-medium">
                        Don't have an account? {' '}
                        <button 
                            onClick={() => navigate('/create-account')}
                            className="text-emerald-700 font-bold hover:underline underline-offset-4"
                        >
                            Create one now
                        </button>
                    </p>
                </div>
            </div>
        </BankingLayout>
    );
};

export default Login;
