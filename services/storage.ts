import { get, set } from 'idb-keyval';
import { ChatSession, User } from "../types";

const SESSIONS_KEY_PREFIX = 'study_buddy_sessions_';
const USER_KEY = 'study_buddy_user';
const THEME_KEY = 'study_buddy_theme';

export const saveSession = async (session: ChatSession): Promise<void> => {
  const sessions = await getSessions(session.userId);
  sessions[session.id] = session;
  await set(`${SESSIONS_KEY_PREFIX}${session.userId}`, sessions);
};

export const getSessions = async (userId: string): Promise<Record<string, ChatSession>> => {
  try {
    const sessions = await get<Record<string, ChatSession>>(`${SESSIONS_KEY_PREFIX}${userId}`);
    return sessions || {};
  } catch (error) {
    console.error("Failed to load sessions from IDB:", error);
    return {};
  }
};

export const deleteSession = async (sessionId: string, userId: string): Promise<void> => {
  const sessions = await getSessions(userId);
  if (sessions[sessionId]) {
    delete sessions[sessionId];
    await set(`${SESSIONS_KEY_PREFIX}${userId}`, sessions);
  }
};

// Keep User and Theme in localStorage for synchronous access during app init to prevent layout shift
export const saveUser = (user: User) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e) {
    console.error("Local storage error", e);
  }
};

export const getUser = (): User | null => {
  const stored = localStorage.getItem(USER_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const removeUser = () => {
  localStorage.removeItem(USER_KEY);
};

export const createNewSession = (userId: string): ChatSession => {
  return {
    id: Math.random().toString(36).substring(2, 9),
    userId,
    title: 'New Study Session',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
};

export const getTheme = (): 'light' | 'dark' => {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'light';
};

export const saveTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem(THEME_KEY, theme);
};