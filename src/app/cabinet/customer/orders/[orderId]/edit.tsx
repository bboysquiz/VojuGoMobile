import { useLocalSearchParams } from 'expo-router';

import { CustomerOrderEditorScreen } from '../../../../../features/cabinet/customer/components/CustomerOrderEditorScreen';

export default function CustomerEditOrderPage() {
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  return <CustomerOrderEditorScreen key={orderId} orderId={orderId ?? ''} />;
}
