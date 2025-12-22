import React, { useRef } from 'react';
import { Paperclip, X, FileText, Image as ImageIcon, File, Sparkles } from 'lucide-react';
import { Attachment } from '../types';
import { fileToBase64, cn } from '../services/utils';

interface FileUploadProps {
  attachments: Attachment[];
  onAttachmentsChange: (attachments: Attachment[]) => void;
  onSummarize: (attachment: Attachment) => void;
}

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB limit

const FileUpload: React.FC<FileUploadProps> = ({ attachments, onAttachmentsChange, onSummarize }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newAttachments: Attachment[] = [];
      
      for (let i = 0; i < e.target.files.length; i++) {
        const file = e.target.files[i];
        
        if (file.size > MAX_FILE_SIZE) {
          alert(`File ${file.name} is too large. Max size is 50MB.`);
          continue;
        }

        try {
          const base64 = await fileToBase64(file);
          
          newAttachments.push({
            id: Math.random().toString(36).substring(7),
            name: file.name,
            type: file.type,
            mimeType: file.type,
            data: base64
          });
        } catch (error) {
          console.error("Error reading file:", error);
          alert(`Failed to upload ${file.name}`);
        }
      }

      onAttachmentsChange([...attachments, ...newAttachments]);
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    onAttachmentsChange(attachments.filter(a => a.id !== id));
  };

  const getIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-purple-500" />;
    if (mimeType === 'application/pdf') return <FileText className="w-4 h-4 text-red-500" />;
    return <File className="w-4 h-4 text-blue-500" />;
  };

  return (
    <div className="flex flex-col gap-2">
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachments.map((att) => (
            <div key={att.id} className="group flex items-center gap-2 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 px-3 py-1.5 rounded-full text-xs animate-in fade-in zoom-in duration-200 hover:border-blue-300 dark:hover:border-blue-500 transition-colors">
              {getIcon(att.mimeType)}
              <span className="max-w-[150px] truncate font-medium text-gray-700 dark:text-gray-200">{att.name}</span>
              
              <div className="flex items-center gap-1 pl-1 border-l border-gray-300 dark:border-gray-500 ml-1">
                 <button
                  onClick={() => onSummarize(att)}
                  className="p-1 hover:bg-blue-100 dark:hover:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  title="Summarize this document"
                >
                  <Sparkles className="w-3 h-3" />
                </button>
                <button 
                  onClick={() => removeAttachment(att.id)}
                  className="p-1 hover:bg-red-100 dark:hover:bg-gray-600 rounded-full text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors"
                  title="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <input
        type="file"
        multiple
        ref={fileInputRef}
        className="hidden"
        // Accepting common study formats
        accept="image/*,.pdf,.txt,.md,.xml,.json,.csv,.js,.ts,.py,.java"
        onChange={handleFileChange}
      />
      
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "p-2 rounded-full transition-colors hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400",
          attachments.length > 0 ? "text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50" : ""
        )}
        title="Upload documents or images"
      >
        <Paperclip className="w-5 h-5" />
      </button>
    </div>
  );
};

export default FileUpload;