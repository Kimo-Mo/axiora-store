'use client';

import { useTranslations } from 'next-intl';
import { useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  Input,
  Label,
  Textarea,
} from '@/components/ui';
import type { Address } from '@/types/user';
import type { CheckoutNewAddress } from '@/types/checkout';
import { GovernorateSelect } from './GovernorateSelect';

const newAddressSchema = z.object({
  label: z.string().trim().max(60).optional(),
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().min(8).max(20),
  governorate: z.string().trim().min(2).max(60),
  city: z.string().trim().min(2).max(120),
  area: z.string().trim().max(120).optional(),
  street: z.string().trim().min(2).max(255),
  building: z.string().trim().max(60).optional(),
  floor: z.string().trim().max(20).optional(),
  apartment: z.string().trim().max(60).optional(),
  landmark: z.string().trim().max(255).optional(),
  notes: z.string().trim().max(255).optional(),
  isDefault: z.boolean().optional(),
});

type NewAddressFormData = z.infer<typeof newAddressSchema>;

interface CheckoutAddressSectionProps {
  addresses: Address[] | undefined;
  addressesLoading: boolean;
  mode: 'saved' | 'new';
  selectedAddressId: string | null;
  onModeChange: (mode: 'saved' | 'new') => void;
  onSelectAddress: (addressId: string) => void;
  onNewAddressChange: (address: CheckoutNewAddress | null) => void;
  onGovernorateDraftChange?: (governorate: string | null) => void;
  saveNewAddress: boolean;
  onSaveNewAddressChange: (save: boolean) => void;
}

/**
 * Section 2 — shipping address. Saved addresses are selectable cards; a new
 * address form (React Hook Form + Zod mirroring the backend contract) applies
 * to this order only unless "save to my address book" is explicitly checked,
 * which is unchecked by default (FR-003, clarification Q5).
 */
