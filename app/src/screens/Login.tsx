import React, { useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { Wordmark } from '@/components/Wordmark';
import { Body, Button, Field, Muted, Screen } from '@/components/ui';
import { useAuth } from '@/lib/auth';
import { colors, space } from '@/lib/theme';

export function Login() {
  const auth = useAuth();
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'email' | 'code'>('email');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  const send = async () => {
    setBusy(true);
    setError(null);
    const err = await auth.sendCode(email);
    setBusy(false);
    if (err) setError(err);
    else setStep('code');
  };

  const verify = async () => {
    setBusy(true);
    setError(null);
    const err = await auth.verifyCode(email, code);
    setBusy(false);
    if (err) setError(err);
  };

  return (
    <Screen>
      <View style={{ height: space.xxl * 2 }} />
      <Wordmark align="center" />
      <View style={{ height: space.xxl * 1.5 }} />

      {step === 'email' ? (
        <>
          <Body style={{ marginBottom: space.lg }}>
            Logga in med den e-postadress du angav när du köpte dina sessioner. Vi skickar en engångskod, inget
            lösenord behövs.
          </Body>
          <Field
            label="E-post"
            value={email}
            onChangeText={setEmail}
            placeholder="namn@exempel.se"
            keyboardType="email-address"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="email"
            onSubmitEditing={emailOk ? send : undefined}
          />
          {error ? <Text style={{ color: colors.red, marginBottom: space.sm }}>{error}</Text> : null}
          {busy ? (
            <ActivityIndicator color={colors.teal} style={{ marginTop: space.md }} />
          ) : (
            <Button title="Skicka kod" onPress={send} disabled={!emailOk} />
          )}
        </>
      ) : (
        <>
          <Body style={{ marginBottom: space.lg }}>
            Vi har skickat en sexsiffrig kod till {email.trim()}. Den gäller i en timme.
          </Body>
          <Field
            label="Kod"
            value={code}
            onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            maxLength={6}
            autoFocus
            onSubmitEditing={code.length === 6 ? verify : undefined}
            style={{ fontSize: 27, letterSpacing: 6, textAlign: 'center' }}
          />
          {error ? <Text style={{ color: colors.red, marginBottom: space.sm }}>{error}</Text> : null}
          {busy ? (
            <ActivityIndicator color={colors.teal} style={{ marginTop: space.md }} />
          ) : (
            <Button title="Logga in" onPress={verify} disabled={code.length !== 6} />
          )}
          <Button
            title="Byt e-post"
            variant="ghost"
            onPress={() => {
              setStep('email');
              setCode('');
              setError(null);
            }}
          />
        </>
      )}
      <Muted style={{ textAlign: 'center', marginTop: space.xl }}>
        Hittar du ingen kod? Kolla skräpposten, eller fråga oss i receptionen vilken adress som är registrerad.
      </Muted>

      {step === 'email' ? (
        <View style={{ marginTop: space.xxl, borderTopWidth: 1, borderTopColor: colors.border, paddingTop: space.lg }}>
          <Button title="Fortsätt utan konto" variant="secondary" onPress={() => auth.useLocalMode()} />
          <Muted style={{ textAlign: 'center', marginTop: space.sm }}>
            Allt sparas bara på den här telefonen. Du kan logga in senare, då följer dina sessioner med.
          </Muted>
        </View>
      ) : null}
    </Screen>
  );
}
