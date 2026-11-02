import { OrderCard } from '../../components/OrderCard';
import { OrderReview } from '../../components/OrderReview';
import { OrderStatusBadge } from '../../components/OrderStatusBadge';
import type { CustomerHistoryOrder } from '../model/customer.types';
import { CustomerActionButton } from './CustomerUi';

export function CustomerHistoryCard({ order, onReview }: { order: CustomerHistoryOrder; onReview: (order: CustomerHistoryOrder) => void }) {
  const completed = order.status === 'COMPLETED';
  const name = order.reviewer_name || order.contractor_name || 'Заказчик';
  return <OrderCard order={order} showComment={false} metadataPosition="after-content"
    status={<OrderStatusBadge label={completed ? 'Выполнено' : 'Отменена'} tone={completed ? 'green' : 'gray'} />}
    actions={completed ? <CustomerActionButton outline onPress={() => onReview(order)}>
      {order.review ? 'Изменить оценку и комментарий' : 'Оставить отзыв'}
    </CustomerActionButton> : null}>
    <OrderReview name={name} rating={order.review?.rating} comment={order.review?.comment} />
  </OrderCard>;
}
