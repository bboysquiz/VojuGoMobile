import { Image } from 'expo-image';
import { useState } from 'react';
import { StyleSheet, Text, useWindowDimensions, View } from 'react-native';

import { formatOrderDate, type OrderCardData } from '../model/order-card';
import { formatVehiclePropertyValue, getVehiclePropertyEntries, getVehiclePropertyLabel, getVehicleTypeLabel } from '../model/vehicle';

interface Props {
  order: Pick<OrderCardData, 'needed_at' | 'vehicle_properties' | 'price' | 'price_unit'>;
  equipmentTypeLabel?: string;
  priceCaption?: string;
  relativeDate?: boolean;
}

export function OrderCardHeader({ order, equipmentTypeLabel, priceCaption, relativeDate = false }: Props) {
  const [width, setWidth] = useState(0);
  const { fontScale } = useWindowDimensions();
  const price = `${new Intl.NumberFormat('ru-RU').format(order.price)} ₽`;
  // Reserve enough space for the full price when a narrow card or larger text needs it.
  const stackPrice = width > 0 && price.length * 11 * fontScale > (width - 32) * 0.45;
  const properties = getVehiclePropertyEntries(order.vehicle_properties);
  return (
    <View>
      <View style={styles.stripe} pointerEvents="none">
        <Image source={require('../../../../assets/landing/hazard-stripe.svg')} style={styles.stripeImage} contentFit="fill" accessible={false} />
      </View>
      <View style={styles.header} onLayout={event => setWidth(event.nativeEvent.layout.width)}>
        <View style={[styles.summary, stackPrice && styles.summaryStacked]}>
          <View style={[styles.info, stackPrice && styles.infoStacked]}>
            <View style={styles.line}>
              <Image source={require('../../../../assets/cabinet/date.svg')} style={styles.icon} contentFit="contain" accessible={false} />
              <Text style={styles.text}>{formatOrderDate(order.needed_at, true, relativeDate)}</Text>
            </View>
            <View style={styles.line}>
              <Image source={require('../../../../assets/cabinet/item.svg')} style={styles.icon} contentFit="contain" accessible={false} />
              <Text style={styles.text}>{equipmentTypeLabel ?? getVehicleTypeLabel(order.vehicle_properties.type)}</Text>
            </View>
          </View>
          <View style={[styles.priceBox, stackPrice && styles.priceStacked]}>
            <Text style={styles.price} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.6}>
              {price}
            </Text>
            <Text style={styles.priceCaption}>
              {priceCaption ?? (order.price_unit === 'per_hour' ? 'ваша цена, за час' : 'ваша цена, за заказ')}
            </Text>
          </View>
        </View>
        {properties.length > 0 ? <View style={styles.properties}>
          {properties.map(([name, value]) => <Text key={name} style={styles.property}>
            {getVehiclePropertyLabel(name)}: {formatVehiclePropertyValue(name, value)}
          </Text>)}
        </View> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  stripe: { position: 'absolute', zIndex: 2, top: 0, right: 0, left: 0, height: 4, overflow: 'hidden' },
  stripeImage: { width: 1600, height: 8 },
  header: { padding: 16, backgroundColor: '#f3f3f3' },
  summary: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 },
  summaryStacked: { flexDirection: 'column', gap: 8 },
  info: { flex: 1, minWidth: 0, gap: 4 },
  infoStacked: { flex: 0, width: '100%' },
  line: { flexDirection: 'row', alignItems: 'flex-start', gap: 6 },
  icon: { width: 16, height: 16, marginTop: 1, flexShrink: 0 },
  text: { flex: 1, minWidth: 0, color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18, includeFontPadding: false },
  properties: { marginTop: 6 },
  property: { color: '#737373', fontFamily: 'Roboto_400Regular', fontSize: 12, lineHeight: 16, includeFontPadding: false },
  priceBox: { maxWidth: '45%', minWidth: 0, flexShrink: 1, alignItems: 'flex-end' },
  priceStacked: { maxWidth: '100%', alignSelf: 'flex-end' },
  price: { color: '#191919', fontFamily: 'Roboto_500Medium', fontSize: 20, lineHeight: 24, textAlign: 'right', includeFontPadding: false },
  priceCaption: { marginTop: 1, maxWidth: 140, color: '#737373', fontFamily: 'Roboto_400Regular', fontSize: 10, lineHeight: 12, textAlign: 'right', includeFontPadding: false },
});
