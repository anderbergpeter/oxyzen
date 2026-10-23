import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Platform, View } from 'react-native';
import { useStore } from '@/lib/store';
import { colors } from '@/lib/theme';

export default function TabsLayout() {
  const { ready } = useStore();
  if (!ready) {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg }}>
        <ActivityIndicator color={colors.teal} />
      </View>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.tealDark,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.card,
          borderTopColor: colors.border,
          ...(Platform.OS === 'web' ? { height: 72, paddingTop: 8, paddingBottom: 10 } : null),
        },
        tabBarLabelStyle: { fontSize: 13, fontWeight: '500' },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Hem', tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={typeof color === "string" ? color : colors.textMuted} /> }}
      />
      <Tabs.Screen
        name="journey"
        options={{ title: 'Min resa', tabBarIcon: ({ color, size }) => <Ionicons name="trail-sign-outline" size={size} color={typeof color === "string" ? color : colors.textMuted} /> }}
      />
      <Tabs.Screen
        name="history"
        options={{ title: 'Historik', tabBarIcon: ({ color, size }) => <Ionicons name="calendar-outline" size={size} color={typeof color === "string" ? color : colors.textMuted} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Profil', tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={typeof color === "string" ? color : colors.textMuted} /> }}
      />
    </Tabs>
  );
}
