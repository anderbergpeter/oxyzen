import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '@/lib/theme';

export function ProgressRing({
  size = 180,
  stroke = 14,
  progress,
  value,
  label,
  color = colors.teal,
  track = colors.tealMid,
}: {
  size?: number;
  stroke?: number;
  progress: number; // 0..1
  value: string;
  label?: string;
  color?: string;
  track?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const p = Math.max(0, Math.min(1, progress));
  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeOpacity={0.4} strokeWidth={stroke} fill="none" />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={color}
          strokeWidth={stroke}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={`${c * p} ${c}`}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <Text style={{ fontSize: size * 0.26, fontWeight: '500', color: colors.tealDarker, fontFamily: fonts.serif }}>{value}</Text>
      {label ? <Text style={{ fontSize: 16, color: colors.tealDarker, marginTop: -2 }}>{label}</Text> : null}
    </View>
  );
}
