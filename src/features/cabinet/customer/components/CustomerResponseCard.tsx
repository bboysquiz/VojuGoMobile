import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  getVehicleTypeLabel,
  type CustomerOrderResponse,
} from '../model/customer.types';

interface Props {
  response: CustomerOrderResponse;
  isChoosing?: boolean;
  showChoose?: boolean;
  children?: ReactNode;
  onChoose?: (responseId: string) => void;
}

function getInitials(value: string): string {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function CustomerResponseCard({
  response,
  isChoosing = false,
  showChoose = true,
  children,
  onChoose,
}: Props) {
  const [expanded, setExpanded] = useState(!showChoose);

  useEffect(() => {
    setExpanded(!showChoose);
  }, [response.id, showChoose]);

  const name =
    response.contractor_company_name ||
    response.contractor_name ||
    'Исполнитель';

  const vehicleName = useMemo(() => {
    if (!response.vehicle) {
      return '';
    }

    return [response.vehicle.model, response.vehicle.license_plate]
      .filter(Boolean)
      .join(' · ');
  }, [response.vehicle]);

  async function call() {
    const phone = response.contractor_phone;

    if (!phone) {
      return;
    }

    await Linking.openURL('tel:' + phone.replace(/[^\d+]/g, ''));
  }

  return (
    <View style={[styles.card, !showChoose && styles.selectedCard]}>
      <Pressable
        disabled={!showChoose}
        onPress={() => setExpanded((current) => !current)}
        style={styles.person}
      >
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>

        <View style={styles.personContent}>
          <Text style={styles.name} numberOfLines={2}>
            {name}
          </Text>

          {response.contractor_rating ? (
            <View style={styles.rating}>
              <Text style={styles.ratingStar}>★</Text>
              <Text style={styles.ratingText}>
                {response.contractor_rating.average_rating.toFixed(1)}
              </Text>
            </View>
          ) : null}
        </View>

        {showChoose ? (
          <Text style={[styles.chevron, expanded && styles.chevronExpanded]}>
            ›
          </Text>
        ) : null}
      </Pressable>

      {expanded ? (
        <>
          <View style={styles.details}>
            {response.vehicle ? (
              <View>
                <Text style={styles.vehicleType}>
                  {getVehicleTypeLabel(response.vehicle.properties.type)}
                </Text>
                {vehicleName ? <Text style={styles.vehicle}>{vehicleName}</Text> : null}
              </View>
            ) : null}

            {response.contractor_phone ? (
              <Pressable onPress={() => void call()} style={styles.phoneRow}>
                <Text style={styles.phoneIcon}>☎</Text>
                <Text style={styles.phone}>{response.contractor_phone}</Text>
              </Pressable>
            ) : null}
          </View>

          {showChoose ? (
            <Pressable
              disabled={isChoosing}
              onPress={() => onChoose?.(response.id)}
              style={[styles.chooseButton, isChoosing && styles.disabled]}
            >
              <Text style={styles.chooseButtonText}>
                {isChoosing ? 'Выбираем…' : 'Выбрать исполнителя'}
              </Text>
            </Pressable>
          ) : null}

          {children}
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    padding: 16,
    borderWidth: 1,
    borderColor: '#c5c4bc',
    borderRadius: 12,
    gap: 20,
    backgroundColor: '#ffffff',
  },
  selectedCard: {
    gap: 20,
  },
  person: {
    minHeight: 38,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 38,
    height: 38,
    flexShrink: 0,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 19,
    backgroundColor: '#ebebeb',
  },
  avatarText: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
  },
  personContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  name: {
    flex: 1,
    color: '#191919',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  rating: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  ratingStar: {
    color: '#191919',
    fontSize: 17,
  },
  ratingText: {
    color: '#191919',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
  },
  chevron: {
    width: 24,
    color: '#737373',
    fontSize: 28,
    lineHeight: 28,
    textAlign: 'center',
    transform: [{ rotate: '90deg' }],
  },
  chevronExpanded: {
    transform: [{ rotate: '-90deg' }],
  },
  details: {
    gap: 20,
  },
  vehicleType: {
    color: '#737373',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  vehicle: {
    marginTop: 2,
    color: '#737373',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  phoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  phoneIcon: {
    color: '#191919',
    fontSize: 15,
  },
  phone: {
    color: '#191919',
    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,
  },
  chooseButton: {
    width: '100%',
    minHeight: 56,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: '#191919',
  },
  chooseButtonText: {
    color: '#ffffff',
    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,
  },
  disabled: {
    opacity: 0.55,
  },
});
