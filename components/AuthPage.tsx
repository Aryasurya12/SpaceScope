import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, Variants } from 'framer-motion';
import { ViewState, AuthMode } from '../types';
import StarfieldBackground from './StarfieldBackground';
import { supabase } from '../services/supabaseClient';

interface AuthPageProps {
  setView: (view: ViewState) => void;
  initialMode?: AuthMode;
}

const AuthPage: React.FC<AuthPageProps> = ({ setView, initialMode = AuthMode.LOGIN }) => {
  const [isSignUp, setIsSignUp] = useState(initialMode === AuthMode.SIGNUP);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({ email: '', password: '', username: '' });
  const usernameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsSignUp(initialMode === AuthMode.SIGNUP);
    if (initialMode === AuthMode.SIGNUP) {
      setTimeout(() => usernameRef.current?.focus(), 500);
    }
  }, [initialMode]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // 1. Create the Auth User
        const { data, error: signUpError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              username: formData.username,
              mastery_score: 0,
              missions_logged: 0,
              flight_hours: 0,
              credentials_level: 'Class C'
            }
          }
        });

        if (signUpError) throw signUpError;

        // 2. Initialize the Public Profile Record
        // This ensures the user is "saved in the database" in a table we can query/update.
        if (data.user) {
          const { error: profileError } = await supabase
            .from('profiles')
            .upsert({
              id: data.user.id,
              username: formData.username || 'New Explorer',
              mastery_score: 0,
              missions_logged: 0,
              flight_hours: 0,
              credentials_level: 'Class C'
            });

          if (profileError) {
            console.warn("Profile table insert failed. Ensure the 'profiles' table exists in your public schema.", profileError);
            // We don't block the user if the table isn't ready, 
            // but we log it so you know why mastery scores aren't saving later.
          }

          setView(ViewState.DASHBOARD);
        }
      } else {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password,
        });

        if (signInError) throw signInError;
        setView(ViewState.DASHBOARD);
      }
    } catch (err: any) {
      setError(err.message || "Failed to establish neural uplink.");
    } finally {
      setIsLoading(false);
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } }
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-space-900 perspective-1000">
      <StarfieldBackground />

      <div className="absolute inset-0 bg-gradient-to-b from-space-900/20 via-transparent to-space-900/90 pointer-events-none" />



      <motion.div
        initial="hidden"
        animate="visible"
        exit={{ opacity: 0, scale: 1.1, filter: "blur(10px)" }}
        variants={containerVariants}
        className="relative z-10 w-full max-w-[420px] mx-4"
      >
        <div className="relative bg-space-800/40 backdrop-blur-2xl border border-cyan-500/20 rounded-xl p-1 shadow-[0_0_60px_rgba(0,0,0,0.6)] group">
          <div className="bg-space-900/60 rounded-lg p-8 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-8 h-8 border-t border-l border-cyan-500/60 rounded-tl-lg" />
            <div className="absolute bottom-0 right-0 w-8 h-8 border-b border-r border-cyan-500/60 rounded-br-lg" />

            <motion.div variants={itemVariants} className="text-center mb-10 relative">
              <div className="w-16 h-16 mx-auto mb-4 relative flex items-center justify-center">
                <div className="absolute inset-0 border-2 border-cyan-500/30 rounded-full animate-[spin_10s_linear_infinite]" />
                <motion.div
                  key={isSignUp ? 'signup' : 'login'}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`w-2 h-2 rounded-full shadow-[0_0_10px_#00f0ff] animate-pulse ${isSignUp ? 'bg-purple-400 shadow-purple-500' : 'bg-cyan-400'}`}
                />
              </div>
              <h2 className="font-display text-2xl font-bold text-white tracking-[0.2em] uppercase mb-1 drop-shadow-lg">
                {isSignUp ? 'New Uplink' : 'System Login'}
              </h2>
              <div className="text-[10px] font-mono text-cyan-500/60 tracking-widest uppercase">
                {isSignUp ? 'Registration Interface Initialized' : 'Secure Login Portal'}
              </div>
            </motion.div>

            <form onSubmit={handleAuth} className="space-y-6 relative z-20">
              <AnimatePresence mode="popLayout">
                {isSignUp && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="group relative">
                      <label className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Callsign ID (Username)</label>
                      <input
                        ref={usernameRef}
                        type="text" required
                        className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/60 transition-all"
                        placeholder="ENTER DESIGNATION"
                        value={formData.username}
                        onChange={e => setFormData({ ...formData, username: e.target.value })}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="group relative">
                <label className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Neural Net ID (Email)</label>
                <input
                  type="email" required
                  className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/60 transition-all"
                  placeholder="USER@SPACESCOPE.NET"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="group relative">
                <label className="text-[9px] font-mono font-bold text-gray-500 uppercase tracking-widest ml-1 mb-1 block">Security Key (Password)</label>
                <input
                  type="password" required
                  className="w-full bg-black/30 border border-white/10 rounded px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500/60 transition-all"
                  placeholder="••••••••••••"
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                />
              </div>

              {error && (
                <p className="text-[10px] font-mono text-red-500 uppercase text-center bg-red-500/10 py-2 rounded border border-red-500/20">{error}</p>
              )}

              <motion.button
                type="submit" disabled={isLoading}
                whileTap={{ scale: 0.98 }}
                className={`w-full mt-4 py-4 rounded-lg uppercase tracking-[0.2em] font-display font-bold transition-all disabled:opacity-50 border ${isSignUp ? 'bg-purple-600/10 border-purple-500/50 text-purple-400 hover:bg-purple-500/20' : 'bg-cyan-600/10 border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20'}`}
              >
                {isLoading ? 'Authenticating...' : (isSignUp ? 'Initialize Uplink' : 'Access Dashboard')}
              </motion.button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center flex flex-col gap-2">
              <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">
                {isSignUp ? "Already part of the fleet?" : "New to the platform?"}
              </p>
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-xs font-bold text-white hover:text-cyan-400 transition-colors uppercase tracking-widest border border-white/10 py-2 rounded-md bg-white/5 hover:bg-white/10"
              >
                {isSignUp ? "Switch to Secure Login" : "Request New Credentials"}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AuthPage;