export type VehicleType =
  | 'crane_truck'
  | 'backhoe_loader'
  | 'tractor'
  | 'dump_truck'
  | 'aerial_platform'
  | 'tow_truck'
  | 'mini_loader';

export interface VehicleProperties {
  type: VehicleType;
  [key: string]: VehicleType | string | number | boolean | undefined;
}

export interface ApiVehicle {
  id: string;
  model: string;
  license_plate: string;
  properties: VehicleProperties;
  owner_id?: string;
}

export type CustomerOrderStatus =
  | 'OPEN'
  | 'RESPONDED'
  | 'ASSIGNED'
  | 'COMPLETED'
  | 'CANCELLED';

export type CustomerOrderResponseStatus =
  | 'pending'
  | 'chosen'
  | 'completed'
  | 'not_chosen';

export type CustomerOrderPriceUnit = 'per_hour' | 'per_order';

export interface ContractorRatingSummary {
  completed_orders_count: number;
  average_rating: number;
}

export interface CustomerOrderResponse {
  id: string;
  order_id: string;
  contractor_id: string;
  contractor_name?: string | null;
  contractor_company_name?: string | null;
  contractor_phone?: string | null;
  vehicle_id?: string;
  status: CustomerOrderResponseStatus;
  created_at: string;
  vehicle?: ApiVehicle;
  contractor_rating?: ContractorRatingSummary;
}

export interface CustomerOrder {
  id: string;
  title: string;
  customer_id: string;
  address: string;
  needed_at: string;
  price: number;
  price_unit: CustomerOrderPriceUnit;
  status: CustomerOrderStatus;
  created_at: string;
  comment?: string;
  contractor_id?: string;
  responses: CustomerOrderResponse[];
  vehicle_properties: VehicleProperties;
}

export interface CustomerOrderList {
  items: Omit<CustomerOrder, 'responses'>[];
  has_more: boolean;
  next_cursor?: string;
}

export interface CustomerOrderResponseList {
  items: CustomerOrderResponse[];
}

export interface CustomerOrderStatistics {
  orders_without_responses: number;
  orders_with_responses: number;
  average_rating: number;
}

export interface CustomerDashboardSummary {
  active_orders: number;
  orders_without_responses: number;
  orders_with_responses: number;
  completed_orders: number;
  average_rating: number;
}

export interface CustomerDashboard {
  summary: CustomerDashboardSummary;
  orders: CustomerOrder[];
}

export interface OrderReviewFields {
  rating?: number;
  comment?: string;
}

export function getVehicleTypeLabel(type: string): string {
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

export function formatVehiclePropertyValue(name: string, value: unknown): string {
  if (typeof value === 'boolean') {
    return value ? 'Есть' : 'Нет';
  }

  switch (name) {
    case 'side_capacity':
    case 'boom_capacity':
      return String(value) + ' т';
    case 'bed_length':
      return String(value) + ' м';
    case 'capacity':
      return String(value) + ' м³';
    default:
      return String(value);
  }
}

export function getVehiclePropertyEntries(properties: VehicleProperties) {
  return Object.entries(properties).filter(
    ([name, value]) =>
      name !== 'type' &&
      value !== undefined &&
      value !== null,
  );
}
