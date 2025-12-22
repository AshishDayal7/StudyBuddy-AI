import React, { useState, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import { Bot, User as UserIcon, FileText, Image as ImageIcon, Tag, Pencil, X, Check, Copy } from 'lucide-react';
import { Message } from '../types';
import { cn, formatTime } from '../services/utils';

interface MessageBubbleProps {
  message: Message;
  onAddTag: (messageId: string, tag: string) => void;
  onEdit?: (messageId: string, newText: string) => void;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onAddTag, onEdit }) => {
  const isUser = message.role === 'user';
  const [isTagging, setIsTagging] = useState(false);
  const [tagInput, setTagInput] = useState('');
  
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message.text);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
      textareaRef.current.focus();
    }
  }, [isEditing]);

  const handleTagSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (tagInput.trim()) {
      onAddTag(message.id, tagInput.trim());
      setTagInput('');
      setIsTagging(false);
    }
  };

  const handleEditSubmit = () => {
    if (editText.trim() && editText !== message.text && onEdit) {
      onEdit(message.id, editText.trim());
      setIsEditing(false);
    } else {
      setIsEditing(false);
      setEditText(message.text);
    }
  };

  const handleEditCancel = () => {
    setIsEditing(false);
    setEditText(message.text);
  };

  return (
    <div className={cn("flex w-full mb-6 animate-in fade-in slide-in-from-bottom-2 duration-300", isUser ? "justify-end" : "justify-start")}>
      <div className={cn(
        "flex max-w-[90%] md:max-w-[80%] gap-4",
        isUser ? "flex-row-reverse" : "flex-row"
      )}>
        {/* Avatar */}
        <div className={cn(
          "w-9 h-9 rounded-xl flex items-center justify-center shrink-0 shadow-md",
          isUser 
            ? "bg-gradient-to-br from-blue-500 to-indigo-600 text-white" 
            : "bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-gray-100 dark:border-gray-700"
        )}>
          {isUser ? <UserIcon className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
        </div>

        {/* Content */}
        <div className={cn(
          "flex flex-col",
          isUser ? "items-end" : "items-start",
          "w-full min-w-0"
        )}>
          <div className={cn(
            "rounded-2xl px-6 py-4 shadow-sm text-sm md:text-base overflow-hidden w-full transition-shadow hover:shadow-md",
            isUser 
              ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white rounded-tr-sm" 
              : "bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 text-gray-800 dark:text-gray-100 rounded-tl-sm"
          )}>
            {/* Attachments Preview if any (for User messages) */}
            {message.attachments && message.attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4 pb-3 border-b border-white/20">
                {message.attachments.map((att) => (
                  <div key={att.id} className="flex items-center gap-2 bg-black/20 backdrop-blur-sm px-3 py-1.5 rounded-lg text-xs font-medium">
                    {att.type.startsWith('image') ? <ImageIcon className="w-3.5 h-3.5" /> : <FileText className="w-3.5 h-3.5" />}
                    <span className="truncate max-w-[120px]">{att.name}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Content Body */}
            {isEditing ? (
              <div className="flex flex-col gap-3 w-full animate-in fade-in">
                <textarea
                  ref={textareaRef}
                  value={editText}
                  onChange={(e) => {
                    setEditText(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = e.target.scrollHeight + 'px';
                  }}
                  className="w-full bg-blue-700/50 text-white placeholder-blue-200 rounded-lg p-3 text-sm border border-blue-400/50 focus:outline-none focus:ring-2 focus:ring-white/20 resize-none overflow-hidden"
                  rows={1}
                />
                <div className="flex justify-end gap-2">
                  <button 
                    onClick={handleEditCancel}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-blue-800/50 hover:bg-blue-800 rounded-lg transition-colors text-blue-100"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button 
                    onClick={handleEditSubmit}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-white text-blue-600 hover:bg-gray-100 rounded-lg font-bold transition-colors shadow-lg"
                  >
                    <Check className="w-3.5 h-3.5" /> Save Changes
                  </button>
                </div>
              </div>
            ) : (
              <div className={cn(
                "prose prose-sm max-w-none break-words",
                isUser 
                  ? "prose-invert prose-p:leading-relaxed prose-pre:bg-blue-800/50 prose-pre:border prose-pre:border-white/10" 
                  : "prose-stone dark:prose-invert prose-p:leading-relaxed prose-pre:shadow-sm"
              )}>
                <ReactMarkdown>{message.text}</ReactMarkdown>
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mt-2 px-1">
             <div className="text-[11px] font-medium text-gray-400 dark:text-gray-500">
               {formatTime(message.timestamp)}
             </div>

             {/* Tags Display */}
             {message.tags && message.tags.map((tag, idx) => (
                <span key={idx} className="flex items-center text-[10px] bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded-full border border-gray-200 dark:border-gray-700">
                  #{tag}
                </span>
             ))}

             {/* Actions */}
             <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-y-1 group-hover:translate-y-0">
               {/* Edit Button (User only) */}
               {isUser && onEdit && !isEditing && (
                 <button
                    onClick={() => setIsEditing(true)}
                    className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                    title="Edit message"
                 >
                   <Pencil className="w-3.5 h-3.5" />
                 </button>
               )}

               {/* Tag Button */}
               {!isTagging && (
                 <button 
                   onClick={() => setIsTagging(true)}
                   className="p-1.5 text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                   title="Tag this message"
                 >
                   <Tag className="w-3.5 h-3.5" />
                 </button>
               )}
             </div>

             {/* Tag Input */}
             {isTagging && (
               <form onSubmit={handleTagSubmit} className="flex items-center animate-in fade-in zoom-in-95">
                 <input
                   type="text"
                   autoFocus
                   value={tagInput}
                   onChange={(e) => setTagInput(e.target.value)}
                   onBlur={() => !tagInput && setIsTagging(false)}
                   className="text-xs bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-200 rounded-md px-2 py-1 w-28 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:border-blue-400"
                   placeholder="Type & press Enter..."
                 />
               </form>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;