import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useConfirm } from '@/components/ConfirmSheet';
import { Button, Card, Muted, Screen, Title } from '@/components/ui';
import { formatDateLong, formatPressure, formatTime } from '@/lib/format';
import { useActions, useStore } from '@/lib/store';
import { colors, space } from '@/lib/theme';
import type { Session } from '@/lib/types';

function Mood({ s }: { s: Session }) {
  if (!s.checkin) return <Muted>Ingen check-in</Muted>;
  const c = s.checkin;
  return (
    <Muted>
      Energi {c.energy} · Sömn {c.sleep} · Fokus {c.focus}
    </Muted>
  );
}

export default function History() {
  const { state } = useStore();
  const actions = useActions();
  const { confirm, sheet } = useConfirm();
  const sessions = [...state.sessions].reverse();

  return (
    <Screen>
      <Title sub={`${state.sessions.length} sessioner totalt`}>Historik</Title>
      <Button title="Logga session i efterhand" variant="secondary" icon="add" onPress={() => router.push('/log-session')} />
      <View style={{ height: space.md }} />
      {sessions.length === 0 ? (
        <Card>
          <Muted>Inga sessioner än.</Muted>
        </Card>
      ) : (
        sessions.map((s, i) => {
          const number = state.sessions.length - i;
          return (
            <Card key={s.id} style={{ paddingVertical: 12 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <View
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: colors.tealLight,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginRight: 12,
                  }}
                >
                  <Text style={{ fontWeight: '600', color: colors.tealDarker }}>{number}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 15, fontWeight: '600', color: colors.text }}>
                    {formatDateLong(s.date)} · {formatTime(s.date)}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                    {formatPressure(s.pressure)} · {s.durationMin} min ·{' '}
                    {s.cycle === 'none' ? 'utan maskcykel' : `mask ${s.cycle}`}
                    {s.completedInApp ? '' : ' · loggad'}
                  </Text>
                  <View style={{ marginTop: 2 }}>
                    <Mood s={s} />
                  </View>
                </View>
                <Pressable
                  onPress={() => router.push({ pathname: '/checkin', params: { id: s.id } })}
                  hitSlop={8}
                  style={{ padding: 6 }}
                >
                  <Ionicons name="create-outline" size={20} color={colors.textMuted} />
                </Pressable>
                <Pressable onPress={() =>
                    confirm({
                      title: 'Ta bort session?',
                      message: 'Sessionen räknas inte längre med i din resa.',
                      confirmLabel: 'Ta bort',
                      danger: true,
                      onConfirm: () => actions.removeSession(s.id),
                    })
                  } hitSlop={8} style={{ padding: 6 }}>
                  <Ionicons name="trash-outline" size={20} color={colors.textMuted} />
                </Pressable>
              </View>
            </Card>
          );
        })
      )}
      {sheet}
    </Screen>
  );
}
