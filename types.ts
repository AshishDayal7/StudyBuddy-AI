export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  data: string; // Base64 string
  mimeType: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  attachments?: Attachment[];
  tags?: string[];
  timestamp: number;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  messages: Message[];
  createdAt: number;
  updatedAt: number;
}

export type FileType = 'image' | 'pdf' | 'text';

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}
