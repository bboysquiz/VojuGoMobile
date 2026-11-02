import type { VehicleProperties } from '../../model/vehicle';
export { getVehicleTypeLabel, getVehiclePropertyLabel, formatVehiclePropertyValue, getVehiclePropertyEntries } from '../../model/vehicle';
export type { VehicleType, VehicleProperties, VehiclePropertyValue } from '../../model/vehicle';

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

export interface OrderReview {
  id: string;
  order_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number | null;
  comment: string | null;
  created_at: string;
}

export interface CustomerHistoryOrder extends Omit<CustomerOrder, 'responses'> {
  contractor_name: string | null;
  reviewer_name: string;
  review: OrderReview | null;
}

export interface CustomerHistory {
  summary: { completed_orders: number; cancelled_orders: number; ratings_count: number };
  completed_orders: CustomerHistoryOrder[];
  cancelled_orders: CustomerHistoryOrder[];
}
