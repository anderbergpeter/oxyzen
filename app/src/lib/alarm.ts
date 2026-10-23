import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import type { Settings } from './types';

const alarmSource = require('../../assets/alarm.wav');

let player: AudioPlayer | null = null;

export async function prepareAlarm() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, shouldPlayInBackground: true });
  } catch {
    // Webben saknar audio mode, ignorera.
  }
  if (!player) {
    try {
      player = createAudioPlayer(alarmSource);
    } catch {
      player = null;
    }
  }
}

export async function fireAlarm(settings: Settings) {
  if (settings.sound) {
    try {
      if (!player) player = createAudioPlayer(alarmSource);
      await player.seekTo(0);
      player.play();
    } catch {
      // ignorera
    }
  }
  if (settings.haptics && Platform.OS !== 'web') {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 250);
      setTimeout(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy), 500);
    } catch {
      // ignorera
    }
  }
}

export function releaseAlarm() {
  try {
    player?.remove();
  } catch {
    // ignorera
  }
  player = null;
}

// Bakgrundsnotiser: schemalägger en notis per maskbyte så att larmet
// kommer även om appen ligger i bakgrunden eller skärmen är låst.

let handlerSet = false;

export async function ensureNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false;
  try {
    if (!handlerSet) {
      Notifications.setNotificationHandler({
        handleNotification: async () => ({
          shouldShowBanner: true,
          shouldShowList: true,
          shouldPlaySound: true,
          shouldSetBadge: false,
        }),
      });
      handlerSet = true;
    }
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('mask', {
        name: 'Maskbyten',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 300, 200, 300],
        sound: 'default',
      });
    }
    const current = await Notifications.getPermissionsAsync();
    if (current.granted) return true;
    const req = await Notifications.requestPermissionsAsync();
    return req.granted;
  } catch {
    return false;
  }
}

export interface PlannedSwitch {
  atSeconds: number;
  title: string;
  body: string;
}

const switchIds: string[] = [];

export async function scheduleSwitchNotifications(switches: PlannedSwitch[]) {
  if (Platform.OS === 'web') return;
  try {
    await cancelSwitchNotifications();
    for (const s of switches) {
      if (s.atSeconds < 1) continue;
      const id = await Notifications.scheduleNotificationAsync({
        content: { title: s.title, body: s.body, sound: 'default' },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
          seconds: Math.round(s.atSeconds),
          channelId: 'mask',
        },
      });
      switchIds.push(id);
    }
  } catch {
    // ignorera
  }
}

export async function cancelSwitchNotifications() {
  if (Platform.OS === 'web') return;
  try {
    const ids = switchIds.splice(0);
    await Promise.all(ids.map((id) => Notifications.cancelScheduledNotificationAsync(id)));
  } catch {
    // ignorera
  }
}
