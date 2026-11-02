import { Children, useState, type ReactNode } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

interface Props {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  minColumnWidth?: number;
  gap?: number;
  maxColumns?: number;
}

export function ResponsiveGrid({ children, style, minColumnWidth = 280, gap = 16, maxColumns = 2 }: Props) {
  const [width, setWidth] = useState(0);
  const columns = Math.max(1, Math.min(maxColumns, Math.floor((width + gap) / (minColumnWidth + gap))));

  return (
    <View style={[styles.grid, { gap }, style]} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
      {Children.toArray(children).map((child, index) => (
        <View key={(typeof child === 'object' && 'key' in child ? child.key : null) ?? index}
          style={{ width: columns > 1 ? (width - gap * (columns - 1)) / columns : '100%', minWidth: 0 }}>
          {child}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { width: '100%', flexDirection: 'row', flexWrap: 'wrap', alignItems: 'flex-start' },
});
