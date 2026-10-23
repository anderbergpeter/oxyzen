import React from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Button } from '@/components/ui';
import { colors, radius, space } from '@/lib/theme';

export interface ConfirmRequest {
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  danger?: boolean;
  onConfirm: () => void;
}

export function ConfirmSheet({ request, onClose }: { request: ConfirmRequest | null; onClose: () => void }) {
  return (
    <Modal visible={!!request} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(43,36,32,0.45)', justifyContent: 'flex-end' }} onPress={onClose}>
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: colors.card,
            borderTopLeftRadius: radius.xl,
            borderTopRightRadius: radius.xl,
            padding: space.xl,
            paddingBottom: space.xxl + space.md,
          }}
        >
          {request ? (
            <>
              <Text style={{ fontSize: 20, fontWeight: '600', color: colors.text, marginBottom: 6 }}>{request.title}</Text>
              <Text style={{ fontSize: 15, color: colors.textSecondary, lineHeight: 22, marginBottom: space.lg }}>
                {request.message}
              </Text>
              <Button
                title={request.confirmLabel}
                variant={request.danger ? 'danger' : 'primary'}
                onPress={() => {
                  const fn = request.onConfirm;
                  onClose();
                  fn();
                }}
              />
              <Button title={request.cancelLabel ?? 'Avbryt'} variant="ghost" onPress={onClose} />
            </>
          ) : (
            <View />
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export function useConfirm() {
  const [request, setRequest] = React.useState<ConfirmRequest | null>(null);
  const confirm = React.useCallback((r: ConfirmRequest) => setRequest(r), []);
  const sheet = <ConfirmSheet request={request} onClose={() => setRequest(null)} />;
  return { confirm, sheet };
}
