import {
  useRef,
  useState,
} from 'react';

import {
  StyleSheet,
  Text,
  TextInput,
  type NativeSyntheticEvent,
  type TextInputKeyPressEventData,
  View,
} from 'react-native';

interface AuthCodeInputProps {
  value: string;
  onChange: (value: string) => void;
  onComplete?: (value: string) => void;
  error?: string;
  disabled?: boolean;
  length?: number;
}

export function AuthCodeInput({
  value,
  onChange,
  onComplete,
  error = '',
  disabled = false,
  length = 4,
}: AuthCodeInputProps) {
  const inputs = useRef<Array<TextInput | null>>([]);
  const [focusedIndex, setFocusedIndex] =
    useState<number | null>(null);

  function focusInput(index: number) {
    const safeIndex = Math.max(
      0,
      Math.min(index, length - 1)
    );

    inputs.current[safeIndex]?.focus();
  }

  function updateCode(
    incomingValue: string,
    startIndex: number
  ) {
    const digits = incomingValue.replace(
      /\D/g,
      ''
    );

    const current = Array.from(
      { length },
      (_, index) => value[index] ?? ''
    );

    if (!digits) {
      current[startIndex] = '';

      onChange(current.join(''));
      return;
    }

    const availableDigits = digits.slice(
      0,
      length - startIndex
    );

    availableDigits.split('').forEach(
      (digit, offset) => {
        current[startIndex + offset] = digit;
      }
    );

    const nextCode = current.join('').slice(
      0,
      length
    );

    onChange(nextCode);

    if (nextCode.length === length) {
      inputs.current[length - 1]?.blur();
      onComplete?.(nextCode);
      return;
    }

    focusInput(
      startIndex + availableDigits.length
    );
  }

  function handleKeyPress(
    event: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) {
    if (
      event.nativeEvent.key === 'Backspace' &&
      !value[index] &&
      index > 0
    ) {
      const current = Array.from(
        { length },
        (_, currentIndex) =>
          value[currentIndex] ?? ''
      );

      current[index - 1] = '';

      onChange(current.join(''));
      focusInput(index - 1);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.controls}>
        {Array.from({ length }).map(
          (_, index) => (
            <TextInput
              key={index}
              ref={(element) => {
                inputs.current[index] =
                  element;
              }}
              value={value[index] ?? ''}
              editable={!disabled}
              keyboardType="number-pad"
              textContentType={
                index === 0
                  ? 'oneTimeCode'
                  : 'none'
              }
              maxLength={length}
              selectTextOnFocus
              caretHidden
              onFocus={() =>
                setFocusedIndex(index)
              }
              onBlur={() =>
                setFocusedIndex((current) =>
                  current === index
                    ? null
                    : current
                )
              }
              onChangeText={(text) =>
                updateCode(text, index)
              }
              onKeyPress={(event) =>
                handleKeyPress(event, index)
              }
              style={[
                styles.input,
                focusedIndex === index &&
                  styles.inputFocused,
                Boolean(error) &&
                  styles.inputError,
              ]}
            />
          )
        )}
      </View>

      {error ? (
        <Text style={styles.error}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    gap: 8,
  },

  controls: {
    width: '100%',

    flexDirection: 'row',
    justifyContent: 'center',

    gap: 12,
  },

  input: {
    width: 48,
    height: 48,

    padding: 0,

    borderWidth: 1,
    borderColor: 'transparent',
    borderRadius: 12,

    backgroundColor: '#f1f1f1',
    color: '#191919',

    fontFamily: 'Roboto_500Medium',
    fontSize: 20,
    lineHeight: 24,

    textAlign: 'center',

    includeFontPadding: false,
  },

  inputFocused: {
    borderColor: '#000000',
  },

  inputError: {
    borderColor: '#d92d20',
  },

  error: {
    color: '#d92d20',

    fontFamily: 'Roboto_400Regular',
    fontSize: 12,
    lineHeight: 16,

    textAlign: 'center',

    includeFontPadding: false,
  },
});