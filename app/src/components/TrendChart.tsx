import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, Line, Polyline } from 'react-native-svg';
import { colors } from '@/lib/theme';

export interface TrendSeries {
  label: string;
  color: string;
  values: (number | null)[];
}

export function TrendChart({ series, height = 120 }: { series: TrendSeries[]; height?: number }) {
  const [width, setWidth] = React.useState(0);
  const n = Math.max(...series.map((s) => s.values.length), 0);
  const padX = 8;
  const padY = 10;
  const innerW = Math.max(0, width - padX * 2);
  const innerH = height - padY * 2;
  const x = (i: number) => padX + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW);
  const y = (v: number) => padY + innerH - ((v - 1) / 4) * innerH;

  return (
    <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)}>
      {width > 0 && n > 0 ? (
        <Svg width={width} height={height}>
          {[1, 3, 5].map((g) => (
            <Line key={g} x1={padX} x2={width - padX} y1={y(g)} y2={y(g)} stroke={colors.border} strokeWidth={1} />
          ))}
          {series.map((s) => {
            const pts = s.values
              .map((v, i) => (v === null ? null : `${x(i)},${y(v)}`))
              .filter(Boolean)
              .join(' ');
            return (
              <React.Fragment key={s.label}>
                <Polyline points={pts} fill="none" stroke={s.color} strokeWidth={2.5} strokeLinejoin="round" strokeLinecap="round" />
                {s.values.map((v, i) =>
                  v === null ? null : <Circle key={i} cx={x(i)} cy={y(v)} r={3} fill={s.color} />,
                )}
              </React.Fragment>
            );
          })}
        </Svg>
      ) : (
        <View style={{ height }} />
      )}
      <View style={{ flexDirection: 'row', gap: 14, marginTop: 6 }}>
        {series.map((s) => (
          <View key={s.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: s.color }} />
            <Text style={{ fontSize: 12, color: colors.textSecondary }}>{s.label}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}
