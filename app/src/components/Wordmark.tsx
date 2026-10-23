import React, { useState } from 'react';
import { LayoutChangeEvent, Text, View } from 'react-native';
import { colors, fonts } from '@/lib/theme';

// Ordbild som på väggen i receptionen: spärrade versaler i tunn geometrisk
// sans, mässing. I hero-läge fyller båda raderna hela den tillgängliga
// bredden: texten mäts efter första ritningen och storleken justeras.

function FittedLine({
  text,
  fontFamily,
  color,
  baseSize,
  spacingRatio,
  marginTop = 0,
}: {
  text: string;
  fontFamily: string | undefined;
  color: string;
  baseSize: number;
  spacingRatio: number;
  marginTop?: number;
}) {
  const [containerW, setContainerW] = useState(0);
  const [probeW, setProbeW] = useState(0);

  // Bredden växer linjärt med storleken (även spärrningen), så en mätning
  // av en dold kopia i grundstorlek räcker. Sista bokstavens spärrning
  // räknas bort.
  const probeContent = probeW - baseSize * spacingRatio;
  const size = containerW && probeContent > 0 ? (baseSize * containerW) / probeContent : 0;
  const spacing = size * spacingRatio;

  return (
    <View
      onLayout={(e: LayoutChangeEvent) => setContainerW(e.nativeEvent.layout.width)}
      style={{ width: '100%', alignItems: 'center', marginTop }}
    >
      <View pointerEvents="none" style={{ position: 'absolute', left: 0, top: 0, width: 5000, opacity: 0 }}>
        <Text
          onLayout={(e: LayoutChangeEvent) => setProbeW(e.nativeEvent.layout.width)}
          style={{ fontFamily, fontSize: baseSize, letterSpacing: baseSize * spacingRatio, alignSelf: 'flex-start' }}
        >
          {text}
        </Text>
      </View>
      {size > 0 ? (
        <Text style={{ fontFamily, fontSize: size, letterSpacing: spacing, color, marginRight: -spacing }}>{text}</Text>
      ) : (
        <View style={{ height: baseSize * 1.2 }} />
      )}
    </View>
  );
}

export function Wordmark({
  size = 'large',
  align = 'flex-start',
}: {
  size?: 'hero' | 'large' | 'small';
  align?: 'flex-start' | 'center';
}) {
  if (size === 'hero') {
    return (
      <View style={{ width: '100%' }}>
        <FittedLine text="OXYZEN" fontFamily={fonts.logo} color={colors.brass} baseSize={60} spacingRatio={0.3} />
        <FittedLine
          text="LONGEVITY CENTER"
          fontFamily={fonts.logoSub}
          color={colors.brassSub}
          baseSize={18}
          spacingRatio={0.42}
          marginTop={10}
        />
      </View>
    );
  }

  const s =
    size === 'large'
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
