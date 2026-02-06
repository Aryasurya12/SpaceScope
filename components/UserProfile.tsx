import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../services/supabaseClient';
import { Profile } from '../types';

const UserProfile: React.FC = () => {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
useEffect(() => {
  const fetchProfile = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return;
    }

    // 1️⃣ Try to fetch profile
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileData) {
      setProfile(profileData as Profile);
    } else {
      console.warn("Profile missing. Creating fallback profile.");

      // 2️⃣ Create profile if missing
      const newProfile = {
        id: user.id,
        username: user.user_metadata?.username || user.email?.split("@")[0],
        avatar_url:
          user.user_metadata?.avatar_url ||
          "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop",
        mastery_score: 0,
        missions_logged: 0,
        flight_hours: 0,
        credentials_level: "Class C",
      };

      const { error: insertError } = await supabase
        .from("profiles")
        .insert(newProfile);

      if (!insertError) {
        setProfile({
          ...newProfile,
          updated_at: new Date().toISOString(),
        } as Profile);
      } else {
        console.error("Profile creation failed:", insertError);
      }
    }

    setLoading(false);
  };

  fetchProfile();
}, []);

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        window.location.reload(); 
    };

    if (loading) {
        return (
            <div className="flex h-full items-center justify-center">
                <div className="w-12 h-12 border-2 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin" />
            </div>
        );
    }

    if (!profile) return <div className="p-10 text-center text-gray-500 uppercase tracking-widest">Profile Uplink Failed</div>;

    return (
        <div className="flex flex-col h-full w-full overflow-y-auto custom-scrollbar p-4 lg:p-10 pb-20">
            {/* Header / Identity */}
            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col md:flex-row gap-8 items-center md:items-start mb-12"
            >
                {/* Avatar Hologram */}
                <div className="relative group">
                    <div className="w-32 h-32 rounded-full border-2 border-cyan-500/50 p-1 relative z-10 bg-space-900 overflow-hidden shadow-[0_0_30px_rgba(0,240,255,0.2)]">
                        <img 
                            src={profile.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200&auto=format&fit=crop"} 
                            alt="Profile" 
                            className="w-full h-full rounded-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-cyan-500/20 mix-blend-overlay group-hover:opacity-0 transition-opacity" />
                    </div>
                    {/* Rotating HUD Elements */}
                    <div className="absolute inset-[-10px] border border-white/10 rounded-full animate-spin-slow pointer-events-none" />
                    <div className="absolute inset-[-20px] border border-cyan-500/10 rounded-full animate-[spin_15s_linear_infinite_reverse] pointer-events-none" />
                </div>

                {/* Info */}
                <div className="text-center md:text-left space-y-2 flex-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-900/30 border border-cyan-500/30 rounded text-[10px] font-mono text-cyan-400 uppercase tracking-widest mb-2">
                        <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse" />
                        {profile.credentials_level} Credentials
                    </div>
                    <h2 className="text-4xl font-display font-bold text-white uppercase tracking-wider drop-shadow-[0_0_10px_rgba(0,240,255,0.3)]">{profile.username}</h2>
                    <p className="text-gray-400 font-mono text-sm tracking-wide">Deep Space Explorer | ID: {profile.id.slice(0, 8)}</p>
                    <div className="flex items-center gap-4 justify-center md:justify-start mt-4 bg-black/20 p-2 rounded-lg border border-white/5 inline-flex">
                         <div className="flex items-center gap-2 text-[10px] text-green-400 font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full" />
                            Status: Authenticated
                         </div>
                         <div className="text-[10px] text-gray-600">|</div>
                         <div className="text-[10px] text-gray-300 font-mono">DATABASE NODE: SUPA-01</div>
                    </div>
                </div>

                <button 
                  onClick={handleSignOut}
                  className="px-6 py-2 border border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold rounded uppercase tracking-widest mt-4 md:mt-0"
                >
                  Terminate Session
                </button>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                {[
                    { label: 'Mastery Score', value: `${profile.mastery_score}%`, desc: 'Synchronized Knowledge', color: 'text-purple-400', border: 'border-purple-500/30', glow: 'bg-purple-500' },
                    { label: 'Missions Logged', value: profile.missions_logged.toString(), desc: 'Confirmed Operations', color: 'text-cyan-400', border: 'border-cyan-500/30', glow: 'bg-cyan-500' },
                    { label: 'Flight Hours', value: profile.flight_hours.toLocaleString(), desc: 'Total Space Time', color: 'text-green-400', border: 'border-green-500/30', glow: 'bg-green-500' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className={`bg-space-800/40 backdrop-blur-md border ${stat.border} p-6 rounded-2xl relative overflow-hidden group hover:bg-space-800/60 transition-colors`}
                    >
                        <div className="relative z-10">
                            <div className="text-[10px] font-mono text-gray-400 uppercase tracking-widest mb-2">{stat.label}</div>
                            <div className={`text-4xl font-display font-black ${stat.color} mb-2`}>{stat.value}</div>
                            <div className="text-xs text-gray-500 font-medium">{stat.desc}</div>
                        </div>
                        <div className={`absolute -bottom-10 -right-10 w-32 h-32 ${stat.glow}/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700`} />
                    </motion.div>
                ))}
            </div>

            {/* Activity Log */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div 
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    className="lg:col-span-2 bg-black/20 border border-white/5 rounded-2xl p-8 backdrop-blur-sm"
                >
                    <h3 className="text-sm font-display font-bold text-white uppercase tracking-widest mb-6 border-b border-white/5 pb-4 flex items-center justify-between">
                        Neural Activity Logs
                        <span className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">Streaming Tactical Data</span>
                    </h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-transparent hover:border-white/10 group transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-lg bg-green-500/10 text-green-400 border border-green-500/20">
                                    AUTH
                                </div>
                                <span className="text-xs text-gray-200 font-medium">Session Initialized: Neural Link Stable</span>
                            </div>
                            <span className="text-[10px] font-mono text-gray-500">{new Date(profile.updated_at).toLocaleTimeString()}</span>
                        </div>
                        <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg border border-transparent hover:border-white/10 group transition-all">
                            <div className="flex items-center gap-4">
                                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-bold shadow-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                                    DB
                                </div>
                                <span className="text-xs text-gray-200 font-medium">Profile Verification Complete: Database Sync Active</span>
                            </div>
                            <span className="text-[10px] font-mono text-gray-500">REALTIME</span>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 }}
                    className="bg-gradient-to-b from-cyan-900/10 to-transparent border border-cyan-500/10 rounded-2xl p-8 flex flex-col items-center text-center relative overflow-hidden"
                >
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="relative z-10">
                        <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/50 flex items-center justify-center mb-4 mx-auto animate-pulse-slow">
                            <svg className="w-8 h-8 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <h3 className="text-xl font-display font-bold text-white mb-2">Verified Neural Link</h3>
                        <p className="text-xs text-cyan-200/60 leading-relaxed mb-6">
                            Security clearance level validated. All orbital telemetry and mastery engine progress is synchronized across your tactical node.
                        </p>
                        <div className="w-full bg-space-900 rounded-full h-1.5 overflow-hidden">
                            <div className="w-[100%] h-full bg-cyan-500 shadow-[0_0_10px_#00F0FF]" />
                        </div>
                        <div className="flex justify-between w-full mt-2">
                             <span className="text-[9px] font-mono text-cyan-500/50 uppercase">Security Protocol</span>
                             <span className="text-[9px] font-mono text-cyan-400 uppercase">Active</span>
                        </div>
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

export default UserProfile;