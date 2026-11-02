import { Image } from 'expo-image';
import { useState } from 'react';
import { Keyboard, Pressable, StyleSheet, Text, View } from 'react-native';
import { ResponsiveGrid } from '../../../../components/responsive-grid';

import { defaultVehicleProperties, orderFormError, type CustomerOrderFormValue, type VehicleTypeOption } from '../model/customer-order-form';
import type { VehicleProperties, VehicleType } from '../model/customer.types';
import { CustomerDateTimeField } from './CustomerDateTimeField';
import { CustomerCheck, CustomerField, CustomerFormSection, CustomerSelect, customerPageStyles } from './CustomerFormControls';
import { CustomerActionButton } from './CustomerUi';

const vehicleImages: Record<VehicleType, number> = {
  crane_truck: require('../../../../../assets/cabinet/vehicle-crane.png'),
  backhoe_loader: require('../../../../../assets/cabinet/vehicle-backhoe.png'),
  dump_truck: require('../../../../../assets/cabinet/vehicle-dump.png'),
  tractor: require('../../../../../assets/cabinet/vehicle-tractor.png'),
  aerial_platform: require('../../../../../assets/cabinet/vehicle-lift.png'),
  mini_loader: require('../../../../../assets/cabinet/vehicle-mini.png'),
  tow_truck: require('../../../../../assets/cabinet/vehicle-tow.png'),
};

