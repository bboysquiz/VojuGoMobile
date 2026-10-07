import {
  useEffect,
  useState,
} from 'react';

import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  getContractorVehicle,
  getVehicleTypes,
  updateContractorVehicle,
} from '../../../../../features/cabinet/contractor/api/contractor.api';

import {
  ContractorVehicleForm,
} from '../../../../../features/cabinet/contractor/components/ContractorVehicleForm';

import {
  ContractorPageHeader,
  ContractorStateCard,
} from '../../../../../features/cabinet/contractor/components/ContractorUi';

import type {
  ContractorVehicleFormValue,
  CreateContractorVehicleRequest,
  VehicleProperties,
  VehicleTypeOption,
} from '../../../../../features/cabinet/contractor/model/contractor.types';

export default function ContractorEditVehiclePage() {
  const router = useRouter();

  const params =
    useLocalSearchParams<{
      vehicleId?:
        | string
        | string[];
    }>();

  const vehicleId =
    Array.isArray(
      params.vehicleId
    )
      ? params.vehicleId[0] ??
        ''
      : params.vehicleId ?? '';

  const [
    initialForm,
    setInitialForm,
  ] = useState<
    ContractorVehicleFormValue | undefined
  >(undefined);

  const [
    vehicleTypes,
    setVehicleTypes,
  ] = useState<
    VehicleTypeOption[]
  >([]);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    loadError,
    setLoadError,
  ] = useState('');

  const [
    submitError,
    setSubmitError,
  ] = useState('');

  async function loadVehicle() {
    setLoading(true);
    setLoadError('');
    setSubmitError('');

    if (!vehicleId) {
      setLoadError(
        'Не указана техника для редактирования'
      );
      setLoading(false);
      return;
    }

    try {
      const [
        vehicle,
        types,
      ] = await Promise.all([
        getContractorVehicle(
          vehicleId
        ),
        getVehicleTypes(),
      ]);

      setInitialForm({
        model: vehicle.model,
        license_plate:
          vehicle.license_plate,
        properties: {
          ...vehicle.properties,
        },
      });

      setVehicleTypes(types);
    } catch (caught) {
      setLoadError(
        caught instanceof Error
          ? caught.message
          : 'Не удалось загрузить технику'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadVehicle();
  }, [vehicleId]);

  async function handleSubmit(
    form: ContractorVehicleFormValue
  ) {
    if (
      submitting ||
      !vehicleId ||
      !form.properties.type
    ) {
      return;
    }

    setSubmitting(true);
    setSubmitError('');

    const payload: CreateContractorVehicleRequest =
      {
        model: form.model.trim(),
        license_plate:
          form.license_plate.trim(),
        properties:
          form.properties as VehicleProperties,
      };

    try {
      await updateContractorVehicle(
        vehicleId,
        payload
      );

      router.push(
        '/cabinet/contractor/vehicles'
      );
    } catch (caught) {
      setSubmitError(
        caught instanceof Error
          ? caught.message
          : 'Не удалось сохранить технику'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      style={styles.screen}
      contentContainerStyle={
        styles.content
      }
    >
      <ContractorPageHeader
        title="Редактирование техники"
        subtitle="Измените тип, модель или госномер техники"
      />

      {loading ? (
        <ContractorStateCard
          message="Загружаем технику…"
        />
      ) : loadError ? (
        <ContractorStateCard
          error
          message={loadError}
          onRetry={() =>
            void loadVehicle()
          }
        />
      ) : initialForm ? (
        <View style={styles.panel}>
          <Text
            style={
              styles.panelTitle
            }
          >
            Данные техники
          </Text>

          <ContractorVehicleForm
            key={vehicleId}
            initialValue={
              initialForm
            }
            vehicleTypes={
              vehicleTypes
            }
            submitting={
              submitting
            }
            errorMessage={
              submitError
            }
            submitLabel="Сохранить изменения"
            submittingLabel="Сохраняем…"
            onSubmit={(form) =>
              void handleSubmit(
                form
              )
            }
            onCancel={() =>
              router.push(
                '/cabinet/contractor/vehicles'
              )
            }
          />
        </View>
      ) : null}
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
      paddingBottom: 40,
    },

    panel: {
      padding: 20,
      borderRadius: 12,
      backgroundColor: '#ffffff',
    },

    panelTitle: {
      marginBottom: 20,
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 18,
      lineHeight: 22,
    },
  });