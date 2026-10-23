import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { Body, Card, Muted, Screen, Title } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { FULL_EFFECT_SESSIONS } from '@/lib/protocols';
import { useStore } from '@/lib/store';
import { colors, space } from '@/lib/theme';

export default function Journey() {
  const { state, derived } = useStore();
  const { protocol, journey, done, target } = derived;

  const dateOfSession = (n: number) => state.sessions[n - 1]?.date;
  const showTargetMarker = target !== null && target < FULL_EFFECT_SESSIONS;

  return (
    <Screen>
      <Title sub={protocol.name}>Min resa</Title>
      <Muted style={{ marginBottom: space.xl }}>
        Resan går alltid till {FULL_EFFECT_SESSIONS} sessioner, oavsett vilket protokoll du valt.
      </Muted>

      <View style={{ paddingLeft: 6 }}>
        {journey.map((m, i) => {
          const reached = m.at <= done;
          const isNext = !reached && (i === 0 || journey[i - 1].at <= done);
          const last = i === journey.length - 1;
          const date = reached ? dateOfSession(m.at) : undefined;
          const isTarget = showTargetMarker && m.at === target;
          const isFull = m.at === FULL_EFFECT_SESSIONS;
          return (
            <Pressable
              key={m.at}
              onPress={() => router.push({ pathname: '/milestone', params: { at: String(m.at) } })}
              style={{ flexDirection: 'row' }}
            >
              <View style={{ width: 28, alignItems: 'center' }}>
                <View
                  style={{
                    width: isFull ? 24 : 18,
                    height: isFull ? 24 : 18,
                    borderRadius: 12,
                    backgroundColor: reached ? colors.teal : colors.card,
                    borderWidth: 2,
                    borderColor: reached || isNext || isFull ? colors.teal : colors.gray,
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginTop: 2,
                  }}
                >
                  {reached ? (
                    <Ionicons name="checkmark" size={isFull ? 15 : 11} color="#fff" />
                  ) : isFull ? (
                    <Ionicons name="star" size={12} color={colors.teal} />
                  ) : null}
                </View>
                {!last ? (
                  <View style={{ flex: 1, width: 2, backgroundColor: reached ? colors.teal : colors.border, marginVertical: 2 }} />
                ) : null}
              </View>
              <View style={{ flex: 1, paddingLeft: space.md, paddingBottom: last ? 0 : space.xl }}>
                <Text
                  style={{
                    fontSize: 19,
                    fontWeight: '600',
                    color: reached ? colors.text : isNext ? colors.tealDark : colors.textMuted,
                  }}
                >
                  {m.at} · {m.title}
                </Text>
                <Text style={{ fontSize: 15, color: colors.textSecondary, marginTop: 2 }}>
                  {reached
                    ? date
                      ? `Klar ${formatDate(date)}`
                      : 'Klar'
                    : isNext
                      ? `Du är på ${done}, ${m.at - done} kvar`
                      : ''}
                </Text>
                {isNext ? (
                  <Text style={{ fontSize: 16, color: colors.text, marginTop: 6, lineHeight: 24 }}>{m.short}</Text>
                ) : null}
                {isTarget ? (
                  <View
                    style={{
                      alignSelf: 'flex-start',
                      backgroundColor: colors.tealLight,
                      paddingHorizontal: 10,
                      paddingVertical: 4,
                      borderRadius: 999,
                      marginTop: 8,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: colors.tealDarker, fontWeight: '600' }}>
                      Ditt protokoll {protocol.name} slutar här
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>

      {target && done >= target ? (
        <Card tone="amber" style={{ marginTop: space.xl }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.amberDark }}>
            {done >= FULL_EFFECT_SESSIONS ? 'Dags för paus' : 'Protokollet är klart'}
          </Text>
          <Text style={{ fontSize: 16, color: colors.amberText, marginTop: 4, lineHeight: 24 }}>
            {done >= FULL_EFFECT_SESSIONS
              ? 'Hela kuren är genomförd. Vila 4–8 veckor, sedan Underhåll eller en ny kur.'
              : `Du har nått målet för ${protocol.name}. Vill du fortsätta mot ${FULL_EFFECT_SESSIONS} byter du till Longevity under Profil, sessionerna räknas med.`}
          </Text>
        </Card>
      ) : null}

      {protocol.sessions === null ? (
        <Card style={{ marginTop: space.xl }}>
          <Body>Underhåll: målet är {protocol.perWeek}. Denna månad: {derived.sessionsThisMonth} sessioner.</Body>
        </Card>
      ) : null}
    </Screen>
  );
}
