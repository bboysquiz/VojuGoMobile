import { Image } from 'expo-image';
import {
  useLocalSearchParams,
  useRouter,
} from 'expo-router';
import { useEffect, useState } from 'react';
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

type UserRole = 'customer' | 'contractor';

export default function SignUpScreen() {
  const router = useRouter();

  const params = useLocalSearchParams<{
    role?: string;
  }>();

  const [role, setRole] =
    useState<UserRole>('customer');

  const [identity, setIdentity] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [
    passwordConfirmation,
    setPasswordConfirmation,
  ] = useState('');

  const [
    hasAcceptedTerms,
    setHasAcceptedTerms,
  ] = useState(false);

  const [identityError, setIdentityError] =
    useState('');

  const [phoneError, setPhoneError] =
    useState('');

  const [passwordError, setPasswordError] =
    useState('');

  const [
    passwordConfirmationError,
    setPasswordConfirmationError,
  ] = useState('');

  const [termsError, setTermsError] =
    useState('');

  useEffect(() => {
    setRole(
      params.role === 'contractor'
        ? 'contractor'
        : 'customer'
    );
  }, [params.role]);

  const pageTitle =
    role === 'customer'
      ? 'Регистрация для поиска техники'
      : 'Регистрация для поиска заказов';

  const identityPlaceholder = 'Имя или компания';

  function selectRole(nextRole: UserRole) {
    setRole(nextRole);
  }

  function handleIdentityChange(value: string) {
    setIdentity(value);
    setIdentityError('');
  }

  function handlePhoneChange(value: string) {
    setPhone(normalizePhoneInput(value));
    setPhoneError('');
  }

  function handlePasswordChange(value: string) {
    setPassword(value);
    setPasswordError('');
  }

  function handlePasswordConfirmationChange(
    value: string
  ) {
    setPasswordConfirmation(value);
    setPasswordConfirmationError('');
  }

  function toggleTerms() {
    setHasAcceptedTerms((current) => !current);
    setTermsError('');
  }

  function handleRegistration() {
    setIdentityError('');
    setPhoneError('');
    setPasswordError('');
    setPasswordConfirmationError('');
    setTermsError('');

    const normalizedIdentity = identity.trim();
    const normalizedPhone = phone.trim();

    let hasError = false;

    if (!normalizedIdentity) {
      setIdentityError('Заполните поле');
      hasError = true;
    }

    if (!isValidPhone(normalizedPhone)) {
      setPhoneError(
        'Введите номер в формате +7 999 123-45-67'
      );
      hasError = true;
    }

    if (password.length < 8) {
      setPasswordError('Минимум 8 символов');
      hasError = true;
    }

    if (!passwordConfirmation) {
      setPasswordConfirmationError(
        'Повторите пароль'
      );
      hasError = true;
    } else if (
      password !== passwordConfirmation
    ) {
      setPasswordConfirmationError(
        'Пароли не совпадают'
      );
      hasError = true;
    }

    if (!hasAcceptedTerms) {
      setTermsError('Нужно принять условия');
      hasError = true;
    }

    if (hasError) {
      return;
    }

    /*
     * API пока не подключаем.
     *
     * Следующим шагом здесь будет:
     *
     * register(...)
     * sendVerificationCode(...)
     * router.push('/signup-verify')
     */

    Alert.alert(
      'Регистрация',
      role === 'customer'
        ? 'Данные заказчика заполнены корректно.'
        : 'Данные исполнителя заполнены корректно.'
    );
  }

  function handleLogin() {
    router.replace('/');
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
                {pageTitle}
              </Text>

              <View style={styles.roles}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected:
                      role === 'customer',
                  }}
                  onPress={() =>
                    selectRole('customer')
                  }
                  style={[
                    styles.roleButton,
                    role === 'customer' &&
                      styles.roleButtonActive,
                  ]}
                >
                  <Text
                    style={
                      styles.roleButtonText
                    }
                  >
                    Я заказчик
                  </Text>
                </Pressable>

                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{
                    selected:
                      role === 'contractor',
                  }}
                  onPress={() =>
                    selectRole('contractor')
                  }
                  style={[
                    styles.roleButton,
                    role === 'contractor' &&
                      styles.roleButtonActive,
                  ]}
                >
                  <Text
                    style={
                      styles.roleButtonText
                    }
                  >
                    Я исполнитель
                  </Text>
                </Pressable>
              </View>

              <View style={styles.fields}>
                <AuthInput
                  label={identityPlaceholder}
                  value={identity}
                  onChangeText={
                    handleIdentityChange
                  }
                  error={identityError}
                  autoCapitalize="words"
                  autoCorrect={false}
                  returnKeyType="next"
                />

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
                  textContentType="newPassword"
                  autoComplete="new-password"
                  returnKeyType="next"
                />

                <AuthInput
                  label="Подтверждение пароля"
                  value={passwordConfirmation}
                  onChangeText={
                    handlePasswordConfirmationChange
                  }
                  error={
                    passwordConfirmationError
                  }
                  secureTextEntry
                  textContentType="newPassword"
                  autoComplete="new-password"
                  returnKeyType="done"
                  onSubmitEditing={
                    handleRegistration
                  }
                />
              </View>

              <View style={styles.termsBlock}>
                <Pressable
                  accessibilityRole="checkbox"
                  accessibilityState={{
                    checked:
                      hasAcceptedTerms,
                  }}
                  onPress={toggleTerms}
                  style={styles.termsRow}
                >
                  <View
                    style={[
                      styles.checkbox,
                      hasAcceptedTerms &&
                        styles.checkboxChecked,
                      Boolean(termsError) &&
                        styles.checkboxError,
                    ]}
                  >
                    {hasAcceptedTerms ? (
                      <View
                        style={
                          styles.checkmark
                        }
                      />
                    ) : null}
                  </View>

                  <Text style={styles.termsText}>
                    Принимаю{' '}
                    <Text
                      style={
                        styles.termsLink
                      }
                    >
                      условия использования
                    </Text>{' '}
                    и{' '}
                    <Text
                      style={
                        styles.termsLink
                      }
                    >
                      политику обработки
                      персональных данных
                    </Text>
                  </Text>
                </Pressable>

                {termsError ? (
                  <Text
                    style={
                      styles.termsError
                    }
                  >
                    {termsError}
                  </Text>
                ) : null}
              </View>

              <Pressable
                accessibilityRole="button"
                onPress={handleRegistration}
                style={({ pressed }) => [
                  styles.submitButton,
                  pressed &&
                    styles.submitButtonPressed,
                ]}
              >
                <Text
                  style={
                    styles.submitButtonText
                  }
                >
                  Зарегистрироваться
                </Text>
              </Pressable>

              <View style={styles.footer}>
                <Text style={styles.footerText}>
                  Уже есть аккаунт?{' '}
                  <Text
                    style={styles.loginLink}
                    onPress={handleLogin}
                  >
                    Войти
                  </Text>
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

    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 16,

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
    width: '100%',

    paddingHorizontal: 4,

    color: '#191919',

    fontFamily: 'Roboto_500Medium',
    fontSize: 18,
    lineHeight: 22,

    textAlign: 'center',

    includeFontPadding: false,
  },

  roles: {
    width: '100%',
    maxWidth: 304,

    flexDirection: 'row',

    gap: 4,

    marginBottom: 16,
    padding: 4,

    borderRadius: 12,
    backgroundColor: '#f1f1f1',
  },

  roleButton: {
    flex: 1,
    height: 36,

    alignItems: 'center',
    justifyContent: 'center',

    paddingHorizontal: 8,

    borderRadius: 8,
    backgroundColor: 'transparent',
  },

  roleButtonActive: {
    backgroundColor: '#ffdc3c',
  },

  roleButtonText: {
    color: '#191919',

    fontFamily: 'Roboto_500Medium',
    fontSize: 12,
    lineHeight: 16,

    textAlign: 'center',

    includeFontPadding: false,
  },

  fields: {
    width: '100%',

    gap: 16,
  },

  termsBlock: {
    width: '100%',

    marginTop: 24,
  },

  termsRow: {
    width: '100%',

    flexDirection: 'row',
    alignItems: 'flex-start',

    gap: 6,
  },

  checkbox: {
    position: 'relative',

    width: 20,
    height: 20,

    flexShrink: 0,

    borderWidth: 1,
    borderColor: '#c5c4bc',
    borderRadius: 10,

    backgroundColor: '#ffffff',
  },

  checkboxChecked: {
    borderColor: '#ffdc3c',
    backgroundColor: '#ffdc3c',
  },

  checkboxError: {
    borderColor: '#d92d20',
  },

  checkmark: {
    position: 'absolute',

    top: 3,
    left: 7,

    width: 5,
    height: 9,

    borderRightWidth: 1.5,
    borderBottomWidth: 1.5,
    borderColor: '#000000',

    transform: [
      {
        rotate: '45deg',
      },
    ],
  },

  termsText: {
    flex: 1,

    color: '#808080',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,

    includeFontPadding: false,
  },

  termsLink: {
    color: '#191919',
    textDecorationLine: 'underline',
  },

  termsError: {
    marginTop: 6,

    color: '#d92d20',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,

    includeFontPadding: false,
  },

  submitButton: {
    width: '100%',
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',

    marginTop: 24,

    borderRadius: 12,
    backgroundColor: '#000000',
  },

  submitButtonPressed: {
    opacity: 0.8,
  },

  submitButtonText: {
    color: '#ffffff',

    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,

    includeFontPadding: false,
  },

  footer: {
    width: '100%',

    marginTop: 24,

    alignItems: 'center',
  },

  footerText: {
    color: '#808080',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,

    textAlign: 'center',

    includeFontPadding: false,
  },

  loginLink: {
    color: '#191919',
    textDecorationLine: 'underline',
  },
});