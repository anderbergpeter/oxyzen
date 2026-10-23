import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from 'react';
import { getProtocol, recommendedPressure } from './protocols';
import type {
  AppState,
  Checkin,
  Milestone,
  Profile,
  Protocol,
  ProtocolId,
  Purchase,
  Session,
  Settings,
} from './types';

const STORAGE_KEY = 'oxyzen.state.v2';

// Startläge: kunden har precis köpt 40 sessioner och loggat in.
// Köp och saldo kommer från centret, inte från appen.
export const initialState: AppState = {
  onboarded: true,
  profile: {
    name: '',
    birthYear: null,
    protocolId: 'deep',
    protocolStartedAt: new Date().toISOString(),
  },
  purchases: [{ id: 'seed-40', date: new Date().toISOString(), count: 40, note: 'Paket 40 sessioner' }],
  sessions: [],
  settings: { sound: true, haptics: true, flash: true, notifications: true, reminders: true, reminderDays: 5 },
};

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'reset' }
  | { type: 'completeOnboarding'; profile: Profile; purchase?: Purchase }
  | { type: 'updateProfile'; patch: Partial<Profile> }
  | { type: 'setProtocol'; protocolId: ProtocolId }
  | { type: 'addPurchase'; purchase: Purchase }
  | { type: 'removePurchase'; id: string }
  | { type: 'addSession'; session: Session }
  | { type: 'updateSession'; id: string; patch: Partial<Session> }
  | { type: 'removeSession'; id: string }
  | { type: 'setCheckin'; id: string; checkin: Checkin }
  | { type: 'updateSettings'; patch: Partial<Settings> };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'hydrate':
      return { ...initialState, ...action.state, settings: { ...initialState.settings, ...action.state.settings } };
    case 'reset':
      return { ...initialState, profile: { ...initialState.profile, protocolStartedAt: new Date().toISOString() } };
    case 'completeOnboarding':
      return {
        ...state,
        onboarded: true,
        profile: action.profile,
        purchases: action.purchase ? [...state.purchases, action.purchase] : state.purchases,
      };
    case 'updateProfile':
      return { ...state, profile: { ...state.profile, ...action.patch } };
    case 'setProtocol':
      return {
        ...state,
        profile: { ...state.profile, protocolId: action.protocolId },
      };
    case 'addPurchase':
      return { ...state, purchases: [...state.purchases, action.purchase] };
    case 'removePurchase':
      return { ...state, purchases: state.purchases.filter((p) => p.id !== action.id) };
    case 'addSession':
      return {
        ...state,
        sessions: [...state.sessions, action.session].sort((a, b) => a.date.localeCompare(b.date)),
      };
    case 'updateSession':
      return {
        ...state,
        sessions: state.sessions
          .map((s) => (s.id === action.id ? { ...s, ...action.patch } : s))
          .sort((a, b) => a.date.localeCompare(b.date)),
      };
    case 'removeSession':
      return { ...state, sessions: state.sessions.filter((s) => s.id !== action.id) };
    case 'setCheckin':
      return {
        ...state,
        sessions: state.sessions.map((s) =>
          s.id === action.id ? { ...s, checkin: action.checkin } : s,
        ),
      };
    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };
    default:
      return state;
  }
}

export interface Derived {
  protocol: Protocol;
  age: number | null;
  done: number;
  purchased: number;
  remaining: number;
  target: number | null;
  progress: number; // 0..1
  nextMilestone: Milestone | null;
  reachedMilestones: Milestone[];
  lastSession: Session | null;
  recommendedPressure: number;
  protocolComplete: boolean;
  sessionsThisMonth: number;
  streakWeeks: number;
  daysSinceLast: number | null;
}

interface StoreValue {
  state: AppState;
  ready: boolean;
  derived: Derived;
  dispatch: React.Dispatch<Action>;
}

