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
  useRouter,
} from 'expo-router';

import {
  createContractorVehicle,
  getVehicleTypes,
} from '../../../../features/cabinet/contractor/api/contractor.api';

import {
  ContractorVehicleForm,
} from '../../../../features/cabinet/contractor/components/ContractorVehicleForm';

import {
  ContractorPageHeader,
} from '../../../../features/cabinet/contractor/components/ContractorUi';

import type {
  ContractorVehicle,
  ContractorVehicleFormValue,
  CreateContractorVehicleRequest,
  VehicleProperties,
  VehicleTypeOption,
} from '../../../../features/cabinet/contractor/model/contractor.types';

export default function ContractorNewVehiclePage() {
  const router = useRouter();

  const [
    vehicleTypes,
    setVehicleTypes,
  ] = useState<
    VehicleTypeOption[]
  >([]);

  const [
    loadingTypes,
    setLoadingTypes,
  ] = useState(true);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState('');

  const [
    createdVehicle,
    setCreatedVehicle,
  ] = useState<
    ContractorVehicle | null
  >(null);

  async function loadTypes() {
    try {
      const types =
        await getVehicleTypes();

      setVehicleTypes(types);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Не удалось загрузить типы техники'
      );
    } finally {
      setLoadingTypes(false);
    }
  }

  useEffect(() => {
    void loadTypes();
  }, []);

  async function handleSubmit(
    form: ContractorVehicleFormValue
  ) {
    if (
      submitting ||
      !form.properties.type
    ) {
      return;
    }

    setSubmitting(true);
    setError('');
    setCreatedVehicle(null);

    const payload: CreateContractorVehicleRequest =
      {
        model: form.model.trim(),
        license_plate:
          form.license_plate.trim(),
        properties:
          form.properties as VehicleProperties,
      };

    try {
      const vehicle =
        await createContractorVehicle(
          payload
        );

      setCreatedVehicle(
        vehicle
      );
    } catch (caught) {
      setError(
        caught instanceof Error
          ? caught.message
          : 'Не удалось добавить технику'
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
        title="Добавить технику"
        subtitle="Укажите данные техники — она появится в разделе «Моя техника»"
      />

      {createdVehicle ? (
        <View
          style={styles.success}
        >
          <Text
            style={
              styles.successTitle
            }
          >
            Техника добавлена
          </Text>

          <Text
            style={
              styles.successText
            }
          >
            {createdVehicle.model}
            {' · '}
            {
              createdVehicle.license_plate
            }
          </Text>
        </View>
      ) : null}

      <View style={styles.panel}>
        <Text
          style={styles.panelTitle}
        >
          Данные техники
        </Text>

        <ContractorVehicleForm
          vehicleTypes={vehicleTypes}
          loadingTypes={
            loadingTypes
          }
          submitting={submitting}
          errorMessage={error}
          onSubmit={(form) =>
            void handleSubmit(form)
          }
          onCancel={() =>
            router.push(
              '/cabinet/contractor/vehicles'
            )
          }
        />
      </View>
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

    success: {
      marginBottom: 16,
      padding: 16,
      borderWidth: 1,
      borderColor:
        'rgba(61,139,95,0.30)',
      borderRadius: 12,
      backgroundColor: '#dceee2',
    },

    successTitle: {
      color: '#1f5c3a',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 15,
    },

    successText: {
      marginTop: 3,
      color: '#356d4f',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 13,
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