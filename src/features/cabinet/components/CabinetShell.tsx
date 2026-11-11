import { Image } from 'expo-image';
import { usePathname, useRouter } from 'expo-router';
import { type ReactNode, useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useResponsiveLayout } from '../../../hooks/use-responsive-layout';
import { getSelf } from '../../auth/api/auth.api';
import {
  CabinetBottomNavigation,
  CustomerCreateButton,
} from './CabinetBottomNavigation';

type Role = 'customer' | 'contractor';

export function CabinetShell({
  role,
  children,
}: {
  role: Role;
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLandscape } = useResponsiveLayout();

  useEffect(() => {
    let cancelled = false;
    async function checkAccess() {
      try {
        const user = await getSelf();
        if (!cancelled && !user.roles.includes(role)) router.replace('/');
      } catch {
        if (!cancelled) router.replace('/');
      }
    }
    void checkAccess();
    return () => {
      cancelled = true;
    };
  }, [role, router]);

  const showCreate =
    role === 'customer' && pathname === '/cabinet/customer/orders';

  return (
    <SafeAreaView edges={['top', 'left', 'right']} style={styles.frame}>
      <View style={[styles.header, isLandscape && styles.headerLandscape]}>
        <Image
          source={require('../../../../assets/landing/logo_mobile.svg')}
          style={styles.logo}
          contentFit="contain"
        />
      </View>
      <View style={styles.content}>
        {children}
        {showCreate ? <CustomerCreateButton /> : null}
      </View>
      <CabinetBottomNavigation role={role} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  frame: { flex: 1, backgroundColor: '#ffffff' },
  header: {
    height: 64,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ffffff',
  },
  headerLandscape: { height: 48 },
  logo: { width: 86, height: 28 },
  content: { flex: 1, minHeight: 0, backgroundColor: '#f1f1f1' },
});
