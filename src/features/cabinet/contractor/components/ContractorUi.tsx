import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import type {
  ReactNode,
} from 'react';

interface HeaderProps {
  title: string;
  subtitle?: string;
}

export function ContractorPageHeader({
  title,
  subtitle,
}: HeaderProps) {
  return (
    <View style={styles.header}>
      <Text style={styles.headerTitle}>
        {title}
      </Text>

      {subtitle ? (
        <Text style={styles.headerSubtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

interface StateCardProps {
  message: string;
  error?: boolean;
  onRetry?: () => void;
}

export function ContractorStateCard({
  message,
  error = false,
  onRetry,
}: StateCardProps) {
  return (
    <View
      style={[
        styles.stateCard,
        error &&
          styles.stateCardError,
      ]}
    >
      <Text
        style={[
          styles.stateText,
          error &&
            styles.stateTextError,
        ]}
      >
        {message}
      </Text>

      {onRetry ? (
        <Pressable
          onPress={onRetry}
          style={styles.smallButton}
        >
          <Text
            style={
              styles.smallButtonText
            }
          >
            Попробовать ещё раз
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface EmptyStateProps {
  title: string;
  description:
    | string
    | string[];
  actionLabel?: string;
  onAction?: () => void;
}

export function ContractorEmptyState({
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const lines =
    Array.isArray(description)
      ? description
      : [description];

  return (
    <View style={styles.empty}>
      <Text style={styles.emptyTitle}>
        {title}
      </Text>

      {lines.map((line) => (
        <Text
          key={line}
          style={
            styles.emptyDescription
          }
        >
          {line}
        </Text>
      ))}

      {actionLabel &&
      onAction ? (
        <Pressable
          onPress={onAction}
          style={styles.primaryButton}
        >
          <Text
            style={
              styles.primaryButtonText
            }
          >
            {actionLabel}
          </Text>
        </Pressable>
      ) : null}
    </View>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  description?: string;
  positive?: boolean;
}

export function ContractorStatCard({
  label,
  value,
  description,
  positive = false,
}: StatCardProps) {
  return (
    <View style={styles.statCard}>
      <Text style={styles.statLabel}>
        {label}
      </Text>

      <Text style={styles.statValue}>
        {value}
      </Text>

      {description ? (
        <Text
          style={[
            styles.statDescription,
            positive &&
              styles.statDescriptionPositive,
          ]}
        >
          {description}
        </Text>
      ) : null}
    </View>
  );
}

interface TabItem<T extends string> {
  value: T;
  label: string;
}

interface TabsProps<T extends string> {
  value: T;
  items: TabItem<T>[];
  onChange: (value: T) => void;
}

export function ContractorTabs<
  T extends string
>({
  value,
  items,
  onChange,
}: TabsProps<T>) {
  return (
    <View style={styles.tabs}>
      {items.map((item) => {
        const active =
          item.value === value;

        return (
          <Pressable
            key={item.value}
            onPress={() =>
              onChange(item.value)
            }
            style={[
              styles.tab,
              active &&
                styles.tabActive,
            ]}
          >
            <Text
              style={[
                styles.tabText,
                active &&
                  styles.tabTextActive,
              ]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

interface ConfirmModalProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  busyLabel?: string;
  busy?: boolean;
  onClose: () => void;
  onConfirm: () => void;
  children?: ReactNode;
}

export function ConfirmModal({
  open,
  title,
  description,
  confirmLabel,
  busyLabel = 'Подождите…',
  busy = false,
  onClose,
  onConfirm,
}: ConfirmModalProps) {
  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={
        busy ? undefined : onClose
      }
    >
      <View
        style={styles.modalBackdrop}
      >
        <View style={styles.modal}>
          <Text
            style={styles.modalTitle}
          >
            {title}
          </Text>

          <Text
            style={
              styles.modalDescription
            }
          >
            {description}
          </Text>

          <View
            style={styles.modalActions}
          >
            <Pressable
              disabled={busy}
              onPress={onClose}
              style={
                styles.modalCancel
              }
            >
              <Text
                style={
                  styles.modalCancelText
                }
              >
                Отмена
              </Text>
            </Pressable>

            <Pressable
              disabled={busy}
              onPress={onConfirm}
              style={[
                styles.modalConfirm,
                busy &&
                  styles.disabled,
              ]}
            >
              <Text
                style={
                  styles.modalConfirmText
                }
              >
                {busy
                  ? busyLabel
                  : confirmLabel}
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles =
  StyleSheet.create({
    header: {
      marginBottom: 20,
      gap: 6,
    },

    headerTitle: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 24,
      lineHeight: 30,
    },

    headerSubtitle: {
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 20,
    },

    stateCard: {
      padding: 20,
      borderWidth: 1,
      borderColor: '#d9d9d9',
      borderRadius: 12,
      gap: 16,
      alignItems: 'flex-start',
      backgroundColor: '#ffffff',
    },

    stateCardError: {
      borderColor:
        'rgba(198,93,46,0.28)',
      backgroundColor:
        'rgba(198,93,46,0.10)',
    },

    stateText: {
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 20,
    },

    stateTextError: {
      color: '#8a2f22',
    },

    smallButton: {
      minHeight: 40,
      paddingHorizontal: 14,
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#191919',
    },

    smallButtonText: {
      color: '#ffffff',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 13,
    },

    empty: {
      padding: 24,
      borderRadius: 12,
      alignItems: 'flex-start',
      gap: 8,
      backgroundColor: '#ffffff',
    },

    emptyTitle: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 20,
      lineHeight: 24,
    },

    emptyDescription: {
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 20,
    },

    primaryButton: {
      minHeight: 44,
      marginTop: 8,
      paddingHorizontal: 18,
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#191919',
    },

    primaryButtonText: {
      color: '#ffffff',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
    },

    statCard: {
      width: 158,
      minHeight: 126,
      padding: 16,
      borderRadius: 12,
      backgroundColor: '#ffffff',
    },

    statLabel: {
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 12,
      lineHeight: 16,
    },

    statValue: {
      marginTop: 8,
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 30,
      lineHeight: 34,
    },

    statDescription: {
      marginTop: 'auto',
      paddingTop: 8,
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 11,
      lineHeight: 15,
    },

    statDescriptionPositive: {
      color: '#2e8b57',
    },

    tabs: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: '#d9d9d9',
    },

    tab: {
      flex: 1,
      minHeight: 48,
      paddingHorizontal: 4,
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor:
        'transparent',
    },

    tabActive: {
      borderBottomColor: '#191919',
    },

    tabText: {
      color: '#808080',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 12,
      lineHeight: 16,
      textAlign: 'center',
    },

    tabTextActive: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
    },

    modalBackdrop: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor:
        'rgba(0,0,0,0.45)',
    },

    modal: {
      padding: 24,
      borderRadius: 16,
      backgroundColor: '#ffffff',
    },

    modalTitle: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 20,
      lineHeight: 24,
    },

    modalDescription: {
      marginTop: 10,
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 20,
    },

    modalActions: {
      marginTop: 24,
      flexDirection: 'row',
      gap: 8,
    },

    modalCancel: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#c5c4bc',
      borderRadius: 8,
    },

    modalCancelText: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
    },

    modalConfirm: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#d83b2f',
    },

    modalConfirmText: {
      color: '#ffffff',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
    },

    disabled: {
      opacity: 0.55,
    },
  });