import { router, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Button, Field, Muted, Screen, Title } from '@/components/ui';
import { useActions, useStore } from '@/lib/store';
import { colors, space } from '@/lib/theme';

function Scale({ label, value, onChange, low, high }: { label: string; value: number; onChange: (v: number) => void; low: string; high: string }) {
  return (
    <View style={{ marginBottom: space.xl }}>
      <Text style={{ fontSize: 18, fontWeight: '600', color: colors.text, marginBottom: 10 }}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8 }}>
        {[1, 2, 3, 4, 5].map((n) => {
          const active = n === value;
          return (
            <Pressable
              key={n}
              onPress={() => onChange(n)}
              style={{
                flex: 1,
                height: 48,
                borderRadius: 10,
                borderWidth: active ? 2 : 1,
                borderColor: active ? colors.teal : colors.border,
                backgroundColor: active ? colors.tealLight : colors.card,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Text style={{ fontSize: 19, fontWeight: '600', color: active ? colors.tealDarker : colors.textSecondary }}>{n}</Text>
            </Pressable>
          );
        })}
      </View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 6 }}>
        <Muted>{low}</Muted>
        <Muted>{high}</Muted>
      </View>
    </View>
  );
}

export default function CheckinScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { state, derived } = useStore();
  const actions = useActions();
  const session = state.sessions.find((s) => s.id === id);
  const [energy, setEnergy] = useState(session?.checkin?.energy ?? 3);
  const [sleep, setSleep] = useState(session?.checkin?.sleep ?? 3);
  const [focus, setFocus] = useState(session?.checkin?.focus ?? 3);
  const [note, setNote] = useState(session?.checkin?.note ?? '');

  const number = session ? state.sessions.findIndex((s) => s.id === session.id) + 1 : derived.done;
  const milestone = derived.journey.find((m) => m.at === number);

  const done = () => {
    if (session) actions.setCheckin(session.id, { energy, sleep, focus, note: note.trim() || undefined });
    if (milestone && number === derived.done) {
      router.replace({ pathname: '/milestone', params: { at: String(milestone.at) } });
    } else {
      router.back();
    }
  };

  return (
    <Screen padTop={false}>
      <Title sub={`Session ${number}`}>Hur känns det?</Title>
      <Body style={{ marginBottom: space.xl }}>Tre snabba frågor. Dina svar blir kurvorna på startsidan.</Body>
      <Scale label="Energi just nu" value={energy} onChange={setEnergy} low="Slut" high="Pigg" />
      <Scale label="Sömnen senaste natten" value={sleep} onChange={setSleep} low="Dålig" high="Toppen" />
      <Scale label="Fokus idag" value={focus} onChange={setFocus} low="Spretigt" high="Skarpt" />
      <Field label="Anteckning (valfritt)" value={note} onChangeText={setNote} placeholder="Lite tryck i vänster öra" multiline />
      <Button title="Spara" onPress={done} />
      <Button title="Hoppa över" variant="ghost" onPress={() => router.back()} />
    </Screen>
  );
}
