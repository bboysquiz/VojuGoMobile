import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, TextInput, View, type TextInputProps } from 'react-native';
import { AppModal } from '../../../../components/app-modal';

export function CustomerField({ label, style, multiline, ...props }: TextInputProps & { label?: string }) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={[styles.field, multiline && styles.multiline, focused && styles.focused]}>
      {label ? <Text style={styles.label}>{label}</Text> : null}
      <TextInput {...props} accessibilityLabel={props.accessibilityLabel ?? label ?? props.placeholder}
        multiline={multiline} placeholderTextColor="#808080" style={[styles.input, multiline && styles.multilineInput, style]}
        onFocus={(event) => { setFocused(true); props.onFocus?.(event); }}
        onBlur={(event) => { setFocused(false); props.onBlur?.(event); }} />
    </View>
  );
}

export interface CustomerSelectOption { value: string; label: string }

export function CustomerSelect({ label, value, options, disabled, onChange }: {
  label: string; value: string; options: CustomerSelectOption[]; disabled?: boolean; onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Pressable accessibilityRole="button" accessibilityLabel={label + ': ' + (options.find((option) => option.value === value)?.label ?? '')}
        disabled={disabled} onPress={() => { Keyboard.dismiss(); setOpen(true); }} style={[styles.select, disabled && styles.disabled]}>
        <View style={styles.selectText}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.input} numberOfLines={1}>{options.find((option) => option.value === value)?.label ?? 'Выберите'}</Text>
        </View>
        <Image source={require('../../../../../assets/cabinet/chevron.svg')} style={styles.chevron} contentFit="contain" accessible={false} />
      </Pressable>
      <AppModal visible={open} animationType="slide" dismissOnBackdrop onRequestClose={() => setOpen(false)}>
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>{label}</Text>
              <Pressable accessibilityRole="button" accessibilityLabel="Закрыть" hitSlop={8} style={styles.close} onPress={() => setOpen(false)}>
                <Text style={styles.closeText}>×</Text>
              </Pressable>
            </View>
              {options.map((option) => (
                <Pressable key={option.value} accessibilityRole="radio" accessibilityState={{ checked: option.value === value }}
                  onPress={() => { onChange(option.value); setOpen(false); }} style={[styles.option, option.value === value && styles.optionSelected]}>
                  <Text style={styles.optionText}>{option.label}</Text>
                  {option.value === value ? <Text style={styles.optionText}>✓</Text> : null}
                </Pressable>
              ))}
      </AppModal>
    </>
  );
}

export function CustomerCheck({ label, checked, disabled, onChange }: { label: string; checked: boolean; disabled?: boolean; onChange: () => void }) {
  return (
    <Pressable accessibilityRole="checkbox" accessibilityLabel={label} accessibilityState={{ checked, disabled }} disabled={disabled}
      onPress={onChange} style={styles.check}>
      <Image source={checked ? require('../../../../../assets/cabinet/checkbox-checked.svg') : require('../../../../../assets/cabinet/checkbox-unchecked.svg')}
        style={styles.checkIcon} contentFit="contain" accessible={false} />
      <Text style={styles.checkText}>{label}</Text>
    </Pressable>
  );
}

export function CustomerFormSection({ title, children }: { title: string; children: ReactNode }) {
  return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>;
}

export const customerPageStyles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#ffffff' },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  title: { color: '#191919', fontFamily: 'Roboto_500Medium', fontSize: 24, lineHeight: 30 },
  subtitle: { marginTop: 8, color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18 },
  error: { color: '#e0533b', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 20 },
});

const styles = StyleSheet.create({
  field: { minHeight: 56, paddingVertical: 8, paddingHorizontal: 15, borderWidth: 1, borderColor: '#c5c4bc', borderRadius: 12, backgroundColor: '#f3f3f3', justifyContent: 'center', gap: 4 },
  multiline: { minHeight: 80, justifyContent: 'flex-start', paddingVertical: 14 },
  focused: { borderColor: '#191919' },
  label: { color: '#808080', fontFamily: 'Roboto_400Regular', fontSize: 12, lineHeight: 16 },
  input: { padding: 0, color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 16, lineHeight: 20, includeFontPadding: false },
  multilineInput: { minHeight: 48, textAlignVertical: 'top' },
  select: { minHeight: 56, paddingVertical: 8, paddingHorizontal: 15, borderWidth: 1, borderColor: '#c5c4bc', borderRadius: 12, backgroundColor: '#f3f3f3', flexDirection: 'row', alignItems: 'center', gap: 8 },
  selectText: { flex: 1, gap: 4 },
  chevron: { width: 8, height: 14, transform: [{ rotate: '90deg' }] },
  sheetHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 16 },
  sheetTitle: { flex: 1, color: '#191919', fontFamily: 'Roboto_500Medium', fontSize: 20, lineHeight: 24 },
  close: { minWidth: 44, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  closeText: { color: '#191919', fontSize: 28 },
  option: { minHeight: 48, padding: 14, borderRadius: 8, flexDirection: 'row', gap: 8, justifyContent: 'space-between' },
  optionSelected: { backgroundColor: '#fff4b4' },
  optionText: { color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 16, lineHeight: 20 },
  check: { minHeight: 44, flexDirection: 'row', alignItems: 'center', gap: 10 },
  checkIcon: { width: 20, height: 20 },
  checkText: { color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18 },
  section: { gap: 16 },
  sectionTitle: { color: '#191919', fontFamily: 'Roboto_500Medium', fontSize: 20, lineHeight: 24 },
  disabled: { opacity: 0.5 },
});
