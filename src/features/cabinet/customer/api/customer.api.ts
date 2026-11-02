import { ApiError, apiRequest } from '../../../../shared/api/http';
import { getSelf } from '../../../auth/api/auth.api';
import type { CustomerOrderPayload, VehicleTypeOption } from '../model/customer-order-form';
import {
  getVehicleTypeLabel,
  type CustomerHistory,
  type CustomerHistoryOrder,
  type OrderReview,
  type VehicleType,
  type ApiVehicle,
  type ContractorRatingSummary,
  type CustomerDashboard,
  type CustomerOrder,
  type CustomerOrderList,
  type CustomerOrderResponse,
  type CustomerOrderResponseList,
  type CustomerOrderStatistics,
  type CustomerOrderStatus,
  type OrderReviewFields,
} from '../model/customer.types';

const ORDERS_PAGE_LIMIT = 100;

async function getAllCustomerOrders(
  statuses: CustomerOrderStatus[],
): Promise<Omit<CustomerOrder, 'responses'>[]> {
  const orders: Omit<CustomerOrder, 'responses'>[] = [];
  let cursor: string | undefined;

  do {
    const params = new URLSearchParams();

    statuses.forEach((status) => params.append('status', status));
    params.set('limit', String(ORDERS_PAGE_LIMIT));

    if (cursor !== undefined) {
      params.set('cursor', cursor);
    }

    const page = await apiRequest<CustomerOrderList>(
      '/my-orders?' + params.toString(),
      { method: 'GET' },
    );

    orders.push(...page.items);
    cursor = page.has_more ? page.next_cursor : undefined;

    if (page.has_more && !cursor) {
      throw new Error('Сервер не вернул курсор следующей страницы заявок');
    }
  } while (cursor !== undefined);

  return orders;
}

export async function getCustomerOrderResponses(
  orderId: string,
): Promise<CustomerOrderResponse[]> {
  const response = await apiRequest<CustomerOrderResponseList>(
    '/orders/' + encodeURIComponent(orderId) + '/responses',
    { method: 'GET' },
  );

  return Promise.all(
    response.items.map(async (item) => {
      const vehiclePromise = item.vehicle_id
        ? apiRequest<ApiVehicle>(
            '/vehicles/' + encodeURIComponent(item.vehicle_id),
            { method: 'GET' },
          )
        : Promise.resolve<ApiVehicle | undefined>(undefined);

      const ratingPromise = apiRequest<ContractorRatingSummary>(
        '/contractors/' + encodeURIComponent(item.contractor_id) + '/rating',
        { method: 'GET' },
      );

      const [vehicleResult, ratingResult] = await Promise.allSettled([
        vehiclePromise,
        ratingPromise,
      ]);

      return {
        ...item,
        vehicle:
          vehicleResult.status === 'fulfilled'
            ? vehicleResult.value
            : undefined,
        contractor_rating:
          ratingResult.status === 'fulfilled'
            ? ratingResult.value
            : undefined,
      };
    }),
  );
}

export async function getCustomerDashboard(): Promise<CustomerDashboard> {
  const [activeOrders, statistics, completedOrders] = await Promise.all([
    getAllCustomerOrders(['OPEN', 'RESPONDED', 'ASSIGNED']),
    apiRequest<CustomerOrderStatistics>('/my-orders/statistics', {
      method: 'GET',
    }),
    getAllCustomerOrders(['COMPLETED']),
  ]);

  const orders = await Promise.all(
    activeOrders.map(async (order): Promise<CustomerOrder> => {
      const responses = await getCustomerOrderResponses(order.id);
      return { ...order, responses };
    }),
  );

  const ordersWithoutResponses = orders.filter(
    (order) => order.status === 'OPEN' && order.responses.length === 0,
  ).length;

  const ordersWithResponses = orders.filter(
    (order) =>
      order.status === 'RESPONDED' ||
      (order.status !== 'ASSIGNED' && order.responses.length > 0),
  ).length;

  return {
    summary: {
      active_orders: orders.length,
      orders_without_responses: ordersWithoutResponses,
      orders_with_responses: ordersWithResponses,
      completed_orders: completedOrders.length,
      average_rating: statistics.average_rating,
    },
    orders,
  };
}

export function chooseCustomerOrderResponse(
  orderId: string,
  responseId: string,
) {
  return apiRequest<CustomerOrderResponse>(
    '/orders/' +
      encodeURIComponent(orderId) +
      '/responses/' +
      encodeURIComponent(responseId) +
      '/choose',
    { method: 'POST' },
  );
}

export function getCustomerOrder(orderId: string) {
  return apiRequest<CustomerOrder>(
    '/orders/' + encodeURIComponent(orderId),
    { method: 'GET' },
  );
}

export function deleteCustomerOrder(orderId: string) {
  return apiRequest<CustomerOrder>(
    '/orders/' + encodeURIComponent(orderId),
    { method: 'DELETE' },
  );
}

export function cancelCustomerOrder(orderId: string) {
  return apiRequest<CustomerOrder>(
    '/orders/' + encodeURIComponent(orderId),
    { method: 'PATCH' },
  );
}

export function releaseOrderAssignment(orderId: string) {
  return apiRequest<CustomerOrder>(
    '/orders/' + encodeURIComponent(orderId) + '/unassign',
    { method: 'PATCH' },
  );
}

