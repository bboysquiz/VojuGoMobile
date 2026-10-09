import { apiRequest } from '../../../../shared/api/http';

import type {
  ApiVehicle,
  ContractorRatingSummary,
  CustomerDashboard,
  CustomerOrder,
  CustomerOrderList,
  CustomerOrderResponse,
  CustomerOrderResponseList,
  CustomerOrderStatistics,
  CustomerOrderStatus,
  OrderReviewFields,
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

    if (page.has_more && cursor === undefined) {
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
