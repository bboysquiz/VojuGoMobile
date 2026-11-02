import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { AppModal } from '../../../../components/app-modal';

import type { OrderReviewFields } from '../model/customer.types';
import { CustomerActionButton } from './CustomerUi';

interface Props {
  open: boolean;
  contractorName: string;
  saving?: boolean;
  errorMessage?: string;
  initialRating?: number | null;
  initialComment?: string | null;
  allowEmpty?: boolean;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: (value: OrderReviewFields) => void;
}

export function CustomerReviewModal(props: Props) {
  return <AppModal visible={props.open} contentContainerStyle={styles.content} onRequestClose={() => { if (!props.saving) props.onClose(); }}>
    {props.open ? <ReviewDialog {...props} /> : null}
  </AppModal>;
}

function ReviewDialog({ contractorName, saving = false, errorMessage = '', initialRating, initialComment, allowEmpty = true, submitLabel = 'Завершить заказ', onClose, onSubmit }: Props) {
  const [rating, setRating] = useState(initialRating ?? 0);
  const [comment, setComment] = useState(initialComment ?? '');
  const [validation, setValidation] = useState('');
  const initials = contractorName.trim().split(/\s+/).slice(0, 2).map((part) => part[0]?.toUpperCase()).join('');

  function submit() {
    if (saving) return;
    if (!allowEmpty && !rating && !comment.trim()) { setValidation('Укажите оценку или комментарий'); return; }
    if (comment.trim().length > 950) { setValidation('Комментарий должен быть не длиннее 950 символов'); return; }
    onSubmit({ ...(rating ? { rating } : {}), ...(comment.trim() ? { comment: comment.trim() } : {}) });
  }

  return (
    <>
          <View style={styles.titleRow}><Text style={styles.title}>Оцените работу исполнителя</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Закрыть отзыв" disabled={saving} onPress={onClose} style={styles.close}><Text style={styles.closeText}>×</Text></Pressable></View>
          <View style={styles.person}><View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View><Text style={styles.name}>{contractorName}</Text></View>
          <View style={styles.stars}>
            {[1, 2, 3, 4, 5].map((star) => <Pressable key={star} accessibilityRole="radio" accessibilityLabel={'Оценка ' + star + ' из 5'} accessibilityState={{ checked: star === rating, disabled: saving }}
              disabled={saving} onPress={() => { setRating(star); setValidation(''); }} style={styles.starButton}>
              <Image source={star <= rating ? require('../../../../../assets/cabinet/rating-active.svg') : require('../../../../../assets/cabinet/rating-default.svg')}
                style={styles.star} contentFit="contain" accessible={false} />
            </Pressable>)}
          </View>
          <View style={styles.commentField}><Text style={styles.commentLabel}>Поделитесь впечатлениями о работе специалиста</Text>
            <TextInput value={comment} editable={!saving} multiline maxLength={950} textAlignVertical="top" accessibilityLabel="Комментарий к оценке"
              onChangeText={(value) => { setComment(value); setValidation(''); }} placeholder="Например, что понравилось, а что можно улучшить" placeholderTextColor="#808080" style={styles.input} /></View>
          {validation || errorMessage ? <Text accessibilityRole="alert" style={styles.error}>{validation || errorMessage}</Text> : null}
          <CustomerActionButton disabled={saving} onPress={submit}>{saving ? 'Сохраняем…' : allowEmpty && !rating && !comment.trim() ? 'Завершить заказ без оценки' : submitLabel}</CustomerActionButton>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, gap: 24 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, color: '#191919', fontFamily: 'Roboto_500Medium', fontSize: 20, lineHeight: 24 },
  close: { width: 44, height: 44, marginTop: -8, marginRight: -8, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#191919', fontSize: 28 },
  person: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  avatar: { width: 38, height: 38, alignItems: 'center', justifyContent: 'center', borderRadius: 19, backgroundColor: '#f3f3f3' },
  avatarText: { color: '#191919', fontFamily: 'Roboto_500Medium', fontSize: 14 },
  name: { flex: 1, color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 16, lineHeight: 20 },
  stars: { flexDirection: 'row', justifyContent: 'center', gap: 8 },
  starButton: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  star: { width: 32, height: 32 },
  commentField: { gap: 8 },
  commentLabel: { color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 15, lineHeight: 20 },
  input: { minHeight: 96, padding: 16, borderWidth: 1, borderColor: '#c5c4bc', borderRadius: 12, color: '#191919', backgroundColor: '#f3f3f3', fontFamily: 'Roboto_400Regular', fontSize: 15, lineHeight: 20 },
  error: { color: '#e0533b', fontFamily: 'Roboto_400Regular', fontSize: 13, lineHeight: 18 },
});
