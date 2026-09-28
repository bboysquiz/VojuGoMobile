import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuthInput } from '../features/auth/components/AuthInput';
import {
  isValidPhone,
  normalizePhoneInput,
} from '../shared/lib/phone';

export default function LoginScreen() {
  const router = useRouter();

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const [phoneError, setPhoneError] =
    useState('');

  const [passwordError, setPasswordError] =
    useState('');

  function handlePhoneChange(value: string) {
    setPhone(normalizePhoneInput(value));
    setPhoneError('');
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setPasswordError('');
  }

  function handleLogin() {
    setPhoneError('');
    setPasswordError('');

    const normalizedPhone = phone.trim();

    let hasError = false;

    if (!isValidPhone(normalizedPhone)) {
      setPhoneError(
        'Введите номер в формате +7 999 123-45-67'
      );
      hasError = true;
    }

    if (!password) {
      setPasswordError('Введите пароль');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    /*
     * API пока не подключаем.
     * Следующим шагом здесь будет настоящий login().
     */

    Alert.alert(
      'Авторизация',
      'Форма заполнена корректно. Следующим шагом подключим API.'
    );
  }

  function handleCustomerRegistration() {
    router.push({
      pathname: '/signup',
      params: {
        role: 'customer',
      },
    });
  }

  function handleContractorRegistration() {
    router.push({
      pathname: '/signup',
      params: {
        role: 'contractor',
      },
    });
  }

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
          showsVerticalScrollIndicator={false}
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

              <Text style={styles.title}>
                Вход
              </Text>

              <View style={styles.fields}>
                <AuthInput
                  label="Телефон"
                  value={phone}
                  onChangeText={handlePhoneChange}
                  error={phoneError}
                  keyboardType="phone-pad"
                  textContentType="telephoneNumber"
                  autoComplete="tel"
                  returnKeyType="next"
                />

                <AuthInput
                  label="Пароль"
                  value={password}
                  onChangeText={
                    handlePasswordChange
                  }
                  error={passwordError}
                  secureTextEntry
                  textContentType="password"
                  autoComplete="current-password"
                  returnKeyType="done"
                  onSubmitEditing={handleLogin}
                />
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={handleLogin}
                style={({ pressed }) => [
                  styles.loginButton,
                  pressed &&
                    styles.loginButtonPressed,
                ]}
              >
                <Text
                  style={styles.loginButtonText}
                >
                  Войти
                </Text>
              </Pressable>

              <Text style={styles.noAccount}>
                Нет аккаунта?
              </Text>

              <View style={styles.registration}>
                <Text
                  style={styles.registrationLine}
                >
                  Зарегистрироваться{' '}
                  <Text
                    style={
                      styles.registrationLink
                    }
                    onPress={
                      handleCustomerRegistration
                    }
                  >
                    как заказчик
                  </Text>
                  {' |'}
                </Text>

                <Text
                  style={[
                    styles.registrationLine,
                    styles.registrationLink,
                  ]}
                  onPress={
                    handleContractorRegistration
                  }
                >
                  как исполнитель
                </Text>
              </View>
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
    minHeight: 512,

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

  title: {
    color: '#191919',

    fontFamily: 'Roboto_500Medium',
    fontSize: 18,
    lineHeight: 22,

    textAlign: 'center',

    includeFontPadding: false,
  },

  fields: {
    width: '100%',

    gap: 16,
  },

  loginButton: {
    width: '100%',
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 12,
    backgroundColor: '#000000',
  },

  loginButtonPressed: {
    opacity: 0.8,
  },

  loginButtonText: {
    color: '#ffffff',

    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,

    includeFontPadding: false,
  },

  noAccount: {
    color: '#808080',

    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,

    textAlign: 'center',

    includeFontPadding: false,
  },

  registration: {
    alignItems: 'center',
  },

  registrationLine: {
    color: '#191919',

    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 18,

    textAlign: 'center',

    includeFontPadding: false,
  },

  registrationLink: {
    textDecorationLine: 'underline',
  },
});