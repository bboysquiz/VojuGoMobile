import { Image } from 'expo-image';
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CustomerResponseCard } from './CustomerResponseCard';
import {
  formatVehiclePropertyValue,
  getVehiclePropertyEntries,
  getVehicleTypeLabel,
  type CustomerOrder,
  type CustomerOrderResponse,
} from '../model/customer.types';

interface Props {
  order: CustomerOrder;
  choosingResponseId?: string | null;
  deleting?: boolean;
  cancelling?: boolean;
  releasing?: boolean;
  onChoose: (responseId: string) => void;
  onEdit?: () => void;
  onDelete: () => void;
  onCancel: () => void;
  onComplete: () => void;
  onRelease: () => void;
}

function formatNeededAt(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatPublished(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric',
    month: 'long',
  }).format(date);
}

function pluralResponses(count: number): string {
  const mod10 = count % 10;
  const mod100 = count % 100;

  return mod10 === 1 && mod100 !== 11
    ? 'Откликнулся'
    : 'Откликнулись';
}

function getChosenResponse(
  order: CustomerOrder,
): CustomerOrderResponse | undefined {
  return order.responses.find((response) => response.status === 'chosen');
}

export function CustomerOrderCard({
  order,
  choosingResponseId = null,
  deleting = false,
  cancelling = false,
  releasing = false,
  onChoose,
  onEdit,
  onDelete,
  onCancel,
  onComplete,
  onRelease,
}: Props) {
  const properties = getVehiclePropertyEntries(order.vehicle_properties);
  const chosenResponse = getChosenResponse(order);
  const assigned = order.status === 'ASSIGNED';
  const hasResponses = order.responses.length > 0;

  const statusLabel = assigned
    ? 'Закреплена за исполнителем'
    : hasResponses
      ? 'Ожидает вашего решения'
      : 'Ищем исполнителя';

  const statusStyle = assigned
    ? styles.statusGreen
    : hasResponses
      ? styles.statusYellow
      : styles.statusBlue;

  const statusTextStyle = assigned
    ? styles.statusGreenText
    : hasResponses
      ? styles.statusYellowText
      : styles.statusBlueText;

  return (
    <View style={styles.card}>
      <Image
        source={require('../../../../../assets/landing/hazard-stripe.svg')}
        style={styles.stripe}
        contentFit="cover"
      />

      <View style={styles.side}>
        <View style={styles.sideInfo}>
          <Text style={styles.sideLine}>◷ {formatNeededAt(order.needed_at)}</Text>
          <Text style={styles.sideLine}>
            ▣ {getVehicleTypeLabel(order.vehicle_properties.type)}
          </Text>

          {properties.map(([name, value]) => (
            <Text key={name} style={styles.property}>
              {formatVehiclePropertyValue(name, value)}
            </Text>
          ))}
        </View>

        <View style={styles.priceBox}>
          <Text style={styles.price}>
            {new Intl.NumberFormat('ru-RU').format(order.price)} ₽
          </Text>
          <Text style={styles.priceCaption}>
            {order.price_unit === 'per_hour'
              ? 'ваша цена, за час'
              : 'ваша цена, за заказ'}
          </Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.title}>{order.title}</Text>
        <Text style={styles.address}>{order.address}</Text>

        <View style={[styles.status, statusStyle]}>
          <Text style={[styles.statusText, statusTextStyle]}>
            {statusLabel}
          </Text>
        </View>

        <Text
          style={[
            styles.comment,
            !order.comment?.trim() && styles.commentMuted,
          ]}
        >
          {order.comment?.trim() || 'Комментарий к заявке не указан'}
        </Text>

        <Text style={styles.meta}>
          Опубликовано {formatPublished(order.created_at)} · №{order.id}
        </Text>

        {hasResponses || assigned ? (
          <View style={styles.responses}>
            {!assigned ? (
              <Text style={styles.responsesTitle}>
                {pluralResponses(order.responses.length)} ({order.responses.length})
              </Text>
            ) : null}

            {assigned ? (
              chosenResponse ? (
                <CustomerResponseCard response={chosenResponse} showChoose={false}>
                  <View style={styles.assignedActions}>
                    <Pressable onPress={onComplete} style={styles.blackButton}>
                      <Text style={styles.blackButtonText}>Завершить заказ</Text>
                    </Pressable>

                    <Pressable
                      disabled={releasing}
                      onPress={onRelease}
                      style={[
                        styles.outlineButton,
                        releasing && styles.disabled,
                      ]}
                    >
                      <Text style={styles.outlineButtonText}>
                        {releasing ? 'Отказываемся…' : 'Выбрать другого'}
                      </Text>
                    </Pressable>
                  </View>
                </CustomerResponseCard>
              ) : (
                <View style={styles.assignedActions}>
                  <Pressable onPress={onComplete} style={styles.blackButton}>
                    <Text style={styles.blackButtonText}>Завершить заказ</Text>
                  </Pressable>

                  <Pressable
                    disabled={releasing}
                    onPress={onRelease}
                    style={[
                      styles.outlineButton,
                      releasing && styles.disabled,
                    ]}
                  >
                    <Text style={styles.outlineButtonText}>
                      {releasing ? 'Отказываемся…' : 'Выбрать другого'}
                    </Text>
                  </Pressable>
                </View>
              )
            ) : (
              <View style={styles.responsesList}>
                {order.responses.map((response) => (
                  <CustomerResponseCard
                    key={response.id}
                    response={response}
                    isChoosing={choosingResponseId === response.id}
                    onChoose={onChoose}
                  />
                ))}
              </View>
            )}
          </View>
        ) : null}
      </View>

      {!assigned ? (
        <View style={styles.actions}>
          {!hasResponses ? (
            <>
              {onEdit ? (
                <Pressable onPress={onEdit} style={styles.outlineButton}>
                  <Text style={styles.outlineButtonText}>Редактировать</Text>
                </Pressable>
              ) : null}

              <Pressable
                disabled={deleting}
                onPress={onDelete}
                style={[styles.deleteButton, deleting && styles.disabled]}
              >
                <Text style={styles.deleteButtonText}>
                  {deleting ? 'Удаляем…' : 'Удалить'}
                </Text>
              </Pressable>
            </>
          ) : (
            <Pressable
              disabled={cancelling}
              onPress={onCancel}
              style={[styles.outlineButton, cancelling && styles.disabled]}
            >
              <Text style={styles.outlineButtonText}>
                {cancelling ? 'Отменяем…' : 'Отменить заявку'}
              </Text>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
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
    right: 0,
    left: 0,
    height: 4,
  },
  side: {
    padding: 16,
    paddingTop: 17,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
    backgroundColor: '#f3f3f3',
  },
  sideInfo: {
    flex: 1,
    gap: 6,
  },
  sideLine: {
    color: '#191919',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  property: {
    color: '#737373',
    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },
  priceBox: {
    maxWidth: 130,
    alignItems: 'flex-end',
  },
  price: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 24,
    textAlign: 'right',
  },
  priceCaption: {
    marginTop: 1,
    color: '#737373',
    fontFamily: 'Roboto_400Regular',
    fontSize: 10,
    lineHeight: 12,
    textAlign: 'right',
  },
  body: {
    padding: 16,
  },
  title: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 24,
  },
  address: {
    marginTop: 4,
    color: '#191919',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  status: {
    alignSelf: 'flex-start',
    marginTop: 4,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  statusText: {
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,
  },
  statusBlue: {
    backgroundColor: '#e6ecf7',
  },
  statusBlueText: {
    color: '#3363bf',
  },
  statusYellow: {
    backgroundColor: '#ffeeb7',
  },
  statusYellowText: {
    color: '#cd5500',
  },
  statusGreen: {
    backgroundColor: '#c9fae3',
  },
  statusGreenText: {
    color: '#02a156',
  },
  comment: {
    marginTop: 16,
    color: '#191919',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  commentMuted: {
    color: '#808080',
  },
  meta: {
    marginTop: 16,
    color: '#737373',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  responses: {
    marginTop: 32,
    gap: 16,
  },
  responsesTitle: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,
  },
  responsesList: {
    gap: 12,
  },
  assignedActions: {
    gap: 8,
  },
  actions: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  blackButton: {
    width: '100%',
    minHeight: 56,
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
  outlineButton: {
    width: '100%',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#c5c4bc',
    borderRadius: 8,
    backgroundColor: '#ffffff',
  },
  outlineButtonText: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,
  },
  deleteButton: {
    width: '100%',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#e0533b',
  },
  deleteButtonText: {
    color: '#ffffff',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.55,
  },
});
