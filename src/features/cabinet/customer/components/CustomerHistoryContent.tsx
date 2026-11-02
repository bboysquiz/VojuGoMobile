import { useState } from 'react';
import { FlatList, StyleSheet, Text, View } from 'react-native';

import type { CustomerHistory, CustomerHistoryOrder } from '../model/customer.types';
import { customerPageStyles } from './CustomerFormControls';
import { CustomerHistoryCard } from './CustomerHistoryCard';
import { CustomerTabs } from './CustomerUi';

function plural(count: number, words: [string, string, string]) {
  const mod100 = count % 100;
  const mod10 = count % 10;
  return words[mod100 >= 11 && mod100 <= 14 ? 2 : mod10 === 1 ? 0 : mod10 >= 2 && mod10 <= 4 ? 1 : 2];
}

export function CustomerHistoryContent({ history, refreshing = false, onRefresh, onReview }: {
  history: CustomerHistory; refreshing?: boolean; onRefresh?: () => void; onReview: (order: CustomerHistoryOrder) => void;
}) {
  const [tab, setTab] = useState<'completed' | 'cancelled'>('completed');
  const { completed_orders: completed, ratings_count: ratings } = history.summary;
  return (
    <FlatList style={customerPageStyles.screen} contentContainerStyle={styles.content} data={tab === 'completed' ? history.completed_orders : history.cancelled_orders}
      keyExtractor={(order) => order.id} renderItem={({ item }) => <CustomerHistoryCard order={item} onReview={onReview} />}
      refreshing={refreshing} onRefresh={onRefresh} ItemSeparatorComponent={Separator}
      ListHeaderComponent={<View style={styles.header}>
        <View><Text style={customerPageStyles.title}>История и оценки</Text><Text style={customerPageStyles.subtitle}>{completed} {plural(completed, ['заказ состоялся', 'заказа состоялось', 'заказов состоялось'])} · вы поставили {ratings} {plural(ratings, ['оценку', 'оценки', 'оценок'])} исполнителям</Text></View>
        <CustomerTabs variant="text" value={tab} onChange={setTab} items={[
          { value: 'completed', label: 'Завершённые заявки', count: history.completed_orders.length },
          { value: 'cancelled', label: 'Отменённые заявки', count: history.cancelled_orders.length },
        ]} />
      </View>}
      ListEmptyComponent={<Text style={styles.empty}>В этом разделе пока нет заявок.</Text>} />
  );
}
function Separator() { return <View style={styles.separator} />; }
const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  header: { gap: 16, marginBottom: 16 },
  separator: { height: 16 },
  empty: { paddingVertical: 40, textAlign: 'center', color: '#808080', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 20 },
});
