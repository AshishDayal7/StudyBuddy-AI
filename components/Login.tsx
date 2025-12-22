import React, { useState } from 'react';
import { User, Mail, ArrowRight, BookOpen, Sparkles, Shield, Globe } from 'lucide-react';
import { GoogleLogin, CredentialResponse } from '@react-oauth/google';
import { jwtDecode } from 'jwt-decode';
import { User as UserType } from '../types';
import { cn } from '../services/utils';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loginMethod, setLoginMethod] = useState<'guest' | 'google'>('guest');

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      // Deterministic ID for guest/manual login
      const deterministicId = btoa(email.toLowerCase().trim());
      const mockUser: UserType = {
        id: deterministicId,
        name: name,
        email: email,
      };
      onLogin(mockUser);
      setIsLoading(false);
    }, 800);
  };

  const handleGoogleSuccess = (credentialResponse: CredentialResponse) => {
    if (credentialResponse.credential) {
      try {
        const decoded: any = jwtDecode(credentialResponse.credential);
        const googleUser: UserType = {
          id: decoded.sub, // Unique Google ID
          name: decoded.name,
          email: decoded.email,
        };
        onLogin(googleUser);
      } catch (error) {
        console.error("Login Failed", error);
      }
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#020617]">
      {/* Animated Background */}
      <div className="absolute inset-0 z-0">
        {/* Deep radial base */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-[#020617] to-black"></div>
        
        {/* Subtle Engineering Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20"></div>
        
        {/* Glowing Orbs - Blue/Cyan/Teal Theme */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full mix-blend-screen filter blur-[100px] animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-32 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-indigo-600/10 rounded-full mix-blend-screen filter blur-[120px] animate-pulse duration-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md p-6">
        <div className="backdrop-blur-xl bg-slate-950/40 border border-white/10 rounded-3xl shadow-2xl overflow-hidden ring-1 ring-white/5">
          
          {/* Header */}
          <div className="p-8 pb-0 text-center">
            <div className="inline-flex p-3 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 shadow-lg shadow-blue-500/20 mb-6 transform hover:scale-105 transition-transform duration-300">
              <BookOpen className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">StudyBuddy AI</h1>
            <p className="text-slate-400 text-sm">Your intelligent companion for mastering any subject.</p>
          </div>

          <div className="p-8 space-y-6">
            
            {/* Login Method Toggle */}
            <div className="flex p-1 bg-black/40 rounded-xl border border-white/5">
              <button
                onClick={() => setLoginMethod('guest')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  loginMethod === 'guest' 
                    ? "bg-slate-800 text-white shadow-lg border border-white/5" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Shield className="w-4 h-4" />
                Guest Access
              </button>
              <button
                onClick={() => setLoginMethod('google')}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg transition-all duration-200",
                  loginMethod === 'google' 
                    ? "bg-slate-800 text-white shadow-lg border border-white/5" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                <Globe className="w-4 h-4" />
                Google Account
              </button>
            </div>

            {/* Guest Login Form */}
            {loginMethod === 'guest' && (
              <form onSubmit={handleManualSubmit} className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                 <div className="bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 flex gap-2 items-start mb-4">
                   <Shield className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                   <p className="text-[11px] text-blue-200/60 leading-relaxed">
                     Fast & Private. No account required. Enter details to start a session.
                   </p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 ml-1">Full Name</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-black/40 border border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-white/10 text-white placeholder-slate-600 transition-all outline-none"
                      placeholder="Enter your name"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 ml-1">Email Address</label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-4 w-4 text-slate-500 group-focus-within:text-blue-400 transition-colors" />
                    </div>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-10 pr-3 py-3 bg-black/40 border border-white/5 rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:border-white/10 text-white placeholder-slate-600 transition-all outline-none"
                      placeholder="name@example.com"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full group flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-semibold py-3.5 px-4 rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg shadow-blue-900/20 disabled:opacity-70 disabled:cursor-not-allowed mt-2 border border-white/10"
                >
                  {isLoading ? (
                    <Sparkles className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Start Guest Session</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </form>
            )}
            
            {/* Google Login Section */}
            {loginMethod === 'google' && (
              <div className="space-y-6 py-4 animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col items-center justify-center min-h-[160px]">
                <div className="flex justify-center w-full relative group">
                  <GoogleLogin
                    onSuccess={handleGoogleSuccess}
                    onError={() => console.log('Login Failed')}
                    theme="filled_black"
                    shape="pill"
                    width="320"
                    text="continue_with"
                  />
                </div>
                <p className="text-[11px] text-slate-500 text-center max-w-[280px]">
                  Sign in securely with your Google account to sync your study history across devices.
                </p>
              </div>
            )}

          </div>
          
          <div className="bg-black/40 p-4 text-center border-t border-white/5">
            <p className="text-[10px] text-slate-500">
              By entering, you agree to our Terms of Study. <br/>
              Your chat history is synced to your account.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;