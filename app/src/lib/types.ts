export type MaskCycle = '20/5' | '25/5' | '30/5' | 'none';

export type ProtocolId =
  | 'trial'
  | 'base'
  | 'deep'
  | 'longevity'
  | 'blueprint'
  | 'senior'
  | 'maintenance';

export interface Milestone {
  at: number;
  title: string;
  short: string;
  long: string;
}

export interface Protocol {
  id: ProtocolId;
  name: string;
  tagline: string;
  description: string;
  sessions: number | null; // null = inget slutmål (underhåll)
  pressure: number; // ATA
  pressureRange: [number, number];
  durationMin: number;
  cycle: MaskCycle;
  perWeek: string;
  audience: string;
  milestones: Milestone[];
  advanced?: boolean;
}

export interface Checkin {
  energy: number; // 1-5
  sleep: number; // 1-5
  focus: number; // 1-5
  note?: string;
}

export interface Session {
  id: string;
  date: string; // ISO
  durationMin: number;
  pressure: number;
  cycle: MaskCycle;
  completedInApp: boolean;
  checkin?: Checkin;
}

export interface Purchase {
  id: string;
  date: string;
  count: number;
  note?: string;
}

export interface Profile {
  name: string;
  birthYear: number | null;
  protocolId: ProtocolId;
  protocolStartedAt: string;
}

export interface Settings {
  sound: boolean;
  haptics: boolean;
  flash: boolean;
  notifications: boolean;
  reminders: boolean;
  reminderDays: number;
  lastPressure: number;
  lastDuration: number;
  lastCycle: MaskCycle;
}

export interface AppState {
  onboarded: boolean;
  profile: Profile;
  purchases: Purchase[];
  sessions: Session[];
  settings: Settings;
}
