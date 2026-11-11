import { Image } from 'expo-image';
import { type Href, usePathname, useRouter } from 'expo-router';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Role = 'customer' | 'contractor';
type Tab = { label: string; path: Href; icon: number; activeIcon?: number };
const icons = {
  list: require('../../../../assets/navigation/nav-list.svg'),
  listActive: require('../../../../assets/navigation/nav-list-active.svg'),
  chat: require('../../../../assets/navigation/nav-chat.svg'),
  clock: require('../../../../assets/navigation/nav-clock.svg'),
  person: require('../../../../assets/navigation/nav-person.svg'),
};
const customerTabs: Tab[] = [
  {
    label: 'Заявки',
    path: '/cabinet/customer/orders',
    icon: icons.list,
    activeIcon: icons.listActive,
  },
  { label: 'История', path: '/cabinet/customer/history', icon: icons.clock },
  { label: 'Профиль', path: '/cabinet/customer/profile', icon: icons.person },
];
const contractorTabs: Tab[] = [
  {
    label: 'Заявки',
    path: '/cabinet/contractor',
    icon: icons.list,
    activeIcon: icons.listActive,
  },
  { label: 'Отклики', path: '/cabinet/contractor/responses', icon: icons.chat },
  { label: 'История', path: '/cabinet/contractor/history', icon: icons.clock },
  { label: 'Профиль', path: '/cabinet/contractor/profile', icon: icons.person },
];
function isActive(pathname: string, tab: Tab, role: Role) {
  if (tab.path === '/cabinet/contractor') return pathname === tab.path;
  if (
    tab.path === '/cabinet/customer/orders' &&
    pathname === '/cabinet/customer/new'
  )
    return true;
  if (
    role === 'contractor' &&
    tab.path === '/cabinet/contractor/profile' &&
    pathname.startsWith('/cabinet/contractor/vehicles')
  )
    return true;
  return pathname === tab.path || pathname.startsWith(`${tab.path}/`);
}
export function CabinetBottomNavigation({ role }: { role: Role }) {
  const pathname = usePathname();
  const router = useRouter();
  const tabs = role === 'customer' ? customerTabs : contractorTabs;
  return (
    <SafeAreaView edges={['bottom']} style={styles.bar}>
      <View
        accessibilityRole="tablist"
        accessibilityLabel="Основная навигация"
        style={styles.items}
      >
        {tabs.map((tab) => {
          const active = isActive(pathname, tab, role);
          return (
            <Pressable
              key={String(tab.path)}
              accessibilityRole="tab"
              accessibilityLabel={tab.label}
              accessibilityState={{ selected: active }}
              aria-selected={active}
              onPress={() => {
                if (pathname !== tab.path) router.navigate(tab.path);
              }}
              style={[
                styles.item,
                Platform.OS === 'android' && styles.itemAndroid,
              ]}
            >
              {({ pressed }) => (
                <>
                  <View
                    style={[
                      styles.indicator,
                      pressed &&
                        Platform.OS === 'android' &&
                        styles.indicatorPressed,
                    ]}
                  >
                    <Image
                      source={
                        active && tab.activeIcon ? tab.activeIcon : tab.icon
                      }
                      style={styles.icon}
                      tintColor={active ? '#191919' : '#808080'}
                      contentFit="contain"
                      accessible={false}
                    />
                  </View>
                  <Text
                    numberOfLines={1}
                    style={[styles.label, active && styles.labelActive]}
                  >
                    {tab.label}
                  </Text>
                </>
              )}
            </Pressable>
          );
        })}
      </View>
    </SafeAreaView>
  );
}
export function CustomerCreateButton() {
  const router = useRouter();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Новая заявка"
      onPress={() => router.navigate('/cabinet/customer/new')}
      style={({ pressed }) => [
        styles.create,
        Platform.OS === 'android' && styles.createAndroid,
        pressed && styles.createPressed,
      ]}
    >
      <Image
        source={
          Platform.OS === 'android'
            ? require('../../../../assets/navigation/nav-plus-android.svg')
            : require('../../../../assets/navigation/nav-plus-ios.svg')
        }
        style={styles.icon}
        contentFit="contain"
        accessible={false}
      />
    </Pressable>
  );
}
const styles = StyleSheet.create({
  bar: {
    flexShrink: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#c5c4bc',
  },
  items: { flexDirection: 'row' },
  item: {
    flex: 1,
    minWidth: 0,
    height: 56,
    paddingVertical: 4,
    alignItems: 'center',
  },
  itemAndroid: { height: 64, paddingTop: 8, paddingBottom: 4, gap: 4 },
  indicator: {
    width: 56,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  icon: { width: 24, height: 24 },
  label: {
    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,
    color: '#808080',
    textAlign: 'center',
    includeFontPadding: false,
  },
  labelActive: { color: '#191919' },
  indicatorPressed: { backgroundColor: '#ebebeb' },
  createPressed: { backgroundColor: '#262626' },
  create: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createAndroid: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: '#ffdc3c',
    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.15)',
  },
});
