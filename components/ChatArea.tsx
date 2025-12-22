import React, { useState, useRef, useEffect } from 'react';
import { Send, Menu, Loader2, StopCircle, Bot, Sparkles, Code } from 'lucide-react';
import { ChatSession, Message, Attachment } from '../types';
import MessageBubble from './MessageBubble';
import FileUpload from './FileUpload';
import { sendMessageToGemini } from '../services/gemini';
import { generateId, cn } from '../services/utils';

interface ChatAreaProps {
  session: ChatSession;
  onUpdateSession: (session: ChatSession) => void;
  onToggleSidebar: () => void;
}

const ChatArea: React.FC<ChatAreaProps> = ({ session, onUpdateSession, onToggleSidebar }) => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isCodeMode, setIsCodeMode] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [session.messages]);

  // Focus input on session load
  useEffect(() => {
    if (!isLoading && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [session.id]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [input]);

  const handleSend = async (overrideInput?: string, overrideAttachments?: Attachment[]) => {
    const textToSend = overrideInput !== undefined ? overrideInput : input;
    const attachmentsToSend = overrideAttachments !== undefined ? overrideAttachments : attachments;

    if ((!textToSend.trim() && attachmentsToSend.length === 0) || isLoading) return;

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      text: textToSend,
      attachments: attachmentsToSend,
      timestamp: Date.now(),
    };

    const updatedMessages = [...session.messages, userMessage];
    const updatedSession = {
      ...session,
      messages: updatedMessages,
      updatedAt: Date.now(),
      title: session.messages.length === 0 
        ? (textToSend.slice(0, 30) || "Study Session") + (textToSend.length > 30 ? "..." : "")
        : session.title
    };
    
    onUpdateSession(updatedSession);
    
    if (overrideInput === undefined) {
      setInput('');
      setAttachments([]);
      if (textareaRef.current) textareaRef.current.style.height = 'auto';
    }

    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(
        updatedMessages, 
        textToSend, 
        userMessage.attachments || [],
        isCodeMode
      );
      
      const botMessage: Message = {
        id: generateId(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      onUpdateSession({
        ...updatedSession,
        messages: [...updatedMessages, botMessage],
        updatedAt: Date.now(),
      });
    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'model',
        text: "I'm sorry, I encountered an error while processing your request. Please try again.",
        timestamp: Date.now(),
      };
      onUpdateSession({
        ...updatedSession,
        messages: [...updatedMessages, errorMessage],
        updatedAt: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditMessage = async (messageId: string, newText: string) => {
    const msgIndex = session.messages.findIndex(m => m.id === messageId);
    if (msgIndex === -1) return;

    const oldMessage = session.messages[msgIndex];
    const editedMessage: Message = {
      ...oldMessage,
      text: newText,
    };

    const historyBefore = session.messages.slice(0, msgIndex);
    const newMessagesState = [...historyBefore, editedMessage];

    onUpdateSession({
      ...session,
      messages: newMessagesState,
      updatedAt: Date.now()
    });

    setIsLoading(true);

    try {
      const responseText = await sendMessageToGemini(
        historyBefore, 
        newText, 
        editedMessage.attachments || [], 
        isCodeMode
      );

      const botMessage: Message = {
        id: generateId(),
        role: 'model',
        text: responseText,
        timestamp: Date.now(),
      };

      onUpdateSession({
        ...session,
        messages: [...newMessagesState, botMessage],
        updatedAt: Date.now(),
      });

    } catch (error) {
      const errorMessage: Message = {
        id: generateId(),
        role: 'model',
        text: "I'm sorry, I encountered an error while regenerating the response.",
        timestamp: Date.now(),
      };
      onUpdateSession({
        ...session,
        messages: [...newMessagesState, errorMessage],
        updatedAt: Date.now(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSummarizeFile = (file: Attachment) => {
    const prompt = `Please provide a detailed summary of the document "${file.name}", highlighting main topics and key takeaways.`;
    handleSend(prompt, [file]);
    
    if (attachments.find(a => a.id === file.id)) {
       setAttachments(prev => prev.filter(a => a.id !== file.id));
    }
  };

  const handleAddTag = (messageId: string, tag: string) => {
    const updatedMessages = session.messages.map(msg => {
      if (msg.id === messageId) {
        const existingTags = msg.tags || [];
        if (!existingTags.includes(tag)) {
          return { ...msg, tags: [...existingTags, tag] };
        }
      }
      return msg;
    });

    onUpdateSession({
      ...session,
      messages: updatedMessages,
      updatedAt: Date.now(),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-gray-50/50 dark:bg-[#0B1120] relative transition-colors duration-200">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[radial-gradient(#a1a1aa_1px,transparent_1px)] [background-size:20px_20px]"></div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4 bg-white/80 dark:bg-[#0B1120]/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 shadow-sm z-10 sticky top-0 transition-colors">
        <div className="flex items-center gap-3">
          <button 
            onClick={onToggleSidebar}
            className="md:hidden p-2 -ml-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div>
            <h2 className="font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
              {session.title}
            </h2>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              Gemini 3 Flash • {session.messages.length} messages
            </div>
          </div>
        </div>
        <div className="flex gap-2">
           <button 
             className={cn(
               "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
               isCodeMode 
                 ? "bg-purple-100 border-purple-200 text-purple-700 dark:bg-purple-900/30 dark:border-purple-800 dark:text-purple-300 shadow-sm"
                 : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400"
             )}
             onClick={() => setIsCodeMode(!isCodeMode)}
           >
             <Code className="w-3.5 h-3.5" />
             {isCodeMode ? 'Code Mode On' : 'Code Mode'}
           </button>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 group scroll-smooth">
        {session.messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-400 dark:text-gray-500 p-8">
            <div className="relative mb-8">
              <div className="absolute inset-0 bg-blue-500/20 blur-2xl rounded-full"></div>
              <div className="relative w-24 h-24 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 flex items-center justify-center">
                <Sparkles className="w-12 h-12 text-blue-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">StudyBuddy AI</h3>
            <p className="max-w-md text-gray-600 dark:text-gray-400 mb-8 leading-relaxed">
              Upload your study materials or start asking questions. I'm ready to help you summarize, analyze, and learn faster.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full text-sm">
              {[
                {icon: "📄", text: "Summarize this PDF for me"},
                {icon: "📊", text: "Explain this diagram"},
                {icon: "🆚", text: "Compare these documents"},
                {icon: "📝", text: "Quiz me on this topic"}
              ].map((item, i) => (
                <button 
                  key={i}
                  onClick={() => handleSend(item.text)}
                  className="p-4 bg-white dark:bg-gray-800/50 hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700/50 rounded-xl shadow-sm hover:shadow-md transition-all text-left flex items-center gap-3 group/btn"
                >
                  <span className="text-xl group-hover/btn:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-gray-700 dark:text-gray-300">{item.text}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          session.messages.map((msg) => (
            <MessageBubble 
              key={msg.id} 
              message={msg} 
              onAddTag={handleAddTag} 
              onEdit={handleEditMessage}
            />
          ))
        )}
        {isLoading && (
          <div className="flex w-full mb-6 justify-start pl-2">
             <div className="flex items-center gap-4 bg-white dark:bg-gray-800 px-4 py-3 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
                <span className="text-sm text-gray-500 dark:text-gray-400 font-medium">Thinking...</span>
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white/80 dark:bg-[#0B1120]/90 backdrop-blur-lg border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-4xl mx-auto space-y-2">
          <div className={cn(
            "relative flex items-end gap-2 bg-gray-50 dark:bg-gray-800/50 p-2 rounded-2xl border transition-all duration-200 shadow-sm",
            "focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-500/50 focus-within:bg-white dark:focus-within:bg-gray-800",
            "border-gray-200 dark:border-gray-700"
          )}>
            <div className="pb-1.5 pl-1">
              <FileUpload 
                attachments={attachments} 
                onAttachmentsChange={setAttachments} 
                onSummarize={handleSummarizeFile}
              />
            </div>
            
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={isCodeMode ? "Enter code to explain..." : "Ask anything about your documents..."}
              className="flex-1 max-h-[150px] min-h-[44px] py-3 bg-transparent border-none focus:ring-0 resize-none text-gray-800 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 leading-relaxed"
              rows={1}
            />

            <button
              onClick={() => handleSend()}
              disabled={isLoading || (!input.trim() && attachments.length === 0)}
              className={cn(
                "p-2.5 rounded-xl transition-all mb-0.5 shadow-sm",
                (input.trim() || attachments.length > 0) && !isLoading
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-lg hover:shadow-blue-500/30 hover:-translate-y-0.5 active:translate-y-0" 
                  : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              )}
            >
              {isLoading ? <StopCircle className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
            </button>
          </div>
          <p className="text-center text-[10px] text-gray-400 dark:text-gray-600 font-medium">
            AI can make mistakes. Please verify important information.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ChatArea;