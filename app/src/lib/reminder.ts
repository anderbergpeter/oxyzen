import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { ensureNotificationPermission } from './alarm';
import type { AppState } from './types';

const REMINDER_ID = 'oxyzen-reminder';

export const REMINDER_TITLE = 'Dags för nästa session?';

export function reminderBody(days: number): string {
  return `Det har gått ${days} dagar sedan senast. Protokollen bygger på 3–5 sessioner i veckan, det är kontinuiteten som bär effekten.`;
}

// Schemalägger en påminnelse X dagar efter senaste sessionen, kl 10.
// Anropas varje gång en session sparas eller inställningen ändras.
export async function syncReminder(state: AppState) {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(REMINDER_ID);
  } catch {
    // fanns ingen
  }
  if (!state.settings.reminders || state.sessions.length === 0) return;
  const ok = await ensureNotificationPermission();
  if (!ok) return;
  const last = new Date(state.sessions[state.sessions.length - 1].date);
  const when = new Date(last);
  when.setDate(when.getDate() + state.settings.reminderDays);
  when.setHours(10, 0, 0, 0);
  if (when.getTime() <= Date.now()) return;
  try {
    await Notifications.scheduleNotificationAsync({
      identifier: REMINDER_ID,
      content: { title: REMINDER_TITLE, body: reminderBody(state.settings.reminderDays) },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: when },
    });
  } catch {
    // ignorera
  }
}
