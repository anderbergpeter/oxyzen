import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wordmark } from '@/components/Wordmark';
import { colors, fonts, radius, space } from '@/lib/theme';

interface Tile {
  key: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
  available: boolean;
  onPress?: () => void;
}

const tiles: Tile[] = [
  {
    key: 'hbot',
    title: 'HBOT',
    subtitle: 'Hyperbar syrgasbehandling',
    icon: 'cloud-outline',
    available: true,
    onPress: () => router.push('/hbot'),
  },
  {
    key: 'redlight',
    title: 'Rödljusterapi',
    subtitle: 'Ljusbehandling för hud och återhämtning',
    icon: 'sunny-outline',
    available: false,
  },
  {
    key: 'tens',
    title: 'Magnetstolsträning',
    subtitle: 'Elektromagnetisk muskelstimulering',
    icon: 'pulse-outline',
    available: false,
  },
];

function TileRow({ tile }: { tile: Tile }) {
  const { available } = tile;
  return (
    <Pressable
      onPress={tile.onPress}
      disabled={!available}
      style={({ pressed }) => ({
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: available ? colors.card : colors.grayLight,
        borderRadius: radius.lg,
        borderWidth: available ? 2 : 1,
        borderColor: available ? colors.teal : colors.border,
        paddingVertical: space.xl,
        paddingHorizontal: space.lg,
        marginBottom: space.md,
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View
        style={{
          width: 54,
          height: 54,
          borderRadius: 27,
          backgroundColor: available ? colors.tealLight : colors.segmentBg,
          alignItems: 'center',
          justifyContent: 'center',
          marginRight: space.lg,
        }}
      >
        <Ionicons name={tile.icon} size={30} color={available ? colors.tealDark : colors.textMuted} />
      </View>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontSize: 25,
            fontFamily: fonts.serif,
            color: available ? colors.text : colors.textSecondary,
            marginBottom: 2,
          }}
        >
          {tile.title}
        </Text>
        <Text style={{ fontSize: 18, color: available ? colors.textSecondary : colors.textMuted }}>{tile.subtitle}</Text>
        {!available ? (
          <View
            style={{
              alignSelf: 'flex-start',
              backgroundColor: colors.segmentBg,
              paddingHorizontal: 12,
              paddingVertical: 5,
              borderRadius: 999,
              marginTop: 8,
            }}
          >
            <Text style={{ fontSize: 14, letterSpacing: 1.5, color: colors.textSecondary }}>KOMMER SNART</Text>
          </View>
        ) : null}
      </View>
      {available ? <Ionicons name="chevron-forward" size={28} color={colors.tealDark} /> : null}
    </Pressable>
  );
}

export default function Menu() {
  const insets = useSafeAreaInsets();
  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      contentContainerStyle={{
        flexGrow: 1,
        paddingTop: insets.top + space.xxl * 2,
        paddingBottom: insets.bottom + space.xl,
        paddingHorizontal: space.lg,
      }}
    >
      <Wordmark align="center" size="hero" />
      <View style={{ flex: 1, minHeight: space.xxl * 2 }} />
      <Text
        style={{
          fontSize: 22,
          color: colors.textSecondary,
          textAlign: 'center',
          marginBottom: space.lg,
        }}
      >
        Välj vad du vill göra
      </Text>
      {tiles.map((t) => (
        <TileRow key={t.key} tile={t} />
      ))}
      <View style={{ flex: 1 }} />
    </ScrollView>
  );
}
