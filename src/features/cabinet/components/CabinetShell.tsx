import { Image } from 'expo-image';

import {
  usePathname,
  useRouter,
} from 'expo-router';

import {
  type ReactNode,
  useEffect,
  useState,
} from 'react';

import {
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  SafeAreaView,
} from 'react-native-safe-area-context';

import {
  getSelf,
  type SelfResponse,
} from '../../auth/api/auth.api';

type Role =
  | 'customer'
  | 'contractor';

interface Props {
  role: Role;
  children: ReactNode;
}

interface NavigationItem {
  label: string;
  path?: string;
  href?: string;
}

const customerNavigation: NavigationItem[] = [
  {
    label: 'Мои заявки',
    path: '/cabinet/customer/orders',
  },
  {
    label: 'Новая заявка',
    path: '/cabinet/customer/new',
  },
  {
    label: 'История и оценки',
    path: '/cabinet/customer/history',
  },
];

const contractorNavigation: NavigationItem[] = [
  {
    label: 'Заявки',
    path: '/cabinet/contractor',
  },
  {
    label: 'Мои отклики',
    path: '/cabinet/contractor/responses',
  },
  {
    label: 'История',
    path: '/cabinet/contractor/history',
  },
  {
    label: 'Моя техника',
    path: '/cabinet/contractor/vehicles',
  },
  {
    label: 'Поддержка',
    href: 'https://t.me/vozhugo',
  },
];

function isNavigationItemActive(
  pathname: string,
  item: NavigationItem
): boolean {
  if (!item.path) {
    return false;
  }

  /*
   * Корневая страница исполнителя
   * должна быть активна только на
   * /cabinet/contractor.
   */
  if (
    item.path ===
    '/cabinet/contractor'
  ) {
    return (
      pathname ===
      '/cabinet/contractor'
    );
  }

  /*
   * Остальные разделы допускают
   * вложенные страницы.
   *
   * Например:
   * /vehicles
   * /vehicles/new
   * /vehicles/123/edit
   */
  return (
    pathname === item.path ||
    pathname.startsWith(
      `${item.path}/`
    )
  );
}

