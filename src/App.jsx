import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import Auth      from './components/Auth';
import Sidebar   from './components/layout/Sidebar';
import Dashboard from './components/Dashboard';

function App() {
  const [session,    setSession]    = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [activePage, setActivePage] = useState('dashboard');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-9 h-9 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-slate-500 text-sm">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!session) return <Auth />;

  return (
    <div className="min-h-screen bg-slate-950 flex">
      <Sidebar
        session={session}
        activePage={activePage}
        onNavigate={setActivePage}
      />
      <main className="flex-1 ml-64 min-h-screen overflow-y-auto">
        <Dashboard
          session={session}
          activePage={activePage}
          onNavigate={setActivePage}
        />
      </main>
    </div>
  );
}

export default App;