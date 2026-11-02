import { useState } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type TextStyle } from 'react-native';

interface Props {
  text: string;
  expandLabel?: string;
  style?: StyleProp<TextStyle>;
}

export function CollapsibleText({ text, expandLabel = 'Показать полностью', style }: Props) {
  const [expanded, setExpanded] = useState(false);
  const canExpand = text.length > 120;
  return <View>
    <Text style={[styles.text, style]} numberOfLines={canExpand && !expanded ? 3 : undefined}>{text}</Text>
    {canExpand ? <Pressable accessibilityRole="button" accessibilityState={{ expanded }} onPress={() => setExpanded(value => !value)} style={styles.toggle}>
      <Text style={styles.toggleText}>{expanded ? 'Скрыть' : expandLabel}</Text>
    </Pressable> : null}
  </View>;
}

const styles = StyleSheet.create({
  text: { color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 20 },
  toggle: { minHeight: 44, justifyContent: 'center', alignSelf: 'flex-start' },
  toggleText: { color: '#737373', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18 },
});
