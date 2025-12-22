import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, LogOut, BookOpen, Moon, Sun, Search, Sparkles } from 'lucide-react';
import { ChatSession, User } from '../types';
import { cn, formatDate } from '../services/utils';

interface SidebarProps {
  sessions: Record<string, ChatSession>;
  currentSessionId: string | null;
  onSelectSession: (id: string) => void;
  onNewSession: () => void;
  onDeleteSession: (id: string) => void;
  onLogout: () => void;
  user: User;
  isOpen: boolean;
  onClose: () => void;
  theme: 'light' | 'dark';
  toggleTheme: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  onLogout,
  user,
  isOpen,
  onClose,
  theme,
  toggleTheme,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const sortedSessions = Object.values(sessions).sort((a, b) => b.updatedAt - a.updatedAt);

  const filteredSessions = sortedSessions.filter(session => {
    const term = searchTerm.toLowerCase().trim();
    if (!term) return true;
    if (session.title.toLowerCase().includes(term)) return true;
    const hasTag = session.messages.some(msg => 
      msg.tags?.some(tag => tag.toLowerCase().includes(term))
    );
    if (hasTag) return true;
    return false;
  });

  const getLastMessagePreview = (session: ChatSession) => {
    if (session.messages.length === 0) return "New session";
    const lastMsg = session.messages[session.messages.length - 1];
    return lastMsg.role === 'user' ? `You: ${lastMsg.text}` : `AI: ${lastMsg.text}`;
  };

  return (
    <>
      {/* Mobile overlay */}
      <div 
        className={cn(
          "fixed inset-0 z-20 bg-black/60 backdrop-blur-sm transition-opacity md:hidden",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Content */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-30 w-72 bg-slate-900/95 backdrop-blur-md text-white transform transition-transform duration-300 cubic-bezier(0.4, 0, 0.2, 1) md:relative md:translate-x-0 flex flex-col h-full border-r border-white/10 shadow-2xl md:shadow-none",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-lg shadow-blue-900/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent tracking-tight">
                StudyBuddy
              </h1>
              <p className="text-[10px] text-blue-300/60 uppercase tracking-widest font-semibold">AI Assistant</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 space-y-4">
          <button
            onClick={() => {
              onNewSession();
              if (window.innerWidth < 768) onClose();
            }}
            className="group w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white p-3.5 rounded-xl transition-all font-medium shadow-lg shadow-blue-900/30 hover:shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform" />
            <span>New Study Session</span>
          </button>
          
          <div className="relative group">
            <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400 group-focus-within:text-blue-400 transition-colors" />
            <input 
              type="text"
              placeholder="Search history..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-black/20 border border-white/5 rounded-xl py-2.5 pl-9 pr-3 text-sm text-slate-200 placeholder-slate-500 focus:ring-1 focus:ring-blue-500/50 focus:border-blue-500/50 outline-none transition-all"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          <div className="px-2 py-3 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex justify-between items-center">
            <span>Recent Chats</span>
            {searchTerm && <span className="text-blue-400">{filteredSessions.length}</span>}
          </div>
          
          {filteredSessions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-slate-500 space-y-2">
              <Sparkles className="w-8 h-8 opacity-20" />
              <p className="text-xs italic">{searchTerm ? "No matches found" : "No history yet"}</p>
            </div>
          ) : (
            filteredSessions.map((session) => (
              <div
                key={session.id}
                className={cn(
                  "group relative flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all duration-200",
                  currentSessionId === session.id
                    ? "bg-white/10 text-white shadow-lg backdrop-blur-sm border border-white/10"
                    : "text-slate-400 hover:bg-white/5 hover:text-slate-200"
                )}
                onClick={() => {
                  onSelectSession(session.id);
                  if (window.innerWidth < 768) onClose();
                }}
              >
                {/* Active Indicator */}
                {currentSessionId === session.id && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 h-8 w-1 bg-blue-500 rounded-r-full shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
                )}

                <div className={cn(
                  "shrink-0 w-9 h-9 rounded-lg flex items-center justify-center transition-colors",
                   currentSessionId === session.id ? "bg-blue-500/20 text-blue-300" : "bg-white/5 text-slate-500 group-hover:bg-white/10 group-hover:text-slate-300"
                )}>
                  <MessageSquare className="w-4 h-4" />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className={cn(
                    "truncate text-sm font-medium mb-0.5", 
                    currentSessionId === session.id ? "text-blue-50" : "text-slate-300 group-hover:text-white"
                  )}>
                    {session.title}
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="truncate max-w-[90px] opacity-70">
                      {getLastMessagePreview(session)}
                    </span>
                    <span className="shrink-0 ml-2">{formatDate(session.updatedAt)}</span>
                  </div>
                </div>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteSession(session.id);
                  }}
                  className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-500/20 hover:text-red-400 rounded-lg transition-all"
                  title="Delete session"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-white/10 bg-black/20">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 flex items-center justify-center text-sm font-bold shadow-md border border-white/10">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 overflow-hidden">
              <div className="text-sm font-semibold truncate text-white">{user.name}</div>
              <div className="text-xs text-slate-400 truncate">{user.email}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleTheme}
              className="flex-1 flex items-center justify-center gap-2 text-slate-400 hover:text-white hover:bg-white/10 p-2.5 rounded-xl transition-all text-xs font-medium border border-transparent hover:border-white/5"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5" />
                  Light
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5" />
                  Dark
                </>
              )}
            </button>
            <button
              onClick={onLogout}
              className="flex-1 flex items-center justify-center gap-2 text-slate-400 hover:text-red-300 hover:bg-red-500/10 p-2.5 rounded-xl transition-all text-xs font-medium border border-transparent hover:border-red-500/10"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;