import {
  ApiError,
  apiRequest,
} from '../../../../shared/api/http';

import {
  getVehicleTypeLabel,
  type ContractorCompletedOrder,
  type ContractorOrder,
  type ContractorOrderResponse,
  type ContractorRating,
  type ContractorResponseEntry,
  type ContractorVehicle,
  type CreateContractorVehicleRequest,
  type OrderCustomerContact,
  type VehicleType,
  type VehicleTypeOption,
} from '../model/contractor.types';

interface VehicleTypeApiItem {
  id: string;
  name: string;
  description: string;
}

interface VehicleTypesApiResponse {
  items: VehicleTypeApiItem[];
}

interface OrderListResponse {
  items: ContractorOrder[];
  has_more: boolean;
  next_cursor?: string;
}

interface ResponseList {
  items: ContractorOrderResponse[];
}

interface CompletedOrderList {
  items: ContractorCompletedOrder[];
  has_more: boolean;
  next_cursor?: string;
}

export async function getVehicleTypes(): Promise<
  VehicleTypeOption[]
> {
  const response =
    await apiRequest<VehicleTypesApiResponse>(
      '/vehicle-types',
      {
        method: 'GET',
      }
    );

  return response.items.map(({ id }) => ({
    value: id as VehicleType,
    label: getVehicleTypeLabel(id),
  }));
}

export function getContractorVehicles() {
  return apiRequest<ContractorVehicle[]>(
    '/vehicles',
    {
      method: 'GET',
    }
  );
}

export function getContractorVehicle(
  vehicleId: string
) {
  return apiRequest<ContractorVehicle>(
    `/vehicles/${encodeURIComponent(
      vehicleId
    )}`,
    {
      method: 'GET',
    }
  );
}

export function createContractorVehicle(
  payload: CreateContractorVehicleRequest
) {
  return apiRequest<ContractorVehicle>(
    '/vehicles',
    {
      method: 'POST',
      body: payload,
    }
  );
}

export function updateContractorVehicle(
  vehicleId: string,
  payload: CreateContractorVehicleRequest
) {
  return apiRequest<ContractorVehicle>(
    `/vehicles/${encodeURIComponent(
      vehicleId
    )}`,
    {
      method: 'PUT',
      body: payload,
    }
  );
}

export function deleteContractorVehicle(
  vehicleId: string
) {
  return apiRequest<void>(
    `/vehicles/${encodeURIComponent(
      vehicleId
    )}`,
    {
      method: 'DELETE',
    }
  );
}

export async function getAllAvailableOrders(
  equipmentTypes: readonly VehicleType[]
): Promise<ContractorOrder[]> {
  const orders: ContractorOrder[] = [];
  let cursor: string | undefined;

  do {
    const params =
      new URLSearchParams();

    params.set('limit', '100');

    if (equipmentTypes.length > 0) {
      params.set(
        'equipment_type',
        equipmentTypes.join(',')
      );
    }

    if (cursor) {
      params.set('cursor', cursor);
    }

    const page =
      await apiRequest<OrderListResponse>(
        `/orders?${params.toString()}`,
        {
          method: 'GET',
        }
      );

    orders.push(...page.items);

    if (!page.has_more) {
      cursor = undefined;
      continue;
    }

    if (!page.next_cursor) {
      throw new Error(
        'Сервер не вернул курсор следующей страницы заявок'
      );
    }

    cursor = page.next_cursor;
  } while (cursor);

  return orders;
}

export async function getContractorResponses() {
  const response =
    await apiRequest<ResponseList>(
      '/responses',
      {
        method: 'GET',
      }
    );

  return response.items;
}

export function getOrder(
  orderId: string
) {
  return apiRequest<ContractorOrder>(
    `/orders/${encodeURIComponent(
      orderId
    )}`,
    {
      method: 'GET',
    }
  );
}

export async function getContractorResponseEntries(
  responses: readonly ContractorOrderResponse[]
): Promise<ContractorResponseEntry[]> {
  const orderIds = [
    ...new Set(
      responses.map(
        ({ order_id }) => order_id
      )
    ),
  ];

  const orders = await Promise.all(
    orderIds.map(async (orderId) => {
      try {
        return await getOrder(orderId);
      } catch (error) {
        if (
          error instanceof ApiError &&
          error.status === 404
        ) {
          return null;
        }

        throw error;
      }
    })
  );

  const orderById = new Map(
    orders
      .filter(
        (
          order
        ): order is ContractorOrder =>
          order !== null
      )
      .map((order) => [
        order.id,
        order,
      ])
  );

  return responses.flatMap(
    (response) => {
      const order =
        orderById.get(
          response.order_id
        );

      return order
        ? [
            {
              order,
              response,
            },
          ]
        : [];
    }
  );
}

export function createOrderResponse(
  orderId: string,
  vehicleId: string
) {
  return apiRequest<ContractorOrderResponse>(
    `/orders/${encodeURIComponent(
      orderId
    )}/responses`,
    {
      method: 'POST',
      body: {
        vehicle_id: vehicleId,
      },
    }
  );
}

export function deleteOrderResponse(
  orderId: string,
  responseId: string
) {
  return apiRequest<void>(
    `/orders/${encodeURIComponent(
      orderId
    )}/responses/${encodeURIComponent(
      responseId
    )}`,
    {
      method: 'DELETE',
    }
  );
}

export function skipOrder(
  orderId: string
) {
  return apiRequest<void>(
    `/orders/${encodeURIComponent(
      orderId
    )}/skip`,
    {
      method: 'POST',
    }
  );
}

export function getOrderCustomerContact(
  orderId: string
) {
  return apiRequest<OrderCustomerContact>(
    `/orders/${encodeURIComponent(
      orderId
    )}/contacts`,
    {
      method: 'GET',
    }
  );
}

export function getContractorRating(
  contractorId: string
) {
  return apiRequest<ContractorRating>(
    `/contractors/${encodeURIComponent(
      contractorId
    )}/rating`,
    {
      method: 'GET',
    }
  );
}

export async function getContractorOrders(
  contractorId: string
): Promise<ContractorCompletedOrder[]> {
  const result:
    ContractorCompletedOrder[] = [];

  let cursor: string | undefined;

  do {
    const params =
      new URLSearchParams();

    params.set('limit', '100');

    if (cursor) {
      params.set('cursor', cursor);
    }

    const page =
      await apiRequest<CompletedOrderList>(
        `/contractors/${encodeURIComponent(
          contractorId
        )}/orders?${params.toString()}`,
        {
          method: 'GET',
        }
      );

    result.push(...page.items);

    cursor = page.has_more
      ? page.next_cursor
      : undefined;

    if (
      page.has_more &&
      !cursor
    ) {
      throw new Error(
        'Сервер не вернул cursor следующей страницы'
      );
    }
  } while (cursor);

  return result;
}

export function releaseOrderAssignment(
  orderId: string
) {
  return apiRequest<ContractorOrder>(
    `/orders/${encodeURIComponent(
      orderId
    )}/unassign`,
    {
      method: 'PATCH',
    }
  );
}