'use client';

import { Car, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { UserVehicleOutput } from '@repo/contracts';
import { AddVehicleDialog } from '@/components/my-garage/AddVehicleDialog';
import { EditVehicleDialog } from '@/components/my-garage/EditVehicleDialog';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/Dialog';
import { useSession } from '@/hooks/use-auth';
import { useDeleteVehicle, useMyVehicles, useUpdateVehicle } from '@/hooks/use-my-garage';
import { Link } from '@/i18n/navigation';

const vehicleTitle = (vehicle: UserVehicleOutput): string => {
  if (vehicle.engineOption) {
    const { generation } = vehicle.engineOption;
    return `${generation.model.brand.name} ${generation.model.name}`;
  }
  return `${vehicle.customBrand} ${vehicle.customModel}`;
};

const vehicleSubtitle = (vehicle: UserVehicleOutput): string => {
  if (vehicle.engineOption) {
    return `${vehicle.engineOption.generation.name} · ${vehicle.engineOption.name}`;
  }
  return vehicle.customYear ? String(vehicle.customYear) : '';
};

export function MyGarageView() {
  const t = useTranslations('myGarage');
  const { isAuthenticated, loading: sessionLoading } = useSession();
  const { data: vehicles, isPending } = useMyVehicles(isAuthenticated);
  const updateVehicle = useUpdateVehicle();
  const deleteVehicle = useDeleteVehicle();

  const [editing, setEditing] = useState<UserVehicleOutput | null>(null);
  const [deleting, setDeleting] = useState<UserVehicleOutput | null>(null);

  if (!sessionLoading && !isAuthenticated) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center gap-4 px-4 py-24 text-center">
        <p className="text-muted-foreground">{t('signInRequired')}</p>
        <Link href="/sign-in">
          <Button>{t('signIn')}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{t('title')}</h1>
        <AddVehicleDialog
          trigger={
            <Button>
              <Plus className="size-4" />
              {t('addVehicle')}
            </Button>
          }
        />
      </div>

      {!isPending && !vehicles?.length && <p className="text-muted-foreground">{t('empty')}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {vehicles?.map((vehicle) => (
          <Card key={vehicle.id} className="flex flex-col gap-3 p-5">
            <div className="flex items-start justify-between gap-2">
              <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Car className="size-5" />
              </span>
              {vehicle.isPrimary && <Badge>{t('primary')}</Badge>}
            </div>

            <div>
              <p className="font-semibold">{vehicleTitle(vehicle)}</p>
              <p className="text-sm text-muted-foreground">{vehicleSubtitle(vehicle)}</p>
            </div>

            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
              {vehicle.plateNumber && <span>{vehicle.plateNumber}</span>}
              {typeof vehicle.mileageKm === 'number' && <span>{vehicle.mileageKm.toLocaleString()} km</span>}
            </div>

            <div className="mt-auto flex flex-wrap gap-2 pt-2">
              {!vehicle.isPrimary && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => updateVehicle.mutate({ vehicleId: vehicle.id, input: { isPrimary: true } })}
                >
                  <Star className="size-3.5" />
                  {t('setPrimary')}
                </Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setEditing(vehicle)}>
                <Pencil className="size-3.5" />
                {t('edit')}
              </Button>
              <Button size="sm" variant="outline" className="text-destructive" onClick={() => setDeleting(vehicle)}>
                <Trash2 className="size-3.5" />
                {t('delete')}
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <EditVehicleDialog vehicle={editing} onClose={() => setEditing(null)} />

      <Dialog open={Boolean(deleting)} onOpenChange={(next) => !next && setDeleting(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{t('deleteConfirmDescription')}</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleting(null)}>
              {t('cancel')}
            </Button>
            <Button
              className="bg-destructive text-white hover:opacity-90"
              disabled={deleteVehicle.isPending}
              onClick={() => {
                if (!deleting) return;
                deleteVehicle.mutate(deleting.id, { onSuccess: () => setDeleting(null) });
              }}
            >
              {t('confirmDelete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
