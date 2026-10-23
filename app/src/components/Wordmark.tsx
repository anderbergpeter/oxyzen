import React from 'react';
import { Text, View } from 'react-native';
import { colors, fonts } from '@/lib/theme';

// Ordbild som på väggen i receptionen: spärrade versaler i tunn geometrisk
// sans, mässing.
export function Wordmark({
  size = 'large',
  align = 'flex-start',
}: {
  size?: 'hero' | 'large' | 'small';
  align?: 'flex-start' | 'center';
}) {
  const s =
    size === 'hero'
      ? { font: 54, spacing: 15, subFont: 16, subSpacing: 6.5, gap: 10 }
      : size === 'large'
        ? { font: 30, spacing: 9, subFont: 10, subSpacing: 4.2, gap: 6 }
        : { font: 17, spacing: 4.5, subFont: 7, subSpacing: 2.3, gap: 1 };
  return (
    <View style={{ alignItems: align }}>
      <Text
        style={{
          fontFamily: fonts.logo,
          fontSize: s.font,
          letterSpacing: s.spacing,
          color: colors.brass,
          marginRight: -s.spacing,
        }}
      >
        OXYZEN
      </Text>
      <Text
        style={{
          fontFamily: fonts.logoSub,
          fontSize: s.subFont,
          letterSpacing: s.subSpacing,
          color: colors.brassSub,
          marginTop: s.gap,
          marginRight: -s.subSpacing,
        }}
      >
        LONGEVITY CENTER
      </Text>
    </View>
  );
}
