import React, { useState } from 'react';
import { Mail, Lock, Link2, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthPage: React.FC = () => {
  const { signInEmail, signUpEmail } = useAuth();

  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (isRegister && password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await signUpEmail(email, password);
      } else {
        await signInEmail(email, password);
      }
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setErrorMsg('Invalid email or password.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('An account with this email already exists.');
      } else if (err.code === 'auth/weak-password') {
        setErrorMsg('Password should be at least 6 characters.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please check your network and credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-screen bg-[#121417] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Background Decorative Gradients */}
      <div className="absolute top-1/4 -left-32 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 -right-32 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md bg-[#1c1e23]/90 backdrop-blur-xl border border-[#282b33] rounded-3xl p-8 shadow-2xl relative z-10 space-y-6">
        {/* Brand Logo & Title */}
        <div className="text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-purple-600 via-indigo-500 to-blue-500 flex items-center justify-center shadow-xl shadow-purple-900/30 mx-auto">
            <Link2 className="w-7 h-7 text-white stroke-[2.5]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">Bookmark Studio</h1>
            <p className="text-xs text-slate-400 mt-1 font-medium">
              Organise your web links in custom folders & sub-groups
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-[#121417] p-1 rounded-2xl border border-[#26282f]">
          <button
            type="button"
            onClick={() => {
              setIsRegister(false);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              !isRegister ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegister(true);
              setErrorMsg('');
            }}
            className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
              isRegister ? 'bg-purple-600 text-white shadow-lg shadow-purple-950/50' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error Notification */}
        {errorMsg && (
          <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-2xl font-medium animate-in fade-in">
            {errorMsg}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex.dev@example.com"
                className="w-full bg-[#121417] text-slate-100 placeholder-slate-500 text-xs pl-10 pr-4 py-3 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-[#121417] text-slate-100 placeholder-slate-500 text-xs pl-10 pr-4 py-3 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none transition-all"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wider">
                Confirm Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#121417] text-slate-100 placeholder-slate-500 text-xs pl-10 pr-4 py-3 rounded-xl border border-[#2d3036] focus:border-purple-500 focus:outline-none transition-all"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-xs font-extrabold shadow-xl shadow-purple-900/30 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            <span>{loading ? 'Authenticating...' : isRegister ? 'Register Account' : 'Sign In'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-[#26282f] flex items-center justify-center gap-1.5 text-[11px] text-slate-500">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
          <span>Secured by Firebase Authentication</span>
        </div>
      </div>
    </div>
  );
};
