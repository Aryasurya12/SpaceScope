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
  const hasUserInteracted = React.useRef(false);

  useEffect(() => {
    let mounted = true;

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;

      // CRITICAL: Never auto-navigate on initial page load
      // Only handle auth changes after user has explicitly interacted
      if (!hasUserInteracted.current) return;

      // Post-login navigation only (not initial routing)
      if (session) {
        setView(ViewState.DASHBOARD);
      } else if (view === ViewState.DASHBOARD) {
        setView(ViewState.AUTH);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array - only run once on mount

  const triggerAuthMode = (mode: AuthMode) => {
    // Mark that user has interacted - now auth listener can navigate
    hasUserInteracted.current = true;
    setAuthInitialMode(mode);
    setView(ViewState.AUTH);
  };

  const handleSetView = (newView: ViewState) => {
    // Mark that user has interacted - now auth listener can navigate
    hasUserInteracted.current = true;
    setView(newView);
  };

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
                setView={handleSetView}
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