import type { CustomerOrder, CustomerOrderPriceUnit, VehicleProperties, VehicleType } from './customer.types';

export interface VehicleTypeOption {
  value: VehicleType;
  label: string;
}

export interface CustomerOrderFormValue {
  title: string;
  vehicle_properties: VehicleProperties | { type: '' };
  needed_at: Date | null;
  address: string;
  price: string;
  price_unit: CustomerOrderPriceUnit;
  comment: string;
}

export interface CustomerOrderPayload {
  title: string;
  vehicle_properties: VehicleProperties;
  needed_at: string;
  address: string;
  price: number;
  price_unit: CustomerOrderPriceUnit;
  comment: string;
}

export function defaultVehicleProperties(type: VehicleType): VehicleProperties {
  switch (type) {
    case 'crane_truck': return { type, side_capacity: 5, boom_capacity: 3, bed_length: 5 };
    case 'dump_truck': return { type, capacity: 20 };
    case 'backhoe_loader': return { type, auger: false, hydraulic_hammer: false, narrow_bucket: false };
    case 'mini_loader': return { type, brush: false };
    default: return { type };
  }
}

export function initialOrderForm(order?: CustomerOrder, type?: VehicleType): CustomerOrderFormValue {
  return {
    title: order?.title ?? '',
    vehicle_properties: order ? { ...order.vehicle_properties } : type ? defaultVehicleProperties(type) : { type: '' },
    needed_at: order ? new Date(order.needed_at) : null,
    address: order?.address ?? '',
    price: order ? String(order.price) : '',
    price_unit: order?.price_unit ?? 'per_hour',
    comment: order?.comment ?? '',
  };
}

export function orderFormError(form: CustomerOrderFormValue): string {
  if (!form.title.trim()) return 'Укажите название заявки';
  if (form.title.trim().length > 50) return 'Название заявки должно быть не длиннее 50 символов';
  if (form.comment.trim().length > 950) return 'Описание заявки должно быть не длиннее 950 символов';
  if (!form.vehicle_properties.type) return 'Выберите тип техники';
  if (!form.address.trim()) return 'Укажите адрес объекта';
  if (!form.needed_at || Number.isNaN(form.needed_at.getTime())) return 'Укажите дату и время подачи техники';
  const price = Number(form.price.replace(',', '.'));
  if (!Number.isFinite(price) || price <= 0) return 'Укажите корректную цену';
  return '';
}

export function orderFormPayload(form: CustomerOrderFormValue): CustomerOrderPayload {
  const error = orderFormError(form);
  if (error) throw new Error(error);
  return {
    title: form.title.trim(),
    vehicle_properties: { ...form.vehicle_properties } as VehicleProperties,
    needed_at: form.needed_at!.toISOString(),
    address: form.address.trim(),
    price: Number(form.price.replace(',', '.')),
    price_unit: form.price_unit,
    comment: form.comment.trim(),
  };
}
