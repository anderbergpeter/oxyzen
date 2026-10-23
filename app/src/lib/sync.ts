import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';
import type { AppState as State, Checkin, MaskCycle, Profile, Purchase, Session, Settings } from './types';

// Synk mot Supabase.
// - pull(): hämtar allt för inloggad kund (servern är sanningen).
// - push-operationer köas lokalt och skickas när det går. Går nätet ner
//   ligger de kvar i kön och försöker igen vid nästa start eller ändring.

const QUEUE_KEY = 'oxyzen.queue.v1';

export type Op =
  | { type: 'upsertProfile'; profile: Profile; settings: Settings }
  | { type: 'upsertSession'; session: Session }
  | { type: 'deleteSession'; id: string };

interface Row {
  id: string;
  date: string;
  duration_min: number;
  pressure: number | string;
  cycle: string;
  completed_in_app: boolean;
  checkin: Checkin | null;
}

export interface Pulled {
  profile: Partial<Profile>;
  settings: Partial<Settings>;
  purchases: Purchase[];
  sessions: Session[];
}

export async function pull(userId: string): Promise<Pulled | null> {
  if (!supabase) return null;
  const [p, pu, se] = await Promise.all([
    supabase.from('profiles').select('name, protocol_id, protocol_started_at, settings').eq('id', userId).maybeSingle(),
    supabase.from('purchases').select('id, count, note, created_at').eq('user_id', userId).order('created_at'),
    supabase
      .from('sessions')
      .select('id, date, duration_min, pressure, cycle, completed_in_app, checkin')
      .eq('user_id', userId)
      .order('date'),
  ]);
  if (p.error || pu.error || se.error) {
    throw new Error(p.error?.message ?? pu.error?.message ?? se.error?.message);
  }
  const prof = p.data;
  return {
    profile: prof
      ? {
          name: prof.name ?? '',
          protocolId: prof.protocol_id as Profile['protocolId'],
          protocolStartedAt: prof.protocol_started_at,
        }
      : {},
    settings: (prof?.settings as Partial<Settings>) ?? {},
    purchases: (pu.data ?? []).map((r) => ({ id: r.id, date: r.created_at, count: r.count, note: r.note ?? undefined })),
    sessions: (se.data as Row[] | null ?? []).map((r) => ({
      id: r.id,
      date: r.date,
      durationMin: r.duration_min,
      pressure: Number(r.pressure),
      cycle: r.cycle as MaskCycle,
      completedInApp: r.completed_in_app,
      checkin: r.checkin ?? undefined,
    })),
  };
}

async function readQueue(): Promise<Op[]> {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? (JSON.parse(raw) as Op[]) : [];
  } catch {
    return [];
  }
}

async function writeQueue(ops: Op[]) {
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(ops));
}

async function run(op: Op, userId: string): Promise<void> {
  if (!supabase) return;
  if (op.type === 'upsertProfile') {
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      name: op.profile.name,
      protocol_id: op.profile.protocolId,
      protocol_started_at: op.profile.protocolStartedAt,
      settings: op.settings,
    });
    if (error) throw error;
  } else if (op.type === 'upsertSession') {
    const s = op.session;
    const { error } = await supabase.from('sessions').upsert({
      id: s.id,
      user_id: userId,
      date: s.date,
      duration_min: s.durationMin,
      pressure: s.pressure,
      cycle: s.cycle,
      completed_in_app: s.completedInApp,
      checkin: s.checkin ?? null,
    });
    if (error) throw error;
  } else if (op.type === 'deleteSession') {
    const { error } = await supabase.from('sessions').delete().eq('id', op.id).eq('user_id', userId);
    if (error) throw error;
  }
}

let flushing = false;

// Skickar kön i ordning. Stannar vid första felet och behåller resten.
export async function flush(userId: string): Promise<number> {
  if (!supabase || flushing) return 0;
  flushing = true;
  try {
    let ops = await readQueue();
    let sent = 0;
    while (ops.length > 0) {
      try {
        await run(ops[0], userId);
      } catch {
        break;
      }
      ops = ops.slice(1);
      await writeQueue(ops);
      sent += 1;
    }
    return sent;
  } finally {
    flushing = false;
  }
}

export async function enqueue(op: Op, userId: string | null) {
  if (!supabase || !userId) return;
  const ops = await readQueue();
  // Slå ihop upprepade profiluppdateringar, det räcker med den senaste.
  const merged = op.type === 'upsertProfile' ? ops.filter((o) => o.type !== 'upsertProfile') : ops;
  await writeQueue([...merged, op]);
  await flush(userId);
}

export async function clearQueue() {
  await AsyncStorage.removeItem(QUEUE_KEY);
}

export function opsForAction(action: { type: string; [k: string]: unknown }, before: State, after: State): Op[] {
  switch (action.type) {
    case 'updateProfile':
    case 'setProtocol':
    case 'updateSettings':
      return [{ type: 'upsertProfile', profile: after.profile, settings: after.settings }];
    case 'addSession':
    case 'updateSession':
    case 'setCheckin': {
      const id = (action.type === 'addSession' ? (action.session as Session).id : action.id) as string;
      const s = after.sessions.find((x) => x.id === id);
      return s ? [{ type: 'upsertSession', session: s }] : [];
    }
    case 'removeSession':
      return [{ type: 'deleteSession', id: action.id as string }];
    default:
      return [];
  }
}
