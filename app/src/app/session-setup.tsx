import { router } from 'expo-router';
import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Button, Card, Muted, Screen, Segmented, Title } from '@/components/ui';
import { ADVANCED_PRESSURE, cycleOptions, durationOptions, parseCycle, pressureOptions } from '@/lib/protocols';
import { useStore } from '@/lib/store';
import { colors, space } from '@/lib/theme';
import type { MaskCycle } from '@/lib/types';

export default function SessionSetup() {
  const { state, derived } = useStore();
  const [pressure, setPressure] = useState(state.settings.lastPressure);
  const [duration, setDuration] = useState(state.settings.lastDuration);
  const [cycle, setCycle] = useState<MaskCycle>(state.settings.lastCycle);
  const [advanced, setAdvanced] = useState(false);

  const c = parseCycle(cycle);
  const switches = c ? Math.floor(duration / (c.on + c.off)) : 0;
  const seniorWarn = derived.age !== null && derived.age >= 65 && pressure > 1.6;

  return (
    <Screen padTop={false}>
      <Title sub={`Session ${derived.done + 1} · ${derived.protocol.name}`}>Inställningar</Title>

      <Text style={styles.label}>Tryck</Text>
      <Segmented
        options={pressureOptions
          .filter((p) => advanced || p <= ADVANCED_PRESSURE)
          .map((p) => ({ value: p, label: p.toFixed(1).replace('.', ',') }))}
        value={pressure}
        onChange={setPressure}
      />
      <Muted style={{ marginTop: 6 }}>Trycket styrs av kammaren, det här är för din egen logg.</Muted>
      {seniorWarn ? (
        <Text style={{ fontSize: 13, color: colors.amberText, marginTop: 6 }}>Över 1,6 ATA för 65+: stäm av med personalen.</Text>
      ) : null}
      {!advanced ? (
        <Button
          title="Visa avancerade tryck (över 2,0)"
          variant="ghost"
          onPress={() => setAdvanced(true)}
          style={{ alignSelf: 'flex-start', paddingHorizontal: 0 }}
        />
      ) : (
        <Text style={{ fontSize: 13, color: colors.amberText, marginTop: 8 }}>
          Över 2,0 ATA är inte ett wellness-protokoll. Bara efter överenskommelse med personalen.
        </Text>
      )}

      <View style={{ height: space.lg }} />
      <Text style={styles.label}>Längd</Text>
      <Segmented options={durationOptions.map((d) => ({ value: d, label: `${d} min` }))} value={duration} onChange={setDuration} />

      <View style={{ height: space.lg }} />
      <Text style={styles.label}>Maskcykel</Text>
      <Segmented options={cycleOptions.map((o) => ({ value: o.value, label: o.label }))} value={cycle} onChange={setCycle} />
      <Muted style={{ marginTop: 6 }}>{cycleOptions.find((o) => o.value === cycle)?.hint}</Muted>

      <Card style={{ marginTop: space.xl }}>
        <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text, marginBottom: 4 }}>Så fungerar det</Text>
        <Text style={{ fontSize: 14, color: colors.textSecondary, lineHeight: 20 }}>
          {c
            ? `Appen larmar med ljud, vibration och blinkande skärm varje gång du ska ta av eller sätta på masken. Med ${cycle} och ${duration} minuter blir det ${switches} paus${switches === 1 ? '' : 'er'}. Skärmen hålls tänd under sessionen.`
            : 'Inga larm. Appen räknar bara ner tiden och håller skärmen tänd.'}
        </Text>
      </Card>

      <Button
        title="Starta"
        icon="play"
        onPress={() =>
          router.replace({
            pathname: '/session',
            params: { pressure: String(pressure), duration: String(duration), cycle },
          })
        }
      />
      <Button title="Avbryt" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}

const styles = {
  label: { fontSize: 13, color: colors.textSecondary, marginBottom: 6, fontWeight: '500' as const },
};
