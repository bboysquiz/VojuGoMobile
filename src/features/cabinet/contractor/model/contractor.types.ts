import type { VehicleType, VehicleProperties, VehiclePropertyValue } from '../../model/vehicle';
export { getVehicleTypeLabel, getVehiclePropertyLabel, formatVehiclePropertyValue, getVehiclePropertyEntries } from '../../model/vehicle';
export type { VehicleType, VehicleProperties, VehiclePropertyValue } from '../../model/vehicle';

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
