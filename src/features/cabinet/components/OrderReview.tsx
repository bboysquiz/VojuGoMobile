import { StyleSheet, Text, View } from 'react-native';
import { CollapsibleText } from './CollapsibleText';
import { RatingStars } from './RatingStars';

export function OrderReview({ name, rating, comment }: { name: string; rating?: number | null; comment?: string | null }) {
  const text = comment?.trim();
  if (rating == null && !text) return null;
  const initials = name.trim().split(/\s+/).slice(0, 2).map(part => part[0]?.toUpperCase()).join('');
  return <View style={styles.review}>
    <View style={styles.header}>
      <View style={styles.person}>
        <View style={styles.avatar}><Text style={styles.initials}>{initials}</Text></View>
        <Text style={styles.name}>{name}</Text>
      </View>
      {rating != null ? <RatingStars rating={rating} /> : null}
    </View>
    {text ? <CollapsibleText text={text} /> : null}
  </View>;
}

const styles = StyleSheet.create({
  review: { padding: 16, borderWidth: 1, borderColor: '#c5c4bc', borderRadius: 12, gap: 16 },
  header: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  person: { flexDirection: 'row', flexShrink: 1, alignItems: 'center', gap: 8 },
  avatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: '#e6ecf7', alignItems: 'center', justifyContent: 'center' },
  initials: { color: '#3363bf', fontFamily: 'Roboto_500Medium', fontSize: 12 },
  name: { flexShrink: 1, color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18 },
});