export function completeCustomerOrder(
  orderId: string,
  feedback?: OrderReviewFields,
) {
  const hasRating = feedback?.rating !== undefined;
  const comment = feedback?.comment?.trim();
  const hasComment = Boolean(comment);

  return apiRequest<CustomerOrder>(
    '/orders/' + encodeURIComponent(orderId) + '/complete',
    {
      method: 'PATCH',
      body: {
        unset: !hasRating && !hasComment,
        ...(hasRating ? { rating: feedback?.rating } : {}),
        ...(hasComment ? { comment } : {}),
      },
    },
  );
}

export async function getCustomerVehicleTypes(): Promise<VehicleTypeOption[]> {
  const response = await apiRequest<{ items: { id: string }[] }>('/vehicle-types', { method: 'GET' });
  const knownTypes: VehicleType[] = ['crane_truck', 'backhoe_loader', 'dump_truck', 'tractor', 'aerial_platform', 'mini_loader', 'tow_truck'];
  return knownTypes.filter((type) => response.items.some(({ id }) => id === type))
    .map((value) => ({ value, label: getVehicleTypeLabel(value) }));
}

export function createCustomerOrder(payload: CustomerOrderPayload) {
  return apiRequest<CustomerOrder>('/orders', { method: 'POST', body: payload });
}

export function updateCustomerOrder(orderId: string, payload: CustomerOrderPayload) {
  return apiRequest<CustomerOrder>('/orders/' + encodeURIComponent(orderId), { method: 'PUT', body: payload });
}

export async function ensureCustomerOrderEditable(orderId: string) {
  const [order, responses] = await Promise.all([
    getCustomerOrder(orderId),
    apiRequest<CustomerOrderResponseList>('/orders/' + encodeURIComponent(orderId) + '/responses', { method: 'GET' }),
  ]);
  if (order.status !== 'OPEN' || responses.items.length > 0) {
    throw new Error('На заявку уже откликнулись — редактирование недоступно');
  }
  return order;
}

export function saveCustomerOrderReview(orderId: string, fields: OrderReviewFields, existing: boolean) {
  return apiRequest<OrderReview>('/orders/' + encodeURIComponent(orderId) + '/review', {
    method: existing ? 'PUT' : 'POST', body: fields,
  });
}

async function getOrderReview(orderId: string): Promise<OrderReview | null> {
  try {
    return await apiRequest<OrderReview>('/orders/' + encodeURIComponent(orderId) + '/review', { method: 'GET' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

async function getContractorHistoryNames(contractorId: string) {
  const orders: { id: string; contractor_name?: string | null }[] = [];
  let cursor: string | undefined;
  do {
    const params = new URLSearchParams({ limit: '100' });
    if (cursor) params.set('cursor', cursor);
    const page = await apiRequest<{
      items: typeof orders; has_more: boolean; next_cursor?: string;
    }>('/contractors/' + encodeURIComponent(contractorId) + '/orders?' + params, { method: 'GET' });
    orders.push(...page.items);
    cursor = page.has_more ? page.next_cursor : undefined;
    if (page.has_more && !cursor) throw new Error('Сервер не вернул курсор истории исполнителя');
  } while (cursor);
  return orders;
}

export async function getCustomerHistory(): Promise<CustomerHistory> {
  const [orders, user] = await Promise.all([getAllCustomerOrders(['COMPLETED', 'CANCELLED']), getSelf()]);
  const contractorRequests = new Map<string, ReturnType<typeof getContractorHistoryNames>>();
  const enriched = new Array<CustomerHistoryOrder>(orders.length);
  let next = 0;

  // Bound simultaneous requests when the customer's history contains many orders.
  async function worker() {
    while (next < orders.length) {
      const index = next++;
      const order = orders[index];
      const [responseList, review] = await Promise.all([
        apiRequest<CustomerOrderResponseList>('/orders/' + encodeURIComponent(order.id) + '/responses', { method: 'GET' }),
        order.status === 'COMPLETED' ? getOrderReview(order.id) : Promise.resolve(null),
      ]);
      const contractorId = order.contractor_id || review?.reviewee_id;
      const chosen = contractorId
        ? responseList.items.find((response) => response.contractor_id === contractorId)
        : responseList.items.find((response) => response.status === 'chosen' || response.status === 'completed');
      let contractorName = chosen?.contractor_name?.trim() || chosen?.contractor_company_name?.trim() || null;
      if (!contractorName && contractorId && order.status === 'COMPLETED') {
        let request = contractorRequests.get(contractorId);
        if (!request) {
          request = getContractorHistoryNames(contractorId);
          contractorRequests.set(contractorId, request);
        }
        contractorName = (await request).find(({ id }) => id === order.id)?.contractor_name?.trim() || null;
      }
      enriched[index] = { ...order, contractor_name: contractorName, reviewer_name: user.name || user.company_name || 'Заказчик', review };
    }
  }
  await Promise.all(Array.from({ length: Math.min(6, orders.length) }, worker));
  const completed = enriched.filter(({ status }) => status === 'COMPLETED');
  const cancelled = enriched.filter(({ status }) => status === 'CANCELLED');
  return {
    summary: { completed_orders: completed.length, cancelled_orders: cancelled.length, ratings_count: completed.filter(({ review }) => review?.rating != null).length },
    completed_orders: completed, cancelled_orders: cancelled,
  };
}
