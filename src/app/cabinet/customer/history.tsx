import { router, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ScrollView, Text } from 'react-native';

import { getCustomerHistory, saveCustomerOrderReview } from '../../../features/cabinet/customer/api/customer.api';
import { customerPageStyles as styles } from '../../../features/cabinet/customer/components/CustomerFormControls';
import { CustomerHistoryContent } from '../../../features/cabinet/customer/components/CustomerHistoryContent';
import { CustomerReviewModal } from '../../../features/cabinet/customer/components/CustomerReviewModal';
import { CustomerState } from '../../../features/cabinet/customer/components/CustomerUi';
import type { CustomerHistory, CustomerHistoryOrder, OrderReviewFields } from '../../../features/cabinet/customer/model/customer.types';

export default function CustomerHistoryPage() {
  const { review } = useLocalSearchParams<{ review?: string }>();
  const [history, setHistory] = useState<CustomerHistory | null>(null);
  const [loadError, setLoadError] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [reviewing, setReviewing] = useState<CustomerHistoryOrder | null>(null);
  const [saving, setSaving] = useState(false);
  const [reviewError, setReviewError] = useState('');
  const submitting = useRef(false);
  const requestVersion = useRef(0);

  const loadHistory = useCallback(() => {
    const version = ++requestVersion.current;
    getCustomerHistory().then((result) => {
      if (version !== requestVersion.current) return;
      setHistory(result);
      setLoadError('');
      const requested = result.completed_orders.find((order) => order.id === review);
      if (requested && !requested.review) setReviewing(requested);
    }).catch((error: unknown) => {
      if (version === requestVersion.current) setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить историю');
    }).finally(() => { if (version === requestVersion.current) setRefreshing(false); });
  }, [review]);

  useFocusEffect(useCallback(() => {
    loadHistory();
    return () => { requestVersion.current += 1; };
  }, [loadHistory]));

  function closeReview() {
    if (submitting.current) return;
    setReviewing(null);
    setReviewError('');
    if (review) router.setParams({ review: undefined });
  }

  async function saveReview(fields: OrderReviewFields) {
    if (!reviewing || submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setReviewError('');
    try {
      const saved = await saveCustomerOrderReview(reviewing.id, fields, Boolean(reviewing.review));
      setHistory((current) => {
        if (!current) return current;
        const completed = current.completed_orders.map((order) => order.id === reviewing.id ? { ...order, review: saved } : order);
        return { ...current, completed_orders: completed, summary: { ...current.summary, ratings_count: completed.filter(({ review: value }) => value?.rating != null).length } };
      });
      setReviewing(null);
      if (review) router.setParams({ review: undefined });
    } catch (error) {
      setReviewError(error instanceof Error ? error.message : 'Не удалось сохранить оценку');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return <>
    {loadError || !history ? <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      <Text style={styles.title}>История и оценки</Text>
      <CustomerState message={loadError || 'Загружаем историю…'} error={Boolean(loadError)} onRetry={loadError ? () => { setLoadError(''); loadHistory(); } : undefined} />
    </ScrollView> : <CustomerHistoryContent history={history} refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadHistory(); }}
      onReview={(order) => { setReviewError(''); setReviewing(order); }} />}
    <CustomerReviewModal key={reviewing?.id ?? 'closed'} open={reviewing !== null} contractorName={reviewing?.contractor_name || 'Исполнитель'}
      initialRating={reviewing?.review?.rating} initialComment={reviewing?.review?.comment} allowEmpty={false}
      submitLabel={reviewing?.review ? 'Сохранить изменения' : 'Оставить отзыв'} saving={saving} errorMessage={reviewError}
      onClose={closeReview} onSubmit={(value) => void saveReview(value)} />
  </>;
}
