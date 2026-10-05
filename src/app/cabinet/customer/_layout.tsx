import { Slot } from 'expo-router';

import { CabinetShell } from '../../../features/cabinet/components/CabinetShell';

export default function CustomerLayout() {
  return (
    <CabinetShell role="customer">
      <Slot />
    </CabinetShell>
  );
}