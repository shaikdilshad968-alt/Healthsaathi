import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { HealthProfile, FoodLogEntry, Reminder, ActionItem, ChatMessage, WellnessLog } from '@/types';
import {
  DEMO_PROFILES, DEMO_FOOD_LOG, DEMO_REMINDERS, DEMO_ACTIONS,
  DEMO_CHAT_MESSAGES, DEMO_WELLNESS_LOGS, ACTIVE_PROFILE_ID,
} from '@/lib/demoData';

const LOCAL_ACCOUNTS_KEY = 'healthsaathi:local-accounts';
const AUTH_SESSION_KEY = 'healthsaathi:auth-email';
const ACTIVE_PROFILE_KEY = 'healthsaathi:active-profile';
const DEMO_ACCOUNT_EMAIL = 'demo@healthsaathi.local';
const getChatStorageKey = (profileId: string) => `healthsaathi:chat:${profileId}`;

interface LocalAccount {
  email: string;
  passwordSalt: string;
  passwordHash: string;
  profile: HealthProfile;
}

export type SignUpProfile = Omit<HealthProfile, 'id' | 'created_at' | 'updated_at'>;

function readProfileChat(profileId: string): ChatMessage[] {
  try {
    const value = localStorage.getItem(getChatStorageKey(profileId));
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed as ChatMessage[] : [];
  } catch {
    return [];
  }
}

function getInitialChatMessages() {
  const email = localStorage.getItem(AUTH_SESSION_KEY);
  if (email === DEMO_ACCOUNT_EMAIL) return DEMO_CHAT_MESSAGES;
  const profileId = localStorage.getItem(ACTIVE_PROFILE_KEY);
  return email && profileId ? readProfileChat(profileId) : DEMO_CHAT_MESSAGES;
}

function readLocalAccounts(): LocalAccount[] {
  try {
    const value = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    const parsed: unknown = value ? JSON.parse(value) : [];
    return Array.isArray(parsed) ? parsed as LocalAccount[] : [];
  } catch {
    return [];
  }
}

