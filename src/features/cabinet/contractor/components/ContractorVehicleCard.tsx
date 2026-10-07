import { Image } from 'expo-image';

import {
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
  getVehiclePropertyLabel,
  type ContractorVehicle,
} from '../model/contractor.types';

interface Props {
  vehicle: ContractorVehicle;
  typeLabel: string;
  showTitle?: boolean;
  deleting?: boolean;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

export function ContractorVehicleCard({
  vehicle,
  typeLabel,
  showTitle = false,
  deleting = false,
  onEdit,
  onDelete,
}: Props) {
  const [
    confirmationVisible,
    setConfirmationVisible,
  ] = useState(false);

  const properties =
    getVehiclePropertyEntries(
      vehicle.properties
    );

  const summary =
    properties[0];

  async function handleDelete() {
    await onDelete();
    setConfirmationVisible(
      false
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

      {showTitle ? (
        <Text
          style={styles.mobileTitle}
        >
          Моя техника
        </Text>
      ) : null}

      <View style={styles.header}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>
            ▣
          </Text>
        </View>

        <View style={styles.heading}>
          <Text style={styles.model}>
            {vehicle.model}
          </Text>

          <Text style={styles.summary}>
            {typeLabel}
            {summary
              ? ` · ${formatVehiclePropertyValue(
                  summary[0],
                  summary[1]
                )}`
              : ''}
          </Text>
        </View>
      </View>

      <View style={styles.separator} />

      <View style={styles.properties}>
        {properties.map(
          ([name, value]) => (
            <View
              key={name}
              style={styles.property}
            >
              <Text
                style={
                  styles.propertyLabel
                }
              >
                {getVehiclePropertyLabel(
                  name
                )}
              </Text>

              <Text
                style={
                  styles.propertyValue
                }
              >
                {formatVehiclePropertyValue(
                  name,
                  value
                )}
              </Text>
            </View>
          )
        )}

        <View style={styles.property}>
          <Text
            style={styles.propertyLabel}
          >
            Гос. номер
          </Text>

          <View
            style={styles.plateBox}
          >
            <Text style={styles.plate}>
              {vehicle.license_plate}
            </Text>
          </View>
        </View>
      </View>

      {confirmationVisible ? (
        <View
          style={
            styles.deleteConfirmation
          }
        >
          <Text
            style={
              styles.deleteWarning
            }
          >
            Удалить технику? Это
            действие нельзя отменить.
          </Text>

          <View
            style={
              styles.deleteActions
            }
          >
            <Pressable
              disabled={deleting}
              onPress={() =>
                void handleDelete()
              }
              style={[
                styles.deleteButton,
                deleting &&
                  styles.disabled,
              ]}
            >
              <Text
                style={
                  styles.deleteButtonText
                }
              >
                {deleting
                  ? 'Удаляем…'
                  : 'Да, удалить'}
              </Text>
            </Pressable>

            <Pressable
              disabled={deleting}
              onPress={() =>
                setConfirmationVisible(
                  false
                )
              }
              style={
                styles.outlineButton
              }
            >
              <Text
                style={
                  styles.outlineButtonText
                }
              >
                Отмена
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <View style={styles.actions}>
          <Pressable
            onPress={onEdit}
            style={styles.outlineButton}
          >
            <Text
              style={
                styles.outlineButtonText
              }
            >
              Изменить
            </Text>
          </Pressable>

          <Pressable
            onPress={() =>
              setConfirmationVisible(
                true
              )
            }
            style={
              styles.dangerOutlineButton
            }
          >
            <Text
              style={
                styles.dangerOutlineText
              }
            >
              Удалить
            </Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}

const styles =
  StyleSheet.create({
    card: {
      position: 'relative',
      padding: 24,
      borderRadius: 12,
      overflow: 'hidden',
      gap: 24,
      backgroundColor: '#ffffff',
    },

    stripe: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      height: 4,
    },

    mobileTitle: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 20,
      lineHeight: 24,
    },

    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
    },

    icon: {
      width: 40,
      height: 40,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f1f1f1',
    },

    iconText: {
      color: '#191919',
      fontSize: 20,
    },

    heading: {
      flex: 1,
      gap: 2,
    },

    model: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 20,
      lineHeight: 24,
    },

    summary: {
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 18,
    },

    separator: {
      height: 1,
      backgroundColor: '#c5c4bc',
    },

    properties: {
      gap: 0,
    },

    property: {
      minHeight: 38,
      paddingVertical: 10,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',
      gap: 16,
    },

    propertyLabel: {
      flex: 1,
      color: '#737373',
      fontFamily:
        'Roboto_400Regular',
      fontSize: 14,
      lineHeight: 18,
    },

    propertyValue: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
      lineHeight: 18,
      textAlign: 'right',
    },

    plateBox: {
      paddingVertical: 6,
      paddingHorizontal: 12,
      backgroundColor: '#f1f1f1',
    },

    plate: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 18,
      lineHeight: 24,
    },

    actions: {
      paddingTop: 16,
      flexDirection: 'row',
      gap: 8,
    },

    outlineButton: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#c5c4bc',
      borderRadius: 8,
    },

    outlineButtonText: {
      color: '#191919',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 12,
    },

    dangerOutlineButton: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: '#d83b2f',
      borderRadius: 8,
    },

    dangerOutlineText: {
      color: '#d83b2f',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 12,
    },

    deleteConfirmation: {
      padding: 14,
      borderWidth: 1,
      borderColor:
        'rgba(198,93,46,0.35)',
      borderRadius: 10,
      backgroundColor:
        'rgba(198,93,46,0.10)',
    },

    deleteWarning: {
      color: '#7a3a1b',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 13,
      lineHeight: 18,
    },

    deleteActions: {
      marginTop: 12,
      flexDirection: 'row',
      gap: 8,
    },

    deleteButton: {
      flex: 1,
      minHeight: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      backgroundColor: '#d83b2f',
    },

    deleteButtonText: {
      color: '#ffffff',
      fontFamily:
        'Roboto_500Medium',
      fontSize: 12,
    },

    disabled: {
      opacity: 0.55,
    },
  });