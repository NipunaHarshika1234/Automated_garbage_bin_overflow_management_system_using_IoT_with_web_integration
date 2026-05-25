import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
    Mail, Lock, User, Shield, ArrowRight, Recycle, 
    X, CheckCircle, Bell, Trash 
} from 'lucide-react';
import { auth, db } from '../firebase';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    signOut 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';

export default function Login({ show, onClose }) {
    const [activeTab, setActiveTab] = useState('login');
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        phoneNumber: '',
        role: 'citizen',
        address: '',
        zone: ''
    });
    const navigate = useNavigate();

    useEffect(() => {
        if (show) {
            document.body.style.overflow = 'hidden';
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                password: '',
                phoneNumber: '',
                role: 'citizen',
                address: '',
                zone: ''
            });
        } else {
            document.body.style.overflow = 'unset';
            setError('');
        }
    }, [show]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            if (activeTab === 'login') {
                const userCredential = await signInWithEmailAndPassword(auth, formData.email, formData.password);
                const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));
                
                if (userDoc.exists()) {
                    const userData = userDoc.data();
                    localStorage.setItem('user', JSON.stringify({ uid: userCredential.user.uid, ...userData }));
                    localStorage.setItem('token', userCredential.user.accessToken);
                    onClose();
                    navigate(userData.role === 'admin' ? '/admin' : '/citizen');
                }
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
                const userData = {
                    name: `${formData.firstName} ${formData.lastName}`,
                    email: formData.email,
                    phoneNumber: formData.phoneNumber || '',
                    role: formData.role,
                    address: formData.address || '',
                    zone: formData.zone || '',
                    createdAt: new Date().toISOString()
                };

                await setDoc(doc(db, 'users', userCredential.user.uid), userData);
                localStorage.setItem('user', JSON.stringify({ uid: userCredential.user.uid, ...userData }));
                localStorage.setItem('token', userCredential.user.accessToken);
                onClose();
                navigate(formData.role === 'admin' ? '/admin' : '/citizen');
            }
        } catch (err) {
            setError(err.message.includes('auth/user-not-found') ? 'Invalid email or password' : err.message);
        }
    };

    if (!show) return null;

    return (
        <>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 pb-20 pt-20">
                {/* Blurred Backdrop */}
                <div
                    className={`absolute inset-0 bg-slate-950/60 backdrop-blur-md transition-opacity duration-300 ease-out ${show ? 'opacity-100' : 'opacity-0'}`}
                    onClick={onClose}
                ></div>

                {/* Modal Content */}
                <div className={`relative w-full max-w-lg bg-slate-900 border border-slate-700 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] overflow-y-auto max-h-[85vh] custom-scrollbar transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${show ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-95 translate-y-8'}`}>

                    {/* Decorative Gradients */}
                    <div className="sticky top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 to-emerald-300 z-30"></div>
                    <div className="absolute -top-32 -right-32 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-full transition-colors z-20 group cursor-pointer"
                    >
                        <X size={20} className="group-hover:rotate-90 transition-transform duration-300" />
                    </button>

                    <div className="p-8 pb-10">
                        {/* Header / Logo */}
                        <div className="flex items-center gap-2 text-emerald-400 font-extrabold justify-center text-3xl mb-8 tracking-wider">
                            <Recycle className="h-8 w-8 stroke-[2.5]" /> UrbanClean
                        </div>

                        {/* Tabs */}
                        <div className="flex w-full mb-8 bg-slate-800/80 rounded-xl p-1 border border-slate-700 shadow-inner">
                            <button
                                onClick={() => { setActiveTab('login'); setError('') }}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'login' ? 'bg-emerald-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-200'} cursor-pointer`}
                            >
                                Sign In
                            </button>
                            <button
                                onClick={() => { setActiveTab('register'); setError('') }}
                                className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all ${activeTab === 'register' ? 'bg-emerald-500 text-slate-900 shadow-md' : 'text-slate-400 hover:text-slate-200'} cursor-pointer`}
                            >
                                Create Account
                            </button>
                        </div>

                        <div className="mb-6 text-center">
                            <h2 className="text-2xl font-bold text-white mb-1">
                                {activeTab === 'login' ? 'Welcome Back' : 'Join the Initiative'}
                            </h2>
                            <p className="text-slate-400 text-sm">
                                {activeTab === 'login' ? 'Securely access your dashboard.' : 'Help us build a cleaner city.'}
                            </p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 text-red-500 text-sm font-medium animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">

                            {activeTab === 'register' && (
                                <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">First Name</label>
                                            <div className="relative hover-glow cursor-pointer">
                                                <span className="absolute left-3.5 top-3 text-slate-500"><User size={18} /></span>
                                                <input
                                                    type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} required
                                                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm "
                                                    placeholder="John"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1">
                                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Last Name</label>
                                            <div className="relative hover-glow cursor-pointer">
                                                <span className="absolute left-3.5 top-3 text-slate-500"><User size={18} /></span>
                                                <input
                                                    type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} required
                                                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Email Address</label>
                                <div className="relative hover-glow cursor-pointer">
                                    <span className="absolute left-3.5 top-3 text-slate-500"><Mail size={18} /></span>
                                    <input
                                        type="email" name="email" value={formData.email} onChange={handleInputChange} required
                                        className="w-full bg-slate-950/50 border border-slate-700/80 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium text-sm"
                                        placeholder={activeTab === 'login' ? "admin@urban.gov" : "john@example.com"}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Password</label>
                                <div className="relative hover-glow cursor-pointer">
                                    <span className="absolute left-3.5 top-3 text-slate-500"><Lock size={18} /></span>
                                    <input
                                        type="password" name="password" value={formData.password} onChange={handleInputChange} required
                                        className="w-full bg-slate-950/50 border border-slate-700/80 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all font-medium text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>
                            </div>

                            {activeTab === 'register' && (
                                <div className="space-y-6 pt-2">
                                    <div>
                                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 text-center">Select Role</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`cursor-pointer flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${formData.role === 'admin' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                                <input type="radio" name="role" value="admin" checked={formData.role === 'admin'} onChange={handleInputChange} className="hidden" />
                                                <Shield size={18} /> <span className="font-semibold text-sm">Admin</span>
                                            </label>
                                            <label className={`cursor-pointer flex items-center justify-center gap-2 py-3 rounded-lg border transition-all ${formData.role === 'citizen' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400 hover:border-slate-500'}`}>
                                                <input type="radio" name="role" value="citizen" checked={formData.role === 'citizen'} onChange={handleInputChange} className="hidden" />
                                                <User size={18} /> <span className="font-semibold text-sm">Citizen</span>
                                            </label>
                                        </div>
                                    </div>

                                    {formData.role === 'citizen' && (
                                        <div className="space-y-4 animate-in fade-in zoom-in duration-300">
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Phone Number</label>
                                                <div className="relative hover-glow cursor-pointer">
                                                    <span className="absolute left-3.5 top-3 text-slate-500"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg></span>
                                                    <input
                                                        type="tel" name="phoneNumber" value={formData.phoneNumber} onChange={handleInputChange} required
                                                        className="w-full bg-slate-950/50 border border-slate-700/80 rounded-lg py-3 pl-10 pr-4 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
                                                        placeholder="077 123 4567"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Home Address</label>
                                                <div className="relative hover-glow cursor-pointer">
                                                    <input
                                                        type="text" name="address" value={formData.address || ''} onChange={handleInputChange} required
                                                        className="w-full bg-slate-950/50 border border-slate-700/80 rounded-lg py-3 px-4 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm"
                                                        placeholder="123 Main St, Trincomalee"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Select Your Zone</label>
                                                <select
                                                    name="zone" value={formData.zone || ''} onChange={handleInputChange} required
                                                    className="w-full bg-slate-950/50 border border-slate-700/80 rounded-lg py-3 px-4 text-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all text-sm appearance-none"
                                                >
                                                    <option value="" disabled>Choose your zone...</option>
                                                    <option value="Zone A (Down-town)">Zone A (Down-town)</option>
                                                    <option value="Zone B (Market)">Zone B (Market)</option>
                                                    <option value="Zone C (Hospital)">Zone C (Hospital)</option>
                                                    <option value="Zone D (Residential)">Zone D (Residential)</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="pt-4 cursor-pointer">
                                <button type="submit" className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-extrabold py-3.5 rounded-xl flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                                    {activeTab === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight size={20} className="stroke-[3]" />
                                </button>
                            </div>

                            <div className="text-center pt-4">
                                <button
                                    type="button"
                                    onClick={() => { setActiveTab(activeTab === 'login' ? 'register' : 'login'); setError('') }}
                                    className="text-xs font-bold text-slate-500 hover:text-emerald-400 uppercase tracking-widest transition-colors cursor-pointer"
                                >
                                    {activeTab === 'login' ? "Don't have an account? Create one" : "Already have an account? Sign in"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: rgba(15, 23, 42, 0.1);
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(16, 185, 129, 0.2);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(16, 185, 129, 0.4);
                }
            `}</style>
        </>
    );
}
