import { StyleSheet, Text, View } from 'react-native';

export type OrderStatusTone = 'blue' | 'yellow' | 'green' | 'gray' | 'rust' | 'neutral';

const colors = {
  blue: { backgroundColor: '#e6ecf7', color: '#3363bf' },
  yellow: { backgroundColor: '#ffeeb7', color: '#cd5500' },
  green: { backgroundColor: '#c9fae3', color: '#02a156' },
  gray: { backgroundColor: '#f3f3f3', color: '#808080' },
  rust: { backgroundColor: '#ffe0dc', color: '#d83b2f' },
  neutral: { backgroundColor: '#eef0f5', color: '#191919' },
};

export function OrderStatusBadge({ label, tone, compact = false }: { label: string; tone: OrderStatusTone; compact?: boolean }) {
  return <View style={[styles.badge, compact && styles.compactBadge, { backgroundColor: colors[tone].backgroundColor }]}>
    <Text style={[styles.text, compact && styles.compactText, { color: colors[tone].color }]}>{label}</Text>
  </View>;
}

const styles = StyleSheet.create({
  badge: { alignSelf: 'flex-start', maxWidth: '100%', paddingVertical: 4, paddingHorizontal: 8, borderRadius: 12 },
  text: { fontFamily: 'Roboto_500Medium', fontSize: 14, lineHeight: 18 },
  compactBadge: { paddingVertical: 3 },
  compactText: { fontSize: 10, lineHeight: 12, includeFontPadding: false },
});
