import { useEffect, useState } from 'react';
import {
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import type { OrderReviewFields } from '../model/customer.types';

interface Props {
  open: boolean;
  contractorName: string;
  saving?: boolean;
  errorMessage?: string;
  onClose: () => void;
  onSubmit: (value: OrderReviewFields) => void;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function CustomerReviewModal({
  open,
  contractorName,
  saving = false,
  errorMessage = '',
  onClose,
  onSubmit,
}: Props) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');

  useEffect(() => {
    if (open) {
      setRating(0);
      setComment('');
    }
  }, [open]);

  function submit() {
    onSubmit({
      ...(rating ? { rating } : {}),
      ...(comment.trim() ? { comment: comment.trim() } : {}),
    });
  }

  return (
    <Modal
      transparent
      visible={open}
      animationType="fade"
      onRequestClose={saving ? undefined : onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>Оцените работу исполнителя</Text>
            <Pressable disabled={saving} onPress={onClose}>
              <Text style={styles.close}>×</Text>
            </Pressable>
          </View>

          <View style={styles.person}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>{initials(contractorName)}</Text>
            </View>
            <Text style={styles.name}>{contractorName}</Text>
          </View>

          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Pressable
                key={star}
                disabled={saving}
                onPress={() => setRating(star)}
              >
                <Text style={[styles.star, star <= rating && styles.starActive]}>
                  ★
                </Text>
              </Pressable>
            ))}
          </View>

          <View style={styles.commentField}>
            <Text style={styles.commentLabel}>
              Поделитесь впечатлениями о работе специалиста
            </Text>
            <TextInput
              value={comment}
              editable={!saving}
              multiline
              maxLength={950}
              textAlignVertical="top"
              onChangeText={setComment}
              placeholder="Например, что понравилось, а что можно улучшить"
              placeholderTextColor="#808080"
              style={styles.input}
            />
          </View>

          {errorMessage ? <Text style={styles.error}>{errorMessage}</Text> : null}

          <Pressable
            disabled={saving}
            onPress={submit}
            style={[styles.submit, saving && styles.disabled]}
          >
            <Text style={styles.submitText}>
              {saving
                ? 'Сохраняем…'
                : rating || comment.trim()
                  ? 'Завершить заказ'
                  : 'Завершить заказ без оценки'}
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  modal: {
    padding: 20,
    borderRadius: 16,
    gap: 28,
    backgroundColor: '#ffffff',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  title: {
    flex: 1,
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 24,
  },
  close: {
    color: '#191919',
    fontSize: 28,
    lineHeight: 28,
  },
  person: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#f3f3f3',
  },
  avatarText: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
  },
  name: {
    flex: 1,
    color: '#191919',
    fontFamily: 'Roboto_400Regular',
    fontSize: 16,
    lineHeight: 20,
  },
  stars: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 18,
  },
  star: {
    color: '#d5d5d5',
    fontSize: 36,
    lineHeight: 40,
  },
  starActive: {
    color: '#191919',
  },
  commentField: {
    gap: 8,
  },
  commentLabel: {
    color: '#191919',
    fontFamily: 'Roboto_400Regular',
    fontSize: 15,
    lineHeight: 20,
  },
  input: {
    minHeight: 96,
    padding: 16,
    borderWidth: 1,
    borderColor: '#c5c4bc',
    borderRadius: 12,
    color: '#191919',
    backgroundColor: '#f3f3f3',
    fontFamily: 'Roboto_400Regular',
    fontSize: 15,
    lineHeight: 20,
  },
  error: {
    color: '#e0533b',
    fontFamily: 'Roboto_400Regular',
    fontSize: 13,
    lineHeight: 18,
  },
  submit: {
    width: '100%',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#191919',
  },
  submitText: {
    color: '#ffffff',
    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
    lineHeight: 20,
  },
  disabled: {
    opacity: 0.55,
  },
});