export function CustomerOrderForm({ initialValue, vehicleTypes, editing = false, saving = false, error = '', onSubmit }: {
  initialValue: CustomerOrderFormValue; vehicleTypes: VehicleTypeOption[]; editing?: boolean; saving?: boolean; error?: string;
  onSubmit: (value: CustomerOrderFormValue) => void;
}) {
  const [form, setForm] = useState(() => ({ ...initialValue, vehicle_properties: { ...initialValue.vehicle_properties } }));
  const [validation, setValidation] = useState('');
  const type = form.vehicle_properties.type;

  function update<K extends keyof CustomerOrderFormValue>(name: K, value: CustomerOrderFormValue[K]) {
    setForm((current) => ({ ...current, [name]: value }));
    setValidation('');
  }
  function property(name: string, value: number | boolean) {
    if (type) update('vehicle_properties', { ...form.vehicle_properties, [name]: value } as VehicleProperties);
  }
  function numeric(name: string, label: string, values: number[]) {
    return <CustomerSelect label={label} value={String((form.vehicle_properties as VehicleProperties)[name])} disabled={saving}
      options={values.map((value) => ({ value: String(value), label: String(value) }))} onChange={(value) => property(name, Number(value))} />;
  }
  function submit() {
    Keyboard.dismiss();
    const message = orderFormError(form);
    setValidation(message);
    if (!message && !saving) onSubmit(form);
  }

  return (
    <View style={styles.form}>
      <CustomerFormSection title="Что нужно сделать">
        <CustomerField value={form.title} editable={!saving} onChangeText={(value) => update('title', value)} maxLength={50} multiline
          placeholder="Например, требуется погрузить 20 мешков цемента" accessibilityLabel="Название заявки" />
      </CustomerFormSection>
      <CustomerFormSection title="Какая техника нужна">
        <ResponsiveGrid minColumnWidth={100} maxColumns={6} gap={12}>
          {vehicleTypes.map((option) => (
            <Pressable key={option.value} accessibilityRole="radio" accessibilityLabel={option.label} accessibilityState={{ checked: type === option.value, disabled: saving }}
              disabled={saving} onPress={() => update('vehicle_properties', defaultVehicleProperties(option.value))}
              style={[styles.vehicle, type === option.value && styles.vehicleSelected]}>
              <Image source={vehicleImages[option.value]} style={styles.vehicleImage} contentFit="contain" accessible={false} />
              <Text style={styles.vehicleLabel} numberOfLines={option.label.includes('-') ? 2 : 1} adjustsFontSizeToFit minimumFontScale={0.8}>{option.label.replace('-', '-\n')}</Text>
            </Pressable>
          ))}
        </ResponsiveGrid>
        {type === 'crane_truck' ? <ResponsiveGrid minColumnWidth={180} maxColumns={3}>
          {numeric('side_capacity', 'Грузоподъёмность борта, т', [5, 8, 10, 12, 15, 20])}
          {numeric('boom_capacity', 'Грузоподъёмность стрелы, т', [3, 5, 7, 9])}
          {numeric('bed_length', 'Длина борта, м', [5, 6, 7, 8, 9, 12, 14])}
        </ResponsiveGrid> : null}
        {type === 'dump_truck' ? numeric('capacity', 'Объём кузова, м³', [20, 25, 35, 45]) : null}
        {type === 'backhoe_loader' || type === 'mini_loader' ? <View>
          {(type === 'mini_loader' ? [['brush', 'Щётка']] : [['auger', 'Шнек'], ['hydraulic_hammer', 'Гидромолот'], ['narrow_bucket', 'Узкий ковш']]).map(([name, label]) => (
            <CustomerCheck key={name} label={label} disabled={saving} checked={Boolean((form.vehicle_properties as VehicleProperties)[name])}
              onChange={() => property(name, !(form.vehicle_properties as VehicleProperties)[name])} />
          ))}
        </View> : null}
      </CustomerFormSection>
      <ResponsiveGrid>
      <CustomerFormSection title="Где и когда">
        <CustomerField value={form.address} editable={!saving} onChangeText={(value) => update('address', value)}
          placeholder="Адрес объекта (город, улица, дом)" accessibilityLabel="Адрес объекта" />
        <CustomerDateTimeField value={form.needed_at} disabled={saving} onChange={(value) => update('needed_at', value)} />
      </CustomerFormSection>
      <CustomerFormSection title="Укажите стоимость">
        <View style={styles.priceRow}>
          <View style={styles.priceField}><CustomerField value={form.price} label="Ваша цена, ₽" editable={!saving} keyboardType="decimal-pad"
            onChangeText={(value) => update('price', value)} placeholder="0" maxLength={14} /></View>
          <View style={styles.priceField}><CustomerSelect label="За что цена" value={form.price_unit} disabled={saving}
            options={[{ value: 'per_hour', label: 'За час' }, { value: 'per_order', label: 'За заказ' }]}
            onChange={(value) => update('price_unit', value as CustomerOrderFormValue['price_unit'])} /></View>
        </View>
      </CustomerFormSection>
      </ResponsiveGrid>
      <CustomerFormSection title="Дополнительная информация">
        <CustomerField value={form.comment} editable={!saving} onChangeText={(value) => update('comment', value)} multiline maxLength={950}
          placeholder="Комментарий для исполнителя (Что нужно сделать, особенности подъезда к объекту)" accessibilityLabel="Комментарий для исполнителя" />
      </CustomerFormSection>
      <Text style={styles.hint}>Ваш номер телефона не показывается в заявке. Он станет виден исполнителю только когда вы его выберете.</Text>
      {validation || error ? <Text accessibilityRole="alert" style={customerPageStyles.error}>{validation || error}</Text> : null}
      <CustomerActionButton disabled={saving || vehicleTypes.length === 0} onPress={submit}>
        {saving ? editing ? 'Сохраняем…' : 'Размещаем…' : editing ? 'Сохранить изменения' : 'Разместить заявку'}
      </CustomerActionButton>
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 16 },
  vehicle: { width: '100%', minHeight: 122, padding: 8, borderWidth: 1, borderColor: '#c5c4bc', borderRadius: 12, backgroundColor: '#ffffff', justifyContent: 'center', alignItems: 'center', gap: 8 },
  vehicleSelected: { borderColor: '#ffdc3c', borderWidth: 2, padding: 7 },
  vehicleImage: { width: '100%', height: 58 },
  vehicleLabel: { width: '100%', minHeight: 32, textAlign: 'center', color: '#191919', fontFamily: 'Roboto_500Medium', fontSize: 12, lineHeight: 16, includeFontPadding: false },
  priceRow: { flexDirection: 'row', gap: 16 },
  priceField: { flex: 1, minWidth: 0 },
  hint: { color: '#808080', fontFamily: 'Roboto_400Regular', fontSize: 14, lineHeight: 18 },
});
