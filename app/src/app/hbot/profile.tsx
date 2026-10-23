import { router } from 'expo-router';
import React from 'react';
import { Platform, Switch, Text, View, type SwitchProps } from 'react-native';
import { useConfirm } from '@/components/ConfirmSheet';
import { WheelPicker } from '@/components/WheelPicker';
import { Button, Card, Muted, Row, Screen, SectionTitle, Title } from '@/components/ui';
import { formatDate } from '@/lib/format';
import { useAuth } from '@/lib/auth';
import { useActions, useStore } from '@/lib/store';
import { colors, space } from '@/lib/theme';

const reminderDayValues = Array.from({ length: 180 }, (_, i) => i + 1);

// Webben ignorerar trackColor, där heter det activeTrackColor/activeThumbColor.
const switchColors = {
  trackColor: { true: colors.teal, false: colors.gray },
  thumbColor: Platform.OS === 'android' ? colors.card : undefined,
  ...(Platform.OS === 'web' ? { activeTrackColor: colors.teal, activeThumbColor: colors.card } : {}),
} as SwitchProps;

export default function Profile() {
  const { state, derived } = useStore();
  const actions = useActions();
  const { confirm, sheet } = useConfirm();
  const auth = useAuth();

  const resetAll = () =>
    confirm({
      title: 'Radera all data?',
      message: 'All historik och alla inställningar försvinner från den här enheten.',
      confirmLabel: 'Radera allt',
      danger: true,
      onConfirm: () => {
        actions.reset();
        router.replace('/hbot');
      },
    });

  const toggle = (key: keyof typeof state.settings) => (v: boolean) => actions.updateSettings({ [key]: v });

  return (
    <Screen>
      <Title>Profil</Title>

      <SectionTitle>Protokoll</SectionTitle>
      <Card>
        <Row label="Aktivt protokoll" value={derived.protocol.name} onPress={() => router.push('/protocols')} />
        <Row label="Mål" value={derived.target ? `${derived.target} sessioner` : 'Löpande'} />
        <Row label="Startade" value={formatDate(state.profile.protocolStartedAt)} last />
      </Card>

      <SectionTitle>Sessioner</SectionTitle>
      <Card>
        <Row label="Köpta" value={derived.purchased} />
        <Row label="Genomförda" value={derived.done} />
        <Row label="Kvar" value={derived.remaining} last />
      </Card>

      <SectionTitle>Larm i kammaren</SectionTitle>
      <Card>
        <Row label="Ljud" value={<Switch value={state.settings.sound} onValueChange={toggle('sound')} {...switchColors} />} />
        <Row label="Vibration" value={<Switch value={state.settings.haptics} onValueChange={toggle('haptics')} {...switchColors} />} />
        <Row label="Blinkande skärm" value={<Switch value={state.settings.flash} onValueChange={toggle('flash')} {...switchColors} />} />
        <Row
          label="Notiser i bakgrunden"
          value={<Switch value={state.settings.notifications} onValueChange={toggle('notifications')} {...switchColors} />}
          last
        />
      </Card>
      <Muted>Notiser gör att larmet kommer även om skärmen är låst.</Muted>

      <SectionTitle>Påminnelser</SectionTitle>
      <Card>
        <Row
          label="Påminn mig om uppehåll"
          value={<Switch value={state.settings.reminders} onValueChange={toggle('reminders')} {...switchColors} />}
          last={!state.settings.reminders}
        />
        {state.settings.reminders ? (
          <View style={{ paddingTop: 12 }}>
            <Text style={{ fontSize: 15, color: colors.textSecondary, marginBottom: 8 }}>Efter så här många dagar utan session</Text>
            <WheelPicker
              values={reminderDayValues}
              value={state.settings.reminderDays}
              onChange={(d) => actions.updateSettings({ reminderDays: d })}
              format={(d) => (d === 1 ? '1 dag' : `${d} dagar`)}
            />
          </View>
        ) : null}
      </Card>

      {auth.configured && auth.session ? (
        <>
          <SectionTitle>Konto</SectionTitle>
          <Card>
            <Row label="Inloggad som" value={auth.email ?? ''} last />
          </Card>
          <Button title="Logga ut" variant="secondary" icon="log-out-outline" onPress={() => auth.signOut()} />
          <Muted>Dina sessioner och köp ligger hos Oxyzen och finns kvar när du loggar in igen.</Muted>
        </>
      ) : auth.configured ? (
        <>
          <SectionTitle>Konto</SectionTitle>
          <Card>
            <Text style={{ fontSize: 16, color: colors.text, lineHeight: 25 }}>
              Du använder appen utan konto. Allt sparas bara på den här telefonen och försvinner om appen tas bort.
            </Text>
          </Card>
          <Button title="Logga in" variant="secondary" icon="log-in-outline" onPress={() => auth.leaveLocalMode()} />
          <Muted>Dina sessioner följer med när du loggar in.</Muted>
        </>
      ) : null}

      <View style={{ height: space.xl }} />
      <Button title="Radera all data" variant="danger" onPress={resetAll} />
      <Muted style={{ textAlign: 'center', marginTop: space.lg }}>Oxyzen 0.1</Muted>
      {sheet}
    </Screen>
  );
}
