import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CustomerResponseCard } from './CustomerResponseCard';
import { OrderCard } from '../../components/OrderCard';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import {
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
  const chosenResponse = getChosenResponse(order);
  const assigned = order.status === 'ASSIGNED';
  const hasResponses = order.responses.length > 0;

  const statusLabel = assigned
    ? 'Закреплена за исполнителем'
    : hasResponses
      ? 'Ожидает вашего решения'
      : 'Ищем исполнителя';

  const statusTone = assigned ? 'green' : hasResponses ? 'yellow' : 'blue';

  return (
    <OrderCard order={order} status={<OrderStatusBadge label={statusLabel} tone={statusTone} />}
      actions={!assigned ? (
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
      ) : null}>
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
    </OrderCard>
  );
}

const styles = StyleSheet.create({
  responses: {
    marginTop: 16,
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
