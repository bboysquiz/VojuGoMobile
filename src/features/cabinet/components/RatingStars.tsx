import { Image } from 'expo-image';
import { StyleSheet, View } from 'react-native';

export function RatingStars({ rating }: { rating: number }) {
  const rounded = Math.min(5, Math.max(0, Math.round(rating)));
  return <View accessibilityLabel={'Оценка ' + rating + ' из 5'} style={styles.row}>
    {[1, 2, 3, 4, 5].map(star => <Image key={star}
      source={star <= rounded ? require('../../../../assets/cabinet/review-rating.svg') : require('../../../../assets/cabinet/review-rating-empty.svg')}
      style={styles.star} contentFit="contain" accessible={false} />)}
  </View>;
}

const styles = StyleSheet.create({ row: { flexDirection: 'row', flexShrink: 0 }, star: { width: 24, height: 24 } });
