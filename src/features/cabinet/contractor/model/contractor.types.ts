export type VehicleType =
  | 'crane_truck'
  | 'backhoe_loader'
  | 'tractor'
  | 'dump_truck'
  | 'aerial_platform'
  | 'tow_truck'
  | 'mini_loader';

export type VehiclePropertyValue =
  | string
  | number
  | boolean
  | undefined;

export interface VehicleProperties {
  type: VehicleType;

  [key: string]:
    | VehicleType
    | VehiclePropertyValue;
}

export interface VehiclePropertiesFormValue {
  type: VehicleType | '';

  [key: string]:
    | VehicleType
    | ''
    | VehiclePropertyValue;
}

export interface ContractorVehicle {
  id: string;
  model: string;
  license_plate: string;
  properties: VehicleProperties;
  owner_id?: string;
}

export interface ContractorVehicleFormValue {
  model: string;
  license_plate: string;
  properties: VehiclePropertiesFormValue;
}

export interface CreateContractorVehicleRequest {
  model: string;
  license_plate: string;
  properties: VehicleProperties;
}

export interface VehicleTypeOption {
  value: VehicleType;
  label: string;
}

export type ContractorOrderStatus =
  | 'OPEN'
  | 'RESPONDED'
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'CANCELLED';

export type ContractorOrderResponseStatus =
  | 'pending'
  | 'chosen'
  | 'not_chosen';

export type ContractorPriceUnit =
  | 'per_hour'
  | 'per_order';

export interface ContractorOrder {
  id: string;
  title: string;
  customer_id: string;
  customer_name?: string | null;
  address: string;
  needed_at: string;
  price: number;
  price_unit: ContractorPriceUnit;
  status: ContractorOrderStatus;
  created_at: string;
  comment?: string;
  contractor_id?: string;
  vehicle_properties: VehicleProperties;
}

export interface ContractorOrderResponse {
  id: string;
  order_id: string;
  contractor_id: string;

  contractor_name?: string | null;
  contractor_company_name?: string | null;
  contractor_phone?: string | null;

  vehicle_id?: string;

  status: ContractorOrderResponseStatus;
  created_at: string;
}

export interface ContractorResponseEntry {
  order: ContractorOrder;
  response: ContractorOrderResponse;
}

export interface OrderCustomerContact {
  name: string;
  phone: string;
}

export interface ContractorRating {
  completed_orders_count: number;
  average_rating: number;
}

export interface ContractorCompletedOrder
  extends ContractorOrder {
  rating?: number | null;
  review_comment?: string | null;
}

export function createDefaultVehicleProperties(
  type: VehicleType
): VehicleProperties {
  switch (type) {
    case 'crane_truck':
      return {
        type,
        side_capacity: 5,
        boom_capacity: 3,
        bed_length: 5,
      };

    case 'dump_truck':
      return {
        type,
        capacity: 20,
      };

    case 'backhoe_loader':
      return {
        type,
        auger: false,
        hydraulic_hammer: false,
        narrow_bucket: false,
      };

    case 'mini_loader':
      return {
        type,
        brush: false,
      };

    case 'tractor':
    case 'aerial_platform':
    case 'tow_truck':
      return {
        type,
      };
  }
}

export function getVehicleTypeLabel(
  type: string
): string {
  const labels: Record<string, string> = {
    crane_truck: 'Манипулятор',
    backhoe_loader: 'Экскаватор-погрузчик',
    tractor: 'Трактор',
    dump_truck: 'Самосвал',
    aerial_platform: 'Автовышка',
    tow_truck: 'Эвакуатор',
    mini_loader: 'Мини-погрузчик',
  };

  return labels[type] ?? type;
}

export function getVehiclePropertyLabel(
  name: string
): string {
  const labels: Record<string, string> = {
    side_capacity:
      'Грузоподъёмность борта',
    boom_capacity:
      'Грузоподъёмность стрелы',
    bed_length: 'Длина борта',
    capacity: 'Объём кузова',
    auger: 'Шнек',
    hydraulic_hammer: 'Гидромолот',
    narrow_bucket: 'Узкий ковш',
    brush: 'Щётка',
  };

  return labels[name] ?? name;
}

export function formatVehiclePropertyValue(
  name: string,
  value: unknown
): string {
  if (typeof value === 'boolean') {
    return value ? 'Есть' : 'Нет';
  }

  switch (name) {
    case 'side_capacity':
    case 'boom_capacity':
      return `${String(value)} т`;

    case 'bed_length':
      return `${String(value)} м`;

    case 'capacity':
      return `${String(value)} м³`;

    default:
      return String(value);
  }
}

export function getVehiclePropertyEntries(
  properties: VehicleProperties
) {
  return Object.entries(properties).filter(
    ([name, value]) =>
      name !== 'type' &&
      value !== undefined &&
      value !== null
  );
}