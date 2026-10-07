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

import {
  useRouter,
} from 'expo-router';

import {
  getSelf,
} from '../../../features/auth/api/auth.api';

import {
  deleteOrderResponse,
  getContractorRating,
  getContractorResponseEntries,
  getContractorResponses,
  getOrderCustomerContact,
  getVehicleTypes,
  releaseOrderAssignment,
} from '../../../features/cabinet/contractor/api/contractor.api';

import {
  ContractorOrderCard,
} from '../../../features/cabinet/contractor/components/ContractorOrderCard';

import {
  ConfirmModal,
  ContractorEmptyState,
  ContractorPageHeader,
  ContractorStateCard,
  ContractorStatCard,
  ContractorTabs,
} from '../../../features/cabinet/contractor/components/ContractorUi';

import type {
  ContractorOrderResponseStatus,
  ContractorRating,
  ContractorResponseEntry,
  OrderCustomerContact,
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

export default function ContractorResponsesPage() {
  const router = useRouter();

  const [
    entries,
    setEntries,
  ] = useState<
    ContractorResponseEntry[]
  >([]);

  const [
    typeLabels,
    setTypeLabels,
  ] = useState<
    Record<string, string>
  >({});

  const [
    contacts,
    setContacts,
  ] = useState<
    Record<
      string,
      OrderCustomerContact
    >
  >({});

  const [
    rating,
    setRating,
  ] = useState<
    ContractorRating | null
  >(null);

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<ContractorOrderResponseStatus>(
      'pending'
    );

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
    deletingId,
    setDeletingId,
  ] = useState<
    string | null
  >(null);

  const [
    releasingId,
    setReleasingId,
  ] = useState<
    string | null
  >(null);

  const [
    deletePending,
    setDeletePending,
  ] = useState<
    ContractorResponseEntry | null
  >(null);

  const [
    releasePending,
    setReleasePending,
  ] = useState<
    ContractorResponseEntry | null
  >(null);

  const refreshing =
    useRef(false);

  async function loadResponses(
    showLoader = true
  ) {
    if (refreshing.current) {
      return;
    }

    refreshing.current = true;

    if (showLoader) {
      setLoading(true);
      setLoadError('');
    }

    try {
      const [
        responses,
        vehicleTypes,
        user,
      ] = await Promise.all([
        getContractorResponses(),
        getVehicleTypes(),
        getSelf(),
      ]);

      const [
        loadedEntries,
        loadedRating,
      ] = await Promise.all([
        getContractorResponseEntries(
          responses
        ),
        getContractorRating(
          user.id
        ),
      ]);

      const chosenOrderIds =
        loadedEntries
          .filter(
            ({ response }) =>
              response.status ===
              'chosen'
          )
          .map(
            ({ order }) =>
              order.id
          );

      const contactResults =
        await Promise.allSettled(
          chosenOrderIds.map(
            async (orderId) => ({
              orderId,
              contact:
                await getOrderCustomerContact(
                  orderId
                ),
            })
          )
        );

      const loadedContacts: Record<
        string,
        OrderCustomerContact
      > = {};

      for (const result of contactResults) {
        if (
          result.status ===
          'fulfilled'
        ) {
          loadedContacts[
            result.value.orderId
          ] =
            result.value.contact;
        }
      }

      setEntries(loadedEntries);
      setRating(loadedRating);
      setContacts(loadedContacts);

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
            : 'Не удалось загрузить отклики'
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
    void loadResponses();

    const timer = setInterval(
      () => {
        void loadResponses(false);
      },
      5000
    );

    return () =>
      clearInterval(timer);
  }, []);

  const visibleEntries =
    useMemo(
      () =>
        entries.filter(
          ({ response }) =>
            response.status ===
            activeTab
        ),
      [entries, activeTab]
    );

  const responsesToday =
    entries.filter(({ response }) =>
      isToday(response.created_at)
    ).length;

  const chosenCount =
    entries.filter(
      ({ response }) =>
        response.status ===
        'chosen'
    ).length;

  const emptyState =
    activeTab === 'chosen'
      ? {
          title:
            'Пока вас не выбрали',
          description:
            'Когда заказчик выберет вас, заявка появится здесь',
        }
      : activeTab ===
          'not_chosen'
        ? {
            title:
              'Пока нет неактуальных откликов',
            description:
              'Здесь появятся заявки, которые стали неактуальными',
          }
        : {
            title:
              'Пока нет откликов',
            description:
              'Откликайтесь на заявки и они появятся здесь',
          };

  async function deleteEntry(
    entry: ContractorResponseEntry
  ) {
    setActionError('');
    setDeletingId(
      entry.response.id
    );

    try {
      await deleteOrderResponse(
        entry.order.id,
        entry.response.id
      );

      setEntries(
        (current) =>
          current.filter(
            ({ response }) =>
              response.id !==
              entry.response.id
          )
      );

      setDeletePending(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось удалить отклик'
      );
    } finally {
      setDeletingId(null);
    }
  }

  async function handleDelete(
    entry: ContractorResponseEntry
  ) {
    if (
      entry.response.status ===
      'pending'
    ) {
      setDeletePending(entry);
      return;
    }

    await deleteEntry(entry);
  }

  async function releaseEntry(
    entry: ContractorResponseEntry
  ) {
    setActionError('');
    setReleasingId(
      entry.response.id
    );

    try {
      const released =
        await releaseOrderAssignment(
          entry.order.id
        );

      setEntries(
        (current) =>
          current.map(
            (currentEntry) =>
              currentEntry
                .response.id ===
              entry.response.id
                ? {
                    order: {
                      ...currentEntry.order,
                      ...released,
                    },
                    response: {
                      ...currentEntry.response,
                      status:
                        'not_chosen',
                    },
                  }
                : currentEntry
          )
      );

      setContacts(
        (current) => {
          const next = {
            ...current,
          };

          delete next[
            entry.order.id
          ];

          return next;
        }
      );

      setReleasePending(null);
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : 'Не удалось отказаться от заявки'
      );
    } finally {
      setReleasingId(null);
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
          title="Мои отклики"
        />

        {loading ? (
          <ContractorStateCard
            message="Загружаем отклики…"
          />
        ) : loadError ? (
          <ContractorStateCard
            error
            message={loadError}
            onRetry={() =>
              void loadResponses()
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
                value={
                  responsesToday
                }
                description="заказчик ещё не выбрал исполнителя"
              />

              <ContractorStatCard
                label="выбрали вас"
                value={chosenCount}
                description="заказчик выбрал вас"
                positive
              />

              <ContractorStatCard
                label="заказа выполнено"
                value={
                  rating?.completed_orders_count ??
                  0
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

            <ContractorTabs
              value={activeTab}
              onChange={setActiveTab}
              items={[
                {
                  value:
                    'pending',
                  label: 'Отклики',
                },
                {
                  value:
                    'chosen',
                  label:
                    'Выбрали вас',
                },
                {
                  value:
                    'not_chosen',
                  label:
                    'Неактуальные',
                },
              ]}
            />

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
              {visibleEntries.map(
                (entry) => (
                  <ContractorOrderCard
                    key={
                      entry.response
                        .id
                    }
                    order={
                      entry.order
                    }
                    variant={
                      entry.response
                        .status
                    }
                    equipmentTypeLabel={
                      typeLabels[
                        entry.order
                          .vehicle_properties
                          .type
                      ] ??
                      entry.order
                        .vehicle_properties
                        .type
                    }
                    customerContact={
                      entry.response
                        .status ===
                      'chosen'
                        ? contacts[
                            entry
                              .order
                              .id
                          ]
                        : undefined
                    }
                    showResponseStatus
                    isDeleting={
                      deletingId ===
                      entry.response
                        .id
                    }
                    isReleasing={
                      releasingId ===
                      entry.response
                        .id
                    }
                    onDeleteResponse={() =>
                      void handleDelete(
                        entry
                      )
                    }
                    onReleaseAssignment={() =>
                      setReleasePending(
                        entry
                      )
                    }
                  />
                )
              )}

              {visibleEntries.length ===
              0 ? (
                <ContractorEmptyState
                  title={
                    emptyState.title
                  }
                  description={
                    emptyState.description
                  }
                  actionLabel="Смотреть заявки"
                  onAction={() =>
                    router.push(
                      '/cabinet/contractor'
                    )
                  }
                />
              ) : null}
            </View>
          </>
        )}
      </ScrollView>

      <ConfirmModal
        open={
          deletePending !== null
        }
        title="Отказаться от заявки?"
        description="Уверены, что хотите отказаться от заявки?"
        confirmLabel="Отказаться"
        busyLabel="Отказываемся…"
        busy={
          deletingId !== null
        }
        onClose={() => {
          if (!deletingId) {
            setDeletePending(
              null
            );
          }
        }}
        onConfirm={() => {
          if (deletePending) {
            void deleteEntry(
              deletePending
            );
          }
        }}
      />

      <ConfirmModal
        open={
          releasePending !== null
        }
        title="Отказаться от заявки?"
        description="Уверены, что хотите отказаться от заявки?"
        confirmLabel="Отказаться"
        busyLabel="Отказываемся…"
        busy={
          releasingId !== null
        }
        onClose={() => {
          if (!releasingId) {
            setReleasePending(
              null
            );
          }
        }}
        onConfirm={() => {
          if (releasePending) {
            void releaseEntry(
              releasePending
            );
          }
        }}
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

    stats: {
      paddingRight: 16,
      paddingBottom: 16,
      gap: 8,
    },

    orders: {
      marginTop: 16,
      gap: 16,
    },

    error: {
      marginTop: 16,
      padding: 12,
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