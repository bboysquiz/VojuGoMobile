export type VehicleType = 'crane_truck' | 'backhoe_loader' | 'tractor' | 'dump_truck' | 'aerial_platform' | 'tow_truck' | 'mini_loader';
export type VehiclePropertyValue = string | number | boolean | undefined;

export interface VehicleProperties {
  type: VehicleType;
  [key: string]: VehiclePropertyValue;
}

export function getVehicleTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    crane_truck: 'Манипулятор', backhoe_loader: 'Экскаватор-погрузчик', tractor: 'Трактор',
    dump_truck: 'Самосвал', aerial_platform: 'Автовышка', tow_truck: 'Эвакуатор', mini_loader: 'Мини-погрузчик',
  };
  return labels[type] ?? type;
}

export function getVehiclePropertyLabel(name: string): string {
  const labels: Record<string, string> = {
    side_capacity: 'Грузоподъёмность борта', boom_capacity: 'Грузоподъёмность стрелы', bed_length: 'Длина борта',
    capacity: 'Объём кузова', auger: 'Шнек', hydraulic_hammer: 'Гидромолот', narrow_bucket: 'Узкий ковш', brush: 'Щётка',
  };
  return labels[name] ?? name;
}

export function formatVehiclePropertyValue(name: string, value: unknown): string {
  if (typeof value === 'boolean') return value ? 'Есть' : 'Нет';
  switch (name) {
    case 'side_capacity':
    case 'boom_capacity': return `${String(value)} т`;
    case 'bed_length': return `${String(value)} м`;
    case 'capacity': return `${String(value)} м³`;
    default: return String(value);
  }
}

export function getVehiclePropertyEntries(properties: VehicleProperties) {
  return Object.entries(properties).filter(([name, value]) => name !== 'type' && value !== undefined && value !== null && value !== '');
}
