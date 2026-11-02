import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatOrderDate, type OrderCardData } from '../model/order-card';
import { CollapsibleText } from './CollapsibleText';
import { OrderCardHeader } from './OrderCardHeader';

interface Props {
  order: OrderCardData;
  status?: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  equipmentTypeLabel?: string;
  priceCaption?: string;
  relativeDate?: boolean;
  showComment?: boolean;
  metadata?: string;
  metadataPosition?: 'before-content' | 'after-content';
}

export function OrderCard({ order, status, children, actions, equipmentTypeLabel, priceCaption, relativeDate,
  showComment = true, metadata, metadataPosition = 'before-content' }: Props) {
  const comment = order.comment?.trim();
  const meta = <Text style={styles.meta}>{metadata ?? `Опубликовано ${formatOrderDate(order.created_at)} · №${order.id}`}</Text>;
  return <View style={styles.card}>
    <OrderCardHeader order={order} equipmentTypeLabel={equipmentTypeLabel} priceCaption={priceCaption} relativeDate={relativeDate} />
    <View style={styles.body}>
      <View style={styles.identity}>
        <Text style={styles.title}>{order.title}</Text>
        <Text style={styles.address}>{order.address}</Text>
        {status}
      </View>
      {showComment ? comment ? <CollapsibleText text={comment} expandLabel="Показать описание" />
        : <Text style={styles.muted}>Комментарий к заявке не указан</Text> : null}
      {metadataPosition === 'before-content' ? meta : null}
      {children}
      {metadataPosition === 'after-content' ? meta : null}
    </View>
    {actions ? <View style={styles.actions}>{actions}</View> : null}
  </View>;
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderColor: '#c5c4bc', borderRadius: 12, overflow: 'hidden', backgroundColor: '#ffffff' },
  body: { padding: 16, gap: 16 },
  identity: { gap: 4, minWidth: 0 },
  title: { color: '#191919', fontFamily: 'Roboto_500Medium', fontSize: 20, lineHeight: 24 },
  address: { color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18 },
  muted: { color: '#808080', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18 },
  meta: { color: '#737373', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18 },
  actions: { paddingHorizontal: 16, paddingBottom: 16, gap: 8 },
});