export function CheckoutAddressSection({
  addresses,
  addressesLoading,
  mode,
  selectedAddressId,
  onModeChange,
  onSelectAddress,
  onNewAddressChange,
  onGovernorateDraftChange,
  saveNewAddress,
  onSaveNewAddressChange,
}: CheckoutAddressSectionProps) {
  const t = useTranslations('checkout');
  const hasSavedAddresses = Boolean(addresses && addresses.length > 0);
  const effectiveMode = hasSavedAddresses ? mode : 'new';

  const {
    register,
    control,
    watch,
    reset,
    getValues,
    formState: { errors },
  } = useForm<NewAddressFormData>({
    resolver: zodResolver(newAddressSchema),
    defaultValues: {
      label: '',
      fullName: '',
      phone: '',
      governorate: '',
      city: '',
      area: '',
      street: '',
      building: '',
      floor: '',
      apartment: '',
      landmark: '',
      notes: '',
      isDefault: false,
    },
  });

  // Propagate valid form values upward so the page can derive the governorate
  // (live quote) and build the order payload; null when invalid.
  // Uses a direct watch subscription to avoid serializing form state on every render.
  useEffect(() => {
    if (effectiveMode !== 'new') {
      onNewAddressChange(null);
      onGovernorateDraftChange?.(null);
      return;
    }

    const syncAddress = (values: Partial<NewAddressFormData>) => {
      const draftGov = values.governorate?.trim() || null;
      onGovernorateDraftChange?.(draftGov);

      const parseResult = newAddressSchema.safeParse(values);
      if (parseResult.success) {
        const data = parseResult.data;
        onNewAddressChange({
          ...data,
          area: data.area || null,
          label: data.label || null,
          building: data.building || null,
          floor: data.floor || null,
          apartment: data.apartment || null,
          landmark: data.landmark || null,
          notes: data.notes || null,
        });
      } else {
        onNewAddressChange(null);
      }
    };

    // Sync current values immediately
    syncAddress(getValues());

    // Subscribe to form changes
    const subscription = watch((values) => {
      syncAddress(values);
    });

    return () => subscription.unsubscribe();
  }, [effectiveMode, onNewAddressChange, onGovernorateDraftChange, watch, getValues]);

  useEffect(() => {
    if (effectiveMode === 'saved') {
      reset();
      onGovernorateDraftChange?.(null);
    }
  }, [effectiveMode, reset, onGovernorateDraftChange]);

  const field = (
    name: keyof NewAddressFormData,
    labelText: string,
    placeholder: string,
    optional = false,
  ) => (
    <div className="space-y-2">
      <Label htmlFor={`checkout-address-${name}`}>
        {labelText}
        {optional && <span className="text-muted-foreground font-normal"> ({t('address.optional')})</span>}
      </Label>
      <Input
        id={`checkout-address-${name}`}
        placeholder={placeholder}
        {...register(name)}
      />
      {errors[name] && <p className="text-sm text-destructive">{errors[name]?.message as string}</p>}
    </div>
  );

  return (
    <section className="space-y-4" aria-labelledby="checkout-section-address">
      <div className="flex items-center gap-2">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
          2
        </span>
        <h2 id="checkout-section-address" className="text-lg font-semibold">
          {t('sections.address')}
        </h2>
      </div>

      {addressesLoading ? (
        <div className="rounded-xl border border-border bg-card p-6 text-sm text-muted-foreground">
          ...
        </div>
      ) : (
        <div className="space-y-4">
          {hasSavedAddresses && (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant={effectiveMode === 'saved' ? 'default' : 'outline'}
                onClick={() => onModeChange('saved')}
              >
                {t('address.useSaved')}
              </Button>
              <Button
                type="button"
                size="sm"
                variant={effectiveMode === 'new' ? 'default' : 'outline'}
                onClick={() => onModeChange('new')}
              >
                {t('address.newAddress')}
              </Button>
            </div>
          )}

          {effectiveMode === 'saved' && addresses && (
            <div className="grid gap-3 md:grid-cols-2">
              {addresses.map((address) => {
                const selected = address.id === selectedAddressId;
                return (
                  <Card
                    key={address.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onSelectAddress(address.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        onSelectAddress(address.id);
                      }
                    }}
                    className={`cursor-pointer p-4 transition-all ${
                      selected
                        ? 'border-primary bg-primary/5 ring-1 ring-primary'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="space-y-1 text-sm">
                        <p className="font-medium">
                          {address.fullName}
                          {address.label ? (
                            <span className="text-muted-foreground"> · {address.label}</span>
                          ) : null}
                        </p>
                        <p className="text-muted-foreground" dir="ltr">
                          {address.phone}
                        </p>
                        <p className="text-muted-foreground">
                          {address.governorate}, {address.city}, {address.street}
                        </p>
                        {address.building && (
                          <p className="text-muted-foreground">{address.building}{address.floor ? `, ${address.floor}` : ''}{address.apartment ? `, ${address.apartment}` : ''}</p>
                        )}
                      </div>
                      {address.isDefault && (
                        <Badge variant="secondary">{t('address.defaultTag')}</Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}

          {effectiveMode === 'new' && (
            <Card className="p-5 space-y-4">
              <form className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {field('fullName', t('address.fullName'), '')}
                  {field('phone', t('address.phone'), '+20 1XX XXX XXXX')}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="checkout-address-governorate">{t('address.governorate')}</Label>
                    <Controller
                      control={control}
                      name="governorate"
                      render={({ field: { onChange, value } }) => (
                        <GovernorateSelect
                          id="checkout-address-governorate"
                          value={value || null}
                          onValueChange={(val) => {
                            onChange(val);
                            onGovernorateDraftChange?.(val?.trim() || null);
                          }}
                          invalid={Boolean(errors.governorate)}
                        />
                      )}
                    />
                    {errors.governorate && (
                      <p className="text-sm text-destructive">{errors.governorate.message as string}</p>
                    )}
                  </div>
                  {field('city', t('address.city'), '')}
                </div>

                {field('street', t('address.street'), '')}

                <div className="grid gap-4 md:grid-cols-3">
                  {field('building', t('address.building'), '', true)}
                  {field('floor', t('address.floor'), '', true)}
                  {field('apartment', t('address.apartment'), '', true)}
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  {field('area', t('address.area'), '', true)}
                  {field('landmark', t('address.landmark'), '', true)}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="checkout-address-notes">
                    {t('address.notes')} <span className="text-muted-foreground font-normal">({t('address.optional')})</span>
                  </Label>
                  <Textarea id="checkout-address-notes" rows={2} {...register('notes')} />
                </div>

                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <Checkbox
                    id="checkout-save-address"
                    checked={saveNewAddress}
                    onCheckedChange={(checked) => onSaveNewAddressChange(checked === true)}
                  />
                  <div className="space-y-1">
                    <Label htmlFor="checkout-save-address" className="font-normal cursor-pointer">
                      {t('address.saveToAddressBook')}
                    </Label>
                    <p className="text-xs text-muted-foreground">{t('address.saveHint')}</p>
                  </div>
                </div>
              </form>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
