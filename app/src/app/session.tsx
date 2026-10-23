import { Ionicons } from '@expo/vector-icons';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, AppState, Pressable, Text, View } from 'react-native';
import { useConfirm } from '@/components/ConfirmSheet';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, Muted } from '@/components/ui';
import {
  cancelSwitchNotifications,
  ensureNotificationPermission,
  fireAlarm,
  prepareAlarm,
  releaseAlarm,
  scheduleSwitchNotifications,
  type PlannedSwitch,
} from '@/lib/alarm';
import { formatClock, formatPressure } from '@/lib/format';
import { parseCycle } from '@/lib/protocols';
import { useActions, useStore } from '@/lib/store';
import { colors, fonts, radius, space } from '@/lib/theme';
import type { MaskCycle } from '@/lib/types';

interface Phase {
  maskOn: boolean;
  startSec: number;
  endSec: number;
}

function buildPhases(durationMin: number, cycle: MaskCycle): Phase[] {
  const total = durationMin * 60;
  const c = parseCycle(cycle);
  if (!c) return [{ maskOn: true, startSec: 0, endSec: total }];
  const phases: Phase[] = [];
  let t = 0;
  let maskOn = true;
  while (t < total) {
    const len = (maskOn ? c.on : c.off) * 60;
    const end = Math.min(total, t + len);
    // Sista korta restbiten slås ihop med föregående fas om den är under 2 minuter.
    if (!maskOn && total - t < 120 && phases.length > 0) {
      phases[phases.length - 1].endSec = total;
      break;
    }
    phases.push({ maskOn, startSec: t, endSec: end });
    t = end;
    maskOn = !maskOn;
  }
  return phases;
}

const KEEP_AWAKE_TAG = 'oxyzen-session';

function useSafeKeepAwake() {
  useEffect(() => {
    let active = false;
    activateKeepAwakeAsync(KEEP_AWAKE_TAG)
      .then(() => {
        active = true;
      })
      .catch(() => undefined);
    return () => {
      if (!active) return;
      try {
        deactivateKeepAwake(KEEP_AWAKE_TAG);
      } catch {
        // webben kastar om låset inte hann aktiveras
      }
    };
  }, []);
}