export function CabinetShell({
  role,
  children,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();

  const [
    user,
    setUser,
  ] = useState<SelfResponse | null>(
    null
  );

  const [
    menuOpen,
    setMenuOpen,
  ] = useState(false);

  useEffect(() => {
    void loadUser();
  }, []);

  async function loadUser() {
    try {
      const currentUser =
        await getSelf();

      if (
        !currentUser.roles.includes(
          role
        )
      ) {
        router.replace('/');
        return;
      }

      setUser(currentUser);
    } catch {
      router.replace('/');
    }
  }

  const navigation =
    role === 'customer'
      ? customerNavigation
      : contractorNavigation;

  const profilePath =
    role === 'customer'
      ? '/cabinet/customer/profile'
      : '/cabinet/contractor/profile';

  const displayName =
    user?.company_name ||
    user?.name ||
    user?.phone ||
    '';

  function navigate(
    path: string
  ) {
    setMenuOpen(false);

    router.push(
      path as never
    );
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={styles.safeArea}
    >
      <View style={styles.header}>
        <Image
          source={require(
            '../../../../assets/landing/logo_mobile.svg'
          )}
          style={styles.logo}
          contentFit="contain"
        />

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            menuOpen
              ? 'Закрыть меню'
              : 'Открыть меню'
          }
          onPress={() =>
            setMenuOpen(
              (current) =>
                !current
            )
          }
          style={
            styles.menuButton
          }
        >
          <View
            style={[
              styles.menuLine,
              menuOpen &&
                styles.menuLineFirstOpen,
            ]}
          />

          <View
            style={[
              styles.menuLine,
              menuOpen &&
                styles.menuLineMiddleOpen,
            ]}
          />

          <View
            style={[
              styles.menuLine,
              menuOpen &&
                styles.menuLineLastOpen,
            ]}
          />
        </Pressable>
      </View>

      <View style={styles.body}>
        {/*
         * ВАЖНО:
         *
         * Slot / children всегда остаётся
         * смонтированным.
         *
         * Раньше при menuOpen=true
         * children исчезал из React tree,
         * из-за чего Expo Router терял
         * текущую дочернюю страницу.
         */}
        <View
          style={styles.content}
          pointerEvents={
            menuOpen
              ? 'none'
              : 'auto'
          }
        >
          {children}
        </View>

        {menuOpen ? (
          <View
            style={styles.menu}
          >
            <Pressable
              style={styles.user}
              onPress={() =>
                navigate(
                  profilePath
                )
              }
            >
              <Text
                numberOfLines={1}
                style={
                  styles.userName
                }
              >
                {displayName}
              </Text>

              <Text
                style={
                  styles.arrow
                }
              >
                ›
              </Text>
            </Pressable>

            <View
              style={
                styles.navigation
              }
            >
              {navigation.map(
                (item) => {
                  const active =
                    isNavigationItemActive(
                      pathname,
                      item
                    );

                  return (
                    <Pressable
                      key={
                        item.label
                      }
                      onPress={() => {
                        if (
                          item.href
                        ) {
                          void Linking.openURL(
                            item.href
                          );

                          return;
                        }

                        if (
                          item.path
                        ) {
                          navigate(
                            item.path
                          );
                        }
                      }}
                      style={[
                        styles.navigationItem,
                        active &&
                          styles.navigationItemActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.navigationText,
                          active &&
                            styles.navigationTextActive,
                        ]}
                      >
                        {
                          item.label
                        }
                      </Text>
                    </Pressable>
                  );
                }
              )}
            </View>

            <View
              style={
                styles.contacts
              }
            >
              <Pressable
                style={
                  styles.contactButton
                }
                onPress={() =>
                  void Linking.openURL(
                    'https://t.me/vozhugo'
                  )
                }
              >
                <Text
                  style={
                    styles.contactButtonText
                  }
                >
                  Написать нам
                </Text>
              </Pressable>

              <Text
                style={
                  styles.email
                }
                onPress={() =>
                  void Linking.openURL(
                    'mailto:info@vozhugo.ru'
                  )
                }
              >
                info@vozhugo.ru
              </Text>
            </View>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        '#ffffff',
    },

    header: {
      height: 64,
      paddingHorizontal: 16,

      flexDirection: 'row',
      alignItems: 'center',
      justifyContent:
        'space-between',

      backgroundColor:
        '#ffffff',
    },

    logo: {
      width: 86,
      height: 28,
    },

    menuButton: {
      width: 24,
      height: 24,

      justifyContent:
        'center',
      alignItems: 'center',

      gap: 5,
    },

    menuLine: {
      width: 20,
      height: 2,

      borderRadius: 2,
      backgroundColor:
        '#000000',
    },

    menuLineFirstOpen: {
      position: 'absolute',

      transform: [
        {
          rotate: '45deg',
        },
      ],
    },

    menuLineMiddleOpen: {
      opacity: 0,
    },

    menuLineLastOpen: {
      position: 'absolute',

      transform: [
        {
          rotate: '-45deg',
        },
      ],
    },

    /*
     * Контейнер под header.
     * Внутри одновременно находятся
     * текущая страница и overlay меню.
     */
    body: {
      flex: 1,
      position: 'relative',
    },

    /*
     * Страница всегда остаётся
     * смонтированной.
     */
    content: {
      flex: 1,
      backgroundColor:
        '#f1f1f1',
    },

    /*
     * Меню теперь overlay поверх
     * текущей страницы.
     */
    menu: {
      position: 'absolute',

      top: 0,
      right: 0,
      bottom: 0,
      left: 0,

      zIndex: 100,

      padding: 16,

      backgroundColor:
        '#f1f1f1',
    },

    user: {
      width: '100%',
      minHeight: 54,

      paddingHorizontal: 16,

      flexDirection: 'row',
      alignItems: 'center',

      borderWidth: 1,
      borderColor:
        '#d9d9d9',
      borderRadius: 12,

      backgroundColor:
        '#ffffff',
    },

    userName: {
      flex: 1,

      color: '#191919',

      fontFamily:
        'Roboto_500Medium',
      fontSize: 14,
      lineHeight: 18,
    },

    arrow: {
      color: '#808080',

      fontSize: 28,
      lineHeight: 28,
    },

    navigation: {
      marginTop: 21,
      gap: 4,
    },

    navigationItem: {
      minHeight: 48,

      paddingHorizontal: 16,

      justifyContent:
        'center',

      borderRadius: 6,
    },

    navigationItemActive: {
      backgroundColor:
        '#e9e9e9',
    },

    navigationText: {
      color: '#808080',

      fontFamily:
        'Roboto_400Regular',
      fontSize: 18,
      lineHeight: 24,
    },

    navigationTextActive: {
      color: '#191919',

      fontFamily:
        'Roboto_500Medium',
    },

    contacts: {
      position: 'absolute',

      right: 16,
      bottom: 8,
      left: 16,

      flexDirection: 'row',
      alignItems: 'center',

      gap: 8,
    },

    contactButton: {
      minHeight: 32,

      paddingHorizontal: 12,

      justifyContent:
        'center',

      borderRadius: 999,

      backgroundColor:
        '#000000',
    },

    contactButtonText: {
      color: '#ffffff',

      fontFamily:
        'Roboto_400Regular',
      fontSize: 12,
    },

    email: {
      color: '#191919',

      fontFamily:
        'Roboto_400Regular',
      fontSize: 12,
    },
  });