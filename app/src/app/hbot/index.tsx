import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { ProgressRing } from '@/components/ProgressRing';
import { TrendChart } from '@/components/TrendChart';
import { Button, Card, Muted, Row, Screen, SectionTitle } from '@/components/ui';
import { formatPressure, relativeDay } from '@/lib/format';
import { PAUSE_WEEKS } from '@/lib/protocols';
import { useStore } from '@/lib/store';
import { colors, fonts, space } from '@/lib/theme';

export default function Home() {
  const { state, derived } = useStore();
  const { protocol, done, remaining, target, progress, nextMilestone, lastSession, protocolComplete } = derived;

  const recent = state.sessions.filter((s) => s.checkin).slice(-8);
  const series = [
    { label: 'Energi', color: colors.teal, values: recent.map((s) => s.checkin!.energy) },
    { label: 'Sömn', color: colors.blue, values: recent.map((s) => s.checkin!.sleep) },
    { label: 'Fokus', color: colors.amber, values: recent.map((s) => s.checkin!.focus) },
  ];

  return (
    <Screen>
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: space.xl }}>
        <Pressable
          onPress={() => router.replace('/')}
          hitSlop={8}
          style={({ pressed }) => ({
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: colors.card,
            borderWidth: 1,
            borderColor: colors.border,
            alignItems: 'center',
            justifyContent: 'center',
            marginRight: space.md,
            opacity: pressed ? 0.7 : 1,
          })}
        >
          <Ionicons name="grid-outline" size={18} color={colors.tealDark} />
        </Pressable>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 25, fontWeight: '500', color: colors.text, fontFamily: fonts.serif }}>
            Hyperbar syrgasbehandling
          </Text>
          <Muted>
            {protocol.name}
            {target ? ` · ${target} sessioner` : ''}
          </Muted>
        </View>
      </View>

      <View style={{ alignItems: 'center', marginVertical: space.md }}>
        <ProgressRing
          progress={target ? progress : 0}
          value={String(done)}
          label={target ? `av ${target}` : 'sessioner'}
        />
      </View>

      {protocolComplete ? (
        <Card tone="amber">
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.amberDark, marginBottom: 4 }}>
            Protokollet är klart
          </Text>
          <Text style={{ fontSize: 16, color: colors.amberText, lineHeight: 24 }}>
            Vi rekommenderar en paus på {PAUSE_WEEKS[0]}–{PAUSE_WEEKS[1]} veckor. Byt sedan till Underhåll eller starta
            en ny kur under Profil.
          </Text>
        </Card>
      ) : nextMilestone ? (
        <Card tone="teal" onPress={() => router.push({ pathname: '/milestone', params: { at: String(nextMilestone.at) } })}>
          <Muted style={{ color: colors.tealDark }}>Nästa milstolpe</Muted>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={{ fontSize: 19, fontWeight: '600', color: colors.tealDarker, flex: 1 }}>
              {nextMilestone.at} · {nextMilestone.title}
            </Text>
            <Text style={{ fontSize: 16, color: colors.tealDark }}>
              om {nextMilestone.at - done} {nextMilestone.at - done === 1 ? 'session' : 'sessioner'}
            </Text>
          </View>
        </Card>
      ) : null}

      {derived.daysSinceLast !== null &&
      state.settings.reminders &&
      derived.daysSinceLast >= state.settings.reminderDays &&
      !protocolComplete ? (
        <Card tone="amber">
          <Text style={{ fontSize: 17, fontWeight: '600', color: colors.amberDark, marginBottom: 4 }}>Dags för nästa?</Text>
          <Text style={{ fontSize: 16, color: colors.amberText, lineHeight: 24 }}>
            Det har gått {derived.daysSinceLast} dagar sedan senast. Protokollen bygger på 3–5 sessioner i veckan,
            det är kontinuiteten som bär effekten.
          </Text>
        </Card>
      ) : null}

      <Button
        title="Starta session"
        icon="play"
        onPress={() => router.push('/session-setup')}
        style={{ marginTop: space.xs, marginBottom: space.md }}
      />

      {remaining === 0 ? (
        <Card tone="blue" style={{ marginTop: space.md }}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons name="information-circle-outline" size={18} color={colors.blue} style={{ marginRight: 8 }} />
            <Text style={{ fontSize: 16, color: colors.blueDark, flex: 1 }}>
              Inga sessioner kvar på kortet. Fyll på i receptionen, så syns det här direkt.
            </Text>
          </View>
        </Card>
      ) : null}

      <SectionTitle>Senaste</SectionTitle>
      <Card>
        {lastSession ? (
          <>
            <Row label="Senaste session" value={relativeDay(lastSession.date)} />
            <Row label="Tryck" value={formatPressure(lastSession.pressure)} />
            <Row label="Längd" value={`${lastSession.durationMin} min`} last />
          </>
        ) : (
          <Muted>Du har inte gjort någon session än. Tryck på Starta session när du sitter i kammaren.</Muted>
        )}
      </Card>

      {recent.length >= 2 ? (
        <>
          <SectionTitle>Hur du mått</SectionTitle>
          <Card>
            <TrendChart series={series} />
            <Muted style={{ marginTop: 8 }}>Dina egna svar efter de senaste {recent.length} sessionerna, skala 1–5.</Muted>
          </Card>
        </>
      ) : null}
    </Screen>
  );
}
