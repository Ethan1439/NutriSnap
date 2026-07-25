import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { getProfile, saveProfile } from '../lib/storage';
import { ShieldCheck, Mail } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [showVerification, setShowVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');

  const [sentCode, setSentCode] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const profile = getProfile();
    
    if (!profile || profile.email !== email) {
      setError('No account found with this email. Please register.');
      return;
    }

    if (!profile.isEmailVerified) {
      setIsSending(true);
      setError('');
      try {
        const code = Math.floor(100000 + Math.random() * 900000).toString();
        
        const response = await fetch('/api/send-verification-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, code }),
        });

        if (!response.ok) {
          throw new Error('Failed to send email');
        }

        setSentCode(code);
        setShowVerification(true);
      } catch (err) {
        setError('Failed to send verification email. Please try again later.');
      } finally {
        setIsSending(false);
      }
      return;
    }

    navigate('/');
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (verificationCode === sentCode) {
      const profile = getProfile();
      if (profile) {
        profile.isEmailVerified = true;
        saveProfile(profile);
        navigate('/');
      }
    } else {
      setError('Invalid verification code.');
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-3xl border-4 border-stone-800 shadow-[8px_8px_0_0_#292524] overflow-hidden">
        <div className="p-8 text-center border-b-4 border-stone-800 bg-emerald-300">
          <h1 className="text-3xl font-black text-stone-900 tracking-tight">Welcome Back</h1>
          <p className="text-stone-800 font-bold mt-2">Log in to continue your fitness journey.</p>
        </div>

        {!showVerification ? (
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-rose-100 text-rose-800 font-bold rounded-2xl border-2 border-rose-200">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Email Address</label>
              <input 
                required 
                type="email" 
                className="w-full p-4 bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white font-medium text-lg" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com"
              />
            </div>

            <button disabled={isSending} type="submit" className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 active:translate-y-[4px] active:border-b-0 text-white font-black text-lg rounded-2xl transition-all border-b-4 border-emerald-700 shadow-sm mt-4 disabled:opacity-50">
              {isSending ? 'Sending Code...' : 'Log In'}
            </button>
            
            <div className="text-center pt-4 border-t-2 border-stone-100">
              <p className="text-stone-500 font-bold">
                Don't have an account?{' '}
                <Link to="/register" className="text-emerald-600 hover:text-emerald-500">Register</Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="p-8 space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-200 shadow-[0_4px_0_0_#bfdbfe]">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-black text-stone-900">Verify your Email</h2>
              <p className="text-stone-500 font-bold mt-2">We sent a code to {email}</p>
            </div>

            {error && (
              <div className="p-4 bg-rose-100 text-rose-800 font-bold rounded-2xl border-2 border-rose-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Verification Code</label>
              <input 
                required 
                type="text" 
                className="w-full p-4 text-center tracking-widest bg-stone-50 border-2 border-stone-300 rounded-2xl focus:outline-none focus:border-emerald-500 focus:bg-white font-black text-2xl" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
                placeholder="------"
              />
            </div>

            <button type="submit" className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:translate-y-[4px] active:border-b-0 text-white font-black text-lg rounded-2xl transition-all border-b-4 border-blue-700 shadow-sm mt-4">
              Verify Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
