import React, { useState, useEffect, useRef } from 'react';
import api from '../utils/axios';

/**
 * PinModal Component
 * Modes: 
 *  - 'VERIFY': Enter 4 digits to confirm transaction.
 *  - 'SETUP': First time setup, requires entering twice to confirm.
 */
const PinModal = ({ isOpen, onClose, onSuccess, mode = 'VERIFY', userId }) => {
    const [pin, setPin] = useState(['', '', '', '']);
    const [confirmPin, setConfirmPin] = useState(['', '', '', '']);
    const [isConfirming, setIsConfirming] = useState(false); // For SETUP mode
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const inputRefs = [useRef(), useRef(), useRef(), useRef()];

    useEffect(() => {
        if (isOpen) {
            setPin(['', '', '', '']);
            setConfirmPin(['', '', '', '']);
            setIsConfirming(false);
            setError('');
            // Focus first input after modal opens
            setTimeout(() => inputRefs[0].current?.focus(), 100);
        }
    }, [isOpen]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only numbers
        
        const currentPin = isConfirming ? confirmPin : pin;
        const newPin = [...currentPin];
        newPin[index] = value.slice(-1); // Only last char if pasted
        
        if (isConfirming) {
            setConfirmPin(newPin);
        } else {
            setPin(newPin);
        }

        // Auto focus next
        if (value && index < 3) {
            inputRefs[index + 1].current.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && ! (isConfirming ? confirmPin : pin)[index] && index > 0) {
            inputRefs[index - 1].current.focus();
        }
    };

    const handleSubmit = async () => {
        const pinString = (isConfirming ? confirmPin : pin).join('');
        if (pinString.length < 4) return;

        if (mode === 'SETUP') {
            if (!isConfirming) {
                setIsConfirming(true);
                setConfirmPin(['', '', '', '']);
                setTimeout(() => inputRefs[0].current.focus(), 100);
            } else {
                // Check if pins match
                if (pin.join('') !== confirmPin.join('')) {
                    setError('Pins do not match! Try again.');
                    setIsConfirming(false);
                    setPin(['', '', '', '']);
                    setConfirmPin(['', '', '', '']);
                    setTimeout(() => inputRefs[0].current.focus(), 100);
                    return;
                }
                // Call API to set PIN
                await callSetupPin(pinString);
            }
        } else {
            // VERIFY mode
            await callVerifyPin(pinString);
        }
    };

    const callSetupPin = async (finalPin) => {
        setLoading(true);
        try {
            await api.post('/security/setup-pin', { userId, pin: finalPin });
            onSuccess();
            onClose();
        } catch (err) {
            const data = err.response?.data || {};
            setError(data.error || 'Failed to set PIN');
        } finally {
            setLoading(false);
        }
    };

    const callVerifyPin = async (finalPin) => {
        setLoading(true);
        try {
            await api.post('/security/verify-pin', { userId, pin: finalPin });
            onSuccess();
            onClose();
        } catch (err) {
            const data = err.response?.data || {};
            setError(data.error || 'Invalid PIN');
            setPin(['', '', '', '']);
            setTimeout(() => inputRefs[0].current.focus(), 100);
        } finally {
            setLoading(false);
        }
    };

    // Auto-submit when 4th digit is entered
    useEffect(() => {
        const currentPin = isConfirming ? confirmPin : pin;
        if (currentPin.every(d => d !== '')) {
            handleSubmit();
        }
    }, [pin, confirmPin, isConfirming]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 font-sans">
            <div className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] text-center relative border border-slate-100">
                
                {/* Close Button */}
                <button 
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-slate-300 hover:text-slate-500 hover:bg-slate-50 rounded-full transition-all"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>

                {/* Icon */}
                <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                </div>

                <h3 className="text-2xl font-black text-slate-800 mb-2 tracking-tight">
                    {mode === 'SETUP' ? (isConfirming ? 'Confirm Your PIN' : 'Set Security PIN') : 'Enter Security PIN'}
                </h3>
                <p className="text-slate-400 text-sm font-medium mb-8">
                    {mode === 'SETUP' 
                        ? (isConfirming ? 'Please re-enter your 4-digit PIN to confirm.' : 'Create a 4-digit PIN to authorize transactions.')
                        : 'Enter your 4-digit PIN to continue.'}
                </p>

                {/* PIN Inputs */}
                <div className="flex justify-center gap-4 mb-8">
                    {[0, 1, 2, 3].map((i) => (
                        <input
                            key={i}
                            ref={inputRefs[i]}
                            type="password"
                            inputMode="numeric"
                            maxLength="1"
                            value={(isConfirming ? confirmPin : pin)[i]}
                            onChange={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(i, e)}
                            className="w-14 h-16 text-center text-3xl font-black bg-slate-50 border-2 border-slate-100 rounded-2xl focus:border-emerald-500 focus:bg-white focus:ring-4 focus:ring-emerald-500/10 transition-all text-slate-800"
                        />
                    ))}
                </div>

                {error && (
                    <p className="text-rose-500 text-xs font-bold uppercase tracking-wider mb-6 animate-shiver">
                        {error}
                    </p>
                )}

                {loading ? (
                    <div className="flex justify-center py-2">
                        <svg className="animate-spin h-6 w-6 text-emerald-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                ) : (
                    <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                        Confidential Security
                    </div>
                )}
            </div>
        </div>
    );
};

export default PinModal;