export default function SessionScreen() {
  useSafeKeepAwake();
  const { confirm, sheet } = useConfirm();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ pressure: string; duration: string; cycle: MaskCycle }>();
  const pressure = parseFloat(params.pressure ?? '1.5');
  const durationMin = parseInt(params.duration ?? '60', 10);
  const cycle = (params.cycle ?? '20/5') as MaskCycle;
  const totalSec = durationMin * 60;

  const { state, derived } = useStore();
  const actions = useActions();
  const phases = useMemo(() => buildPhases(durationMin, cycle), [durationMin, cycle]);

  const startedAt = useRef(Date.now());
  const pausedTotal = useRef(0);
  const pausedAt = useRef<number | null>(null);
  const [paused, setPaused] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);
  const lastPhaseIndex = useRef(0);
  const flash = useRef(new Animated.Value(0)).current;
  const savedRef = useRef(false);

  const computeElapsed = useCallback(() => {
    const now = pausedAt.current ?? Date.now();
    return Math.max(0, (now - startedAt.current - pausedTotal.current) / 1000);
  }, []);

  const doFlash = useCallback(() => {
    if (!state.settings.flash) return;
    flash.setValue(0);
    Animated.loop(
      Animated.sequence([
        Animated.timing(flash, { toValue: 1, duration: 180, useNativeDriver: false }),
        Animated.timing(flash, { toValue: 0, duration: 180, useNativeDriver: false }),
      ]),
      { iterations: 5 },
    ).start();
  }, [flash, state.settings.flash]);

  // Förbered ljud och bakgrundsnotiser.
  useEffect(() => {
    prepareAlarm();
    if (state.settings.notifications && phases.length > 1) {
      ensureNotificationPermission().then((ok) => {
        if (!ok) return;
        const planned: PlannedSwitch[] = phases.slice(1).map((p) => ({
          atSeconds: p.startSec,
          title: p.maskOn ? 'Sätt på masken' : 'Ta av masken',
          body: p.maskOn ? 'Pausen är slut. Syrgas igen.' : 'Fem minuters paus utan mask.',
        }));
        planned.push({ atSeconds: totalSec, title: 'Sessionen är klar', body: 'Bra jobbat. Öppna appen för check-in.' });
        scheduleSwitchNotifications(planned);
      });
    }
    return () => {
      cancelSwitchNotifications();
      releaseAlarm();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Tick.
  useEffect(() => {
    const id = setInterval(() => setElapsed(computeElapsed()), 500);
    const sub = AppState.addEventListener('change', () => setElapsed(computeElapsed()));
    return () => {
      clearInterval(id);
      sub.remove();
    };
  }, [computeElapsed]);

  const phaseIndex = Math.min(
    phases.length - 1,
    Math.max(0, phases.findIndex((p) => elapsed < p.endSec)),
  );
  const phase = phases[phaseIndex];
  const remainingTotal = Math.max(0, totalSec - elapsed);
  const remainingPhase = Math.max(0, phase.endSec - elapsed);
  const hasCycle = phases.length > 1;

  // Larm vid fasbyte.
  useEffect(() => {
    if (phaseIndex !== lastPhaseIndex.current) {
      lastPhaseIndex.current = phaseIndex;
      fireAlarm(state.settings);
      doFlash();
    }
  }, [phaseIndex, state.settings, doFlash]);

  // Klart.
  useEffect(() => {
    if (!finished && elapsed >= totalSec) {
      setFinished(true);
      fireAlarm(state.settings);
      doFlash();
    }
  }, [elapsed, totalSec, finished, state.settings, doFlash]);

  const save = useCallback(
    (minutes: number) => {
      if (savedRef.current) return;
      savedRef.current = true;
      cancelSwitchNotifications();
      actions.updateSettings({ lastPressure: pressure, lastDuration: durationMin, lastCycle: cycle });
      const id = actions.addSession({
        date: new Date(startedAt.current).toISOString(),
        durationMin: minutes,
        pressure,
        cycle,
        completedInApp: true,
      });
      router.replace({ pathname: '/checkin', params: { id } });
    },
    [actions, pressure, cycle],
  );

  const togglePause = () => {
    if (paused) {
      if (pausedAt.current) pausedTotal.current += Date.now() - pausedAt.current;
      pausedAt.current = null;
      setPaused(false);
      // Notiser räknas från nu, planera om resten.
      if (state.settings.notifications && hasCycle) {
        const e = computeElapsed();
        const planned: PlannedSwitch[] = phases
          .slice(1)
          .filter((p) => p.startSec > e)
          .map((p) => ({
            atSeconds: p.startSec - e,
            title: p.maskOn ? 'Sätt på masken' : 'Ta av masken',
            body: p.maskOn ? 'Pausen är slut. Syrgas igen.' : 'Fem minuters paus utan mask.',
          }));
        planned.push({ atSeconds: totalSec - e, title: 'Sessionen är klar', body: 'Bra jobbat. Öppna appen för check-in.' });
        scheduleSwitchNotifications(planned);
      }
    } else {
      pausedAt.current = Date.now();
      setPaused(true);
      cancelSwitchNotifications();
    }
  };

  const endEarly = () => {
    const minutes = Math.round(elapsed / 60);
    if (minutes >= Math.round(durationMin * 0.5)) {
      confirm({
        title: 'Avsluta tidigt?',
        message: `Sessionen sparas som ${minutes} minuter.`,
        confirmLabel: 'Avsluta och spara',
        cancelLabel: 'Fortsätt sitta',
        onConfirm: () => save(minutes),
      });
    } else {
      confirm({
        title: 'Avbryta sessionen?',
        message: 'Du har suttit mindre än halva tiden. Sessionen sparas inte och räknas inte.',
        confirmLabel: 'Avbryt session',
        cancelLabel: 'Fortsätt sitta',
        danger: true,
        onConfirm: () => {
          cancelSwitchNotifications();
          router.replace('/hbot');
        },
      });
    }
  };

  const bgColor = flash.interpolate({
    inputRange: [0, 1],
    outputRange: [phase.maskOn && !finished ? colors.tealLight : colors.amberLight, colors.teal],
  });

  const phaseTitle = finished ? 'Klart' : !hasCycle ? 'Syrgas' : phase.maskOn ? 'Mask på' : 'Mask av';
  const phaseIcon: keyof typeof Ionicons.glyphMap = finished ? 'checkmark-circle' : phase.maskOn ? 'medical' : 'leaf';
  const nextLabel = finished
    ? ''
    : !hasCycle
      ? 'till slutet'
      : phaseIndex + 1 < phases.length
        ? phase.maskOn
          ? 'till pausen'
          : 'till masken går på'
        : 'till slutet';

  return (
    <Animated.View style={{ flex: 1, backgroundColor: bgColor, paddingTop: insets.top + space.md, paddingBottom: insets.bottom + space.lg, paddingHorizontal: space.lg }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.lg }}>
        <View style={{ flex: 1 }}>
          <Muted style={{ color: colors.tealDark }}>Session {derived.done + 1}</Muted>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.tealDarker }}>
            {formatPressure(pressure)} · {durationMin} min · {hasCycle ? `mask ${cycle}` : 'utan cykel'}
          </Text>
        </View>
        {paused ? (
          <View style={{ backgroundColor: colors.amberLight, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 }}>
            <Text style={{ color: colors.amberDark, fontSize: 14, fontWeight: '600' }}>Pausad</Text>
          </View>
        ) : null}
      </View>

      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Text style={{ fontSize: 72, fontWeight: '500', color: colors.text, letterSpacing: 1, fontVariant: ['tabular-nums'], fontFamily: fonts.serif }}>
          {formatClock(remainingTotal)}
        </Text>
        <Muted style={{ fontSize: 17, marginBottom: space.xl }}>kvar av {durationMin} minuter</Muted>

        <View
          style={{
            width: '100%',
            backgroundColor: 'rgba(255,255,255,0.7)',
            borderRadius: radius.lg,
            padding: space.xl,
            alignItems: 'center',
          }}
        >
          <Ionicons name={phaseIcon} size={36} color={finished ? colors.teal : phase.maskOn ? colors.tealDark : colors.amber} />
          <Text style={{ fontSize: 32, fontWeight: '500', color: colors.text, marginTop: 8, fontFamily: fonts.serif }}>{phaseTitle}</Text>
          {!finished ? (
            <>
              <Text style={{ fontSize: 44, fontWeight: '600', color: phase.maskOn ? colors.tealDark : colors.amber, marginTop: 4, fontVariant: ['tabular-nums'] }}>
                {formatClock(remainingPhase)}
              </Text>
              <Muted style={{ fontSize: 16 }}>{nextLabel}</Muted>
            </>
          ) : (
            <Muted style={{ fontSize: 16, marginTop: 4 }}>Bra jobbat. Ta av masken och res dig långsamt.</Muted>
          )}
        </View>

        {hasCycle ? (
          <View style={{ flexDirection: 'row', width: '100%', gap: 3, marginTop: space.xl }}>
            {phases.map((p, i) => {
              const done = elapsed >= p.endSec;
              const current = i === phaseIndex && !finished;
              return (
                <View
                  key={i}
                  style={{
                    flex: p.endSec - p.startSec,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: p.maskOn
                      ? done || current
                        ? colors.teal
                        : colors.tealMid
                      : done || current
                        ? colors.amber
                        : colors.amberMid,
                    opacity: done ? 1 : current ? 0.9 : 0.45,
                  }}
                />
              );
            })}
          </View>
        ) : null}
      </View>

      {finished ? (
        <Button title="Till check-in" icon="arrow-forward" onPress={() => save(durationMin)} />
      ) : (
        <View style={{ flexDirection: 'row', gap: space.sm }}>
          <Pressable
            onPress={togglePause}
            style={({ pressed }) => ({
              flex: 1,
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: radius.md,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Ionicons name={paused ? 'play' : 'pause'} size={18} color={colors.text} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text }}>{paused ? 'Fortsätt' : 'Pausa'}</Text>
          </Pressable>
          <Pressable
            onPress={endEarly}
            style={({ pressed }) => ({
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingVertical: 14,
              borderRadius: radius.md,
              backgroundColor: colors.card,
              borderWidth: 1,
              borderColor: colors.border,
              opacity: pressed ? 0.8 : 1,
            })}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.red }}>Avsluta</Text>
          </Pressable>
        </View>
      )}
      {sheet}
    </Animated.View>
  );
}
