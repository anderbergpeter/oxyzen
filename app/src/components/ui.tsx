import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type PressableProps,
  type StyleProp,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, fonts, radius, space } from '@/lib/theme';

export function Screen({
  children,
  scroll = true,
  style,
  padTop = true,
}: {
  children: React.ReactNode;
  scroll?: boolean;
  style?: StyleProp<ViewStyle>;
  padTop?: boolean;
}) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: padTop ? insets.top + space.lg : space.lg,
    paddingBottom: insets.bottom + space.xxl,
    paddingHorizontal: space.lg,
  };
  if (!scroll) {
    return <View style={[styles.screen, padding, style]}>{children}</View>;
  }
  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={[padding, style]}
      keyboardShouldPersistTaps="handled"
    >
      {children}
    </ScrollView>
  );
}

export function Title({ children, sub }: { children: React.ReactNode; sub?: string }) {
  return (
    <View style={{ marginBottom: space.lg }}>
      {sub ? <Text style={styles.overline}>{sub}</Text> : null}
      <Text style={styles.title}>{children}</Text>
    </View>
  );
}

export function SectionTitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.sectionTitle}>{children}</Text>;
}

export function Card({
  children,
  style,
  tone = 'default',
  onPress,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: 'default' | 'teal' | 'amber' | 'blue';
  onPress?: () => void;
}) {
  const toneStyle =
    tone === 'teal'
      ? { backgroundColor: colors.tealLight, borderColor: colors.tealMid }
      : tone === 'amber'
        ? { backgroundColor: colors.amberLight, borderColor: colors.amberMid }
        : tone === 'blue'
          ? { backgroundColor: colors.blueLight, borderColor: colors.blueMid }
          : null;
  const content = <View style={[styles.card, toneStyle, style]}>{children}</View>;
  if (!onPress) return content;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.85 : 1 })}>
      {content}
    </Pressable>
  );
}

export function Row({
  label,
  value,
  onPress,
  icon,
  last,
}: {
  label: string;
  value?: React.ReactNode;
  onPress?: () => void;
  icon?: keyof typeof Ionicons.glyphMap;
  last?: boolean;
}) {
  const inner = (
    <View style={[styles.row, last && { borderBottomWidth: 0 }]}>
      {icon ? (
        <Ionicons name={icon} size={18} color={colors.textSecondary} style={{ marginRight: space.sm }} />
      ) : null}
      <Text style={styles.rowLabel}>{label}</Text>
      {typeof value === 'string' || typeof value === 'number' ? (
        <Text style={styles.rowValue}>{value}</Text>
      ) : (
        value
      )}
      {onPress ? (
        <Ionicons name="chevron-forward" size={16} color={colors.textMuted} style={{ marginLeft: 6 }} />
      ) : null}
    </View>
  );
  if (!onPress) return inner;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}>
      {inner}
    </Pressable>
  );
}

export function Button({
  title,
  variant = 'primary',
  icon,
  style,
  ...rest
}: PressableProps & {
  title: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  icon?: keyof typeof Ionicons.glyphMap;
  style?: StyleProp<ViewStyle>;
}) {
  const bg =
    variant === 'primary'
      ? colors.teal
      : variant === 'danger'
        ? colors.redLight
        : variant === 'secondary'
          ? colors.card
          : 'transparent';
  const fg =
    variant === 'primary'
      ? '#fff'
      : variant === 'danger'
        ? colors.red
        : variant === 'secondary'
          ? colors.text
          : colors.tealDark;
  const border = variant === 'secondary' ? colors.border : 'transparent';
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: bg, borderColor: border, opacity: pressed ? 0.8 : rest.disabled ? 0.5 : 1 },
        style,
      ]}
    >
      {icon ? <Ionicons name={icon} size={18} color={fg} style={{ marginRight: 8 }} /> : null}
      <Text style={[styles.buttonText, { color: fg }]}>{title}</Text>
    </Pressable>
  );
}

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <View style={styles.segmented}>
      {options.map((o) => {
        const active = o.value === value;
        return (
          <Pressable
            key={String(o.value)}
            onPress={() => onChange(o.value)}
            style={[styles.segment, active && styles.segmentActive]}
          >
            <Text style={[styles.segmentText, active && styles.segmentTextActive]}>{o.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function Field({
  label,
  hint,
  ...rest
}: TextInputProps & { label: string; hint?: string }) {
  return (
    <View style={{ marginBottom: space.lg }}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <TextInput
        placeholderTextColor={colors.textMuted}
        {...rest}
        style={[styles.input, rest.style]}
      />
      {hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

export function Pill({ children, tone = 'teal' }: { children: React.ReactNode; tone?: 'teal' | 'amber' | 'gray' }) {
  const s =
    tone === 'teal'
      ? { bg: colors.tealLight, fg: colors.tealDarker }
      : tone === 'amber'
        ? { bg: colors.amberLight, fg: colors.amberDark }
        : { bg: colors.grayLight, fg: colors.grayText };
  return (
    <View style={[styles.pill, { backgroundColor: s.bg }]}>
      <Text style={[styles.pillText, { color: s.fg }]}>{children}</Text>
    </View>
  );
}

export function Muted({ children, style }: { children: React.ReactNode; style?: object }) {
  return <Text style={[styles.muted, style]}>{children}</Text>;
}

export function Body({ children, style }: { children: React.ReactNode; style?: object }) {
  return <Text style={[styles.body, style]}>{children}</Text>;
}

export function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <View style={styles.stat}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  overline: { fontSize: 13, color: colors.textMuted, marginBottom: 2 },
  title: { fontSize: 30, fontWeight: '500', color: colors.text, letterSpacing: 0.2, fontFamily: fonts.serif },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    marginTop: space.xl,
    marginBottom: space.sm,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: space.lg,
    marginBottom: space.md,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  rowLabel: { flex: 1, fontSize: 15, color: colors.text },
  rowValue: { fontSize: 15, color: colors.textSecondary },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 999,
    borderWidth: 1,
    marginTop: space.sm,
  },
  buttonText: { fontSize: 16, fontWeight: '600' },
  segmented: {
    flexDirection: 'row',
    backgroundColor: colors.segmentBg,
    borderRadius: radius.sm,
    padding: 3,
  },
  segment: { flex: 1, paddingVertical: 8, borderRadius: 6, alignItems: 'center' },
  segmentActive: { backgroundColor: colors.teal },
  segmentText: { fontSize: 14, color: colors.textSecondary, fontWeight: '500' },
  segmentTextActive: { color: '#FFFFFF' },
  fieldLabel: { fontSize: 13, color: colors.textSecondary, marginBottom: 6, fontWeight: '500' },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.inputBorder,
    borderRadius: radius.sm,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    color: colors.text,
  },
  hint: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  pill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999, alignSelf: 'flex-start' },
  pillText: { fontSize: 12, fontWeight: '600' },
  muted: { fontSize: 13, color: colors.textMuted },
  body: { fontSize: 15, color: colors.text, lineHeight: 22 },
  stat: { flex: 1, backgroundColor: colors.card, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: space.md },
  statValue: { fontSize: 24, fontWeight: '500', color: colors.text, fontFamily: fonts.serif },
  statLabel: { fontSize: 12, color: colors.textSecondary, marginTop: 2 },
});
