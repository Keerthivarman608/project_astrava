import React, { useState } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signInWithPopup,
    GoogleAuthProvider,
    sendEmailVerification
} from 'firebase/auth';
import { auth, db } from '../lib/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { Instagram, Facebook, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Login: React.FC = () => {
    const { user, sendVerification, logout } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationSent, setVerificationSent] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (isLogin) {
                await signInWithEmailAndPassword(auth, email, password);
            } else {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const newUser = userCredential.user;

                // Create user profile in Firestore
                await setDoc(doc(db, 'users', newUser.uid), {
                    username: username.toLowerCase().replace(/\s/g, ''),
                    fullName: fullName,
                    email: email,
                    bio: '',
                    avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${newUser.uid}`,
                    createdAt: new Date().toISOString(),
                    isVerified: false
                });

                // Send verification email
                await sendEmailVerification(newUser);
                setVerificationSent(true);
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        const provider = new GoogleAuthProvider();
        try {
            const result = await signInWithPopup(auth, provider);
            const user = result.user;

            // Check if profile exists, if not create it
            const profileRef = doc(db, 'users', user.uid);
            const profileSnap = await getDoc(profileRef);

            if (!profileSnap.exists()) {
                await setDoc(profileRef, {
                    username: user.displayName?.toLowerCase().replace(/\s/g, '') || user.email?.split('@')[0],
                    fullName: user.displayName || 'User',
                    email: user.email,
                    bio: '',
                    avatar: user.photoURL || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.uid}`,
                    createdAt: new Date().toISOString(),
                    isVerified: true // Google accounts are usually verified
                });
            }
        } catch (err: any) {
            setError(err.message || 'An error occurred during Google sign-in.');
        }
    };

    const handleResendVerification = async () => {
        try {
            await sendVerification();
            setVerificationSent(true);
            setError('');
        } catch (err: any) {
            setError(err.message);
        }
    };

    // If user is logged in but not verified (and not using Google)
    if (user && !user.emailVerified && !user.providerData.some(p => p.providerId === 'google.com')) {
        return (
            <div className="min-h-screen bg-black text-[#F5F5F5] flex flex-col items-center justify-center p-6 font-sans">
                <div className="w-full max-w-[400px] bg-[#0a0a0a] border border-[#262626] rounded-2xl p-8 text-center shadow-2xl">
                    <div className="w-20 h-20 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck size={40} className="text-cyan-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-4">Verify your email</h2>
                    <p className="text-sm text-white/60 mb-8">
                        We've sent a verification link to <span className="text-white font-semibold">{user.email}</span>.
                        Please check your inbox (and spam folder) to activate your account.
                    </p>

                    <div className="flex flex-col gap-3">
                        <button
                            onClick={handleResendVerification}
                            disabled={verificationSent}
                            className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold py-3 rounded-lg text-sm transition-all disabled:opacity-50"
                        >
                            {verificationSent ? 'Verification link sent!' : 'Resend link'}
                        </button>

                        <button
                            onClick={logout}
                            className="w-full bg-white/5 hover:bg-white/10 text-white font-semibold py-3 rounded-lg text-sm transition-all"
                        >
                            Log out
                        </button>
                    </div>

                    {error && (
                        <p className="text-rose-500 text-xs mt-4">{error}</p>
                    )}

                    <p className="text-[10px] text-white/30 mt-8">
                        Once verified, please refresh the page to continue.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-[#F5F5F5] flex flex-col font-sans">
            <div className="flex-1 flex flex-col lg:flex-row">
                {/* Left Side: Artistic "Moments" Section */}
                <div className="hidden lg:flex flex-1 flex-col items-center justify-center p-12 relative overflow-hidden border-r border-[#262626]">
                    <div className="absolute top-12 left-12">
                        <Instagram size={32} className="text-white" />
                    </div>

                    <div className="z-10 text-center max-w-[500px] mb-12">
                        <h1 className="text-5xl font-bold leading-tight tracking-tight mb-4">
                            See everyday moments from your{' '}
                            <span className="bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent italic">
                                close friends.
                            </span>
                        </h1>
                    </div>

                    <div className="relative w-full max-w-[600px] aspect-video">
                        <img
                            src="/assets/login-bg.png"
                            alt="Instagram Moments"
                            className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in duration-1000"
                        />
                        <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-rose-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                        <div className="absolute -top-4 -right-4 w-16 h-16 bg-blue-500 rounded-full blur-2xl opacity-30 animate-pulse delay-500"></div>
                    </div>
                </div>

                {/* Right Side: Login Form Section */}
                <div className="w-full lg:w-[450px] flex flex-col items-center justify-center p-8 lg:bg-[#0a0a0a]">
                    <div className="w-full max-w-[350px]">
                        <div className="lg:hidden flex justify-center mb-12">
                            <h1 className="text-4xl font-bold tracking-tighter bg-gradient-to-r from-[#f09433] via-[#dc2743] to-[#bc1888] bg-clip-text text-transparent italic">
                                Instagram
                            </h1>
                        </div>

                        <div className="flex flex-col gap-6 w-full">
                            <div className="text-center lg:text-left mb-4">
                                <h2 className="text-xl font-semibold mb-2">{isLogin ? 'Log into Instagram' : 'Sign up for Instagram'}</h2>
                                <p className="text-xs text-white/50">{isLogin ? 'Experience the world through moments.' : 'Create an account to see photos and videos from your friends.'}</p>
                            </div>

                            <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                                {!isLogin && (
                                    <>
                                        <input
                                            type="text"
                                            placeholder="Full Name"
                                            className="w-full bg-[#1A1A1A] border border-[#262626] rounded-md py-3 px-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            required
                                        />
                                        <input
                                            type="text"
                                            placeholder="Username"
                                            className="w-full bg-[#1A1A1A] border border-[#262626] rounded-md py-3 px-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            required
                                        />
                                    </>
                                )}

                                <input
                                    type="email"
                                    placeholder="Email"
                                    className="w-full bg-[#1A1A1A] border border-[#262626] rounded-md py-3 px-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                                <input
                                    type="password"
                                    placeholder="Password"
                                    className="w-full bg-[#1A1A1A] border border-[#262626] rounded-md py-3 px-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-[#0095f6] hover:bg-[#1877f2] text-white font-semibold py-2 rounded-lg mt-4 text-sm transition-all disabled:opacity-50 active:scale-95 shadow-lg shadow-[#0095f6]/20"
                                >
                                    {loading ? 'Processing...' : (isLogin ? 'Log in' : 'Sign up')}
                                </button>

                                {isLogin && (
                                    <button
                                        type="button"
                                        className="text-xs text-[#0095f6] font-medium mt-2 hover:text-white transition-colors"
                                    >
                                        Forgot password?
                                    </button>
                                )}

                                <div className="flex items-center gap-4 my-6">
                                    <div className="flex-1 h-[0.5px] bg-[#262626]"></div>
                                    <span className="text-[10px] text-white/40 font-bold tracking-widest">OR</span>
                                    <div className="flex-1 h-[0.5px] bg-[#262626]"></div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleGoogleSignIn}
                                    className="flex items-center justify-center gap-2 text-white font-semibold text-sm hover:opacity-80 transition-opacity bg-white/5 border border-white/10 py-2.5 rounded-lg"
                                >
                                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" className="w-4 h-4" alt="google" />
                                    {isLogin ? 'Log in with Google' : 'Sign up with Google'}
                                </button>

                                <button
                                    type="button"
                                    className="flex items-center justify-center gap-2 text-[#385185] font-semibold text-sm hover:text-white transition-colors py-1"
                                >
                                    <Facebook size={18} className="fill-[#385185] stroke-none" />
                                    {isLogin ? 'Log in with Facebook' : 'Sign up with Facebook'}
                                </button>
                            </form>

                            <div className="mt-8 pt-8 border-t border-[#262626] text-center">
                                <p className="text-sm">
                                    {isLogin ? "Don't have an account?" : "Have an account?"}{' '}
                                    <button
                                        onClick={() => setIsLogin(!isLogin)}
                                        className="text-[#0095f6] font-semibold hover:underline"
                                    >
                                        {isLogin ? 'Create new account' : 'Log in'}
                                    </button>
                                </p>
                            </div>

                            <div className="flex justify-center mt-6">
                                <svg aria-label="From Meta" className="text-white/40" color="#737373" fill="#737373" height="12" role="img" viewBox="0 0 100 24" width="50">
                                    <path d="M48.8,11.2h-3.4v2.7h3v1.8h-3v3.4h3.5v1.8h-5.4V9.4h5.3V11.2z M39.3,11.2h-2.1v9.8h-1.9v-9.8h-2.1V9.4h6.1V11.2z M61.7,21.1 c-0.8,0-1.5-0.1-2.2-0.4v-2c0.7,0.3,1.5,0.5,2.3,0.5c1.1,0,1.7-0.5,1.7-1.3c0-0.7-0.4-1.2-1.9-1.9c-2.1-0.9-3.2-2.1-3.2-3.8 c0-2.2,2-3.8,4.5-3.8c1,0,1.7,0.1,2.4,0.3v2c-0.7-0.3-1.4-0.4-2.2-0.4c-1.3,0-1.8,0.7-1.8,1.3c0,0.8,0.4,1.2,2.2,1.9 c1.9,0.9,3.1,2.1,3,4.1C66.3,19.3,64.2,21.1,61.7,21.1z M85.4,9.4l4.2,11.6h-2.1l-1-2.9h-4.3l-1,2.9h-2.1l4.2-11.6H85.4z M85.5,16.2 l-1.5-4.2l-1.5,4.2H85.5z M19.4,9.4l3.1,8.3l3.2-8.3h2.6v11.6h-1.9v-8.7l-3.2,8.7h-1.5l-3.2-8.7v8.7h-1.8V9.4H19.4z"></path>
                                </svg>
                            </div>

                            {error && (
                                <p className="text-rose-500 text-xs text-center mt-4 bg-rose-500/10 p-3 border border-rose-500/20 rounded-lg animate-in fade-in slide-in-from-top-1">
                                    {error}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className="w-full bg-black py-8 px-4 border-t border-[#262626]">
                <div className="max-w-[1200px] mx-auto flex flex-col items-center gap-4">
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[#a8a8a8] text-[12px]">
                        {['Meta', 'About', 'Blog', 'Jobs', 'Help', 'API', 'Privacy', 'Terms', 'Locations', 'Instagram Lite', 'Threads', 'Contact Uploading & Non-Users', 'Meta Verified'].map(link => (
                            <a key={link} href="#" className="hover:underline">{link}</a>
                        ))}
                    </div>
                    <div className="flex gap-4 text-[#a8a8a8] text-[12px] items-center">
                        <select className="bg-transparent outline-none cursor-pointer">
                            <option>English</option>
                        </select>
                        <span>© 2026 Instagram from Meta</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};
