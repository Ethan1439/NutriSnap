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
        
        // Simulate network delay for GitHub Pages
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Mock email
        console.log(`[MOCK EMAIL] Verification code for ${email} is: ${code}`);
        alert(`(Mock Email for GitHub Pages)\nYour verification code is: ${code}`);

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
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-md bg-white rounded-xl border border-zinc-800 shadow-xl overflow-hidden">
        <div className="p-8 text-center border border-zinc-800 bg-indigo-300">
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Welcome Back</h1>
          <p className="text-zinc-800 font-bold mt-2">Log in to continue your fitness journey.</p>
        </div>

        {!showVerification ? (
          <form onSubmit={handleLogin} className="p-8 space-y-6">
            {error && (
              <div className="p-4 bg-red-100 text-red-800 font-bold rounded-lg border border-red-200">
                {error}
              </div>
            )}
            
            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Email Address</label>
              <input 
                required 
                type="email" 
                className="w-full p-4 bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-medium text-lg" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                placeholder="you@example.com"
              />
            </div>

            <button disabled={isSending} type="submit" className="w-full py-4 bg-indigo-500 hover:bg-indigo-400 active:translate-y-[4px] active:border-b-0 text-white font-bold text-lg rounded-lg transition-all border border-indigo-700 shadow-sm mt-4 disabled:opacity-50">
              {isSending ? 'Sending Code...' : 'Log In'}
            </button>
            
            <div className="text-center pt-4 border-t-2 border-zinc-100">
              <p className="text-zinc-500 font-bold">
                Don't have an account?{' '}
                <Link to="/register" className="text-indigo-600 hover:text-indigo-500">Register</Link>
              </p>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerify} className="p-8 space-y-6">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-200 shadow-sm">
                <Mail className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900">Verify your Email</h2>
              <p className="text-zinc-500 font-bold mt-2">We sent a code to {email}</p>
            </div>

            {error && (
              <div className="p-4 bg-red-100 text-red-800 font-bold rounded-lg border border-red-200">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-700">Verification Code</label>
              <input 
                required 
                type="text" 
                className="w-full p-4 text-center tracking-widest bg-zinc-50 border border-zinc-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:bg-white font-bold text-2xl" 
                value={verificationCode} 
                onChange={(e) => setVerificationCode(e.target.value)} 
                placeholder="------"
              />
            </div>

            <button type="submit" className="w-full py-4 bg-blue-500 hover:bg-blue-400 active:translate-y-[4px] active:border-b-0 text-white font-bold text-lg rounded-lg transition-all border border-blue-700 shadow-sm mt-4">
              Verify Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
