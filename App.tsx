import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import ChatArea from './components/ChatArea';
import Login from './components/Login';
import { ChatSession, User } from './types';
import { getSessions, saveSession, deleteSession, getUser, saveUser, removeUser, createNewSession, getTheme, saveTheme } from './services/storage';
import { Loader2 } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [sessions, setSessions] = useState<Record<string, ChatSession>>({});
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  // Initialize app state
  useEffect(() => {
    const initApp = async () => {
      const storedTheme = getTheme();
      setTheme(storedTheme);

      const storedUser = getUser();
      if (storedUser) {
        setUser(storedUser);
        await loadUserSessions(storedUser.id);
      }
      
      setIsInitializing(false);
    };

    initApp();
  }, []);

  // Update logic for theme class on document
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    saveTheme(theme);
  }, [theme]);

  const loadUserSessions = async (userId: string) => {
    const storedSessions = await getSessions(userId);
    setSessions(storedSessions);
    
    // Select most recent session or create new one if none exist
    const sessionList = Object.values(storedSessions);
    if (sessionList.length > 0) {
      // Sort by updatedAt desc
      sessionList.sort((a, b) => b.updatedAt - a.updatedAt);
      setCurrentSessionId(sessionList[0].id);
    } else {
      await createNewSessionAndSelect(userId);
    }
  };

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const createNewSessionAndSelect = async (userId: string) => {
    const newSession = createNewSession(userId);
    // Optimistic update
    setSessions(prev => ({ ...prev, [newSession.id]: newSession }));
    setCurrentSessionId(newSession.id);
    // Persist
    await saveSession(newSession);
  };

  const handleLogin = async (newUser: User) => {
    setUser(newUser);
    saveUser(newUser);
    await loadUserSessions(newUser.id);
  };

  const handleLogout = () => {
    setUser(null);
    removeUser();
    setSessions({});
    setCurrentSessionId(null);
  };

  const handleUpdateSession = async (updatedSession: ChatSession) => {
    // Optimistic UI update
    setSessions(prev => ({ ...prev, [updatedSession.id]: updatedSession }));
    // Persist to IDB
    await saveSession(updatedSession);
  };

  const handleDeleteSession = async (id: string) => {
    if (!user) return;

    // Persist deletion
    await deleteSession(id, user.id);

    // Update UI
    setSessions(prev => {
      const newSessions = { ...prev };
      delete newSessions[id];
      return newSessions;
    });

    if (currentSessionId === id) {
      const remainingSessions = Object.values(sessions).filter(s => s.id !== id);
      if (remainingSessions.length > 0) {
        remainingSessions.sort((a, b) => b.updatedAt - a.updatedAt);
        setCurrentSessionId(remainingSessions[0].id);
      } else {
        await createNewSessionAndSelect(user.id);
      }
    }
  };

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  const currentSession = currentSessionId ? sessions[currentSessionId] : null;

  return (
    <div className="flex h-screen bg-white dark:bg-gray-900 overflow-hidden font-sans text-gray-900 dark:text-gray-100 transition-colors">
      <Sidebar
        user={user}
        sessions={sessions}
        currentSessionId={currentSessionId}
        onSelectSession={setCurrentSessionId}
        onNewSession={() => createNewSessionAndSelect(user.id)}
        onDeleteSession={handleDeleteSession}
        onLogout={handleLogout}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
      
      <main className="flex-1 h-full w-full relative">
        {currentSession ? (
          <ChatArea
            key={currentSession.id}
            session={currentSession}
            onUpdateSession={handleUpdateSession}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-gray-50 dark:bg-[#0B1120]">
            <button 
              onClick={() => createNewSessionAndSelect(user.id)} 
              className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:scale-105 transition-all shadow-lg shadow-blue-900/20 font-medium"
            >
              Start a New Session
            </button>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;