function makeSalt() {
  return Array.from(crypto.getRandomValues(new Uint8Array(16)), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function hashPassword(password: string, salt: string) {
  const saltBytes = new Uint8Array(salt.match(/.{2}/g)!.map(byte => Number.parseInt(byte, 16)));
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const digest = await crypto.subtle.deriveBits({ name: 'PBKDF2', salt: saltBytes, iterations: 120000, hash: 'SHA-256' }, key, 256);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

// ──────────────────────────────────────────────────────────────
// App State Context
// ──────────────────────────────────────────────────────────────
interface AppState {
  isDemoMode: boolean;
  isAuthenticated: boolean;
  currentUserEmail: string | null;
  profiles: HealthProfile[];
  activeProfileId: string;
  foodLog: FoodLogEntry[];
  reminders: Reminder[];
  actions: ActionItem[];
  chatMessages: ChatMessage[];
  wellnessLogs: WellnessLog[];

  setActiveProfile: (id: string) => void;
  signUp: (email: string, password: string, profile: SignUpProfile) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInDemo: () => void;
  signOut: () => void;
  updateProfile: (profile: HealthProfile) => void;
  addFoodLog: (entry: FoodLogEntry) => void;
  removeFoodLog: (id: string) => void;
  addReminder: (r: Reminder) => void;
  updateReminder: (r: Reminder) => void;
  removeReminder: (id: string) => void;
  updateActionStatus: (id: string, status: ActionItem['status']) => void;
  addChatMessage: (msg: ChatMessage) => void;
  addWellnessLog: (log: WellnessLog) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [accounts, setAccounts] = useState<LocalAccount[]>(readLocalAccounts);
  const [profiles, setProfiles] = useState<HealthProfile[]>(() => [
    ...DEMO_PROFILES,
    ...readLocalAccounts().map(account => account.profile),
  ]);
  const [activeProfileId, setActiveProfileId] = useState(() => localStorage.getItem(ACTIVE_PROFILE_KEY) ?? ACTIVE_PROFILE_ID);
  const [currentUserEmail, setCurrentUserEmail] = useState<string | null>(() => localStorage.getItem(AUTH_SESSION_KEY));
  const [foodLog, setFoodLog] = useState<FoodLogEntry[]>(DEMO_FOOD_LOG);
  const [reminders, setReminders] = useState<Reminder[]>(DEMO_REMINDERS);
  const [actions, setActions] = useState<ActionItem[]>(DEMO_ACTIONS);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(getInitialChatMessages);
  const [wellnessLogs, setWellnessLogs] = useState<WellnessLog[]>(DEMO_WELLNESS_LOGS);

  const isAuthenticated = currentUserEmail === DEMO_ACCOUNT_EMAIL
    || accounts.some(account => account.email === currentUserEmail);

  useEffect(() => {
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(accounts));
  }, [accounts]);

  const setActiveProfile = useCallback((id: string) => {
    setActiveProfileId(id);
    localStorage.setItem(ACTIVE_PROFILE_KEY, id);
    setChatMessages(currentUserEmail === DEMO_ACCOUNT_EMAIL
      ? id === ACTIVE_PROFILE_ID ? DEMO_CHAT_MESSAGES : []
      : readProfileChat(id));
  }, [currentUserEmail]);

  const signUp = useCallback(async (email: string, password: string, profileData: SignUpProfile) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (accounts.some(account => account.email === normalizedEmail)) {
      throw new Error('An account with this email already exists.');
    }

    const now = new Date().toISOString();
    const profile: HealthProfile = {
      ...profileData,
      id: crypto.randomUUID(),
      created_at: now,
      updated_at: now,
    };
    const passwordSalt = makeSalt();
    const passwordHash = await hashPassword(password, passwordSalt);
    const account = { email: normalizedEmail, passwordSalt, passwordHash, profile };
    const nextAccounts = [...accounts, account];

    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(nextAccounts));
    localStorage.setItem(AUTH_SESSION_KEY, normalizedEmail);
    localStorage.setItem(ACTIVE_PROFILE_KEY, profile.id);
    setAccounts(nextAccounts);
    setProfiles(previous => [...previous, profile]);
    setActiveProfileId(profile.id);
    setCurrentUserEmail(normalizedEmail);
    setChatMessages([]);
  }, [accounts]);

  const signIn = useCallback(async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase();
    const account = accounts.find(item => item.email === normalizedEmail);
    if (!account || await hashPassword(password, account.passwordSalt) !== account.passwordHash) {
      throw new Error('Email or password is incorrect.');
    }

    localStorage.setItem(AUTH_SESSION_KEY, normalizedEmail);
    localStorage.setItem(ACTIVE_PROFILE_KEY, account.profile.id);
    setActiveProfileId(account.profile.id);
    setCurrentUserEmail(normalizedEmail);
    setChatMessages(readProfileChat(account.profile.id));
  }, [accounts]);

  const signInDemo = useCallback(() => {
    localStorage.setItem(AUTH_SESSION_KEY, DEMO_ACCOUNT_EMAIL);
    localStorage.setItem(ACTIVE_PROFILE_KEY, ACTIVE_PROFILE_ID);
    setActiveProfileId(ACTIVE_PROFILE_ID);
    setCurrentUserEmail(DEMO_ACCOUNT_EMAIL);
    setChatMessages(DEMO_CHAT_MESSAGES);
  }, []);

  const signOut = useCallback(() => {
    localStorage.removeItem(AUTH_SESSION_KEY);
    localStorage.setItem(ACTIVE_PROFILE_KEY, ACTIVE_PROFILE_ID);
    setCurrentUserEmail(null);
    setActiveProfileId(ACTIVE_PROFILE_ID);
    setChatMessages([]);
  }, []);

  const updateProfile = useCallback((updated: HealthProfile) => {
    setProfiles(prev => prev.map(p => p.id === updated.id ? updated : p));
    setAccounts(prev => prev.map(account => account.profile.id === updated.id ? { ...account, profile: updated } : account));
  }, []);

  const addFoodLog = useCallback((entry: FoodLogEntry) => {
    setFoodLog(prev => [entry, ...prev]);
  }, []);

  const removeFoodLog = useCallback((id: string) => {
    setFoodLog(prev => prev.filter(f => f.id !== id));
  }, []);

  const addReminder = useCallback((r: Reminder) => {
    setReminders(prev => [r, ...prev]);
  }, []);

  const updateReminder = useCallback((updated: Reminder) => {
    setReminders(prev => prev.map(r => r.id === updated.id ? updated : r));
  }, []);

  const removeReminder = useCallback((id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
  }, []);

  const updateActionStatus = useCallback((id: string, status: ActionItem['status']) => {
    setActions(prev => prev.map(a => a.id === id ? { ...a, status } : a));
  }, []);

  const addChatMessage = useCallback((msg: ChatMessage) => {
    setChatMessages(previous => {
      const next = [...previous, msg];
      if (currentUserEmail && currentUserEmail !== DEMO_ACCOUNT_EMAIL) {
        try {
          localStorage.setItem(getChatStorageKey(activeProfileId), JSON.stringify(next));
        } catch {
          // Keep the current conversation usable if browser storage is unavailable.
        }
      }
      return next;
    });
  }, [activeProfileId, currentUserEmail]);

  const addWellnessLog = useCallback((log: WellnessLog) => {
    setWellnessLogs(prev => [log, ...prev]);
  }, []);

  const resetDemoData = useCallback(() => {
    setProfiles([...DEMO_PROFILES, ...accounts.map(account => account.profile)]);
    setActiveProfileId(ACTIVE_PROFILE_ID);
    setFoodLog(DEMO_FOOD_LOG);
    setReminders(DEMO_REMINDERS);
    setActions(DEMO_ACTIONS);
    setChatMessages(currentUserEmail === DEMO_ACCOUNT_EMAIL ? DEMO_CHAT_MESSAGES : readProfileChat(activeProfileId));
    setWellnessLogs(DEMO_WELLNESS_LOGS);
  }, [accounts, activeProfileId, currentUserEmail]);

  return (
    <AppContext.Provider value={{
      isDemoMode: true,
      isAuthenticated,
      currentUserEmail,
      profiles,
      activeProfileId,
      foodLog,
      reminders,
      actions,
      chatMessages,
      wellnessLogs,
      setActiveProfile,
      signUp,
      signIn,
      signInDemo,
      signOut,
      updateProfile,
      addFoodLog,
      removeFoodLog,
      addReminder,
      updateReminder,
      removeReminder,
      updateActionStatus,
      addChatMessage,
      addWellnessLog,
      resetDemoData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function useActiveProfile(): HealthProfile | undefined {
  const { profiles, activeProfileId } = useApp();
  return profiles.find(p => p.id === activeProfileId);
}
