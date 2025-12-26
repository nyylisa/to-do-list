import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import { TodoList } from './components/TodoList';
import { Portfolio } from './components/Portfolio';
import { Notes } from './components/Notes';
import { PomodoroTimer } from './components/PomodoroTimer';
import { HabitTracker } from './components/HabitTracker';
import { Auth } from '@/components/auth'; // Ensure this path matches your file structure
import { CheckSquare, User, Briefcase, FileText, Timer, Target, LogIn, UserPlus, LogOut } from 'lucide-react';

export default function App() {
  // State for Authentication
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAuth, setShowAuth] = useState(false);
  const [isSignUpMode, setIsSignUpMode] = useState(false);

  // State for Navigation
  const [activeTab, setActiveTab] = useState<'home' | 'portfolio'>('home');
  const [activeFeature, setActiveFeature] = useState<'tasks' | 'notes' | 'pomodoro' | 'habits'>('tasks');

  // 1. Listen for Authentication Changes
  useEffect(() => {
    // 1. Check for an existing session immediately
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false); // Only stop loading after we check
    });

    // 2. Set up the listener for changes (login, logout, auto-refresh)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      // If we have a session, stop loading
      setLoading(false); 
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setShowAuth(false);
  };

  const featureColors = {
    tasks: { primary: '#1976D2', light: '#E3F2FD', dark: '#0D47A1' },
    notes: { primary: '#7B1FA2', light: '#F3E5F5', dark: '#4A148C' },
    pomodoro: { primary: '#D32F2F', light: '#FFEBEE', dark: '#B71C1C' },
    habits: { primary: '#388E3C', light: '#E8F5E9', dark: '#1B5E20' },
  };

  const currentColor = featureColors[activeFeature];

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-[#1976D2]">Loading...</div>;
  }

  return (
    <div className="min-h-screen" style={{
      background: `linear-gradient(135deg, ${currentColor.light} 0%, #FFFFFF 100%)`,
    }}>
      {/* Header */}
      <header className="py-6 px-4 border-b backdrop-blur-sm bg-white/80" style={{ borderColor: currentColor.primary }}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{
              background: `linear-gradient(135deg, ${currentColor.primary}, ${currentColor.dark})`
            }}>
              <CheckSquare size={24} color="white" />
            </div>
            <h1 className="text-3xl bg-clip-text text-transparent hidden sm:block" style={{
              backgroundImage: `linear-gradient(135deg, ${currentColor.primary}, ${currentColor.dark})`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>TaskFlow</h1>
          </div>

          <div className="flex gap-2">
            {/* Standard Navigation */}
            <button
              onClick={() => { setActiveTab('home'); setShowAuth(false); }}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'home' && !showAuth ? 'text-white shadow-lg' : ''
                }`}
              style={{
                background: activeTab === 'home' && !showAuth
                  ? `linear-gradient(135deg, ${currentColor.primary}, ${currentColor.dark})`
                  : 'transparent',
                color: activeTab === 'home' && !showAuth ? 'white' : currentColor.dark,
              }}
            >
              <CheckSquare size={18} />
              <span className="hidden sm:inline">Home</span>
            </button>
            <button
              onClick={() => { setActiveTab('portfolio'); setShowAuth(false); }}
              className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 ${activeTab === 'portfolio' ? 'text-white shadow-lg' : ''
                }`}
              style={{
                background: activeTab === 'portfolio'
                  ? `linear-gradient(135deg, ${currentColor.primary}, ${currentColor.dark})`
                  : 'transparent',
                color: activeTab === 'portfolio' ? 'white' : currentColor.dark,
              }}
            >
              <Briefcase size={18} />
              <span className="hidden sm:inline">Portfolio</span>
            </button>

            {/* Divider */}
            <div className="w-px bg-gray-300 mx-1"></div>

            {/* Authentication Buttons */}
            {!session ? (
              <>
                <button
                  onClick={() => {
                    setIsSignUpMode(false); // Set to Sign In
                    setShowAuth(true);      // Show the Auth Screen
                  }}
                  className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 hover:bg-white/50"
                  style={{ color: currentColor.dark }}
                >
                  <LogIn size={18} />
                  <span className="hidden sm:inline">Sign In</span>
                </button>
                <button
                  onClick={() => {
                    setIsSignUpMode(true);  // Set to Sign Up
                    setShowAuth(true);      // Show the Auth Screen
                  }}
                  className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-white shadow-md hover:opacity-90"
                  style={{
                    background: `linear-gradient(135deg, ${currentColor.primary}, ${currentColor.dark})`
                  }}
                >
                  <UserPlus size={18} />
                  <span className="hidden sm:inline">Sign Up</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSignOut}
                className="px-4 py-2 rounded-lg transition-all flex items-center gap-2 hover:bg-red-50"
                style={{ color: '#D32F2F' }}
              >
                <LogOut size={18} />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-8 px-4">
        <div className="max-w-6xl mx-auto">
          {/* Conditional Rendering Logic */}
          {showAuth && !session ? (
            // 2. Show Auth Screen if requested and user is not logged in
            <div className="max-w-md mx-auto mt-10">
              <Auth defaultIsSignUp={isSignUpMode} />
            </div>
          ) : activeTab === 'home' ? (
            <div className="grid lg:grid-cols-[240px,1fr] gap-6">
              {/* Sidebar Navigation */}
              <aside className="space-y-2">
                <div className="bg-white rounded-xl shadow-lg p-4 sticky top-4">
                  <h3 className="text-lg mb-3" style={{ color: currentColor.dark }}>Features</h3>
                  <nav className="space-y-1">
                    <button
                      onClick={() => setActiveFeature('tasks')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all shadow-sm ${activeFeature === 'tasks' ? 'text-white' : ''
                        }`}
                      style={{
                        background: activeFeature === 'tasks'
                          ? 'linear-gradient(135deg, #1976D2, #0D47A1)'
                          : 'transparent',
                        color: activeFeature === 'tasks' ? 'white' : '#1976D2',
                      }}
                    >
                      <CheckSquare size={20} />
                      <span>Tasks</span>
                    </button>
                    <button
                      onClick={() => setActiveFeature('notes')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all shadow-sm ${activeFeature === 'notes' ? 'text-white' : ''
                        }`}
                      style={{
                        background: activeFeature === 'notes'
                          ? 'linear-gradient(135deg, #7B1FA2, #4A148C)'
                          : 'transparent',
                        color: activeFeature === 'notes' ? 'white' : '#7B1FA2',
                      }}
                    >
                      <FileText size={20} />
                      <span>Notes</span>
                    </button>
                    <button
                      onClick={() => setActiveFeature('pomodoro')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all shadow-sm ${activeFeature === 'pomodoro' ? 'text-white' : ''
                        }`}
                      style={{
                        background: activeFeature === 'pomodoro'
                          ? 'linear-gradient(135deg, #D32F2F, #B71C1C)'
                          : 'transparent',
                        color: activeFeature === 'pomodoro' ? 'white' : '#D32F2F',
                      }}
                    >
                      <Timer size={20} />
                      <span>Pomodoro</span>
                    </button>
                    <button
                      onClick={() => setActiveFeature('habits')}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all shadow-sm ${activeFeature === 'habits' ? 'text-white' : ''
                        }`}
                      style={{
                        background: activeFeature === 'habits'
                          ? 'linear-gradient(135deg, #388E3C, #1B5E20)'
                          : 'transparent',
                        color: activeFeature === 'habits' ? 'white' : '#388E3C',
                      }}
                    >
                      <Target size={20} />
                      <span>Habits</span>
                    </button>
                  </nav>
                </div>
              </aside>

              {/* Feature Content */}
              <div>
                {/* Hero Section */}
                {activeFeature === 'tasks' && (
                  <section className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-4" style={{ backgroundColor: '#1976D2' }}>
                      <User size={40} color="white" />
                    </div>
                    <h2 className="text-4xl mb-3" style={{ color: '#0D47A1' }}>
                      {session ? `Welcome, ${session.user.email}` : 'Welcome to My Productivity Hub'}
                    </h2>
                    <p className="text-xl mb-2" style={{ color: '#0D47A1' }}>
                      {session ? 'Here is your personal dashboard' : 'An individual project by a passionate developer'}
                    </p>
                    {!session && (
                      <p className="text-lg opacity-80" style={{ color: '#0D47A1' }}>
                        Please Sign In to access your tools
                      </p>
                    )}
                  </section>
                )}

                {/* 3. Render Features ONLY if logged in */}
                {session ? (
                  <>
                    {/* Note: Ensure TodoList accepts the session prop if you updated it earlier */}
                    {activeFeature === 'tasks' && <TodoList />}
                    {activeFeature === 'notes' && <Notes />}
                    {activeFeature === 'pomodoro' && <PomodoroTimer />}
                    {activeFeature === 'habits' && <HabitTracker />}
                  </>
                ) : (
                  // Friendly Prompt to Log In if accessing features
                  <div
                    className="text-center bg-white rounded-2xl shadow-lg border-t-4"
                    style={{
                      borderColor: currentColor.primary,
                      padding: '3rem' // Force padding manually to test
                    }}
                  >
                    <h3 className="text-2xl font-bold mb-4" style={{ color: currentColor.dark }}>
                      Login Required
                    </h3>
                    <p className="text-gray-600 mb-6">
                      You need to be signed in to access {activeFeature}.
                    </p>
                    <button
                      onClick={() => { setIsSignUpMode(false); setShowAuth(true); }}
                      className="px-6 py-3 rounded-lg text-white shadow-lg hover:opacity-90 transition-opacity"
                      style={{ backgroundColor: currentColor.primary }}
                    >
                      Sign In / Sign Up
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <Portfolio />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 px-4 mt-12 border-t" style={{ borderColor: '#1976D2' }}>
        <div className="max-w-6xl mx-auto text-center" style={{ color: '#0D47A1' }}>
          <p>© 2025 TaskFlow - Individual Project</p>
        </div>
      </footer>
    </div>
  );
}