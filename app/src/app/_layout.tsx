import { Jost_300Light } from '@expo-google-fonts/jost/300Light';
import { Jost_400Regular } from '@expo-google-fonts/jost/400Regular';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from '@/lib/auth';
import { StoreProvider, useStore } from '@/lib/store';
import { Login } from '@/screens/Login';
import { syncReminder } from '@/lib/reminder';
import { colors } from '@/lib/theme';

function ReminderSync() {
  const { state, ready } = useStore();
  React.useEffect(() => {
    if (!ready) return;
    syncReminder(state);
  }, [ready, state.sessions, state.settings.reminders, state.settings.reminderDays]); // eslint-disable-line react-hooks/exhaustive-deps
  return null;
}

// På webben i stor skärm: håll appen i en telefonbred kolumn mitt på sidan.
function Frame({ children }: { children: React.ReactNode }) {
  if (Platform.OS !== 'web') return <>{children}</>;
  return (
    <View style={{ flex: 1, backgroundColor: colors.grayLight, alignItems: 'center' }}>
      <View
        style={{
          flex: 1,
          width: '100%',
          maxWidth: 480,
          backgroundColor: colors.bg,
          borderLeftWidth: 1,
          borderRightWidth: 1,
          borderColor: colors.border,
        }}
      >
        {children}
      </View>
    </View>
  );
}

function Gate({ children }: { children: React.ReactNode }) {
  const auth = useAuth();
  if (!auth.ready) return null;
  if (auth.configured && !auth.session && !auth.localMode) return <Login />;
  return <>{children}</>;
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Jost_300Light, Jost_400Regular });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
      <AuthProvider>
      <Frame>
      <Gate>
      <StoreProvider>
        <ReminderSync />
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: colors.bg },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="hbot" />
          <Stack.Screen name="session" options={{ gestureEnabled: false }} />
          <Stack.Screen name="checkin" options={{ presentation: 'modal' }} />
          <Stack.Screen name="protocols" options={{ presentation: 'modal' }} />
          <Stack.Screen name="log-session" options={{ presentation: 'modal' }} />
          <Stack.Screen name="milestone" options={{ presentation: 'modal' }} />
          <Stack.Screen name="session-setup" options={{ presentation: 'modal' }} />
        </Stack>
      </StoreProvider>
      </Gate>
      </Frame>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
