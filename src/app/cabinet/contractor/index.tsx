import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useRouter,
} from 'expo-router';

import {
  createOrderResponse,
  getAllAvailableOrders,
  getContractorResponses,
  getContractorVehicles,
  getVehicleTypes,
  skipOrder,
} from '../../../features/cabinet/contractor/api/contractor.api';

import {
  ContractorOrderCard,
} from '../../../features/cabinet/contractor/components/ContractorOrderCard';

import {
  ConfirmModal,
  ContractorEmptyState,
  ContractorPageHeader,
  ContractorStateCard,
} from '../../../features/cabinet/contractor/components/ContractorUi';

import type {
  ContractorOrder,
  ContractorVehicle,
  VehicleType,
} from '../../../features/cabinet/contractor/model/contractor.types';

export default function ContractorOrdersPage() {
  const router = useRouter();

  const [
    orders,
    setOrders,
  ] = useState<
    ContractorOrder[]
  >([]);

  const [
    vehicles,
    setVehicles,
  ] = useState<
    ContractorVehicle[]
  >([]);

  const [
    typeLabels,
    setTypeLabels,
  ] = useState<
    Record<string, string>
  >({});

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  const [
    actionError,
    setActionError,
  ] = useState('');

  const [
    respondingId,
    setRespondingId,
  ] = useState<
    string | null
  >(null);

  const [
    skippingId,
    setSkippingId,
  ] = useState<
    string | null
  >(null);

  const [
    skipOrderId,
    setSkipOrderId,
  ] = useState<
    string | null
  >(null);

  const refreshing =
    useRef(false);

  async function loadOrders(
    showLoader = true
  ) {
    if (refreshing.current) {
      return;
    }

    refreshing.current = true;

    if (showLoader) {
      setLoading(true);
      setLoadError('');
      setActionError('');
    }

    try {
      const [
        loadedResponses,
        loadedVehicles,
        vehicleTypes,
      ] = await Promise.all([
        getContractorResponses(),
        getContractorVehicles(),
        getVehicleTypes(),
      ]);

      const equipmentTypes = [
        ...new Set(
          loadedVehicles.map(
            (vehicle) =>
              vehicle.properties
                .type
          )
        ),
      ] as VehicleType[];

      const feedOrders =
        equipmentTypes.length >
        0
          ? await getAllAvailableOrders(
              equipmentTypes
            )
          : [];

      const respondedOrderIds =
        new Set(
          loadedResponses.map(
            (response) =>
              response.order_id
          )
        );

      setOrders(
        feedOrders.filter(
          (order) =>
            !respondedOrderIds.has(
              order.id
            )
        )
      );

      setVehicles(
        loadedVehicles
      );

      setTypeLabels(
        Object.fromEntries(
          vehicleTypes.map(
            (item) => [
              item.value,
              item.label,
            ]
          )
        )
      );
    } catch (error) {
      if (showLoader) {
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить новые заявки'
        );
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }

      refreshing.current =
        false;
    }
  }

  useEffect(() => {
    void loadOrders();

    const timer = setInterval(
      () => {
        void loadOrders(false);
      },
      5000
    );

    return () =>
      clearInterval(timer);
  }, []);

  async function handleRespond(
    order: ContractorOrder
  ) {
    setActionError('');
    setRespondingId(order.id);

    try {
      const matchingVehicle =
        vehicles.find(
          (vehicle) =>
            vehicle.properties
              .type ===
            order.vehicle_properties
              .type
        );

      if (!matchingVehicle) {
        setActionError(
          'У вас нет техники подходящего типа для этой заявки'
        );
        return;
      }

      await createOrderResponse(
        order.id,
        matchingVehicle.id
      );

      router.push(
        '/cabinet/contractor/responses'
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось отправить отклик'
      );
    } finally {
      setRespondingId(null);
    }
  }

  async function confirmSkip() {
    if (!skipOrderId) {
      return;
    }

    const orderId =
      skipOrderId;

    setActionError('');
    setSkippingId(orderId);

    try {
      await skipOrder(orderId);

      setOrders(
        (current) =>
          current.filter(
            (order) =>
              order.id !==
              orderId
          )
      );

      setSkipOrderId(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось пропустить заявку'
      );
    } finally {
      setSkippingId(null);
    }
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={
          styles.content
        }
      >
        <ContractorPageHeader
          title="Заявки"
        />

        {loading ? (
          <ContractorStateCard
            message="Загружаем заявки…"
          />
        ) : loadError ? (
          <ContractorStateCard
            error
            message={loadError}
            onRetry={() =>
              void loadOrders()
            }
          />
        ) : (
          <>
            {actionError ? (
              <View
                style={
                  styles.error
                }
              >
                <Text
                  style={
                    styles.errorText
                  }
                >
                  {actionError}
                </Text>
              </View>
            ) : null}

            <View
              style={
                styles.orders
              }
            >
              {orders.map(
                (order) => (
                  <ContractorOrderCard
                    key={
                      order.id
                    }
                    order={order}
                    equipmentTypeLabel={
                      typeLabels[
                        order
                          .vehicle_properties
                          .type
                      ] ??
                      order
                        .vehicle_properties
                        .type
                    }
                    variant="new"
                    isResponding={
                      respondingId ===
                      order.id
                    }
                    isSkipping={
                      skippingId ===
                      order.id
                    }
                    onRespond={() =>
                      void handleRespond(
                        order
                      )
                    }
                    onSkip={() =>
                      setSkipOrderId(
                        order.id
                      )
                    }
                  />
                )
              )}

              {orders.length ===
              0 ? (
                <ContractorEmptyState
                  title="Пока нет новых заявок"
                  description={[
                    'Как только заказчики разместят новые заявки, они появятся здесь.',
                    'Мы уведомим вас сразу, как будет что-то новое',
                  ]}
                  actionLabel="Обновить"
                  onAction={() =>
                    void loadOrders()
                  }
                />
              ) : null}
            </View>
          </>
        )}
      </ScrollView>

      <ConfirmModal
        open={
          skipOrderId !== null
        }
        title="Отказаться от заявки?"
        description="Уверены, что хотите отказаться от заявки?"
        confirmLabel="Отказаться"
        busyLabel="Отказываемся…"
        busy={
          skippingId !== null
        }
        onClose={() => {
          if (!skippingId) {
            setSkipOrderId(
              null
            );
          }
        }}
        onConfirm={() =>
          void confirmSkip()
        }
      />
    </>
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

    orders: {
      gap: 16,
    },

    error: {
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor:
        'rgba(216,59,47,0.35)',
      borderRadius: 8,
      backgroundColor:
        'rgba(216,59,47,0.10)',
    },

    errorText: {
      color: '#8a2f22',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 13,
      lineHeight: 18,
    },
  });