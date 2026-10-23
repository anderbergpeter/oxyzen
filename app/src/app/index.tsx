import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Wordmark } from '@/components/Wordmark';
import { Muted } from '@/components/ui';
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
    subtitle: 'Red light therapy',
    icon: 'sunny-outline',
    available: false,
  },
  {
    key: 'tens',
    title: 'TENS',
    subtitle: 'Bäckenbottenstol',
    icon: 'pulse-outline',
    available: false,
  },
  {
    key: 'soon',
    title: 'Kommer snart',
    subtitle: 'Fler behandlingar på väg',
    icon: 'sparkles-outline',
    available: false,
  },
];

function TileCard({ tile }: { tile: Tile }) {
  const { available } = tile;
  return (
    <Pressable
      onPress={tile.onPress}
      disabled={!available}
      style={({ pressed }) => ({
        flex: 1,
        aspectRatio: 1,
        backgroundColor: available ? colors.card : colors.grayLight,
        borderRadius: radius.lg,
        borderWidth: 1,
        borderColor: available ? colors.tealMid : colors.border,
        padding: space.lg,
        justifyContent: 'space-between',
        opacity: pressed ? 0.85 : 1,
      })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: available ? colors.tealLight : colors.segmentBg,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Ionicons name={tile.icon} size={22} color={available ? colors.tealDark : colors.textMuted} />
        </View>
        {!available ? (
          <View style={{ backgroundColor: colors.segmentBg, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 }}>
            <Text style={{ fontSize: 12, letterSpacing: 1, color: colors.textSecondary }}>SNART</Text>
          </View>
        ) : null}
      </View>
      <View>
        <Text
          style={{
            fontSize: 22,
            fontFamily: fonts.serif,
            color: available ? colors.text : colors.textSecondary,
            marginBottom: 2,
          }}
        >
          {tile.title}
        </Text>
        <Text style={{ fontSize: 14, color: colors.textMuted }}>{tile.subtitle}</Text>
      </View>
    </Pressable>
  );
}

export default function Menu() {
  const insets = useSafeAreaInsets();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        paddingTop: insets.top + space.xxl * 2,
        paddingBottom: insets.bottom + space.xl,
        paddingHorizontal: space.lg,
      }}
    >
      <Wordmark align="center" />
      <View style={{ flex: 1 }} />
      <Muted style={{ textAlign: 'center', marginBottom: space.md, letterSpacing: 0.3 }}>Välj vad du vill göra</Muted>
      <View style={{ flexDirection: 'row', gap: space.md, marginBottom: space.md }}>
        <TileCard tile={tiles[0]} />
        <TileCard tile={tiles[1]} />
      </View>
      <View style={{ flexDirection: 'row', gap: space.md }}>
        <TileCard tile={tiles[2]} />
        <TileCard tile={tiles[3]} />
      </View>
      <View style={{ flex: 1 }} />
    </View>
  );
}
