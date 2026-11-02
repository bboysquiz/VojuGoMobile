import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, Text, View } from 'react-native';

import { createCustomerOrder, ensureCustomerOrderEditable, getCustomerVehicleTypes, updateCustomerOrder } from '../api/customer.api';
import { initialOrderForm, orderFormPayload, type CustomerOrderFormValue, type VehicleTypeOption } from '../model/customer-order-form';
import { customerPageStyles as styles } from './CustomerFormControls';
import { CustomerOrderForm } from './CustomerOrderForm';
import { CustomerActionButton, CustomerState } from './CustomerUi';

export function CustomerOrderEditorScreen({ orderId }: { orderId?: string }) {
  const editing = orderId !== undefined;
  const [data, setData] = useState<{ form: CustomerOrderFormValue; types: VehicleTypeOption[] } | null>(null);
  const [loadError, setLoadError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const submitting = useRef(false);

  useEffect(() => {
    let active = true;
    Promise.all([getCustomerVehicleTypes(), editing ? ensureCustomerOrderEditable(orderId) : Promise.resolve(undefined)])
      .then(([types, order]) => {
        if (!active) return;
        if (!types.length) throw new Error('Сейчас нет доступных типов техники');
        setData({ types, form: initialOrderForm(order, types[0].value) });
      })
      .catch((error: unknown) => { if (active) setLoadError(error instanceof Error ? error.message : 'Не удалось загрузить данные'); });
    return () => { active = false; };
  }, [orderId, editing, attempt]);

  async function submit(form: CustomerOrderFormValue) {
    if (submitting.current) return;
    submitting.current = true;
    setSaving(true);
    setSubmitError('');
    try {
      const payload = orderFormPayload(form);
      if (editing) {
        await ensureCustomerOrderEditable(orderId);
        await updateCustomerOrder(orderId, payload);
      } else {
        await createCustomerOrder(payload);
      }
      router.replace({ pathname: '/cabinet/customer/orders', params: { tab: 'without_responses', ...(editing ? {} : { created: '1' }) } });
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : editing ? 'Не удалось сохранить заявку' : 'Не удалось разместить заявку');
    } finally {
      submitting.current = false;
      setSaving(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag" automaticallyAdjustKeyboardInsets>
        <View><Text style={styles.title}>{editing ? 'Редактирование заявки' : 'Новая заявка'}</Text>
          <Text style={styles.subtitle}>{editing ? 'Изменить можно только заявку, на которую ещё никто не откликнулся' : 'Заполните несколько деталей, исполнители увидят заявку и смогут откликнуться'}</Text></View>
        {loadError ? <>
          <CustomerState error message={loadError} onRetry={() => { setLoadError(''); setAttempt((value) => value + 1); }} />
          <CustomerActionButton outline onPress={() => router.replace('/cabinet/customer/orders')}>К моим заявкам</CustomerActionButton>
        </> : data ? <CustomerOrderForm initialValue={data.form} vehicleTypes={data.types} editing={editing} saving={saving} error={submitError} onSubmit={(form) => void submit(form)} />
          : <CustomerState message="Загружаем…" />}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
