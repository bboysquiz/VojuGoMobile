import type { VehicleProperties } from './vehicle';

// The fields shared by customer orders, contractor responses and history entries.
export interface OrderCardData {
  id: string;
  title: string;
  address: string;
  needed_at: string;
  created_at: string;
  price: number;
  price_unit: 'per_hour' | 'per_order';
  vehicle_properties: VehicleProperties;
  comment?: string;
}

export function formatOrderDate(value: string, withTime = false, relative = false): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const calendarDate = new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(date);
  if (!withTime) return calendarDate;
  const time = new Intl.DateTimeFormat('ru-RU', { hour: '2-digit', minute: '2-digit' }).format(date);
  if (relative) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    const sameDay = (other: Date) => date.getFullYear() === other.getFullYear() && date.getMonth() === other.getMonth() && date.getDate() === other.getDate();
    if (sameDay(now)) return `Сегодня в ${time}`;
    if (sameDay(tomorrow)) return `Завтра в ${time}`;
  }
  return `${calendarDate} в ${time}`;
}
