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
import { getProtocol, journeyMilestonesFor, recommendedPressure } from './protocols';
import { clearQueue, enqueue, flush, opsForAction, pull, type Pulled } from './sync';
import { useAuth } from './auth';
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
  settings: { sound: true, haptics: true, flash: true, notifications: true, reminders: true, reminderDays: 5, lastPressure: 1.5, lastDuration: 60, lastCycle: '20/5' },
};

type Action =
  | { type: 'hydrate'; state: AppState }
  | { type: 'hydrateRemote'; data: Pulled }
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
    case 'hydrateRemote':
      // Servern är sanningen för köp och sessioner. Profil och inställningar
      // slås ihop med lokala värden (servern vinner där den har något).
      return {
        ...state,
        onboarded: true,
        profile: { ...state.profile, ...action.data.profile },
        settings: { ...state.settings, ...action.data.settings },
        purchases: action.data.purchases,
        sessions: [...action.data.sessions].sort((a, b) => a.date.localeCompare(b.date)),
      };
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
  journey: Milestone[];
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
  dispatch: (action: Action) => void;
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
  const journey = journeyMilestonesFor(protocol);
  const reachedMilestones = journey.filter((m) => m.at <= done);
  const nextMilestone = journey.find((m) => m.at > done) ?? null;
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
    journey,
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
  const [state, rawDispatch] = useReducer(reducer, initialState);
  const [ready, setReady] = React.useState(false);
  const hydrated = useRef(false);
  const stateRef = useRef(state);
  stateRef.current = state;
  const auth = useAuth();
  const userIdRef = useRef<string | null>(auth.userId);
  userIdRef.current = auth.userId;

  // Varje ändring går till reducern och, om inloggad, till synk-kön.
  const dispatch = useCallback(
    (action: Action) => {
      const before = stateRef.current;
      const after = reducer(before, action);
      rawDispatch(action);
      const uid = userIdRef.current;
      if (uid) {
        for (const op of opsForAction(action as { type: string }, before, after)) {
          enqueue(op, uid).catch(() => undefined);
        }
      }
    },
    [],
  );

  // Inloggad: hämta allt från servern och skicka det som ligger i kön.
  useEffect(() => {
    if (!ready || !auth.userId) return;
    const uid = auth.userId;
    (async () => {
      // Sessioner som gjorts utan konto följer med upp (upsert, ofarligt att upprepa).
      for (const session of stateRef.current.sessions) {
        await enqueue({ type: 'upsertSession', session }, uid).catch(() => undefined);
      }
      await flush(uid).catch(() => undefined);
      try {
        const data = await pull(uid);
        if (data) rawDispatch({ type: 'hydrateRemote', data });
      } catch {
        // offline: behåll lokala data
      }
    })();
  }, [ready, auth.userId]);

  // Utloggad från ett inloggat läge: rensa lokalt så nästa kund inte ser datan.
  const wasLoggedIn = useRef(false);
  useEffect(() => {
    if (auth.userId) wasLoggedIn.current = true;
    else if (wasLoggedIn.current) {
      wasLoggedIn.current = false;
      clearQueue().catch(() => undefined);
      rawDispatch({ type: 'reset' });
    }
  }, [auth.userId]);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) {
          const parsed = JSON.parse(raw) as AppState;
          rawDispatch({ type: 'hydrate', state: parsed });
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
