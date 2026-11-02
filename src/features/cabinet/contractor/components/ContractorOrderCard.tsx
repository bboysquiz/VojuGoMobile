import { useState } from 'react';
import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { OrderCard } from '../../components/OrderCard';
import { OrderReview } from '../../components/OrderReview';
import { OrderStatusBadge, type OrderStatusTone } from '../../components/OrderStatusBadge';
import { formatOrderDate } from '../../model/order-card';
import type { ContractorOrder, OrderCustomerContact } from '../model/contractor.types';

export type ContractorOrderCardVariant =
  | 'new'
  | 'pending'
  | 'chosen'
  | 'not_chosen'
  | 'history';

interface Props {
  order: ContractorOrder;
  equipmentTypeLabel: string;
  variant: ContractorOrderCardVariant;

  customerContact?: OrderCustomerContact;

  isResponding?: boolean;
  isSkipping?: boolean;
  isDeleting?: boolean;
  isReleasing?: boolean;

  showResponseStatus?: boolean;

  rating?: number | null;
  reviewComment?: string | null;
  reviewerName?: string;

  onRespond?: () => void;
  onSkip?: () => void;
  onDeleteResponse?: () => void;
  onReleaseAssignment?: () => void;
}

function getStatus(variant: ContractorOrderCardVariant, order: ContractorOrder): { label: string; tone: OrderStatusTone } | null {
  switch (variant) {
    case 'pending': return { label: 'Ожидает решения заказчика', tone: 'neutral' };
    case 'chosen': return { label: 'Вас пригласили', tone: 'green' };
    case 'not_chosen': return { label: order.status === 'CANCELLED' ? 'Заявка отменена' : 'Выбрали другого исполнителя', tone: 'rust' };
    case 'history': return { label: 'Выполнено', tone: 'green' };
    default: return null;
  }
}

export function ContractorOrderCard({
  order,
  equipmentTypeLabel,
  variant,
  customerContact,
  isResponding = false,
  isSkipping = false,
  isDeleting = false,
  isReleasing = false,
  showResponseStatus = false,
  rating = null,
  reviewComment = null,
  reviewerName = '',
  onRespond,
  onSkip,
  onDeleteResponse,
  onReleaseAssignment,
}: Props) {
  const [phoneVisible, setPhoneVisible] = useState(false);
  const createdAt = formatOrderDate(order.created_at);
  const customerName = order.customer_name?.trim() || customerContact?.name?.trim() || reviewerName.trim();
  const footerMeta = [customerName, `опубликовано ${createdAt}`, `№${order.id}`].filter(Boolean).join(' · ');
  const historyMeta = [customerName, `№${order.id}`, createdAt].filter(Boolean).join(' · ');
  const priceCaption = order.price_unit === 'per_hour' ? 'в час · цена заказчика' : 'за заказ · цена заказчика';
  const status = getStatus(variant, order);

  async function callCustomer() {
    if (!customerContact?.phone) {
      return;
    }

    const phone =
      customerContact.phone.replace(
        /[^+\d]/g,
        ''
      );

    await Linking.openURL(
      `tel:${phone}`
    );
  }

  return (
    <OrderCard order={order} equipmentTypeLabel={equipmentTypeLabel} priceCaption={priceCaption}
      relativeDate={variant === 'new'} showComment={variant !== 'history'}
      metadata={variant === 'history' ? historyMeta : footerMeta}
      status={status && (showResponseStatus || variant === 'history') ? <OrderStatusBadge label={status.label} tone={status.tone} compact /> : null}
      actions={variant !== 'history' ? (
        <View style={styles.actions}>
          {variant === 'new' ? (
            <>
              <Pressable
                disabled={
                  isResponding ||
                  isSkipping
                }
                onPress={onRespond}
                style={[
                  styles.primaryAction,
                  (isResponding ||
                    isSkipping) &&
                    styles.disabled,
                ]}
              >
                <Text
                  style={
                    styles.primaryActionText
                  }
                >
                  {isResponding
                    ? 'Отправляем…'
                    : 'Откликнуться'}
                </Text>
              </Pressable>

              <Pressable
                disabled={
                  isResponding ||
                  isSkipping
                }
                onPress={onSkip}
              >
                <Text
                  style={
                    styles.textAction
                  }
                >
                  {isSkipping
                    ? 'Отказываемся…'
                    : 'Отказаться'}
                </Text>
              </Pressable>
            </>
          ) : null}

          {variant === 'pending' ? (
            <Pressable
              disabled={isDeleting}
              onPress={
                onDeleteResponse
              }
            >
              <Text
                style={
                  styles.textAction
                }
              >
                {isDeleting
                  ? 'Отказываемся…'
                  : 'Отказаться'}
              </Text>
            </Pressable>
          ) : null}

          {variant ===
          'not_chosen' ? (
            <Pressable
              disabled={isDeleting}
              onPress={
                onDeleteResponse
              }
            >
              <Text
                style={
                  styles.textAction
                }
              >
                {isDeleting
                  ? 'Удаляем…'
                  : 'Удалить'}
              </Text>
            </Pressable>
          ) : null}

          {variant === 'chosen' ? (
            <>
              {customerContact?.phone ? (
                <Pressable
                  disabled={
                    isReleasing
                  }
                  onPress={() => {
                    if (
                      !phoneVisible
                    ) {
                      setPhoneVisible(
                        true
                      );
                      return;
                    }

                    void callCustomer();
                  }}
                  style={
                    styles.callAction
                  }
                >
                  <Text
                    style={
                      styles.callActionText
                    }
                  >
                    {phoneVisible
                      ? customerContact.phone
                      : 'Позвонить'}
                  </Text>
                </Pressable>
              ) : null}

              <Pressable
                disabled={
                  isReleasing
                }
                onPress={
                  onReleaseAssignment
                }
              >
                <Text
                  style={
                    styles.textAction
                  }
                >
                  {isReleasing
                    ? 'Отказываемся…'
                    : 'Отказаться'}
                </Text>
              </Pressable>
            </>
          ) : null}
        </View>
      ) : null}>
      {variant === 'history' ? <OrderReview name={reviewerName || customerName || 'Заказчик'} rating={rating} comment={reviewComment} /> : null}
    </OrderCard>
  );
}

const styles = StyleSheet.create({
    actions: {
      gap: 12,
    },

    primaryAction: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#191919',
    },

    primaryActionText: {
      color: '#ffffff',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
    },

    callAction: {
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#191919',
    },

    callActionText: {
      color: '#ffffff',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
    },

    textAction: {
      paddingVertical: 8,
      paddingHorizontal: 40.5,
      color: '#191919',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 12,
      lineHeight: 16,
      includeFontPadding: false,
      textAlign: 'center',
    },

    disabled: {
      opacity: 0.55,
    },
  });
