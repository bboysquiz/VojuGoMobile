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
  useRouter,
} from 'expo-router';

import {
  deleteContractorVehicle,
  getContractorVehicles,
  getVehicleTypes,
} from '../../../../features/cabinet/contractor/api/contractor.api';

import {
  ContractorVehicleCard,
} from '../../../../features/cabinet/contractor/components/ContractorVehicleCard';

import {
  ContractorStateCard,
} from '../../../../features/cabinet/contractor/components/ContractorUi';

import type {
  ContractorVehicle,
} from '../../../../features/cabinet/contractor/model/contractor.types';

export default function ContractorVehiclesPage() {
  const router = useRouter();

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
    error,
    setError,
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

  async function loadVehicles() {
    setLoading(true);
    setError('');
    setActionError('');

    try {
      const [
        loadedVehicles,
        vehicleTypes,
      ] = await Promise.all([
        getContractorVehicles(),
        getVehicleTypes(),
      ]);

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
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Не удалось загрузить технику'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVehicles();
  }, []);

  async function handleDelete(
    vehicleId: string
  ) {
    setDeletingId(vehicleId);
    setActionError('');

    try {
      await deleteContractorVehicle(
        vehicleId
      );

      setVehicles(
        (current) =>
          current.filter(
            (vehicle) =>
              vehicle.id !==
              vehicleId
          )
      );
    } catch (caught) {
      setActionError(
        caught instanceof Error
          ? caught.message
          : 'Не удалось удалить технику'
      );

      throw caught;
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      {loading ? (
        <ContractorStateCard
          message="Загружаем технику…"
        />
      ) : error ? (
        <ContractorStateCard
          error
          message={error}
          onRetry={() =>
            void loadVehicles()
          }
        />
      ) : (
        <>
          {actionError ? (
            <View
              style={styles.error}
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

          <View style={styles.list}>
            {vehicles.map(
              (vehicle, index) => (
                <ContractorVehicleCard
                  key={vehicle.id}
                  vehicle={vehicle}
                  typeLabel={
                    typeLabels[
                      vehicle
                        .properties
                        .type
                    ] ??
                    vehicle.properties
                      .type
                  }
                  showTitle={
                    index === 0
                  }
                  deleting={
                    deletingId ===
                    vehicle.id
                  }
                  onEdit={() =>
                    router.push(
                      `/cabinet/contractor/vehicles/${vehicle.id}/edit`
                    )
                  }
                  onDelete={() =>
                    handleDelete(
                      vehicle.id
                    )
                  }
                />
              )
            )}

            <Pressable
              onPress={() =>
                router.push(
                  '/cabinet/contractor/vehicles/new'
                )
              }
              style={styles.addTile}
            >
              <View
                style={
                  styles.plusCircle
                }
              >
                <Text
                  style={
                    styles.plus
                  }
                >
                  +
                </Text>
              </View>

              <View style={styles.addText}>
                <Text
                  style={
                    styles.addTitle
                  }
                >
                  Добавить технику
                </Text>

                <Text
                  style={
                    styles.addDescription
                  }
                >
                  Укажите данные новой
                  единицы техники
                </Text>
              </View>

              <Text
                style={
                  styles.addArrow
                }
              >
                ›
              </Text>
            </Pressable>
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

    list: {
      gap: 32,
    },

    error: {
      padding: 12,
      marginBottom: 16,
      borderWidth: 1,
      borderColor:
        'rgba(198,93,46,0.28)',
      borderRadius: 8,
      backgroundColor:
        'rgba(198,93,46,0.10)',
    },

    errorText: {
      color: '#8a2f22',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 13,
    },

    addTile: {
      minHeight: 116,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      gap: 14,
      borderRadius: 12,
      backgroundColor: '#ffffff',
    },

    plusCircle: {
      width: 42,
      height: 42,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 21,
      backgroundColor: '#191919',
    },

    plus: {
      color: '#ffffff',
      fontSize: 26,
      lineHeight: 28,
    },

    addText: {
      flex: 1,
      gap: 3,
    },

    addTitle: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 17,
      lineHeight: 22,
    },

    addDescription: {
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 13,
      lineHeight: 18,
    },

    addArrow: {
      color: '#737373',
      fontSize: 30,
    },
  });