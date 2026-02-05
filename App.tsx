import React, { useState, useEffect, Suspense } from 'react';
import Hero3D from './components/Hero3D';
import AuthPage from './components/AuthPage';
import DashboardLayout from './components/DashboardLayout';
import { ViewState, AuthMode } from './types';
import { AnimatePresence, motion } from 'framer-motion';
import { supabase } from './services/supabaseClient';

const App: React.FC = () => {
  const [view, setView] = useState<ViewState>(ViewState.LANDING);
  const [authInitialMode, setAuthInitialMode] = useState<AuthMode>(AuthMode.LOGIN);
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    let mounted = true;

    // Fast-track: Don't let auth hold up the UI for more than 1 second
    const timeout = setTimeout(() => {
      if (mounted && initializing) {
        setInitializing(false);
      }
    }, 1000);

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (mounted && session) {
          setView(ViewState.DASHBOARD);
        }
      } catch (err) {
        console.warn("Session check bypassed.");
      } finally {
        if (mounted) {
          setInitializing(false);
          clearTimeout(timeout);
        }
      }
    };

    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (session) {
        setView(ViewState.DASHBOARD);
      } else if (view === ViewState.DASHBOARD) {
        setView(ViewState.AUTH);
      }
    });

    return () => {
      mounted = false;
      clearTimeout(timeout);
      subscription.unsubscribe();
    };
  }, []);

  const triggerAuthMode = (mode: AuthMode) => {
    setAuthInitialMode(mode);
    setView(ViewState.AUTH);
  };

  // While initializing, we show nothing (the HTML loader covers this briefly)
  if (initializing) return null;

  return (
    <div className="w-full h-full bg-space-900 overflow-hidden flex flex-col">
      <AnimatePresence mode="wait">
        {view === ViewState.LANDING && (
          <motion.div 
            key="landing" 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }} 
            className="flex-1 relative"
          >
            <Suspense fallback={<div className="h-full w-full bg-space-900" />}>
              <Hero3D 
                setView={() => setView(ViewState.AUTH)} 
                onVoiceRegister={(mode) => triggerAuthMode(mode)}
              />
            </Suspense>
          </motion.div>
        )}

        {view === ViewState.AUTH && (
          <motion.div key="auth" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 relative">
            <AuthPage setView={setView} initialMode={authInitialMode} />
          </motion.div>
        )}

        {view === ViewState.DASHBOARD && (
          <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 relative">
            <DashboardLayout setView={setView} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;