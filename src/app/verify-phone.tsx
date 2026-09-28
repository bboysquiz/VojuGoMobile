import { Image } from 'expo-image';

import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';

import {
  useEffect,
  useRef,
  useState,
} from 'react';

import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthCodeInput } from '../features/auth/components/AuthCodeInput';

import { formatPhone } from '../shared/lib/phone';

const RESEND_COOLDOWN_SECONDS = 18;

export default function VerifyPhoneScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    phone?: string;
    role?: string;
  }>();

  const phone =
    typeof params.phone === 'string'
      ? params.phone
      : '+79000000000';

  const role =
    params.role === 'contractor'
      ? 'contractor'
      : 'customer';

  const [code, setCode] = useState('');

  const [
    resendCooldown,
    setResendCooldown,
  ] = useState(
    RESEND_COOLDOWN_SECONDS
  );

  const timerRef = useRef<
    ReturnType<typeof setInterval> | undefined
  >(undefined);

  function stopTimer() {
    if (timerRef.current !== undefined) {
      clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
  }

  function startTimer() {
    stopTimer();

    setResendCooldown(
      RESEND_COOLDOWN_SECONDS
    );

    timerRef.current = setInterval(() => {
      setResendCooldown((current) => {
        if (current <= 1) {
          stopTimer();
          return 0;
        }

        return current - 1;
      });
    }, 1000);
  }

  useEffect(() => {
    startTimer();

    return () => {
      stopTimer();
    };
  }, []);

  function handleCodeChange(
    nextCode: string
  ) {
    setCode(
      nextCode
        .replace(/\D/g, '')
        .slice(0, 4)
    );
  }

  function handleCodeComplete(
    completedCode: string
  ) {
    /*
     * Пока API не подключаем.
     *
     * Позже здесь будет:
     *
     * await verifyCode({
     *   code: completedCode,
     * })
     *
     * и переход в кабинет.
     */

    setCode(completedCode);
  }

  function handleChangePhone() {
    router.replace({
      pathname: '/signup',
      params: {
        role,
      },
    });
  }

  function handleResend() {
    if (resendCooldown > 0) {
      return;
    }

    /*
     * Пока API не подключаем.
     *
     * Позже здесь будет:
     *
     * await sendVerificationCode()
     */

    setCode('');
    startTimer();
  }

  const resendText = `Получить новый код через 0:${String(
    resendCooldown
  ).padStart(2, '0')}`;

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior={
          Platform.OS === 'ios'
            ? 'padding'
            : undefined
        }
      >
        <ScrollView
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={
            false
          }
          contentContainerStyle={
            styles.scrollContent
          }
        >
          <View style={styles.card}>
            <View style={styles.hazard}>
              <Image
                source={require(
                  '../../assets/landing/hazard-stripe.svg'
                )}
                style={styles.hazardImage}
                contentFit="cover"
              />
            </View>

            <View style={styles.body}>
              <Image
                source={require(
                  '../../assets/landing/logo_mobile.svg'
                )}
                style={styles.logo}
                contentFit="contain"
              />

              <View style={styles.header}>
                <Text style={styles.title}>
                  Введите код из смс
                </Text>

                <Text
                  style={styles.description}
                >
                  Отправили код на{' '}
                  {formatPhone(phone)}
                </Text>

                <Pressable
                  accessibilityRole="button"
                  onPress={handleChangePhone}
                  hitSlop={8}
                >
                  <Text
                    style={
                      styles.changePhone
                    }
                  >
                    Изменить номер
                  </Text>
                </Pressable>
              </View>

              <AuthCodeInput
                value={code}
                onChange={
                  handleCodeChange
                }
                onComplete={
                  handleCodeComplete
                }
              />

              {resendCooldown > 0 ? (
                <Text style={styles.timer}>
                  {resendText}
                </Text>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  onPress={handleResend}
                  style={({ pressed }) => [
                    styles.resendButton,
                    pressed &&
                      styles.resendButtonPressed,
                  ]}
                >
                  <Text
                    style={
                      styles.resendButtonText
                    }
                  >
                    Получить новый код
                  </Text>
                </Pressable>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },

  keyboardContainer: {
    flex: 1,
  },

  scrollContent: {
    flexGrow: 1,

    justifyContent: 'center',

    paddingHorizontal: 16,
    paddingVertical: 16,

    backgroundColor: '#f1f1f1',
  },

  card: {
    width: '100%',

    overflow: 'hidden',

    borderRadius: 14,
    backgroundColor: '#ffffff',
  },

  hazard: {
    width: '100%',
    height: 8,

    overflow: 'hidden',

    backgroundColor: '#000000',
  },

  hazardImage: {
    width: '100%',
    height: 8,
  },

  body: {
    width: '100%',
    minHeight: 348,

    alignItems: 'center',

    paddingTop: 40,
    paddingHorizontal: 16,
    paddingBottom: 40,

    gap: 32,
  },

  logo: {
    width: 86,
    height: 28,
  },

  header: {
    width: '100%',

    alignItems: 'center',
  },

  title: {
    color: '#191919',

    fontFamily: 'Roboto_500Medium',
    fontSize: 18,
    lineHeight: 22,

    textAlign: 'center',

    includeFontPadding: false,
  },

  description: {
    marginTop: 6,

    color: '#808080',

    fontFamily: 'Roboto_400Regular',
    fontSize: 13,
    lineHeight: 18,

    textAlign: 'center',

    includeFontPadding: false,
  },

  changePhone: {
    marginTop: 10,

    color: '#808080',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,

    textAlign: 'center',

    includeFontPadding: false,
  },

  timer: {
    marginTop: 0,

    color: '#808080',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,

    textAlign: 'center',

    includeFontPadding: false,
  },

  resendButton: {
    minWidth: 196,
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 24,

    borderRadius: 12,
    backgroundColor: '#000000',
  },

  resendButtonPressed: {
    opacity: 0.8,
  },

  resendButtonText: {
    color: '#ffffff',

    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,

    includeFontPadding: false,
  },
});