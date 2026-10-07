import { Image } from 'expo-image';

import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useState,
} from 'react';

import {
  formatVehiclePropertyValue,
  getVehiclePropertyEntries,
  type ContractorOrder,
  type OrderCustomerContact,
} from '../model/contractor.types';

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

function formatDate(
  value: string,
  variant: ContractorOrderCardVariant
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  const now = new Date();

  const tomorrow = new Date(now);
  tomorrow.setDate(
    now.getDate() + 1
  );

  const sameDay = (
    left: Date,
    right: Date
  ) =>
    left.getFullYear() ===
      right.getFullYear() &&
    left.getMonth() ===
      right.getMonth() &&
    left.getDate() ===
      right.getDate();

  const time =
    new Intl.DateTimeFormat(
      'ru-RU',
      {
        hour: '2-digit',
        minute: '2-digit',
      }
    ).format(date);

  const calendarDate =
    new Intl.DateTimeFormat(
      'ru-RU',
      {
        day: 'numeric',
        month: 'long',
      }
    ).format(date);

  if (variant !== 'new') {
    return `${calendarDate} в ${time}`;
  }

  if (sameDay(date, now)) {
    return `Сегодня в ${time}`;
  }

  if (
    sameDay(date, tomorrow)
  ) {
    return `Завтра в ${time}`;
  }

  return `${calendarDate} в ${time}`;
}

function formatCreatedAt(
  value: string
) {
  const date = new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    'ru-RU',
    {
      day: 'numeric',
      month: 'long',
    }
  ).format(date);
}

