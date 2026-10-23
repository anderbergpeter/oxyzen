import { Jost_300Light } from '@expo-google-fonts/jost/300Light';
import { Jost_400Regular } from '@expo-google-fonts/jost/400Regular';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StoreProvider, useStore } from '@/lib/store';
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

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Jost_300Light, Jost_400Regular });
  if (!fontsLoaded) return null;
  return (
    <SafeAreaProvider>
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
    </SafeAreaProvider>
  );
}
