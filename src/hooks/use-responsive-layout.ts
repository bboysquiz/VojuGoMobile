import { useWindowDimensions } from 'react-native';

export function useResponsiveLayout() {
  const { width, height } = useWindowDimensions();

  return {
    // Keep narrow portrait phones in one column when the keyboard reduces height.
    isLandscape: width >= 600 && width > height,
  };
}
