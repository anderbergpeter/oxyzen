import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Card, Muted, Screen, Title } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useStore } from '@/lib/store';
import { colors, space } from '@/lib/theme';

export default function Journey() {
  const { state, derived } = useStore();
  const { protocol, done, target } = derived;

  const dateOfSession = (n: number) => state.sessions[n - 1]?.date;

  return (
    <Screen>
      <Title sub={protocol.name}>Min resa</Title>

      {protocol.milestones.length === 0 ? (
        <Card>
          <Body>
            Underhåll har inga milstolpar. Målet är {protocol.perWeek}, alltså ungefär 4–8 sessioner i månaden.
          </Body>
          <Muted style={{ marginTop: 8 }}>Denna månad: {derived.sessionsThisMonth} sessioner.</Muted>
        </Card>
      ) : (
        <View style={{ paddingLeft: 6 }}>
          {protocol.milestones.map((m, i) => {
            const reached = m.at <= done;
            const isNext = !reached && (i === 0 || protocol.milestones[i - 1].at <= done);
            const last = i === protocol.milestones.length - 1;
            const date = reached ? dateOfSession(m.at) : undefined;
            return (
              <Pressable
                key={m.at}
                onPress={() => router.push({ pathname: '/milestone', params: { at: String(m.at) } })}
                style={{ flexDirection: 'row' }}
              >
                <View style={{ width: 28, alignItems: 'center' }}>
                  <View
                    style={{
                      width: 18,
                      height: 18,
                      borderRadius: 9,
                      backgroundColor: reached ? colors.teal : colors.card,
                      borderWidth: 2,
                      borderColor: reached || isNext ? colors.teal : colors.gray,
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginTop: 2,
                    }}
                  >
                    {reached ? <Ionicons name="checkmark" size={11} color="#fff" /> : null}
                  </View>
                  {!last ? (
                    <View style={{ flex: 1, width: 2, backgroundColor: reached ? colors.teal : colors.border, marginVertical: 2 }} />
                  ) : null}
                </View>
                <View style={{ flex: 1, paddingLeft: space.md, paddingBottom: last ? 0 : space.xl }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: '600',
                      color: reached ? colors.text : isNext ? colors.tealDark : colors.textMuted,
                    }}
                  >
                    {m.at} · {m.title}
                  </Text>
                  <Text style={{ fontSize: 13, color: colors.textSecondary, marginTop: 2 }}>
                    {reached
                      ? date
                        ? `Klar ${formatDate(date)}`
                        : 'Klar'
                      : isNext
                        ? `Du är på ${done}, ${m.at - done} kvar`
                        : ''}
                  </Text>
                  {isNext ? (
                    <Text style={{ fontSize: 14, color: colors.text, marginTop: 6, lineHeight: 20 }}>{m.short}</Text>
                  ) : null}
                </View>
              </Pressable>
            );
          })}
        </View>
      )}

      {target && done >= target ? (
        <Card tone="amber" style={{ marginTop: space.xl }}>
          <Text style={{ fontSize: 15, fontWeight: '600', color: colors.amberDark }}>Dags för paus</Text>
          <Text style={{ fontSize: 14, color: colors.amberText, marginTop: 4, lineHeight: 20 }}>
            Hela protokollet är genomfört. Vila 4–8 veckor, sedan Underhåll eller en ny kur.
          </Text>
        </Card>
      ) : null}
    </Screen>
  );
}
