import React from 'react';
import { Text, View } from 'react-native';
import { colors, fonts } from '@/lib/theme';

// Ordbild som på väggen i receptionen: spärrade versaler i tunn geometrisk
// sans, champagne/mässing.
export function Wordmark({ size = 'large', align = 'flex-start' }: { size?: 'large' | 'small'; align?: 'flex-start' | 'center' }) {
  const big = size === 'large';
  return (
    <View style={{ alignItems: align }}>
      <Text
        style={{
          fontFamily: fonts.logo,
          fontSize: big ? 30 : 17,
          letterSpacing: big ? 9 : 4.5,
          color: colors.brass,
          marginRight: big ? -9 : -4.5,
        }}
      >
        OXYZEN
      </Text>
      <Text
        style={{
          fontFamily: fonts.logoSub,
          fontSize: big ? 10 : 7,
          letterSpacing: big ? 4.2 : 2.3,
          color: colors.brass,
          marginTop: big ? 6 : 1,
          marginRight: big ? -4.2 : -2.3,
        }}
      >
        LONGEVITY CENTER
      </Text>
    </View>
  );
}
