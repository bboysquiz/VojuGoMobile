import type { ReactNode } from 'react';
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

interface StateProps {
  message: string;
  error?: boolean;
  onRetry?: () => void;
}

export function CustomerState({
  message,
  error = false,
  onRetry,
}: StateProps) {
  return (
    <View style={[styles.state, error && styles.stateError]}>
      <Text style={[styles.stateText, error && styles.stateErrorText]}>
        {message}
      </Text>

      {onRetry ? (
        <Pressable onPress={onRetry} style={styles.blackButton}>
          <Text style={styles.blackButtonText}>Попробовать ещё раз</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface TabItem<T extends string> {
  value: T;
  label: string;
  count: number;
}

interface TabsProps<T extends string> {
  value: T;
  items: TabItem<T>[];
  onChange: (value: T) => void;
}

export function CustomerTabs<T extends string>({
  value,
  items,
  onChange,
}: TabsProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.tabs}
    >
      {items.map((item) => {
        const active = item.value === value;

        return (
          <Pressable
            key={item.value}
            onPress={() => onChange(item.value)}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text style={[styles.tabText, active && styles.tabTextActive]}>
              {item.label}
            </Text>

            <View style={[styles.tabCount, active && styles.tabCountActive]}>
              <Text
                style={[
                  styles.tabCountText,
                  active && styles.tabCountTextActive,
                ]}
              >
                {item.count}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

interface EmptyProps {
  onCreate: () => void;
}

export function CustomerEmptyState({ onCreate }: EmptyProps) {
  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>Пока нет заявок</Text>
      <Text style={styles.emptyDescription}>
        Создайте заявку — исполнители поблизости смогут откликнуться.
      </Text>

      <Pressable onPress={onCreate} style={styles.blackButton}>
        <Text style={styles.blackButtonText}>Создать заявку</Text>
      </Pressable>
    </View>
  );
}

interface ConfirmProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busyLabel: string;
  busy?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onConfirm: () => void;
}

export function CustomerConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  busyLabel,
  busy = false,
  errorMessage = '',
  onClose,
  onConfirm,
}: ConfirmProps) {
  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={busy ? undefined : onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.modalTitle}>{title}</Text>
          <Text style={styles.modalDescription}>{description}</Text>

          {errorMessage ? (
            <Text style={styles.modalError}>{errorMessage}</Text>
          ) : null}

          <View style={styles.modalActions}>
            <Pressable
              disabled={busy}
              onPress={onClose}
              style={styles.outlineButton}
            >
              <Text style={styles.outlineButtonText}>Назад</Text>
            </Pressable>

            <Pressable
              disabled={busy}
              onPress={onConfirm}
              style={[styles.dangerButton, busy && styles.disabled]}
            >
              <Text style={styles.dangerButtonText}>
                {busy ? busyLabel : confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

interface ActionButtonProps {
  children: ReactNode;
  onPress: () => void;
  disabled?: boolean;
  danger?: boolean;
  outline?: boolean;
}

export function CustomerActionButton({
  children,
  onPress,
  disabled = false,
  danger = false,
  outline = false,
}: ActionButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={[
        styles.actionButton,
        outline && styles.actionButtonOutline,
        danger && styles.actionButtonDanger,
        disabled && styles.disabled,
      ]}
    >
      <Text
        style={[
          styles.actionButtonText,
          outline && styles.actionButtonOutlineText,
        ]}
      >
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  state: {
    padding: 20,
    borderRadius: 12,
    gap: 16,
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
  },
  stateError: {
    borderWidth: 1,
    borderColor: 'rgba(224,83,59,0.3)',
    backgroundColor: 'rgba(224,83,59,0.08)',
  },
  stateText: {
    color: '#808080',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  stateErrorText: {
    color: '#e0533b',
  },
  blackButton: {
    minHeight: 48,
    paddingHorizontal: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#191919',
  },
  blackButtonText: {
    color: '#ffffff',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,
  },
  tabs: {
    paddingRight: 16,
    gap: 12,
  },
  tab: {
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabActive: {
    borderBottomColor: '#191919',
  },
  tabText: {
    color: '#808080',
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 20,
  },
  tabTextActive: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
  },
  tabCount: {
    minWidth: 22,
    height: 22,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 11,
    backgroundColor: '#e6e6e6',
  },
  tabCountActive: {
    backgroundColor: '#191919',
  },
  tabCountText: {
    color: '#737373',
    fontFamily: 'Roboto_500Medium',
    fontSize: 11,
  },
  tabCountTextActive: {
    color: '#ffffff',
  },
  empty: {
    padding: 24,
    alignItems: 'flex-start',
    gap: 10,
    borderRadius: 12,
    backgroundColor: '#ffffff',
  },
  emptyTitle: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 24,
  },
  emptyDescription: {
    color: '#808080',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  backdrop: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modal: {
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#ffffff',
  },
  modalTitle: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 24,
  },
  modalDescription: {
    marginTop: 10,
    color: '#737373',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },
  modalError: {
    marginTop: 12,
    color: '#e0533b',
    fontFamily: 'Roboto_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  modalActions: {
    marginTop: 24,
    flexDirection: 'row',
    gap: 8,
  },
  outlineButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c5c4bc',
    borderRadius: 8,
  },
  outlineButtonText: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
  },
  dangerButton: {
    flex: 1,
    minHeight: 48,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#e0533b',
  },
  dangerButtonText: {
    color: '#ffffff',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
  },
  actionButton: {
    width: '100%',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#191919',
  },
  actionButtonOutline: {
    borderWidth: 1,
    borderColor: '#c5c4bc',
    backgroundColor: '#ffffff',
  },
  actionButtonDanger: {
    backgroundColor: '#e0533b',
  },
  actionButtonText: {
    color: '#ffffff',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,
  },
  actionButtonOutlineText: {
    color: '#191919',
  },
  disabled: {
    opacity: 0.55,
  },
});
