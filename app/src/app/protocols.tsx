import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Card, Muted, Pill, Screen, Title } from '@/components/ui';
import { formatPressure } from '@/lib/format';
import { protocols } from '@/lib/protocols';
import { useActions, useStore } from '@/lib/store';
import { colors, space } from '@/lib/theme';

export default function Protocols() {
  const { state, derived } = useStore();
  const actions = useActions();

  return (
    <Screen padTop={false}>
      <Title sub="Byt när du vill, sessionerna räknas med">Protokoll</Title>
      {protocols.map((p) => {
        const active = p.id === state.profile.protocolId;
        const seniorWarn = derived.age !== null && derived.age >= 65 && p.pressure > 1.6;
        return (
          <Pressable
            key={p.id}
            onPress={() => {
              actions.setProtocol(p.id);
              if (!active) actions.updateProfile({ protocolStartedAt: new Date().toISOString() });
              router.back();
            }}
          >
            <Card style={{ borderColor: active ? colors.teal : colors.border, borderWidth: active ? 2 : 1 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                <Text style={{ fontSize: 17, fontWeight: '600', color: colors.text, flex: 1 }}>{p.name}</Text>
                {active ? <Pill>Aktivt</Pill> : null}
              </View>
              <Muted style={{ marginBottom: 8 }}>{p.tagline}</Muted>
              <Body style={{ fontSize: 14, lineHeight: 20 }}>{p.description}</Body>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
                <Pill tone="gray">{p.sessions === null ? 'Löpande' : `${p.sessions} sessioner`}</Pill>
                <Pill tone="gray">{formatPressure(p.pressure)}</Pill>
                <Pill tone="gray">{p.durationMin} min</Pill>
                <Pill tone="gray">{p.perWeek}</Pill>
              </View>
              {seniorWarn ? (
                <Text style={{ fontSize: 12, color: colors.amber, marginTop: 8 }}>
                  Vi föreslår max 1,6 ATA för 65+. Appen sänker trycket automatiskt, personalen kan ändra.
                </Text>
              ) : null}
            </Card>
          </Pressable>
        );
      })}
      <Button title="Stäng" variant="ghost" onPress={() => router.back()} style={{ marginTop: space.md }} />
    </Screen>
  );
}
