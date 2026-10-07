import {
  useEffect,
  useState,
} from 'react';

import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getSelf,
} from '../../../features/auth/api/auth.api';

import {
  getContractorOrders,
  getContractorRating,
  getContractorResponses,
} from '../../../features/cabinet/contractor/api/contractor.api';

import {
  ContractorOrderCard,
} from '../../../features/cabinet/contractor/components/ContractorOrderCard';

import {
  ContractorPageHeader,
  ContractorStateCard,
  ContractorStatCard,
} from '../../../features/cabinet/contractor/components/ContractorUi';

import {
  getVehicleTypeLabel,
  type ContractorCompletedOrder,
  type ContractorOrderResponse,
  type ContractorRating,
} from '../../../features/cabinet/contractor/model/contractor.types';

function isToday(
  value: string
) {
  const date = new Date(value);
  const now = new Date();

  return (
    date.getFullYear() ===
      now.getFullYear() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getDate() ===
      now.getDate()
  );
}

export default function ContractorHistoryPage() {
  const [
    orders,
    setOrders,
  ] = useState<
    ContractorCompletedOrder[]
  >([]);

  const [
    responses,
    setResponses,
  ] = useState<
    ContractorOrderResponse[]
  >([]);

  const [
    rating,
    setRating,
  ] = useState<
    ContractorRating | null
  >(null);

  const [
    hintVisible,
    setHintVisible,
  ] = useState(true);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState('');

  async function loadHistory() {
    setLoading(true);
    setError('');

    try {
      const user =
        await getSelf();

      const [
        completedOrders,
        contractorRating,
        contractorResponses,
      ] = await Promise.all([
        getContractorOrders(
          user.id
        ),
        getContractorRating(
          user.id
        ),
        getContractorResponses(),
      ]);

      setOrders(
        completedOrders
      );
      setRating(
        contractorRating
      );
      setResponses(
        contractorResponses
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Не удалось загрузить историю'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadHistory();
  }, []);

  const responsesToday =
    responses.filter((response) =>
      isToday(response.created_at)
    ).length;

  const chosenResponses =
    responses.filter(
      (response) =>
        response.status ===
        'chosen'
    ).length;

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <ContractorPageHeader
        title="История"
      />

      {loading ? (
        <ContractorStateCard
          message="Загружаем историю…"
        />
      ) : error ? (
        <ContractorStateCard
          error
          message={error}
          onRetry={() =>
            void loadHistory()
          }
        />
      ) : (
        <>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={
              false
            }
            contentContainerStyle={
              styles.stats
            }
          >
            <ContractorStatCard
              label="откликов сегодня"
              value={responsesToday}
            />

            <ContractorStatCard
              label="выбрали вас"
              value={chosenResponses}
            />

            <ContractorStatCard
              label="заказа состоялось"
              value={
                rating?.completed_orders_count ??
                orders.length
              }
            />

            <ContractorStatCard
              label="★ рейтинг"
              value={
                rating
                  ? rating.average_rating.toFixed(
                      1
                    )
                  : '—'
              }
            />
          </ScrollView>

          {hintVisible ? (
            <View
              style={styles.hint}
            >
              <Text
                style={
                  styles.hintText
                }
              >
                Хороший рейтинг
                помогает получать
                больше заказов
              </Text>

              <Pressable
                onPress={() =>
                  setHintVisible(
                    false
                  )
                }
                style={
                  styles.hintClose
                }
              >
                <Text
                  style={
                    styles.hintCloseText
                  }
                >
                  ×
                </Text>
              </Pressable>
            </View>
          ) : null}

          <View
            style={styles.orders}
          >
            {orders.map(
              (order) => (
                <ContractorOrderCard
                  key={order.id}
                  order={order}
                  equipmentTypeLabel={getVehicleTypeLabel(
                    order
                      .vehicle_properties
                      .type
                  )}
                  reviewerName={
                    order.customer_name?.trim() ||
                    'Заказчик'
                  }
                  rating={
                    order.rating
                  }
                  reviewComment={
                    order.review_comment
                  }
                  variant="history"
                />
              )
            )}

            {orders.length ===
            0 ? (
              <Text
                style={styles.empty}
              >
                Завершённых заказов
                пока нет.
              </Text>
            ) : null}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles =
  StyleSheet.create({
    screen: {
      flex: 1,
      backgroundColor: '#f1f1f1',
    },

    content: {
      padding: 16,
      paddingBottom: 32,
    },

    stats: {
      paddingRight: 16,
      paddingBottom: 16,
      gap: 8,
    },

    hint: {
      minHeight: 48,
      marginBottom: 16,
      paddingVertical: 12,
      paddingHorizontal: 16,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 16,
      borderRadius: 6,
      backgroundColor: '#fff3ae',
    },

    hintText: {
      flex: 1,
      color: '#191919',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 12,
      lineHeight: 16,
    },

    hintClose: {
      width: 24,
      height: 24,
      alignItems: 'center',
      justifyContent: 'center',
    },

    hintCloseText: {
      color: '#191919',
      fontSize: 22,
      lineHeight: 22,
    },

    orders: {
      gap: 16,
    },

    empty: {
      padding: 20,
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      textAlign: 'center',
    },
  });