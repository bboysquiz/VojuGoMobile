import { Image } from 'expo-image';
import { useState } from 'react';

import {
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  type TextInputProps,
  View,
} from 'react-native';

type AuthInputProps = Omit<
  TextInputProps,
  'value' | 'onChangeText'
> & {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  error?: string;
  hint?: string;
  appearance?: 'default' | 'recovery';
};

export function AuthInput({
  label,
  value,
  onChangeText,
  error = '',
  hint = '',
  appearance = 'default',
  secureTextEntry = false,
  style,
  ...inputProps
}: AuthInputProps) {
  const [isFocused, setIsFocused] =
    useState(false);

  const [
    isPasswordVisible,
    setIsPasswordVisible,
  ] = useState(false);

  const isFilled = value.length > 0;
  const isPasswordField =
    secureTextEntry;

  function handleChangeText(
    nextValue: string
  ) {
    if (!nextValue) {
      setIsPasswordVisible(false);
    }

    onChangeText(nextValue);
  }

  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        {isFilled ? (
          <Text style={styles.label}>
            {label}
          </Text>
        ) : null}

        <TextInput
          {...inputProps}
          accessibilityLabel={inputProps.accessibilityLabel ?? label}
          value={value}
          onChangeText={handleChangeText}
          placeholder={
            isFilled
              ? undefined
              : label
          }
          placeholderTextColor="#808080"
          secureTextEntry={
            isPasswordField &&
            !isPasswordVisible
          }
          selectionColor="#000000"
          onFocus={() =>
            setIsFocused(true)
          }
          onBlur={() =>
            setIsFocused(false)
          }
          style={[
            styles.input,
            appearance === 'recovery' && !isFilled && styles.recoveryPlaceholder,

            isFilled &&
              styles.inputFilled,

            isFocused &&
              styles.inputFocused,

            Boolean(error) &&
              styles.inputError,

            isPasswordField &&
              isFilled &&
              styles.inputWithPasswordButton,

            style,
          ]}
        />

        {isPasswordField &&
        isFilled ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={
              isPasswordVisible
                ? 'Скрыть пароль'
                : 'Показать пароль'
            }
            disabled={inputProps.editable === false}
            accessibilityState={{ disabled: inputProps.editable === false, expanded: isPasswordVisible }}
            onPress={() =>
              setIsPasswordVisible(
                (current) =>
                  !current
              )
            }
            hitSlop={8}
            style={
              styles.passwordButton
            }
          >
            <Image
              source={appearance === 'recovery'
                ? require('../../../../assets/auth/recovery-show-password.svg')
                : require('../../../../assets/landing/show-password.svg')}
              style={
                styles.passwordIcon
              }
              contentFit="contain"
            />
          </Pressable>
        ) : null}
      </View>

      {error || hint ? (
        <Text accessibilityRole={error ? 'alert' : undefined}
          style={[styles.hint, Boolean(error) && styles.errorText]}>
          {error || hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 6,
  },

  inputWrapper: {
    position: 'relative',
    width: '100%',
  },

  input: {
    width: '100%',
    height: 48,

    paddingHorizontal: 16,

    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,

    backgroundColor: '#f1f1f1',
    color: '#191919',

    fontFamily: 'Roboto_400Regular',
    fontSize: 16,

    includeFontPadding: false,
  },

  inputFilled: {
    paddingTop: 16,
    paddingBottom: 2,
  },

  inputFocused: {
    borderColor: '#000000',
  },

  inputError: {
    borderColor: '#d92d20',
  },

  inputWithPasswordButton: {
    paddingRight: 48,
  },

  label: {
    position: 'absolute',

    top: 6,
    left: 16,

    zIndex: 2,

    color: '#808080',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,

    includeFontPadding: false,
  },

  passwordButton: {
    position: 'absolute',

    top: 12,
    right: 12,

    width: 24,
    height: 24,

    alignItems: 'center',
    justifyContent: 'center',
  },

  passwordIcon: {
    width: 16,
    height: 16,
  },

  errorText: {
    color: '#d92d20',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,

    includeFontPadding: false,
  },
  hint: {
    color: '#808080', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18,
  },
  recoveryPlaceholder: { fontSize: 18 },
});
