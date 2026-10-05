import { Image } from 'expo-image';
import { useRouter } from 'expo-router';

import {
  useEffect,
  useState,
} from 'react';

import {
  Linking,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import {
  clearAuthTokens,
} from '../../../shared/api/auth-token-storage';

import {
  logout,
} from '../../auth/api/auth.api';

import {
  getSelf,
  updateProfile,
} from '../api/profile.api';

type Role =
  | 'customer'
  | 'contractor';

interface Props {
  role: Role;
}

export function ProfileScreen({
  role,
}: Props) {
  const router = useRouter();

  const [name, setName] =
    useState('');

  const [city, setCity] =
    useState('');

  const [
    companyName,
    setCompanyName,
  ] = useState('');

  const [phone, setPhone] =
    useState('');

  const [email, setEmail] =
    useState('');

  const [
    telegramLinked,
    setTelegramLinked,
  ] = useState(false);

  const [loading, setLoading] =
    useState(true);

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState('');

  const [success, setSuccess] =
    useState('');

  const [
    logoutOpen,
    setLogoutOpen,
  ] = useState(false);

  const title =
    role === 'customer'
      ? 'Профиль компании'
      : 'Профиль';

  useEffect(() => {
    void loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError('');

    try {
      const user = await getSelf();

      setName(user.name ?? '');
      setCity(user.city ?? '');

      setCompanyName(
        user.company_name ?? ''
      );

      setPhone(user.phone);

      setEmail(user.email ?? '');

      setTelegramLinked(
        user.telegram_linked === true
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'Не удалось загрузить профиль'
      );
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    const normalizedName =
      name.trim();

    const normalizedCity =
      city.trim();

    if (!normalizedName) {
      setError('Укажите имя');
      return;
    }

    if (!normalizedCity) {
      setError('Укажите город');
      return;
    }

    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const user =
        await updateProfile({
          name: normalizedName,
          city: normalizedCity,
          company_name:
            companyName,
        });

      setName(user.name ?? '');
      setCity(user.city ?? '');

      setCompanyName(
        user.company_name ?? ''
      );

      setSuccess(
        'Изменения сохранены'
      );
    } catch (currentError) {
      setError(
        currentError instanceof Error
          ? currentError.message
          : 'Не удалось сохранить профиль'
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    setLogoutOpen(false);

    try {
      await logout();
    } finally {
      await clearAuthTokens();
      router.replace('/');
    }
  }

  if (loading) {
    return (
      <View style={styles.state}>
        <Text style={styles.stateText}>
          Загружаем профиль…
        </Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView
        style={styles.screen}
        contentContainerStyle={
          styles.content
        }
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          <Image
            source={require(
              '../../../../assets/landing/hazard-stripe.svg'
            )}
            style={styles.hazard}
            contentFit="cover"
          />

          <Text style={styles.title}>
            {title}
          </Text>

          <View style={styles.fields}>
            <ProfileField
              label="Имя или название"
              value={name}
              onChangeText={(value) => {
                setName(value);
                setError('');
                setSuccess('');
              }}
            />

            <ProfileField
              label="Телефон"
              value={phone}
              editable={false}
            />

            <ProfileField
              label="Город"
              value={city}
              onChangeText={(value) => {
                setCity(value);
                setError('');
                setSuccess('');
              }}
            />

            <ProfileField
              label="Email"
              value={email}
              editable={false}
              placeholder="Не указан"
            />
          </View>

          {error ? (
            <Text style={styles.error}>
              {error}
            </Text>
          ) : null}

          {success ? (
            <Text style={styles.success}>
              {success}
            </Text>
          ) : null}

          <Pressable
            disabled={saving}
            onPress={handleSave}
            style={({ pressed }) => [
              styles.saveButton,

              pressed &&
                styles.buttonPressed,

              saving &&
                styles.buttonDisabled,
            ]}
          >
            <Text
              style={styles.saveText}
            >
              {saving
                ? 'Сохраняем…'
                : 'Сохранить изменения'}
            </Text>
          </Pressable>
        </View>

        <View style={styles.account}>
          <Pressable
            style={styles.telegram}
            onPress={() =>
              void Linking.openURL(
                'https://t.me/vozhugo'
              )
            }
          >
            <View>
              <Text
                style={
                  styles.accountTitle
                }
              >
                Telegram-бот
              </Text>

              {!telegramLinked ? (
                <Text
                  style={
                    styles.accountSubtitle
                  }
                >
                  Не подключён
                </Text>
              ) : null}
            </View>
          </Pressable>

          <Pressable
            style={styles.logout}
            onPress={() =>
              setLogoutOpen(true)
            }
          >
            <Text
              style={styles.logoutText}
            >
              Выйти
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <Modal
        visible={logoutOpen}
        transparent
        animationType="fade"
        onRequestClose={() =>
          setLogoutOpen(false)
        }
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() =>
            setLogoutOpen(false)
          }
        >
          <Pressable
            style={styles.modal}
            onPress={(event) =>
              event.stopPropagation()
            }
          >
            <Text
              style={styles.modalTitle}
            >
              Выйти из аккаунта?
            </Text>

            <Text
              style={
                styles.modalDescription
              }
            >
              Вам нужно будет снова войти
              по номеру телефона, чтобы
              продолжить откликаться на
              заявки.
            </Text>

            <View
              style={styles.modalActions}
            >
              <Pressable
                style={
                  styles.modalCancel
                }
                onPress={() =>
                  setLogoutOpen(false)
                }
              >
                <Text>
                  Отмена
                </Text>
              </Pressable>

              <Pressable
                style={
                  styles.modalConfirm
                }
                onPress={
                  handleLogout
                }
              >
                <Text
                  style={
                    styles.modalConfirmText
                  }
                >
                  Выйти
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

interface ProfileFieldProps {
  label: string;
  value: string;
  editable?: boolean;
  placeholder?: string;
  onChangeText?: (
    value: string
  ) => void;
}

function ProfileField({
  label,
  value,
  editable = true,
  placeholder,
  onChangeText,
}: ProfileFieldProps) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>
        {label}
      </Text>

      <TextInput
        value={value}
        editable={editable}
        placeholder={placeholder}
        placeholderTextColor="#808080"
        onChangeText={onChangeText}
        style={styles.input}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#f1f1f1',
  },

  content: {
    paddingTop: 21,
    paddingHorizontal: 16,
    paddingBottom: 32,

    gap: 32,
  },

  state: {
    flex: 1,

    padding: 24,

    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#f1f1f1',
  },

  stateText: {
    color: '#808080',
    fontFamily: 'Roboto_400Regular',
  },

  form: {
    position: 'relative',

    overflow: 'hidden',

    paddingTop: 24,
    paddingHorizontal: 16,
    paddingBottom: 16,

    gap: 16,

    borderRadius: 12,
    backgroundColor: '#ffffff',
  },

  hazard: {
    position: 'absolute',

    top: 0,
    left: 0,
    right: 0,

    width: '100%',
    height: 8,
  },

  title: {
    color: '#191919',

    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 24,

    includeFontPadding: false,
  },

  fields: {
    gap: 16,
  },

  field: {
    position: 'relative',

    height: 48,

    overflow: 'hidden',

    borderRadius: 12,
    backgroundColor: '#f1f1f1',
  },

  label: {
    position: 'absolute',

    zIndex: 1,

    top: 6,
    left: 16,

    color: '#808080',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,

    includeFontPadding: false,
  },

  input: {
    width: '100%',
    height: 48,

    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 4,

    color: '#191919',

    fontFamily: 'Roboto_400Regular',
    fontSize: 16,

    includeFontPadding: false,
  },

  error: {
    color: '#8a2f22',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
  },

  success: {
    color: '#1f5c3a',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
  },

  saveButton: {
    width: '100%',
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 8,
    backgroundColor: '#000000',
  },

  saveText: {
    color: '#ffffff',

    fontFamily: 'Roboto_500Medium',
    fontSize: 14,
    lineHeight: 18,

    includeFontPadding: false,
  },

  buttonPressed: {
    opacity: 0.8,
  },

  buttonDisabled: {
    opacity: 0.65,
  },

  account: {
    overflow: 'hidden',

    borderRadius: 12,
    backgroundColor: '#ffffff',
  },

  telegram: {
    minHeight: 72,

    padding: 16,

    justifyContent: 'center',
  },

  accountTitle: {
    color: '#191919',

    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },

  accountSubtitle: {
    marginTop: 2,

    color: '#808080',

    fontFamily: 'Roboto_400Regular',
    fontSize: 10,
    lineHeight: 13,
  },

  logout: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },

  logoutText: {
    color: '#d83b2f',

    fontFamily: 'Roboto_400Regular',
    fontSize: 14,
    lineHeight: 20,
  },

  modalBackdrop: {
    flex: 1,

    padding: 20,

    alignItems: 'center',
    justifyContent: 'center',

    backgroundColor:
      'rgba(30, 35, 40, 0.5)',
  },

  modal: {
    width: '100%',
    maxWidth: 342,

    padding: 20,

    borderRadius: 12,
    backgroundColor: '#ffffff',
  },

  modalTitle: {
    marginBottom: 8,

    color: '#191919',

    fontFamily: 'Roboto_500Medium',
    fontSize: 16,
    lineHeight: 20,
  },

  modalDescription: {
    marginBottom: 20,

    color: '#808080',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 12,
  },

  modalCancel: {
    flex: 1,
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',

    borderWidth: 1,
    borderColor: '#d9d9d9',
    borderRadius: 8,
  },

  modalConfirm: {
    flex: 1,
    height: 48,

    alignItems: 'center',
    justifyContent: 'center',

    borderRadius: 8,
    backgroundColor: '#e0533b',
  },

  modalConfirmText: {
    color: '#ffffff',

    fontFamily: 'Roboto_500Medium',
  },
});