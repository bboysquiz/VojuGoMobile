import { Slot } from 'expo-router';

import { CabinetShell } from '../../../features/cabinet/components/CabinetShell';

export default function ContractorLayout() {
  return (
    <CabinetShell role="contractor">
      <Slot />
    </CabinetShell>
  );
}