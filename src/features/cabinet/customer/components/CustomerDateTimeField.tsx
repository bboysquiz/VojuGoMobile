import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { Image } from 'expo-image';
import { useState } from 'react';
import { Keyboard, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { AppModal } from '../../../../components/app-modal';

import { CustomerActionButton } from './CustomerUi';

export function CustomerDateTimeField({ value, disabled, onChange }: { value: Date | null; disabled?: boolean; onChange: (value: Date) => void }) {
  const [mode, setMode] = useState<'date' | 'time' | null>(null);
  const [draft, setDraft] = useState(new Date());

  function open(nextMode: 'date' | 'time') {
    Keyboard.dismiss();
    const date = value ? new Date(value) : new Date();
    if (!value) date.setHours(9, 0, 0, 0);
    setDraft(date);
    setMode(nextMode);
  }

  function selected(date: Date) {
    const result = new Date(draft);
    if (mode === 'date') result.setFullYear(date.getFullYear(), date.getMonth(), date.getDate());
    else result.setHours(date.getHours(), date.getMinutes(), 0, 0);
    setDraft(result);
    if (Platform.OS === 'android') { onChange(result); setMode(null); }
  }

  const picker = mode ? <DateTimePicker value={draft} mode={mode} presentation="dialog" is24Hour locale="ru_RU"
    onValueChange={(_, date) => selected(date)} onDismiss={() => setMode(null)} positiveButton={{ label: 'Выбрать' }} negativeButton={{ label: 'Отмена' }} /> : null;

  return (
    <>
      <View style={styles.row}>
        <Pressable accessibilityRole="button" accessibilityLabel="Дата подачи техники" disabled={disabled} onPress={() => open('date')} style={styles.field}>
          <Text style={styles.value} numberOfLines={2}>{value ? value.toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Дата'}</Text>
          <Image source={require('../../../../../assets/cabinet/chevron.svg')} style={styles.chevron} contentFit="contain" accessible={false} />
        </Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Время подачи техники" disabled={disabled} onPress={() => open('time')} style={styles.field}>
          <View style={styles.timeText}><Text style={styles.label}>Время</Text><Text style={styles.value}>{value ? value.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }) : '09:00'}</Text></View>
          <Image source={require('../../../../../assets/cabinet/chevron.svg')} style={styles.chevron} contentFit="contain" accessible={false} />
        </Pressable>
      </View>
      {Platform.OS === 'android' ? picker : (
        <AppModal visible={mode !== null} onRequestClose={() => setMode(null)} contentContainerStyle={styles.dialog}>
            <Text style={styles.title}>{mode === 'date' ? 'Дата подачи техники' : 'Время подачи техники'}</Text>
            {picker}
            <CustomerActionButton onPress={() => { onChange(draft); setMode(null); }}>Выбрать</CustomerActionButton>
            <CustomerActionButton outline onPress={() => setMode(null)}>Отмена</CustomerActionButton>
        </AppModal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 16 },
  field: { flex: 1, minWidth: 0, minHeight: 56, paddingVertical: 8, paddingHorizontal: 15, borderWidth: 1, borderColor: '#c5c4bc', borderRadius: 12, backgroundColor: '#f3f3f3', flexDirection: 'row', alignItems: 'center', gap: 6 },
  value: { flexShrink: 1, color: '#191919', fontFamily: 'Roboto_400Regular', fontSize: 16, lineHeight: 20 },
  label: { color: '#808080', fontFamily: 'Roboto_400Regular', fontSize: 12, lineHeight: 16 },
  timeText: { flex: 1, gap: 4 },
  chevron: { marginLeft: 'auto', width: 8, height: 14, transform: [{ rotate: '90deg' }] },
  dialog: { padding: 16, gap: 16, borderRadius: 16, backgroundColor: '#ffffff' },
  title: { color: '#191919', fontFamily: 'Roboto_500Medium', fontSize: 20, lineHeight: 24 },
});