const StoreContext = createContext<StoreValue | null>(null);

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function computeDerived(state: AppState): Derived {
  const protocol = getProtocol(state.profile.protocolId);
  const year = new Date().getFullYear();
  const age = state.profile.birthYear ? year - state.profile.birthYear : null;
  const done = state.sessions.length;
  const purchased = state.purchases.reduce((sum, p) => sum + p.count, 0);
  const remaining = Math.max(0, purchased - done);
  const target = protocol.sessions;
  const progress = target ? Math.min(1, done / target) : 0;
  const reachedMilestones = protocol.milestones.filter((m) => m.at <= done);
  const nextMilestone = protocol.milestones.find((m) => m.at > done) ?? null;
  const lastSession = done > 0 ? state.sessions[done - 1] : null;
  const now = new Date();
  const sessionsThisMonth = state.sessions.filter((s) => {
    const d = new Date(s.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
  }).length;

  // Antal sammanhängande veckor (bakåt från denna vecka) med minst en session.
  let streakWeeks = 0;
  const weekOf = (d: Date) => {
    const t = new Date(d);
    t.setHours(0, 0, 0, 0);
    const day = (t.getDay() + 6) % 7;
    t.setDate(t.getDate() - day);
    return t.getTime();
  };
  const weeks = new Set(state.sessions.map((s) => weekOf(new Date(s.date))));
  let cursor = weekOf(now);
  if (!weeks.has(cursor)) cursor -= 7 * 86400000;
  while (weeks.has(cursor)) {
    streakWeeks += 1;
    cursor -= 7 * 86400000;
  }

  return {
    protocol,
    age,
    done,
    purchased,
    remaining,
    target,
    progress,
    nextMilestone,
    reachedMilestones,
    lastSession,
    recommendedPressure: recommendedPressure(protocol, age),
    protocolComplete: target !== null && done >= target,
    sessionsThisMonth,
    streakWeeks,
    daysSinceLast: lastSession
      ? Math.floor((now.getTime() - new Date(lastSession.date).getTime()) / 86400000)
      : null,
  };
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = React.useState(false);
  const hydrated = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as AppState;
          dispatch({ type: 'hydrate', state: parsed });
        }
      })
      .catch(() => undefined)
      .finally(() => {
        hydrated.current = true;
        setReady(true);
      });
  }, []);

  useEffect(() => {
    if (!hydrated.current) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => undefined);
  }, [state]);

  const derived = useMemo(() => computeDerived(state), [state]);
  const value = useMemo(() => ({ state, ready, derived, dispatch }), [state, ready, derived]);

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore måste användas inom StoreProvider');
  return ctx;
}

export function useActions() {
  const { dispatch } = useStore();
  return useMemo(
    () => ({
      completeOnboarding: (profile: Profile, purchase?: Purchase) =>
        dispatch({ type: 'completeOnboarding', profile, purchase }),
      updateProfile: (patch: Partial<Profile>) => dispatch({ type: 'updateProfile', patch }),
      setProtocol: (protocolId: ProtocolId) => dispatch({ type: 'setProtocol', protocolId }),
      addPurchase: (count: number, note?: string) =>
        dispatch({
          type: 'addPurchase',
          purchase: { id: uid(), date: new Date().toISOString(), count, note },
        }),
      removePurchase: (id: string) => dispatch({ type: 'removePurchase', id }),
      addSession: (session: Omit<Session, 'id'>): string => {
        const id = uid();
        dispatch({ type: 'addSession', session: { ...session, id } });
        return id;
      },
      updateSession: (id: string, patch: Partial<Session>) =>
        dispatch({ type: 'updateSession', id, patch }),
      removeSession: (id: string) => dispatch({ type: 'removeSession', id }),
      setCheckin: (id: string, checkin: Checkin) => dispatch({ type: 'setCheckin', id, checkin }),
      updateSettings: (patch: Partial<Settings>) => dispatch({ type: 'updateSettings', patch }),
      reset: () => dispatch({ type: 'reset' }),
    }),
    [dispatch],
  );
}

export function useSessionById(id: string | undefined) {
  const { state } = useStore();
  return useCallback(() => state.sessions.find((s) => s.id === id) ?? null, [state.sessions, id])();
}
