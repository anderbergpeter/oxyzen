import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { supabase, supabaseConfigured } from './supabase';

interface AuthValue {
  configured: boolean;
  ready: boolean;
  session: Session | null;
  userId: string | null;
  email: string | null;
  localMode: boolean;
  useLocalMode: () => void;
  leaveLocalMode: () => void;
  sendCode: (email: string) => Promise<string | null>;
  verifyCode: (email: string, code: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthValue | null>(null);
const LOCAL_MODE_KEY = 'oxyzen.localMode';

function translate(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('rate limit') || m.includes('security purposes')) return 'Vänta en minut innan du begär en ny kod.';
  if (m.includes('invalid') || m.includes('expired')) return 'Fel eller utgången kod. Försök igen.';
  if (m.includes('network') || m.includes('fetch')) return 'Ingen kontakt med servern. Kolla nätet.';
  if (m.includes('signups not allowed')) return 'Den här e-postadressen är inte registrerad hos oss.';
  return message;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [localMode, setLocalMode] = useState(false);
  const [ready, setReady] = useState(!supabaseConfigured);

  useEffect(() => {
    if (!supabase) return;
    Promise.all([supabase.auth.getSession(), AsyncStorage.getItem(LOCAL_MODE_KEY)])
      .then(([{ data }, local]) => {
        setSession(data.session);
        setLocalMode(local === '1');
      })
      .finally(() => setReady(true));
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthValue>(
    () => ({
      configured: supabaseConfigured,
      ready,
      session,
      userId: session?.user.id ?? null,
      email: session?.user.email ?? null,
      localMode,
      useLocalMode: () => {
        setLocalMode(true);
        AsyncStorage.setItem(LOCAL_MODE_KEY, '1').catch(() => undefined);
      },
      leaveLocalMode: () => {
        setLocalMode(false);
        AsyncStorage.removeItem(LOCAL_MODE_KEY).catch(() => undefined);
      },
      sendCode: async (email) => {
        if (!supabase) return 'Ingen server konfigurerad.';
        const { error } = await supabase.auth.signInWithOtp({
          email: email.trim().toLowerCase(),
          options: { shouldCreateUser: true },
        });
        return error ? translate(error.message) : null;
      },
      verifyCode: async (email, code) => {
        if (!supabase) return 'Ingen server konfigurerad.';
        const { error } = await supabase.auth.verifyOtp({
          email: email.trim().toLowerCase(),
          token: code.trim(),
          type: 'email',
        });
        if (!error) {
          setLocalMode(false);
          AsyncStorage.removeItem(LOCAL_MODE_KEY).catch(() => undefined);
        }
        return error ? translate(error.message) : null;
      },
      signOut: async () => {
        await supabase?.auth.signOut();
      },
    }),
    [ready, session, localMode],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth måste användas inom AuthProvider');
  return ctx;
}
