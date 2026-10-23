import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Body, Button, Field, Muted, Screen, Segmented, Title } from '@/components/ui';
import { cycleOptions, durationOptions, pressureOptions } from '@/lib/protocols';
import { useActions, useStore } from '@/lib/store';
import { colors, space } from '@/lib/theme';
import type { MaskCycle } from '@/lib/types';

function daysAgoIso(days: number, hour = 10) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
}

export default function LogSession() {
  const { state, derived } = useStore();
  const actions = useActions();
  const [daysAgo, setDaysAgo] = useState(0);
  const [customDate, setCustomDate] = useState('');
  const [pressure, setPressure] = useState(state.settings.lastPressure);
  const [duration, setDuration] = useState(state.settings.lastDuration);
  const [cycle, setCycle] = useState<MaskCycle>(state.settings.lastCycle);
  const [showCycle, setShowCycle] = useState(false);

  const parsed = customDate ? new Date(customDate) : null;
  const customOk = parsed !== null && !Number.isNaN(parsed.getTime());

  const save = () => {
    const date = customOk ? parsed!.toISOString() : daysAgoIso(daysAgo);
    const id = actions.addSession({ date, durationMin: duration, pressure, cycle, completedInApp: false });
    router.replace({ pathname: '/checkin', params: { id } });
  };

  return (
    <Screen padTop={false}>
      <Title>Logga session</Title>
      <Body style={{ marginBottom: space.lg }}>För en session du gjorde utan appen igång.</Body>

      <Text style={styles.label}>När</Text>
      <Segmented
        options={[
          { value: 0, label: 'Idag' },
          { value: 1, label: 'Igår' },
          { value: 2, label: '2 dagar sedan' },
          { value: 3, label: '3 dagar sedan' },
        ]}
        value={daysAgo}
        onChange={(v) => {
          setDaysAgo(v);
          setCustomDate('');
        }}
      />
      <View style={{ height: space.md }} />
      <Field
        label="Eller datum (ÅÅÅÅ-MM-DD)"
        value={customDate}
        onChangeText={setCustomDate}
        placeholder="2026-10-14"
        hint={customDate && !customOk ? 'Ogiltigt datum' : undefined}
      />

      <Text style={styles.label}>Tryck</Text>
      <Segmented
        options={pressureOptions.filter((p) => p <= 2.0).map((p) => ({ value: p, label: p.toFixed(1).replace('.', ',') }))}
        value={pressure}
        onChange={setPressure}
      />
      <View style={{ height: space.lg }} />

      <Text style={styles.label}>Längd</Text>
      <Segmented options={durationOptions.map((d) => ({ value: d, label: `${d} min` }))} value={duration} onChange={setDuration} />
      <View style={{ height: space.lg }} />

      {showCycle ? (
        <>
          <Text style={styles.label}>Maskcykel</Text>
          <Segmented options={cycleOptions.map((o) => ({ value: o.value, label: o.label }))} value={cycle} onChange={setCycle} />
          <Muted style={{ marginTop: 6 }}>{cycleOptions.find((o) => o.value === cycle)?.hint}</Muted>
        </>
      ) : (
        <Button
          title={`Maskcykel ${cycleOptions.find((o) => o.value === cycle)?.label ?? ''} · Ändra`}
          variant="ghost"
          onPress={() => setShowCycle(true)}
          style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
        />
      )}

      <View style={{ height: space.xl }} />
      <Button title="Spara och gå till check-in" onPress={save} disabled={!!customDate && !customOk} />
      <Button title="Avbryt" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = {
  label: { fontSize: 15, color: colors.textSecondary, marginBottom: 6, fontWeight: '500' as const },
};
