'use client';

import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { MapPin, Pencil, Plus, Trash2, X } from 'lucide-react';
import { Button, Card, CardContent, Input } from '@/components/ui';
import { GovernorateSelect } from '@/components/features/checkout/GovernorateSelect';
import { userService } from '@/services/user.service';
import type { Address, NewAddress } from '@/types/user';

const EMPTY_FORM: NewAddress = {
  label: null,
  fullName: '',
  phone: '',
  governorate: '',
  city: '',
  area: null,
  street: '',
  building: null,
  floor: null,
  apartment: null,
  landmark: null,
  notes: null,
};

/**
 * Address book (Phase 11 account area).
 *
 * Pure consumer of the existing users-module address API — no backend changes.
 * First saved address becomes default server-side; setting another as default
 * demotes the rest.
 */
export default function AccountAddressesPage() {
  const t = useTranslations('account');
  const tCheckout = useTranslations('checkout');
  const tErrors = useTranslations('errors');
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<NewAddress>(EMPTY_FORM);

  const addressesQuery = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userService.listAddresses(),
  });
  const addresses = addressesQuery.data ?? [];

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });
  const onError = () => toast.error(tErrors('tryAgainLater'));

  const saveMutation = useMutation({
    mutationFn: () =>
      editingId
        ? userService.updateAddress(editingId, { ...form })
        : userService.createAddress({ ...form }),
    onSuccess: () => {
      toast.success(editingId ? t('addresses.updated') : t('addresses.saved'));
      setFormOpen(false);
      setEditingId(null);
      setForm(EMPTY_FORM);
      invalidate();
    },
    onError,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => userService.deleteAddress(id),
    onSuccess: () => {
      toast.success(t('addresses.deleted'));
      invalidate();
    },
    onError,
  });

  const defaultMutation = useMutation({
    mutationFn: (id: string) => userService.updateAddress(id, { isDefault: true }),
    onSuccess: () => invalidate(),
    onError,
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormOpen(true);
  };

  const openEdit = (address: Address) => {
    setEditingId(address.id);
    setForm({
      label: address.label,
      fullName: address.fullName,
      phone: address.phone,
      governorate: address.governorate,
      city: address.city,
      area: address.area,
      street: address.street,
      building: address.building,
      floor: address.floor,
      apartment: address.apartment,
      landmark: address.landmark,
      notes: address.notes,
    });
    setFormOpen(true);
  };

  const set = (patch: Partial<NewAddress>) => setForm((f) => ({ ...f, ...patch }));
  const text = (v: string | null) => v ?? '';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold">{t('addresses.title')}</h1>
          <p className="text-sm text-muted-foreground">{t('addresses.subtitle')}</p>
        </div>
        <Button onClick={openCreate} className="gap-1">
          <Plus className="size-4" />
          {t('addresses.addNew')}
        </Button>
      </div>

      {addressesQuery.isLoading && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            {tCheckout('summary.items')}…
          </CardContent>
        </Card>
      )}

      {addressesQuery.isError && (
        <Card>
          <CardContent className="py-10 text-center text-sm text-destructive">
            {t('addresses.loadError')}
          </CardContent>
        </Card>
      )}

      {!addressesQuery.isLoading && !addressesQuery.isError && addresses.length === 0 && !formOpen && (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center">
            <MapPin size={40} className="text-muted-foreground" />
            <p className="font-semibold">{t('addresses.emptyTitle')}</p>
            <p className="max-w-sm text-sm text-muted-foreground">{t('addresses.emptyHint')}</p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {addresses.map((address) => (
          <Card key={address.id} className={address.isDefault ? 'border-primary/40' : undefined}>
            <CardContent className="space-y-1 p-4 text-sm">
              <div className="flex items-center justify-between gap-2">
                <p className="font-semibold">
                  {address.label ?? address.fullName}
                  {address.isDefault && (
                    <span className="ms-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {t('addresses.defaultTag')}
                    </span>
                  )}
                </p>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(address)} aria-label={t('addresses.edit')}>
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-error hover:text-error"
                    onClick={() => {
                      if (window.confirm(t('addresses.deleteConfirm'))) deleteMutation.mutate(address.id);
                    }}
                    aria-label={t('addresses.delete')}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
              <p>{address.fullName} · {address.phone}</p>
              <p className="text-muted-foreground">
                {address.street}
                {[address.building, address.floor, address.apartment, address.area, address.city, address.governorate]
                  .filter(Boolean)
                  .join('، ')}
              </p>
              {!address.isDefault && (
                <Button
                  variant="link"
                  size="sm"
                  className="h-auto p-0"
                  onClick={() => defaultMutation.mutate(address.id)}>
                  {t('addresses.setDefault')}
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {formOpen && (
        <Card>
          <CardContent className="space-y-3 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? t('addresses.edit') : t('addresses.addNew')}
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setFormOpen(false)} aria-label={t('addresses.cancel')}>
                <X className="size-4" />
              </Button>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <Input
                value={text(form.label)}
                onChange={(e) => set({ label: e.target.value || null })}
                placeholder={t('addresses.label')}
                aria-label={t('addresses.label')}
              />
              <Input
                value={form.fullName}
                onChange={(e) => set({ fullName: e.target.value })}
                placeholder={tCheckout('address.fullName')}
                aria-label={tCheckout('address.fullName')}
                required
              />
              <Input
                value={form.phone}
                onChange={(e) => set({ phone: e.target.value })}
                placeholder={tCheckout('address.phone')}
                aria-label={tCheckout('address.phone')}
                inputMode="tel"
                required
              />
              <GovernorateSelect value={form.governorate || null} onValueChange={(governorate) => set({ governorate })} />
              <Input
                value={form.city}
                onChange={(e) => set({ city: e.target.value })}
                placeholder={tCheckout('address.city')}
                aria-label={tCheckout('address.city')}
                required
              />
              <Input
                value={text(form.area)}
                onChange={(e) => set({ area: e.target.value || null })}
                placeholder={tCheckout('address.area')}
                aria-label={tCheckout('address.area')}
              />
              <Input
                value={form.street}
                onChange={(e) => set({ street: e.target.value })}
                placeholder={tCheckout('address.street')}
                aria-label={tCheckout('address.street')}
                required
                className="sm:col-span-2"
              />
              <Input
                value={text(form.building)}
                onChange={(e) => set({ building: e.target.value || null })}
                placeholder={tCheckout('address.building')}
                aria-label={tCheckout('address.building')}
              />
              <Input
                value={text(form.floor)}
                onChange={(e) => set({ floor: e.target.value || null })}
                placeholder={tCheckout('address.floor')}
                aria-label={tCheckout('address.floor')}
              />
              <Input
                value={text(form.apartment)}
                onChange={(e) => set({ apartment: e.target.value || null })}
                placeholder={tCheckout('address.apartment')}
                aria-label={tCheckout('address.apartment')}
              />
              <Input
                value={text(form.landmark)}
                onChange={(e) => set({ landmark: e.target.value || null })}
                placeholder={tCheckout('address.landmark')}
                aria-label={tCheckout('address.landmark')}
              />
            </div>
            <Button
              onClick={() => saveMutation.mutate()}
              disabled={saveMutation.isPending || !form.fullName || !form.phone || !form.governorate || !form.city || !form.street}
              className="w-full rounded-2xl">
              {t('addresses.save')}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
