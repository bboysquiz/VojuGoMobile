import {
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { useRouter } from 'expo-router';

import {
  cancelCustomerOrder,
  chooseCustomerOrderResponse,
  completeCustomerOrder,
  deleteCustomerOrder,
  getCustomerDashboard,
  getCustomerOrder,
  getCustomerOrderResponses,
  releaseOrderAssignment,
} from '../../../features/cabinet/customer/api/customer.api';

import { CustomerOrderCard } from '../../../features/cabinet/customer/components/CustomerOrderCard';
import { CustomerReviewModal } from '../../../features/cabinet/customer/components/CustomerReviewModal';
import {
  CustomerConfirmModal,
  CustomerEmptyState,
  CustomerState,
  CustomerTabs,
} from '../../../features/cabinet/customer/components/CustomerUi';

import type {
  CustomerDashboard,
  CustomerOrder,
  OrderReviewFields,
} from '../../../features/cabinet/customer/model/customer.types';

type OrderTab =
  | 'without_responses'
  | 'with_responses'
  | 'assigned';

export default function CustomerOrdersPage() {
  const router = useRouter();

  const [dashboard, setDashboard] = useState<CustomerDashboard | null>(null);
  const [activeTab, setActiveTab] = useState<OrderTab>('without_responses');
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [actionError, setActionError] = useState('');

  const [choosingResponseId, setChoosingResponseId] = useState<string | null>(null);
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null);
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelOrderId, setCancelOrderId] = useState<string | null>(null);
  const [releasingOrderId, setReleasingOrderId] = useState<string | null>(null);
  const [releaseOrderId, setReleaseOrderId] = useState<string | null>(null);
  const [completionOrderId, setCompletionOrderId] = useState<string | null>(null);
  const [completingOrderId, setCompletingOrderId] = useState<string | null>(null);

  const refreshing = useRef(false);
  const mounted = useRef(true);

  async function loadDashboard(showLoader = true) {
    if (refreshing.current) {
      return;
    }

    refreshing.current = true;

    if (showLoader) {
      setLoading(true);
      setLoadError('');
    }

    try {
      const result = await getCustomerDashboard();

      if (!mounted.current) {
        return;
      }

      setDashboard(result);

      if (showLoader) {
        setLoadError('');
      }
    } catch (error) {
      if (showLoader && mounted.current) {
        setLoadError(
          error instanceof Error
            ? error.message
            : 'Не удалось загрузить заявки',
        );
      }
    } finally {
      if (showLoader && mounted.current) {
        setLoading(false);
      }

      refreshing.current = false;
    }
  }

  useEffect(() => {
    mounted.current = true;
    void loadDashboard();

    const timer = setInterval(() => {
      void loadDashboard(false);
    }, 5000);

    return () => {
      mounted.current = false;
      clearInterval(timer);
    };
  }, []);

  const orders = dashboard?.orders ?? [];

  const ordersWithoutResponses = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === 'OPEN' &&
          order.responses.length === 0,
      ),
    [orders],
  );

  const ordersWithResponses = useMemo(
    () =>
      orders.filter(
        (order) =>
          order.status === 'RESPONDED' ||
          (order.status !== 'ASSIGNED' && order.responses.length > 0),
      ),
    [orders],
  );

  const assignedOrders = useMemo(
    () => orders.filter((order) => order.status === 'ASSIGNED'),
    [orders],
  );

  const visibleOrders =
    activeTab === 'without_responses'
      ? ordersWithoutResponses
      : activeTab === 'with_responses'
        ? ordersWithResponses
        : assignedOrders;

  const completionOrder = orders.find(
    (order) => order.id === completionOrderId,
  );

  function chosenResponse(order: CustomerOrder | undefined) {
    return order?.responses.find((response) => response.status === 'chosen');
  }

  async function handleChoose(orderId: string, responseId: string) {
    if (choosingResponseId) {
      return;
    }

    setActionError('');
    setChoosingResponseId(responseId);

    try {
      await chooseCustomerOrderResponse(orderId, responseId);
      await loadDashboard();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось выбрать исполнителя',
      );
    } finally {
      setChoosingResponseId(null);
    }
  }

  async function handleDelete(orderId: string) {
    if (deletingOrderId) {
      return;
    }

    setActionError('');
    setDeletingOrderId(orderId);

    try {
      const [currentOrder, responses] = await Promise.all([
        getCustomerOrder(orderId),
        getCustomerOrderResponses(orderId),
      ]);

      if (currentOrder.status !== 'OPEN' || responses.length > 0) {
        setActionError('Удалить можно только открытую заявку без откликов');
        setDeleteOrderId(null);
        await loadDashboard();
        return;
      }

      await deleteCustomerOrder(orderId);

      setDashboard((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          summary: {
            ...current.summary,
            active_orders: Math.max(0, current.summary.active_orders - 1),
            orders_without_responses: Math.max(
              0,
              current.summary.orders_without_responses - 1,
            ),
          },
          orders: current.orders.filter((order) => order.id !== orderId),
        };
      });

      setDeleteOrderId(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось удалить заявку',
      );
    } finally {
      setDeletingOrderId(null);
    }
  }

  async function handleCancel(orderId: string) {
    if (cancellingOrderId) {
      return;
    }

    setActionError('');
    setCancellingOrderId(orderId);

    try {
      await cancelCustomerOrder(orderId);
      setCancelOrderId(null);
      await loadDashboard();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось отменить заявку',
      );
    } finally {
      setCancellingOrderId(null);
    }
  }

  async function handleRelease(orderId: string) {
    if (releasingOrderId) {
      return;
    }

    setActionError('');
    setReleasingOrderId(orderId);

    try {
      await releaseOrderAssignment(orderId);
      setReleaseOrderId(null);
      await loadDashboard(false);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось отказаться от заявки',
      );
    } finally {
      setReleasingOrderId(null);
    }
  }

  async function handleComplete(
    orderId: string,
    feedback: OrderReviewFields,
  ) {
    if (completingOrderId) {
      return;
    }

    setActionError('');
    setCompletingOrderId(orderId);

    const hasFeedback =
      feedback.rating !== undefined ||
      feedback.comment !== undefined;

    try {
      await completeCustomerOrder(
        orderId,
        hasFeedback ? feedback : undefined,
      );

      setCompletionOrderId(null);
      router.push('/cabinet/customer/history');
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось завершить заказ',
      );
    } finally {
      setCompletingOrderId(null);
    }
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.title}>Мои заявки</Text>

        {loading ? (
          <CustomerState message="Загружаем заявки…" />
        ) : loadError ? (
          <CustomerState
            error
            message={loadError}
            onRetry={() => void loadDashboard()}
          />
        ) : dashboard ? (
          <>
            <CustomerTabs
              value={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  value: 'without_responses',
                  label: 'Без откликов',
                  count: ordersWithoutResponses.length,
                },
                {
                  value: 'with_responses',
                  label: 'Есть отклики',
                  count: ordersWithResponses.length,
                },
                {
                  value: 'assigned',
                  label: 'Исполнитель выбран',
                  count: assignedOrders.length,
                },
              ]}
            />

            {actionError ? (
              <View style={styles.actionError}>
                <Text style={styles.actionErrorText}>{actionError}</Text>
              </View>
            ) : null}

            <View style={styles.orders}>
              {visibleOrders.map((order) => (
                <CustomerOrderCard
                  key={order.id}
                  order={order}
                  choosingResponseId={choosingResponseId}
                  deleting={deletingOrderId === order.id}
                  cancelling={cancellingOrderId === order.id}
                  releasing={releasingOrderId === order.id}
                  onChoose={(responseId) =>
                    void handleChoose(order.id, responseId)
                  }
                  onDelete={() => {
                    setActionError('');
                    setDeleteOrderId(order.id);
                  }}
                  onCancel={() => {
                    setActionError('');
                    setCancelOrderId(order.id);
                  }}
                  onComplete={() => {
                    setActionError('');
                    setCompletionOrderId(order.id);
                  }}
                  onRelease={() => {
                    setActionError('');
                    setReleaseOrderId(order.id);
                  }}
                />
              ))}

              {visibleOrders.length === 0 ? (
                <CustomerEmptyState
                  onCreate={() => router.push('/cabinet/customer/new')}
                />
              ) : null}
            </View>
          </>
        ) : null}
      </ScrollView>

      <CustomerConfirmModal
        open={deleteOrderId !== null}
        title="Удалить заявку?"
        description="Уверены, что хотите удалить эту заявку?"
        confirmLabel="Удалить"
        busyLabel="Удаляем…"
        busy={deletingOrderId !== null}
        errorMessage={actionError}
        onClose={() => {
          if (!deletingOrderId) {
            setDeleteOrderId(null);
          }
        }}
        onConfirm={() => {
          if (deleteOrderId) {
            void handleDelete(deleteOrderId);
          }
        }}
      />

      <CustomerConfirmModal
        open={cancelOrderId !== null}
        title="Отменить заявку?"
        description="Уверены, что хотите отменить эту заявку?"
        confirmLabel="Отменить заявку"
        busyLabel="Отменяем…"
        busy={cancellingOrderId !== null}
        errorMessage={actionError}
        onClose={() => {
          if (!cancellingOrderId) {
            setCancelOrderId(null);
          }
        }}
        onConfirm={() => {
          if (cancelOrderId) {
            void handleCancel(cancelOrderId);
          }
        }}
      />

      <CustomerConfirmModal
        open={releaseOrderId !== null}
        title="Отказаться от заявки?"
        description="Уверены, что хотите отказаться от заявки?"
        confirmLabel="Отказаться"
        busyLabel="Отказываемся…"
        busy={releasingOrderId !== null}
        errorMessage={actionError}
        onClose={() => {
          if (!releasingOrderId) {
            setReleaseOrderId(null);
          }
        }}
        onConfirm={() => {
          if (releaseOrderId) {
            void handleRelease(releaseOrderId);
          }
        }}
      />

      <CustomerReviewModal
        open={completionOrder !== undefined}
        contractorName={
          chosenResponse(completionOrder)?.contractor_name ||
          chosenResponse(completionOrder)?.contractor_company_name ||
          'Исполнитель'
        }
        saving={completingOrderId !== null}
        errorMessage={actionError}
        onClose={() => {
          if (!completingOrderId) {
            setCompletionOrderId(null);
          }
        }}
        onSubmit={(feedback) => {
          if (completionOrderId) {
            void handleComplete(completionOrderId, feedback);
          }
        }}
      />
    </>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  title: {
    marginBottom: 20,
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 24,
    lineHeight: 30,
  },
  orders: {
    marginTop: 16,
    gap: 16,
  },
  actionError: {
    marginTop: 12,
    paddingVertical: 12,
  },
  actionErrorText: {
    color: '#e0533b',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
});
