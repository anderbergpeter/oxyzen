import React, { useEffect, useRef } from 'react';
import { NativeScrollEvent, NativeSyntheticEvent, ScrollView, Text, View } from 'react-native';
import { colors, fonts } from '@/lib/theme';

const ITEM = 40;
const VISIBLE = 5;

// Enkel snurra: en lista som snäpper till ett värde i mitten.
export function WheelPicker({
  values,
  value,
  onChange,
  format = (v) => String(v),
}: {
  values: number[];
  value: number;
  onChange: (v: number) => void;
  format?: (v: number) => string;
}) {
  const ref = useRef<ScrollView>(null);
  const pad = (ITEM * (VISIBLE - 1)) / 2;

  useEffect(() => {
    const idx = Math.max(0, values.indexOf(value));
    ref.current?.scrollTo({ y: idx * ITEM, animated: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const settle = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ITEM);
    const v = values[Math.min(values.length - 1, Math.max(0, idx))];
    if (v !== value) onChange(v);
  };

  return (
    <View style={{ height: ITEM * VISIBLE, overflow: 'hidden' }}>
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: pad,
          left: 0,
          right: 0,
          height: ITEM,
          borderTopWidth: 1,
          borderBottomWidth: 1,
          borderColor: colors.tealMid,
          backgroundColor: colors.tealLight,
          borderRadius: 10,
        }}
      />
      <ScrollView
        ref={ref}
        showsVerticalScrollIndicator={false}
        snapToInterval={ITEM}
        decelerationRate="fast"
        onMomentumScrollEnd={settle}
        onScrollEndDrag={settle}
        contentContainerStyle={{ paddingVertical: pad }}
      >
        {values.map((v) => {
          const active = v === value;
          return (
            <View key={v} style={{ height: ITEM, alignItems: 'center', justifyContent: 'center' }}>
              <Text
                style={{
                  fontSize: active ? 20 : 16,
                  color: active ? colors.tealDarker : colors.textMuted,
                  fontFamily: active ? fonts.serif : undefined,
                }}
              >
                {format(v)}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
