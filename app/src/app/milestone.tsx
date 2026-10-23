import { router, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';
import { ProgressRing } from '@/components/ProgressRing';
import { Body, Button, Card, Muted, Pill, Screen } from '@/components/ui';
import { useStore } from '@/lib/store';
import { colors, space } from '@/lib/theme';

export default function Milestone() {
  const { at } = useLocalSearchParams<{ at: string }>();
  const { derived } = useStore();
  const n = parseInt(at ?? '0', 10);
  const m = derived.protocol.milestones.find((x) => x.at === n);

  if (!m) {
    return (
      <Screen padTop={false}>
        <Muted>Milstolpen finns inte i det här protokollet.</Muted>
        <Button title="Stäng" variant="ghost" onPress={() => router.back()} />
      </Screen>
    );
  }
  const reached = derived.done >= m.at;

  return (
    <Screen padTop={false}>
      <View style={{ alignItems: 'center', marginVertical: space.xl }}>
        <ProgressRing size={140} stroke={12} progress={Math.min(1, derived.done / m.at)} value={String(m.at)} label="sessioner" />
      </View>
      <View style={{ alignItems: 'center', marginBottom: space.md }}>
        <Pill tone={reached ? 'teal' : 'gray'}>{reached ? 'Uppnådd' : `${m.at - derived.done} kvar`}</Pill>
      </View>
      <Text style={{ fontSize: 24, fontWeight: '600', color: colors.text, textAlign: 'center', marginBottom: space.lg }}>
        {m.title}
      </Text>
      <Card>
        <Body>{m.long}</Body>
      </Card>
      <Muted style={{ textAlign: 'center', marginTop: space.md }}>
        Oxyzen är wellness, inte vård. Texterna beskriver hur det brukar kännas och vad studier mätt, inte vad du
        kommer att uppleva.
      </Muted>
      <Button title="Stäng" variant="ghost" onPress={() => router.back()} style={{ marginTop: space.lg }} />
    </Screen>
  );
}