function getStatus(
  variant: ContractorOrderCardVariant,
  order: ContractorOrder
) {
  switch (variant) {
    case 'pending':
      return {
        label:
          'Ожидает решения заказчика',
        backgroundColor:
          '#eef0f5',
        color: '#191919',
      };

    case 'chosen':
      return {
        label:
          'Заявка закреплена за вами',
        backgroundColor:
          '#49c98c',
        color: '#ffffff',
      };

    case 'not_chosen':
      return {
        label:
          order.status ===
          'CANCELLED'
            ? 'Заявка отменена'
            : 'Выбрали другого исполнителя',
        backgroundColor:
          '#ffe0dc',
        color: '#d83b2f',
      };

    case 'history':
      return {
        label: 'Выполнено',
        backgroundColor:
          '#49c98c',
        color: '#ffffff',
      };

    default:
      return null;
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
  const [
    descriptionExpanded,
    setDescriptionExpanded,
  ] = useState(false);

  const [
    reviewExpanded,
    setReviewExpanded,
  ] = useState(false);

  const [
    phoneVisible,
    setPhoneVisible,
  ] = useState(false);

  const properties =
    getVehiclePropertyEntries(
      order.vehicle_properties
    );

  const neededAt = formatDate(
    order.needed_at,
    variant
  );

  const createdAt =
    formatCreatedAt(
      order.created_at
    );

  const customerName =
    order.customer_name?.trim() ||
    customerContact?.name?.trim() ||
    reviewerName.trim();

  const footerMeta = [
    customerName,
    `опубликовано ${createdAt}`,
    `№${order.id}`,
  ]
    .filter(Boolean)
    .join(' · ');

  const historyMeta = [
    customerName,
    `№${order.id}`,
    createdAt,
  ]
    .filter(Boolean)
    .join(' · ');

  const price =
    `${new Intl.NumberFormat(
      'ru-RU'
    ).format(order.price)} ₽`;

  const priceCaption =
    order.price_unit ===
    'per_hour'
      ? 'в час · цена заказчика'
      : 'за заказ · цена заказчика';

  const status = getStatus(
    variant,
    order
  );

  const comment =
    order.comment?.trim() ?? '';

  const normalizedReview =
    reviewComment?.trim() ?? '';

  const roundedRating =
    Math.min(
      5,
      Math.max(
        0,
        Math.round(rating ?? 0)
      )
    );

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
    <View style={styles.card}>
      <Image
        source={require(
          '../../../../../assets/landing/hazard-stripe.svg'
        )}
        style={styles.stripe}
        contentFit="cover"
      />

      <View style={styles.side}>
        <View style={styles.sideInfo}>
          <Text style={styles.sideLine}>
            ◷ {neededAt}
          </Text>

          <Text style={styles.sideLine}>
            ▣ {equipmentTypeLabel}
          </Text>

          {properties.map(
            ([name, value]) => (
              <Text
                key={name}
                style={
                  styles.propertyLine
                }
              >
                {formatVehiclePropertyValue(
                  name,
                  value
                )}
              </Text>
            )
          )}
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.price}>
            {price}
          </Text>

          <Text
            style={
              styles.priceCaption
            }
          >
            {priceCaption}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>
            {order.title}
          </Text>

          {status &&
          (showResponseStatus ||
            variant ===
              'history') ? (
            <View
              style={[
                styles.badge,
                {
                  backgroundColor:
                    status.backgroundColor,
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  {
                    color:
                      status.color,
                  },
                ]}
              >
                {status.label}
              </Text>
            </View>
          ) : null}
        </View>

        <Text style={styles.address}>
          {order.address}
        </Text>

        {variant === 'history' ? (
          <Text
            style={styles.historyMeta}
          >
            {historyMeta}
          </Text>
        ) : null}

        {variant !== 'history' ? (
          <>
            {comment ? (
              <>
                <Text
                  numberOfLines={
                    descriptionExpanded
                      ? undefined
                      : 2
                  }
                  style={
                    styles.description
                  }
                >
                  {comment}
                </Text>

                {comment.length >
                70 ? (
                  <Pressable
                    onPress={() =>
                      setDescriptionExpanded(
                        (current) =>
                          !current
                      )
                    }
                  >
                    <Text
                      style={
                        styles.toggleText
                      }
                    >
                      {descriptionExpanded
                        ? 'Скрыть'
                        : 'Показать описание'}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <Text
                style={
                  styles.mutedDescription
                }
              >
                Комментарий к заявке
                не указан
              </Text>
            )}

            <Text style={styles.meta}>
              {footerMeta}
            </Text>
          </>
        ) : null}

        {variant === 'history' &&
        (rating !== null ||
          normalizedReview) ? (
          <View
            style={styles.review}
          >
            <View
              style={
                styles.reviewHeader
              }
            >
              {reviewerName ? (
                <Text
                  style={
                    styles.reviewerName
                  }
                >
                  {reviewerName}
                </Text>
              ) : null}

              {rating !== null ? (
                <Text
                  style={
                    styles.rating
                  }
                >
                  {Array.from(
                    {
                      length: 5,
                    },
                    (_, index) =>
                      index <
                      roundedRating
                        ? '★'
                        : '☆'
                  ).join('')}
                </Text>
              ) : null}
            </View>

            {normalizedReview ? (
              <>
                <Text
                  numberOfLines={
                    reviewExpanded
                      ? undefined
                      : 2
                  }
                  style={
                    styles.reviewComment
                  }
                >
                  {normalizedReview}
                </Text>

                {normalizedReview.length >
                70 ? (
                  <Pressable
                    onPress={() =>
                      setReviewExpanded(
                        (current) =>
                          !current
                      )
                    }
                  >
                    <Text
                      style={
                        styles.toggleText
                      }
                    >
                      {reviewExpanded
                        ? 'Скрыть'
                        : 'Показать полностью'}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : null}
          </View>
        ) : null}
      </View>

      {variant !== 'history' ? (
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
      ) : null}
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      position: 'relative',
      borderWidth: 1,
      borderColor: '#c5c4bc',
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: '#ffffff',
    },

    stripe: {
      position: 'absolute',
      zIndex: 2,
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },

    side: {
      paddingTop: 15,
      paddingHorizontal: 16,
      paddingBottom: 16,
      flexDirection: 'row',
      alignItems: 'flex-start',
      justifyContent:
        'space-between',
      gap: 12,
      backgroundColor: '#f3f3f3',
    },

    sideInfo: {
      flex: 1,
      gap: 6,
    },

    sideLine: {
      color: '#191919',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 18,
    },

    propertyLine: {
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 12,
      lineHeight: 16,
    },

    priceBox: {
      alignItems: 'flex-end',
    },

    price: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 20,
      lineHeight: 24,
    },

    priceCaption: {
      marginTop: 2,
      maxWidth: 105,
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 10,
      lineHeight: 12,
      textAlign: 'right',
    },

    body: {
      paddingTop: 18,
      paddingHorizontal: 16,
      paddingBottom: 8,
    },

    titleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 8,
    },

    title: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 20,
      lineHeight: 24,
    },

    address: {
      marginTop: 4,
      color: '#191919',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 18,
    },

    badge: {
      paddingVertical: 3,
      paddingHorizontal: 8,
      borderRadius: 999,
    },

    badgeText: {
      fontFamily:
        'Roboto_500Medium',
      fontSize: 10,
      lineHeight: 12,
    },

    description: {
      marginTop: 14,
      color: '#191919',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 18,
    },

    mutedDescription: {
      marginTop: 14,
      color: '#808080',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 18,
    },

    toggleText: {
      marginTop: 4,
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 13,
      lineHeight: 18,
    },

    meta: {
      marginTop: 16,
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 18,
    },

    historyMeta: {
      marginTop: 10,
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 18,
    },

    review: {
      marginTop: 14,
      padding: 12,
      borderWidth: 1,
      borderColor: '#d9d9d9',
      borderRadius: 8,
      gap: 8,
    },

    reviewHeader: {
      flexDirection: 'row',
      justifyContent:
        'space-between',
      alignItems: 'center',
      gap: 8,
    },

    reviewerName: {
      flex: 1,
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
    },

    rating: {
      color: '#191919',
      fontSize: 16,
      letterSpacing: 1,
    },

    reviewComment: {
      color: '#191919',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 20,
    },

    actions: {
      paddingTop: 12,
      paddingHorizontal: 16,
      paddingBottom: 16,
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
      color: '#d83b2f',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
      textAlign: 'center',
    },

    disabled: {
      opacity: 0.55,
    },
  });