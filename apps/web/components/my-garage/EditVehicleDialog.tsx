'use client';

import { useTranslations } from 'next-intl';
import type { UserVehicleOutput } from '@repo/contracts';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { EditVehicleForm } from '@/components/my-garage/EditVehicleForm';

// interfaces

interface EditVehicleDialogProps {
  vehicle: UserVehicleOutput | null;
  onClose: () => void;
}

export function EditVehicleDialog({ vehicle, onClose }: EditVehicleDialogProps) {
  const t = useTranslations('myGarage');

  return (
    <Dialog open={Boolean(vehicle)} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{t('edit')}</DialogTitle>
        </DialogHeader>
        {/* `key` — vehicle almashganda forma ichki holati (vin/plate/km) qaytadan
            props'dan boshlansin, useEffect+setState orqali sinxronlashtirmasdan. */}
        {vehicle && <EditVehicleForm key={vehicle.id} vehicle={vehicle} onClose={onClose} />}
      </DialogContent>
    </Dialog>
  );
}
